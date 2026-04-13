import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { Button } from '../../components/Button';
import { ReportCard } from '../../components/ReportCard';
import { useComplaints } from '../../hooks/useComplaints';

export default function ComplaintsScreen() {
  const router = useRouter();
  const { reports, loading, refetch } = useComplaints();
  const [filter, setFilter] = useState<'Todos' | 'Pendientes' | 'Resueltos'>(
    'Todos',
  );
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch(true);
    setRefreshing(false);
  }, [refetch]);
  const insets = useSafeAreaInsets();
  const fabBottom = insets.bottom + 96;
  const scrollPaddingBottom = insets.bottom + 130;

  if (loading && !refreshing) {
    return (
      <SafeAreaView
        edges={['left', 'right']}
        style={[
          styles.mainContainer,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#1E488F" />
      </SafeAreaView>
    );
  }

  const hasReports = reports.length > 0;

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.mainContainer}>
      <StatusBar backgroundColor="#1E488F" style="light" />

      <ScreenHeader title="Reportes" align="left" showNotificationBell />

      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: scrollPaddingBottom, flexGrow: 1 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1E488F']}
              tintColor="#1E488F"
            />
          }
        >
          {hasReports ? (
            <>
              <View style={styles.filtersRow}>
                <Pressable
                  style={[styles.chip, filter === 'Todos' && styles.chipActive]}
                  onPress={() => setFilter('Todos')}
                >
                  <Text
                    style={
                      filter === 'Todos'
                        ? styles.chipTextActive
                        : styles.chipText
                    }
                  >
                    Todos
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.chip,
                    filter === 'Pendientes' && styles.chipActive,
                  ]}
                  onPress={() => setFilter('Pendientes')}
                >
                  <Text
                    style={
                      filter === 'Pendientes'
                        ? styles.chipTextActive
                        : styles.chipText
                    }
                  >
                    Pendientes
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.chip,
                    filter === 'Resueltos' && styles.chipActive,
                  ]}
                  onPress={() => setFilter('Resueltos')}
                >
                  <Text
                    style={
                      filter === 'Resueltos'
                        ? styles.chipTextActive
                        : styles.chipText
                    }
                  >
                    Resueltos
                  </Text>
                </Pressable>
              </View>

              {(() => {
                const filteredReports = reports.filter((item) => {
                  if (filter === 'Todos') return true;
                  if (filter === 'Pendientes')
                    return [
                      'Pendiente',
                      'PENDING',
                      'En proceso',
                      'IN_PROGRESS',
                    ].includes(item.status);
                  if (filter === 'Resueltos')
                    return ['Resuelto', 'RESOLVED'].includes(item.status);
                  return true;
                });

                if (filteredReports.length === 0) {
                  return (
                    <View style={{ marginTop: 40, alignItems: 'center' }}>
                      <Text style={{ color: '#566573', fontSize: 16 }}>
                        No hay reportes para esta categoría.
                      </Text>
                    </View>
                  );
                }

                return filteredReports.map((item, index) => (
                  <ReportCard
                    key={item.id || index}
                    folio={`${item.id}`}
                    title={item.title}
                    description={
                      item.description || 'Sin descripción detallada por ahora.'
                    }
                    date={new Date(item.created_at).toLocaleDateString('es-MX')}
                    status={item.status}
                    onPress={() => router.push(`/complaint/${item.id}`)}
                  />
                ));
              })()}
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
                        color="#2E323C"
                      />
                      <View style={styles.plusContainer}>
                        <Ionicons name="add" size={18} color="#2E323C" />
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.rightColumn}>
                  <Text style={styles.emptyTitle}>
                    ¿Tienes algo que reportar?
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    Tu voz ayuda a mejorar nuestra comunidad universitaria.
                    Inicia un nuevo reporte ahora.
                  </Text>
                  <View style={styles.buttonWrapper}>
                    <Button
                      text="Nuevo Reporte"
                      onPress={() => router.push('/create-report')}
                      style={{ backgroundColor: '#1E488F', borderRadius: 30 }}
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
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={() => router.push('/create-report')}
      >
        <Ionicons name="add" size={32} color="#2E323C" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FCFBFB',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  chipActive: {
    backgroundColor: '#1E488F',
    borderWidth: 0,
  },
  chipText: {
    color: '#566573',
    fontWeight: '600',
    fontSize: 14,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
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
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 1,
    borderColor: '#F6ECA9',
  },
  leftColumn: { marginRight: 16 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FDEB71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: { width: 46, height: 46, position: 'relative' },
  plusContainer: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: '#FDEB71',
    borderRadius: 10,
    padding: 1,
  },
  rightColumn: { flex: 1, justifyContent: 'center', alignItems: 'flex-start' },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E323C',
    textAlign: 'left',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#566573',
    textAlign: 'left',
    lineHeight: 18,
    marginBottom: 16,
  },
  buttonWrapper: { alignSelf: 'flex-start' },

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});
