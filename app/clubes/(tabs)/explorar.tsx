import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Componente de navegación: Tab Explorar
 *
 * Esta pantalla es parte del Tab Navigator.
 * Responsabilidad: Mostrar lista de clubes disponibles con navegación.
 *
 * TODO: Implementar lógica de negocio y UI
 */
export default function ExplorarTab() {
  const router = useRouter();

  const handleNavigateToDetail = (clubId: string) => {
    router.push({ pathname: '/clubes/DetalleClub', params: { id: clubId } });
  };

  const handleCreateClub = () => {
    router.push('/clubes/CrearClub');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Explorar Clubes</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleNavigateToDetail('1')}
      >
        <Text style={styles.buttonText}>Ver Detalle (Demo)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleCreateClub}>
        <Text style={styles.buttonText}>+ Crear Club</Text>
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
