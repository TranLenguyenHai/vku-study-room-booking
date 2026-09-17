import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';

interface StatusBadgeProps {
  isOccupiedNow: boolean;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({ isOccupiedNow, size = 'md' }) => {
  const isSmall = size === 'sm';
  const label = isOccupiedNow ? 'Đang sử dụng' : 'Có thể đặt ngay';
  const subLabel = isOccupiedNow ? 'Occupied' : 'Available Now';

  return (
    <View
      style={[
        styles.container,
        isOccupiedNow ? styles.occupiedContainer : styles.availableContainer,
        isSmall && styles.containerSmall,
      ]}
    >
      <View
        style={[
          styles.dot,
          isOccupiedNow ? styles.dotOccupied : styles.dotAvailable,
          isSmall && styles.dotSmall,
        ]}
      />
      <Text
        style={[
          styles.text,
          isOccupiedNow ? styles.textOccupied : styles.textAvailable,
          isSmall && styles.textSmall,
        ]}
      >
        {isSmall ? subLabel : `${subLabel} • ${label}`}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  availableContainer: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  occupiedContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  dotAvailable: {
    backgroundColor: COLORS.available,
  },
  dotOccupied: {
    backgroundColor: COLORS.occupied,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
  textSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
  textAvailable: {
    color: '#065F46',
  },
  textOccupied: {
    color: '#991B1B',
  },
});
