import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AppBottomSheet from '@/components/AppBottomSheet';
import { colors, typography } from '@/constants/theme';
import { blockUser, reportContent } from '@/services/contentSafetyService';
import { ContentReportReason, ContentTargetType } from '@/types/contentSafety';

const REASONS: {
  value: ContentReportReason;
  label: string;
}[] = [
  { value: 'HARASSMENT', label: 'Acoso o intimidación' },
  { value: 'HATE_SPEECH', label: 'Discriminación u odio' },
  { value: 'SEXUAL_CONTENT', label: 'Contenido sexual' },
  { value: 'VIOLENCE', label: 'Violencia o amenazas' },
  { value: 'SPAM', label: 'Spam o fraude' },
  { value: 'PERSONAL_INFORMATION', label: 'Información personal' },
  { value: 'OTHER', label: 'Otro motivo' },
];

interface ReportContentSheetProps {
  targetType: ContentTargetType;
  targetId: number;
  authorId: number;
  authorName: string;
  token: string;
  onSubmitted: (blocked: boolean) => void;
  onDismiss?: () => void;
}

const ReportContentSheet = React.forwardRef<
  BottomSheetModal,
  ReportContentSheetProps
>(
  (
    {
      targetType,
      targetId,
      authorId,
      authorName,
      token,
      onSubmitted,
      onDismiss,
    },
    ref,
  ) => {
    const [reason, setReason] = useState<ContentReportReason | null>(null);
    const [details, setDetails] = useState('');
    const [alsoBlock, setAlsoBlock] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function reset() {
      setReason(null);
      setDetails('');
      setAlsoBlock(false);
      setSubmitting(false);
      setError(null);
      onDismiss?.();
    }

    async function handleSubmit() {
      if (!reason || submitting) return;
      setSubmitting(true);
      setError(null);

      try {
        await reportContent(targetType, targetId, reason, details, token);
        let blocked = false;
        if (alsoBlock) {
          try {
            await blockUser(authorId, token);
            blocked = true;
          } catch {
            // La denuncia ya se registró; el bloqueo puede reintentarse después.
          }
        }
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
        onSubmitted(blocked);
        if (ref && 'current' in ref) ref.current?.dismiss();
      } catch (requestError) {
        const apiError = requestError as { detail?: string };
        setError(apiError?.detail ?? 'No pudimos enviar la denuncia.');
      } finally {
        setSubmitting(false);
      }
    }

    return (
      <AppBottomSheet
        ref={ref}
        onDismiss={reset}
        minBottomPadding={16}
        enableDynamicSizing={false}
        snapPoints={['90%']}
        contentStyle={styles.sheetContent}
      >
        <BottomSheetScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroRow}>
            <View style={styles.iconWrap}>
              <Ionicons
                name="flag-outline"
                size={24}
                color={colors.errorText}
              />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.title}>Denunciar contenido</Text>
              <Text style={styles.subtitle}>
                Tu identidad no se compartirá con {authorName}.
              </Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>¿QUÉ ESTÁ OCURRIENDO?</Text>
          <View style={styles.reasonGrid}>
            {REASONS.map((item) => {
              const selected = reason === item.value;
              return (
                <Pressable
                  key={item.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setReason(item.value)}
                  style={({ pressed }) => [
                    styles.reason,
                    selected && styles.reasonSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[styles.radio, selected && styles.radioSelected]}
                  >
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <Text
                    style={[
                      styles.reasonText,
                      selected && styles.reasonTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <BottomSheetTextInput
            value={details}
            onChangeText={setDetails}
            placeholder="Agrega detalles (opcional)"
            placeholderTextColor={colors.activityGray}
            maxLength={1000}
            multiline
            style={styles.detailsInput}
            accessibilityLabel="Detalles de la denuncia"
          />

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: alsoBlock }}
            onPress={() => setAlsoBlock((current) => !current)}
            style={({ pressed }) => [
              styles.blockRow,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.checkbox, alsoBlock && styles.checkboxActive]}>
              {alsoBlock ? (
                <Ionicons name="checkmark" size={14} color={colors.white} />
              ) : null}
            </View>
            <View style={styles.blockCopy}>
              <Text style={styles.blockTitle}>
                También bloquear a {authorName}
              </Text>
              <Text style={styles.blockDescription}>
                Dejarás de ver sus publicaciones, comentarios y mensajes.
              </Text>
            </View>
          </Pressable>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={colors.errorText}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !reason || submitting }}
            disabled={!reason || submitting}
            onPress={() => void handleSubmit()}
            style={({ pressed }) => [
              styles.submitButton,
              (!reason || submitting) && styles.submitDisabled,
              pressed && styles.pressed,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitText}>Enviar denuncia</Text>
            )}
          </Pressable>
          <Text style={styles.disclaimer}>
            El equipo administrador revisará el caso y tomará las medidas
            necesarias.
          </Text>
        </BottomSheetScrollView>
      </AppBottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  sheetContent: { flex: 1, paddingTop: 22 },
  scroll: { flex: 1, width: '100%' },
  container: { width: '100%', gap: 16, paddingBottom: 18 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorContainer,
  },
  heroCopy: { flex: 1, gap: 3 },
  title: {
    fontSize: 22,
    color: colors.blueDark,
    fontFamily: typography.fontFamily.manropeExtraBold,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  sectionLabel: {
    marginTop: 2,
    fontSize: 10,
    letterSpacing: 0.9,
    color: colors.activityGray,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  reasonGrid: { gap: 8 },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.borderSubtle30,
    backgroundColor: colors.white,
    gap: 10,
  },
  reasonSelected: {
    borderColor: colors.bluePrimary,
    backgroundColor: colors.bluePrimaryLight2,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.activityGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.bluePrimary },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.bluePrimary,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interMedium,
  },
  reasonTextSelected: { color: colors.blueDark },
  detailsInput: {
    minHeight: 78,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.borderSubtle30,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray950,
    fontFamily: typography.fontFamily.interRegular,
    backgroundColor: colors.white,
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    backgroundColor: colors.gray100,
    padding: 12,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.activityGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxActive: {
    borderColor: colors.bluePrimary,
    backgroundColor: colors.bluePrimary,
  },
  blockCopy: { flex: 1, gap: 2 },
  blockTitle: {
    fontSize: 13,
    color: colors.gray950,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  blockDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    gap: 8,
    backgroundColor: colors.errorContainer,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: colors.errorText,
    fontFamily: typography.fontFamily.interMedium,
  },
  submitButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bluePrimary,
  },
  submitDisabled: { backgroundColor: colors.activityGray },
  submitText: {
    fontSize: 16,
    color: colors.white,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  disclaimer: {
    marginTop: -6,
    paddingHorizontal: 12,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    color: colors.activityGray,
    fontFamily: typography.fontFamily.interRegular,
  },
  pressed: { opacity: 0.72 },
});

ReportContentSheet.displayName = 'ReportContentSheet';

export default ReportContentSheet;
