import { useCallback, useEffect, useState } from 'react';
import { getNotifications } from '@/services/notificationsService';
import type {
  NotificationCategory,
  NotificationItem,
} from '@/types/notification';

export function useNotifications(
  token: string | null,
  category?: NotificationCategory,
  limit = 20,
) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications(token, {
        limit,
        offset: 0,
        category,
      });
      setNotifications(data.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las notificaciones.',
      );
    } finally {
      setLoading(false);
    }
  }, [token, limit, category]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, loading, error, refetch: fetchNotifications };
}
