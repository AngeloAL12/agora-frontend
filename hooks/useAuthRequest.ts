import { useCallback } from 'react';

import { useAuth } from '@/context/AuthContext';
import { apiRequest, ApiError } from '@/services/api';

type AuthRequestOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  isMultipart?: boolean;
};

/**
 * Returns an `authRequest` function that automatically:
 * - Attaches the current access token as Bearer header
 * - On 401, silently refreshes the token and retries once
 * - On refresh failure, logs the user out
 */
export function useAuthRequest() {
  const { token, refreshToken, setTokens, logout } = useAuth();

  const authRequest = useCallback(
    <T>(options: AuthRequestOptions): Promise<T> => {
      return apiRequest<T>({
        ...options,
        token: token ?? undefined,
        refreshToken: refreshToken ?? undefined,
        onTokenRefreshed: (newAccess, newRefresh) => {
          setTokens(newAccess, newRefresh).catch(() => {});
        },
        onRefreshFailed: () => {
          logout().catch(() => {});
        },
      });
    },
    [token, refreshToken, setTokens, logout],
  );

  return authRequest;
}
