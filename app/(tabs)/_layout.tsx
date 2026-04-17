import { FloatingTabBar } from '@/components/FloatingTabBar';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="map" options={{ title: 'Mapa' }} />
      <Tabs.Screen name="complaints" options={{ title: 'Quejas' }} />
      <Tabs.Screen name="ia" options={{ title: 'IA' }} />
      <Tabs.Screen name="clubs" options={{ title: 'Clubs' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />{' '}
    </Tabs>
  );
}
