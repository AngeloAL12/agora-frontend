import { useCallback, useEffect, useState } from 'react';

import { CAREERS_LIST } from '@/constants/careers';
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
        careersCache = data ?? [...CAREERS_LIST];
        setCareers(careersCache);
      } catch {
        careersCache = [...CAREERS_LIST];
        setCareers(careersCache);
        setError(null);
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
