import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { SlotId, Booking } from '../types/booking';
import { getFormattedDate } from '../data/mockRooms';
import { useBookingStore } from '../store/useBookingStore';
import { TimeSlotSelector } from '../components/TimeSlotSelector';
import { StatusBadge } from '../components/StatusBadge';
import { BookingPassModal } from '../components/BookingPassModal';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

type RouteProps = RouteProp<RootStackParamList, 'RoomDetail'>;
type NavProps = NativeStackNavigationProp<RootStackParamList>;

export const RoomDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProps>();
  const { room } = route.params;

  const [selectedDate, setSelectedDate] = useState<string>(getFormattedDate(0));
  const [selectedSlotId, setSelectedSlotId] = useState<SlotId | null>(null);
  const [purpose, setPurpose] = useState<string>('Học nhóm môn React Native & Đồ án tốt nghiệp');
  const [loading, setLoading] = useState(false);

  // Modal Pass after successful booking
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);

  const bookRoom = useBookingStore((state) => state.bookRoom);
  const isSlotBooked = useBookingStore((state) => state.isSlotBooked);

  const handleBooking = async () => {
    if (!selectedSlotId) {
      const msg = 'Vui lòng chọn một khung giờ 2 tiếng còn trống trước khi xác nhận!';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Thông báo', msg);
      return;
    }

    // Check conflict
    if (isSlotBooked(room.id, selectedDate, selectedSlotId)) {
      const msg = 'Khung giờ này vừa có người đặt trước! Vui lòng chọn khung giờ khác.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Trùng lịch (Conflict)', msg);
      return;
    }

    setLoading(true);
    try {
      const result = await bookRoom({
        roomId: room.id,
        date: selectedDate,
        slotId: selectedSlotId,
        purpose,
      });

      setLoading(false);

      if (result.success && result.booking) {
        setCreatedBooking(result.booking);
        setShowPassModal(true);
      } else {
        const errorMsg = result.message || 'Đặt phòng thất bại, vui lòng thử lại!';
        Platform.OS === 'web' ? window.alert(errorMsg) : Alert.alert('Lỗi đặt phòng', errorMsg);
      }
    } catch (err) {
      setLoading(false);
      const errorMsg = 'Đã xảy ra lỗi trong quá trình đặt phòng!';
      Platform.OS === 'web' ? window.alert(errorMsg) : Alert.alert('Lỗi', errorMsg);
    }
  };

  return (
    <View style={styles.container}>
      {/* Navigation Top Bar with Dynamic Island safe padding */}
      <View style={[styles.navBar, { paddingTop: Math.max(insets.top, 24) + 6 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {room.name}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Hero Photo Banner */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: room.photoUrl }} style={styles.bannerImage} resizeMode="cover" />
          <View style={styles.badgeRow}>
            <View style={styles.buildingTag}>
              <Text style={styles.buildingTagText}>Tòa {room.building} • Tầng {room.floor}</Text>
            </View>
            <StatusBadge isOccupiedNow={room.isOccupiedNow} size="sm" />
          </View>
        </View>

        {/* Room Header Info */}
        <View style={styles.infoSection}>
          <Text style={styles.roomTitle}>{room.name}</Text>
          <Text style={styles.roomSub}>Mã phòng: {room.roomNumber} | Sức chứa tối đa: {room.capacity} sinh viên</Text>

          <Text style={styles.descText}>{room.description}</Text>

          {/* Equipment Badges */}
          <Text style={styles.subHeading}>Trang thiết bị phòng học</Text>
          <View style={styles.eqRow}>
            {room.equipment.map((eq) => (
              <View key={eq} style={styles.eqBadge}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.available} />
                <Text style={styles.eqBadgeText}>{eq}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Interactive 7-Day & Time-Slot Selector with Conflict Engine */}
        <TimeSlotSelector
          roomId={room.id}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          selectedSlotId={selectedSlotId}
          onSelectSlot={setSelectedSlotId}
        />

        {/* Purpose Input */}
        <View style={styles.purposeSection}>
          <Text style={styles.subHeading}>Mục đích sử dụng phòng</Text>
          <TextInput
            style={styles.purposeInput}
            value={purpose}
            onChangeText={setPurpose}
            placeholder="Ví dụ: Thảo luận nhóm, lập trình, làm bài tập lớn..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Booking Summary Box */}
        {selectedSlotId && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
              <Text style={styles.summaryLabel}>Ngày đặt:</Text>
              <Text style={styles.summaryValue}>{selectedDate}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="time-outline" size={16} color={COLORS.primary} />
              <Text style={styles.summaryLabel}>Khung giờ:</Text>
              <Text style={styles.summaryValue}>
                {selectedSlotId === 'slot_1' && '07:30 – 09:30'}
                {selectedSlotId === 'slot_2' && '09:30 – 11:30'}
                {selectedSlotId === 'slot_3' && '13:00 – 15:00'}
                {selectedSlotId === 'slot_4' && '15:00 – 17:00'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="notifications-outline" size={16} color={COLORS.accentOrange} />
              <Text style={styles.summaryNotice}>Sẽ tự động nhận thông báo trước 15 phút</Text>
            </View>
          </View>
        )}

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
            onPress={handleBooking}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.confirmBtnText}>Xác Nhận Giữ Chỗ Ngay</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Booking Pass QR Modal */}
      <BookingPassModal
        visible={showPassModal}
        booking={createdBooking}
        onClose={() => {
          setShowPassModal(false);
          navigation.navigate('MainTabs', { screen: 'MyBookings' });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  scrollBody: {
    paddingBottom: 40,
  },
  bannerContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  badgeRow: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buildingTag: {
    backgroundColor: 'rgba(15, 56, 117, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  buildingTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  infoSection: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  roomTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  roomSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  descText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
    marginBottom: 16,
  },
  subHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  eqRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  eqBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  eqBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  purposeSection: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
  },
  purposeInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  summaryCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  summaryNotice: {
    fontSize: 12,
    color: COLORS.accentOrange,
    fontWeight: '600',
  },
  actionContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: RADIUS.md,
    elevation: 3,
  },
  confirmBtnDisabled: {
    opacity: 0.7,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
