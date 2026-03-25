import { useAppFonts } from '@/hooks/useFonts';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Slot } from 'expo-router';

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();
  // expoPushToken will be sent to the backend once the API is ready
  usePushNotifications();

  if (!fontsLoaded) return null;

  return <Slot />;
}
