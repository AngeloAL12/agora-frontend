import { Pressable, StyleSheet, Text } from 'react-native';

interface CategoryChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function CategoryChip({
  label,
  selected,
  onPress,
}: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, selected && styles.containerSelected]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#E9EDF2',
  },
  containerSelected: {
    backgroundColor: '#F3C400',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3E4650',
    flexShrink: 1,
  },
  labelSelected: {
    color: '#1E1E1E',
  },
});
