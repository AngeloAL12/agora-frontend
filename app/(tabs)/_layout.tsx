import { useAuth } from '@/context/AuthContext';
import { Redirect, Tabs } from 'expo-router';

export default function TabsLayout() {
  const { token, user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!token) return <Redirect href="/auth/onboarding" />;

  if (user?.id_career == null) return <Redirect href="/career" />;

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="clubs" options={{ title: 'Clubs' }} />
      <Tabs.Screen name="complaints" options={{ title: 'Complaints' }} />
    </Tabs>
  );
}
