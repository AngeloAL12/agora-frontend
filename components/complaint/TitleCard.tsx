import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/constants/theme';
import type { ComplaintDetail } from '@/hooks/useComplaintDetail';
import { getComplaintStatusMeta } from '@/utils/complaints';

type TitleCardProps = {
  complaint: ComplaintDetail;
};

export function TitleCard({ complaint }: TitleCardProps) {
  const statusMeta = getComplaintStatusMeta(complaint.status);
  const formattedDate = new Date(complaint.created_at).toLocaleDateString(
    'es-MX',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardLabel}>Titulo</Text>
        <View style={[styles.badge, { backgroundColor: statusMeta.bg }]}>
          <Text style={[styles.badgeText, { color: statusMeta.text }]}>
            {statusMeta.label}
          </Text>
        </View>
      </View>
      <Text style={styles.title}>{complaint.title}</Text>
      <View style={styles.dateRow}>
        <Ionicons
          name="calendar-clear-outline"
          size={14}
          color={colors.gray700}
        />
        <Text style={styles.dateText}>Enviado: {formattedDate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: typography.fontFamily.interBold,
    color: colors.activityGray,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    color: colors.blueSecondary,
    marginBottom: 12,
    fontFamily: typography.fontFamily.manropeBold,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
});
