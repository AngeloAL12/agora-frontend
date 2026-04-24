import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

interface ClubStatsProps {
  members: number;
  publications: number;
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

const ClubStats = ({ members, publications }: ClubStatsProps) => {
  return (
    <View style={styles.statsRow}>
      {/* 🔥 CLICK EN MIEMBROS */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/club-members')}
      >
        <StatItem value={members} label="MIEMBROS" />
      </TouchableOpacity>

      {/* PUBLICACIONES (sin acción por ahora) */}
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
    borderColor: 'rgba(195,198,210,0.2)',
  },

  statItem: {
    alignItems: 'center',
  },

  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#192A56',
    lineHeight: 24,
    marginBottom: 2,
    textAlign: 'center',
  },

  statLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: 'rgba(67,71,81,0.7)',
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
    textAlign: 'center',
  },
});
