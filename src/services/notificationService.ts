import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Booking } from '../types/booking';

// Configure notification behavior for foreground notifications
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Request permission to display local notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await window.Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (err) {
    console.warn('Error requesting notification permissions:', err);
    return false;
  }
}

/**
 * Schedule a reminder notification 15 minutes before the booked slot
 */
export async function scheduleBookingReminder(booking: Booking): Promise<string | undefined> {
  try {
    // Parse slot start time, e.g., '07:30' from '2026-09-17'
    const [hours, minutes] = booking.slotLabel.split('–')[0].trim().split(':').map(Number);
    const bookingDate = new Date(`${booking.date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);

    // 15 minutes prior
    const reminderTime = new Date(bookingDate.getTime() - 15 * 60 * 1000);
    const now = new Date();

    const title = `🔔 Nhắc nhở: Sắp đến giờ nhận phòng ${booking.roomNumber}!`;
    const body = `Phòng ${booking.roomName} của bạn bắt đầu lúc ${booking.slotLabel}. Vui lòng có mặt và mở mã QR check-in trước 15 phút.`;

    // If scheduled time is already in the past, fall back to a 5-second test trigger or immediate
    const trigger = reminderTime > now ? reminderTime : new Date(now.getTime() + 5 * 1000);

    if (Platform.OS === 'web') {
      console.log(`[Web Notification Scheduled] for ${booking.roomNumber} at ${reminderTime.toLocaleTimeString()}`);
      return `web-notif-${booking.id}`;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: { bookingId: booking.id, roomId: booking.roomId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      },
    });

    return notificationId;
  } catch (error) {
    console.warn('Failed to schedule notification:', error);
    return undefined;
  }
}

/**
 * Trigger an immediate notification for quick demo and testing
 */
export async function sendImmediateTestNotification(booking: Booking): Promise<void> {
  const title = `🔔 [Demo Check-in 15p] Phòng ${booking.roomNumber} - VKU`;
  const body = `Lịch đặt lúc ${booking.slotLabel} ngày ${booking.date} sắp bắt đầu! Hãy xuất trình thẻ QR Code để check-in.`;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
      new window.Notification(title, { body });
    } else {
      Alert.alert(title, body);
    }
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: { bookingId: booking.id },
      },
      trigger: null, // trigger immediately
    });
  } catch (error) {
    Alert.alert(title, body);
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId?: string): Promise<void> {
  if (!notificationId || Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.warn('Failed to cancel notification:', error);
  }
}
