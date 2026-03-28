import { Redirect } from 'expo-router';

/**
 * Punto de entrada para la sección de clubes
 * Redirige automáticamente al primer tab (Explorar)
 */
export default function ClubesIndex() {
  return <Redirect href="/clubes/(tabs)/explorar" />;
}
