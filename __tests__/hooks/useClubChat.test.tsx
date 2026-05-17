import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useClubChat, clearSessionMessageCache } from '../../hooks/useClubChat';

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useFocusEffect: (effect: () => void | (() => void)) => {
      const cb = React.useCallback(effect, []);
      React.useEffect(() => {
        const cleanup = cb();
        return cleanup;
      }, [cb]);
    },
  };
});

const mockAuthRequest = jest.fn();
jest.mock('../../hooks/useAuthRequest', () => ({
  useAuthRequest: () => mockAuthRequest,
}));

const mockUser = { id: 42, name: 'Test User', email: 'test@test.com' };
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

const mockChatSummaryUpdate = jest.fn();
const mockChatSummaryMarkRead = jest.fn();
jest.mock('../../services/chatSummaryStore', () => ({
  chatSummaryStore: {
    update: (...args: unknown[]) => mockChatSummaryUpdate(...args),
    markRead: (...args: unknown[]) => mockChatSummaryMarkRead(...args),
  },
}));

const mockIsReady = jest.fn();
const mockSend = jest.fn();
const mockAddListener = jest.fn();
const mockRemoveListener = jest.fn();
jest.mock('../../services/clubChatManager', () => ({
  clubChatManager: {
    isReady: (...args: unknown[]) => mockIsReady(...args),
    send: (...args: unknown[]) => mockSend(...args),
    addListener: (...args: unknown[]) => mockAddListener(...args),
    removeListener: (...args: unknown[]) => mockRemoveListener(...args),
  },
  formatIncomingTimestamp: () => '10:00 AM',
}));

