import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

import { CacheService } from '@/services/cacheService';

export interface Complaint {
  id: number;
  type: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  id_building?: number;
  classroom?: string;
  images?: string[];
}

export const useComplaints = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(
    async (forceRefresh = false) => {
      if (!token) return;

      const cached = CacheService.getComplaints(token);
      if (!forceRefresh && cached !== null) {
        setReports(cached);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await apiRequest<Complaint[]>({
          method: 'GET',
          path: '/complaints/me',
          token: token,
        });
        const finalData = data || [];
        CacheService.setComplaints(finalData, token);
        setReports(finalData);
      } catch (err: any) {
        console.error('Error jalando reportes de la API:', err);
        setError(err.message || 'Error al cargar los reportes');
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (token) {
      void fetchReports();
    } else {
      setReports([]);
      setLoading(false);
      setError(null);
    }
  }, [token, fetchReports]);

  return { reports, loading, error, refetch: fetchReports };
};
