import { act, renderHook } from '@testing-library/react-native';
import { AuthProvider } from '../../context/AuthContext';

const mockGetItemAsync = jest.fn();
const mockSetItemAsync = jest.fn();
const mockDeleteItemAsync = jest.fn();

jest.mock('expo-secure-store', () => ({
  getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
  setItemAsync: (...args: unknown[]) => mockSetItemAsync(...args),
  deleteItemAsync: (...args: unknown[]) => mockDeleteItemAsync(...args),
}));

jest.mock('../../services/clubChatManager', () => ({
  clubChatManager: { closeAll: jest.fn() },
}));
jest.mock('../../services/chatSummaryStore', () => ({
  chatSummaryStore: { clear: jest.fn() },
}));
jest.mock('../../hooks/useClubChat', () => ({
  clearSessionMessageCache: jest.fn(),
}));

const mockApiRequest = jest.fn();
jest.mock('../../services/api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuthRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItemAsync.mockResolvedValue(null);
  });

  it('calls apiRequest with token and refresh token from auth context', async () => {
    mockGetItemAsync
      .mockResolvedValueOnce('stored-jwt')
      .mockResolvedValueOnce('stored-refresh')
      .mockResolvedValueOnce(JSON.stringify({ id: 1, name: 'Test' }));

    mockApiRequest.mockResolvedValue({ data: 'ok' });

    const { useAuthRequest } = require('../../hooks/useAuthRequest');
    const { result } = renderHook(() => useAuthRequest(), { wrapper });
    await act(async () => {});

    await act(async () => {
      await result.current({ method: 'GET', path: '/test' });
    });

    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/test',
        token: 'stored-jwt',
        refreshToken: 'stored-refresh',
      }),
    );
  });

  it('passes undefined token when not authenticated', async () => {
    mockApiRequest.mockResolvedValue(null);
    const { useAuthRequest } = require('../../hooks/useAuthRequest');
    const { result } = renderHook(() => useAuthRequest(), { wrapper });
    await act(async () => {});

    await act(async () => {
      await result.current({ method: 'GET', path: '/public' });
    });

    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({ token: undefined, refreshToken: undefined }),
    );
  });
});
