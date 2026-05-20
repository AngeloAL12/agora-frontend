import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { forwardRef, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SvgXml } from 'react-native-svg';

import AppBottomSheet from '@/components/AppBottomSheet';
import ImageViewer from '@/components/ImageViewer';
import PanoramaViewer from '@/components/panorama/PanoramaViewer';
import { colors, typography } from '@/constants/theme';
import type {
  BuildingCategory,
  BuildingData,
  BuildingDetailResponse,
} from '@/types/map';

const HOW_TO_GET_ICON = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.9 18L7.05 10.95L0 8.1V6.7L18 0L11.3 18H9.9Z" fill="white"/></svg>`;
const REPORT_ICON = `<svg width="15" height="17" viewBox="0 0 15 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 17V0H9L9.4 2H15V12H8L7.6 10H2V17H0ZM9.65 10H13V4H7.75L7.35 2H2V8H9.25L9.65 10Z" fill="#191C1E"/></svg>`;
const LOCATION_ICON = `<svg width="9" height="12" viewBox="0 0 9 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 0C2.01 0 0 2.01 0 4.5C0 7.875 4.5 12 4.5 12C4.5 12 9 7.875 9 4.5C9 2.01 6.99 0 4.5 0ZM4.5 6C3.675 6 3 5.325 3 4.5C3 3.675 3.675 3 4.5 3C5.325 3 6 3.675 6 4.5C6 5.325 5.325 6 4.5 6Z" fill="#434751"/></svg>`;
const BUILDINGS_ICON = `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 10.5V9.33333H1.16667V0H7V0.583333H9.33333V9.33333H10.5V10.5H8.16667V1.75H7V10.5H0ZM2.33333 1.16667V9.33333V1.16667ZM4.66667 5.83333C4.83194 5.83333 4.97049 5.77743 5.08229 5.66563C5.1941 5.55382 5.25 5.41528 5.25 5.25C5.25 5.08472 5.1941 4.94618 5.08229 4.83437C4.97049 4.72257 4.83194 4.66667 4.66667 4.66667C4.50139 4.66667 4.36285 4.72257 4.25104 4.83437C4.13924 4.94618 4.08333 5.08472 4.08333 5.25C4.08333 5.41528 4.13924 5.55382 4.25104 5.66563C4.36285 5.77743 4.50139 5.83333 4.66667 5.83333ZM2.33333 9.33333H5.83333V1.16667H2.33333V9.33333Z" fill="#2E323C"/></svg>`;
const LABS_ICON = `<svg width="9" height="12" viewBox="0 0 9 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 11.0833V9.91667H2.91667V8.75C2.10972 8.75 1.42188 8.46562 0.853125 7.89687C0.284375 7.32812 0 6.64028 0 5.83333C0 5.24028 0.162847 4.70069 0.488542 4.21458C0.814236 3.72847 1.25417 3.37361 1.80833 3.15C1.88611 2.81944 2.05868 2.55208 2.32604 2.34792C2.5934 2.14375 2.89722 2.04167 3.2375 2.04167L2.91667 1.1375L3.47083 0.933333L3.26667 0.408333L4.375 0L4.55 0.554167L5.10417 0.35L6.70833 4.725L6.15417 4.92917L6.35833 5.48333L5.25 5.89167L5.075 5.3375L4.52083 5.54167L4.17083 4.57917C4.025 4.71528 3.85729 4.81736 3.66771 4.88542C3.47813 4.95347 3.28611 4.97778 3.09167 4.95833C2.87778 4.93889 2.67847 4.87326 2.49375 4.76146C2.30903 4.64965 2.14861 4.51111 2.0125 4.34583C1.75 4.50139 1.5434 4.71042 1.39271 4.97292C1.24201 5.23542 1.16667 5.52222 1.16667 5.83333C1.16667 6.31944 1.33681 6.73264 1.67708 7.07292C2.01736 7.41319 2.43056 7.58333 2.91667 7.58333H7.58333V8.75H4.66667V9.91667H8.16667V11.0833H0Z" fill="#2E323C"/></svg>`;
const SPORTS_ICON = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.83333 11.6667C5.02639 11.6667 4.26806 11.5135 3.55833 11.2073C2.84861 10.901 2.23125 10.4854 1.70625 9.96042C1.18125 9.43542 0.765625 8.81806 0.459375 8.10833C0.153125 7.39861 0 6.64028 0 5.83333C0 5.02639 0.153125 4.26806 0.459375 3.55833C0.765625 2.84861 1.18125 2.23125 1.70625 1.70625C2.23125 1.18125 2.84861 0.765625 3.55833 0.459375C4.26806 0.153125 5.02639 0 5.83333 0C6.64028 0 7.39861 0.153125 8.10833 0.459375C8.81806 0.765625 9.43542 1.18125 9.96042 1.70625C10.4854 2.23125 10.901 2.84861 11.2073 3.55833C11.5135 4.26806 11.6667 5.02639 11.6667 5.83333C11.6667 6.64028 11.5135 7.39861 11.2073 8.10833C10.901 8.81806 10.4854 9.43542 9.96042 9.96042C9.43542 10.4854 8.81806 10.901 8.10833 11.2073C7.39861 11.5135 6.64028 11.6667 5.83333 11.6667Z" fill="#2E323C"/></svg>`;

