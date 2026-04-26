const mockChatSummaryUpdate = jest.fn();
const mockChatSummaryUpdateWithUnread = jest.fn();

jest.mock('../../services/chatSummaryStore', () => ({
  chatSummaryStore: {
    update: (...args: unknown[]) => mockChatSummaryUpdate(...args),
    updateWithUnread: (...args: unknown[]) =>
      mockChatSummaryUpdateWithUnread(...args),
  },
}));

class MockWebSocket {
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.OPEN;
  onmessage: ((e: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;

  send = jest.fn();
  close = jest.fn(() => {
    this.readyState = MockWebSocket.CLOSED;
  });

  static instances: MockWebSocket[] = [];

  constructor() {
    MockWebSocket.instances.push(this);
  }

  static reset() {
    MockWebSocket.instances = [];
  }
}

(global as any).WebSocket = MockWebSocket;

describe('formatIncomingTimestamp', () => {
  let formatIncomingTimestamp: (iso: string) => string;

  beforeEach(() => {
    jest.resetModules();
    ({ formatIncomingTimestamp } = require('../../services/clubChatManager'));
  });

  it('formats today timestamp as HH:MM AM/PM', () => {
    const now = new Date();
    const result = formatIncomingTimestamp(now.toISOString());
    expect(result).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
  });

  it('returns "Ayer" for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatIncomingTimestamp(yesterday.toISOString())).toBe('Ayer');
  });

  it('returns day name for dates within the past week', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const result = formatIncomingTimestamp(threeDaysAgo.toISOString());
    const days = [
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábado',
      'domingo',
    ];
    expect(days.some((d) => result.toLowerCase().includes(d))).toBe(true);
  });

  it('returns short date for old messages', () => {
    const old = new Date();
    old.setDate(old.getDate() - 10);
    const result = formatIncomingTimestamp(old.toISOString());
    expect(result).not.toMatch(/^\d{1,2}:\d{2}/);
    expect(result).not.toBe('Ayer');
  });
});

