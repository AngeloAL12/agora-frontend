import { apiRequest } from './api';

import type {
  NotificationCategory,
  NotificationItem,
  NotificationListResponse,
  NotificationResponse,
} from '@/types/notification';

const DEFAULT_LIMIT = 100;

export async function getNotifications(
  token: string,
  limit = DEFAULT_LIMIT,
  offset = 0,
  category?: NotificationCategory,
): Promise<NotificationItem[]> {
  const query = new URLSearchParams();
  query.append('limit', String(limit));
  query.append('offset', String(offset));

  if (category) {
    query.append('category', category);
  }

  const response = await apiRequest<NotificationListResponse>({
    method: 'GET',
    path: `/notifications?${query.toString()}`,
    token,
  });

  return response.items;
}

export function resolveNotificationHref(
  notification: NotificationItem,
): string {
  if (typeof notification.reference_id === 'number') {
    return `/complaint/${notification.reference_id}`;
  }

  return '/notifications';
}

export async function getUnreadNotificationsCount(
  token: string,
): Promise<number> {
  const notifications = await getNotifications(token);
  return notifications.filter((notification) => !notification.is_read).length;
}

export async function markNotificationAsRead(
  notificationId: string,
  token: string,
): Promise<NotificationItem | null> {
  const response = await apiRequest<NotificationResponse>({
    method: 'PATCH',
    path: `/notifications/${notificationId}/read`,
    token,
  });

  return response ?? null;
}

export async function markAllNotificationsAsRead(token: string): Promise<void> {
  await apiRequest<null>({
    method: 'POST',
    path: '/notifications/read-all',
    token,
  });
}