const CATEGORY_LABELS: Record<BuildingCategory, string> = {
  edificio: 'EDIFICIO ACADÉMICO',
  laboratorio: 'LABORATORIO',
  deporte: 'INSTALACIÓN DEPORTIVA',
  otro: 'PUNTO DE INTERÉS',
};

const CATEGORY_ICONS: Record<BuildingCategory, string> = {
  edificio: BUILDINGS_ICON,
  laboratorio: LABS_ICON,
  deporte: SPORTS_ICON,
  otro: BUILDINGS_ICON,
};

interface BuildingInfoSheetProps {
  building: BuildingDetailResponse | null;
  buildingData: BuildingData | null;
  distanceText: string | null;
  loading: boolean;
  onDismiss: () => void;
  onRoute: () => void;
}

const BuildingInfoSheet = forwardRef<BottomSheetModal, BuildingInfoSheetProps>(
  (
    { building, buildingData, distanceText, loading, onDismiss, onRoute },
    ref,
  ) => {
    const router = useRouter();
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    const [panoramaVisible, setPanoramaVisible] = useState(false);
    const [panoramaInitialIndex, setPanoramaInitialIndex] = useState(0);

    const renderContent = useCallback(() => {
      if (!buildingData && !building) return null;

      const categoryKey = buildingData?.category ?? 'edificio';
      const categoryLabel = CATEGORY_LABELS[categoryKey];
      const categoryIcon = CATEGORY_ICONS[categoryKey];
      const displayName = building?.name ?? buildingData?.label ?? '';
      const views360 = building?.views_360 ?? [];
      const thumbnail360 = views360.length > 0 ? views360[0] : null;
      const galleryImages = building?.images ?? [];

      return (
        <View style={styles.content}>
          {/* Header: text left + thumbnail right */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.categoryRow}>
                <SvgXml xml={categoryIcon} width={11} height={11} />
                <Text style={styles.categoryLabel}>{categoryLabel}</Text>
              </View>
              <Text style={styles.title}>{displayName}</Text>
              {distanceText && (
                <View style={styles.distanceRow}>
                  <SvgXml xml={LOCATION_ICON} width={9} height={12} />
                  <Text style={styles.distance}>{distanceText}</Text>
                </View>
              )}
            </View>

            {thumbnail360 && (
              <Pressable
                style={styles.thumbnailWrapper}
                onPress={() => {
                  setPanoramaInitialIndex(0);
                  setPanoramaVisible(true);
                }}
              >
                <ExpoImage
                  source={{ uri: thumbnail360.url }}
                  style={styles.thumbnailImage}
                  contentFit="cover"
                />
                <View style={styles.badge360Thumb}>
                  <Text style={styles.badge360Text}>360°</Text>
                </View>
              </Pressable>
            )}
          </View>

          {/* Photo gallery — skeleton while loading, real content after */}
          {loading ? (
            <View style={styles.gallerySkeleton}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={styles.gallerySkeletonCard} />
              ))}
            </View>
          ) : (
            (galleryImages.length > 0 || views360.length > 0) && (
              <FlatList
                data={[
                  ...galleryImages.map((img) => ({
                    ...img,
                    is360: false as const,
                  })),
                  ...views360.map((img) => ({
                    ...img,
                    is360: true as const,
                  })),
                ]}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) =>
                  `${item.is360 ? '360' : 'img'}-${item.id}`
                }
                renderItem={({ item, index }) => {
                  if (item.is360) {
                    const idx360 = index - galleryImages.length;
                    return (
                      <Pressable
                        style={styles.galleryCard}
                        onPress={() => {
                          setPanoramaInitialIndex(idx360);
                          setPanoramaVisible(true);
                        }}
                      >
                        <ExpoImage
                          source={{ uri: item.url }}
                          style={styles.galleryImage}
                          contentFit="cover"
                        />
                        <View style={styles.badge360}>
                          <Text style={styles.badge360Text}>360°</Text>
                        </View>
                      </Pressable>
                    );
                  }
                  return (
                    <Pressable
                      style={styles.galleryCard}
                      onPress={() => setViewerIndex(index)}
                    >
                      <ExpoImage
                        source={{ uri: item.url }}
                        style={styles.galleryImage}
                        contentFit="cover"
                      />
                    </Pressable>
                  );
                }}
                contentContainerStyle={styles.galleryList}
              />
            )
          )}

          {/* Action buttons */}
          <View style={styles.buttonsRow}>
            <Pressable style={styles.routeButtonWrapper} onPress={onRoute}>
              <LinearGradient
                colors={[colors.blueSecondary, colors.bluePrimary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.routeButton}
              >
                <SvgXml xml={HOW_TO_GET_ICON} width={18} height={18} />
                <Text style={styles.routeButtonText}>Cómo llegar</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.reportButton}
              onPress={() => router.push('/(tabs)/complaints')}
            >
              <SvgXml xml={REPORT_ICON} width={15} height={17} />
              <Text style={styles.reportButtonText}>Reportar</Text>
            </Pressable>
          </View>
        </View>
      );
    }, [
      building,
      buildingData,
      distanceText,
      loading,
      onRoute,
      router,
      setViewerIndex,
      setPanoramaInitialIndex,
      setPanoramaVisible,
    ]);

    const allImages = building?.images ?? [];

    return (
      <AppBottomSheet ref={ref} onDismiss={onDismiss}>
        {renderContent()}
        {viewerIndex !== null && allImages.length > 0 && (
          <ImageViewer
            visible
            images={allImages}
            selectedIndex={viewerIndex}
            onClose={() => setViewerIndex(null)}
          />
        )}
        {panoramaVisible && building && building.views_360.length > 0 && (
          <PanoramaViewer
            visible
            buildingName={building.name}
            views360={building.views_360}
            initialIndex={panoramaInitialIndex}
            onClose={() => setPanoramaVisible(false)}
          />
        )}
      </AppBottomSheet>
    );
  },
);

