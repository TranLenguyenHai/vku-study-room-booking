export type SlotId = 'slot_1' | 'slot_2' | 'slot_3' | 'slot_4';

export interface TimeSlot {
  id: SlotId;
  label: string; // e.g. '07:30 – 09:30'
  period: string; // e.g. 'Ca Sáng 1'
  startTime: string; // '07:30'
  endTime: string; // '09:30'
}

export type BookingStatus = 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED';

export interface Booking {
  id: string; // e.g. 'VKU-BK-84910'
  roomId: string;
  roomName: string;
  building: string;
  roomNumber: string;
  date: string; // 'YYYY-MM-DD'
  slotId: SlotId;
  slotLabel: string;
  userId: string;
  userName: string;
  studentCode: string;
  purpose: string;
  status: BookingStatus;
  createdAt: string;
  qrValue: string;
  notificationId?: string;
}
