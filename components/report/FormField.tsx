import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

interface FormFieldProps extends TextInputProps {
  label: string;
  multiline?: boolean;
}

export default function FormField({
  label,
  multiline = false,
  style,
  ...props
}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        {...props}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        placeholderTextColor="#9BA3AE"
        style={[styles.input, multiline && styles.textArea, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#3E4650',
  },
  input: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#E9EDF2',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 110,
    paddingTop: 16,
  },
});
