import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/constants/theme';

type StaffStatCardProps = {
  label: string;
  value: number;
  color: string;
};

export function StaffStatCard({ label, value, color }: StaffStatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignSelf: 'stretch',
    minHeight: 92,
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 20,
    justifyContent: 'center',
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.gray700,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  value: {
    marginTop: 4,
    fontSize: 24,
    lineHeight: 32,
    fontFamily: typography.fontFamily.interBold,
  },
});
