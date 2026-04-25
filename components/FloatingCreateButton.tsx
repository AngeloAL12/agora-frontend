import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  onPress: () => void;
}

const FloatingCreateButton = ({ onPress }: Props) => {
  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Image
        source={require('@/assets/images/Crear.png')}
        style={styles.icon}
      />
    </TouchableOpacity>
  );
};

export default FloatingCreateButton;

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 16,
    bottom: 32,

    width: 56,
    height: 56,
    borderRadius: 12,

    backgroundColor: '#F1C806',

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 8, // Android
  },

  icon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
    tintColor: '#705B00',
  },
});
