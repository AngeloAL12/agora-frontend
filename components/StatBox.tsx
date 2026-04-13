import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

interface StatBoxProps {
  label: string;
  value: number;
}

export const StatBox = ({ label, value }: StatBoxProps) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  statBox: {
    backgroundColor: theme.palette.primaryDark,
    borderRadius: 16,
    paddingVertical: 14,
    width: '31%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.manropeBold,
    color: theme.palette.onPrimary,
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 10,
    color: theme.palette.onPrimary,
    marginTop: 4,
    fontFamily: theme.typography.fontFamily.interSemiBold,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
});
