import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
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

import { NotificationsModal } from '@/components/NotificationsModal';
import SuccessBottomSheet from '@/components/SuccessBottomSheet';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ChatBubble } from '@/components/ia/ChatBubble';
import { ChatInput } from '@/components/ia/ChatInput';
import { SuggestedQuestionsSection } from '@/components/ia/SuggestedQuestionsSection';
import { TypingIndicator } from '@/components/ia/TypingIndicator';
import { WelcomeSection } from '@/components/ia/WelcomeSection';
import { colors, typography } from '@/constants/theme';
import { useNotificationsContext } from '@/context/NotificationsContext';
import { useChat } from '@/hooks/useChat';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SUGGESTED_QUESTIONS = [
  { id: '1', text: '¿Cómo encuentro el edificio E?' },
  { id: '2', text: 'Ayudame a redactar una descripción para mi queja' },
];

const WELCOME_MESSAGE =
  '¡Hola! Soy el asistente virtual del ITM Mexicali. Estoy aquí para ayudarte con información sobre tu institución. ¿En qué puedo ayudarte hoy?';

export default function IaChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [chatInputHeight, setChatInputHeight] = useState(58);
  const comingSoonSheetRef = useRef<BottomSheetModal>(null);

  const {
    messages,
    input,
    setInput,
    isLoading,
    chatError,
    handleSend,
    handleSuggestedQuestion,
    clearError,
  } = useChat();
  const {
    notifications,
    loading: notificationsLoading,
    markRead,
  } = useNotificationsContext();

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
  }, [messages.length, isLoading, isAtBottom, scrollToEnd]);

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
        <View style={styles.welcomeContainer}>
          <WelcomeSection />
        </View>

        <View style={styles.springSpacer} />

        <SuggestedQuestionsSection
          questions={SUGGESTED_QUESTIONS}
          onQuestionPress={handleSuggestedQuestion}
          visible={messages.length === 0}
        />

        <View style={styles.chatSection}>
          <ChatBubble sender="assistant" message={WELCOME_MESSAGE} />

          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              sender={msg.sender}
              message={msg.text}
              timestamp={msg.timestamp}
            />
          ))}

          {isLoading && <TypingIndicator />}

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
          onSend={() => handleSend()}
          onAttach={() => comingSoonSheetRef.current?.present()}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar backgroundColor={colors.bluePrimary} style="light" />

      <ScreenHeader
        title="Búfalo IA"
        align="left"
        leftAction={backAction}
        showNotificationBell
        onNotificationPress={() => setNotificationsVisible(true)}
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

      <NotificationsModal
        visible={notificationsVisible}
        onDismiss={() => setNotificationsVisible(false)}
        notifications={notifications}
        loading={notificationsLoading}
        onNotificationPress={markRead}
      />

      <SuccessBottomSheet
        ref={comingSoonSheetRef}
        title="Próximamente"
        message="La función de adjuntar archivos estará disponible pronto."
        variant="success"
        primaryLabel="Entendido"
        secondaryLabel=""
        onPrimaryPress={() => comingSoonSheetRef.current?.dismiss()}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  welcomeContainer: {
    marginTop: 0,
  },
  springSpacer: {
    flex: 1,
    minHeight: 40,
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
