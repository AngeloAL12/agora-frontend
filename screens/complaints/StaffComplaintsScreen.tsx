import { NotificationsModal } from '@/components/NotificationsModal';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StaffDateFilters } from '@/components/staffReports/StaffDateFilters';
import { StaffReportCard } from '@/components/staffReports/StaffReportCard';
import { StaffStatCard } from '@/components/staffReports/StaffStatCard';
import { colors, typography } from '@/constants/theme';
import { useNotificationsContext } from '@/context/NotificationsContext';
import type { Complaint } from '@/hooks/useComplaints';
import { useStaffComplaints } from '@/hooks/useStaffComplaints';
import { ComplaintLoadingState } from '@/components/complaint';
import { DateFilter, isWithinDateFilter } from '@/utils/complaints';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export function StaffComplaintsScreen() {
  const router = useRouter();
  const {
    reports,
    stats,
    loading,
    loadingMore,
    hasMore,
    error,
    pageSize,
    refetch,
    fetchNextPage,
  } = useStaffComplaints();
  const {
    notifications,
    loading: notificationsLoading,
    markRead,
  } = useNotificationsContext();
  const [filter, setFilter] = useState<DateFilter>('all');
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
    return <ComplaintLoadingState />;
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
        data={visibleReports}
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
        onEndReached={() => {
          if (hasMore) void fetchNextPage();
        }}
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
                  value={stats.in_progress}
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
          loadingMore ? (
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

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
  },
  staffFiltersWrap: {
    height: 56,
    backgroundColor: colors.whiteSoft,
    zIndex: 2,
  },
  staffScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  statsGrid: {
    gap: 16,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
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
