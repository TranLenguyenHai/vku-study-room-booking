import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Room } from '../types/room';
import { Booking } from '../types/booking';

// Expo automatically exposes environment variables prefixed with EXPO_PUBLIC_
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL.startsWith('https://') &&
  !SUPABASE_URL.includes('your-project')
);

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder-vku.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

/**
 * Fetch all rooms from Supabase cloud database
 */
export async function fetchRemoteRooms(): Promise<Room[] | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data) {
      console.warn('Supabase fetch rooms error:', error);
      return null;
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      building: row.building,
      floor: row.floor,
      roomNumber: row.room_number,
      capacity: row.capacity,
      equipment: row.equipment || [],
      photoUrl: row.photo_url,
      description: row.description || '',
      isOccupiedNow: row.is_occupied_now ?? false,
      rating: Number(row.rating) || 5.0,
      tags: row.tags || [],
    }));
  } catch (err) {
    console.warn('Failed to fetch rooms from Supabase:', err);
    return null;
  }
}

/**
 * Fetch all active bookings from Supabase cloud database
 */
export async function fetchRemoteBookings(): Promise<Booking[] | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Supabase fetch bookings error:', error);
      return null;
    }

    return data.map((row: any) => ({
      id: row.id,
      roomId: row.room_id,
      roomName: row.room_name,
      building: row.building,
      roomNumber: row.room_number,
      date: row.date,
      slotId: row.slot_id,
      slotLabel: row.slot_label,
      userId: row.user_id,
      userName: row.user_name,
      studentCode: row.student_code,
      purpose: row.purpose,
      status: row.status,
      createdAt: row.created_at,
      qrValue: row.qr_value,
      notificationId: row.notification_id,
    }));
  } catch (err) {
    console.warn('Failed to fetch bookings from Supabase:', err);
    return null;
  }
}

/**
 * Insert a new booking into Supabase cloud database
 */
export async function insertRemoteBooking(booking: Booking): Promise<boolean> {
  if (!isSupabaseConfigured) return true; // Local store handles it

  try {
    const { error } = await supabase.from('bookings').insert({
      id: booking.id,
      room_id: booking.roomId,
      room_name: booking.roomName,
      building: booking.building,
      room_number: booking.roomNumber,
      date: booking.date,
      slot_id: booking.slotId,
      slot_label: booking.slotLabel,
      user_id: booking.userId,
      user_name: booking.userName,
      student_code: booking.studentCode,
      purpose: booking.purpose,
      status: booking.status,
      created_at: booking.createdAt,
      qr_value: booking.qrValue,
      notification_id: booking.notificationId,
    });

    if (error) {
      console.warn('Supabase insert booking error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Failed to insert booking to Supabase:', err);
    return false;
  }
}

/**
 * Update booking status in Supabase (e.g. CANCELLED or CHECKED_IN)
 */
export async function updateRemoteBookingStatus(
  bookingId: string,
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED'
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      console.warn('Supabase update status error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Failed to update booking status in Supabase:', err);
    return false;
  }
}
