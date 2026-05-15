import { theme } from '@/constants/theme';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  uri: string | null;
  title: string;
  hint: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function CirclePreviewModal({
  visible,
  uri,
  title,
  hint,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.imageWrapper}>
            {uri && <Image source={{ uri }} style={styles.image} />}
          </View>
          <Text style={styles.hint}>{hint}</Text>
          <View style={styles.actions}>
            <Pressable style={styles.cancel} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.confirm} onPress={onConfirm}>
              <Text style={styles.confirmText}>Usar foto</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: theme.palette.surface,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontFamily: theme.typography.fontFamily.interBold,
    color: theme.colors.blueDark,
    marginBottom: 24,
  },
  imageWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  image: { width: '100%', height: '100%' },
  hint: {
    marginTop: 16,
    fontSize: 13,
    color: '#666',
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: '#666',
    fontFamily: theme.typography.fontFamily.interSemiBold,
  },
  confirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.blueDark,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 15,
    color: '#fff',
    fontFamily: theme.typography.fontFamily.interBold,
  },
});
