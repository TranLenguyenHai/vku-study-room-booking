import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Room, Equipment } from '../types/room';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { StatusBadge } from './StatusBadge';

interface RoomCardProps {
  room: Room;
  onPress: (room: Room) => void;
}

const getEquipmentIcon = (eq: Equipment) => {
  switch (eq) {
    case 'Projector':
      return <MaterialCommunityIcons name="projector" size={14} color={COLORS.primary} />;
    case 'Whiteboard':
      return <MaterialCommunityIcons name="presentation" size={14} color={COLORS.primary} />;
    case 'High-spec PC':
      return <Ionicons name="desktop-outline" size={14} color={COLORS.primary} />;
    case 'AC':
      return <Ionicons name="snow-outline" size={14} color={COLORS.primary} />;
    default:
      return null;
  }
};

const getEquipmentLabel = (eq: Equipment) => {
  switch (eq) {
    case 'Projector':
      return 'Máy chiếu';
    case 'Whiteboard':
      return 'Bảng trắng';
    case 'High-spec PC':
      return 'PC xịn';
    case 'AC':
      return 'Điều hòa';
    default:
      return eq;
  }
};

export const RoomCard: React.FC<RoomCardProps> = React.memo(
  ({ room, onPress }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => onPress(room)}
      >
        {/* Photo with Overlay Badges */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: room.photoUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Building & Floor Tag */}
          <View style={styles.buildingBadge}>
            <Text style={styles.buildingBadgeText}>Tòa {room.building} • Tầng {room.floor}</Text>
          </View>

          {/* Rating */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FBBF24" />
            <Text style={styles.ratingText}>{room.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <Text style={styles.roomName} numberOfLines={1}>
              {room.name}
            </Text>
          </View>

          {/* Location & Capacity Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoPill}>
              <Ionicons name="people-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.infoPillText}>Sức chứa: {room.capacity} SV</Text>
            </View>

            <View style={styles.infoPill}>
              <Ionicons name="business-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.infoPillText}>Phòng: {room.roomNumber}</Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {room.description}
          </Text>

          {/* Equipment Pills */}
          <View style={styles.equipmentContainer}>
            {room.equipment.map((eq) => (
              <View key={eq} style={styles.eqPill}>
                {getEquipmentIcon(eq)}
                <Text style={styles.eqPillText}>{getEquipmentLabel(eq)}</Text>
              </View>
            ))}
          </View>

          {/* Bottom Row: Status & CTA */}
          <View style={styles.footerRow}>
            <StatusBadge isOccupiedNow={room.isOccupiedNow} size="sm" />
            <View style={styles.bookNowAction}>
              <Text style={styles.bookNowText}>Đặt phòng</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prev, next) => {
    return (
      prev.room.id === next.room.id &&
      prev.room.isOccupiedNow === next.room.isOccupiedNow &&
      prev.room.name === next.room.name
    );
  }
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
      },
    }),
  },
  imageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buildingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 56, 117, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  buildingBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    padding: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  roomName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  infoPillText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  equipmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  eqPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.tagBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  eqPillText: {
    fontSize: 11,
    color: COLORS.tagText,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  bookNowAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookNowText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
