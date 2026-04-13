import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useAppFonts } from '@/hooks/useFonts';
import { useNotificationsPreference } from '@/hooks/useNotificationsPreference';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { savePushToken } from '@/services/authService';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function AppContent() {
  const { token } = useAuth();
  const { notificationsEnabled } = useNotificationsPreference();
  const { expoPushToken } = usePushNotifications(notificationsEnabled);

  useEffect(() => {
    if (token && expoPushToken) {
      savePushToken(expoPushToken, token).catch(() => {
        // silent — push token registration is non-critical
      });
    }
  }, [token, expoPushToken]);

  return (
    <BottomSheetModalProvider>
      <Slot />
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
