import { colors, typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ChatBubbleProps {
  sender: 'assistant' | 'user';
  message: string;
  timestamp?: string;
}

export const ChatBubble = ({ sender, message, timestamp }: ChatBubbleProps) => {
  const isAssistant = sender === 'assistant';

  return (
    <View
      style={[
        styles.wrapper,
        isAssistant ? styles.wrapperAssistant : styles.wrapperUser,
      ]}
    >
      {/* Bubble */}
      <View
        style={[
          styles.bubble,
          isAssistant ? styles.bubbleAssistant : styles.bubbleUser,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isAssistant ? styles.textAssistant : styles.textUser,
          ]}
        >
          {message}
        </Text>
      </View>

      {/* Timestamp */}
      {timestamp ? (
        <View
          style={[
            styles.timestampContainer,
            !isAssistant && styles.timestampContainerUser,
          ]}
        >
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    maxWidth: '80%',
    gap: 4,
    paddingVertical: 8,
  },
  wrapperAssistant: {
    alignSelf: 'flex-start',
  },
  wrapperUser: {
    alignSelf: 'flex-end',
  },
  bubble: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 2,
  },
  bubbleAssistant: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 0,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  bubbleUser: {
    backgroundColor: colors.bluePrimary,
    borderTopRightRadius: 0,
    shadowColor: colors.bluePrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  messageText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    lineHeight: 22,
  },
  textAssistant: {
    color: colors.gray950,
  },
  textUser: {
    color: colors.white,
  },
  timestampContainer: {
    paddingHorizontal: 4,
  },
  timestampContainerUser: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interMedium,
    color: colors.gray700,
    lineHeight: 15,
  },
});
