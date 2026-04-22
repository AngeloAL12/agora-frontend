import { colors, typography } from '@/constants/theme';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type ChatFilter = 'all' | 'unread';

interface FilterChipsProps {
  activeFilter: ChatFilter;
  onFilterChange: (filter: ChatFilter) => void;
}

interface ChipConfig {
  key: ChatFilter;
  label: string;
}

const CHIPS: ChipConfig[] = [
  { key: 'all', label: 'Todos' },
  { key: 'unread', label: 'No leídos' },
];

export const FilterChips = ({
  activeFilter,
  onFilterChange,
}: FilterChipsProps) => {
  return (
    <View style={styles.row}>
      {CHIPS.map((chip) => {
        const isActive = chip.key === activeFilter;
        return (
          <Pressable
            key={chip.key}
            style={({ pressed }) => [
              styles.chip,
              isActive ? styles.chipActive : styles.chipInactive,
              pressed && styles.chipPressed,
            ]}
            onPress={() => onFilterChange(chip.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={chip.label}
          >
            <Text
              style={[
                styles.chipText,
                isActive ? styles.chipTextActive : styles.chipTextInactive,
              ]}
            >
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  chipActive: {
    backgroundColor: colors.bluePrimary,
  },
  chipInactive: {
    backgroundColor: colors.whiteTransparent90,
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipText: {
    fontSize: 12,
  },
  chipTextActive: {
    fontFamily: typography.fontFamily.interBold,
    color: colors.white,
  },
  chipTextInactive: {
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray950,
  },
});
