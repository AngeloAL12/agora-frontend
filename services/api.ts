const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

type RequestOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  token?: string;
};

export type ApiError = {
  status: number;
  detail: string;
};

export async function apiRequest<T>(options: RequestOptions): Promise<T> {
  const { method, path, body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let detail = `HTTP error ${response.status}`;
    try {
      const errorBody = await response.json();
      detail = errorBody.detail ?? detail;
    } catch {
      // response was not JSON
    }
    const error: ApiError = { status: response.status, detail };
    throw error;
  }

  const NO_BODY_STATUSES = new Set([204, 205]);
  const contentLength = response.headers.get('content-length');
  const hasBody =
    !NO_BODY_STATUSES.has(response.status) && contentLength !== '0';
  return (hasBody ? response.json() : Promise.resolve(null)) as Promise<T>;
}
