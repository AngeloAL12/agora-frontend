const mockApiRequest = jest.fn();

jest.mock('@/services/api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

// eslint-disable-next-line import/first
import {
  blockUser,
  getAdminContentReports,
  getBlockedUsers,
  getMyContentReports,
  moderateContentReport,
  reportContent,
  unblockUser,
} from '@/services/contentSafetyService';

describe('contentSafetyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockResolvedValue(undefined);
  });

  it('envía una denuncia normalizando los detalles vacíos', async () => {
    await reportContent('POST', 17, 'SPAM', '   ', 'token');

    expect(mockApiRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/content-safety/reports',
      token: 'token',
      body: {
        target_type: 'POST',
        target_id: 17,
        reason: 'SPAM',
        details: undefined,
      },
    });
  });

  it('consulta las denuncias de la persona autenticada', async () => {
    await getMyContentReports('token');
    expect(mockApiRequest).toHaveBeenCalledWith({
      method: 'GET',
      path: '/content-safety/reports/me',
      token: 'token',
    });
  });

  it('bloquea, lista y desbloquea usuarios', async () => {
    await blockUser(22, 'token');
    await getBlockedUsers('token');
    await unblockUser(22, 'token');

    expect(mockApiRequest).toHaveBeenNthCalledWith(1, {
      method: 'POST',
      path: '/content-safety/blocks/22',
      token: 'token',
    });
    expect(mockApiRequest).toHaveBeenNthCalledWith(2, {
      method: 'GET',
      path: '/content-safety/blocks/me',
      token: 'token',
    });
    expect(mockApiRequest).toHaveBeenNthCalledWith(3, {
      method: 'DELETE',
      path: '/content-safety/blocks/22',
      token: 'token',
    });
  });

  it('filtra y modera denuncias con endpoints exclusivos de admin', async () => {
    await getAdminContentReports('admin-token', 'PENDING');
    await moderateContentReport(
      9,
      {
        status: 'RESOLVED',
        action: 'REMOVE_CONTENT',
        moderator_comment: 'Confirmado',
      },
      'admin-token',
    );

    expect(mockApiRequest).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      path: '/content-safety/admin/reports?status=PENDING',
      token: 'admin-token',
    });
    expect(mockApiRequest).toHaveBeenNthCalledWith(2, {
      method: 'PATCH',
      path: '/content-safety/admin/reports/9',
      token: 'admin-token',
      body: {
        status: 'RESOLVED',
        action: 'REMOVE_CONTENT',
        moderator_comment: 'Confirmado',
      },
    });
  });
});
