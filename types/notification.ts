export type NotificationCategory = 'REPORTS' | 'CLUBS';

export type NotificationEventType =
  | 'COMPLAINT_SUBMITTED'
  | 'COMPLAINT_IN_PROGRESS'
  | 'COMPLAINT_RESOLVED'
  | 'COMPLAINT_REJECTED'
  | 'CLUB_JOIN_REQUEST'
  | 'CLUB_JOIN_ACCEPTED'
  | 'CLUB_JOIN_REJECTED';

export type NotificationItem = {
  id: number;
  category: NotificationCategory;
  event_type: NotificationEventType;
  title: string;
  body: string;
  is_read: boolean;
  reference_id: number | null;
  extra_id?: number | null;
  created_at: string;
};

export type NotificationResponse = NotificationItem;

export type NotificationListResponse = {
  items: NotificationItem[];
  total: number;
  limit: number;
  offset: number;
};
