import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_API_PORT = 8000;

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

const parseHost = (value: string) => {
  const withoutScheme = value.replace(/^[a-z]+:\/\//i, '');
  const hostPort = withoutScheme.split('/')[0] ?? '';
  const host = hostPort.split(':')[0] ?? '';
  return host.length > 0 ? host : null;
};

const getApiBaseUrl = () => {
  const envUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL ?? process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    if (Platform.OS !== 'android') return normalizeBaseUrl(envUrl);

    const normalized = normalizeBaseUrl(envUrl);
    const host = parseHost(normalized);
    if (!host) return normalized;

    if (host === 'localhost' || host === '127.0.0.1') {
      return normalized.replace(host, '10.0.2.2');
    }

    return normalized;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  const debuggerHost = (
    Constants.expoConfig as unknown as { debuggerHost?: string } | null
  )?.debuggerHost;

  let host: string | null = null;
  if (hostUri) host = parseHost(hostUri);
  else if (debuggerHost) host = parseHost(debuggerHost);

  if (Platform.OS === 'android') {
    const resolvedHost =
      host && (host === 'localhost' || host === '127.0.0.1')
        ? '10.0.2.2'
        : host;
    return `http://${resolvedHost ?? '10.0.2.2'}:${DEFAULT_API_PORT}`;
  }

  return `http://${host ?? '127.0.0.1'}:${DEFAULT_API_PORT}`;
};

export const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  status: number;
  bodyText?: string;

  constructor(message: string, status: number, bodyText?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.bodyText = bodyText;
  }
}

export async function apiFetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => undefined);
    throw new ApiError(
      `Request failed: ${response.status}`,
      response.status,
      bodyText,
    );
  }

  return (await response.json()) as T;
}
