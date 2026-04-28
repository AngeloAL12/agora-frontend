import { NotificationsModal } from '@/components/NotificationsModal';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/Button';
import { ReportCard } from '@/components/ReportCard';
import { StaffDateFilters } from '@/components/staffReports/StaffDateFilters';
import { StaffReportCard } from '@/components/staffReports/StaffReportCard';
import { StaffStatCard } from '@/components/staffReports/StaffStatCard';
import { colors, typography } from '@/constants/theme';
import { useNotificationsContext } from '@/context/NotificationsContext';
import type { Complaint } from '@/hooks/useComplaints';
import { useComplaints } from '@/hooks/useComplaints';
import { useResolvedUserRole } from '@/hooks/useResolvedUserRole';
import { useStaffComplaints } from '@/hooks/useStaffComplaints';
import {
  DateFilter,
  isStaffRole,
  isWithinDateFilter,
  normalizeComplaintStatus,
} from '@/utils/complaints';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

export default function ComplaintsScreen() {
  const { role, loading } = useResolvedUserRole();

  if (loading) {
    return <LoadingState />;
  }

  if (isStaffRole(role)) {
    return <StaffComplaintsScreen />;
  }

  return <UserComplaintsScreen />;
}

function StaffComplaintsScreen() {
  const router = useRouter();
  const { reports, loading, error, pageSize, refetch } = useStaffComplaints();
  const {
    notifications,
    loading: notificationsLoading,
    markRead,
  } = useNotificationsContext();
  const [filter, setFilter] = useState<DateFilter>('all');
  const [visibleLimit, setVisibleLimit] = useState(pageSize);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch(true);
    setRefreshing(false);
  }, [refetch]);

  const visibleReports = useMemo(
    () => reports.filter((item) => isWithinDateFilter(item.created_at, filter)),
    [filter, reports],
  );

  const pagedReports = useMemo(
    () => visibleReports.slice(0, visibleLimit),
    [visibleLimit, visibleReports],
  );

  const hasMoreVisibleReports = visibleLimit < visibleReports.length;

  const stats = useMemo(() => {
    return reports.reduce(
      (acc, item) => {
        const status = normalizeComplaintStatus(item.status);
        acc.total += 1;
        if (status === 'PENDING') acc.pending += 1;
        if (status === 'IN_PROGRESS') acc.inProgress += 1;
        if (status === 'RESOLVED') acc.resolved += 1;
        return acc;
      },
      { total: 0, pending: 0, inProgress: 0, resolved: 0 },
    );
  }, [reports]);

  useEffect(() => {
    setVisibleLimit(pageSize);
  }, [filter, pageSize, reports]);

  const loadMoreReports = React.useCallback(() => {
    if (!hasMoreVisibleReports) return;
    setVisibleLimit((current) => current + pageSize);
  }, [hasMoreVisibleReports, pageSize]);

  const renderStaffReport = React.useCallback(
    ({ item }: { item: Complaint }) => (
      <StaffReportCard
        folio={`${item.id}`}
        type={item.type}
        title={item.title}
        description={item.description}
        date={new Date(item.created_at).toLocaleDateString('es-MX', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
        status={item.status}
        onPress={() => router.push(`/complaint/${item.id}`)}
      />
    ),
    [router],
  );

  if (loading && !refreshing) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.mainContainer}>
      <StatusBar backgroundColor={colors.bluePrimary} style="light" />

      <ScreenHeader
        title="Reportes"
        align="left"
        showNotificationBell
        onNotificationPress={() => setNotificationsVisible(true)}
      />

      <View style={styles.staffFiltersWrap}>
        <StaffDateFilters selected={filter} onChange={setFilter} />
      </View>

      <FlatList
        data={pagedReports}
        keyExtractor={(item) => `${item.id}`}
        renderItem={renderStaffReport}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.staffScrollContent,
          { paddingBottom: insets.bottom + 126 },
        ]}
        initialNumToRender={pageSize}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={40}
        windowSize={7}
        removeClippedSubviews
        onEndReached={loadMoreReports}
        onEndReachedThreshold={0.45}
        ItemSeparatorComponent={() => <View style={styles.staffCardGap} />}
        ListHeaderComponent={
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <StaffStatCard
                  label="Total"
                  value={stats.total}
                  color={colors.blueSecondary}
                />
                <StaffStatCard
                  label="Pendientes"
                  value={stats.pending}
                  color={colors.errorText}
                />
              </View>
              <View style={styles.statsRow}>
                <StaffStatCard
                  label="En proceso"
                  value={stats.inProgress}
                  color={colors.activityYellow}
                />
                <StaffStatCard
                  label="Resueltos"
                  value={stats.resolved}
                  color={colors.reportResolvedText}
                />
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </>
        }
        ListEmptyComponent={
          <View style={styles.staffEmptyState}>
            <Text style={styles.staffEmptyText}>
              No hay reportes para este periodo.
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMoreVisibleReports ? (
            <View style={styles.staffFooterLoader}>
              <ActivityIndicator size="small" color={colors.bluePrimary} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.bluePrimary]}
            tintColor={colors.bluePrimary}
          />
        }
      />

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

function UserComplaintsScreen() {
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
    return <LoadingState />;
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
        title="Reportes"
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
                      onPress={() => setFilter(item)}
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

function LoadingState() {
  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[styles.mainContainer, styles.loadingContainer]}
    >
      <ActivityIndicator size="large" color={colors.bluePrimary} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  staffFiltersWrap: {
    height: 60,
    paddingTop: 4,
    paddingBottom: 4,
    backgroundColor: colors.whiteSoft,
    zIndex: 2,
  },
  staffScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  statsGrid: {
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  staffCardsList: {
    marginTop: 12,
    gap: 8,
  },
  staffCardGap: {
    height: 8,
  },
  staffFooterLoader: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  staffEmptyState: {
    paddingTop: 32,
    alignItems: 'center',
  },
  staffEmptyText: {
    fontSize: 15,
    color: colors.notifBodyText,
    fontFamily: typography.fontFamily.interRegular,
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.errorText,
    fontFamily: typography.fontFamily.interMedium,
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
