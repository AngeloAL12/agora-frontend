import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getRecentClubIds } from '@/services/recentClubsService';

export function useRecentClubIds(): number[] {
  const { user } = useAuth();
  const [recentIds, setRecentIds] = useState<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      getRecentClubIds(user.id)
        .then(setRecentIds)
        .catch(() => {});
    }, [user?.id]),
  );

  return recentIds;
}
