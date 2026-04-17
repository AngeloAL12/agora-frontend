import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ClubsProvider } from '@/context/ClubsContext';
import { useAppFonts } from '@/hooks/useFonts';
import { useNotificationsPreference } from '@/hooks/useNotificationsPreference';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { savePushToken } from '@/services/authService';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function AppContent() {
  const { token, refreshToken, setTokens, logout } = useAuth();
  const { notificationsEnabled } = useNotificationsPreference();
  const shouldEnablePush =
    notificationsEnabled && process.env.NODE_ENV === 'production';
  const { expoPushToken } = usePushNotifications(shouldEnablePush);

  useEffect(() => {
    if (token && expoPushToken) {
      savePushToken(expoPushToken, token, {
        refreshToken: refreshToken ?? undefined,
        onTokenRefreshed: (newAccess, newRefresh) => {
          setTokens(newAccess, newRefresh).catch(() => {});
        },
        onRefreshFailed: () => {
          logout().catch(() => {});
        },
      }).catch(() => {
        // silent
      });
    }
  }, [token, expoPushToken, refreshToken, setTokens, logout]);

  return (
    <BottomSheetModalProvider>
      <ClubsProvider>
        <Slot />
      </ClubsProvider>
    </BottomSheetModalProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
