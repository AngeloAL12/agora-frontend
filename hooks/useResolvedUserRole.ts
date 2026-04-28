import { useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { CacheService } from '@/services/cacheService';
import { getMe } from '@/services/authService';

export function useResolvedUserRole() {
  const { token, refreshToken, setTokens, logout, updateUser, user } =
    useAuth();
  const [role, setRole] = useState<string | undefined>(user?.role);
  const [loading, setLoading] = useState(!user?.role && !!token);

  useEffect(() => {
    if (user?.role) {
      setRole(user.role);
      setLoading(false);
      return;
    }

    if (!token) {
      setRole(undefined);
      setLoading(false);
      return;
    }

    const cached = CacheService.getMeData(token);
    if (cached?.role) {
      setRole(cached.role);
      setLoading(false);
      updateUser({ role: cached.role }).catch(() => {});
      return;
    }

    let isMounted = true;
    setLoading(true);

    getMe(token, {
      refreshToken: refreshToken ?? undefined,
      onTokenRefreshed: (newAccess, newRefresh) => {
        setTokens(newAccess, newRefresh).catch(() => {});
      },
      onRefreshFailed: () => {
        logout().catch(() => {});
      },
    })
      .then((profile) => {
        if (!isMounted) return;
        CacheService.setMeData(profile, token);
        setRole(profile.role);
        updateUser({ role: profile.role }).catch(() => {});
      })
      .catch(() => {
        if (isMounted) setRole(undefined);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [logout, refreshToken, setTokens, token, updateUser, user?.role]);

  return { role, loading };
}
