import { colors } from '@/constants/theme';
import type { ComplaintStatus } from '@/services/reportService';

export type DateFilter = 'all' | 'today' | 'week' | 'month' | 'thirtyDays';

export const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Esta semana' },
  { key: 'month', label: 'Este mes' },
  { key: 'thirtyDays', label: '30 dias' },
];

export const STAFF_ROLES = new Set(['staff', 'admin']);

export function isStaffRole(role?: string | null) {
  return STAFF_ROLES.has((role ?? '').trim().toLowerCase());
}

export function normalizeComplaintStatus(status?: string): ComplaintStatus {
  const normalized = (status ?? '').trim().toUpperCase();

  if (normalized === 'EN PROCESO') return 'IN_PROGRESS';
  if (normalized === 'RESUELTO') return 'RESOLVED';
  if (normalized === 'RECHAZADO') return 'REJECTED';
  if (normalized === 'PENDIENTE') return 'PENDING';

  if (
    normalized === 'PENDING' ||
    normalized === 'IN_PROGRESS' ||
    normalized === 'RESOLVED' ||
    normalized === 'REJECTED'
  ) {
    return normalized;
  }

  return 'PENDING';
}

export const complaintStatusOptions: {
  value: ComplaintStatus;
  label: string;
}[] = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'IN_PROGRESS', label: 'En proceso' },
  { value: 'RESOLVED', label: 'Resuelto' },
  { value: 'REJECTED', label: 'Rechazado' },
];

export function getComplaintStatusMeta(status?: string) {
  const normalized = normalizeComplaintStatus(status);

  const map = {
    PENDING: {
      bg: colors.reportPending,
      text: colors.gray900,
      label: 'Pendiente',
    },
    IN_PROGRESS: {
      bg: colors.reportInProgress,
      text: colors.reportInProgressText,
      label: 'En proceso',
    },
    RESOLVED: {
      bg: colors.reportResolved,
      text: colors.reportResolvedText,
      label: 'Resuelto',
    },
    REJECTED: {
      bg: colors.reportRejected,
      text: colors.reportRejectedText,
      label: 'Rechazado',
    },
  } as const;

  return map[normalized];
}

export function isWithinDateFilter(dateValue: string, filter: DateFilter) {
  if (filter === 'all') return true;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  if (filter === 'today') {
    return date >= startOfToday;
  }

  if (filter === 'week') {
    const weekAgo = new Date(startOfToday);
    weekAgo.setDate(startOfToday.getDate() - 7);
    return date >= weekAgo;
  }

  if (filter === 'month') {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

  const thirtyDaysAgo = new Date(startOfToday);
  thirtyDaysAgo.setDate(startOfToday.getDate() - 30);
  return date >= thirtyDaysAgo;
}
