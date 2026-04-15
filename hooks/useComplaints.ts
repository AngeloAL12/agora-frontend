import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuthRequest } from './useAuthRequest';

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
  const authRequest = useAuthRequest();
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
        const data = await authRequest<Complaint[]>({
          method: 'GET',
          path: '/complaints/me',
        });
        complaintsCache = data || [];
        setReports(complaintsCache);
      } catch (error) {
        console.error('Error jalando reportes de la API:', error);
      } finally {
        setLoading(false);
      }
    },
    [token, authRequest],
  );

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token, fetchReports]);

  return { reports, loading, refetch: fetchReports };
};
