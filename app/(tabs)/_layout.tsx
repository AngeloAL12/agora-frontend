import { FloatingTabBar } from '@/components/FloatingTabBar';
import { useAuth } from '@/context/AuthContext';
import { Redirect, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/theme';

export default function TabsLayout() {
  const { token, user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!token) return <Redirect href="/auth/onboarding" />;

  if (user?.id_career == null) return <Redirect href="/setup/name" />;

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.bluePrimary} />
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <FloatingTabBar {...props} />}
      >
        <Tabs.Screen name="map" options={{ title: 'Mapa' }} />
        <Tabs.Screen name="complaints" options={{ title: 'Quejas' }} />
        <Tabs.Screen name="messages" options={{ title: 'Mensajes' }} />
        <Tabs.Screen name="clubs" options={{ title: 'Clubs' }} />
        <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
      </Tabs>
    </>
  );
}
