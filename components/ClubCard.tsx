import { colors, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ClubCardProps {
  name: string;
  nextEvent?: string;
  imageSource?: any;
  onPress?: () => void;
}

export const ClubCard = ({
  name,
  nextEvent,
  imageSource,
  onPress,
}: ClubCardProps) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.inner}>
        {/* Thumbnail */}
        <View style={styles.imageContainer}>
          <Image
            source={imageSource ?? require('@/assets/images/dummy/test.png')}
            style={styles.image}
            contentFit="cover"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Miembro</Text>
            </View>
          </View>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>
          {nextEvent ? (
            <Text style={styles.event} numberOfLines={1}>
              Evento: {nextEvent}
            </Text>
          ) : null}
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={16} color={colors.gray700} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.85,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 16,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    flexShrink: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignSelf: 'flex-start',
    paddingTop: 10,
    gap: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  badge: {
    backgroundColor: colors.bluePrimary,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.whiteSoft,
    fontSize: 10,
    fontFamily: typography.fontFamily.interSemiBold,
    letterSpacing: -0.5,
    textTransform: 'capitalize',
  },
  name: {
    fontSize: 18,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
    lineHeight: 22.5,
  },
  event: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    lineHeight: 20,
  },
});
