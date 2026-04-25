import { chatSummaryStore } from '@/services/chatSummaryStore';
import {
  clubChatManager,
  formatIncomingTimestamp,
  ManagedClubMessage,
} from '@/services/clubChatManager';
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
  isSending: boolean;
  chatError: string | null;
  handleSend: () => void;
  clearError: () => void;
}

// Session-level message cache keyed by clubId — survives navigation within the same app session.
const sessionMessagesByClub: Record<string, ClubMessage[]> = {};

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
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await authRequest<ClubMessageResponse[]>({
        method: 'GET',
        path: `/clubs/${clubId}/messages?limit=50`,
      });
      const loaded: ClubMessage[] = data.map((msg) => ({
        id: String(msg.id),
        text: msg.content,
        senderId: String(msg.user.id),
        senderName: msg.user.name,
        senderAvatar: msg.user.photo ?? null,
        timestamp: formatIncomingTimestamp(msg.created_at),
        isMe: msg.user.id === currentUserId,
      }));
      sessionMessagesByClub[clubId] = loaded;
      setMessages(loaded);
      const last = loaded[loaded.length - 1];
      if (last) chatSummaryStore.update(clubId, last.text, last.timestamp);
    } catch {
      setChatError('No se pudieron cargar los mensajes.');
    } finally {
      setIsLoading(false);
    }
  }, [clubId, authRequest, currentUserId]);

  useEffect(() => {
    chatSummaryStore.markRead(clubId);

    // Only fetch history if not already cached
    if ((sessionMessagesByClub[clubId] ?? []).length === 0) {
      loadMessages();
    } else {
      setIsLoading(false);
    }

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

    clubChatManager.addListener(clubId, onMessage);
    return () => {
      clubChatManager.removeListener(clubId, onMessage);
    };
  }, [clubId, loadMessages]);

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
