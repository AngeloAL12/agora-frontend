import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/theme';

interface ClubStatsProps {
  members: number;
  publications: number;
  onPressMembers?: () => void;
}
interface StatItemProps {
  value: number;
  label: string;
}

const StatItem = ({ value, label }: StatItemProps) => {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

const ClubStats = ({
  members,
  publications,
  onPressMembers,
}: ClubStatsProps) => {
  return (
    <View style={styles.statsRow}>
      <TouchableOpacity activeOpacity={0.8} onPress={onPressMembers}>
        <StatItem value={members} label="MIEMBROS" />
      </TouchableOpacity>

      <StatItem value={publications} label="PUBLICACIONES" />
    </View>
  );
};

export default ClubStats;

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',

    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle,
  },

  statItem: {
    alignItems: 'center',
  },

  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.blueDark,
    lineHeight: 24,
    marginBottom: 2,
    textAlign: 'center',
  },

  statLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: colors.gray700,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
    textAlign: 'center',
  },
});
