import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

/**
 * Pantalla de Detalle del Club
 *
 * Renderizada mediante router.push con params { id: clubId }
 * Responsabilidad: Mostrar detalles de un club específico
 *
 * TODO: Implementar lógica de negocio y UI
 */
export default function DetalleClubScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Detalle Club: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F14',
  },
  placeholder: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});
