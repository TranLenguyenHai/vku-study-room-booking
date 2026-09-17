import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { Room } from '../types/room';
import { Booking, BookingStatus, SlotId } from '../types/booking';
import { MOCK_ROOMS } from '../data/mockRooms';

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Get or open the SQLite database instance
 */
export async function getDB(): Promise<SQLite.SQLiteDatabase | null> {
  if (Platform.OS === 'web') {
    return null;
  }
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('vku_booking.db');
  }
  return dbInstance;
}

/**
 * Initialize SQLite database tables and seed initial rooms
 */
export async function initSQLiteDatabase(): Promise<boolean> {
  try {
    const db = await getDB();
    if (!db) {
      console.log('ℹ️ SQLite skipped on web environment');
      return false;
    }

    // Create tables
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        building TEXT NOT NULL,
        floor INTEGER NOT NULL,
        room_number TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        equipment TEXT NOT NULL,
        photo_url TEXT NOT NULL,
        description TEXT,
        is_occupied_now INTEGER DEFAULT 0,
        rating REAL DEFAULT 5.0,
        tags TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        room_name TEXT NOT NULL,
        building TEXT NOT NULL,
        room_number TEXT NOT NULL,
        date TEXT NOT NULL,
        slot_id TEXT NOT NULL,
        slot_label TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        student_code TEXT NOT NULL,
        purpose TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        qr_value TEXT NOT NULL,
        notification_id TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_bookings_conflict 
      ON bookings(room_id, date, slot_id, status);
    `);

    // Check if rooms need seeding
    const countRow = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM rooms');
    if (!countRow || countRow.count === 0) {
      for (const room of MOCK_ROOMS) {
        await db.runAsync(
          `INSERT OR REPLACE INTO rooms (id, name, building, floor, room_number, capacity, equipment, photo_url, description, is_occupied_now, rating, tags)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            room.id,
            room.name,
            room.building,
            room.floor,
            room.roomNumber,
            room.capacity,
            JSON.stringify(room.equipment),
            room.photoUrl,
            room.description,
            room.isOccupiedNow ? 1 : 0,
            room.rating,
            JSON.stringify(room.tags),
          ]
        );
      }
      console.log('✅ SQLite: Seeded initial VKU rooms into vku_booking.db');
    }

    console.log('✅ SQLite: Database vku_booking.db initialized and ready');
    return true;
  } catch (error) {
    console.warn('⚠️ SQLite init error:', error);
    return false;
  }
}

/**
 * Fetch all rooms from SQLite
 */
export async function fetchRoomsFromSQLite(): Promise<Room[] | null> {
  try {
    const db = await getDB();
    if (!db) return null;

    const rows = await db.getAllAsync<any>('SELECT * FROM rooms ORDER BY id ASC');
    if (!rows || rows.length === 0) return null;

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      building: row.building,
      floor: row.floor,
      roomNumber: row.room_number,
      capacity: row.capacity,
      equipment: typeof row.equipment === 'string' ? JSON.parse(row.equipment) : row.equipment,
      photoUrl: row.photo_url,
      description: row.description || '',
      isOccupiedNow: Boolean(row.is_occupied_now),
      rating: Number(row.rating) || 5.0,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
    }));
  } catch (error) {
    console.warn('Failed to fetch rooms from SQLite:', error);
    return null;
  }
}

/**
 * Fetch all bookings from SQLite
 */
export async function fetchBookingsFromSQLite(): Promise<Booking[] | null> {
  try {
    const db = await getDB();
    if (!db) return null;

    const rows = await db.getAllAsync<any>('SELECT * FROM bookings ORDER BY created_at DESC');
    if (!rows) return null;

    return rows.map((row) => ({
      id: row.id,
      roomId: row.room_id,
      roomName: row.room_name,
      building: row.building,
      roomNumber: row.room_number,
      date: row.date,
      slotId: row.slot_id as SlotId,
      slotLabel: row.slot_label,
      userId: row.user_id,
      userName: row.user_name,
      studentCode: row.student_code,
      purpose: row.purpose,
      status: row.status as BookingStatus,
      createdAt: row.created_at,
      qrValue: row.qr_value,
      notificationId: row.notification_id || undefined,
    }));
  } catch (error) {
    console.warn('Failed to fetch bookings from SQLite:', error);
    return null;
  }
}

/**
 * Insert a new booking into SQLite
 */
export async function insertBookingToSQLite(booking: Booking): Promise<boolean> {
  try {
    const db = await getDB();
    if (!db) return true;

    await db.runAsync(
      `INSERT OR REPLACE INTO bookings (
        id, room_id, room_name, building, room_number, date, slot_id, slot_label,
        user_id, user_name, student_code, purpose, status, created_at, qr_value, notification_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        booking.id,
        booking.roomId,
        booking.roomName,
        booking.building,
        booking.roomNumber,
        booking.date,
        booking.slotId,
        booking.slotLabel,
        booking.userId,
        booking.userName,
        booking.studentCode,
        booking.purpose,
        booking.status,
        booking.createdAt,
        booking.qrValue,
        booking.notificationId || null,
      ]
    );

    console.log(`✅ SQLite: Saved booking ${booking.id} to vku_booking.db`);
    return true;
  } catch (error) {
    console.warn('Failed to insert booking to SQLite:', error);
    return false;
  }
}

/**
 * Update booking status in SQLite (e.g. CHECKED_IN or CANCELLED)
 */
export async function updateBookingStatusInSQLite(
  bookingId: string,
  status: BookingStatus
): Promise<boolean> {
  try {
    const db = await getDB();
    if (!db) return true;

    await db.runAsync(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, bookingId]
    );

    console.log(`✅ SQLite: Updated booking ${bookingId} to status ${status}`);
    return true;
  } catch (error) {
    console.warn('Failed to update booking status in SQLite:', error);
    return false;
  }
}
