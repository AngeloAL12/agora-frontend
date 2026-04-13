import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  onSeeDetails: () => void;
}

export default function SuccessModal({
  visible,
  onClose,
  onSeeDetails,
}: SuccessModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.handle} />

          <View style={styles.iconWrapper}>
            <Ionicons name="checkmark" size={42} color="#1E4C92" />
          </View>

          <Text style={styles.title}>¡Bien hecho!</Text>

          <Text style={styles.description}>
            Tu reporte ha sido enviado exitosamente al personal académico.
          </Text>

          <Pressable style={styles.primaryButton} onPress={onClose}>
            <Text style={styles.primaryButtonText}>Listo</Text>
          </Pressable>

          <Pressable onPress={onSeeDetails}>
            <Text style={styles.linkText}>Ver detalles del reporte</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
  },
  container: {
    minHeight: '58%',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 30,
    paddingHorizontal: 28,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  handle: {
    width: 54,
    height: 6,
    borderRadius: 999,
    marginBottom: 34,
    backgroundColor: '#D9DDE2',
  },
  iconWrapper: {
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 4,
    borderColor: '#DCE3EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
  },
  title: {
    marginBottom: 14,
    fontSize: 28,
    fontWeight: '800',
    color: '#1E4C92',
  },
  description: {
    maxWidth: 280,
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 16,
    color: '#1F2937',
  },
  primaryButton: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    marginBottom: 22,
    backgroundColor: '#0F4A97',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E4C92',
  },
});
