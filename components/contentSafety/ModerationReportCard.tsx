import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/constants/theme';
import { AdminContentReport } from '@/types/contentSafety';
import {
  CONTENT_REASON_LABELS,
  CONTENT_STATUS_META,
  CONTENT_TARGET_LABELS,
} from '@/utils/contentSafety';

interface ModerationReportCardProps {
  report: AdminContentReport;
  onPress: () => void;
}

export function ModerationReportCard({
  report,
  onPress,
}: ModerationReportCardProps) {
  const status = CONTENT_STATUS_META[report.status];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.78 }]}
    >
      <View style={styles.header}>
        <View style={styles.typeRow}>
          <View style={styles.iconWrap}>
            <Ionicons
              name={
                report.target_type === 'MESSAGE'
                  ? 'chatbubble-outline'
                  : report.target_type === 'COMMENT'
                    ? 'chatbox-ellipses-outline'
                    : 'newspaper-outline'
              }
              size={17}
              color={colors.bluePrimary}
            />
          </View>
          <View>
            <Text style={styles.eyebrow}>
              {CONTENT_TARGET_LABELS[report.target_type]} #{report.target_id}
            </Text>
            <Text style={styles.reason}>
              {CONTENT_REASON_LABELS[report.reason]}
            </Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: status.background }]}>
          <Text style={[styles.badgeText, { color: status.text }]}>
            {status.label}
          </Text>
        </View>
      </View>

      <View style={styles.snapshotWrap}>
        <Text style={styles.quoteMark}>“</Text>
        <Text style={styles.snapshot} numberOfLines={3}>
          {report.content_snapshot}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.userMeta}>
          <Ionicons
            name="person-outline"
            size={14}
            color={colors.activityGray}
          />
          <Text style={styles.metaText} numberOfLines={1}>
            {report.reported_user_name}
          </Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(report.created_at).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
          })}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={17}
          color={colors.blueSecondary}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.white,
    gap: 14,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  typeRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.activityGray,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  reason: {
    marginTop: 2,
    fontSize: 15,
    color: colors.gray950,
    fontFamily: typography.fontFamily.manropeBold,
  },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  snapshotWrap: {
    minHeight: 62,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: colors.gray100,
    flexDirection: 'row',
    gap: 5,
  },
  quoteMark: {
    marginTop: -4,
    fontSize: 24,
    color: colors.activityYellow,
    fontFamily: typography.fontFamily.manropeExtraBold,
  },
  snapshot: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userMeta: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: {
    flex: 1,
    fontSize: 11,
    color: colors.activityGray,
    fontFamily: typography.fontFamily.interMedium,
  },
  dateText: {
    fontSize: 10,
    color: colors.activityGray,
    fontFamily: typography.fontFamily.interRegular,
  },
});
