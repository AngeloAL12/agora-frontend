import { colors, typography } from '@/constants/theme';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenHeaderProps {
  title: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
}

export const ScreenHeader = ({
  title,
  leftAction,
  rightAction,
}: ScreenHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.inner}>
        <View style={styles.slot}>{leftAction ?? null}</View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.slot}>{rightAction ?? null}</View>
      </View>
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
  slot: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.white,
    letterSpacing: -0.3,
  },
});
