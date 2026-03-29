import { act, renderHook } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../context/AuthContext';

const mockGetItemAsync = jest.fn();
const mockSetItemAsync = jest.fn();
const mockDeleteItemAsync = jest.fn();

jest.mock('expo-secure-store', () => ({
  getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
  setItemAsync: (...args: unknown[]) => mockSetItemAsync(...args),
  deleteItemAsync: (...args: unknown[]) => mockDeleteItemAsync(...args),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with isLoading true then resolves to no auth when storage is empty', async () => {
    mockGetItemAsync.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {});

    expect(result.current.isLoading).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('restores session from SecureStore on mount', async () => {
    const fakeUser = {
      id: 1,
      email: 'test@itmexicali.edu.mx',
      name: 'Test User',
    };
    mockGetItemAsync
      .mockResolvedValueOnce('stored-jwt')
      .mockResolvedValueOnce(JSON.stringify(fakeUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {});

    expect(result.current.token).toBe('stored-jwt');
    expect(result.current.user).toEqual(fakeUser);
    expect(result.current.isLoading).toBe(false);
  });

  it('login saves token and user to SecureStore and updates state', async () => {
    mockGetItemAsync.mockResolvedValue(null);
    mockSetItemAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    const loginResponse = {
      access_token: 'new-jwt',
      token_type: 'bearer',
      user: { id: 2, email: 'user@itmexicali.edu.mx', name: 'User' },
    };

    await act(async () => {
      await result.current.login(loginResponse);
    });

    expect(mockSetItemAsync).toHaveBeenCalledWith('agora_jwt', 'new-jwt');
    expect(mockSetItemAsync).toHaveBeenCalledWith(
      'agora_user',
      JSON.stringify(loginResponse.user),
    );
    expect(result.current.token).toBe('new-jwt');
    expect(result.current.user).toEqual(loginResponse.user);
  });

  it('logout clears SecureStore and resets state', async () => {
    const fakeUser = { id: 1, email: 'test@itmexicali.edu.mx', name: 'Test' };
    mockGetItemAsync
      .mockResolvedValueOnce('jwt')
      .mockResolvedValueOnce(JSON.stringify(fakeUser));
    mockDeleteItemAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    expect(result.current.token).toBe('jwt');

    await act(async () => {
      await result.current.logout();
    });

    expect(mockDeleteItemAsync).toHaveBeenCalledWith('agora_jwt');
    expect(mockDeleteItemAsync).toHaveBeenCalledWith('agora_user');
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('handles SecureStore error gracefully and sets no auth', async () => {
    mockGetItemAsync.mockRejectedValue(new Error('SecureStore unavailable'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    expect(result.current.isLoading).toBe(false);
    expect(result.current.token).toBeNull();
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within AuthProvider',
    );
    consoleSpy.mockRestore();
  });
});
