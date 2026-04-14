import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';

const NOTIFICATIONS_ENABLED_KEY = 'agora_notifications_enabled';

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

    SecureStore.getItemAsync(NOTIFICATIONS_ENABLED_KEY)
      .then((storedValue) => {
        if (!isMounted) return;
        setNotificationsEnabledState(storedValue !== 'false');
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
      await SecureStore.setItemAsync(
        NOTIFICATIONS_ENABLED_KEY,
        enabled ? 'true' : 'false',
      );
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
