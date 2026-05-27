import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LikesProvider } from '@/context/LikesContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { useAppFonts } from '@/hooks/useFonts';
import { useNotificationsPreference } from '@/hooks/useNotificationsPreference';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { savePushToken } from '@/services/authService';
import { NoInternetModal } from '@/components/NoInternetModal';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function AppContent() {
  const { token, refreshToken, setTokens, logout } = useAuth();
  const { notificationsEnabled } = useNotificationsPreference();
  const { expoPushToken } = usePushNotifications(notificationsEnabled);

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
        // silent — push token registration is non-critical
      });
    }
  }, [token, expoPushToken, refreshToken, setTokens, logout]);

  return (
    <LikesProvider>
      <NotificationsProvider>
        <BottomSheetModalProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </BottomSheetModalProvider>
      </NotificationsProvider>
    </LikesProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <NoInternetModal />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </View>
    </GestureHandlerRootView>
  );
}
