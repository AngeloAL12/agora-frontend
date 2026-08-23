import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';

import AppBottomSheet from '@/components/AppBottomSheet';
import { colors, typography } from '@/constants/theme';
import { AdminContentReport } from '@/types/contentSafety';
import {
  CONTENT_ACTION_LABELS,
  CONTENT_REASON_LABELS,
  CONTENT_STATUS_META,
  CONTENT_TARGET_LABELS,
} from '@/utils/contentSafety';

export type ModerationDecision =
  | 'IN_REVIEW'
  | 'REMOVE_CONTENT'
  | 'SUSPEND_USER'
  | 'REMOVE_AND_SUSPEND'
  | 'DISMISS';

const DECISIONS: {
  value: ModerationDecision;
  label: string;
  description: string;
  dangerous?: boolean;
}[] = [
  {
    value: 'IN_REVIEW',
    label: 'Marcar en revisión',
    description: 'Conserva el caso abierto para investigarlo.',
  },
  {
    value: 'REMOVE_CONTENT',
    label: 'Retirar contenido',
    description: 'Oculta el contenido y resuelve el caso.',
  },
  {
    value: 'SUSPEND_USER',
    label: 'Suspender usuario',
    description: 'Desactiva su acceso y resuelve el caso.',
    dangerous: true,
  },
  {
    value: 'REMOVE_AND_SUSPEND',
    label: 'Retirar y suspender',
    description: 'Aplica ambas medidas inmediatamente.',
    dangerous: true,
  },
  {
    value: 'DISMISS',
    label: 'Descartar denuncia',
    description: 'Finaliza el caso sin aplicar medidas.',
  },
];

interface ModerationDecisionSheetProps {
  report: AdminContentReport;
  loading: boolean;
  error: string | null;
  onConfirm: (decision: ModerationDecision, comment: string) => void;
  onClose: () => void;
}

const ModerationDecisionSheet = React.forwardRef<
  BottomSheetModal,
  ModerationDecisionSheetProps
>(({ report, loading, error, onConfirm, onClose }, ref) => {
  const [decision, setDecision] = useState<ModerationDecision | null>(null);
  const [comment, setComment] = useState('');
  const finalized =
    report.status === 'RESOLVED' || report.status === 'DISMISSED';
  const status = CONTENT_STATUS_META[report.status];

  useEffect(() => {
    setDecision(null);
    setComment(report.moderator_comment ?? '');
  }, [report.id, report.moderator_comment]);

  return (
    <AppBottomSheet
      ref={ref}
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
        <View style={styles.headingRow}>
          <View style={styles.shield}>
            <Ionicons
              name="shield-checkmark-outline"
              size={26}
              color={colors.bluePrimary}
            />
          </View>
          <View style={styles.headingCopy}>
            <Text style={styles.eyebrow}>
              {CONTENT_TARGET_LABELS[report.target_type]} #{report.target_id}
            </Text>
            <Text style={styles.title}>
              {CONTENT_REASON_LABELS[report.reason]}
            </Text>
          </View>
        </View>

        <View style={styles.snapshotBox}>
          <Text style={styles.author}>{report.reported_user_name}</Text>
          <Text style={styles.snapshot}>{report.content_snapshot}</Text>
          {report.details ? (
            <Text style={styles.details}>Contexto: {report.details}</Text>
          ) : null}
        </View>

        {report.content_image_urls.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.evidenceImages}
          >
            {report.content_image_urls.map((url, index) => (
              <ExpoImage
                key={`${url}-${index}`}
                source={{ uri: url }}
                contentFit="cover"
                style={styles.evidenceImage}
              />
            ))}
          </ScrollView>
        ) : null}

        {finalized ? (
          <>
            <Text style={styles.sectionLabel}>RESULTADO DEL CASO</Text>
            <View style={styles.resultBox}>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: status.background },
                ]}
              >
                <Text style={[styles.statusText, { color: status.text }]}>
                  {status.label}
                </Text>
              </View>
              <Text style={styles.resultAction}>
                {CONTENT_ACTION_LABELS[report.action_taken]}
              </Text>
              {report.moderator_comment ? (
                <Text style={styles.resultComment}>
                  {report.moderator_comment}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && { opacity: 0.78 },
              ]}
            >
              <Text style={styles.confirmText}>Cerrar</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.sectionLabel}>DECISIÓN ADMINISTRATIVA</Text>
            <View style={styles.decisions}>
              {DECISIONS.map((item) => {
                const selected = decision === item.value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => setDecision(item.value)}
                    style={({ pressed }) => [
                      styles.decisionRow,
                      selected && styles.decisionSelected,
                      pressed && { opacity: 0.72 },
                    ]}
                  >
                    <View
                      style={[styles.radio, selected && styles.radioSelected]}
                    >
                      {selected ? <View style={styles.radioDot} /> : null}
                    </View>
                    <View style={styles.decisionCopy}>
                      <Text
                        style={[
                          styles.decisionLabel,
                          item.dangerous && styles.dangerText,
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text style={styles.decisionDescription}>
                        {item.description}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <BottomSheetTextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Comentario interno (opcional)"
              placeholderTextColor={colors.activityGray}
              maxLength={1000}
              multiline
              style={styles.input}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              disabled={!decision || loading}
              onPress={() => decision && onConfirm(decision, comment)}
              style={({ pressed }) => [
                styles.confirmButton,
                (!decision || loading) && styles.confirmDisabled,
                pressed && { opacity: 0.78 },
              ]}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.confirmText}>Aplicar decisión</Text>
              )}
            </Pressable>
          </>
        )}
      </BottomSheetScrollView>
    </AppBottomSheet>
  );
});

