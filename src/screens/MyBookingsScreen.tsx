import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../types/booking';
import { useBookingStore } from '../store/useBookingStore';
import { BookingPassModal } from '../components/BookingPassModal';
import { EmptyState } from '../components/EmptyState';
import { sendImmediateTestNotification } from '../services/notificationService';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export const MyBookingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [selectedPass, setSelectedPass] = useState<Booking | null>(null);

  const reservations = useBookingStore((state) => state.reservations);
  const cancelBooking = useBookingStore((state) => state.cancelBooking);

  const displayedBookings = useMemo(() => {
    if (activeTab === 'ACTIVE') {
      return reservations.filter((b) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN');
    }
    return reservations.filter((b) => b.status === 'CANCELLED');
  }, [reservations, activeTab]);

  const handleCancelPress = (booking: Booking) => {
    const confirmMessage = `Bạn có chắc chắn muốn hủy lịch đặt phòng ${booking.roomNumber} (${booking.slotLabel}) không?\nKhung giờ này sẽ được giải phóng ngay lập tức cho bạn khác đặt.`;

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMessage)) {
        cancelBooking(booking.id);
      }
    } else {
      Alert.alert(
        'Hủy lịch đặt phòng',
        confirmMessage,
        [
          { text: 'Không', style: 'cancel' },
          {
            text: 'Hủy lịch',
            style: 'destructive',
            onPress: () => cancelBooking(booking.id),
          },
        ]
      );
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const isCancelled = item.status === 'CANCELLED';
    const isCheckedIn = item.status === 'CHECKED_IN';

    return (
      <View style={[styles.card, isCancelled && styles.cardCancelled]}>
        {/* Top bar */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.codeText}>{item.id}</Text>
            <Text style={styles.dateBadge}>{item.date}</Text>
          </View>
          <View
            style={[
              styles.statusPill,
              isCheckedIn && styles.statusCheckedIn,
              isCancelled && styles.statusCancelled,
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                isCheckedIn && styles.statusTextCheckedIn,
                isCancelled && styles.statusTextCancelled,
              ]}
            >
              {isCancelled ? 'ĐÃ HỦY' : isCheckedIn ? 'ĐÃ CHECK-IN' : 'ĐANG HIỆU LỰC'}
            </Text>
          </View>
        </View>

        {/* Room Info */}
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{item.roomName}</Text>
          <Text style={styles.roomLocation}>
            Tòa {item.building} • Phòng {item.roomNumber}
          </Text>

          <View style={styles.slotRow}>
            <Ionicons name="time" size={16} color={COLORS.primary} />
            <Text style={styles.slotText}>{item.slotLabel}</Text>
          </View>

          <View style={styles.purposeRow}>
            <Ionicons name="document-text-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.purposeText} numberOfLines={1}>
              Mục đích: {item.purpose}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        {!isCancelled && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.qrActionBtn}
              onPress={() => setSelectedPass(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code" size={16} color="#FFFFFF" />
              <Text style={styles.qrActionText}>Xem Thẻ QR Pass</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testNotifBtn}
              onPress={() => sendImmediateTestNotification(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={16} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelActionBtn}
              onPress={() => handleCancelPress(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={16} color={COLORS.occupied} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* Header with Dynamic Island safe padding */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 10 }]}>
        <Text style={styles.headerSub}>VKU STUDY ROOM BOOKING</Text>
        <Text style={styles.headerTitle}>Lịch Đặt Phòng Của Tôi</Text>
      </View>

      {/* Segment Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ACTIVE' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ACTIVE')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'ACTIVE' && styles.tabBtnTextActive]}>
            Đang Hoạt Động (
            {reservations.filter((b) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'HISTORY' && styles.tabBtnActive]}
          onPress={() => setActiveTab('HISTORY')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'HISTORY' && styles.tabBtnTextActive]}>
            Đã Hủy / Lịch Sử ({reservations.filter((b) => b.status === 'CANCELLED').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <FlatList
        data={displayedBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title={activeTab === 'ACTIVE' ? 'Chưa có lịch đặt nào' : 'Không có lịch sử bị hủy'}
            description={
              activeTab === 'ACTIVE'
                ? 'Bạn chưa đặt phòng học nào. Hãy quay lại trang Khám phá để chọn và đặt phòng nhé!'
                : 'Mọi lịch đặt phòng của bạn đều đang hoạt động tốt.'
            }
          />
        }
      />

      {/* QR Modal */}
      <BookingPassModal
        visible={!!selectedPass}
        booking={selectedPass}
        onClose={() => setSelectedPass(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#93C5FD',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: COLORS.primary,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  cardCancelled: {
    opacity: 0.7,
    backgroundColor: '#F8FAFC',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  dateBadge: {
    fontSize: 11,
    color: COLORS.textSecondary,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  statusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  statusCheckedIn: {
    backgroundColor: '#EFF6FF',
  },
  statusCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  statusTextCheckedIn: {
    color: '#1D4ED8',
  },
  statusTextCancelled: {
    color: '#991B1B',
  },
  roomInfo: {
    gap: 4,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  roomLocation: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  slotText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  purposeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  purposeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  qrActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
  },
  qrActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  testNotifBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  cancelActionBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
  },
});
