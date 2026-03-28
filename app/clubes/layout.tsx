import { Stack } from 'expo-router';

/**
 * Stack Navigator para la sección de Clubes
 *
 * Estructura:
 * - (tabs) - Tab Navigator con navegación entre explorary mis-clubes
 * - DetalleClub - Pantalla de detalle (navegada vía router.push)
 * - CrearClub - Modal para crear nuevo club
 */
export default function ClubesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0F0F14' },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DetalleClub"
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="CrearClub"
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
