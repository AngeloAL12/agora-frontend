import { Ionicons } from '@expo/vector-icons';
import type { ImagePickerAsset } from 'expo-image-picker';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  asset: ImagePickerAsset | null;
  onPick: () => void;
  onRemove: () => void;
  placeholder: ReturnType<typeof require>;
};

export default function CoverImagePicker({
  asset,
  onPick,
  onRemove,
  placeholder,
}: Props) {
  if (asset) {
    return (
      <TouchableOpacity
        style={styles.previewWrapper}
        onPress={onPick}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: asset.uri }}
          style={styles.previewImage}
          resizeMode="cover"
        />
        <View style={styles.editOverlay}>
          <Pressable
            style={styles.deleteBadge}
            onPress={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            hitSlop={8}
          >
            <Ionicons name="close" size={14} color="#fff" />
          </Pressable>
          <View style={styles.editBadge}>
            <Ionicons name="pencil" size={14} color="#fff" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.emptyCard}>
      <TouchableOpacity
        style={[styles.coverWrapper, { overflow: 'hidden' }]}
        onPress={onPick}
      >
        <Image
          source={placeholder}
          style={styles.coverPlaceholder}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <Text style={styles.selectFileText}>Seleccionar archivo</Text>
      <Text style={styles.helperText}>Mínimo recomendado: 1200px x 400px.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  previewWrapper: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%' },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 10,
    gap: 8,
  },
  deleteBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#CC3333CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#192A56CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    width: '100%',
    height: 210,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverWrapper: {
    width: '100%',
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholder: { width: '65%', height: '65%' },
  selectFileText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#192A56',
    marginBottom: 8,
  },
  helperText: { fontSize: 12, color: '#434751' },
});
