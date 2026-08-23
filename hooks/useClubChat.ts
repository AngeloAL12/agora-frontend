import { chatSummaryStore } from '@/services/chatSummaryStore';
import { sessionMessagesByClub } from '@/services/cacheService';
import {
  clubChatManager,
  formatIncomingTimestamp,
  ManagedClubMessage,
} from '@/services/clubChatManager';
import { useFocusEffect } from 'expo-router';
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

interface ClubMessageResponse {
  id: number;
  id_club: number;
  content: string;
  created_at: string;
  user: { id: number; name: string; photo: string | null };
}

interface UseClubChatReturn {
  messages: ClubMessage[];
  input: string;
  setInput: (text: string) => void;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isSending: boolean;
  chatError: string | null;
  handleSend: () => void;
  loadMoreMessages: () => Promise<void>;
  clearError: () => void;
  hideReportedMessage: (
    messageId: string,
    senderId: string,
    blocked: boolean,
  ) => void;
}

const LIMIT = 50;
const sessionPageByClub: Record<string, number> = {};
const sessionHasMoreByClub: Record<string, boolean> = {};

export function clearSessionMessageCache() {
  for (const key of Object.keys(sessionMessagesByClub)) {
    delete sessionMessagesByClub[key];
    delete sessionPageByClub[key];
    delete sessionHasMoreByClub[key];
  }
}

function formatNowTimestamp(): string {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function useClubChat(clubId: string): UseClubChatReturn {
  const { user } = useAuth();
  const authRequest = useAuthRequest();
  const currentUserId = user?.id;

  const [messages, setMessages] = useState<ClubMessage[]>(
    () => sessionMessagesByClub[clubId] ?? [],
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(
    () => (sessionMessagesByClub[clubId] ?? []).length === 0,
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(
    () => sessionHasMoreByClub[clubId] ?? true,
  );
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const pageRef = useRef<number>(sessionPageByClub[clubId] ?? 1);

  const mapMessages = useCallback(
    (data: ClubMessageResponse[]): ClubMessage[] =>
      data.map((msg) => ({
        id: String(msg.id),
        text: msg.content,
        senderId: String(msg.user.id),
        senderName: msg.user.name,
        senderAvatar: msg.user.photo ?? null,
        timestamp: formatIncomingTimestamp(msg.created_at),
        isMe: msg.user.id === currentUserId,
      })),
    [currentUserId],
  );

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await authRequest<ClubMessageResponse[]>({
        method: 'GET',
        path: `/clubs/${clubId}/messages?limit=${LIMIT}&page=1`,
      });
      const loaded = mapMessages(data);
      pageRef.current = 1;
      sessionPageByClub[clubId] = 1;
      const more = data.length === LIMIT;
      sessionHasMoreByClub[clubId] = more;
      setHasMore(more);
      sessionMessagesByClub[clubId] = loaded;
      setMessages(loaded);
      const last = loaded[loaded.length - 1];
      if (last) chatSummaryStore.update(clubId, last.text, last.timestamp);
    } catch {
      setChatError('No se pudieron cargar los mensajes.');
    } finally {
      setIsLoading(false);
    }
  }, [clubId, authRequest, mapMessages]);

  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const data = await authRequest<ClubMessageResponse[]>({
        method: 'GET',
        path: `/clubs/${clubId}/messages?limit=${LIMIT}&page=${nextPage}`,
      });
      const older = mapMessages(data);
      pageRef.current = nextPage;
      sessionPageByClub[clubId] = nextPage;
      const more = data.length === LIMIT;
      sessionHasMoreByClub[clubId] = more;
      setHasMore(more);
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const deduped = older.filter((m) => !existingIds.has(m.id));
        const next = [...deduped, ...prev];
        sessionMessagesByClub[clubId] = next;
        return next;
      });
    } catch {
      setChatError('No se pudieron cargar más mensajes.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [clubId, authRequest, mapMessages, isLoadingMore, hasMore]);

  useEffect(() => {
    if ((sessionMessagesByClub[clubId] ?? []).length === 0) {
      loadMessages();
    } else {
      setIsLoading(false);
    }
  }, [clubId, loadMessages]);

  useFocusEffect(
    useCallback(() => {
      chatSummaryStore.markRead(clubId);

      const onMessage = (incoming: ManagedClubMessage) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev;
          const optimisticIdx = incoming.isMe
            ? prev.findLastIndex(
                (m) => m.id.startsWith('opt_') && m.text === incoming.text,
              )
            : -1;
          const next =
            optimisticIdx !== -1
              ? prev.map((m, i) => (i === optimisticIdx ? incoming : m))
              : [...prev, incoming];
          sessionMessagesByClub[clubId] = next;
          return next;
        });
      };

      const onMessageError = (message: string) => {
        setChatError(message);
        setMessages((current) => {
          const optimisticIndex = current.findLastIndex((item) =>
            item.id.startsWith('opt_'),
          );
          if (optimisticIndex === -1) return current;
          const next = current.filter((_, index) => index !== optimisticIndex);
          sessionMessagesByClub[clubId] = next;
          return next;
        });
      };

      clubChatManager.addListener(clubId, onMessage);
      clubChatManager.addErrorListener(clubId, onMessageError);
      return () => {
        clubChatManager.removeListener(clubId, onMessage);
        clubChatManager.removeErrorListener(clubId, onMessageError);
      };
    }, [clubId]),
  );

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;

    if (!clubChatManager.isReady(clubId)) {
      setChatError('Sin conexión. Intenta de nuevo.');
      return;
    }

    setIsSending(true);
    setInput('');
    try {
      const sent = clubChatManager.send(clubId, text);
      if (!sent) {
        setChatError('Sin conexión. Intenta de nuevo.');
        return;
      }
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
        return next;
      });
      chatSummaryStore.update(clubId, `Tú: ${text}`, optimisticMsg.timestamp);
    } catch {
      setChatError('No se pudo enviar el mensaje.');
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, currentUserId, clubId]);

  const clearError = () => setChatError(null);

  const hideReportedMessage = useCallback(
    (messageId: string, senderId: string, blocked: boolean) => {
      setMessages((current) => {
        const next = current.filter((message) =>
          blocked ? message.senderId !== senderId : message.id !== messageId,
        );
        sessionMessagesByClub[clubId] = next;
        const last = next[next.length - 1];
        chatSummaryStore.update(
          clubId,
          last?.text ?? '',
          last?.timestamp ?? '',
        );
        return next;
      });
    },
    [clubId],
  );

  return {
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
  };
}
