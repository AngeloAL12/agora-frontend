import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import type { Complaint } from '@/hooks/useComplaints';
import { getAllComplaints } from '@/services/reportService';

const STAFF_REPORTS_PAGE_SIZE = 20;

export function useStaffComplaints() {
  const { token, refreshToken, setTokens, logout } = useAuth();
  const [reports, setReports] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(
    async (_forceRefresh = false) => {
      if (!token) {
        setReports([]);
        setHasMore(false);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getAllComplaints<Complaint[]>({
          token,
          refreshToken: refreshToken ?? undefined,
          onTokenRefreshed: (newAccess, newRefresh) => {
            setTokens(newAccess, newRefresh).catch(() => {});
          },
          onRefreshFailed: () => {
            logout().catch(() => {});
          },
        });

        setReports(data || []);
        setHasMore((data || []).length >= STAFF_REPORTS_PAGE_SIZE);
      } catch (err: any) {
        setError(err?.message || err?.detail || 'Error al cargar reportes');
      } finally {
        setLoading(false);
      }
    },
    [logout, refreshToken, setTokens, token],
  );

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const fetchNextPage = useCallback(() => {
    setLoadingMore(true);
    requestAnimationFrame(() => setLoadingMore(false));
  }, []);

  return {
    reports,
    loading,
    loadingMore,
    hasMore,
    error,
    pageSize: STAFF_REPORTS_PAGE_SIZE,
    refetch: fetchReports,
    fetchNextPage,
  };
}
