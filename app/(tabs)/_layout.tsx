import { FloatingTabBar } from '@/components/FloatingTabBar';
import { useAuth } from '@/context/AuthContext';
import { Redirect, Tabs } from 'expo-router';

export default function TabsLayout() {
  const { token, user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!token) return <Redirect href="/auth/onboarding" />;

  if (user?.id_career == null) return <Redirect href="/career" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      {/* Order must match the Figma left → right layout */}
      <Tabs.Screen name="map" options={{ title: 'Mapa' }} />
      <Tabs.Screen name="home" options={{ title: 'Buzón' }} />
      <Tabs.Screen name="ia" options={{ title: 'IA' }} />
      <Tabs.Screen name="clubs" options={{ title: 'Clubs' }} />
      <Tabs.Screen name="complaints" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
