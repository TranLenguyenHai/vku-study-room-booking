import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '../store/useBookingStore';
import { requestNotificationPermission } from '../services/notificationService';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, reservations, toggleNotificationSetting, resetToDefaults, isDatabaseReady, isCloudConnected } = useBookingStore();

  const activeCount = reservations.filter((b) => b.status === 'CONFIRMED').length;
  const checkedInCount = reservations.filter((b) => b.status === 'CHECKED_IN').length;
  const totalHours = (activeCount + checkedInCount) * 2; // Each slot is 2 hours

  const handleToggleNotification = async (val: boolean) => {
    if (val) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        const msg = 'Vui lòng cấp quyền thông báo trong cài đặt thiết bị để nhận nhắc nhở 15 phút!';
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Quyền thông báo', msg);
      }
    }
    toggleNotificationSetting(val);
  };

  const handleResetData = () => {
    const msg = 'Bạn có muốn đặt lại toàn bộ dữ liệu mẫu (Mock Data) về trạng thái ban đầu không?';
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) {
        resetToDefaults();
      }
    } else {
      Alert.alert('Khôi phục dữ liệu', msg, [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Khôi phục', style: 'destructive', onPress: resetToDefaults },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* Header with Dynamic Island safe padding */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 10 }]}>
        <Text style={styles.headerSub}>TÀI KHOẢN SINH VIÊN VKU</Text>
        <Text style={styles.headerTitle}>Hồ Sơ & Cài Đặt</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {/* Student ID Card */}
        <View style={styles.studentCard}>
          <View style={styles.cardTopBanner}>
            <Text style={styles.cardBannerText}>TRƯỜNG ĐẠI HỌC CNTT & TT VIỆT - HÀN (VKU)</Text>
          </View>
          <View style={styles.cardContent}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View style={styles.cardInfo}>
              <Text style={styles.studentName}>{user.name}</Text>
              <Text style={styles.studentCode}>MSSV: {user.studentCode}</Text>
              <Text style={styles.studentMeta}>Lớp: {user.className}</Text>
              <Text style={styles.studentMeta} numberOfLines={1}>
                Ngành: {user.major}
              </Text>
              <Text style={styles.emailText}>{user.email}</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{reservations.length}</Text>
            <Text style={styles.statLabel}>Tổng lượt đặt</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: COLORS.available }]}>{totalHours}h</Text>
            <Text style={styles.statLabel}>Thời gian học</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: COLORS.accentOrange }]}>{checkedInCount}</Text>
            <Text style={styles.statLabel}>Đã check-in</Text>
          </View>
        </View>

        {/* Database Engine Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Cơ sở dữ liệu (Database Engine)</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="server-outline" size={22} color={COLORS.primary} />
              <View>
                <Text style={styles.settingTitle}>Local SQLite Database</Text>
                <Text style={styles.settingDesc}>
                  File: vku_booking.db ({isDatabaseReady ? 'Đã kết nối • Bảng rooms & bookings' : 'Đang khởi tạo...'})
                </Text>
              </View>
            </View>
            <View style={styles.statusBadgeGreen}>
              <Text style={styles.statusBadgeText}>{isDatabaseReady ? 'ACTIVE' : 'READY'}</Text>
            </View>
          </View>

          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: 10 }]}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="cloud-done-outline"
                size={22}
                color={isCloudConnected ? COLORS.available : COLORS.accentOrange}
              />
              <View>
                <Text style={styles.settingTitle}>Supabase Cloud Database</Text>
                <Text style={styles.settingDesc}>
                  {isCloudConnected
                    ? 'Đã đồng bộ Realtime PostgreSQL'
                    : 'Chế độ Cục bộ (Sẵn sàng kết nối qua .env)'}
                </Text>
              </View>
            </View>
            <View style={[styles.statusBadgeGreen, !isCloudConnected && styles.statusBadgeOrange]}>
              <Text style={styles.statusBadgeText}>{isCloudConnected ? 'ONLINE' : 'LOCAL'}</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Cài đặt hệ thống</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
              <View>
                <Text style={styles.settingTitle}>Thông báo nhắc nhở 15 phút</Text>
                <Text style={styles.settingDesc}>Nhận thông báo cục bộ trước khi đến ca nhận phòng</Text>
              </View>
            </View>
            <Switch
              value={user.notificationEnabled}
              onValueChange={handleToggleNotification}
              trackColor={{ false: '#CBD5E1', true: COLORS.primaryLight }}
              thumbColor={user.notificationEnabled ? COLORS.primary : '#F1F5F9'}
            />
          </View>

          <TouchableOpacity style={styles.actionRow} onPress={handleResetData} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Ionicons name="refresh-circle-outline" size={22} color={COLORS.occupied} />
              <View>
                <Text style={[styles.settingTitle, { color: COLORS.occupied }]}>
                  Khôi phục dữ liệu mẫu (Reset Data)
                </Text>
                <Text style={styles.settingDesc}>Xóa các lịch đặt thử nghiệm và nạp lại dữ liệu gốc</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Project Info Footer */}
        <View style={styles.projectInfoCard}>
          <Text style={styles.projectTitle}>Mini-Project 2: Real-time Study Room Booking App</Text>
          <Text style={styles.projectSub}>React Native & Expo SDK • TypeScript • Zustand • FlatList 60fps</Text>
          <Text style={styles.projectAuthor}>Khoa Khoa Học Máy Tính & Kỹ Thuật Phần Mềm - VKU</Text>
        </View>
      </ScrollView>
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
  body: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
  },
  cardTopBanner: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  cardBannerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: SPACING.md,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  studentCode: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  studentMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emailText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: SPACING.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    marginTop: 6,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  settingDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  projectInfoCard: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  projectTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  projectSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  projectAuthor: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  statusBadgeGreen: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  statusBadgeOrange: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
});
