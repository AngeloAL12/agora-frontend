import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../../components/Button';
import { ReportCard } from '../../components/ReportCard';
import { apiRequest } from '../../services/api';

export default function ComplaintsScreen() {
  const { token } = useAuth();

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const data = await apiRequest<any[]>({
        method: 'GET',
        path: '/complaints/me',
        token: token ?? undefined,
      });
      setReports(data || []);
    } catch (error) {
      console.error('Error jalando reportes de la API:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token]);

  if (loading) {
    return (
      <SafeAreaView
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
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1E488F" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reportes</Text>
        <Image
          source={require('../../assets/images/campana.png')}
          style={{ width: 26, height: 26, resizeMode: 'contain' }}
        />
      </View>

      <View style={styles.content}>
        {hasReports ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.filtersRow}>
              <View style={[styles.chip, styles.chipActive]}>
                <Text style={styles.chipTextActive}>Todos</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Pendientes</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Resueltos</Text>
              </View>
            </View>

            {reports.map((item, index) => (
              <ReportCard
                key={index}
                folio={`#${item.id}`}
                title={item.title}
                description={
                  item.description || 'Sin descripción detallada por ahora.'
                }
                date={new Date(item.created_at).toLocaleDateString('es-MX')}
                status={item.status}
              />
            ))}
          </ScrollView>
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
                  Tu voz ayuda a mejorar nuestra comunidad universitaria. Inicia
                  un nuevo reporte ahora.
                </Text>
                <View style={styles.buttonWrapper}>
                  <Button
                    text="Nuevo Reporte"
                    onPress={() => console.log('Nuevo reporte')}
                    style={{ backgroundColor: '#1E488F', borderRadius: 30 }}
                    fullWidth={false}
                  />
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      <Pressable
        style={styles.fab}
        onPress={() => console.log('Nuevo reporte FAB')}
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
  header: {
    backgroundColor: '#1E488F',
    height: 110,
    paddingHorizontal: 20,
    paddingTop: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 130,
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
    bottom: 90,
    right: 20,
    backgroundColor: '#F1C806',
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});
