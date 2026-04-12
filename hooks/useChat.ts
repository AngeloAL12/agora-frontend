import { useState } from 'react';

// ---

export interface Message {
  id: string;
  text: string;
  sender: 'assistant' | 'user';
  timestamp: string;
}

// Contador atómico + timestamp para garantizar IDs únicos sin dependencias externas
let _msgCounter = 0;
const nextId = () => `msg_${++_msgCounter}_${Date.now()}`;

const formatTimestamp = (): string => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'pm' : 'am';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
};

// ---

interface UseChatReturn {
  messages: Message[];
  input: string;
  setInput: (text: string) => void;
  isLoading: boolean;
  chatError: string | null;
  handleSend: () => void;
  handleSuggestedQuestion: (text: string) => void;
  clearError: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: nextId(),
      text: input.trim(),
      sender: 'user',
      timestamp: formatTimestamp(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setChatError(null);

    // TODO: conectar API — cuando el endpoint esté listo, implementar aquí:
    //
    // setIsLoading(true);
    // try {
    //   const response = await apiRequest({
    //     method: 'POST',
    //     path: '/ia/chat',
    //     body: { message: userMessage.text },
    //     token,
    //   });
    //   const assistantMessage: Message = {
    //     id: nextId(),
    //     text: response.reply,
    //     sender: 'assistant',
    //     timestamp: formatTimestamp(),
    //   };
    //   setMessages((prev) => [...prev, assistantMessage]);
    // } catch {
    //   setChatError('No pude responder. Intenta de nuevo.');
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const handleSuggestedQuestion = (text: string) => {
    setInput(text);
  };

  const clearError = () => setChatError(null);

  return {
    messages,
    input,
    setInput,
    isLoading,
    chatError,
    handleSend,
    handleSuggestedQuestion,
    clearError,
  };
}
