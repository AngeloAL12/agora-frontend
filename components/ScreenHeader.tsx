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
  variant?: 'primary' | 'white';
  containerStyle?: any; //
}

export const ScreenHeader = ({
  title,
  leftAction,
  rightAction,
  searchInput,
  showNotificationBell = false,
  onNotificationPress,
  align = 'center',
  containerStyle,
  variant = 'primary',
}: ScreenHeaderProps) => {
  const insets = useSafeAreaInsets();

  const isWhite = variant === 'white';
  const bgColor = isWhite ? colors.white : colors.bluePrimary;
  const textColor = isWhite ? '#192A56' : colors.white; // Azul oscuro o Blanco

  // When only a notification bell / rightAction exists (no title, no leftAction)
  // AND a searchInput is also provided, suppress the separate title row so the
  // action can live inline with the search bar (Figma clubs layout).
  const onlyActionNoTitle =
    !title && !leftAction && (!!rightAction || showNotificationBell);
  const hasHeaderRow = Boolean(
    title ||
    leftAction ||
    (onlyActionNoTitle && !searchInput) ||
    (!onlyActionNoTitle && (rightAction || showNotificationBell)),
  );

  const notificationBell = showNotificationBell ? (
    <Pressable
      onPress={onNotificationPress}
      disabled={!onNotificationPress}
      style={styles.notificationBell}
    >
      <ExpoImage
        source={require('@/assets/icons/notification_bell.svg')}
        style={styles.bellIcon}
        contentFit="contain"
        tintColor={textColor}
      />
    </Pressable>
  ) : null;

  const resolvedRightAction = rightAction ?? notificationBell;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: bgColor },
        containerStyle,
      ]}
    >
      {hasHeaderRow && (
        <View style={[styles.inner, align === 'left' && styles.innerLeft]}>
          {align === 'center' ? (
            <>
              <View style={styles.slot}>{leftAction ?? null}</View>
              <Text
                style={[
                  styles.title,
                  { textAlign: 'center', color: textColor },
                ]}
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
                  <Text
                    style={[styles.titleLeft, { color: textColor }]}
                    numberOfLines={1}
                  >
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
      {searchInput && (
        <View
          style={[
            styles.searchWrapper,
            !hasHeaderRow && !!resolvedRightAction && styles.searchWrapperRow,
          ]}
        >
          <View
            style={
              !hasHeaderRow && resolvedRightAction
                ? styles.searchFlex
                : undefined
            }
          >
            {searchInput}
          </View>
          {!hasHeaderRow && resolvedRightAction && (
            <View>{resolvedRightAction}</View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    height: 64,
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
    letterSpacing: -0.3,
  },
  leftActionItem: {
    marginRight: 16,
  },
  rightActionItem: {
    marginLeft: 16,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  searchWrapperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  searchFlex: {
    flex: 1,
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
