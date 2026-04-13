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
  const hasHeaderRow = Boolean(
    title || leftAction || rightAction || showNotificationBell,
  );

  const notificationBell = showNotificationBell ? (
    <Pressable
      onPress={onNotificationPress}
      disabled={!onNotificationPress}
      style={styles.notificationBell}
      accessibilityRole={onNotificationPress ? 'button' : undefined}
      accessibilityLabel={onNotificationPress ? 'Notificaciones' : undefined}
    >
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
      {hasHeaderRow && (
        <View style={[styles.inner, align === 'left' && styles.innerLeft]}>
          {align === 'center' ? (
            <>
              <View style={styles.slot}>{leftAction ?? null}</View>
              <Text
                style={[styles.title, { textAlign: 'center' }]}
                numberOfLines={1}
              >
                {title ?? ''}
              </Text>
              <View style={styles.slot}>{resolvedRightAction ?? null}</View>
            </>
          ) : (
            <>
              <View style={styles.leftContent}>
                {leftAction && (
                  <View style={styles.leftActionItem}>{leftAction}</View>
                )}
                {title ? (
                  <Text style={styles.titleLeft} numberOfLines={1}>
                    {title}
                  </Text>
                ) : null}
              </View>
              {resolvedRightAction && (
                <View style={styles.rightActionItem}>
                  {resolvedRightAction}
                </View>
              )}
            </>
          )}
        </View>
      )}
      {searchInput && <View style={styles.searchWrapper}>{searchInput}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bluePrimary,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  inner: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  innerLeft: {
    height: 64, // Más altura según diseño
  },
  slot: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.white,
    letterSpacing: -0.3,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleLeft: {
    fontSize: 24,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.white,
    letterSpacing: -0.3,
  },
  leftActionItem: {
    marginRight: 16,
  },
  rightActionItem: {
    marginLeft: 16,
  },
  searchWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 14,
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
