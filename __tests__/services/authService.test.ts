const mockApiRequest = jest.fn();

jest.mock('@/services/api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

// eslint-disable-next-line import/first
import { deleteMyAccount } from '@/services/authService';

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockResolvedValue(undefined);
  });

  it('elimina la cuenta autenticada con DELETE /users/me', async () => {
    const onTokenRefreshed = jest.fn();

    await deleteMyAccount('access-token', {
      refreshToken: 'refresh-token',
      onTokenRefreshed,
    });

    expect(mockApiRequest).toHaveBeenCalledWith({
      method: 'DELETE',
      path: '/users/me',
      token: 'access-token',
      refreshToken: 'refresh-token',
      onTokenRefreshed,
    });
  });
});