describe('ClubChatManager', () => {
  let clubChatManager: import('../../services/clubChatManager').ClubChatManager;
  type ClubChatManagerModule = typeof import('../../services/clubChatManager');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    MockWebSocket.reset();
    jest.resetModules();
    process.env.EXPO_PUBLIC_API_URL = 'https://api.example.com';
    jest.mock('../../services/chatSummaryStore', () => ({
      chatSummaryStore: {
        update: mockChatSummaryUpdate,
        updateWithUnread: mockChatSummaryUpdateWithUnread,
      },
    }));
    const mod =
      require('../../services/clubChatManager') as ClubChatManagerModule;
    clubChatManager = mod.clubChatManager as any;
  });

  afterEach(() => {
    clubChatManager.closeAll();
    jest.useRealTimers();
  });

  it('isReady returns false before init', () => {
    expect(clubChatManager.isReady('club-1')).toBe(false);
  });

  it('init opens WebSocket connections for each club', () => {
    clubChatManager.init(['club-1', 'club-2'], 'token', 42);
    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it('init does not open duplicate connection for same club', () => {
    clubChatManager.init(['club-1'], 'token', 42);
    clubChatManager.init(['club-1'], 'token', 42);
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it('isReady returns true when WebSocket is OPEN', () => {
    clubChatManager.init(['club-1'], 'token', 42);
    expect(clubChatManager.isReady('club-1')).toBe(true);
  });

  it('send returns false when not connected', () => {
    expect(clubChatManager.send('club-1', 'hello')).toBe(false);
  });

  it('send returns true and calls ws.send when OPEN', () => {
    clubChatManager.init(['club-1'], 'token', 42);
    const ws = MockWebSocket.instances[0];
    const sent = clubChatManager.send('club-1', 'hello');
    expect(sent).toBe(true);
    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({ content: 'hello' }));
  });

  it('send returns false when WebSocket is not OPEN', () => {
    clubChatManager.init(['club-1'], 'token', 42);
    MockWebSocket.instances[0].readyState = MockWebSocket.CLOSED;
    expect(clubChatManager.send('club-1', 'hello')).toBe(false);
  });

  it('addListener and receives message via onmessage', () => {
    clubChatManager.init(['club-1'], 'token', 42);
    const ws = MockWebSocket.instances[0];

    const listener = jest.fn();
    clubChatManager.addListener('club-1', listener);

    const payload = {
      id: 1,
      content: 'hi',
      created_at: new Date().toISOString(),
      user: { id: 99, name: 'Alice', photo: null },
    };
    ws.onmessage!({ data: JSON.stringify(payload) });

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        text: 'hi',
        senderName: 'Alice',
        isMe: false,
      }),
    );
  });

  it('calls updateWithUnread when no active listeners and message is from other user', () => {
    clubChatManager.init(['club-1'], 'token', 42);
    const ws = MockWebSocket.instances[0];

    const payload = {
      id: 1,
      content: 'incoming',
      created_at: new Date().toISOString(),
      user: { id: 99, name: 'Bob', photo: null },
    };
    ws.onmessage!({ data: JSON.stringify(payload) });

    expect(mockChatSummaryUpdateWithUnread).toHaveBeenCalledWith(
      'club-1',
      'incoming',
      expect.any(String),
    );
  });

  it('calls update (no unread) for own messages with no listener', () => {
    clubChatManager.init(['club-1'], 'token', 42);
    const ws = MockWebSocket.instances[0];

    const payload = {
      id: 1,
      content: 'my msg',
      created_at: new Date().toISOString(),
      user: { id: 42, name: 'Me', photo: null },
    };
    ws.onmessage!({ data: JSON.stringify(payload) });

    expect(mockChatSummaryUpdate).toHaveBeenCalledWith(
      'club-1',
      'Tú: my msg',
      expect.any(String),
    );
  });

  it('ignores messages with "detail" field (auth error frames)', () => {
    clubChatManager.init(['club-1'], 'token', 42);
    const ws = MockWebSocket.instances[0];
    const listener = jest.fn();
    clubChatManager.addListener('club-1', listener);

    ws.onmessage!({ data: JSON.stringify({ detail: 'Unauthorized' }) });

    expect(listener).not.toHaveBeenCalled();
  });

  it('ignores malformed JSON frames silently', () => {
    clubChatManager.init(['club-1'], 'token', 42);
    const ws = MockWebSocket.instances[0];
    expect(() => ws.onmessage!({ data: 'not json' })).not.toThrow();
  });

  it('removeListener stops delivery', () => {
    clubChatManager.init(['club-1'], 'token', 42);
    const ws = MockWebSocket.instances[0];
    const listener = jest.fn();
    clubChatManager.addListener('club-1', listener);
    clubChatManager.removeListener('club-1', listener);

    ws.onmessage!({
      data: JSON.stringify({
        id: 1,
        content: 'hi',
        created_at: new Date().toISOString(),
        user: { id: 9, name: 'X', photo: null },
      }),
    });

    expect(listener).not.toHaveBeenCalled();
  });

  it('schedules reconnect with exponential backoff on close', () => {
    clubChatManager.init(['club-1'], 'token', 42);
    const ws = MockWebSocket.instances[0];

    ws.onclose!();

    expect(MockWebSocket.instances).toHaveLength(1);
    jest.advanceTimersByTime(1000);
    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it('stops reconnecting after 5 attempts', () => {
    clubChatManager.init(['club-1'], 'token', 42);

    for (let i = 0; i < 5; i++) {
      const ws = MockWebSocket.instances[MockWebSocket.instances.length - 1];
      ws.onclose!();
      jest.advanceTimersByTime(Math.pow(2, i) * 1000);
    }

    const wsCount = MockWebSocket.instances.length;
    MockWebSocket.instances[MockWebSocket.instances.length - 1].onclose!();
    jest.advanceTimersByTime(60000);

    expect(MockWebSocket.instances).toHaveLength(wsCount);
  });

  it('closeAll stops reconnect and closes all sockets', () => {
    clubChatManager.init(['club-1', 'club-2'], 'token', 42);
    clubChatManager.closeAll();

    MockWebSocket.instances.forEach((ws) => {
      expect(ws.close).toHaveBeenCalled();
    });
  });

  it('init closes stale connections for clubs no longer in list', () => {
    clubChatManager.init(['club-1', 'club-2'], 'token', 42);
    clubChatManager.init(['club-1'], 'token', 42);

    expect(MockWebSocket.instances[1].close).toHaveBeenCalled();
  });

  it('does not open connection when BASE_URL is empty', () => {
    jest.resetModules();
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.mock('../../services/chatSummaryStore', () => ({
      chatSummaryStore: {
        update: mockChatSummaryUpdate,
        updateWithUnread: mockChatSummaryUpdateWithUnread,
      },
    }));
    MockWebSocket.reset();
    const mod = require('../../services/clubChatManager');
    mod.clubChatManager.init(['club-1'], 'token', 42);
    expect(MockWebSocket.instances).toHaveLength(0);
  });
});
