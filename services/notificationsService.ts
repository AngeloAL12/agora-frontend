import { apiRequest } from './api';
import type {
  NotificationCategory,
  NotificationItem,
  NotificationListResponse,
} from '@/types/notification';

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
  const response = await getNotifications(token);
  return response.items.filter((n) => !n.is_read).length;
}

export async function getNotifications(
  token: string,
  params?: {
    limit?: number;
    offset?: number;
    category?: NotificationCategory;
  },
): Promise<NotificationListResponse> {
  const query = new URLSearchParams();
  if (params?.limit != null) query.append('limit', String(params.limit));
  if (params?.offset != null) query.append('offset', String(params.offset));
  if (params?.category) query.append('category', params.category);

  const qs = query.toString();
  return apiRequest<NotificationListResponse>({
    method: 'GET',
    path: `/notifications${qs ? `?${qs}` : ''}`,
    token,
  });
}

export async function markNotificationRead(
  token: string,
  notificationId: number,
): Promise<NotificationItem | null> {
  const response = await apiRequest<NotificationItem>({
    method: 'PATCH',
    path: `/notifications/${notificationId}/read`,
    token,
  });

  return response ?? null;
}

export async function markAllNotificationsRead(token: string): Promise<void> {
  await apiRequest({
    method: 'POST',
    path: '/notifications/read-all',
    token,
  });
}
