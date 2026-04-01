import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SegmentedOption } from '../../types/report';

interface SegmentedControlProps {
  options: SegmentedOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export default function SegmentedControl({
  options,
  selectedValue,
  onChange,
}: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = option.value === selectedValue;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.option, isSelected && styles.optionSelected]}
          >
            <Text
              style={[
                styles.optionText,
                isSelected && styles.optionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 22,
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#EEF1F5',
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  optionSelected: {
    backgroundColor: '#FFFFFF',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3E4650',
  },
  optionTextSelected: {
    fontWeight: '700',
    color: '#163D79',
  },
});
