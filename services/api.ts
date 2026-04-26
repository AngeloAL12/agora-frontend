const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

type ApiRequestOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  token?: string;
  isMultipart?: boolean;
  /**
   * Refresh token used to silently renew the access token on 401.
   * When provided, a failed 401 will trigger one automatic retry.
   */
  refreshToken?: string;
  /** Called with new tokens after a successful silent refresh. */
  onTokenRefreshed?: (accessToken: string, refreshToken: string) => void;
  /** Called when the refresh itself fails — caller should log the user out. */
  onRefreshFailed?: () => void;
};

export type ApiError = {
  detail?: string;
  message?: string;
  [key: string]: any;
};

async function _rawFetch<T>(
  method: string,
  path: string,
  body: unknown,
  token: string | undefined,
  isMultipart: boolean,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  if (!BASE_URL) {
    throw new Error('No se encontró EXPO_PUBLIC_API_URL en el .env');
  }

  const headers: Record<string, string> = {};

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const requestBody: BodyInit | undefined = isMultipart
    ? (body as BodyInit | undefined)
    : body !== undefined
      ? JSON.stringify(body)
      : undefined;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: requestBody,
  });

  let data: T | null = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { ok: response.ok, status: response.status, data };
}

export async function apiRequest<T>({
  method,
  path,
  body,
  token,
  isMultipart = false,
  refreshToken,
  onTokenRefreshed,
  onRefreshFailed,
}: ApiRequestOptions): Promise<T> {
  const result = await _rawFetch<T>(method, path, body, token, isMultipart);

  if (!result.ok) {
    // Attempt silent token refresh on 401 if we have a refresh token
    if (result.status === 401 && refreshToken) {
      try {
        const { refreshAccessToken } = await import('./authService');
        const refreshed = await refreshAccessToken(refreshToken);

        onTokenRefreshed?.(refreshed.access_token, refreshed.refresh_token);

        // Retry original request with new access token
        const retry = await _rawFetch<T>(
          method,
          path,
          body,
          refreshed.access_token,
          isMultipart,
        );

        if (!retry.ok) {
          throw (retry.data ?? {
            detail: `HTTP error ${retry.status}`,
            status: retry.status,
          }) as ApiError;
        }

        const NO_BODY_STATUSES_RETRY = new Set([204, 205]);
        if (NO_BODY_STATUSES_RETRY.has(retry.status)) return null as T;
        return retry.data as T;
      } catch (refreshError) {
        onRefreshFailed?.();
        throw refreshError;
      }
    }

    throw (result.data ?? {
      detail: `HTTP error ${result.status}`,
      status: result.status,
    }) as ApiError;
  }

  const NO_BODY_STATUSES = new Set([204, 205]);
  if (NO_BODY_STATUSES.has(result.status)) return null as T;

  return result.data as T;
}
