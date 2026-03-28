import { Tabs } from 'expo-router';
import { Text } from 'react-native';

/**
 * Tab Navigator Layout
 *
 * Configura las tabs de navegación para la sección de clubes.
 * Tabs disponibles:
 * - explorar: Ver clubes disponibles
 * - mis-clubes: Ver clubes del usuario
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#1A1A24',
          borderTopColor: '#2A2A35',
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="explorar"
        options={{
          title: 'Explorar',
          tabBarLabel: 'Explorar',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🔍</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="mis-clubes"
        options={{
          title: 'Mis Clubes',
          tabBarLabel: 'Mis Clubes',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>⭐</Text>
          ),
        }}
      />
    </Tabs>
  );
}
