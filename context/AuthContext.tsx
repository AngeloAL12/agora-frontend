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
const USER_KEY = 'agora_user';

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
};

type AuthContextValue = AuthState & {
  login: (response: LoginResponse) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const [storedToken, storedUser] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);

        if (storedToken && storedUser) {
          setState({
            token: storedToken,
            user: JSON.parse(storedUser) as AuthUser,
            isLoading: false,
          });
        } else {
          setState({ token: null, user: null, isLoading: false });
        }
      } catch {
        setState({ token: null, user: null, isLoading: false });
      }
    }

    loadStoredAuth();
  }, []);

  const login = useCallback(async (response: LoginResponse) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, response.access_token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user)),
    ]);
    setState({
      token: response.access_token,
      user: response.user,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    setState({ token: null, user: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
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
