import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CacheService } from '@/services/cacheService';
import { getAllClubs, getMyClubs } from '@/services/clubService';
import { ClubResponse } from '@/types/club';

export const useClubs = () => {
  const { token } = useAuth();
  const [allClubs, setAllClubs] = useState<ClubResponse[]>([]);
  const [myClubs, setMyClubs] = useState<ClubResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClubs = useCallback(
    async (forceRefresh = false) => {
      if (!token) return;

      const cachedAll = CacheService.getAllClubs(token);
      const cachedMy = CacheService.getMyClubs(token);
      if (!forceRefresh && cachedAll !== null && cachedMy !== null) {
        setAllClubs(cachedAll);
        setMyClubs(cachedMy);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [allData, myData] = await Promise.all([
          getAllClubs(token).catch(() => [] as ClubResponse[]),
          getMyClubs(token).catch(() => [] as ClubResponse[]),
        ]);
        CacheService.setAllClubs(allData, token);
        CacheService.setMyClubs(myData, token);
        setAllClubs(allData);
        setMyClubs(myData);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (token) {
      void fetchClubs();
    } else {
      setAllClubs([]);
      setMyClubs([]);
      setLoading(false);
    }
  }, [token, fetchClubs]);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      const cachedMy = CacheService.getMyClubs(token);
      if (cachedMy === null) {
        void fetchClubs(true);
      }
    }, [token, fetchClubs]),
  );

  const myClubIds = new Set(myClubs.map((c) => c.id));
  const discoverClubs = allClubs.filter((c) => !myClubIds.has(c.id));

  return { myClubs, discoverClubs, loading, refetch: fetchClubs };
};
