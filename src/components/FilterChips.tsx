import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFilterStore, CapacityFilter } from '../store/useFilterStore';
import { Building, Equipment } from '../types/room';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BUILDINGS: { id: 'ALL' | Building; label: string }[] = [
  { id: 'ALL', label: 'Tất cả tòa' },
  { id: 'A', label: 'Khu A' },
  { id: 'B', label: 'Khu B' },
  { id: 'C', label: 'Khu C' },
  { id: 'V', label: 'Khu V' },
];

const CAPACITIES: { id: CapacityFilter; label: string }[] = [
  { id: 'ALL', label: 'Mọi sức chứa' },
  { id: 'SMALL', label: '2–6 bạn' },
  { id: 'MEDIUM', label: '7–12 bạn' },
  { id: 'LARGE', label: '13–20 bạn' },
];

const EQUIPMENTS: { id: Equipment; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'High-spec PC', label: 'PC xịn', icon: 'desktop-outline' },
  { id: 'Projector', label: 'Máy chiếu', icon: 'videocam-outline' },
  { id: 'Whiteboard', label: 'Bảng trắng', icon: 'clipboard-outline' },
  { id: 'AC', label: 'Điều hòa', icon: 'snow-outline' },
];

export const FilterChips: React.FC = React.memo(() => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    selectedBuilding,
    setSelectedBuilding,
    capacityFilter,
    setCapacityFilter,
    selectedEquipments,
    toggleEquipment,
    onlyAvailableNow,
    setOnlyAvailableNow,
    resetFilters,
  } = useFilterStore();

  const activeFiltersCount =
    (selectedBuilding !== 'ALL' ? 1 : 0) +
    (capacityFilter !== 'ALL' ? 1 : 0) +
    selectedEquipments.length +
    (onlyAvailableNow ? 1 : 0);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAdvanced(!showAdvanced);
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm phòng học, lab AI, hội thảo..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Buildings Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.buildingRow}
      >
        {BUILDINGS.map((b) => {
          const isSelected = selectedBuilding === b.id;
          return (
            <TouchableOpacity
              key={b.id}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => setSelectedBuilding(b.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {b.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Toggle Available Now Chip */}
        <TouchableOpacity
          style={[styles.chip, onlyAvailableNow && styles.chipActiveGreen]}
          onPress={() => setOnlyAvailableNow(!onlyAvailableNow)}
          activeOpacity={0.8}
        >
          <View style={[styles.statusDot, onlyAvailableNow && styles.statusDotActive]} />
          <Text style={[styles.chipText, onlyAvailableNow && styles.chipTextActiveGreen]}>
            Phòng trống ngay
          </Text>
        </TouchableOpacity>

        {/* Advanced Filters Button */}
        <TouchableOpacity
          style={[styles.chip, styles.chipAdvanced, (activeFiltersCount > 0 || showAdvanced) && styles.chipAdvancedActive]}
          onPress={toggleExpand}
          activeOpacity={0.8}
        >
          <Ionicons
            name="options-outline"
            size={14}
            color={activeFiltersCount > 0 ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.chipText, activeFiltersCount > 0 && styles.chipTextActive]}>
            Bộ lọc {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Advanced Filter Drawer */}
      {showAdvanced && (
        <View style={styles.advancedDrawer}>
          {/* Capacity Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sức chứa phòng học</Text>
          </View>
          <View style={styles.optionsWrap}>
            {CAPACITIES.map((cap) => {
              const isSelected = capacityFilter === cap.id;
              return (
                <TouchableOpacity
                  key={cap.id}
                  style={[styles.filterPill, isSelected && styles.filterPillActive]}
                  onPress={() => setCapacityFilter(cap.id)}
                >
                  <Text style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}>
                    {cap.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Equipment Section */}
          <View style={[styles.sectionHeader, { marginTop: 12 }]}>
            <Text style={styles.sectionTitle}>Trang thiết bị cần có</Text>
          </View>
          <View style={styles.optionsWrap}>
            {EQUIPMENTS.map((eq) => {
              const isSelected = selectedEquipments.includes(eq.id);
              return (
                <TouchableOpacity
                  key={eq.id}
                  style={[styles.filterPill, isSelected && styles.filterPillActive]}
                  onPress={() => toggleEquipment(eq.id)}
                >
                  <Ionicons
                    name={eq.icon}
                    size={14}
                    color={isSelected ? '#FFFFFF' : COLORS.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}>
                    {eq.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Reset Action */}
          {activeFiltersCount > 0 && (
            <TouchableOpacity style={styles.resetRow} onPress={resetFilters}>
              <Ionicons name="refresh" size={14} color={COLORS.occupied} />
              <Text style={styles.resetText}>Xóa tất cả bộ lọc</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
    height: 44,
    borderRadius: RADIUS.md,
    gap: 8,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  buildingRow: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipActiveGreen: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextActiveGreen: {
    color: '#065F46',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
    marginRight: 6,
  },
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  chipAdvanced: {
    gap: 4,
    backgroundColor: '#F8FAFC',
  },
  chipAdvancedActive: {
    borderColor: COLORS.primaryLight,
    backgroundColor: '#EFF6FF',
  },
  advancedDrawer: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  sectionHeader: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  resetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 4,
  },
  resetText: {
    color: COLORS.occupied,
    fontSize: 13,
    fontWeight: '600',
  },
});
