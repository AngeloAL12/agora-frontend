import { chatSummaryStore } from './chatSummaryStore';

export interface ManagedClubMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  timestamp: string;
  isMe: boolean;
}

type MessageListener = (msg: ManagedClubMessage) => void;

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export function formatIncomingTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) {
    const h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
  }
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7)
    return date.toLocaleDateString('es-MX', { weekday: 'long' });
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

function toWssUrl(clubId: string): string {
  return (
    BASE_URL.replace(/^https?:\/\//, (m) =>
      m.startsWith('https') ? 'wss://' : 'ws://',
    ) + `/clubs/${clubId}/chat`
  );
}

interface ConnState {
  ws: WebSocket | null;
  attempts: number;
  timer: ReturnType<typeof setTimeout> | null;
  active: boolean;
}

class ClubChatManager {
  private conns = new Map<string, ConnState>();
  private listeners = new Map<string, Set<MessageListener>>();
  private token = '';
  private userId: number | null = null;

  init(clubIds: string[], token: string, userId: number) {
    this.token = token;
    this.userId = userId;

    // Close stale connections
    for (const id of this.conns.keys()) {
      if (!clubIds.includes(id)) this.close(id);
    }

    // Open new ones
    for (const id of clubIds) {
      if (!this.conns.has(id)) this.open(id);
    }
  }

  private open(clubId: string) {
    if (!this.token || !BASE_URL) return;
    const state: ConnState = {
      ws: null,
      attempts: 0,
      timer: null,
      active: true,
    };
    this.conns.set(clubId, state);
    this.connect(clubId, state);
  }

  private connect(clubId: string, state: ConnState) {
    const ws = new (WebSocket as any)(toWssUrl(clubId), null, {
      headers: { Authorization: `Bearer ${this.token}` },
    }) as WebSocket;
    state.ws = ws;

    ws.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data as string);
        if ('detail' in raw) return;
        const msg: ManagedClubMessage = {
          id: String(raw.id),
          text: raw.content,
          senderId: String(raw.user.id),
          senderName: raw.user.name,
          senderAvatar: raw.user.photo ?? null,
          timestamp: formatIncomingTimestamp(raw.created_at),
          isMe: raw.user.id === this.userId,
        };

        const active = this.listeners.get(clubId);
        if (active && active.size > 0) {
          // User is inside this chat — deliver and mark no-unread
          chatSummaryStore.update(clubId, msg.text, msg.timestamp);
          active.forEach((l) => l(msg));
        } else if (!msg.isMe) {
          chatSummaryStore.updateWithUnread(clubId, msg.text, msg.timestamp);
        } else {
          chatSummaryStore.update(clubId, `Tú: ${msg.text}`, msg.timestamp);
        }
      } catch {
        // ignore malformed frames
      }
    };

    ws.onclose = () => {
      if (!state.active) return;
      if (state.attempts < 5) {
        const delay = Math.pow(2, state.attempts) * 1000;
        state.attempts++;
        state.timer = setTimeout(() => {
          if (state.active) this.connect(clubId, state);
        }, delay);
      }
    };

    ws.onerror = () => {};
  }

  private close(clubId: string) {
    const state = this.conns.get(clubId);
    if (!state) return;
    state.active = false;
    if (state.timer) clearTimeout(state.timer);
    state.ws?.close();
    this.conns.delete(clubId);
  }

  closeAll() {
    for (const id of [...this.conns.keys()]) this.close(id);
  }

  addListener(clubId: string, listener: MessageListener) {
    if (!this.listeners.has(clubId)) this.listeners.set(clubId, new Set());
    this.listeners.get(clubId)!.add(listener);
  }

  removeListener(clubId: string, listener: MessageListener) {
    this.listeners.get(clubId)?.delete(listener);
  }

  send(clubId: string, content: string): boolean {
    const ws = this.conns.get(clubId)?.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify({ content }));
    return true;
  }

  isReady(clubId: string): boolean {
    return this.conns.get(clubId)?.ws?.readyState === WebSocket.OPEN;
  }
}

export const clubChatManager = new ClubChatManager();
