import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { theme } from '../constants/theme';

export const Input = (props: TextInputProps) => {
  return (
    <TextInput
      style={styles.input}
      placeholderTextColor={theme.colors.gray700}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray700,
    borderRadius: 8,
    padding: 12,
    fontFamily: theme.typography.fontFamily.interRegular,
    color: theme.colors.black,
  },
});
