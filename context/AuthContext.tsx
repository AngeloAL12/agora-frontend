import * as SecureStore from 'expo-secure-store';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { AuthUser, LoginResponse } from '@/services/authService';

const TOKEN_KEY = 'agora_jwt';
const REFRESH_TOKEN_KEY = 'agora_refresh_token';
const USER_KEY = 'agora_user';

type AuthState = {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticating: boolean;
};

type AuthContextValue = AuthState & {
  login: (response: LoginResponse) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => Promise<void>;
  startAuthentication: () => void;
  finishAuthentication: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    refreshToken: null,
    user: null,
    isLoading: true,
    isAuthenticating: false,
  });

  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const [storedToken, storedRefreshToken, storedUser] = await Promise.all(
          [
            SecureStore.getItemAsync(TOKEN_KEY),
            SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
            SecureStore.getItemAsync(USER_KEY),
          ],
        );

        setState((currentState) => {
          if (currentState.token && currentState.user) {
            return { ...currentState, isLoading: false };
          }

          if (storedToken && storedUser) {
            return {
              token: storedToken,
              refreshToken: storedRefreshToken,
              user: JSON.parse(storedUser) as AuthUser,
              isLoading: false,
              isAuthenticating: currentState.isAuthenticating,
            };
          }

          return {
            token: null,
            refreshToken: null,
            user: null,
            isLoading: false,
            isAuthenticating: currentState.isAuthenticating,
          };
        });
      } catch {
        setState((currentState) =>
          currentState.token && currentState.user
            ? { ...currentState, isLoading: false }
            : {
                token: null,
                refreshToken: null,
                user: null,
                isLoading: false,
                isAuthenticating: currentState.isAuthenticating,
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
    setState({
      token: response.access_token,
      refreshToken: response.refresh_token,
      user: response.user,
      isLoading: false,
      isAuthenticating: false,
    });
  }, []);

  const setTokens = useCallback(
    async (accessToken: string, newRefreshToken: string) => {
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken),
      ]);
      setState((currentState) => ({
        ...currentState,
        token: accessToken,
        refreshToken: newRefreshToken,
      }));
    },
    [],
  );

  const logout = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    setState({
      token: null,
      refreshToken: null,
      user: null,
      isLoading: false,
      isAuthenticating: false,
    });
  }, []);

  const updateUser = useCallback(async (patch: Partial<AuthUser>) => {
    setState((currentState) => {
      if (!currentState.user) return currentState;
      const updatedUser = { ...currentState.user, ...patch };
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser)).catch(
        () => {},
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
