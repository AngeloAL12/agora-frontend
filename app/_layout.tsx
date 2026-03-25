import { useAppFonts } from '@/hooks/useFonts';
import { Slot } from 'expo-router';

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();

  if (!fontsLoaded) return null;

  return <Slot />;
}
