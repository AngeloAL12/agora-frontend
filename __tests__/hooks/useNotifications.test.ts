import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  clearNotificationsCache,
  useNotifications,
} from '../../hooks/useNotifications';
import { getNotifications } from '../../services/notificationsService';

jest.mock('../../services/notificationsService', () => ({
  getNotifications: jest.fn(),
  markNotificationRead: jest.fn(),
}));

const mockGetNotifications = getNotifications as jest.Mock;

const MOCK_ITEMS = [
  {
    id: 1,
    category: 'REPORTS' as const,
    event_type: 'COMPLAINT_SUBMITTED' as const,
    title: 'Reporte enviado',
    body: 'Tu reporte fue recibido.',
    is_read: false,
    reference_id: 42,
    created_at: '2024-01-15T10:00:00Z',
  },
];

describe('useNotifications', () => {
  beforeEach(() => {
    clearNotificationsCache();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches notifications on mount when token is provided', async () => {
    mockGetNotifications.mockResolvedValueOnce({
      items: MOCK_ITEMS,
      total: 1,
      limit: 20,
      offset: 0,
    });

    const { result } = renderHook(() => useNotifications('test-token'));

    await waitFor(() => {
      expect(result.current.notifications).toEqual(MOCK_ITEMS);
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetNotifications).toHaveBeenCalledWith('test-token', {
      limit: 20,
      offset: 0,
      category: undefined,
    });
  });

  it('does not fetch when token is null', async () => {
    const { result } = renderHook(() => useNotifications(null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetNotifications).not.toHaveBeenCalled();
    expect(result.current.notifications).toEqual([]);
  });

  it('sets loading to true during fetch', async () => {
    let resolve: (v: unknown) => void;
    mockGetNotifications.mockReturnValueOnce(
      new Promise((res) => {
        resolve = res;
      }),
    );

    const { result } = renderHook(() => useNotifications('test-token'));

    expect(result.current.loading).toBe(true);

    resolve!({ items: [], total: 0, limit: 20, offset: 0 });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('exposes refetch function that re-fetches', async () => {
    mockGetNotifications
      .mockResolvedValueOnce({
        items: MOCK_ITEMS,
        total: 1,
        limit: 20,
        offset: 0,
      })
      .mockResolvedValueOnce({ items: [], total: 0, limit: 20, offset: 0 });

    const { result } = renderHook(() => useNotifications('test-token'));

    await waitFor(() => {
      expect(result.current.notifications).toEqual(MOCK_ITEMS);
    });

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.notifications).toEqual([]);
    });

    expect(mockGetNotifications).toHaveBeenCalledTimes(2);
  });

  it('sets error on fetch failure', async () => {
    mockGetNotifications.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useNotifications('test-token'));

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
      expect(result.current.loading).toBe(false);
      expect(result.current.notifications).toEqual([]);
    });
  });

  it('passes category and limit to the service', async () => {
    mockGetNotifications.mockResolvedValueOnce({
      items: [],
      total: 0,
      limit: 3,
      offset: 0,
    });

    renderHook(() => useNotifications('test-token', 'REPORTS', 3));

    await waitFor(() => {
      expect(mockGetNotifications).toHaveBeenCalledWith('test-token', {
        limit: 3,
        offset: 0,
        category: 'REPORTS',
      });
    });
  });
});
