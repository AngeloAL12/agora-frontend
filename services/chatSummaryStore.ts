import * as SecureStore from 'expo-secure-store';

export interface ChatSummary {
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  sortKey?: number;
}

type Listener = () => void;

const STORAGE_KEY = 'agora_chat_summaries';

let summaries: Record<string, ChatSummary> = {};
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePersist() {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(summaries)).catch(
      () => {},
    );
  }, 500);
}

export const chatSummaryStore = {
  get(chatId: string): ChatSummary | undefined {
    return summaries[chatId];
  },

  getSnapshot(): Record<string, ChatSummary> {
    return summaries;
  },

  update(chatId: string, lastMessage: string, timestamp: string) {
    const prev = summaries[chatId];
    summaries = {
      ...summaries,
      [chatId]: {
        lastMessage,
        timestamp,
        unreadCount: prev?.unreadCount ?? 0,
        sortKey: Date.now(),
      },
    };
    notify();
    schedulePersist();
  },

  updateWithUnread(chatId: string, lastMessage: string, timestamp: string) {
    const prev = summaries[chatId];
    summaries = {
      ...summaries,
      [chatId]: {
        lastMessage,
        timestamp,
        unreadCount: (prev?.unreadCount ?? 0) + 1,
        sortKey: Date.now(),
      },
    };
    notify();
    schedulePersist();
  },

  markRead(chatId: string) {
    const prev = summaries[chatId];
    // If no entry yet, the mock unreadCount is still showing — zero it out explicitly.
    const current = prev ?? { lastMessage: '', timestamp: '', unreadCount: 0 };
    if (current.unreadCount === 0 && prev !== undefined) return;
    summaries = { ...summaries, [chatId]: { ...current, unreadCount: 0 } };
    notify();
    schedulePersist();
  },

  clear() {
    summaries = {};
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = null;
    notify();
    SecureStore.deleteItemAsync(STORAGE_KEY).catch(() => {});
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async loadFromStorage() {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        summaries = { ...summaries, ...JSON.parse(raw) };
        notify();
      }
    } catch {
      // ignore corrupt data
    }
  },
};

// load persisted summaries on module init
chatSummaryStore.loadFromStorage();
