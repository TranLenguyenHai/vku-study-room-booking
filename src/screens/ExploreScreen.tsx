import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { Room } from '../types/room';
import { useBookingStore } from '../store/useBookingStore';
import { useFilterStore } from '../store/useFilterStore';
import { RoomCard } from '../components/RoomCard';
import { FilterChips } from '../components/FilterChips';
import { EmptyState } from '../components/EmptyState';
import { COLORS, SPACING } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const rooms = useBookingStore((state) => state.rooms);

  const {
    searchQuery,
    selectedBuilding,
    capacityFilter,
    selectedEquipments,
    onlyAvailableNow,
    resetFilters,
  } = useFilterStore();

  // Filter logic memoized for 60fps performance
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // 1. Search Query
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = room.name.toLowerCase().includes(query);
        const matchesNumber = room.roomNumber.toLowerCase().includes(query);
        const matchesBuilding = `khu ${room.building.toLowerCase()}`.includes(query);
        if (!matchesName && !matchesNumber && !matchesBuilding) {
          return false;
        }
      }

      // 2. Building Filter
      if (selectedBuilding !== 'ALL' && room.building !== selectedBuilding) {
        return false;
      }

      // 3. Capacity Filter
      if (capacityFilter === 'SMALL' && (room.capacity < 2 || room.capacity > 6)) {
        return false;
      }
      if (capacityFilter === 'MEDIUM' && (room.capacity < 7 || room.capacity > 12)) {
        return false;
      }
      if (capacityFilter === 'LARGE' && (room.capacity < 13 || room.capacity > 20)) {
        return false;
      }

      // 4. Equipment Filter (Room must have all selected equipments)
      if (selectedEquipments.length > 0) {
        const hasAll = selectedEquipments.every((eq) => room.equipment.includes(eq));
        if (!hasAll) return false;
      }

      // 5. Available Now Filter
      if (onlyAvailableNow && room.isOccupiedNow) {
        return false;
      }

      return true;
    });
  }, [rooms, searchQuery, selectedBuilding, capacityFilter, selectedEquipments, onlyAvailableNow]);

  const handleRoomPress = useCallback(
    (room: Room) => {
      navigation.navigate('RoomDetail', { room });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Room }) => <RoomCard room={item} onPress={handleRoomPress} />,
    [handleRoomPress]
  );

  const keyExtractor = useCallback((item: Room) => item.id, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* Top App Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.univSubTitle}>TRƯỜNG ĐẠI HỌC CNTT & TT VIỆT - HÀN</Text>
          <Text style={styles.appTitle}>VKU Study Room Booking</Text>
        </View>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'MyBookings' })}
        >
          <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* High-performance FlatList */}
      <FlatList
        data={filteredRooms}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={
          <>
            <FilterChips />
            <View style={styles.resultBar}>
              <Text style={styles.resultText}>
                Tìm thấy <Text style={styles.resultHighlight}>{filteredRooms.length}</Text> phòng học phù hợp
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title="Không tìm thấy phòng phù hợp"
            description="Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn một số tiêu chí bộ lọc."
            actionText="Đặt lại bộ lọc"
            onAction={resetFilters}
          />
        }
        contentContainerStyle={styles.listContent}
        initialNumToRender={5}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  univSubTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#93C5FD',
    letterSpacing: 0.5,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
  resultBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  resultText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  resultHighlight: {
    fontWeight: '700',
    color: COLORS.primary,
  },
});
