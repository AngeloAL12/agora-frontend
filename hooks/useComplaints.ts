import { useState, useCallback, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';

export interface Complaint {
  id: number;
  type: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

export const useComplaints = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      const data = await apiRequest<Complaint[]>({
        method: 'GET',
        path: '/complaints/me',
        token: token ?? undefined,
      });
      setReports(data || []);
    } catch (error) {
      console.error('Error jalando reportes de la API:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token, fetchReports]);

  return { reports, loading, refetch: fetchReports };
};
