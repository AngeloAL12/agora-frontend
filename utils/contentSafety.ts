import { colors } from '@/constants/theme';
import {
  ContentReportReason,
  ContentReportStatus,
  ContentTargetType,
  ModerationAction,
} from '@/types/contentSafety';

export const CONTENT_REASON_LABELS: Record<ContentReportReason, string> = {
  HARASSMENT: 'Acoso o intimidación',
  HATE_SPEECH: 'Discriminación u odio',
  SEXUAL_CONTENT: 'Contenido sexual',
  VIOLENCE: 'Violencia o amenazas',
  SPAM: 'Spam o fraude',
  PERSONAL_INFORMATION: 'Información personal',
  OTHER: 'Otro motivo',
};

export const CONTENT_TARGET_LABELS: Record<ContentTargetType, string> = {
  POST: 'Publicación',
  COMMENT: 'Comentario',
  MESSAGE: 'Mensaje',
};

export const CONTENT_ACTION_LABELS: Record<ModerationAction, string> = {
  NONE: 'Sin medidas sobre el contenido',
  REMOVE_CONTENT: 'Contenido retirado',
  SUSPEND_USER: 'Usuario suspendido',
  REMOVE_AND_SUSPEND: 'Contenido retirado y usuario suspendido',
};

export const CONTENT_STATUS_META: Record<
  ContentReportStatus,
  { label: string; background: string; text: string }
> = {
  PENDING: {
    label: 'Pendiente',
    background: colors.reportPending,
    text: colors.gray900,
  },
  IN_REVIEW: {
    label: 'En revisión',
    background: colors.reportInProgress,
    text: colors.reportInProgressText,
  },
  RESOLVED: {
    label: 'Resuelto',
    background: colors.reportResolved,
    text: colors.reportResolvedText,
  },
  DISMISSED: {
    label: 'Descartado',
    background: colors.reportRejected,
    text: colors.reportRejectedText,
  },
};