describe('useClubChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear session cache between tests so each test starts fresh
    clearSessionMessageCache();
  });

  const serverMessages = [
    {
      id: 1,
      id_club: 10,
      content: 'hello',
      created_at: '2024-01-01T10:00:00Z',
      user: { id: 99, name: 'Alice', photo: null },
    },
    {
      id: 2,
      id_club: 10,
      content: 'world',
      created_at: '2024-01-01T10:01:00Z',
      user: { id: 42, name: 'Me', photo: null },
    },
  ];

  it('loads messages from API on mount', async () => {
    mockAuthRequest.mockResolvedValue(serverMessages);

    const { result } = renderHook(() => useClubChat('club-10'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].text).toBe('hello');
    expect(result.current.messages[0].isMe).toBe(false);
    expect(result.current.messages[1].isMe).toBe(true);
  });

  it('uses cached messages without fetching again', async () => {
    mockAuthRequest.mockResolvedValue(serverMessages);
    const { unmount } = renderHook(() => useClubChat('club-10'));
    await waitFor(() => expect(mockAuthRequest).toHaveBeenCalledTimes(1));
    unmount();

    mockAuthRequest.mockClear();
    const { result } = renderHook(() => useClubChat('club-10'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockAuthRequest).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(2);
  });

  it('shows error when API fails', async () => {
    mockAuthRequest.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useClubChat('club-10'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.chatError).toBe(
      'No se pudieron cargar los mensajes.',
    );
  });

  it('registers WS listener on mount and removes on unmount', async () => {
    mockAuthRequest.mockResolvedValue([]);

    const { unmount } = renderHook(() => useClubChat('club-10'));
    await waitFor(() => expect(mockAddListener).toHaveBeenCalled());

    expect(mockAddListener).toHaveBeenCalledWith(
      'club-10',
      expect.any(Function),
    );
    unmount();
    expect(mockRemoveListener).toHaveBeenCalledWith(
      'club-10',
      expect.any(Function),
    );
  });

  it('marks chat as read on mount', async () => {
    mockAuthRequest.mockResolvedValue([]);
    renderHook(() => useClubChat('club-10'));
    expect(mockChatSummaryMarkRead).toHaveBeenCalledWith('club-10');
  });

  it('setInput updates input state', async () => {
    mockAuthRequest.mockResolvedValue([]);
    const { result } = renderHook(() => useClubChat('club-10'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setInput('hello world'));
    expect(result.current.input).toBe('hello world');
  });

  it('handleSend does nothing when input is empty', async () => {
    mockAuthRequest.mockResolvedValue([]);
    const { result } = renderHook(() => useClubChat('club-10'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => result.current.handleSend());
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('handleSend shows error when not connected', async () => {
    mockAuthRequest.mockResolvedValue([]);
    mockIsReady.mockReturnValue(false);

    const { result } = renderHook(() => useClubChat('club-10'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setInput('hi'));
    await act(async () => result.current.handleSend());

    expect(result.current.chatError).toBe('Sin conexión. Intenta de nuevo.');
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('handleSend adds optimistic message and calls ws.send', async () => {
    mockAuthRequest.mockResolvedValue([]);
    mockIsReady.mockReturnValue(true);
    mockSend.mockReturnValue(true);

    const { result } = renderHook(() => useClubChat('club-10'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setInput('hey there'));
    await act(async () => result.current.handleSend());

    expect(mockSend).toHaveBeenCalledWith('club-10', 'hey there');
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].text).toBe('hey there');
    expect(result.current.messages[0].id).toMatch(/^opt_/);
    expect(result.current.input).toBe('');
  });

  it('handleSend shows error when ws.send returns false', async () => {
    mockAuthRequest.mockResolvedValue([]);
    mockIsReady.mockReturnValue(true);
    mockSend.mockReturnValue(false);

    const { result } = renderHook(() => useClubChat('club-10'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setInput('hi'));
    await act(async () => result.current.handleSend());

    expect(result.current.chatError).toBe('Sin conexión. Intenta de nuevo.');
  });

  it('clearError resets chatError to null', async () => {
    mockAuthRequest.mockResolvedValue([]);
    mockIsReady.mockReturnValue(false);

    const { result } = renderHook(() => useClubChat('club-10'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setInput('hi'));
    await act(async () => result.current.handleSend());
    expect(result.current.chatError).not.toBeNull();

    act(() => result.current.clearError());
    expect(result.current.chatError).toBeNull();
  });

  it('incoming WS message appended to messages list', async () => {
    mockAuthRequest.mockResolvedValue([]);

    const { result } = renderHook(() => useClubChat('club-10'));
    await waitFor(() => expect(mockAddListener).toHaveBeenCalled());

    const onMessage = mockAddListener.mock.calls[0][1];

    const incoming = {
      id: 'msg-1',
      text: 'new message',
      senderId: '99',
      senderName: 'Alice',
      senderAvatar: null,
      timestamp: '10:00 AM',
      isMe: false,
    };

    act(() => onMessage(incoming));

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].text).toBe('new message');
  });

  it('incoming WS echo replaces optimistic message', async () => {
    mockAuthRequest.mockResolvedValue([]);
    mockIsReady.mockReturnValue(true);
    mockSend.mockReturnValue(true);

    const { result } = renderHook(() => useClubChat('club-10'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setInput('echo this'));
    await act(async () => result.current.handleSend());
    expect(result.current.messages).toHaveLength(1);

    const onMessage = mockAddListener.mock.calls[0][1];

    act(() =>
      onMessage({
        id: 'server-1',
        text: 'echo this',
        senderId: '42',
        senderName: 'Me',
        senderAvatar: null,
        timestamp: '10:01 AM',
        isMe: true,
      }),
    );

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].id).toBe('server-1');
  });

  it('duplicate WS message with same id is ignored', async () => {
    mockAuthRequest.mockResolvedValue([]);

    const { result } = renderHook(() => useClubChat('club-10'));
    await waitFor(() => expect(mockAddListener).toHaveBeenCalled());

    const onMessage = mockAddListener.mock.calls[0][1];
    const msg = {
      id: 'dup-1',
      text: 'once',
      senderId: '9',
      senderName: 'X',
      senderAvatar: null,
      timestamp: '10:00 AM',
      isMe: false,
    };

    act(() => onMessage(msg));
    act(() => onMessage(msg));

    expect(result.current.messages).toHaveLength(1);
  });

  it('clearSessionMessageCache forces re-fetch on next mount', async () => {
    mockAuthRequest.mockResolvedValue(serverMessages);
    const { unmount } = renderHook(() => useClubChat('club-10'));
    await waitFor(() => expect(mockAuthRequest).toHaveBeenCalledTimes(1));
    unmount();

    clearSessionMessageCache();
    mockAuthRequest.mockClear();

    const { result } = renderHook(() => useClubChat('club-10'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuthRequest).toHaveBeenCalledTimes(1);
  });
});
