import { ScreenHeader } from '@/components/ScreenHeader';
import { useComplaintDetail } from '@/hooks/useComplaintDetail';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const statusColors: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  'En proceso': { bg: '#FDEB71', text: '#3E2723', label: 'En proceso' },
  Resuelto: { bg: '#D4EFDF', text: '#145A32', label: 'Resuelto' },
  Rechazado: { bg: '#FADBD8', text: '#78281F', label: 'Rechazado' },
  Pendiente: { bg: '#E5E7E9', text: '#1A1A1A', label: 'Pendiente' },
  PENDING: { bg: '#E5E7E9', text: '#1A1A1A', label: 'Pendiente' },
  IN_PROGRESS: { bg: '#FDEB71', text: '#3E2723', label: 'En proceso' },
  RESOLVED: { bg: '#D4EFDF', text: '#145A32', label: 'Resuelto' },
  REJECTED: { bg: '#FADBD8', text: '#78281F', label: 'Rechazado' },
};

const categoryMap: Record<string, string> = {
  MAINTENANCE: 'Mantenimiento',
  INFRASTRUCTURE: 'Infraestructura',
  CLEANING: 'Limpieza',
  SECURITY: 'Seguridad',
  ACADEMIC: 'Académico',
  OTHER: 'Otro',
};

export default function ComplaintDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { complaint, loading, error, refetch } = useComplaintDetail(id);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch(true);
    setRefreshing(false);
  }, [refetch]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E488F" />
      </SafeAreaView>
    );
  }

  if (error || !complaint) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>No se pudo cargar el reporte.</Text>
      </SafeAreaView>
    );
  }

  const isSuggestion = complaint.type === 'SUGGESTION';
  const colors = statusColors[complaint.status] || statusColors['PENDING'];
  const formattedDate = new Date(complaint.created_at).toLocaleDateString(
    'es-MX',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  );
  const categoryStr = categoryMap[complaint.category] || complaint.category;

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={styles.mainContainer}
    >
      <StatusBar backgroundColor="#1E488F" style="light" />

      <View style={styles.headerContainer}>
        <ScreenHeader
          title={
            isSuggestion ? 'Detalles de la sugerencia' : 'Detalles del reporte'
          }
          align="center"
          showNotificationBell={false}
          leftAction={
            <Pressable onPress={() => router.replace('/complaints')}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </Pressable>
          }
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E488F']}
            tintColor="#1E488F"
          />
        }
      >
        {/* Card 1: Title and Status */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>TÍTULO</Text>
            <View style={[styles.badge, { backgroundColor: colors.bg }]}>
              <Text style={[styles.badgeText, { color: colors.text }]}>
                {colors.label}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>{complaint.title}</Text>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-clear-outline" size={14} color="#566573" />
            <Text style={styles.dateText}>Enviado: {formattedDate}</Text>
          </View>
        </View>

        {/* Card 2: Location and Category */}
        <View style={styles.card}>
          {!isSuggestion && complaint.id_building !== null && (
            <View style={styles.infoRow}>
              <Text style={styles.cardLabel}>UBICACIÓN</Text>
              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color="#1E488F"
                  style={styles.locationIcon}
                />
                <Text style={styles.infoText}>
                  Edificio {complaint.id_building}
                  {complaint.classroom
                    ? `, Aula ${complaint.classroom}`
                    : ', área exterior'}
                </Text>
              </View>
            </View>
          )}

          <View
            style={[
              styles.infoRow,
              !isSuggestion &&
                complaint.id_building !== null && { marginTop: 16 },
            ]}
          >
            <Text style={styles.cardLabel}>CATEGORÍA</Text>
            <Text style={styles.infoText}>{categoryStr}</Text>
          </View>
        </View>

        {/* Card 3: Description */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>DESCRIPCIÓN</Text>
          <Text style={styles.descriptionText}>{complaint.description}</Text>
        </View>

        {/* Card 4: Evidence */}
        {!isSuggestion && complaint.images && complaint.images.length > 0 && (
          <View style={[styles.card, styles.evidenceCard]}>
            <Text style={styles.cardLabel}>EVIDENCIA</Text>
            {complaint.images.map((img) => (
              <View key={img.id} style={styles.imageContainer}>
                <Image source={{ uri: img.url }} style={styles.evidenceImage} />
                <View style={styles.imageOverlay} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FCFBFB',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FCFBFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#566573',
  },
  headerContainer: {
    backgroundColor: '#1E488F',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#003172',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#747782',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003172',
    marginBottom: 12,
    lineHeight: 28,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#434751',
  },
  infoRow: {
    flexDirection: 'column',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -2,
    marginTop: 4,
  },
  locationIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 16,
    color: '#191C1E',
    lineHeight: 26,
  },
  descriptionText: {
    fontSize: 16,
    color: '#191C1E',
    lineHeight: 26,
  },
  evidenceCard: {
    gap: 16,
  },
  imageContainer: {
    width: '100%',
    height: 256,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  evidenceImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 49, 114, 0.4)',
  },
});
