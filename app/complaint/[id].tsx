import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  Alert,
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

import {
  ComplaintErrorState,
  ComplaintLoadingState,
  InfoCard,
  StatusMenu,
  TitleCard,
} from '@/components/complaint';
import EvidenceUpload from '@/components/report/EvidenceUpload';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useComplaintDetail } from '@/hooks/useComplaintDetail';
import { useResolvedUserRole } from '@/hooks/useResolvedUserRole';
import type { ComplaintStatus } from '@/services/complaintService';
import {
  updateComplaintStatus,
  uploadComplaintEvidence,
} from '@/services/complaintService';
import {
  getComplaintStatusMeta,
  isStaffRole,
  normalizeComplaintStatus,
} from '@/utils/complaints';
import type { LocalImageFile } from '@/types/report';

export default function ComplaintDetailScreen() {
  const { role, loading } = useResolvedUserRole();

  if (loading) {
    return <ComplaintLoadingState />;
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

  React.useEffect(() => {
    if (!loading && !error) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [loading, error]);
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
    return <ComplaintLoadingState />;
  }

  if (error || !complaint) {
    return <ComplaintErrorState />;
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
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setStatusMenuVisible(true);
            }}
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
    return <ComplaintLoadingState />;
  }

  if (error || !complaint) {
    return <ComplaintErrorState />;
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

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
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
  cardLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: typography.fontFamily.interBold,
    color: colors.activityGray,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
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
});
