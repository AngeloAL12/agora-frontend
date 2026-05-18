import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, StatusBar, StyleSheet, View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import type { BuildingMediaItem } from '@/types/map';

import PanoramaHud from './PanoramaHud';
import PanoramaWebView from './PanoramaWebView';
import { getFloorFromUrl, getFloorLabel, getShotLabel } from './panoramaUtils';

interface PanoramaViewerProps {
  visible: boolean;
  buildingName: string;
  views360: BuildingMediaItem[];
  initialIndex?: number;
  onClose: () => void;
}

export default function PanoramaViewer({
  visible,
  buildingName,
  views360,
  initialIndex = 0,
  onClose,
}: PanoramaViewerProps) {
  const remappedViews = useMemo(
    () =>
      views360.map((v) => ({ ...v, floor: getFloorFromUrl(v.url, v.floor) })),
    [views360],
  );

  const floors = useMemo(
    () => [...new Set(remappedViews.map((v) => v.floor))].sort((a, b) => a - b),
    [remappedViews],
  );

  const initialFloor = remappedViews[initialIndex]?.floor ?? floors[0] ?? 0;
  const [currentFloor, setCurrentFloor] = useState(initialFloor);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(() => {
    const floorPhotos = remappedViews.filter((v) => v.floor === initialFloor);
    const idx = floorPhotos.findIndex((v) => v === remappedViews[initialIndex]);
    return idx >= 0 ? idx : 0;
  });

  const photosOnFloor = useMemo(
    () => remappedViews.filter((v) => v.floor === currentFloor),
    [remappedViews, currentFloor],
  );

  const currentPhoto = photosOnFloor[currentPhotoIndex];
  const shotLabel = currentPhoto ? getShotLabel(currentPhoto.url) : '';
  const floorLabel = getFloorLabel(currentFloor);

  const floorIdx = floors.indexOf(currentFloor);
  const canGoUp = floorIdx < floors.length - 1;
  const canGoDown = floorIdx > 0;
  const canGoPrev = currentPhotoIndex > 0;
  const canGoNext = currentPhotoIndex < photosOnFloor.length - 1;

  const hudOpacity = useSharedValue(1);

  const toggleHud = useCallback(() => {
    hudOpacity.value = withTiming(hudOpacity.value > 0.5 ? 0 : 1, {
      duration: 250,
    });
  }, [hudOpacity]);

  const handleInteraction = useCallback((action: () => void) => {
    action();
  }, []);

  if (!currentPhoto) return null;

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <StatusBar hidden />
      <View style={styles.container}>
        <PanoramaWebView imageUrl={currentPhoto.url} onTap={toggleHud} />

        <PanoramaHud
          opacity={hudOpacity}
          buildingName={buildingName}
          shotLabel={shotLabel}
          floorLabel={floorLabel}
          canGoUp={canGoUp}
          canGoDown={canGoDown}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          photosOnFloorCount={photosOnFloor.length}
          currentPhotoIndex={currentPhotoIndex}
          onFloorUp={() =>
            handleInteraction(() => {
              setCurrentFloor(floors[floorIdx + 1]);
              setCurrentPhotoIndex(0);
            })
          }
          onFloorDown={() =>
            handleInteraction(() => {
              setCurrentFloor(floors[floorIdx - 1]);
              setCurrentPhotoIndex(0);
            })
          }
          onPrev={() =>
            handleInteraction(() => setCurrentPhotoIndex((i) => i - 1))
          }
          onNext={() =>
            handleInteraction(() => setCurrentPhotoIndex((i) => i + 1))
          }
          onSelectDot={(i) => handleInteraction(() => setCurrentPhotoIndex(i))}
        />

        {/* Close button — always visible */}
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  closeBtn: {
    position: 'absolute',
    top: 54,
    right: 16,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
});
