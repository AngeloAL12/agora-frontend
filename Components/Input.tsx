import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { theme } from '../constants/theme';

interface InputProps extends TextInputProps {
  /* Aquí podemos agregar propiedades extra si las necesitamos después 
   heredamos todas las normales de TextInput (como placeholder, onChangeText, etc.) gracias a TextInputProps */
}

export const Input = (props: InputProps) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholderTextColor={theme.palette.textSecondary} // El gris para el texto de fondo
        {...props} // Esto pasa todas las propiedades que le mandes al componente base
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  input: {
    backgroundColor: theme.colors.whiteSoft,
    borderColor: theme.palette.border,
    borderWidth: 1,
    borderRadius: 16, // Redondeado como en el Figma
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: theme.typography.fontFamily.interRegular,
    fontSize: 16,
    color: theme.palette.textPrimary,
  },
});
