import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Modal para Crear Nuevo Club
 *
 * Navegada mediante router.push("/clubes/CrearClub")
 * Presentada como modal.
 * Responsabilidad: Permitir crear un nuevo club
 *
 * TODO: Implementar lógica de negocio y UI
 */
export default function CrearClubScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Crear Nuevo Club</Text>
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
