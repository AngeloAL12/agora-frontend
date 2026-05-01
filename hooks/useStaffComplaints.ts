import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import type { Complaint } from '@/hooks/useComplaints';
import { getAllComplaints } from '@/services/complaintService';

const STAFF_REPORTS_PAGE_SIZE = 20;

type ComplaintStats = {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
};

type ComplaintListResponse = {
  items: Complaint[];
  total: number;
  limit: number;
  offset: number;
  stats: ComplaintStats;
};

const DEFAULT_STATS: ComplaintStats = {
  total: 0,
  pending: 0,
  in_progress: 0,
  resolved: 0,
};

export function useStaffComplaints() {
  const { token, refreshToken, setTokens, logout } = useAuth();
  const [reports, setReports] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<ComplaintStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMore = reports.length < total;
  const isFetchingMore = useRef(false);

  const buildPayload = useCallback(
    () => ({
      token: token!,
      refreshToken: refreshToken ?? undefined,
      onTokenRefreshed: (newAccess: string, newRefresh: string) => {
        setTokens(newAccess, newRefresh).catch(() => {});
      },
      onRefreshFailed: () => {
        logout().catch(() => {});
      },
    }),
    [logout, refreshToken, setTokens, token],
  );

  const fetchReports = useCallback(
    async (_forceRefresh = false) => {
      if (!token) {
        setReports([]);
        setTotal(0);
        setStats(DEFAULT_STATS);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getAllComplaints<ComplaintListResponse>(
          buildPayload(),
          { offset: 0, limit: STAFF_REPORTS_PAGE_SIZE },
        );
        const list = data?.items ?? [];
        setReports(list);
        setTotal(data?.total ?? 0);
        setStats(data?.stats ?? DEFAULT_STATS);
      } catch (err: any) {
        setError(err?.message || err?.detail || 'Error al cargar reportes');
      } finally {
        setLoading(false);
      }
    },
    [buildPayload, token],
  );

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const fetchNextPage = useCallback(async () => {
    if (!token || isFetchingMore.current || loadingMore) return;
    if (reports.length >= total && total > 0) return;

    isFetchingMore.current = true;
    setLoadingMore(true);
    setError(null);

    try {
      const data = await getAllComplaints<ComplaintListResponse>(
        buildPayload(),
        { offset: reports.length, limit: STAFF_REPORTS_PAGE_SIZE },
      );
      const list = data?.items ?? [];
      if (list.length > 0) {
        setReports((prev) => [...prev, ...list]);
        setTotal(data?.total ?? total);
        if (data?.stats) setStats(data.stats);
      }
    } catch (err: any) {
      setError(err?.message || err?.detail || 'Error al cargar más reportes');
    } finally {
      setLoadingMore(false);
      isFetchingMore.current = false;
    }
  }, [buildPayload, loadingMore, reports.length, token, total]);

  return {
    reports,
    stats,
    loading,
    loadingMore,
    hasMore,
    error,
    pageSize: STAFF_REPORTS_PAGE_SIZE,
    refetch: fetchReports,
    fetchNextPage,
  };
}
