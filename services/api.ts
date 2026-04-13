const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

type ApiRequestOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  token?: string;
  isMultipart?: boolean;
};

export type ApiError = {
  detail?: string;
  message?: string;
  [key: string]: any;
};

export async function apiRequest<T>({
  method,
  path,
  body,
  token,
  isMultipart = false,
}: ApiRequestOptions): Promise<T> {
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

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw (data ?? {
      detail: `HTTP error ${response.status}`,
      status: response.status,
    }) as ApiError;
  }

  const NO_BODY_STATUSES = new Set([204, 205]);
  const contentLength = response.headers.get('content-length');
  const hasBody =
    !NO_BODY_STATUSES.has(response.status) && contentLength !== '0';

  if (!hasBody) {
    return null as T;
  }

  return data as T;
}
