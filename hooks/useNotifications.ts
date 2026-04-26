import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getNotifications,
  markNotificationRead,
} from '@/services/notificationsService';
import type {
  NotificationCategory,
  NotificationItem,
} from '@/types/notification';

const MARK_READ_DEBOUNCE_MS = 500;

// Module-level cache: survives tab switches but is cleared on explicit refetch.
// Key format: "<category>|<limit>"  (category is "ALL" when undefined)
const notificationsCache = new Map<string, NotificationItem[]>();

function cacheKey(category: NotificationCategory | undefined, limit: number) {
  return `${category ?? 'ALL'}|${limit}`;
}

export function useNotifications(
  token: string | null,
  category?: NotificationCategory,
  limit = 20,
) {
  const key = cacheKey(category, limit);
  const cached = notificationsCache.get(key);

  const [notifications, setNotifications] = useState<NotificationItem[]>(
    cached ?? [],
  );
  const [loading, setLoading] = useState(!cached); // skip loading if we already have data
  const [error, setError] = useState<string | null>(null);
  const debounceTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const fetchNotifications = useCallback(
    async (force = false) => {
      if (!token) return;

      // Serve from cache unless this is a forced refresh
      const hit = notificationsCache.get(key);
      if (hit && !force) {
        setNotifications(hit);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getNotifications(token, {
          limit,
          offset: 0,
          category,
        });
        notificationsCache.set(key, data.items);
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
    },
    [token, limit, category, key],
  );

  // Explicit refetch exposed to callers (e.g. pull-to-refresh) — always bypasses cache
  const refetch = useCallback(
    () => fetchNotifications(true),
    [fetchNotifications],
  );

  const markRead = useCallback(
    (notificationId: number) => {
      if (!token) return;

      const existing = debounceTimers.current.get(notificationId);
      if (existing) clearTimeout(existing);

      // Optimistic update in state + cache
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        );
        notificationsCache.set(key, updated);
        return updated;
      });

      const timer = setTimeout(() => {
        debounceTimers.current.delete(notificationId);
        void markNotificationRead(token, notificationId);
      }, MARK_READ_DEBOUNCE_MS);

      debounceTimers.current.set(notificationId, timer);
    },
    [token, key],
  );

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  // Clear pending timers on unmount
  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  return { notifications, loading, error, refetch, markRead };
}
