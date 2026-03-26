import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '../constants/theme';

interface ButtonProps {
  text: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button = ({
  text,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  style,
}: ButtonProps) => {
  const isSecondary = variant === 'secondary';

  const getBackgroundColor = () => {
    if (disabled && !isSecondary) return theme.colors.gray700;
    if (isSecondary) return 'transparent';
    return theme.palette.primary;
  };

  const getTextColor = () => {
    if (disabled && isSecondary) return theme.colors.gray700;
    if (isSecondary) return theme.palette.primary;
    return theme.colors.white;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.baseContainer,
        { backgroundColor: getBackgroundColor() },
        size === 'small' && { paddingVertical: 8, paddingHorizontal: 16 },
        size === 'medium' && { paddingVertical: 14, paddingHorizontal: 24 },
        size === 'large' && { paddingVertical: 18, paddingHorizontal: 32 },
        fullWidth && { width: '100%' },
        isSecondary && [
          styles.secondaryBorder,
          disabled && { borderColor: theme.colors.gray700 },
        ],
        pressed && !disabled && { opacity: 0.8 },
        style,
      ]}
    >
      <Text
        style={[
          styles.baseText,
          { color: getTextColor() },
          size === 'large' && { fontSize: 18 },
          size === 'small' && { fontSize: 14 },
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: theme.palette.primary,
  },
  baseText: {
    fontFamily: theme.typography.fontFamily.interSemiBold,
    fontSize: 16,
  },
});
