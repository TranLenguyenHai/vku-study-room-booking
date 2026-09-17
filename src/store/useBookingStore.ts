import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Room } from '../types/room';
import { Booking, SlotId } from '../types/booking';
import { StudentUser } from '../types/user';
import { MOCK_ROOMS, INITIAL_MOCK_BOOKINGS, TIME_SLOTS, isSlotInPast } from '../data/mockRooms';
import { scheduleBookingReminder, cancelNotification } from '../services/notificationService';
import {
  initSQLiteDatabase,
  fetchRoomsFromSQLite,
  fetchBookingsFromSQLite,
  insertBookingToSQLite,
  updateBookingStatusInSQLite,
} from '../services/sqliteDatabase';
import {
  isSupabaseConfigured,
  supabase,
  fetchRemoteRooms,
  fetchRemoteBookings,
  insertRemoteBooking,
  updateRemoteBookingStatus,
} from '../services/supabase';

export interface BookingState {
  // User Session
  user: StudentUser;
  // Rooms catalog
  rooms: Room[];
  // Reservations
  reservations: Booking[];
  // Hydration & Sync states
  isHydrated: boolean;
  isDatabaseReady: boolean;
  isCloudConnected: boolean;

  // Actions
  setHydrated: (state: boolean) => void;
  setUser: (user: Partial<StudentUser>) => void;
  toggleNotificationSetting: (enabled: boolean) => void;
  initDatabaseSync: () => Promise<void>;
  initSupabaseSync: () => Promise<void>;

  // Conflict Engine & Reservation Actions
  isSlotBooked: (roomId: string, date: string, slotId: SlotId) => boolean;
  getSlotBooking: (roomId: string, date: string, slotId: SlotId) => Booking | undefined;
  bookRoom: (params: {
    roomId: string;
    date: string;
    slotId: SlotId;
    purpose: string;
  }) => Promise<{ success: boolean; booking?: Booking; message?: string }>;
  cancelBooking: (bookingId: string) => Promise<{ success: boolean; message: string }>;
  checkInBooking: (bookingId: string) => void;
  resetToDefaults: () => void;
}

