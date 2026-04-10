import { colors, typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AssistantMessageProps {
  message: string;
  timestamp?: string;
}

export const AssistantMessage = ({
  message,
  timestamp,
}: AssistantMessageProps) => {
  return (
    <View style={styles.wrapper}>
      {/* Bubble */}
      <View style={styles.bubble}>
        <Text style={styles.messageText}>{message}</Text>
      </View>

      {/* Timestamp */}
      {timestamp ? (
        <View style={styles.timestampContainer}>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
    gap: 4,
    paddingVertical: 8,
  },
  bubble: {
    backgroundColor: colors.white,
    borderRadius: 12,
    // Square top-left corner (assistant side)
    borderTopLeftRadius: 0,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  messageText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray950,
    lineHeight: 22,
  },
  timestampContainer: {
    paddingHorizontal: 4,
  },
  timestamp: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interMedium,
    color: colors.gray700,
    lineHeight: 15,
  },
});