const styles = StyleSheet.create({
  sheetContent: { flex: 1, paddingTop: 22 },
  scroll: { flex: 1, width: '100%' },
  container: { width: '100%', gap: 15, paddingBottom: 18 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  shield: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
  },
  headingCopy: { flex: 1, gap: 2 },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.activityGray,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  title: {
    fontSize: 20,
    color: colors.blueDark,
    fontFamily: typography.fontFamily.manropeExtraBold,
  },
  snapshotBox: {
    borderRadius: 14,
    padding: 14,
    gap: 5,
    backgroundColor: colors.gray100,
  },
  author: {
    fontSize: 11,
    color: colors.blueSecondary,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  snapshot: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.gray950,
    fontFamily: typography.fontFamily.interRegular,
  },
  details: {
    paddingTop: 5,
    fontSize: 11,
    lineHeight: 16,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interMedium,
  },
  evidenceImages: { gap: 9 },
  evidenceImage: {
    width: 210,
    height: 145,
    borderRadius: 14,
    backgroundColor: colors.gray100,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.activityGray,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  decisions: { gap: 7 },
  decisionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle30,
    paddingHorizontal: 12,
    gap: 10,
  },
  decisionSelected: {
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
  decisionCopy: { flex: 1, paddingVertical: 7, gap: 1 },
  decisionLabel: {
    fontSize: 13,
    color: colors.gray950,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  dangerText: { color: colors.errorText },
  decisionDescription: {
    fontSize: 10,
    lineHeight: 14,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  input: {
    minHeight: 68,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.borderSubtle30,
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 10,
    textAlignVertical: 'top',
    color: colors.gray950,
    fontSize: 13,
    fontFamily: typography.fontFamily.interRegular,
  },
  error: {
    color: colors.errorText,
    fontSize: 12,
    fontFamily: typography.fontFamily.interMedium,
  },
  resultBox: {
    alignItems: 'flex-start',
    borderRadius: 15,
    padding: 14,
    gap: 9,
    backgroundColor: colors.gray100,
  },
  statusPill: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4 },
  statusText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  resultAction: {
    fontSize: 14,
    color: colors.gray950,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  resultComment: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  confirmButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bluePrimary,
  },
  confirmDisabled: { backgroundColor: colors.activityGray },
  confirmText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: typography.fontFamily.interSemiBold,
  },
});

ModerationDecisionSheet.displayName = 'ModerationDecisionSheet';

export default ModerationDecisionSheet;
