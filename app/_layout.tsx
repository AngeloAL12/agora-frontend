import { useAppFonts } from '@/hooks/useFonts';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Slot } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();
  const { expoPushToken } = usePushNotifications();

  useEffect(() => {
    if (expoPushToken) console.log('Expo Push Token:', expoPushToken);
  }, [expoPushToken]);

  if (!fontsLoaded) return null;

  return <Slot />;
}
