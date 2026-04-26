import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
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

import {
  FLOATING_TAB_BAR_BOTTOM_OFFSET,
  FLOATING_TAB_BAR_HEIGHT,
} from '@/components/FloatingTabBar';

import { NotificationsModal } from '@/components/NotificationsModal';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ChatBubble } from '@/components/ia/ChatBubble';
import { ChatInput } from '@/components/ia/ChatInput';
import { SuggestedQuestionsSection } from '@/components/ia/SuggestedQuestionsSection';
import { TypingIndicator } from '@/components/ia/TypingIndicator';
import { WelcomeSection } from '@/components/ia/WelcomeSection';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/hooks/useChat';
import { useNotifications } from '@/hooks/useNotifications';

const SUGGESTED_QUESTIONS = [
  { id: '1', text: '¿Cómo encuentro el edificio E?' },
  { id: '2', text: 'Ayudame a redactar una descripción para mi queja' },
];

const WELCOME_MESSAGE =
  '¡Hola! Soy el asistente virtual del ITM Mexicali. Estoy aquí para ayudarte con información sobre tu institución. ¿En qué puedo ayudarte hoy?';

export default function IaScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  // Natural height of the ChatInput widget (no tab-bar padding, so it stays stable)
  const [chatInputHeight, setChatInputHeight] = useState(58);

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
  const { notifications, loading: notificationsLoading } = useNotifications(
    token,
    undefined,
    3,
  );

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
    const basePadding =
      insets.bottom +
      FLOATING_TAB_BAR_BOTTOM_OFFSET +
      FLOATING_TAB_BAR_HEIGHT +
      9;
    return {
      paddingBottom: Math.max(keyboard.height.value + 16, basePadding),
    };
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    if (isCloseToBottom !== isAtBottom) setIsAtBottom(isCloseToBottom);
  };

  const inputBottomPadding = keyboardVisible
    ? 16
    : insets.bottom +
      FLOATING_TAB_BAR_BOTTOM_OFFSET +
      FLOATING_TAB_BAR_HEIGHT +
      9;

  // spacerHeight (paddingBottom argument) keeps the input above the floating tab bar
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

      {/* Full-bleed absolute positioning: lets ScrollView pass entirely underneath */}
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
          onAttach={() =>
            Alert.alert(
              'Próximamente',
              'La función de adjuntar archivos estará disponible pronto.',
              [{ text: 'Entendido', style: 'cancel' }],
            )
          }
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
        showNotificationBell
        onNotificationPress={() => setNotificationsVisible(true)}
      />

      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          style={styles.keyboardAvoiding}
          behavior="padding"
          keyboardVerticalOffset={0}
        >
          {/* spacerHeight = inputBottomPadding so input clears the floating tab bar */}
          {renderContent(inputBottomPadding)}
        </KeyboardAvoidingView>
      ) : (
        <Animated.View style={[styles.keyboardAvoiding, animatedKeyboardStyle]}>
          {/* Android parent already adds paddingBottom, so spacer = 0 */}
          {renderContent(0)}
        </Animated.View>
      )}

      <NotificationsModal
        visible={notificationsVisible}
        onDismiss={() => setNotificationsVisible(false)}
        notifications={notifications}
        loading={notificationsLoading}
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
    // Mantiene su margen superior basado en paddingTop del padre,
    // pero puedes acomodarlo si quieres despegarlo aún más del header:
    // marginTop: 12,
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
});
