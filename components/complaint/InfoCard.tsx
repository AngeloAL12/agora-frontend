import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getCategoryLabel } from '@/constants/complaint';
import { colors, typography } from '@/constants/theme';
import type { ComplaintDetail } from '@/hooks/useComplaintDetail';

type InfoCardProps = {
  complaint: ComplaintDetail;
};

export function InfoCard({ complaint }: InfoCardProps) {
  const isSuggestion = complaint.type === 'SUGGESTION';
  const categoryStr = getCategoryLabel(complaint.category);

  return (
    <View style={styles.card}>
      {!isSuggestion && complaint.id_building !== null && (
        <View style={styles.infoRow}>
          <Text style={styles.cardLabel}>Ubicacion</Text>
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={colors.bluePrimary}
              style={styles.locationIcon}
            />
            <Text style={styles.infoText}>
              Edificio {complaint.id_building}
              {complaint.classroom
                ? `, Aula ${complaint.classroom}`
                : ', area exterior'}
            </Text>
          </View>
        </View>
      )}

      <View
        style={[
          styles.infoRow,
          !isSuggestion && complaint.id_building !== null && styles.infoRowGap,
        ]}
      >
        <Text style={styles.cardLabel}>Categoria</Text>
        <Text style={styles.infoText}>{categoryStr}</Text>
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
  cardLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: typography.fontFamily.interBold,
    color: colors.activityGray,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'column',
  },
  infoRowGap: {
    marginTop: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -2,
    marginTop: 4,
  },
  locationIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 16,
    color: colors.gray950,
    lineHeight: 26,
    fontFamily: typography.fontFamily.interRegular,
  },
});