const DEFAULT_USER: StudentUser = {
  id: 'user_vku_01',
  studentCode: '23IT.EB031',
  name: 'Trần Lê Nguyên Hải',
  major: 'Công nghệ thông tin',
  className: '23ITe1',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  email: 'haitln.23ite@vku.udn.vn',
  notificationEnabled: true,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      user: DEFAULT_USER,
      rooms: MOCK_ROOMS,
      reservations: INITIAL_MOCK_BOOKINGS,
      isHydrated: false,
      isDatabaseReady: false,
      isCloudConnected: isSupabaseConfigured,

      setHydrated: (state: boolean) => set({ isHydrated: state }),

      setUser: (updatedFields) =>
        set((state) => ({
          user: { ...state.user, ...updatedFields },
        })),

      toggleNotificationSetting: (enabled) =>
        set((state) => ({
          user: { ...state.user, notificationEnabled: enabled },
        })),

      /**
       * Initialize Relational SQLite Database (vku_booking.db)
       * and subsequently connect to Supabase Cloud if configured
       */
      initDatabaseSync: async () => {
        try {
          // 1. Initialize SQLite Database & Tables (rooms, bookings)
          const sqliteOk = await initSQLiteDatabase();
          if (sqliteOk) {
            set({ isDatabaseReady: true });

            // Load rooms from SQLite DB
            const dbRooms = await fetchRoomsFromSQLite();
            if (dbRooms && dbRooms.length > 0) {
              set({ rooms: dbRooms });
            }

            // Load bookings from SQLite DB
            const dbBookings = await fetchBookingsFromSQLite();
            if (dbBookings && dbBookings.length > 0) {
              set({ reservations: dbBookings });
            }
          }

          // 2. Initialize Cloud Database (Supabase) if configured
          if (isSupabaseConfigured) {
            await get().initSupabaseSync();
          }
        } catch (error) {
          console.warn('Database initialization error:', error);
        }
      },

      initSupabaseSync: async () => {
        if (!isSupabaseConfigured) return;

        try {
          // 1. Fetch live data from Supabase
          const remoteRooms = await fetchRemoteRooms();
          if (remoteRooms && remoteRooms.length > 0) {
            set({ rooms: remoteRooms });
          }

          const remoteBookings = await fetchRemoteBookings();
          if (remoteBookings) {
            set({ reservations: remoteBookings });
          }

          // 2. Subscribe to Supabase Realtime changes on bookings
          supabase
            .channel('vku-realtime-bookings')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'bookings' },
              (payload) => {
                const { eventType, new: newRow, old: oldRow } = payload as any;
                set((state) => {
                  if (eventType === 'INSERT' && newRow) {
                    const mapped: Booking = {
                      id: newRow.id,
                      roomId: newRow.room_id,
                      roomName: newRow.room_name,
                      building: newRow.building,
                      roomNumber: newRow.room_number,
                      date: newRow.date,
                      slotId: newRow.slot_id,
                      slotLabel: newRow.slot_label,
                      userId: newRow.user_id,
                      userName: newRow.user_name,
                      studentCode: newRow.student_code,
                      purpose: newRow.purpose,
                      status: newRow.status,
                      createdAt: newRow.created_at,
                      qrValue: newRow.qr_value,
                      notificationId: newRow.notification_id,
                    };
                    const exists = state.reservations.some((b) => b.id === mapped.id);
                    if (exists) return state;
                    // Also mirror to SQLite
                    insertBookingToSQLite(mapped).catch(() => {});
                    return { reservations: [mapped, ...state.reservations] };
                  }

                  if (eventType === 'UPDATE' && newRow) {
                    updateBookingStatusInSQLite(newRow.id, newRow.status).catch(() => {});
                    return {
                      reservations: state.reservations.map((b) =>
                        b.id === newRow.id
                          ? {
                              ...b,
                              status: newRow.status,
                              purpose: newRow.purpose || b.purpose,
                            }
                          : b
                      ),
                    };
                  }

                  if (eventType === 'DELETE' && oldRow) {
                    return {
                      reservations: state.reservations.filter((b) => b.id !== oldRow.id),
                    };
                  }

                  return state;
                });
              }
            )
            .subscribe();

          set({ isCloudConnected: true });
        } catch (error) {
          console.warn('Supabase sync init error:', error);
        }
      },

      isSlotBooked: (roomId: string, date: string, slotId: SlotId): boolean => {
        const { reservations } = get();
        return reservations.some(
          (b) =>
            b.roomId === roomId &&
            b.date === date &&
            b.slotId === slotId &&
            b.status !== 'CANCELLED'
        );
      },

      getSlotBooking: (roomId: string, date: string, slotId: SlotId): Booking | undefined => {
        const { reservations } = get();
        return reservations.find(
          (b) =>
            b.roomId === roomId &&
            b.date === date &&
            b.slotId === slotId &&
            b.status !== 'CANCELLED'
        );
      },

      bookRoom: async ({ roomId, date, slotId, purpose }) => {
        const { rooms, reservations, user, isSlotBooked } = get();

        // 1. Conflict check
        if (isSlotBooked(roomId, date, slotId)) {
          return {
            success: false,
            message: 'Khung giờ này vừa được đặt bởi người khác! Vui lòng chọn khung giờ khác.',
          };
        }

        const room = rooms.find((r) => r.id === roomId);
        if (!room) {
          return { success: false, message: 'Phòng học không tồn tại!' };
        }

        const slot = TIME_SLOTS.find((s) => s.id === slotId);
        if (!slot) {
          return { success: false, message: 'Phòng hoặc khung giờ không tồn tại!' };
        }

        // 0. Past slot check
        if (isSlotInPast(date, slot.startTime)) {
          return {
            success: false,
            message: 'Khung giờ này đã qua thời gian bắt đầu, không thể đặt!',
          };
        }

        const slotLabel = slot.label;

        // 2. Generate unique booking pass code
        const randomCode = Math.floor(10000 + Math.random() * 90000);
        const bookingId = `VKU-BK-${randomCode}`;

        const newBooking: Booking = {
          id: bookingId,
          roomId: room.id,
          roomName: room.name,
          building: room.building,
          roomNumber: room.roomNumber,
          date,
          slotId,
          slotLabel,
          userId: user.id,
          userName: user.name,
          studentCode: user.studentCode,
          purpose: purpose.trim() || 'Học nhóm môn React Native & Đồ án',
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
          qrValue: JSON.stringify({
            bookingId,
            studentCode: user.studentCode,
            roomId: room.id,
            date,
            slot: slotId,
          }),
        };

        // 3. Schedule local notification 15m prior
        if (user.notificationEnabled) {
          const notifId = await scheduleBookingReminder(newBooking);
          if (notifId) {
            newBooking.notificationId = notifId;
          }
        }

        // 4. Update memory & AsyncStorage
        set({
          reservations: [newBooking, ...reservations],
        });

        // 5. Persist to Local Relational SQLite Database (vku_booking.db)
        insertBookingToSQLite(newBooking).catch((err) =>
          console.warn('SQLite insert booking error:', err)
        );

        // 6. Background sync to Cloud Database (Supabase) if configured
        insertRemoteBooking(newBooking).catch((err) =>
          console.warn('Supabase remote insert error:', err)
        );

        return { success: true, booking: newBooking };
      },

      cancelBooking: async (bookingId: string) => {
        const { reservations } = get();
        const booking = reservations.find((b) => b.id === bookingId);
        if (!booking) {
          return { success: false, message: 'Không tìm thấy lịch đặt này!' };
        }

        // Cancel scheduled notification if any
        if (booking.notificationId) {
          await cancelNotification(booking.notificationId);
        }

        // Update booking status to CANCELLED to immediately release the slot in conflict engine
        const updatedReservations = reservations.map((b) =>
          b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b
        );

        set({ reservations: updatedReservations });

        // Persist to Local Relational SQLite Database (vku_booking.db)
        updateBookingStatusInSQLite(bookingId, 'CANCELLED').catch((err) =>
          console.warn('SQLite update booking error:', err)
        );

        // Background sync to Cloud Database (Supabase) if configured
        updateRemoteBookingStatus(bookingId, 'CANCELLED').catch((err) =>
          console.warn('Supabase remote cancel error:', err)
        );

        return { success: true, message: 'Đã hủy lịch đặt phòng thành công! Khung giờ đã được giải phóng.' };
      },

      checkInBooking: (bookingId: string) => {
        const { reservations } = get();
        const updatedReservations = reservations.map((b) =>
          b.id === bookingId ? { ...b, status: 'CHECKED_IN' as const } : b
        );
        set({ reservations: updatedReservations });

        // Persist to Local Relational SQLite Database (vku_booking.db)
        updateBookingStatusInSQLite(bookingId, 'CHECKED_IN').catch((err) =>
          console.warn('SQLite check-in error:', err)
        );

        // Background sync to Cloud Database (Supabase) if configured
        updateRemoteBookingStatus(bookingId, 'CHECKED_IN').catch((err) =>
          console.warn('Supabase remote check-in error:', err)
        );
      },

      resetToDefaults: () => {
        set({
          user: DEFAULT_USER,
          rooms: MOCK_ROOMS,
          reservations: INITIAL_MOCK_BOOKINGS,
        });
      },
    }),
    {
      name: 'vku-booking-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (state && state.user.studentCode !== '23IT.EB031') {
          state.setUser({
            name: 'Trần Lê Nguyên Hải',
            studentCode: '23IT.EB031',
            className: '23ITe1',
            major: 'Công nghệ thông tin',
            email: 'haitln.23ite@vku.udn.vn',
          });
        }
      },
    }
  )
);
