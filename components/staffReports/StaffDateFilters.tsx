import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, typography } from '@/constants/theme';
import { DATE_FILTERS, type DateFilter } from '@/utils/complaints';

type StaffDateFiltersProps = {
  selected: DateFilter;
  onChange: (filter: DateFilter) => void;
};

export function StaffDateFilters({
  selected,
  onChange,
}: StaffDateFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroller}
      contentContainerStyle={styles.content}
    >
      {DATE_FILTERS.map((item) => {
        const isActive = selected === item.key;

        return (
          <Pressable
            key={item.key}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChange(item.key);
            }}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroller: {
    flexGrow: 0,
    height: 58,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
    alignItems: 'center',
  },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.whiteTransparent90,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  chipActive: {
    backgroundColor: colors.bluePrimary,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray950,
  },
  labelActive: {
    color: colors.white,
    fontFamily: typography.fontFamily.interBold,
  },
});
