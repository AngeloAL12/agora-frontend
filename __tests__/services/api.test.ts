// Note: api.ts uses a dynamic `await import('./authService')` for refresh logic.
// Dynamic imports cannot be intercepted by jest.mock in this Jest config without
// --experimental-vm-modules, so the 401-refresh-with-retry flow is tested
// through useAuthRequest (integration) instead of here.

const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

describe('apiRequest', () => {
  let apiRequest: typeof import('../../services/api').apiRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env.EXPO_PUBLIC_API_URL = 'https://test.example.com';
    ({ apiRequest } = require('../../services/api'));
  });

  afterAll(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
  });

  function makeRes(status: number, data: unknown, okOverride?: boolean) {
    return {
      ok: okOverride ?? (status >= 200 && status < 300),
      status,
      json: jest.fn().mockResolvedValue(data),
    };
  }

  it('GETs data and returns parsed JSON', async () => {
    mockFetch.mockResolvedValue(makeRes(200, { id: 1 }));
    const result = await apiRequest({
      method: 'GET',
      path: '/items',
      token: 'tok',
    });
    expect(result).toEqual({ id: 1 });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://test.example.com/items',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer tok' }),
      }),
    );
  });

  it('POSTs with JSON-stringified body', async () => {
    mockFetch.mockResolvedValue(makeRes(201, { id: 2 }));
    await apiRequest({
      method: 'POST',
      path: '/items',
      body: { name: 'test' },
      token: 'tok',
    });
    const body = (mockFetch.mock.calls[0][1] as RequestInit).body;
    expect(body).toBe(JSON.stringify({ name: 'test' }));
  });

  it('sets Content-Type application/json by default', async () => {
    mockFetch.mockResolvedValue(makeRes(200, {}));
    await apiRequest({ method: 'GET', path: '/items', token: 'tok' });
    const headers = (mockFetch.mock.calls[0][1] as RequestInit)
      .headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('omits Content-Type for multipart', async () => {
    mockFetch.mockResolvedValue(makeRes(200, {}));
    await apiRequest({
      method: 'POST',
      path: '/upload',
      body: new FormData(),
      token: 'tok',
      isMultipart: true,
    });
    const headers = (mockFetch.mock.calls[0][1] as RequestInit)
      .headers as Record<string, string>;
    expect(headers['Content-Type']).toBeUndefined();
  });

  it('omits Authorization when no token', async () => {
    mockFetch.mockResolvedValue(makeRes(200, {}));
    await apiRequest({ method: 'GET', path: '/public' });
    const headers = (mockFetch.mock.calls[0][1] as RequestInit)
      .headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it('returns null for 204 response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 204,
      json: jest.fn().mockRejectedValue(new Error()),
    });
    const result = await apiRequest({
      method: 'DELETE',
      path: '/items/1',
      token: 'tok',
    });
    expect(result).toBeNull();
  });

  it('returns null for 205 response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 205,
      json: jest.fn().mockResolvedValue(null),
    });
    const result = await apiRequest({
      method: 'GET',
      path: '/items',
      token: 'tok',
    });
    expect(result).toBeNull();
  });

  it('throws error body on non-ok response', async () => {
    mockFetch.mockResolvedValue(makeRes(400, { detail: 'Bad request' }));
    await expect(apiRequest({ method: 'GET', path: '/bad' })).rejects.toEqual({
      detail: 'Bad request',
    });
  });

  it('throws fallback error when response body is not parseable', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockRejectedValue(new Error()),
    });
    await expect(
      apiRequest({ method: 'GET', path: '/error' }),
    ).rejects.toMatchObject({
      detail: 'HTTP error 500',
      status: 500,
    });
  });

  it('throws when BASE_URL env var is not set', async () => {
    jest.resetModules();
    delete process.env.EXPO_PUBLIC_API_URL;
    const { apiRequest: freshApiRequest } = require('../../services/api');
    await expect(
      freshApiRequest({ method: 'GET', path: '/items' }),
    ).rejects.toThrow('No se encontró EXPO_PUBLIC_API_URL');
  });

  it('handles JSON parse failure and returns null data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockRejectedValue(new Error('parse fail')),
    });
    const result = await apiRequest({ method: 'GET', path: '/items' });
    expect(result).toBeNull();
  });

  it('throws 401 error without retry when no refreshToken provided', async () => {
    mockFetch.mockResolvedValue(makeRes(401, null, false));
    await expect(
      apiRequest({ method: 'GET', path: '/secure', token: 'old' }),
    ).rejects.toMatchObject({ detail: 'HTTP error 401', status: 401 });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
