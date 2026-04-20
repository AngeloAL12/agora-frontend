import { colors, typography } from '@/constants/theme';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ClubDiscoveryItemProps {
  name: string;
  memberCount: number;
  imageSource?: any;
  onJoin?: () => void;
}

export const ClubDiscoveryItem = ({
  name,
  memberCount,
  imageSource,
  onJoin,
}: ClubDiscoveryItemProps) => {
  return (
    <View style={styles.container}>
      {/* Icon/thumbnail */}
      <View style={styles.iconContainer}>
        <Image
          source={imageSource ?? require('@/assets/images/dummy/test.png')}
          style={styles.icon}
          contentFit="cover"
        />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.memberCount}>{memberCount} Miembros</Text>
      </View>

      {/* Join button */}
      <Pressable
        style={({ pressed }) => [
          styles.joinButton,
          pressed && styles.joinButtonPressed,
        ]}
        onPress={onJoin}
      >
        <Text style={styles.joinText}>Unirse</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ECEEF1',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    marginLeft: 16,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray950,
    lineHeight: 20,
  },
  memberCount: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    lineHeight: 16,
  },
  joinButton: {
    backgroundColor: '#FED41E',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexShrink: 0,
  },
  joinButtonPressed: {
    opacity: 0.8,
  },
  joinText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interSemiBold,
    color: '#705B00',
    lineHeight: 16,
  },
});
