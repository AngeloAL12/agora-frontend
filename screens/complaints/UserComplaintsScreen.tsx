import { Button } from '@/components/Button';
import { ComplaintLoadingState } from '@/components/complaint';
import { NotificationsModal } from '@/components/NotificationsModal';
import { ReportCard } from '@/components/ReportCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, typography } from '@/constants/theme';
import { useNotificationsContext } from '@/context/NotificationsContext';
import { useComplaints } from '@/hooks/useComplaints';
import { normalizeComplaintStatus } from '@/utils/complaints';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
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

export function UserComplaintsScreen() {
  const router = useRouter();
  const { reports, loading, refetch } = useComplaints();
  const {
    notifications,
    loading: notificationsLoading,
    markRead,
  } = useNotificationsContext();
  const [filter, setFilter] = useState<'Todos' | 'Pendientes' | 'Resueltos'>(
    'Todos',
  );
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch(true);
    setRefreshing(false);
  }, [refetch]);

  if (loading && !refreshing) {
    return <ComplaintLoadingState />;
  }

  const hasReports = reports.length > 0;
  const filteredReports = reports.filter((item) => {
    const status = normalizeComplaintStatus(item.status);
    if (filter === 'Todos') return true;
    if (filter === 'Pendientes') {
      return status === 'PENDING' || status === 'IN_PROGRESS';
    }
    return status === 'RESOLVED';
  });

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.mainContainer}>
      <StatusBar backgroundColor={colors.bluePrimary} style="light" />

      <ScreenHeader
        title="Reporte de mejoras"
        align="left"
        showNotificationBell
        onNotificationPress={() => setNotificationsVisible(true)}
      />

      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 130, flexGrow: 1 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.bluePrimary]}
              tintColor={colors.bluePrimary}
            />
          }
        >
          {hasReports ? (
            <>
              <View style={styles.filtersRow}>
                {(['Todos', 'Pendientes', 'Resueltos'] as const).map((item) => {
                  const isActive = filter === item;
                  return (
                    <Pressable
                      key={item}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setFilter(item);
                      }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isActive && styles.chipTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {filteredReports.length === 0 ? (
                <View style={styles.emptyFilterState}>
                  <Text style={styles.emptyFilterText}>
                    No hay reportes para esta categoria.
                  </Text>
                </View>
              ) : (
                filteredReports.map((item, index) => (
                  <ReportCard
                    key={item.id || index}
                    folio={`${item.id}`}
                    type={item.type}
                    title={item.title}
                    description={
                      item.description || 'Sin descripcion detallada por ahora.'
                    }
                    date={new Date(item.created_at).toLocaleDateString('es-MX')}
                    status={item.status}
                    onPress={() => router.push(`/complaint/${item.id}`)}
                  />
                ))
              )}
            </>
          ) : (
            <View style={styles.emptyCardContainer}>
              <View style={styles.emptyCard}>
                <View style={styles.leftColumn}>
                  <View style={styles.iconCircle}>
                    <View style={styles.iconWrapper}>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={46}
                        color={colors.gray900}
                      />
                      <View style={styles.plusContainer}>
                        <Ionicons name="add" size={18} color={colors.gray900} />
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.rightColumn}>
                  <Text style={styles.emptyTitle}>
                    Tienes algo que reportar?
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    Tu voz ayuda a mejorar nuestra comunidad universitaria.
                    Inicia un nuevo reporte ahora.
                  </Text>
                  <View style={styles.buttonWrapper}>
                    <Button
                      text="Nuevo Reporte"
                      onPress={() => router.push('/create-report')}
                      style={{
                        backgroundColor: colors.bluePrimary,
                        borderRadius: 30,
                      }}
                      fullWidth={false}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 96 }]}
        onPress={() => router.push('/create-report')}
      >
        <Ionicons name="add" size={32} color={colors.gray900} />
      </Pressable>

      <NotificationsModal
        visible={notificationsVisible}
        onDismiss={() => setNotificationsVisible(false)}
        notifications={notifications}
        loading={notificationsLoading}
        onNotificationPress={markRead}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.white,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  chipActive: {
    backgroundColor: colors.bluePrimary,
  },
  chipText: {
    color: colors.notifBodyText,
    fontFamily: typography.fontFamily.interSemiBold,
    fontSize: 14,
  },
  chipTextActive: {
    color: colors.white,
    fontFamily: typography.fontFamily.interBold,
  },
  emptyFilterState: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyFilterText: {
    color: colors.notifBodyText,
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
  },
  emptyCardContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  emptyCard: {
    backgroundColor: '#FFF9E1',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#F6ECA9',
  },
  leftColumn: {
    marginRight: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FDEB71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 46,
    height: 46,
    position: 'relative',
  },
  plusContainer: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: '#FDEB71',
    borderRadius: 10,
    padding: 1,
  },
  rightColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray900,
    textAlign: 'left',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.notifBodyText,
    textAlign: 'left',
    lineHeight: 18,
    marginBottom: 16,
    fontFamily: typography.fontFamily.interRegular,
  },
  buttonWrapper: {
    alignSelf: 'flex-start',
  },
  fab: {
    position: 'absolute',
    right: 24,
    backgroundColor: colors.yellow,
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});
