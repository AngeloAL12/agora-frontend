import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/colors';
import { Club } from '@/types/club';

interface MyClubCardProps {
  club: Club;
  onPressCard?: (club: Club) => void;
  onPressArrow?: (club: Club) => void;
}

export const MyClubCard: React.FC<MyClubCardProps> = ({
  club,
  onPressCard,
  onPressArrow,
}) => {
  return (
    <Pressable style={styles.card} onPress={() => onPressCard?.(club)}>
      {club.image ? (
        <Image source={{ uri: club.image }} style={styles.image} />
      ) : (
        <View style={styles.iconWrapper}>
          <Ionicons
            Name={club.iconName ?? 'people-outline'}
            size={22}
            color={COLORS.primary}
          />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Miembro</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {club.title}
        </Text>

        <Text style={styles.event} numberOfLines={1}>
          {club.event ?? 'Evento: Próximamente'}
        </Text>
      </View>

      <Pressable
        style={styles.arrowButton}
        onPress={() => onPressArrow?.(club)}
        hitSlop={10}
      >
        <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 100,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  image: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  iconWrapper: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    height: 18,
    borderRadius: 999,
    justifyContent: 'center',
    marginBottom: 6,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 18,
  },
  event: {
    marginTop: 2,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
