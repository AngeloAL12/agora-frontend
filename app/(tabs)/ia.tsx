import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  FLOATING_TAB_BAR_BOTTOM_OFFSET,
  FLOATING_TAB_BAR_HEIGHT,
} from '@/components/FloatingTabBar';

import { ScreenHeader } from '@/components/ScreenHeader';
import { ChatBubble } from '@/components/ia/ChatBubble';
import { ChatInput } from '@/components/ia/ChatInput';
import { SuggestedQuestionsSection } from '@/components/ia/SuggestedQuestionsSection';
import { TypingIndicator } from '@/components/ia/TypingIndicator';
import { WelcomeSection } from '@/components/ia/WelcomeSection';
import { colors, typography } from '@/constants/theme';
import { useChat } from '@/hooks/useChat';

const SUGGESTED_QUESTIONS = [
  { id: '1', text: '¿Cómo encuentro el edificio E?' },
  { id: '2', text: 'Ayudame a redactar una descripción para mi queja' },
];

// Mensaje de bienvenida estático — se renderiza directamente, nunca viaja a la API
const WELCOME_MESSAGE =
  '¡Hola! Soy el asistente virtual del ITM Mexicali. Estoy aquí para ayudarte con información sobre tu institución. ¿En qué puedo ayudarte hoy?';

// ---

export default function IaScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

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

  const scrollToEnd = useCallback(() => {
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      100,

      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      100,
    );
  }, []);

  // Fix #2 — keyboard events cross-platform
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

  // Scroll al fondo cuando llegan mensajes nuevos o cambia isLoading
  useEffect(() => {
    if (isAtBottom) scrollToEnd();
  }, [messages.length, isLoading, isAtBottom, scrollToEnd]);

  const inputBottomPadding = keyboardVisible
    ? 16
    : insets.bottom +
      FLOATING_TAB_BAR_BOTTOM_OFFSET +
      FLOATING_TAB_BAR_HEIGHT +
      9;

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    setIsAtBottom(isCloseToBottom);
  };

  const handleSendAndScroll = () => {
    handleSend();
    scrollToEnd();
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar backgroundColor={colors.bluePrimary} style="light" />

      <ScreenHeader title="Búfalo IA" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <WelcomeSection />

          <SuggestedQuestionsSection
            questions={SUGGESTED_QUESTIONS}
            onQuestionPress={handleSuggestedQuestion}
          />

          <View style={styles.chatSection}>
            {/* Mensaje de bienvenida estático — nunca se envía a la API */}
            <ChatBubble sender="assistant" message={WELCOME_MESSAGE} />

            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                sender={msg.sender}
                message={msg.text}
                timestamp={msg.timestamp}
              />
            ))}

            {/* Indicador de "pensando" */}
            {isLoading && <TypingIndicator />}

            {/* Error inline */}
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
          style={[styles.inputContainer, { paddingBottom: inputBottomPadding }]}
        >
          <ChatInput
            value={input}
            onChangeText={setInput}
            onSend={handleSendAndScroll}
            onAttach={() =>
              Alert.alert(
                'Próximamente',
                'La función de adjuntar archivos estará disponible pronto.',
                [{ text: 'Entendido', style: 'cancel' }],
              )
            }
          />
        </View>
      </KeyboardAvoidingView>
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
    left: 0,
    right: 0,
  },
});
