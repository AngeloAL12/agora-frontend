import { chatSummaryStore } from '@/services/chatSummaryStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthRequest } from './useAuthRequest';

export interface ClubMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  timestamp: string;
  isMe: boolean;
}

interface ClubMessageUserResponse {
  id: number;
  name: string;
  photo: string | null;
}

interface ClubMessageResponse {
  id: number;
  id_club: number;
  content: string;
  created_at: string;
  user: ClubMessageUserResponse;
}

interface UseClubChatReturn {
  messages: ClubMessage[];
  input: string;
  setInput: (text: string) => void;
  isLoading: boolean;
  isSending: boolean;
  chatError: string | null;
  handleSend: () => void;
  clearError: () => void;
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

// Session-level message cache keyed by clubId — survives navigation within the same app session.
const sessionMessagesByClub: Record<string, ClubMessage[]> = {};

function toWssUrl(httpUrl: string, clubId: string): string {
  return (
    httpUrl.replace(/^https?:\/\//, (match) =>
      match.startsWith('https') ? 'wss://' : 'ws://',
    ) + `/clubs/${clubId}/chat`
  );
}

function formatIncomingTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  }
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) {
    return date.toLocaleDateString('es-MX', { weekday: 'long' });
  }
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

function formatNowTimestamp(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
}

export function useClubChat(clubId: string): UseClubChatReturn {
  const { token, user } = useAuth();
  const authRequest = useAuthRequest();
  const currentUserId = user?.id;

  const [messages, setMessages] = useState<ClubMessage[]>(
    () => sessionMessagesByClub[clubId] ?? [],
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const mountedRef = useRef(true);

  const mapMessage = useCallback(
    (msg: ClubMessageResponse): ClubMessage => ({
      id: String(msg.id),
      text: msg.content,
      senderId: String(msg.user.id),
      senderName: msg.user.name,
      senderAvatar: msg.user.photo ?? null,
      timestamp: formatIncomingTimestamp(msg.created_at),
      isMe: msg.user.id === currentUserId,
    }),
    [currentUserId],
  );

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await authRequest<ClubMessageResponse[]>({
        method: 'GET',
        path: `/clubs/${clubId}/messages?limit=50`,
      });
      const loaded = data.map(mapMessage);
      sessionMessagesByClub[clubId] = loaded;
      if (mountedRef.current) setMessages(loaded);
      const last = loaded[loaded.length - 1];
      if (last) chatSummaryStore.update(clubId, last.text, last.timestamp);
    } catch {
      if (mountedRef.current)
        setChatError('No se pudieron cargar los mensajes.');
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [clubId, authRequest, mapMessage]);

  const connectWebSocket = useCallback(() => {
    if (!token || !BASE_URL) return;

    const wsUrl = toWssUrl(BASE_URL, clubId);
    // React Native WebSocket accepts a 3rd options arg not in DOM types

    const ws = new (WebSocket as any)(wsUrl, null, {
      headers: { Authorization: `Bearer ${token}` },
    }) as WebSocket;

    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data as string) as
          | ClubMessageResponse
          | { detail: string };
        if ('detail' in payload) return;
        const incoming = mapMessage(payload as ClubMessageResponse);
        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev;
          const next = [...prev, incoming];
          sessionMessagesByClub[clubId] = next;
          if (!incoming.isMe) {
            chatSummaryStore.updateWithUnread(
              clubId,
              incoming.text,
              incoming.timestamp,
            );
          }
          return next;
        });
      } catch {
        // ignore malformed frames
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      const maxAttempts = 3;
      if (reconnectAttemptsRef.current < maxAttempts) {
        const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000;
        reconnectAttemptsRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) connectWebSocket();
        }, delay);
      }
    };

    ws.onerror = () => {
      // onclose will handle reconnect
    };
  }, [token, clubId, mapMessage]);

  useEffect(() => {
    mountedRef.current = true;
    chatSummaryStore.markRead(clubId);
    loadMessages().then(() => {
      if (mountedRef.current) connectWebSocket();
    });

    return () => {
      mountedRef.current = false;
      reconnectAttemptsRef.current = 3; // stop reconnect loop
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [loadMessages, connectWebSocket, clubId]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setChatError('Sin conexión. Intenta de nuevo.');
      return;
    }

    setIsSending(true);
    setInput('');
    try {
      ws.send(JSON.stringify({ content: text }));
      // Optimistic update — server will echo back via WS
      const optimisticMsg: ClubMessage = {
        id: `opt_${Date.now()}`,
        text,
        senderId: String(currentUserId ?? 'me'),
        senderName: 'Yo',
        senderAvatar: null,
        timestamp: formatNowTimestamp(),
        isMe: true,
      };
      setMessages((prev) => {
        const next = [...prev, optimisticMsg];
        sessionMessagesByClub[clubId] = next;
        chatSummaryStore.update(clubId, `Tú: ${text}`, optimisticMsg.timestamp);
        return next;
      });
    } catch {
      setChatError('No se pudo enviar el mensaje.');
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, currentUserId, clubId]);

  const clearError = () => setChatError(null);

  return {
    messages,
    input,
    setInput,
    isLoading,
    isSending,
    chatError,
    handleSend,
    clearError,
  };
}
