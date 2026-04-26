import type { NotificationEventType } from '@/types/notification';

export const NOTIFICATION_ICON_MAP: Record<NotificationEventType, string> = {
  COMPLAINT_SUBMITTED:
    require('@/assets/icons/notifications/sent.svg') as string,
  COMPLAINT_IN_PROGRESS:
    require('@/assets/icons/notifications/updatedreport.svg') as string,
  COMPLAINT_RESOLVED:
    require('@/assets/icons/notifications/resolved.svg') as string,
  COMPLAINT_REJECTED:
    require('@/assets/icons/notifications/refused.svg') as string,
};

export const NOTIFICATION_ICON_BG_MAP: Record<NotificationEventType, string> = {
  COMPLAINT_SUBMITTED: '#EAF7EF',
  COMPLAINT_IN_PROGRESS: '#DBEAFE',
  COMPLAINT_RESOLVED: '#D4EFDF',
  COMPLAINT_REJECTED: '#FADBD8',
};
