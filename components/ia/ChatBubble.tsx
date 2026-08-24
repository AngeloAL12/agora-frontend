import { colors, typography } from '@/constants/theme';
import { Image } from 'expo-image';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface ChatBubbleProps {
  sender: 'assistant' | 'user';
  message: string;
  timestamp?: string;
  senderName?: string;
  senderAvatar?: string | null;
  onMessageLongPress?: () => void;
}

function AvatarCircle({
  name,
  avatarUrl,
}: {
  name?: string;
  avatarUrl?: string | null;
}) {
  const initials = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <View style={styles.avatarCircle}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatarImage}
          contentFit="cover"
        />
      ) : (
        <Text style={styles.avatarInitials}>{initials}</Text>
      )}
    </View>
  );
}

export const ChatBubble = React.memo(function ChatBubble({
  sender,
  message,
  timestamp,
  senderName,
  senderAvatar,
  onMessageLongPress,
}: ChatBubbleProps) {
  const isAssistant = sender === 'assistant';

  const hasAvatar = !!(senderName || senderAvatar);

  if (isAssistant) {
    return (
      <View style={styles.rowAssistant}>
        {hasAvatar && (
          <AvatarCircle name={senderName} avatarUrl={senderAvatar} />
        )}
        <View style={styles.wrapperAssistant}>
          {senderName ? (
            <Text style={styles.senderNameAssistant}>{senderName}</Text>
          ) : null}
          <Pressable
            disabled={!onMessageLongPress}
            delayLongPress={350}
            onLongPress={onMessageLongPress}
            accessible={Boolean(onMessageLongPress)}
            accessibilityRole={onMessageLongPress ? 'button' : undefined}
            accessibilityLabel={`Mensaje de ${senderName ?? 'usuario'}: ${message}`}
            accessibilityHint={
              onMessageLongPress
                ? 'Mantén presionado para ver opciones del mensaje'
                : undefined
            }
            accessibilityActions={
              onMessageLongPress
                ? [{ name: 'activate', label: 'Abrir opciones del mensaje' }]
                : undefined
            }
            onAccessibilityAction={(event) => {
              if (event.nativeEvent.actionName === 'activate') {
                onMessageLongPress?.();
              }
            }}
            style={({ pressed }) => [
              styles.bubble,
              styles.bubbleAssistant,
              pressed && onMessageLongPress && styles.bubblePressed,
            ]}
          >
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
          </Pressable>
          {timestamp ? <Text style={styles.timestamp}>{timestamp}</Text> : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapperUser}>
      {senderName ? (
        <Text style={styles.senderNameUser}>{senderName}</Text>
      ) : null}
      <View style={[styles.bubble, styles.bubbleUser]}>
        <Text style={[styles.messageText, styles.textUser]}>{message}</Text>
      </View>
      {timestamp ? (
        <Text style={[styles.timestamp, styles.timestampUser]}>
          {timestamp}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  rowAssistant: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '85%',
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E3E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 18,
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarInitials: {
    fontSize: 13,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.blueSecondary,
  },
  wrapperAssistant: {
    flexShrink: 1,
    gap: 4,
    alignItems: 'flex-start',
  },
  wrapperUser: {
    maxWidth: '80%',
    alignSelf: 'flex-end',
    gap: 4,
    paddingVertical: 4,
  },
  senderNameAssistant: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interSemiBold,
    color: '#003172',
    opacity: 0.6,
    paddingHorizontal: 4,
    paddingBottom: 2,
  },
  senderNameUser: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interSemiBold,
    color: '#94a3b8',
    alignSelf: 'flex-end',
    paddingHorizontal: 4,
    paddingBottom: 2,
  },
  bubble: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    elevation: 2,
  },
  bubbleAssistant: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 0,
    shadowColor: '#003172',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(224,227,230,0.2)',
  },
  bubbleUser: {
    backgroundColor: colors.bluePrimary,
    borderTopRightRadius: 0,
    shadowColor: '#003172',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  bubblePressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },
  messageText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    lineHeight: 22,
  },
  textUser: {
    color: colors.white,
  },
  timestamp: {
    fontSize: 9,
    fontFamily: typography.fontFamily.interMedium,
    color: '#94a3b8',
    paddingHorizontal: 4,
  },
  timestampUser: {
    alignSelf: 'flex-end',
  },
});
