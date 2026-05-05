import * as SecureStore from 'expo-secure-store';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { AuthUser, LoginResponse } from '@/services/authService';
import { setGlobalAuthProvider } from '@/services/api';

import { CacheService } from '@/services/cacheService';
import { chatSummaryStore } from '@/services/chatSummaryStore';
import { clubChatManager } from '@/services/clubChatManager';

const TOKEN_KEY = 'agora_jwt';
const REFRESH_TOKEN_KEY = 'agora_refresh_token';
const USER_KEY = 'agora_user';
const DEMO_MODE_KEY = 'agora_demo_mode';
const PROFILE_CACHE_KEY = 'agora_profile_cache';

const DEMO_USER: AuthUser = {
  id: 0,
  email: 'demo@agora.local',
  name: 'Usuario demo',
  id_career: 1,
};

type AuthState = {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  isDemoMode: boolean;
};

type AuthContextValue = AuthState & {
  login: (response: LoginResponse) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => Promise<void>;
  startAuthentication: () => void;
  finishAuthentication: () => void;
  enableDemoSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function parseStoredUser(raw: string | null): AuthUser | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function ignoreAsyncResult(
  result: Promise<unknown> | undefined,
): Promise<void> {
  return Promise.resolve(result).then(
    () => undefined,
    () => undefined,
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    refreshToken: null,
    user: null,
    isLoading: true,
    isAuthenticating: false,
    isDemoMode: false,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const setTokensRef = useRef<
    (accessToken: string, refreshToken: string) => Promise<void>
  >(null!);
  const logoutRef = useRef<() => Promise<void>>(null!);

  useEffect(() => {
    setGlobalAuthProvider({
      getRefreshToken: () => stateRef.current.refreshToken,
      onTokenRefreshed: (accessToken, refreshToken) => {
        setTokensRef.current(accessToken, refreshToken).catch(() => {});
      },
      onRefreshFailed: () => {
        logoutRef.current().catch(() => {});
      },
    });
    return () => setGlobalAuthProvider(null);
  }, []);

  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const [storedToken, storedRefreshToken, storedUser, storedDemoMode] =
          await Promise.all([
            SecureStore.getItemAsync(TOKEN_KEY),
            SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
            SecureStore.getItemAsync(USER_KEY),
            SecureStore.getItemAsync(DEMO_MODE_KEY),
          ]);

        const parsedStoredUser = parseStoredUser(storedUser);

        setState((currentState) => {
          if (
            (currentState.token && currentState.user) ||
            (currentState.isDemoMode && currentState.user)
          ) {
            return { ...currentState, isLoading: false };
          }

          if (storedToken && parsedStoredUser) {
            return {
              token: storedToken,
              refreshToken: storedRefreshToken,
              user: parsedStoredUser,
              isLoading: false,
              isAuthenticating: currentState.isAuthenticating,
              isDemoMode: false,
            };
          }

          if (storedDemoMode === '1') {
            return {
              token: null,
              refreshToken: null,
              user: parsedStoredUser ?? { ...DEMO_USER },
              isLoading: false,
              isAuthenticating: currentState.isAuthenticating,
              isDemoMode: true,
            };
          }

          return {
            token: null,
            refreshToken: null,
            user: null,
            isLoading: false,
            isAuthenticating: currentState.isAuthenticating,
            isDemoMode: false,
          };
        });
      } catch {
        setState((currentState) =>
          (currentState.token && currentState.user) ||
          (currentState.isDemoMode && currentState.user)
            ? { ...currentState, isLoading: false }
            : {
                token: null,
                refreshToken: null,
                user: null,
                isLoading: false,
                isAuthenticating: currentState.isAuthenticating,
                isDemoMode: false,
              },
        );
      }
    }

    loadStoredAuth();
  }, []);

  const login = useCallback(async (response: LoginResponse) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, response.access_token),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.refresh_token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user)),
    ]);
    await ignoreAsyncResult(SecureStore.deleteItemAsync(DEMO_MODE_KEY));
    setState({
      token: response.access_token,
      refreshToken: response.refresh_token,
      user: response.user,
      isLoading: false,
      isAuthenticating: false,
      isDemoMode: false,
    });
  }, []);

  const setTokens = useCallback(
    async (accessToken: string, newRefreshToken: string) => {
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken),
      ]);
      await ignoreAsyncResult(SecureStore.deleteItemAsync(DEMO_MODE_KEY));
      setState((currentState) => ({
        ...currentState,
        token: accessToken,
        refreshToken: newRefreshToken,
        isDemoMode: false,
      }));
    },
    [],
  );
  setTokensRef.current = setTokens;

  const logout = useCallback(async () => {
    clubChatManager.closeAll();
    chatSummaryStore.clear();
    CacheService.clearAll();
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
      SecureStore.deleteItemAsync(PROFILE_CACHE_KEY),
      SecureStore.deleteItemAsync(DEMO_MODE_KEY),
    ]);
    setState({
      token: null,
      refreshToken: null,
      user: null,
      isLoading: false,
      isAuthenticating: false,
      isDemoMode: false,
    });
  }, []);
  logoutRef.current = logout;

  const updateUser = useCallback(async (patch: Partial<AuthUser>) => {
    setState((currentState) => {
      if (!currentState.user) return currentState;
      const updatedUser = { ...currentState.user, ...patch };
      void ignoreAsyncResult(
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser)),
      );
      return { ...currentState, user: updatedUser };
    });
  }, []);

  const startAuthentication = useCallback(() => {
    setState((currentState) => ({
      ...currentState,
      isAuthenticating: true,
    }));
  }, []);

  const finishAuthentication = useCallback(() => {
    setState((currentState) => ({
      ...currentState,
      isAuthenticating: false,
    }));
  }, []);

  const enableDemoSession = useCallback(async () => {
    const demoUser = { ...DEMO_USER };

    CacheService.clearAll();
    setState({
      token: null,
      refreshToken: null,
      user: demoUser,
      isLoading: false,
      isAuthenticating: false,
      isDemoMode: true,
    });

    await Promise.allSettled([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(demoUser)),
      SecureStore.setItemAsync(DEMO_MODE_KEY, '1'),
      SecureStore.deleteItemAsync(PROFILE_CACHE_KEY),
    ]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        setTokens,
        updateUser,
        startAuthentication,
        finishAuthentication,
        enableDemoSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
