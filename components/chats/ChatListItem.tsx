import { ChatType } from '@/constants/chats';
import { colors, typography } from '@/constants/theme';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const CLUB_PLACEHOLDER = require('@/assets/images/dummy/club_chat.png');
const IA_AVATAR = require('@/assets/icons/AiBot/buffalo-with-background.svg');
const RAY_ICON = require('@/assets/icons/chat/ray.svg');

interface ChatListItemProps {
  name: string;
  type: ChatType;
  avatarSource?: { uri: string } | null;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  onPress?: () => void;
  isLast?: boolean;
}

export const ChatListItem = ({
  name,
  type,
  avatarSource,
  lastMessage,
  timestamp,
  unreadCount,
  onPress,
  isLast = false,
}: ChatListItemProps) => {
  const isIA = type === 'ia';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        !isLast && styles.borderBottom,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Chat de ${name}`}
    >
      {/* Avatar */}
      <View style={[styles.avatarWrapper, isIA && styles.avatarWrapperIA]}>
        <Image
          source={isIA ? IA_AVATAR : (avatarSource ?? CLUB_PLACEHOLDER)}
          style={styles.avatar}
          contentFit={isIA ? 'contain' : 'cover'}
        />
        {isIA && (
          <Image
            source={RAY_ICON}
            style={styles.iaBadgeIcon}
            contentFit="contain"
          />
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Name row */}
        <View style={styles.nameRow}>
          <View style={styles.nameGroup}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            {isIA && (
              <View style={styles.botChip}>
                <Text style={styles.botChipText}>BOT</Text>
              </View>
            )}
          </View>
          <Text
            style={[styles.timestamp, isIA && styles.timestampIA]}
            numberOfLines={1}
          >
            {timestamp}
          </Text>
        </View>

        {/* Preview */}
        <Text
          style={[styles.preview, isIA && styles.previewIA]}
          numberOfLines={1}
        >
          {lastMessage}
        </Text>
      </View>

      {/* Unread badge */}
      {!!unreadCount && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const AVATAR_SIZE = 56;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.chatBorder,
  },
  pressed: {
    opacity: 0.75,
    backgroundColor: colors.chatBorder,
  },

  // Avatar
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 16,
    backgroundColor: colors.chatBorder,
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarWrapperIA: {
    backgroundColor: colors.bluePrimary,
    borderRadius: 16,
    overflow: 'visible', // para mostrar el badge circular
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 16,
  },
  iaBadgeIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
  },

  // Content
  content: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  nameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
    flexShrink: 1,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.chatTimestamp,
    flexShrink: 0,
  },
  timestampIA: {
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.blueSecondary,
  },

  // BOT chip
  botChip: {
    backgroundColor: colors.botBadgeBg,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexShrink: 0,
  },
  botChipText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.botBadgeText,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Preview
  preview: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.chatTimestamp,
  },
  previewIA: {
    fontFamily: typography.fontFamily.interMedium,
  },

  // Unread badge
  badge: {
    backgroundColor: colors.unreadBadgeBg,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.white,
    lineHeight: 15,
  },
});
