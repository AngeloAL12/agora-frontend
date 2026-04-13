const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

type ApiRequestOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: any;
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
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error('No se encontró EXPO_PUBLIC_API_URL en el .env');
  }

  const headers: Record<string, string> = {};

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: isMultipart ? body : body ? JSON.stringify(body) : undefined,
  });

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw (data ?? { detail: 'Ocurrió un error en la petición' }) as ApiError;
  }

  return data as T;
}
