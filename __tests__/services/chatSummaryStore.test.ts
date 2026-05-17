const mockGetItemAsync = jest.fn();
const mockSetItemAsync = jest.fn();
const mockDeleteItemAsync = jest.fn();

jest.mock('expo-secure-store', () => ({
  getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
  setItemAsync: (...args: unknown[]) => mockSetItemAsync(...args),
  deleteItemAsync: (...args: unknown[]) => mockDeleteItemAsync(...args),
}));

describe('chatSummaryStore', () => {
  let chatSummaryStore: typeof import('../../services/chatSummaryStore').chatSummaryStore;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockGetItemAsync.mockResolvedValue(null);
    mockSetItemAsync.mockResolvedValue(undefined);
    mockDeleteItemAsync.mockResolvedValue(undefined);
    jest.resetModules();
    jest.mock('expo-secure-store', () => ({
      getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
      setItemAsync: (...args: unknown[]) => mockSetItemAsync(...args),
      deleteItemAsync: (...args: unknown[]) => mockDeleteItemAsync(...args),
    }));
    ({ chatSummaryStore } = require('../../services/chatSummaryStore'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns undefined for unknown chatId', () => {
    expect(chatSummaryStore.get('unknown')).toBeUndefined();
  });

  it('update stores summary and notifies listeners', () => {
    const listener = jest.fn();
    chatSummaryStore.subscribe(listener);

    chatSummaryStore.update('club-1', 'hello', '10:00 AM');

    const summary = chatSummaryStore.get('club-1');
    expect(summary).toMatchObject({
      lastMessage: 'hello',
      timestamp: '10:00 AM',
      unreadCount: 0,
    });
    expect(summary?.sortKey).toBeDefined();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('update preserves existing unreadCount', () => {
    chatSummaryStore.updateWithUnread('club-1', 'msg', '10:00 AM');
    chatSummaryStore.updateWithUnread('club-1', 'msg2', '10:01 AM');
    chatSummaryStore.update('club-1', 'new msg', '10:02 AM');

    expect(chatSummaryStore.get('club-1')?.unreadCount).toBe(2);
  });

  it('updateWithUnread increments unreadCount', () => {
    chatSummaryStore.updateWithUnread('club-1', 'new', '10:00 AM');
    chatSummaryStore.updateWithUnread('club-1', 'newer', '10:01 AM');

    const summary = chatSummaryStore.get('club-1');
    expect(summary).toMatchObject({
      lastMessage: 'newer',
      timestamp: '10:01 AM',
      unreadCount: 2,
    });
    expect(summary?.sortKey).toBeDefined();
  });

  it('markRead resets unreadCount to 0', () => {
    chatSummaryStore.updateWithUnread('club-1', 'msg', '10:00 AM');
    chatSummaryStore.markRead('club-1');

    expect(chatSummaryStore.get('club-1')?.unreadCount).toBe(0);
  });

  it('markRead is no-op when already 0 and entry exists', () => {
    chatSummaryStore.update('club-1', 'msg', '10:00 AM');
    const listener = jest.fn();
    chatSummaryStore.subscribe(listener);

    chatSummaryStore.markRead('club-1');

    expect(listener).not.toHaveBeenCalled();
  });

  it('markRead creates entry with 0 when chatId is new', () => {
    const listener = jest.fn();
    chatSummaryStore.subscribe(listener);

    chatSummaryStore.markRead('new-club');

    expect(chatSummaryStore.get('new-club')?.unreadCount).toBe(0);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('getSnapshot returns full summaries object', () => {
    chatSummaryStore.update('club-1', 'hi', '9:00 AM');
    chatSummaryStore.update('club-2', 'bye', '9:01 AM');

    const snap = chatSummaryStore.getSnapshot();
    expect(snap['club-1'].lastMessage).toBe('hi');
    expect(snap['club-2'].lastMessage).toBe('bye');
  });

  it('subscribe returns an unsubscribe function', () => {
    const listener = jest.fn();
    const unsub = chatSummaryStore.subscribe(listener);
    unsub();

    chatSummaryStore.update('club-1', 'msg', '10:00 AM');

    expect(listener).not.toHaveBeenCalled();
  });

  it('debounces SecureStore persist — only one write after burst', () => {
    chatSummaryStore.update('club-1', 'a', '10:00 AM');
    chatSummaryStore.update('club-1', 'b', '10:01 AM');
    chatSummaryStore.update('club-1', 'c', '10:02 AM');

    expect(mockSetItemAsync).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);

    expect(mockSetItemAsync).toHaveBeenCalledTimes(1);
    expect(mockSetItemAsync).toHaveBeenCalledWith(
      'agora_chat_summaries',
      expect.any(String),
    );
  });

  it('clear resets all summaries, cancels pending persist, and deletes from SecureStore', () => {
    chatSummaryStore.update('club-1', 'msg', '10:00 AM');
    const listener = jest.fn();
    chatSummaryStore.subscribe(listener);

    chatSummaryStore.clear();

    expect(chatSummaryStore.getSnapshot()).toEqual({});
    expect(mockDeleteItemAsync).toHaveBeenCalledWith('agora_chat_summaries');
    expect(listener).toHaveBeenCalledTimes(1);
    // pending debounce should be cancelled — no persist after clear
    jest.advanceTimersByTime(500);
    expect(mockSetItemAsync).not.toHaveBeenCalled();
  });

  it('loadFromStorage merges data from SecureStore', async () => {
    const stored = {
      'club-1': { lastMessage: 'hi', timestamp: '8:00 AM', unreadCount: 3 },
    };
    mockGetItemAsync.mockResolvedValue(JSON.stringify(stored));

    jest.resetModules();
    jest.mock('expo-secure-store', () => ({
      getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
      setItemAsync: (...args: unknown[]) => mockSetItemAsync(...args),
      deleteItemAsync: (...args: unknown[]) => mockDeleteItemAsync(...args),
    }));
    const mod = require('../../services/chatSummaryStore');
    await mod.chatSummaryStore.loadFromStorage();

    expect(mod.chatSummaryStore.get('club-1')).toEqual(stored['club-1']);
  });

  it('loadFromStorage is silent on corrupt data', async () => {
    mockGetItemAsync.mockResolvedValue('not-json{{{');

    jest.resetModules();
    jest.mock('expo-secure-store', () => ({
      getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
      setItemAsync: (...args: unknown[]) => mockSetItemAsync(...args),
      deleteItemAsync: (...args: unknown[]) => mockDeleteItemAsync(...args),
    }));
    const mod = require('../../services/chatSummaryStore');
    await expect(mod.chatSummaryStore.loadFromStorage()).resolves.not.toThrow();
  });
});
