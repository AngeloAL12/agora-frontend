import { colors, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

interface SearchInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  withShadow?: boolean;
}

export const SearchInput = ({
  containerStyle,
  withShadow = true,
  ...props
}: SearchInputProps) => {
  return (
    <View
      style={[styles.container, withShadow && styles.shadow, containerStyle]}
    >
      <Ionicons
        name="search"
        size={18}
        color={colors.gray700}
        style={styles.icon}
      />
      <TextInput
        {...props}
        style={[styles.input, props.style]}
        placeholderTextColor={props.placeholderTextColor ?? colors.gray700}
        autoCorrect={props.autoCorrect ?? false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray950,
  },
});
