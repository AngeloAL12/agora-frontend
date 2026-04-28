import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
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

import EvidenceUpload from '@/components/report/EvidenceUpload';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import {
  ComplaintDetail,
  useComplaintDetail,
} from '@/hooks/useComplaintDetail';
import { useResolvedUserRole } from '@/hooks/useResolvedUserRole';
import {
  ComplaintStatus,
  LocalImageFile,
  updateComplaintStatus,
  uploadComplaintEvidence,
} from '@/services/reportService';
import {
  complaintStatusOptions,
  getComplaintStatusMeta,
  isStaffRole,
  normalizeComplaintStatus,
} from '@/utils/complaints';

const categoryMap: Record<string, string> = {
  MAINTENANCE: 'Mantenimiento',
  INFRASTRUCTURE: 'Infraestructura',
  CLEANING: 'Limpieza',
  SECURITY: 'Seguridad',
  ACADEMIC: 'Academico',
  OTHER: 'Otro',
};

export default function ComplaintDetailScreen() {
  const { role, loading } = useResolvedUserRole();

  if (loading) {
    return <LoadingState />;
  }

  if (isStaffRole(role)) {
    return <StaffComplaintDetailScreen />;
  }

  return <UserComplaintDetailScreen />;
}

function StaffComplaintDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token, refreshToken, setTokens, logout } = useAuth();
  const { complaint, loading, error, refetch } = useComplaintDetail(id);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [localEvidence, setLocalEvidence] = useState<LocalImageFile[]>([]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch(true);
    setRefreshing(false);
  }, [refetch]);

  const authPayload = useMemo(
    () => ({
      token: token ?? '',
      refreshToken: refreshToken ?? undefined,
      onTokenRefreshed: (newAccess: string, newRefresh: string) => {
        setTokens(newAccess, newRefresh).catch(() => {});
      },
      onRefreshFailed: () => {
        logout().catch(() => {});
      },
    }),
    [logout, refreshToken, setTokens, token],
  );

  const pickEvidence = async () => {
    if (!complaint || !token || uploadingEvidence) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permiso requerido',
        'Necesitas permitir acceso a tus fotos.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 3,
    });

    if (result.canceled) return;

    const selectedFiles: LocalImageFile[] = result.assets
      .slice(0, 3)
      .map((asset, index) => ({
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || `evidence_${Date.now()}_${index}.jpg`,
      }));

    setLocalEvidence(selectedFiles);
    setUploadingEvidence(true);

    try {
      for (const file of selectedFiles) {
        await uploadComplaintEvidence(complaint.id, file, authPayload);
      }
      setLocalEvidence([]);
      await refetch(true);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.detail || err?.message || 'No se pudo subir la evidencia.',
      );
    } finally {
      setUploadingEvidence(false);
    }
  };

  const handleStatusChange = async (status: ComplaintStatus) => {
    if (!complaint || !token || updatingStatus) return;

    if (status === 'RESOLVED' && complaint.images.length === 0) {
      setStatusMenuVisible(false);
      Alert.alert(
        'Evidencia requerida',
        'Sube evidencia antes de marcar el reporte como resuelto.',
      );
      return;
    }

    setStatusMenuVisible(false);
    setUpdatingStatus(true);

    try {
      await updateComplaintStatus(complaint.id, status, authPayload);
      await refetch(true);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.detail || err?.message || 'No se pudo actualizar el estado.',
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading && !refreshing) {
    return <LoadingState />;
  }

  if (error || !complaint) {
    return <ErrorState />;
  }

  const currentStatus = normalizeComplaintStatus(complaint.status);
  const currentStatusMeta = getComplaintStatusMeta(currentStatus);

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={styles.mainContainer}
    >
      <StatusBar backgroundColor={colors.bluePrimary} style="light" />

      <View style={[styles.staffHeader, { paddingTop: insets.top }]}>
        <View style={styles.staffHeaderRow}>
          <Pressable style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>

          <Text style={styles.staffHeaderTitle}>Detalles</Text>

          <Pressable
            style={[
              styles.statusSelector,
              { backgroundColor: currentStatusMeta.bg },
            ]}
            onPress={() => setStatusMenuVisible(true)}
            disabled={updatingStatus}
          >
            <Text
              style={[
                styles.statusSelectorText,
                { color: currentStatusMeta.text },
              ]}
            >
              {updatingStatus ? 'Actualizando' : currentStatusMeta.label}
            </Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color={currentStatusMeta.text}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.staffDetailContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.bluePrimary]}
            tintColor={colors.bluePrimary}
          />
        }
      >
        <TitleCard complaint={complaint} />
        <InfoCard complaint={complaint} />

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Descripcion</Text>
          <Text style={styles.descriptionText}>{complaint.description}</Text>
        </View>

        <View style={[styles.card, styles.evidenceCard]}>
          <Text style={styles.cardLabel}>Evidencia</Text>
          {complaint.images.length > 0 ? (
            complaint.images.map((img) => (
              <View key={img.id} style={styles.staffImageContainer}>
                <Image
                  source={{ uri: img.url }}
                  style={styles.evidenceImage}
                  contentFit="cover"
                />
                <View style={styles.imageOverlay} />
              </View>
            ))
          ) : (
            <Text style={styles.emptyEvidenceText}>
              Aun no hay evidencia cargada.
            </Text>
          )}

          <EvidenceUpload
            images={localEvidence}
            onPickImage={pickEvidence}
            onRemoveImage={(index) =>
              setLocalEvidence((prev) => prev.filter((_, i) => i !== index))
            }
            disabled={uploadingEvidence}
          />
          {uploadingEvidence ? (
            <Text style={styles.uploadingText}>Subiendo evidencia...</Text>
          ) : null}
        </View>
      </ScrollView>

      <StatusMenu
        visible={statusMenuVisible}
        selectedStatus={currentStatus}
        onDismiss={() => setStatusMenuVisible(false)}
        onSelect={handleStatusChange}
      />
    </SafeAreaView>
  );
}

function UserComplaintDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { complaint, loading, error, refetch } = useComplaintDetail(id);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch(true);
    setRefreshing(false);
  }, [refetch]);

  if (loading && !refreshing) {
    return <LoadingState />;
  }

  if (error || !complaint) {
    return <ErrorState />;
  }

  const isSuggestion = complaint.type === 'SUGGESTION';

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={styles.mainContainer}
    >
      <StatusBar backgroundColor={colors.bluePrimary} style="light" />

      <View style={styles.headerContainer}>
        <ScreenHeader
          title={
            isSuggestion ? 'Detalles de la sugerencia' : 'Detalles del reporte'
          }
          align="center"
          showNotificationBell={false}
          leftAction={
            <Pressable onPress={() => router.replace('/complaints')}>
              <Ionicons name="arrow-back" size={24} color={colors.white} />
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
            colors={[colors.bluePrimary]}
            tintColor={colors.bluePrimary}
          />
        }
      >
        <TitleCard complaint={complaint} />
        <InfoCard complaint={complaint} />

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Descripcion</Text>
          <Text style={styles.descriptionText}>{complaint.description}</Text>
        </View>

        {!isSuggestion && complaint.images.length > 0 && (
          <View style={[styles.card, styles.evidenceCard]}>
            <Text style={styles.cardLabel}>Evidencia</Text>
            {complaint.images.map((img) => (
              <View key={img.id} style={styles.imageContainer}>
                <Image
                  source={{ uri: img.url }}
                  style={styles.evidenceImage}
                  contentFit="cover"
                />
                <View style={styles.imageOverlay} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TitleCard({ complaint }: { complaint: ComplaintDetail }) {
  const statusMeta = getComplaintStatusMeta(complaint.status);
  const formattedDate = new Date(complaint.created_at).toLocaleDateString(
    'es-MX',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardLabel}>Titulo</Text>
        <View style={[styles.badge, { backgroundColor: statusMeta.bg }]}>
          <Text style={[styles.badgeText, { color: statusMeta.text }]}>
            {statusMeta.label}
          </Text>
        </View>
      </View>
      <Text style={styles.title}>{complaint.title}</Text>
      <View style={styles.dateRow}>
        <Ionicons
          name="calendar-clear-outline"
          size={14}
          color={colors.gray700}
        />
        <Text style={styles.dateText}>Enviado: {formattedDate}</Text>
      </View>
    </View>
  );
}

function InfoCard({ complaint }: { complaint: ComplaintDetail }) {
  const isSuggestion = complaint.type === 'SUGGESTION';
  const categoryStr = categoryMap[complaint.category] || complaint.category;

  return (
    <View style={styles.card}>
      {!isSuggestion && complaint.id_building !== null && (
        <View style={styles.infoRow}>
          <Text style={styles.cardLabel}>Ubicacion</Text>
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={colors.bluePrimary}
              style={styles.locationIcon}
            />
            <Text style={styles.infoText}>
              Edificio {complaint.id_building}
              {complaint.classroom
                ? `, Aula ${complaint.classroom}`
                : ', area exterior'}
            </Text>
          </View>
        </View>
      )}

      <View
        style={[
          styles.infoRow,
          !isSuggestion && complaint.id_building !== null && styles.infoRowGap,
        ]}
      >
        <Text style={styles.cardLabel}>Categoria</Text>
        <Text style={styles.infoText}>{categoryStr}</Text>
      </View>
    </View>
  );
}

function StatusMenu({
  visible,
  selectedStatus,
  onDismiss,
  onSelect,
}: {
  visible: boolean;
  selectedStatus: ComplaintStatus;
  onDismiss: () => void;
  onSelect: (status: ComplaintStatus) => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.modalOverlay} onPress={onDismiss}>
        <View style={styles.statusMenu}>
          {complaintStatusOptions.map((option) => {
            const meta = getComplaintStatusMeta(option.value);
            const selected = selectedStatus === option.value;

            return (
              <Pressable
                key={option.value}
                style={[styles.statusOption, selected && styles.statusSelected]}
                onPress={() => onSelect(option.value)}
              >
                <View
                  style={[styles.statusDot, { backgroundColor: meta.bg }]}
                />
                <Text style={styles.statusOptionText}>{option.label}</Text>
                {selected ? (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={colors.bluePrimary}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

function LoadingState() {
  return (
    <SafeAreaView style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.bluePrimary} />
    </SafeAreaView>
  );
}

function ErrorState() {
  return (
    <SafeAreaView style={styles.loadingContainer}>
      <Text style={styles.errorText}>No se pudo cargar el reporte.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.notifBodyText,
    fontFamily: typography.fontFamily.interRegular,
  },
  headerContainer: {
    backgroundColor: colors.bluePrimary,
  },
  staffHeader: {
    backgroundColor: colors.bluePrimary,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  staffHeaderRow: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffHeaderTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.white,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: typography.fontFamily.manropeBold,
  },
  statusSelector: {
    minWidth: 104,
    height: 36,
    borderRadius: 999,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statusSelectorText: {
    fontSize: 10,
    lineHeight: 16,
    textTransform: 'uppercase',
    fontFamily: typography.fontFamily.interBold,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  staffDetailContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.blueSecondary,
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
    lineHeight: 16,
    fontFamily: typography.fontFamily.interBold,
    color: colors.activityGray,
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
    lineHeight: 16,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    color: colors.blueSecondary,
    marginBottom: 12,
    fontFamily: typography.fontFamily.manropeBold,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  infoRow: {
    flexDirection: 'column',
  },
  infoRowGap: {
    marginTop: 16,
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
    color: colors.gray950,
    lineHeight: 26,
    fontFamily: typography.fontFamily.interRegular,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.gray950,
    lineHeight: 26,
    fontFamily: typography.fontFamily.interRegular,
  },
  evidenceCard: {
    gap: 12,
  },
  imageContainer: {
    width: '100%',
    height: 256,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  staffImageContainer: {
    width: '100%',
    height: 238,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  evidenceImage: {
    ...StyleSheet.absoluteFillObject,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,49,114,0.22)',
  },
  emptyEvidenceText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.notifBodyText,
    fontFamily: typography.fontFamily.interRegular,
  },
  uploadingText: {
    fontSize: 13,
    color: colors.bluePrimary,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 86,
    paddingRight: 20,
  },
  statusMenu: {
    width: 220,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingVertical: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  statusOption: {
    minHeight: 44,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusSelected: {
    backgroundColor: colors.bluePrimaryLight2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusOptionText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray950,
    fontFamily: typography.fontFamily.interSemiBold,
  },
});
