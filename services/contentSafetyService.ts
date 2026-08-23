import { apiRequest } from '@/services/api';
import {
  AdminContentReport,
  BlockedUser,
  ContentReport,
  ContentReportReason,
  ContentReportStatus,
  ContentTargetType,
  ModerationAction,
} from '@/types/contentSafety';

export function reportContent(
  targetType: ContentTargetType,
  targetId: number,
  reason: ContentReportReason,
  details: string | undefined,
  token: string,
): Promise<ContentReport> {
  return apiRequest({
    method: 'POST',
    path: '/content-safety/reports',
    token,
    body: {
      target_type: targetType,
      target_id: targetId,
      reason,
      details: details?.trim() || undefined,
    },
  });
}

export function getMyContentReports(token: string): Promise<ContentReport[]> {
  return apiRequest({
    method: 'GET',
    path: '/content-safety/reports/me',
    token,
  });
}

export function blockUser(userId: number, token: string): Promise<BlockedUser> {
  return apiRequest({
    method: 'POST',
    path: `/content-safety/blocks/${userId}`,
    token,
  });
}

export function unblockUser(userId: number, token: string): Promise<void> {
  return apiRequest({
    method: 'DELETE',
    path: `/content-safety/blocks/${userId}`,
    token,
  });
}

export function getBlockedUsers(token: string): Promise<BlockedUser[]> {
  return apiRequest({
    method: 'GET',
    path: '/content-safety/blocks/me',
    token,
  });
}

export function getAdminContentReports(
  token: string,
  status?: ContentReportStatus,
): Promise<AdminContentReport[]> {
  const query = status ? `?status=${status}` : '';
  return apiRequest({
    method: 'GET',
    path: `/content-safety/admin/reports${query}`,
    token,
  });
}

export function moderateContentReport(
  reportId: number,
  payload: {
    status: Exclude<ContentReportStatus, 'PENDING'>;
    action: ModerationAction;
    moderator_comment?: string;
  },
  token: string,
): Promise<AdminContentReport> {
  return apiRequest({
    method: 'PATCH',
    path: `/content-safety/admin/reports/${reportId}`,
    body: payload,
    token,
  });
}
