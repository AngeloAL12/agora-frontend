import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/constants/theme';
import { getComplaintStatusMeta } from '@/utils/complaints';

type StaffReportCardProps = {
  folio: string;
  type?: string;
  title: string;
  description?: string;
  date: string;
  status?: string;
  onPress: () => void;
};

export function StaffReportCard({
  folio,
  type,
  title,
  description,
  date,
  status,
  onPress,
}: StaffReportCardProps) {
  const statusMeta = getComplaintStatusMeta(status);
  const label = type === 'SUGGESTION' ? 'Sugerencia' : `Folio #${folio}`;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.headingCopy}>
          <Text style={styles.folio}>{label}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>

        {type !== 'SUGGESTION' && (
          <View style={[styles.badge, { backgroundColor: statusMeta.bg }]}>
            <Text style={[styles.badgeText, { color: statusMeta.text }]}>
              {statusMeta.label}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {description || 'Sin descripcion detallada por ahora.'}
      </Text>

      <View style={styles.footer}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-clear-outline" size={14} color="#9AA0A6" />
          <Text style={styles.date}>{date}</Text>
        </View>

        <View style={styles.manageButton}>
          <Text style={styles.manageText}>Gestionar</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.blueSecondary}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 21,
    gap: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headingCopy: {
    flex: 1,
    gap: 4,
  },
  folio: {
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.blueSecondary,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  title: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.gray950,
    fontFamily: typography.fontFamily.manropeBold,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(67,71,81,0.6)',
    fontFamily: typography.fontFamily.interMedium,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  manageText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.blueSecondary,
    fontFamily: typography.fontFamily.interBold,
  },
});
