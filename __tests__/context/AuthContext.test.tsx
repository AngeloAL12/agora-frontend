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
    expect(result.current.isAuthenticating).toBe(false);
  });

  it('restores session from SecureStore on mount', async () => {
    const fakeUser = {
      id: 1,
      email: 'test@itmexicali.edu.mx',
      name: 'Test User',
    };
    mockGetItemAsync
      .mockResolvedValueOnce('stored-jwt')
      .mockResolvedValueOnce('stored-refresh')
      .mockResolvedValueOnce(JSON.stringify(fakeUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {});

    expect(result.current.token).toBe('stored-jwt');
    expect(result.current.user).toEqual(fakeUser);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticating).toBe(false);
  });

  it('login saves token and user to SecureStore and updates state', async () => {
    mockGetItemAsync.mockResolvedValue(null);
    mockSetItemAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    const loginResponse = {
      access_token: 'new-jwt',
      refresh_token: 'new-refresh',
      token_type: 'bearer',
      user: {
        id: 2,
        email: 'user@itmexicali.edu.mx',
        name: 'User',
        id_career: null,
      },
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
    expect(result.current.isAuthenticating).toBe(false);
  });

  it('does not let the initial storage load overwrite a fresh login', async () => {
    let resolveStoredToken: (value: string | null) => void;
    let resolveStoredUser: (value: string | null) => void;

    mockGetItemAsync
      .mockImplementationOnce(
        () =>
          new Promise<string | null>((resolve) => {
            resolveStoredToken = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise<string | null>((resolve) => {
            resolveStoredUser = resolve;
          }),
      );
    mockSetItemAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    const loginResponse = {
      access_token: 'fresh-jwt',
      refresh_token: 'fresh-refresh',
      token_type: 'bearer',
      user: {
        id: 3,
        email: 'fresh@itmexicali.edu.mx',
        name: 'Fresh',
        id_career: null,
      },
    };

    await act(async () => {
      await result.current.login(loginResponse);
    });

    await act(async () => {
      resolveStoredToken!(null);
      resolveStoredUser!(null);
    });

    expect(result.current.token).toBe('fresh-jwt');
    expect(result.current.user).toEqual(loginResponse.user);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticating).toBe(false);
  });

  it('logout clears SecureStore and resets state', async () => {
    const fakeUser = { id: 1, email: 'test@itmexicali.edu.mx', name: 'Test' };
    mockGetItemAsync
      .mockResolvedValueOnce('jwt')
      .mockResolvedValueOnce('refresh-jwt')
      .mockResolvedValueOnce(JSON.stringify(fakeUser));
    mockDeleteItemAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    expect(result.current.token).toBe('jwt');

    await act(async () => {
      await result.current.logout();
    });

    expect(mockDeleteItemAsync).toHaveBeenCalledWith('agora_jwt');
    expect(mockDeleteItemAsync).toHaveBeenCalledWith('agora_refresh_token');
    expect(mockDeleteItemAsync).toHaveBeenCalledWith('agora_user');
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticating).toBe(false);
  });

  it('logout resets state even when secure storage cleanup fails', async () => {
    const fakeUser = { id: 1, email: 'test@itmexicali.edu.mx', name: 'Test' };
    mockGetItemAsync
      .mockResolvedValueOnce('jwt')
      .mockResolvedValueOnce('refresh-jwt')
      .mockResolvedValueOnce(JSON.stringify(fakeUser));
    mockDeleteItemAsync.mockRejectedValue(new Error('SecureStore unavailable'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.refreshToken).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('handles SecureStore error gracefully and sets no auth', async () => {
    mockGetItemAsync.mockRejectedValue(new Error('SecureStore unavailable'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    expect(result.current.isLoading).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticating).toBe(false);
  });

  it('tracks authentication flow state', async () => {
    mockGetItemAsync.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    act(() => {
      result.current.startAuthentication();
    });

    expect(result.current.isAuthenticating).toBe(true);

    act(() => {
      result.current.finishAuthentication();
    });

    expect(result.current.isAuthenticating).toBe(false);
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
