import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

export interface Complaint {
  id: number;
  type: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

let complaintsCache: Complaint[] | null = null;

export const useComplaints = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(
    async (forceRefresh = false) => {
      if (!token) return;

      if (!forceRefresh && complaintsCache !== null) {
        setReports(complaintsCache);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await apiRequest<Complaint[]>({
          method: 'GET',
          path: '/complaints/me',
          token: token,
        });
        complaintsCache = data || [];
        setReports(complaintsCache);
      } catch (error) {
        console.error('Error jalando reportes de la API:', error);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token, fetchReports]);

  return { reports, loading, refetch: fetchReports };
};
