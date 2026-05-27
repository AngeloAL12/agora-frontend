import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AppBottomSheet from '@/components/AppBottomSheet';
import { Button } from '@/components/Button';
import MediaPicker from '@/components/MediaPicker';
import type { MediaPickerImage } from '@/components/MediaPicker';
import { colors, typography } from '@/constants/theme';
import {
  updateComplaintStatus,
  uploadComplaintEvidence,
} from '@/services/complaintService';
import type { LocalImageFile } from '@/types/report';

type AuthenticatedRequestPayload = {
  token: string;
  refreshToken?: string;
  onTokenRefreshed?: (accessToken: string, refreshToken: string) => void;
  onRefreshFailed?: () => void;
};

interface EvidenceSubmitBottomSheetProps {
  complaintId: number;
  authPayload: AuthenticatedRequestPayload;
  currentStatus?: string;
  onSuccess: () => void;
  onDismiss?: () => void;
}

interface EvidenceSubmitFormProps {
  complaintId: number;
  authPayload: AuthenticatedRequestPayload;
  currentStatus?: string;
  onSuccess: () => void;
}

const EvidenceSubmitForm = ({
  complaintId,
  authPayload,
  currentStatus,
  onSuccess,
}: EvidenceSubmitFormProps) => {
  const [comments, setComments] = useState('');
  const [images, setImages] = useState<MediaPickerImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 3 - images.length,
    });

    if (!result.canceled) {
      setImages((prev) => [
        ...prev,
        ...result.assets
          .slice(0, 3 - prev.length)
          .map((a) => ({ uri: a.uri, name: a.fileName ?? undefined })),
      ]);
      setValidationError(null);
    }
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img.uri !== uri));
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (images.length === 0) {
      setValidationError('Debes subir al menos una imagen como evidencia.');
      return;
    }

    setValidationError(null);
    setSubmitting(true);

    try {
      if (currentStatus === 'PENDING') {
        await updateComplaintStatus(complaintId, 'IN_PROGRESS', authPayload);
      }

      for (const img of images) {
        const file: LocalImageFile = {
          uri: img.uri,
          type: 'image/jpeg',
          name: img.name ?? 'evidence.jpg',
        };
        await uploadComplaintEvidence(complaintId, file, authPayload);
      }

      const trimmedComment = comments.trim() || undefined;
      await updateComplaintStatus(
        complaintId,
        'RESOLVED',
        authPayload,
        trimmedComment,
      );

      setComments('');
      setImages([]);
      onSuccess();
    } catch (err: any) {
      setValidationError(
        err?.detail ?? err?.message ?? 'No se pudo enviar la evidencia.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enviar evidencia</Text>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Comentarios</Text>
        <BottomSheetTextInput
          style={styles.textarea}
          multiline
          numberOfLines={4}
          scrollEnabled={false}
          placeholder="Describe como se solucionó el problema..."
          placeholderTextColor="rgba(67,71,81,0.5)"
          value={comments}
          onChangeText={setComments}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.field}>
        <View style={styles.evidenceHeader}>
          <Text style={styles.fieldLabel}>Evidencia</Text>
          <Text style={styles.maxLabel}>Máximo 3</Text>
        </View>
        <MediaPicker
          images={images}
          onPick={pickImages}
          onRemove={removeImage}
          maxImages={3}
          style={styles.mediaPicker}
          placeholderStyle={styles.mediaPlaceholder}
          thumbnailListStyle={styles.thumbnailList}
        />
        {validationError ? (
          <Text style={styles.errorText}>{validationError}</Text>
        ) : null}
      </View>

      <Button
        text={submitting ? 'Enviando...' : 'Enviar'}
        onPress={handleSubmit}
        fullWidth
        size="large"
        disabled={submitting}
      />
    </View>
  );
};

const EvidenceSubmitBottomSheet = React.forwardRef<
  BottomSheetModal,
  EvidenceSubmitBottomSheetProps
>(({ complaintId, authPayload, currentStatus, onSuccess, onDismiss }, ref) => {
  return (
    <AppBottomSheet ref={ref} onDismiss={onDismiss} minBottomPadding={32}>
      <EvidenceSubmitForm
        complaintId={complaintId}
        authPayload={authPayload}
        currentStatus={currentStatus}
        onSuccess={onSuccess}
      />
    </AppBottomSheet>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 20,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    color: colors.bluePrimary,
    fontFamily: typography.fontFamily.manropeExtraBold,
    textAlign: 'center',
    marginBottom: 4,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: typography.fontFamily.interBold,
    color: colors.gray700,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  textarea: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    height: 120,
    fontSize: 16,
    fontFamily: typography.fontFamily.interMedium,
    color: colors.gray950,
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maxLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interBold,
    color: colors.blueSecondary,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.errorText,
    fontFamily: typography.fontFamily.interMedium,
  },
  mediaPicker: {
    paddingTop: 0,
  },
  mediaPlaceholder: {
    marginHorizontal: 0,
    marginBottom: 0,
    height: 120,
    paddingVertical: 0,
    justifyContent: 'center',
  },
  thumbnailList: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
});

EvidenceSubmitBottomSheet.displayName = 'EvidenceSubmitBottomSheet';

export default EvidenceSubmitBottomSheet;
