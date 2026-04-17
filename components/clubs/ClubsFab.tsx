import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { COLORS } from '@/constants/colors';

interface ClubsFabProps {
  onPress?: () => void;
}

export const ClubsFab: React.FC<ClubsFabProps> = ({ onPress }) => {
  return (
    <Pressable
      style={styles.fab}
      onPress={onPress}
      accessibilityLabel="Crear nuevo club"
    >
      <Ionicons name="add" size={30} color="#7A5A00" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 110,
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 20,
  },
});
