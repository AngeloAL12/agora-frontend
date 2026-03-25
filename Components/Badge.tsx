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
      style={[
        styles.badgeContainer,
        isMember ? styles.memberBadge : styles.joinBadge,
      ]}
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
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  memberBadge: {
    backgroundColor: theme.colors.whiteSoft,
    borderColor: theme.palette.primary,
    borderWidth: 1,
  },
  joinBadge: {
    backgroundColor: theme.palette.accent, // El amarillo
  },
  text: {
    fontFamily: theme.typography.fontFamily.interSemiBold,
    fontSize: 12,
  },
  memberText: {
    color: theme.palette.primary,
  },
  joinText: {
    color: theme.colors.black,
  },
});
