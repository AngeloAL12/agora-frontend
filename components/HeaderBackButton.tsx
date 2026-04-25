import { colors } from '@/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';

interface HeaderBackButtonProps {
  color?: string;
}

export const HeaderBackButton = ({
  color = colors.blueDark,
}: HeaderBackButtonProps) => {
  return (
    <Pressable
      style={styles.button}
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/clubs' as any);
        }
      }}
      hitSlop={10}
    >
      <Image
        source={require('@/assets/icons/regreso.png')}
        style={[styles.icon, { tintColor: color }]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
});
