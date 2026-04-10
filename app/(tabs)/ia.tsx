import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { AssistantMessage } from '@/components/ia/AssistantMessage';
import { ChatInput } from '@/components/ia/ChatInput';
import { UserMessage } from '@/components/ia/UserMessage';
import { SuggestedQuestionsSection } from '@/components/ia/SuggestedQuestionsSection';
import { WelcomeSection } from '@/components/ia/WelcomeSection';
import { colors } from '@/constants/theme';

const SUGGESTED_QUESTIONS = [
  { id: '1', text: '¿Cómo encuentro el edificio E?' },
  { id: '2', text: 'Ayudame a redactar una descripción para mi queja' },
];

const WELCOME_MESSAGE =
  '¡Hola! Soy el asistente virtual del ITM Mexicali. Estoy aquí para ayudarte con información sobre tu institución. ¿En qué puedo ayudarte hoy?';

// ---

interface Message {
  id: string;
  text: string;
  sender: 'assistant' | 'user';
  timestamp: string;
}

const formatTimestamp = (): string => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'pm' : 'am';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
};

export default function IaScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: WELCOME_MESSAGE,
      sender: 'assistant',
      timestamp: formatTimestamp(),
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: formatTimestamp(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSuggestedQuestion = (text: string) => {
    setInput(text);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
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
        >
          <WelcomeSection />

          <SuggestedQuestionsSection
            questions={SUGGESTED_QUESTIONS}
            onQuestionPress={handleSuggestedQuestion}
          />

          <View style={styles.chatSection}>
            {messages.map((msg) =>
              msg.sender === 'assistant' ? (
                <AssistantMessage
                  key={msg.id}
                  message={msg.text}
                  timestamp={msg.timestamp}
                />
              ) : (
                <UserMessage
                  key={msg.id}
                  message={msg.text}
                  timestamp={msg.timestamp}
                />
              ),
            )}
          </View>
        </ScrollView>

        <View style={styles.inputContainer}>
          <ChatInput
            value={input}
            onChangeText={setInput}
            onSend={handleSend}
            onAttach={() => {}}
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
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 80,
    gap: 0,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  chatSection: {
    paddingVertical: 8,
    gap: 8,
  },
});
