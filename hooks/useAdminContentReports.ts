import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import {
  getAdminContentReports,
  moderateContentReport,
} from '@/services/contentSafetyService';
import {
  AdminContentReport,
  ContentReportStatus,
  ModerationAction,
} from '@/types/contentSafety';

export function useAdminContentReports() {
  const { token } = useAuth();
  const [reports, setReports] = useState<AdminContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (refresh = false) => {
      if (!token) {
        setReports([]);
        setLoading(false);
        return;
      }
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        setReports(await getAdminContentReports(token));
      } catch (requestError) {
        const apiError = requestError as { detail?: string };
        setError(apiError?.detail ?? 'No se pudo cargar la moderación.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const moderate = useCallback(
    async (
      reportId: number,
      status: Exclude<ContentReportStatus, 'PENDING'>,
      action: ModerationAction,
      comment?: string,
    ) => {
      if (!token) throw new Error('Sesión no disponible');
      const updated = await moderateContentReport(
        reportId,
        {
          status,
          action,
          moderator_comment: comment?.trim() || undefined,
        },
        token,
      );
      setReports((current) =>
        current.map((report) => (report.id === updated.id ? updated : report)),
      );
      return updated;
    },
    [token],
  );

  return { reports, loading, refreshing, error, refetch: load, moderate };
}
