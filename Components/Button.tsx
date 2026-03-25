import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '../constants/theme';

// Aquí definimos todas las "perillas" (props) que se podrá ajustarle al botón cuando lo usen
interface ButtonProps {
  text: string;
  onPress: () => void; // La acción al picarle
  variant?: 'primary' | 'secondary' | 'danger'; // Colores (danger por si ocupas borrar una queja)
  size?: 'small' | 'medium' | 'large'; // Tamaños
  fullWidth?: boolean; // ¿Queremos que abarque todo el ancho de la pantalla?
  disabled?: boolean; // ¿Está apagado/bloqueado?
  style?: ViewStyle; // Por si se ocupa meterle un margen o estilo extra después
}

export const Button = ({
  text,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  style,
}: ButtonProps) => {
  // Configuramos el color según la variante
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.gray700; // Un gris si está desactivado
    if (variant === 'secondary') return 'transparent';
    if (variant === 'danger') return '#EF4444'; // Un rojo para borrar
    return theme.palette.primary; // El azul por defecto
  };

  // Configuramos el tamaño del padding (los bordes del botón)
  const getPadding = () => {
    if (size === 'small') return { paddingVertical: 8, paddingHorizontal: 16 };
    if (size === 'large') return { paddingVertical: 18, paddingHorizontal: 32 };
    return { paddingVertical: 14, paddingHorizontal: 24 }; // medium por defecto
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.baseContainer,
        { backgroundColor: getBackgroundColor() },
        getPadding(),
        fullWidth && { width: '100%' },
        variant === 'secondary' && styles.secondaryBorder,
        pressed && !disabled && { opacity: 0.8 }, // Efecto al presionar
        style, // Estilos extras que le manden
      ]}
    >
      <Text
        style={[
          styles.baseText,
          variant === 'secondary' && !disabled
            ? { color: theme.palette.primary }
            : { color: '#FFFFFF' },
          size === 'large' && { fontSize: 18 },
          size === 'small' && { fontSize: 14 },
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: theme.palette.primary,
  },
  baseText: {
    fontFamily: theme.typography.fontFamily.interSemiBold,
    fontSize: 16,
  },
});
