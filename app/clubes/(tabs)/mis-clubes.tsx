import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Componente de navegación: Tab Mis Clubes
 *
 * Esta pantalla es parte del Tab Navigator.
 * Responsabilidad: Mostrar clubes del usuario con navegación.
 *
 * TODO: Implementar lógica de negocio y UI
 */
export default function MisClubesTab() {
  const router = useRouter();

  const handleNavigateToDetail = (clubId: string) => {
    router.push({ pathname: '/clubes/DetalleClub', params: { id: clubId } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Mis Clubes</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleNavigateToDetail('1')}
      >
        <Text style={styles.buttonText}>Ver Detalle (Demo)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F14',
    gap: 16,
  },
  placeholder: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
