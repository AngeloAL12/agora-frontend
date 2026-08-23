export type ContentTargetType = 'POST' | 'COMMENT' | 'MESSAGE';

export type ContentReportReason =
  | 'HARASSMENT'
  | 'HATE_SPEECH'
  | 'SEXUAL_CONTENT'
  | 'VIOLENCE'
  | 'SPAM'
  | 'PERSONAL_INFORMATION'
  | 'OTHER';

export type ContentReportStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'RESOLVED'
  | 'DISMISSED';

export type ModerationAction =
  | 'NONE'
  | 'REMOVE_CONTENT'
  | 'SUSPEND_USER'
  | 'REMOVE_AND_SUSPEND';

export interface ContentReport {
  id: number;
  target_type: ContentTargetType;
  target_id: number;
  reported_user_id: number;
  club_id: number;
  reason: ContentReportReason;
  details: string | null;
  status: ContentReportStatus;
  action_taken: ModerationAction;
  created_at: string;
  reviewed_at: string | null;
}

export interface AdminContentReport extends ContentReport {
  reporter_id: number;
  reporter_name: string;
  reported_user_name: string;
  content_snapshot: string;
  content_image_urls: string[];
  moderator_id: number | null;
  moderator_comment: string | null;
}

export interface BlockedUser {
  id: number;
  name: string;
  photo: string | null;
  blocked_at: string;
}
