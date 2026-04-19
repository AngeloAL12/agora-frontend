import { colors, typography } from '@/constants/theme';
import { Image as ExpoImage } from 'expo-image';
import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenHeaderProps {
  title?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  searchInput?: ReactNode;
  showNotificationBell?: boolean;
  onNotificationPress?: () => void;
  align?: 'left' | 'center';
}

export const ScreenHeader = ({
  title,
  leftAction,
  rightAction,
  searchInput,
  showNotificationBell = false,
  onNotificationPress,
  align = 'center',
}: ScreenHeaderProps) => {
  const insets = useSafeAreaInsets();
  const hasTitle = Boolean(title && title.trim().length > 0);

  const notificationBell = showNotificationBell ? (
    <Pressable onPress={onNotificationPress} style={styles.notificationBell}>
      <ExpoImage
        source={require('@/assets/icons/notification_bell.svg')}
        style={styles.bellIcon}
        contentFit="contain"
        tintColor={colors.white}
      />
    </Pressable>
  ) : null;

  const resolvedRightAction = rightAction ?? notificationBell;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {searchInput && (
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>{searchInput}</View>
          {resolvedRightAction && (
            <View style={styles.searchBellContainer}>
              {resolvedRightAction}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bluePrimary,
    paddingBottom: 14,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
  },

  searchInputContainer: {
    flex: 1,
  },

  searchBellContainer: {
    width: 40,
    height: 48,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationBell: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bellIcon: {
    width: 36,
    height: 36,
  },
});
