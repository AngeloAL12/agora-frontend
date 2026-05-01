import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/constants/theme';
import type { LocalImageFile } from '@/services/reportService';

type EvidenceUploadProps = {
  images: LocalImageFile[];
  onPickImage: () => void;
  onRemoveImage: (index: number) => void;
  maxImages?: number;
  disabled?: boolean;
};

export default function EvidenceUpload({
  images,
  onPickImage,
  onRemoveImage,
  maxImages = 3,
  disabled = false,
}: EvidenceUploadProps) {
  return (
    <>
      <View style={styles.evidenceHeader}>
        <Text style={styles.sectionLabel}>EVIDENCIA</Text>
        <Text style={styles.evidenceLimit}>
          Maximo {maxImages} ({images.length}/{maxImages})
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.evidenceBox,
          disabled && styles.evidenceBoxDisabled,
          pressed && !disabled && styles.evidenceBoxPressed,
        ]}
        onPress={onPickImage}
        disabled={disabled}
      >
        <Ionicons name="camera-outline" size={28} color={colors.gray700} />
        <Text style={styles.evidenceText}>SUBIR</Text>
      </Pressable>

      {images.length > 0 && (
        <View style={styles.imageList}>
          {images.map((image, index) => (
            <View key={`${image.uri}-${index}`} style={styles.imageItem}>
              <Text style={styles.imageName} numberOfLines={1}>
                {image.name}
              </Text>

              <Pressable onPress={() => onRemoveImage(index)}>
                <Text style={styles.removeText}>Eliminar</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  evidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    marginBottom: 8,
    fontSize: 13,
    fontFamily: typography.fontFamily.interBold,
    letterSpacing: 1,
    color: colors.gray700,
  },
  evidenceLimit: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interBold,
    color: colors.bluePrimary,
  },
  evidenceBox: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#B9C1CC',
    backgroundColor: '#EEF2F6',
  },
  evidenceBoxPressed: {
    opacity: 0.85,
  },
  evidenceBoxDisabled: {
    opacity: 0.6,
  },
  evidenceText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: typography.fontFamily.interBold,
    color: colors.gray700,
  },
  imageList: {
    marginTop: 12,
    gap: 8,
  },
  imageItem: {
    backgroundColor: '#EEF2F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageName: {
    flex: 1,
    marginRight: 12,
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray950,
  },
  removeText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interBold,
    color: colors.error,
  },
});
