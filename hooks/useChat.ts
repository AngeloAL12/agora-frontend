import { useAuth } from '@/context/AuthContext';
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
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const handleSend = async () => {
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

    setIsLoading(true);
    try {
      const response = await fetch('https://n8n.angelolo.lat/webhook/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: userMessage.text,
          message: userMessage.text,
          token,
          user: user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
              }
            : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al conectar con la IA');
      }

      const textResponse = await response.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch {
        data = textResponse;
      }

      const replyText =
        data.output ||
        data.text ||
        (typeof data === 'string' ? data : JSON.stringify(data));

      const assistantMessage: Message = {
        id: nextId(),
        text: replyText,
        sender: 'assistant',
        timestamp: formatTimestamp(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setChatError('No pude responder. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
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
