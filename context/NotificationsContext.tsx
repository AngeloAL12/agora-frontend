import React, { createContext, useContext } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationItem } from '@/types/notification';

interface NotificationsContextValue {
  notifications: NotificationItem[];
  loading: boolean;
  markRead: (notificationId: number) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuth();
  const { notifications, loading, markRead } = useNotifications(
    token,
    undefined,
    3,
  );

  return (
    <NotificationsContext.Provider value={{ notifications, loading, markRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      'useNotificationsContext must be used within NotificationsProvider',
    );
  return ctx;
}
