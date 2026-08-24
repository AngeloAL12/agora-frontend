import { readPreferences, savePreferences } from '@/lib/preferencesStorage';
import { useCallback, useEffect, useState } from 'react';

type NotificationsPreferenceState = {
  notificationsEnabled: boolean;
  isLoading: boolean;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
};

export function useNotificationsPreference(): NotificationsPreferenceState {
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    readPreferences()
      .then((prefs) => {
        if (!isMounted) return;
        setNotificationsEnabledState(prefs?.notificationsEnabled ?? true);
      })
      .catch(() => {
        if (!isMounted) return;
        setNotificationsEnabledState(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    try {
      const existing = await readPreferences().catch(() => null);
      await savePreferences({ ...existing, notificationsEnabled: enabled });
    } catch {
      setNotificationsEnabledState((currentValue) => !currentValue);
    }
  }, []);

  return {
    notificationsEnabled,
    isLoading,
    setNotificationsEnabled,
  };
}
