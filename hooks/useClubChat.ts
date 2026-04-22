import { chatSummaryStore } from '@/services/chatSummaryStore';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface ClubMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  timestamp: string;
  isMe: boolean;
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

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// Replace this block with real API calls when the backend is ready.
// Shape of ClubMessage must stay stable; only the data source changes.
// API call: authRequest<ClubMessage[]>({ method: 'GET', path: `/clubs/${clubId}/messages` })

const MOCK_MESSAGES: Record<string, ClubMessage[]> = {
  'club-robotica': [
    {
      id: 'mock_r1',
      text: '¿Quién trae el soldador mañana?',
      senderId: 'user-carlos',
      senderName: 'Carlos',
      senderAvatar: null,
      timestamp: '10:45 AM',
      isMe: false,
    },
    {
      id: 'mock_r2',
      text: 'Yo lo tengo, no hay problema.',
      senderId: 'user-ana',
      senderName: 'Ana',
      senderAvatar: null,
      timestamp: '10:47 AM',
      isMe: false,
    },
    {
      id: 'mock_r3',
      text: 'Perfecto, nos vemos a las 4.',
      senderId: 'me',
      senderName: 'Yo',
      senderAvatar: null,
      timestamp: '10:50 AM',
      isMe: true,
    },
  ],
  'club-programacion': [
    {
      id: 'mock_p1',
      text: 'Ya envié el reporte de cálculo, avísenme si falta algo.',
      senderId: 'user-mario',
      senderName: 'Mario',
      senderAvatar: null,
      timestamp: 'Ayer',
      isMe: false,
    },
  ],
  'club-futbol': [
    {
      id: 'mock_f1',
      text: '¿Vamos a ir a la biblioteca saliendo del entrenamiento?',
      senderId: 'user-pedro',
      senderName: 'Pedro',
      senderAvatar: null,
      timestamp: 'Lunes',
      isMe: false,
    },
  ],
  'club-beisbol': [
    {
      id: 'mock_b1',
      text: 'Se les recuerda que la junta informativa es el viernes a las 5 PM.',
      senderId: 'user-lucia',
      senderName: 'Lucía',
      senderAvatar: null,
      timestamp: '24 Oct',
      isMe: false,
    },
  ],
};
// ─── END MOCK ─────────────────────────────────────────────────────────────────

function formatTimestamp(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
}

export function useClubChat(clubId: string): UseClubChatReturn {
  const [messages, setMessages] = useState<ClubMessage[]>(
    () => sessionMessagesByClub[clubId] ?? [],
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const msgCounterRef = useRef(0);
  const nextId = () => `msg_${++msgCounterRef.current}_${Date.now()}`;

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: replace with real API call:
      // const data = await authRequest<ClubMessage[]>({
      //   method: 'GET',
      //   path: `/clubs/${clubId}/messages`,
      // });
      // setMessages(data);
      await new Promise<void>((r) => setTimeout(r, 300));
      const loaded = MOCK_MESSAGES[clubId] ?? [];
      sessionMessagesByClub[clubId] = loaded;
      setMessages(loaded);
      const last = loaded[loaded.length - 1];
      if (last) chatSummaryStore.update(clubId, last.text, last.timestamp);
    } catch {
      setChatError('No se pudieron cargar los mensajes.');
    } finally {
      setIsLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    chatSummaryStore.markRead(clubId);
    loadMessages();
  }, [loadMessages, clubId]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInput('');
    try {
      // TODO: replace with real API call:
      // await authRequest({ method: 'POST', path: `/clubs/${clubId}/messages`, body: { text } });
      const optimisticMsg: ClubMessage = {
        id: nextId(),
        text,
        senderId: 'me',
        senderName: 'Yo',
        senderAvatar: null,
        timestamp: formatTimestamp(),
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
  }, [input, isSending]);

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