BuildingInfoSheet.displayName = 'BuildingInfoSheet';

export default BuildingInfoSheet;

const styles = StyleSheet.create({
  gallerySkeleton: {
    flexDirection: 'row',
    gap: 8,
  },
  gallerySkeletonCard: {
    width: 118,
    height: 105,
    borderRadius: 12,
    backgroundColor: '#E8EDF2',
  },
  content: {
    width: '100%',
    gap: 16,
  },
  // ── Header row ──────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  categoryLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interBold,
    color: colors.gray900,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.blueSecondary,
    lineHeight: 32,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  distance: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    lineHeight: 20,
  },
  // ── Thumbnail ───────────────────────────────────────────────────────────────
  thumbnailWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(195,198,210,0.2)',
  },
  thumbnailImage: {
    width: 80,
    height: 80,
  },
  badge360Thumb: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  // ── Gallery ─────────────────────────────────────────────────────────────────
  galleryList: {
    gap: 8,
  },
  galleryCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  galleryImage: {
    width: 118,
    height: 105,
  },
  badge360: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badge360Text: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interBold,
    color: '#fff',
  },
  // ── Buttons ─────────────────────────────────────────────────────────────────
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  routeButtonWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
  },
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 12,
  },
  routeButtonText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interBold,
    color: colors.white,
    lineHeight: 24,
  },
  reportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E0E3E6',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(195,198,210,0.2)',
  },
  reportButtonText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interBold,
    color: colors.blueDark,
    lineHeight: 24,
  },
});
