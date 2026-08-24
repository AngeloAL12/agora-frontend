import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import CustomLoadingScreen from '@/components/CustomLoadingScreen';
import { ScreenHeader } from '@/components/ScreenHeader';
import SuccessBottomSheet from '@/components/SuccessBottomSheet';
import ModerationDecisionSheet, {
  ModerationDecision,
} from '@/components/contentSafety/ModerationDecisionSheet';
import { ModerationReportCard } from '@/components/contentSafety/ModerationReportCard';
import { colors, typography } from '@/constants/theme';
import { useAdminContentReports } from '@/hooks/useAdminContentReports';
import { useResolvedUserRole } from '@/hooks/useResolvedUserRole';
import {
  AdminContentReport,
  ContentReportStatus,
  ModerationAction,
} from '@/types/contentSafety';

type Filter = 'ALL' | ContentReportStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'IN_REVIEW', label: 'En revisión' },
  { value: 'RESOLVED', label: 'Resueltos' },
  { value: 'DISMISSED', label: 'Descartados' },
];

export default function ModerationScreen() {
  const { role, loading: roleLoading } = useResolvedUserRole();
  const { reports, loading, refreshing, error, refetch, moderate } =
    useAdminContentReports();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('PENDING');
  const [selectedReport, setSelectedReport] =
    useState<AdminContentReport | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const decisionSheetRef = useRef<BottomSheetModal>(null);
  const successSheetRef = useRef<BottomSheetModal>(null);

  const visibleReports = useMemo(
    () =>
      filter === 'ALL'
        ? reports
        : reports.filter((report) => report.status === filter),
    [filter, reports],
  );

  const pendingCount = reports.filter(
    (report) => report.status === 'PENDING',
  ).length;
  const reviewCount = reports.filter(
    (report) => report.status === 'IN_REVIEW',
  ).length;

  function openReport(report: AdminContentReport) {
    setSelectedReport(report);
    setDecisionError(null);
    requestAnimationFrame(() => decisionSheetRef.current?.present());
  }

  async function handleDecision(decision: ModerationDecision, comment: string) {
    if (!selectedReport || submitting) return;
    setSubmitting(true);
    setDecisionError(null);

    let status: Exclude<ContentReportStatus, 'PENDING'> = 'RESOLVED';
    let action: ModerationAction = 'NONE';
    if (decision === 'IN_REVIEW') status = 'IN_REVIEW';
    else if (decision === 'DISMISS') status = 'DISMISSED';
    else action = decision;

    try {
      await moderate(selectedReport.id, status, action, comment);
      decisionSheetRef.current?.dismiss();
      setSuccessMessage(
        status === 'IN_REVIEW'
          ? 'La denuncia quedó asignada para revisión.'
          : 'La decisión se aplicó y el caso quedó finalizado.',
      );
      setTimeout(() => successSheetRef.current?.present(), 250);
    } catch (requestError) {
      const apiError = requestError as { detail?: string };
      setDecisionError(apiError?.detail ?? 'No se pudo aplicar la decisión.');
    } finally {
      setSubmitting(false);
    }
  }

  if (roleLoading) {
    return <CustomLoadingScreen message="Validando acceso..." />;
  }

  if ((role ?? '').toLowerCase() !== 'admin') {
    return <Redirect href="/(tabs)/complaints" />;
  }

  if (loading && !refreshing) {
    return <CustomLoadingScreen message="Cargando moderación..." />;
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.root}>
      <StatusBar backgroundColor={colors.bluePrimary} style="light" />
      <ScreenHeader
        title="Moderación"
        align="center"
        showBackButton
        backButtonColor={colors.white}
      />

      <FlatList
        data={visibleReports}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ModerationReportCard
            report={item}
            onPress={() => openReport(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 36 },
        ]}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.hero}>
              <View style={styles.heroIcon}>
                <Ionicons
                  name="shield-checkmark"
                  size={28}
                  color={colors.white}
                />
              </View>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>Centro de seguridad</Text>
                <Text style={styles.heroSubtitle}>
                  Revisa evidencia y aplica decisiones con trazabilidad.
                </Text>
              </View>
              <View style={styles.pendingPill}>
                <Text style={styles.pendingValue}>{pendingCount}</Text>
                <Text style={styles.pendingLabel}>pendientes</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{reports.length}</Text>
                <Text style={styles.statLabel}>Casos totales</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, styles.reviewValue]}>
                  {reviewCount}
                </Text>
                <Text style={styles.statLabel}>En revisión</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              {FILTERS.map((item) => {
                const selected = filter === item.value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => setFilter(item.value)}
                    style={[
                      styles.filterChip,
                      selected && styles.filterChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selected && styles.filterTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="checkmark-done"
                size={28}
                color={colors.reportResolvedText}
              />
            </View>
            <Text style={styles.emptyTitle}>Sin casos en esta vista</Text>
            <Text style={styles.emptyText}>
              Las nuevas denuncias aparecerán aquí automáticamente.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refetch(true)}
            colors={[colors.bluePrimary]}
            tintColor={colors.bluePrimary}
          />
        }
      />

      {selectedReport ? (
        <ModerationDecisionSheet
          ref={decisionSheetRef}
          report={selectedReport}
          loading={submitting}
          error={decisionError}
          onClose={() => decisionSheetRef.current?.dismiss()}
          onConfirm={(decision, comment) =>
            void handleDecision(decision, comment)
          }
        />
      ) : null}

      <SuccessBottomSheet
        ref={successSheetRef}
        title="Decisión aplicada"
        message={successMessage}
        primaryLabel="Continuar"
        secondaryLabel=""
        onPrimaryPress={() => successSheetRef.current?.dismiss()}
        onDismiss={() => setSelectedReport(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.whiteSoft },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  listHeader: { gap: 14, marginBottom: 14 },
  hero: {
    minHeight: 112,
    borderRadius: 22,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.blueSecondary,
    overflow: 'hidden',
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroCopy: { flex: 1, gap: 3 },
  heroTitle: {
    fontSize: 18,
    color: colors.white,
    fontFamily: typography.fontFamily.manropeExtraBold,
  },
  heroSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.72)',
    fontFamily: typography.fontFamily.interRegular,
  },
  pendingPill: {
    alignItems: 'center',
    minWidth: 60,
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 8,
    backgroundColor: colors.yellow,
  },
  pendingValue: {
    fontSize: 20,
    color: colors.gray950,
    fontFamily: typography.fontFamily.manropeExtraBold,
  },
  pendingLabel: {
    fontSize: 8,
    color: colors.gray900,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  statValue: {
    fontSize: 22,
    color: colors.bluePrimary,
    fontFamily: typography.fontFamily.manropeExtraBold,
  },
  reviewValue: { color: colors.activityYellow },
  statLabel: {
    fontSize: 10,
    color: colors.activityGray,
    fontFamily: typography.fontFamily.interMedium,
  },
  filters: { gap: 8, paddingVertical: 2 },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: colors.gray100,
  },
  filterChipSelected: { backgroundColor: colors.bluePrimary },
  filterText: {
    fontSize: 12,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  filterTextSelected: { color: colors.white },
  error: {
    fontSize: 12,
    color: colors.errorText,
    fontFamily: typography.fontFamily.interMedium,
  },
  gap: { height: 10 },
  emptyState: { paddingTop: 56, alignItems: 'center', paddingHorizontal: 30 },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.reportResolved,
    marginBottom: 13,
  },
  emptyTitle: {
    fontSize: 17,
    color: colors.blueDark,
    fontFamily: typography.fontFamily.manropeBold,
  },
  emptyText: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: colors.activityGray,
    fontFamily: typography.fontFamily.interRegular,
  },
});
