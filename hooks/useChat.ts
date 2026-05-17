import { useAuth } from '@/context/AuthContext';
import { chatSummaryStore } from '@/services/chatSummaryStore';
import { useEffect, useRef, useState } from 'react';

// ---

export interface Message {
  id: string;
  text: string;
  sender: 'assistant' | 'user';
  timestamp: string;
}

const N8N_URL = process.env.EXPO_PUBLIC_N8N_URL ?? '';

// Session-level message cache — survives navigation within the same app session.
const sessionMessages: Message[] = [];
let lastActivityAt = 0;

const INACTIVITY_LIMIT_MS = 60 * 60 * 1000; // 1 hour

const clearSession = () => {
  sessionMessages.splice(0, sessionMessages.length);
  lastActivityAt = 0;
};

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
  isSlowRequest: boolean;
  chatError: string | null;
  handleSend: (textOverride?: string) => void;
  handleSuggestedQuestion: (text: string) => void;
  clearError: () => void;
  clearMessages: () => void;
}

export function useChat(): UseChatReturn {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() => {
    if (
      lastActivityAt > 0 &&
      Date.now() - lastActivityAt > INACTIVITY_LIMIT_MS
    ) {
      clearSession();
    }
    return [...sessionMessages];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSlowRequest, setIsSlowRequest] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const msgCounterRef = useRef(0);
  const nextId = () => `msg_${++msgCounterRef.current}_${Date.now()}`;

  const abortControllerRef = useRef<AbortController | null>(null);
  const isSendingRef = useRef(false);
  const mountedRef = useRef(true);
  const sessionIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    chatSummaryStore.markRead('bufalo-ia');
    return () => {
      mountedRef.current = false;
      // intentionally NOT aborting — let the request finish so the reply
      // lands in sessionMessages and is visible when the user comes back
    };
  }, []);

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || isLoading || isSendingRef.current) return;

    if (!N8N_URL) {
      setChatError('No se encontró la URL del asistente.');
      return;
    }

    isSendingRef.current = true;
    const currentSession = sessionIdRef.current;

    const userMessage: Message = {
      id: nextId(),
      text,
      sender: 'user',
      timestamp: formatTimestamp(),
    };

    sessionMessages.push(userMessage);
    lastActivityAt = Date.now();
    chatSummaryStore.update(
      'bufalo-ia',
      userMessage.text,
      userMessage.timestamp,
    );
    if (mountedRef.current) {
      setMessages([...sessionMessages]);
      if (!textOverride) setInput('');
      setChatError(null);
    }

    let slowTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      // timeout to send
      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsLoading(true);

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeout = setTimeout(() => controller.abort(), 30_000);

      slowTimer = setTimeout(() => {
        if (mountedRef.current) setIsSlowRequest(true);
      }, 15_000);

      const response = await fetch(N8N_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          chatInput: text,
          message: text,
          token,
          user: user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
              }
            : null,

          history: messages.slice(-8).map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
          })),
        }),
      });

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
      if (currentSession !== sessionIdRef.current) return;
      sessionMessages.push(assistantMessage);
      lastActivityAt = Date.now();
      if (mountedRef.current) {
        chatSummaryStore.update(
          'bufalo-ia',
          assistantMessage.text,
          assistantMessage.timestamp,
        );
        setMessages([...sessionMessages]);
      } else {
        chatSummaryStore.updateWithUnread(
          'bufalo-ia',
          assistantMessage.text,
          assistantMessage.timestamp,
        );
      }
      clearTimeout(timeout);
      clearTimeout(slowTimer);
    } catch (err) {
      clearTimeout(slowTimer);
      if (mountedRef.current && currentSession === sessionIdRef.current) {
        if (err instanceof Error && err.name === 'AbortError') {
          setChatError('El asistente tardó demasiado. Intenta de nuevo.');
        } else {
          setChatError('No pude responder. Intenta de nuevo.');
        }
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsSlowRequest(false);
      }
      isSendingRef.current = false;
    }
  };

  const handleSuggestedQuestion = (text: string) => {
    handleSend(text);
  };

  const clearError = () => setChatError(null);

  const clearMessages = () => {
    sessionIdRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    isSendingRef.current = false;
    clearSession();
    setMessages([]);
    setIsLoading(false);
    setIsSlowRequest(false);
    setChatError(null);
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    isSlowRequest,
    chatError,
    handleSend,
    handleSuggestedQuestion,
    clearError,
    clearMessages,
  };
}
