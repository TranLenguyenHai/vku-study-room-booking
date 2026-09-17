import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Room } from '../types/room';
import { Booking, SlotId } from '../types/booking';
import { StudentUser } from '../types/user';
import { MOCK_ROOMS, INITIAL_MOCK_BOOKINGS, TIME_SLOTS } from '../data/mockRooms';
import { scheduleBookingReminder, cancelNotification } from '../services/notificationService';

export interface BookingState {
  // User Session
  user: StudentUser;
  // Rooms catalog
  rooms: Room[];
  // Reservations
  reservations: Booking[];
  // Hydration state
  isHydrated: boolean;

  // Actions
  setHydrated: (state: boolean) => void;
  setUser: (user: Partial<StudentUser>) => void;
  toggleNotificationSetting: (enabled: boolean) => void;

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
  studentCode: '22IT108',
  name: 'Nguyễn Văn An',
  major: 'Kỹ thuật Phần mềm (Software Engineering)',
  className: '22SE1',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  email: 'annv.22it@vku.udn.vn',
  notificationEnabled: true,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      user: DEFAULT_USER,
      rooms: MOCK_ROOMS,
      reservations: INITIAL_MOCK_BOOKINGS,
      isHydrated: false,

      setHydrated: (state: boolean) => set({ isHydrated: state }),

      setUser: (updatedFields) =>
        set((state) => ({
          user: { ...state.user, ...updatedFields },
        })),

      toggleNotificationSetting: (enabled) =>
        set((state) => ({
          user: { ...state.user, notificationEnabled: enabled },
        })),

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
        const slotLabel = slot ? slot.label : slotId;

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

        // 4. Save to store
        set({
          reservations: [newBooking, ...reservations],
        });

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
        return { success: true, message: 'Đã hủy lịch đặt phòng thành công! Khung giờ đã được giải phóng.' };
      },

      checkInBooking: (bookingId: string) => {
        const { reservations } = get();
        const updatedReservations = reservations.map((b) =>
          b.id === bookingId ? { ...b, status: 'CHECKED_IN' as const } : b
        );
        set({ reservations: updatedReservations });
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
      },
    }
  )
);
