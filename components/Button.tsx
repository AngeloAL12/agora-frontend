import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { theme } from '../constants/theme';

interface ButtonProps {
  text: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const sizeStyles = {
  small: { paddingVertical: 8, paddingHorizontal: 16 },
  medium: { paddingVertical: 14, paddingHorizontal: 24 },
  large: { paddingVertical: 18, paddingHorizontal: 32 },
};

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

  const backgroundColor =
    disabled && !isSecondary
      ? theme.colors.gray700
      : isSecondary
        ? undefined
        : theme.palette.primary;

  const textColor =
    disabled && isSecondary
      ? theme.colors.gray700
      : isSecondary
        ? theme.palette.primary
        : theme.colors.white;

  return (
    <Pressable
      onPress={!disabled ? onPress : undefined}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.baseContainer,
        { backgroundColor },
        sizeStyles[size],
        fullWidth && { width: '100%' },
        isSecondary && styles.secondaryBorder,
        isSecondary && disabled && { borderColor: theme.colors.gray700 },
        pressed && !disabled && { opacity: 0.8 },
        style,
      ]}
    >
      <Text
        style={[
          styles.baseText,
          { color: textColor },
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
