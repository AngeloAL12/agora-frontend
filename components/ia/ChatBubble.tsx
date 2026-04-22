import { colors, typography } from '@/constants/theme';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface ChatBubbleProps {
  sender: 'assistant' | 'user';
  message: string;
  timestamp?: string;
  senderName?: string;
}

export const ChatBubble = React.memo(function ChatBubble({
  sender,
  message,
  timestamp,
  senderName,
}: ChatBubbleProps) {
  const isAssistant = sender === 'assistant';

  return (
    <View
      style={[
        styles.wrapper,
        isAssistant ? styles.wrapperAssistant : styles.wrapperUser,
      ]}
    >
      {!isAssistant && senderName ? (
        <Text style={styles.senderName}>{senderName}</Text>
      ) : null}

      {/* Bubble */}
      <View
        style={[
          styles.bubble,
          isAssistant ? styles.bubbleAssistant : styles.bubbleUser,
        ]}
      >
        {isAssistant ? (
          <Markdown
            style={{
              body: {
                fontSize: 14,
                fontFamily: typography.fontFamily.interRegular,
                lineHeight: 22,
                color: colors.gray950,
              },
              paragraph: {
                marginTop: 0,
                marginBottom: 8,
              },
              list_item: {
                marginTop: 0,
                marginBottom: 4,
              },
              strong: {
                fontFamily: typography.fontFamily.interBold,
                fontWeight: 'normal',
              },
              em: {
                fontFamily: typography.fontFamily.interRegular,
                fontStyle: 'italic',
              },
              heading1: {
                fontFamily: typography.fontFamily.interBold,
                fontSize: 20,
                marginTop: 8,
                marginBottom: 8,
              },
              heading2: {
                fontFamily: typography.fontFamily.interSemiBold,
                fontSize: 18,
                marginTop: 8,
                marginBottom: 8,
              },
              heading3: {
                fontFamily: typography.fontFamily.interSemiBold,
                fontSize: 16,
                marginTop: 8,
                marginBottom: 8,
              },
              code_inline: {
                fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                color: colors.gray950,
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2,
                overflow: 'hidden',
                fontSize: 13.5,
              },
              code_block: {
                fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                backgroundColor: colors.gray100,
                color: colors.gray900,
                borderRadius: 8,
                padding: 12,
                marginTop: 8,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
                overflow: 'hidden',
              },
              fence: {
                fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                backgroundColor: colors.gray100,
                color: colors.gray900,
                borderRadius: 8,
                padding: 12,
                marginTop: 8,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
                overflow: 'hidden',
              },
              u: {
                textDecorationLine: 'underline',
              },
            }}
          >
            {message}
          </Markdown>
        ) : (
          <Text style={[styles.messageText, styles.textUser]}>{message}</Text>
        )}
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
});

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
  senderName: {
    fontSize: 11,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray700,
    marginBottom: 2,
    paddingHorizontal: 4,
  },
});
