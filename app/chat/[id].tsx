import { StatusBar } from 'expo-status-bar';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import CustomLoadingScreen from '@/components/CustomLoadingScreen';

import { ScreenHeader } from '@/components/ScreenHeader';
import SuccessBottomSheet from '@/components/SuccessBottomSheet';
import MessageActionsSheet from '@/components/contentSafety/MessageActionsSheet';
import ReportContentSheet from '@/components/contentSafety/ReportContentSheet';
import { ChatBubble } from '@/components/ia/ChatBubble';
import { ChatInput } from '@/components/ia/ChatInput';
import { TypingIndicator } from '@/components/ia/TypingIndicator';
import { colors, typography } from '@/constants/theme';
import { useClubChat } from '@/hooks/useClubChat';
import { useAuth } from '@/context/AuthContext';
import type { ClubMessage } from '@/hooks/useClubChat';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ClubChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const resolvedId = Array.isArray(id) ? id[0] : (id ?? '');
  const chatName = Array.isArray(name) ? name[0] : (name ?? 'Chat');

  const {
    messages,
    input,
    setInput,
    isLoading,
    isLoadingMore,
    hasMore,
    isSending,
    chatError,
    handleSend,
    loadMoreMessages,
    clearError,
    hideReportedMessage,
  } = useClubChat(resolvedId);

  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [chatInputHeight, setChatInputHeight] = useState(58);
  const initialScrollDoneRef = useRef(false);
  const reportSheetRef = useRef<BottomSheetModal>(null);
  const messageActionsSheetRef = useRef<BottomSheetModal>(null);
  const reportSuccessSheetRef = useRef<BottomSheetModal>(null);
  const [selectedMessage, setSelectedMessage] = useState<ClubMessage | null>(
    null,
  );
  const [actionMessage, setActionMessage] = useState<ClubMessage | null>(null);
  const [reportSuccessMessage, setReportSuccessMessage] = useState('');

  const openMessageActions = useCallback((message: ClubMessage) => {
    setActionMessage(message);
    void Haptics.selectionAsync();
    requestAnimationFrame(() => messageActionsSheetRef.current?.present());
  }, []);

  const startMessageReport = useCallback(() => {
    if (!actionMessage) return;
    setSelectedMessage(actionMessage);
    messageActionsSheetRef.current?.dismiss();
    setTimeout(() => reportSheetRef.current?.present(), 250);
  }, [actionMessage]);

  const handleMessageReported = useCallback(
    (blocked: boolean) => {
      if (!selectedMessage) return;
      hideReportedMessage(
        selectedMessage.id,
        selectedMessage.senderId,
        blocked,
      );
      setReportSuccessMessage(
        blocked
          ? `El mensaje fue denunciado y bloqueaste a ${selectedMessage.senderName}.`
          : 'El mensaje fue denunciado y ya no aparecerá para ti.',
      );
      setTimeout(() => reportSuccessSheetRef.current?.present(), 250);
    },
    [hideReportedMessage, selectedMessage],
  );

  const scrollToEnd = useCallback((animated = true) => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated }), 100);
  }, []);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
      if (isAtBottom) scrollToEnd();
    });
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setKeyboardVisible(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [isAtBottom, scrollToEnd]);

  useEffect(() => {
    if (messages.length === 0) return;
    if (!initialScrollDoneRef.current) {
      initialScrollDoneRef.current = true;
      scrollToEnd(false);
      return;
    }
    if (isAtBottom) scrollToEnd();
  }, [messages.length, isSending, isAtBottom, scrollToEnd]);

  const keyboard = useAnimatedKeyboard();

  const animatedKeyboardStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: Math.max(keyboard.height.value + 16, insets.bottom + 16),
    };
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    if (isCloseToBottom !== isAtBottom) setIsAtBottom(isCloseToBottom);
    if (contentOffset.y <= 50 && hasMore && !isLoadingMore) {
      loadMoreMessages();
    }
  };

  const inputBottomPadding = keyboardVisible ? 16 : insets.bottom + 16;

  const backAction = (
    <Pressable
      onPress={() => router.push('/(tabs)/messages')}
      style={styles.backButton}
      accessibilityRole="button"
      accessibilityLabel="Volver a Mensajes"
    >
      <Ionicons name="arrow-back" size={24} color={colors.white} />
    </Pressable>
  );

  // const moreAction = (
  //   <Pressable style={styles.moreButton} accessibilityRole="button">
  //     <Ionicons name="ellipsis-vertical" size={22} color={colors.white} />
  //   </Pressable>
  // );

  if (isLoading) {
    return <CustomLoadingScreen message="Cargando chat..." />;
  }

  const renderContent = (paddingBottom: number) => (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: chatInputHeight + paddingBottom + 12 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.chatSection}>
          {isLoadingMore && (
            <ActivityIndicator
              size="small"
              color={colors.bluePrimary}
              style={styles.loadingMore}
            />
          )}
          {messages.some((message) => !message.isMe) ? (
            <View style={styles.gestureHint}>
              <Ionicons
                name="hand-left-outline"
                size={14}
                color={colors.activityGray}
              />
              <Text style={styles.gestureHintText}>
                Mantén presionado un mensaje para ver opciones
              </Text>
            </View>
          ) : null}
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              sender={msg.isMe ? 'user' : 'assistant'}
              message={msg.text}
              timestamp={msg.timestamp}
              senderName={msg.isMe ? 'Tú' : msg.senderName}
              senderAvatar={msg.isMe ? undefined : (msg.senderAvatar ?? null)}
              onMessageLongPress={
                msg.isMe ? undefined : () => openMessageActions(msg)
              }
            />
          ))}

          {isSending && <TypingIndicator />}

          {chatError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {chatError}</Text>
              <Pressable
                onPress={clearError}
                style={({ pressed }) => [
                  styles.errorDismiss,
                  pressed && { opacity: 0.7 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Cerrar error"
              >
                <Text style={styles.errorDismissText}>Cerrar</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.inputContainer,
          { position: 'absolute', bottom: paddingBottom, left: 0, right: 0 },
        ]}
        onLayout={(e) => setChatInputHeight(e.nativeEvent.layout.height)}
      >
        <ChatInput
          value={input}
          onChangeText={setInput}
          onSend={handleSend}
          placeholder="Enviar mensaje..."
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar backgroundColor={colors.bluePrimary} style="light" />

      <ScreenHeader
        title={chatName}
        align="center"
        leftAction={backAction}
        // rightAction={moreAction}
        titleStyle={{ fontSize: 24 }}
      />

      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          style={styles.keyboardAvoiding}
          behavior="padding"
          keyboardVerticalOffset={0}
        >
          {renderContent(inputBottomPadding)}
        </KeyboardAvoidingView>
      ) : (
        <Animated.View style={[styles.keyboardAvoiding, animatedKeyboardStyle]}>
          {renderContent(0)}
        </Animated.View>
      )}

      {actionMessage ? (
        <MessageActionsSheet
          ref={messageActionsSheetRef}
          authorName={actionMessage.senderName}
          onReport={startMessageReport}
          onCancel={() => messageActionsSheetRef.current?.dismiss()}
          onDismiss={() => setActionMessage(null)}
        />
      ) : null}

      {selectedMessage ? (
        <ReportContentSheet
          ref={reportSheetRef}
          targetType="MESSAGE"
          targetId={Number(selectedMessage.id)}
          authorId={Number(selectedMessage.senderId)}
          authorName={selectedMessage.senderName}
          token={token ?? ''}
          onSubmitted={handleMessageReported}
          onDismiss={() => setSelectedMessage(null)}
        />
      ) : null}

      <SuccessBottomSheet
        ref={reportSuccessSheetRef}
        title="Gracias por avisarnos"
        message={reportSuccessMessage}
        primaryLabel="Entendido"
        secondaryLabel=""
        onPrimaryPress={() => {
          reportSuccessSheetRef.current?.dismiss();
          setSelectedMessage(null);
        }}
        onDismiss={() => setSelectedMessage(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  chatSection: {
    paddingVertical: 8,
    gap: 8,
  },
  loadingMore: {
    marginBottom: 8,
  },
  gestureHint: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginBottom: 4,
    backgroundColor: colors.gray100,
  },
  gestureHintText: {
    fontSize: 10,
    color: colors.activityGray,
    fontFamily: typography.fontFamily.interMedium,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(211, 47, 47, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(211, 47, 47, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 4,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: typography.fontFamily.interMedium,
    color: colors.error,
    lineHeight: 18,
  },
  errorDismiss: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  errorDismissText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.error,
  },
  inputContainer: {
    zIndex: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
