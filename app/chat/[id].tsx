import { StatusBar } from 'expo-status-bar';
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

import { ScreenHeader } from '@/components/ScreenHeader';
import { ChatBubble } from '@/components/ia/ChatBubble';
import { ChatInput } from '@/components/ia/ChatInput';
import { TypingIndicator } from '@/components/ia/TypingIndicator';
import { colors, typography } from '@/constants/theme';
import { useClubChat } from '@/hooks/useClubChat';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ClubChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const resolvedId = Array.isArray(id) ? id[0] : (id ?? '');
  const chatName = Array.isArray(name) ? name[0] : (name ?? 'Chat');

  const {
    messages,
    input,
    setInput,
    isLoading,
    isSending,
    chatError,
    handleSend,
    clearError,
  } = useClubChat(resolvedId);

  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [chatInputHeight, setChatInputHeight] = useState(58);

  const scrollToEnd = useCallback(() => {
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      100,
    );
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
  };

  const inputBottomPadding = keyboardVisible ? 16 : insets.bottom + 16;

  const backAction = (
    <Pressable
      onPress={() => router.push('/(tabs)/messages')}
      style={styles.backButton}
      accessibilityRole="button"
      accessibilityLabel="Volver a Mensajes"
    >
      <Ionicons name="chevron-back" size={24} color={colors.white} />
    </Pressable>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <StatusBar backgroundColor={colors.bluePrimary} style="light" />
        <ScreenHeader title={chatName} align="left" leftAction={backAction} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.bluePrimary} />
        </View>
      </SafeAreaView>
    );
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
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              sender={msg.isMe ? 'user' : 'assistant'}
              message={msg.text}
              timestamp={msg.timestamp}
              senderName={msg.isMe ? undefined : msg.senderName}
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

      <ScreenHeader title={chatName} align="left" leftAction={backAction} />

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
});
