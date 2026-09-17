import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TIME_SLOTS } from '../data/mockRooms';
import { SlotId, TimeSlot } from '../types/booking';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useBookingStore } from '../store/useBookingStore';

interface TimeSlotSelectorProps {
  roomId: string;
  selectedDate: string; // 'YYYY-MM-DD'
  onSelectDate: (date: string) => void;
  selectedSlotId: SlotId | null;
  onSelectSlot: (slotId: SlotId) => void;
}

interface DayItem {
  dateString: string;
  dayOfWeek: string;
  dayNumber: number;
  month: number;
  isToday: boolean;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = React.memo(
  ({ roomId, selectedDate, onSelectDate, selectedSlotId, onSelectSlot }) => {
    const isSlotBooked = useBookingStore((state) => state.isSlotBooked);
    const getSlotBooking = useBookingStore((state) => state.getSlotBooking);

    // Generate next 7 days starting today
    const next7Days: DayItem[] = useMemo(() => {
      const days: DayItem[] = [];
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const date = String(d.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${date}`;

        days.push({
          dateString,
          dayOfWeek: i === 0 ? 'Hôm nay' : dayNames[d.getDay()],
          dayNumber: d.getDate(),
          month: d.getMonth() + 1,
          isToday: i === 0,
        });
      }
      return days;
    }, []);

    return (
      <View style={styles.container}>
        {/* Date Selector Header */}
        <View style={styles.header}>
          <Text style={styles.title}>1. Chọn ngày (7 ngày tới)</Text>
          <Text style={styles.selectedDateBadge}>
            {selectedDate === next7Days[0]?.dateString ? 'Hôm nay' : selectedDate}
          </Text>
        </View>

        {/* 7-Day Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateList}
        >
          {next7Days.map((item) => {
            const isSelected = selectedDate === item.dateString;
            return (
              <TouchableOpacity
                key={item.dateString}
                style={[styles.dateCard, isSelected && styles.dateCardActive]}
                onPress={() => onSelectDate(item.dateString)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayOfWeek, isSelected && styles.dayOfWeekActive]}>
                  {item.dayOfWeek}
                </Text>
                <Text style={[styles.dayNumber, isSelected && styles.dayNumberActive]}>
                  {item.dayNumber}
                </Text>
                <Text style={[styles.monthText, isSelected && styles.monthTextActive]}>
                  Tháng {item.month}
                </Text>
                {item.isToday && (
                  <View style={[styles.todayIndicator, isSelected && styles.todayIndicatorActive]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time Slot Section */}
        <View style={[styles.header, { marginTop: SPACING.lg }]}>
          <Text style={styles.title}>2. Chọn khung giờ (Ca 2 tiếng)</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.available }]} />
              <Text style={styles.legendText}>Trống</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.booked }]} />
              <Text style={styles.legendText}>Đã kín (Khóa)</Text>
            </View>
          </View>
        </View>

        {/* Discrete Slots Grid */}
        <View style={styles.slotGrid}>
          {TIME_SLOTS.map((slot: TimeSlot) => {
            const isBooked = isSlotBooked(roomId, selectedDate, slot.id);
            const isSelected = selectedSlotId === slot.id;
            const existingBooking = isBooked ? getSlotBooking(roomId, selectedDate, slot.id) : undefined;

            return (
              <TouchableOpacity
                key={slot.id}
                disabled={isBooked}
                style={[
                  styles.slotCard,
                  isBooked && styles.slotCardBooked,
                  isSelected && !isBooked && styles.slotCardActive,
                ]}
                onPress={() => onSelectSlot(slot.id)}
                activeOpacity={0.85}
              >
                <View style={styles.slotHeader}>
                  <Text
                    style={[
                      styles.periodText,
                      isBooked && styles.periodTextBooked,
                      isSelected && !isBooked && styles.periodTextActive,
                    ]}
                  >
                    {slot.period}
                  </Text>
                  {isBooked ? (
                    <View style={styles.lockBadge}>
                      <Ionicons name="lock-closed" size={11} color="#6B7280" />
                      <Text style={styles.lockText}>Đã kín</Text>
                    </View>
                  ) : (
                    <View style={styles.availBadge}>
                      <Ionicons name="checkmark-circle" size={12} color={COLORS.available} />
                      <Text style={styles.availText}>Còn trống</Text>
                    </View>
                  )}
                </View>

                <Text
                  style={[
                    styles.timeText,
                    isBooked && styles.timeTextBooked,
                    isSelected && !isBooked && styles.timeTextActive,
                  ]}
                >
                  {slot.label}
                </Text>

                {isBooked && existingBooking && (
                  <Text style={styles.bookedByText} numberOfLines={1}>
                    Đặt bởi: {existingBooking.studentCode} ({existingBooking.userName})
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Visual Conflict Notice if slot selected is conflict */}
        <View style={styles.noticeBox}>
          <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.primary} />
          <Text style={styles.noticeText}>
            Hệ thống Real-time Conflict Engine tự động khóa ngay lập tức các khung giờ đã có người giữ chỗ.
          </Text>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  selectedDateBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  dateList: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
  },
  dateCard: {
    width: 68,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayOfWeek: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  dayOfWeekActive: {
    color: '#E0E7FF',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  dayNumberActive: {
    color: '#FFFFFF',
  },
  monthText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  monthTextActive: {
    color: '#C7D2FE',
  },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accentOrange,
    marginTop: 4,
  },
  todayIndicatorActive: {
    backgroundColor: '#FDE047',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  slotGrid: {
    paddingHorizontal: SPACING.lg,
    gap: 10,
  },
  slotCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  slotCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  slotCardBooked: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.75,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  periodTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  periodTextBooked: {
    color: '#9CA3AF',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  timeTextActive: {
    color: COLORS.primaryDark,
  },
  timeTextBooked: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  lockText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },
  availBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  availText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  bookedByText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.sm,
  },
  noticeText: {
    fontSize: 11,
    color: '#166534',
    flex: 1,
    lineHeight: 16,
  },
});
