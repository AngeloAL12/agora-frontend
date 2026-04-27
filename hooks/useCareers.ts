import { useCallback, useEffect, useState } from 'react';

import { getCareers } from '@/services/careerService';
import type { Career } from '@/types/career';

let careersCache: Career[] | null = null;

export function useCareers(token?: string) {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCareers = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh && careersCache !== null) {
        setCareers(careersCache);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getCareers(token);
        careersCache = data ?? [];
        setCareers(careersCache);
      } catch (error) {
        careersCache = null;
        setCareers([]);
        setError(
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar las carreras.',
        );
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    void fetchCareers();
  }, [fetchCareers]);

  return { careers, loading, error, refetch: fetchCareers };
}
