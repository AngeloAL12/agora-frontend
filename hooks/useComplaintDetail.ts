import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuthRequest } from './useAuthRequest';
import { complaintDetailCache } from '@/services/cacheService';

export interface ComplaintImage {
  id: number;
  url: string;
  created_at: string;
}

export interface ComplaintDetail {
  id: number;
  type: 'REPORT' | 'SUGGESTION';
  title: string;
  description: string;
  category: string;
  id_building: number | null;
  classroom: string | null;
  status: string;
  has_appealed: boolean;
  created_at: string;
  images: ComplaintImage[];
}

export const useComplaintDetail = (id: string | undefined | null) => {
  const { token } = useAuth();
  const authRequest = useAuthRequest();
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaint = useCallback(
    async (forceRefresh = false) => {
      if (!id || !token) return;

      if (!forceRefresh && complaintDetailCache[id]) {
        setComplaint(complaintDetailCache[id]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await authRequest<ComplaintDetail>({
          method: 'GET',
          path: `/complaints/${id}`,
        });
        complaintDetailCache[id] = data;
        setComplaint(data);
      } catch (err) {
        console.error('Error jalando el detalle del reporte:', err);
        setError('Error al obtener el reporte');
      } finally {
        setLoading(false);
      }
    },
    [id, token, authRequest],
  );

  useEffect(() => {
    fetchComplaint();
  }, [fetchComplaint]);

  return { complaint, loading, error, refetch: fetchComplaint };
};
