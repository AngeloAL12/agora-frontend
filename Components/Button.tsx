import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme'; // Ajustar los '..' dependiendo de dónde guardes la carpeta components

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
}: ButtonProps) => {
  // Aquí decidimos qué estilo usar según la variante que pidan
  const containerStyle = [
    styles.baseContainer,
    variant === 'primary' ? styles.primaryContainer : styles.secondaryContainer,
  ];

  const textStyle = [
    styles.baseText,
    variant === 'primary' ? styles.primaryText : styles.secondaryText,
  ];

  return (
    <TouchableOpacity style={containerStyle} onPress={onPress}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  primaryContainer: {
    backgroundColor: theme.palette.primary, // Aquí consume el azul principal
  },
  secondaryContainer: {
    backgroundColor: theme.palette.surface, // Fondo blanco
    borderWidth: 1,
    borderColor: theme.palette.border,
  },
  baseText: {
    // Usamos la fuente Inter
    fontFamily: theme.typography.fontFamily.interSemiBold,
    fontSize: 16,
  },
  primaryText: {
    color: theme.colors.white, // Texto blanco para el botón azul
  },
  secondaryText: {
    color: theme.palette.textPrimary, // Texto oscuro para el botón blanco
  },
});
