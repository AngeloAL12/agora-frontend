import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getMyContentReports } from '@/services/contentSafetyService';
import { ContentReport } from '@/types/contentSafety';
import {
  CONTENT_ACTION_LABELS,
  CONTENT_REASON_LABELS,
  CONTENT_STATUS_META,
  CONTENT_TARGET_LABELS,
} from '@/utils/contentSafety';

export default function MyContentReportsScreen() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (refresh = false) => {
      if (!token) return;
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        setReports(await getMyContentReports(token));
      } catch (requestError) {
        const apiError = requestError as { detail?: string };
        setError(apiError.detail ?? 'No se pudieron cargar tus denuncias.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.root}>
      <ScreenHeader
        variant="white"
        title="Mis denuncias"
        align="center"
        showBackButton
        backButtonColor={colors.blueDark}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.bluePrimary} />
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 30 },
            reports.length === 0 && styles.emptyContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor={colors.bluePrimary}
            />
          }
          ListHeaderComponent={
            reports.length > 0 ? (
              <Text style={styles.explanation}>
                Aquí puedes consultar el estado y la medida tomada por el equipo
                de administración.
              </Text>
            ) : null
          }
          renderItem={({ item }) => {
            const status = CONTENT_STATUS_META[item.status];
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.targetPill}>
                    <Ionicons
                      name="flag-outline"
                      size={14}
                      color={colors.bluePrimary}
                    />
                    <Text style={styles.targetText}>
                      {CONTENT_TARGET_LABELS[item.target_type]} #
                      {item.target_id}
                    </Text>
                  </View>
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
                </View>

                <Text style={styles.reason}>
                  {CONTENT_REASON_LABELS[item.reason]}
                </Text>
                {item.details ? (
                  <Text numberOfLines={3} style={styles.details}>
                    {item.details}
                  </Text>
                ) : null}

                <View style={styles.footer}>
                  <Text style={styles.date}>
                    {new Date(item.created_at).toLocaleDateString('es-MX')}
                  </Text>
                  {item.status === 'RESOLVED' || item.status === 'DISMISSED' ? (
                    <Text style={styles.action}>
                      {CONTENT_ACTION_LABELS[item.action_taken]}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.gap} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={32}
                  color={colors.reportResolvedText}
                />
              </View>
              <Text style={styles.emptyTitle}>No has enviado denuncias</Text>
              <Text style={styles.emptyText}>
                Si encuentras contenido ofensivo, toca la bandera que aparece
                junto a él para avisar a los administradores.
              </Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.whiteSoft },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16 },
  emptyContent: { flexGrow: 1 },
  explanation: {
    marginBottom: 14,
    fontSize: 13,
    lineHeight: 19,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 18,
    padding: 15,
    gap: 9,
    backgroundColor: colors.white,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  targetPill: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  targetText: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: colors.bluePrimary,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  statusPill: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4 },
  statusText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  reason: {
    fontSize: 15,
    color: colors.blueDark,
    fontFamily: typography.fontFamily.manropeBold,
  },
  details: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
    paddingTop: 9,
  },
  date: {
    fontSize: 10,
    color: colors.activityGray,
    fontFamily: typography.fontFamily.interRegular,
  },
  action: {
    flex: 1,
    textAlign: 'right',
    fontSize: 10,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interMedium,
  },
  gap: { height: 10 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: colors.reportResolved,
  },
  emptyTitle: {
    fontSize: 18,
    color: colors.blueDark,
    fontFamily: typography.fontFamily.manropeBold,
  },
  emptyText: {
    marginTop: 7,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  error: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.errorText,
    fontFamily: typography.fontFamily.interRegular,
  },
});
