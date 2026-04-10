import { colors, typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface UserMessageProps {
  message: string;
  timestamp?: string;
}

export const UserMessage = ({ message, timestamp }: UserMessageProps) => {
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
    alignSelf: 'flex-end',
    maxWidth: '80%',
    gap: 4,
    paddingVertical: 8,
  },
  bubble: {
    backgroundColor: colors.bluePrimary,
    borderRadius: 12,
    // Square top-right corner (user side)
    borderTopRightRadius: 0,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: colors.bluePrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.white,
    lineHeight: 22,
  },
  timestampContainer: {
    paddingHorizontal: 4,
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interMedium,
    color: colors.gray700,
    lineHeight: 15,
  },
});
