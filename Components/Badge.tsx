import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'member' | 'join';
}

export const Badge = ({ label, variant = 'member' }: BadgeProps) => {
  const isMember = variant === 'member';

  return (
    <View
      style={[styles.container, isMember ? styles.memberBg : styles.joinBg]}
    >
      <Text
        style={[styles.text, isMember ? styles.memberText : styles.joinText]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  memberBg: {
    backgroundColor: theme.colors.whiteSoft,
    borderColor: theme.colors.gray700,
  },
  joinBg: {
    backgroundColor: theme.palette.primary,
    borderColor: theme.palette.primary,
  },
  text: {
    fontFamily: theme.typography.fontFamily.interMedium,
    fontSize: 12,
  },
  memberText: {
    color: theme.colors.gray900,
  },
  joinText: {
    color: theme.colors.white,
  },
});
