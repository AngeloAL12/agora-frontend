import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';

import { colors, typography } from '@/constants/theme';
import { getComplaintStatusMeta } from '@/utils/complaints';

interface ReportCardProps {
  folio: string;
  type?: string;
  title: string;
  description: string;
  date: string;
  status: string;
  onPress?: () => void;
}

export const ReportCard = ({
  folio,
  type,
  title,
  description,
  date,
  status,
  onPress,
}: ReportCardProps) => {
  const statusMeta = getComplaintStatusMeta(status);
  const isSuggestion = type === 'SUGGESTION';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.folio}>
          {isSuggestion ? 'Sugerencia' : `FOLIO #${folio}`}
        </Text>
        {!isSuggestion && (
          <View style={[styles.badge, { backgroundColor: statusMeta.bg }]}>
            <Text style={[styles.badgeText, { color: statusMeta.text }]}>
              {statusMeta.label}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>

      <View style={styles.footer}>
        <Ionicons
          name="calendar-clear-outline"
          size={15}
          color={colors.gray700}
        />
        <Text style={styles.date}>{date}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(195, 198, 210, 0.1)',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  folio: {
    color: colors.blueSecondary,
    fontFamily: typography.fontFamily.interBold,
    fontSize: 12,
  },
  badge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.interBold,
  },
  title: {
    fontSize: 18,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  description: {
    color: colors.gray700,
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
    fontFamily: typography.fontFamily.interRegular,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    color: colors.gray700,
    fontSize: 12,
    fontFamily: typography.fontFamily.interRegular,
  },
});
