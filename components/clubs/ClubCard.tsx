import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/colors';
import { Club } from '@/types/club';

interface ClubCardProps {
  club: Club;
  onJoin?: (club: Club) => void;
}

export const ClubCard: React.FC<ClubCardProps> = ({ club, onJoin }) => {
  return (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        {club.image ? (
          <Image source={{ uri: club.image }} style={styles.image} />
        ) : (
          <View style={styles.iconWrapper}>
            <Ionicons
              Name={club.iconName ?? 'people-outline'}
              size={18}
              color={COLORS.primary}
            />
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {club.title}
          </Text>
          <Text style={styles.members}>{club.members} Miembros</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.joinButton,
          pressed && styles.joinButtonPressed,
        ]}
        onPress={() => onJoin?.(club)}
      >
        <Text style={styles.joinButtonText}>Unirse</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 74,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    marginLeft: 10,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  members: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  joinButton: {
    backgroundColor: COLORS.accent,
    minWidth: 78,
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonPressed: {
    opacity: 0.85,
  },
  joinButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A5A00',
  },
});
