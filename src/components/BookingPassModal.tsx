import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../types/booking';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useBookingStore } from '../store/useBookingStore';
import { sendImmediateTestNotification } from '../services/notificationService';

interface BookingPassModalProps {
  visible: boolean;
  booking: Booking | null;
  onClose: () => void;
}

export const BookingPassModal: React.FC<BookingPassModalProps> = ({
  visible,
  booking,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [isCheckedInDemo, setIsCheckedInDemo] = useState(false);
  const checkInBooking = useBookingStore((state) => state.checkInBooking);

  if (!booking) return null;

  const isCheckedIn = booking.status === 'CHECKED_IN' || isCheckedInDemo;

  const handleSimulateCheckIn = () => {
    checkInBooking(booking.id);
    setIsCheckedInDemo(true);
    if (Platform.OS !== 'web') {
      Alert.alert(
        '🎉 Check-in thành công!',
        `Xác thực phòng ${booking.roomNumber} cho sinh viên ${booking.userName} (${booking.studentCode}) thành công.`
      );
    }
  };

  const handleTestNotification = async () => {
    await sendImmediateTestNotification(booking);
    if (Platform.OS !== 'web') {
      Alert.alert(
        '🔔 Đã kích hoạt thông báo',
        `Thông báo nhắc nhở 15 phút trước giờ nhận phòng ${booking.roomNumber} đã được gửi!`
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { paddingTop: Math.max(insets.top, 24) + 12 }]}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleWrap}>
              <Ionicons name="qr-code-outline" size={20} color={COLORS.primary} />
              <Text style={styles.headerTitle}>VKU Smart Campus Pass</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* Ticket Card */}
            <View style={styles.ticketCard}>
              {/* Top Banner */}
              <View style={styles.ticketTop}>
                <View>
                  <Text style={styles.univText}>VIETNAM-KOREA UNIVERSITY</Text>
                  <Text style={styles.passTitle}>THẺ XÁC THỰC PHÒNG HỌC</Text>
                </View>
                <View style={[styles.statusBadge, isCheckedIn ? styles.badgeCheckedIn : styles.badgeActive]}>
                  <Text style={[styles.statusText, isCheckedIn ? styles.statusTextCheckedIn : styles.statusTextActive]}>
                    {isCheckedIn ? 'ĐÃ CHECK-IN' : 'HỢP LỆ (ACTIVE)'}
                  </Text>
                </View>
              </View>

              {/* QR Code Container */}
              <View style={styles.qrContainer}>
                <QRCode
                  value={booking.qrValue || booking.id}
                  size={160}
                  color={COLORS.primaryDark}
                  backgroundColor="#FFFFFF"
                />
                <Text style={styles.bookingIdText}>{booking.id}</Text>
                <Text style={styles.scanHint}>Xuất trình mã QR này tại cửa phòng hoặc tablet điểm danh</Text>
              </View>

              {/* Cut-out circles for ticket effect */}
              <View style={styles.ticketDivider}>
                <View style={[styles.cutout, styles.cutoutLeft]} />
                <View style={styles.dashedLine} />
                <View style={[styles.cutout, styles.cutoutRight]} />
              </View>

              {/* Booking Details */}
              <View style={styles.ticketBottom}>
                <View style={styles.detailRow}>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>PHÒNG HỌC</Text>
                    <Text style={styles.detailValueBold}>{booking.roomNumber}</Text>
                    <Text style={styles.detailSub}>{booking.roomName}</Text>
                  </View>
                  <View style={styles.detailColRight}>
                    <Text style={styles.detailLabel}>TÒA NHÀ</Text>
                    <Text style={styles.detailValueBold}>Khu {booking.building}</Text>
                    <Text style={styles.detailSub}>VKU Danang</Text>
                  </View>
                </View>

                <View style={[styles.detailRow, { marginTop: 12 }]}>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>NGÀY SỬ DỤNG</Text>
                    <Text style={styles.detailValue}>{booking.date}</Text>
                  </View>
                  <View style={styles.detailColRight}>
                    <Text style={styles.detailLabel}>KHUNG GIỜ</Text>
                    <Text style={styles.detailValue}>{booking.slotLabel}</Text>
                  </View>
                </View>

                <View style={[styles.detailRow, { marginTop: 12 }]}>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>SINH VIÊN ĐẶT</Text>
                    <Text style={styles.detailValue}>{booking.userName}</Text>
                    <Text style={styles.detailSub}>MSSV: {booking.studentCode}</Text>
                  </View>
                  <View style={styles.detailColRight}>
                    <Text style={styles.detailLabel}>MỤC ĐÍCH</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>{booking.purpose}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Interactive Actions */}
            <View style={styles.actionButtons}>
              {!isCheckedIn && (
                <TouchableOpacity
                  style={styles.checkInBtn}
                  onPress={handleSimulateCheckIn}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
                  <Text style={styles.checkInBtnText}>Mô phỏng Quét Check-in Ngay</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.notifBtn}
                onPress={handleTestNotification}
                activeOpacity={0.8}
              >
                <Ionicons name="notifications-outline" size={18} color={COLORS.primary} />
                <Text style={styles.notifBtnText}>Thử Bắn Thông Báo Nhắc Lịch (15p trước)</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.xl,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: SPACING.lg,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ticketTop: {
    backgroundColor: COLORS.primaryDark,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  univText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#93C5FD',
    letterSpacing: 0.5,
  },
  passTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  badgeActive: {
    backgroundColor: '#10B981',
  },
  badgeCheckedIn: {
    backgroundColor: '#3B82F6',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextActive: {
    color: '#FFFFFF',
  },
  statusTextCheckedIn: {
    color: '#FFFFFF',
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
  },
  bookingIdText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 12,
    letterSpacing: 1.5,
  },
  scanHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  ticketDivider: {
    height: 20,
    position: 'relative',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  cutout: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  cutoutLeft: {
    left: -10,
  },
  cutoutRight: {
    right: -10,
  },
  dashedLine: {
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  ticketBottom: {
    padding: SPACING.md,
    backgroundColor: '#FAFAFA',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {
    flex: 1,
  },
  detailColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValueBold: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  detailSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionButtons: {
    marginTop: SPACING.lg,
    gap: 10,
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.available,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  checkInBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  notifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  notifBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
