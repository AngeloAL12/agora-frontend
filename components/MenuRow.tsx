import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

interface MenuRowProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showDivider?: boolean;
}

export function MenuRow({
  iconName,
  label,
  onPress,
  rightElement,
  showDivider = false,
}: MenuRowProps) {
  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={onPress}
      >
        <View style={styles.iconBox}>
          <Ionicons name={iconName} size={20} color={theme.palette.primary} />
        </View>
        <Text style={styles.label}>{label}</Text>
        {rightElement !== undefined ? (
          rightElement
        ) : onPress ? (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.palette.textSecondary}
          />
        ) : null}
      </Pressable>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.interSemiBold,
    color: theme.palette.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray100,
    marginLeft: 54,
  },
});
