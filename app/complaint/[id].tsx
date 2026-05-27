import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
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
import EvidenceSubmitBottomSheet from '@/components/complaint/EvidenceSubmitBottomSheet';
import SuccessBottomSheet from '@/components/SuccessBottomSheet';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useComplaintDetail } from '@/hooks/useComplaintDetail';
import { useResolvedUserRole } from '@/hooks/useResolvedUserRole';
import type { ComplaintStatus } from '@/services/complaintService';
import { updateComplaintStatus } from '@/services/complaintService';
import {
  getComplaintStatusMeta,
  isStaffRole,
  normalizeComplaintStatus,
} from '@/utils/complaints';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageViewerModalProps {
  images: { id: number; url: string }[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}

function ImageViewerModal({
  images,
  initialIndex,
  visible,
  onClose,
}: ImageViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  React.useEffect(() => {
    if (visible) setCurrentIndex(initialIndex);
  }, [visible, initialIndex]);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetTransform = () => {
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(savedScale.value * e.scale, 5));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1.05) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (savedScale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (savedScale.value > 1) {
        runOnJS(resetTransform)();
      } else {
        scale.value = withSpring(2.5);
        savedScale.value = 2.5;
      }
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const goTo = (index: number) => {
    resetTransform();
    setCurrentIndex(index);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={viewerStyles.backdrop}>
        <Pressable style={viewerStyles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color={colors.white} />
        </Pressable>

        {images.length > 1 && (
          <View style={viewerStyles.counter}>
            <Text style={viewerStyles.counterText}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        )}

        <GestureDetector gesture={composed}>
          <Animated.View style={[viewerStyles.imageWrapper, animatedStyle]}>
            <Image
              source={{ uri: images[currentIndex]?.url }}
              style={viewerStyles.fullImage}
              contentFit="contain"
            />
          </Animated.View>
        </GestureDetector>

        {images.length > 1 && (
          <View style={viewerStyles.navRow}>
            <Pressable
              style={viewerStyles.navButton}
              onPress={() => goTo(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              <Ionicons
                name="chevron-back"
                size={28}
                color={
                  currentIndex === 0 ? 'rgba(255,255,255,0.3)' : colors.white
                }
              />
            </Pressable>
            <Pressable
              style={viewerStyles.navButton}
              onPress={() =>
                goTo(Math.min(images.length - 1, currentIndex + 1))
              }
              disabled={currentIndex === images.length - 1}
            >
              <Ionicons
                name="chevron-forward"
                size={28}
                color={
                  currentIndex === images.length - 1
                    ? 'rgba(255,255,255,0.3)'
                    : colors.white
                }
              />
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

const viewerStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  counter: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    zIndex: 10,
  },
  counterText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: typography.fontFamily.interMedium,
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  navRow: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: 48,
  },
  navButton: {
    padding: 12,
  },
});

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
  const [viewerImages, setViewerImages] = useState<
    { id: number; url: string }[]
  >([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);

  const openViewer = (images: { id: number; url: string }[], index: number) => {
    setViewerImages(images);
    setViewerIndex(index);
    setViewerVisible(true);
  };
  const feedbackSheetRef = useRef<BottomSheetModal>(null);
  const evidenceSheetRef = useRef<BottomSheetModal>(null);
  const completionSheetRef = useRef<BottomSheetModal>(null);
  const [feedbackSheet, setFeedbackSheet] = useState<{
    title: string;
    message: string;
    variant: 'success' | 'error';
  }>({ title: '', message: '', variant: 'error' });

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

  const handleEvidenceSuccess = useCallback(() => {
    evidenceSheetRef.current?.dismiss();
    setTimeout(() => completionSheetRef.current?.present(), 300);
  }, []);

  const handleStatusChange = async (status: ComplaintStatus) => {
    if (!complaint || !token || updatingStatus) return;

    setStatusMenuVisible(false);

    if (status === 'RESOLVED') {
      evidenceSheetRef.current?.present();
      return;
    }

    setUpdatingStatus(true);

    try {
      await updateComplaintStatus(complaint.id, status, authPayload);
      await refetch(true);
    } catch (err: any) {
      setFeedbackSheet({
        title: 'Error',
        message:
          err?.detail || err?.message || 'No se pudo actualizar el estado.',
        variant: 'error',
      });
      feedbackSheetRef.current?.present();
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
  const isSuggestion = complaint.type === 'SUGGESTION';

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

          <View style={styles.titleContainer}>
            <Text style={styles.staffHeaderTitle}>Detalles</Text>
          </View>

          {!isSuggestion && (
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
          )}
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

        {!isSuggestion && complaint.images.length > 0 && (
          <View style={[styles.card, styles.evidenceCard]}>
            <Text style={styles.cardLabel}>Evidencia</Text>
            {complaint.images.map((img, i) => (
              <Pressable
                key={img.id}
                style={styles.imageContainer}
                onPress={() => openViewer(complaint.images, i)}
              >
                <Image
                  source={{ uri: img.url }}
                  style={styles.evidenceImage}
                  contentFit="cover"
                />
                <View style={styles.imageOverlay} />
              </Pressable>
            ))}
          </View>
        )}

        {!isSuggestion &&
          (complaint.resolution_comment || complaint.evidences.length > 0) && (
            <View style={[styles.card, styles.evidenceCard]}>
              <Text style={styles.cardLabel}>Respuesta del staff</Text>
              {complaint.resolution_comment ? (
                <Text style={styles.descriptionText}>
                  {complaint.resolution_comment}
                </Text>
              ) : null}
              {complaint.evidences.map((img, i) => (
                <Pressable
                  key={img.id}
                  style={styles.imageContainer}
                  onPress={() => openViewer(complaint.evidences, i)}
                >
                  <Image
                    source={{ uri: img.url }}
                    style={styles.evidenceImage}
                    contentFit="cover"
                  />
                  <View style={styles.imageOverlay} />
                </Pressable>
              ))}
            </View>
          )}
      </ScrollView>

      <StatusMenu
        visible={statusMenuVisible}
        selectedStatus={currentStatus}
        onDismiss={() => setStatusMenuVisible(false)}
        onSelect={handleStatusChange}
      />

      <SuccessBottomSheet
        ref={feedbackSheetRef}
        title={feedbackSheet.title}
        message={feedbackSheet.message}
        variant={feedbackSheet.variant}
        primaryLabel="Entendido"
        secondaryLabel=""
        onPrimaryPress={() => feedbackSheetRef.current?.dismiss()}
      />

      <EvidenceSubmitBottomSheet
        ref={evidenceSheetRef}
        complaintId={complaint.id}
        authPayload={authPayload}
        currentStatus={currentStatus}
        onSuccess={handleEvidenceSuccess}
      />

      <SuccessBottomSheet
        ref={completionSheetRef}
        title="¡Bien hecho!"
        message="Tus comentarios han sido enviados al usuario."
        primaryLabel="Listo"
        secondaryLabel=""
        onPrimaryPress={() => {
          completionSheetRef.current?.dismiss();
          refetch(true);
        }}
      />

      <ImageViewerModal
        images={viewerImages}
        initialIndex={viewerIndex}
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
      />
    </SafeAreaView>
  );
}

function UserComplaintDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { complaint, loading, error, refetch } = useComplaintDetail(id);
  const [refreshing, setRefreshing] = useState(false);
  const [viewerImages, setViewerImages] = useState<
    { id: number; url: string }[]
  >([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);

  const openViewer = (images: { id: number; url: string }[], index: number) => {
    setViewerImages(images);
    setViewerIndex(index);
    setViewerVisible(true);
  };

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
            {complaint.images.map((img, i) => (
              <Pressable
                key={img.id}
                style={styles.imageContainer}
                onPress={() => openViewer(complaint.images, i)}
              >
                <Image
                  source={{ uri: img.url }}
                  style={styles.evidenceImage}
                  contentFit="cover"
                />
                <View style={styles.imageOverlay} />
              </Pressable>
            ))}
          </View>
        )}

        {!isSuggestion &&
          (complaint.resolution_comment || complaint.evidences.length > 0) && (
            <View style={[styles.card, styles.evidenceCard]}>
              <Text style={styles.cardLabel}>Respuesta del staff</Text>
              {complaint.resolution_comment ? (
                <Text style={styles.descriptionText}>
                  {complaint.resolution_comment}
                </Text>
              ) : null}
              {complaint.evidences.map((img, i) => (
                <Pressable
                  key={img.id}
                  style={styles.imageContainer}
                  onPress={() => openViewer(complaint.evidences, i)}
                >
                  <Image
                    source={{ uri: img.url }}
                    style={styles.evidenceImage}
                    contentFit="cover"
                  />
                  <View style={styles.imageOverlay} />
                </Pressable>
              ))}
            </View>
          )}
      </ScrollView>

      <ImageViewerModal
        images={viewerImages}
        initialIndex={viewerIndex}
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
      />
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
  titleContainer: {
    position: 'absolute',
    left: 56,
    right: 56,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  staffHeaderTitle: {
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
  evidenceImage: {
    ...StyleSheet.absoluteFillObject,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,49,114,0.22)',
  },
});
