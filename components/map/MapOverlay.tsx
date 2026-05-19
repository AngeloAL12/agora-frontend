import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import Svg from 'react-native-svg';

import { MAP_HEIGHT, MAP_WIDTH } from '@/constants/mapData';
import type { BuildingData, MapPosition } from '@/types/map';

import BuildingMarker, {
  MARKER_CIRCLE_R,
  MARKER_PILL_GAP,
  MARKER_PILL_H,
} from './BuildingMarker';
import RoutePath from './RoutePath';
import UserLocationDot from './UserLocationDot';
import { DISPLAY_H, DISPLAY_W } from './ZoomableMap';

const HIT_SIZE = (MARKER_CIRCLE_R + MARKER_PILL_GAP + MARKER_PILL_H) * 2;

interface MapOverlayProps {
  buildings: BuildingData[];
  selectedBuildingId: number | null;
  routePoints: MapPosition[] | null;
  userPosition: MapPosition | null;
  onBuildingPress?: (building: BuildingData) => void;
}

export default function MapOverlay({
  buildings,
  selectedBuildingId,
  routePoints,
  userPosition,
  onBuildingPress,
}: MapOverlayProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        {routePoints && <RoutePath points={routePoints} />}
        {buildings.map((building) => (
          <BuildingMarker
            key={building.id}
            building={building}
            isSelected={building.id === selectedBuildingId}
          />
        ))}
        {userPosition && <UserLocationDot position={userPosition} />}
      </Svg>

      <View style={styles.hitLayer} pointerEvents="box-none">
        {buildings.map((building) => (
          <Pressable
            key={building.id}
            onPress={() => onBuildingPress?.(building)}
            style={{
              position: 'absolute',
              left: building.position.x - HIT_SIZE / 2,
              top: building.position.y - MARKER_CIRCLE_R,
              width: HIT_SIZE,
              height: HIT_SIZE,
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hitLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    transformOrigin: 'top left',
    transform: [
      { scaleX: DISPLAY_W / MAP_WIDTH },
      { scaleY: DISPLAY_H / MAP_HEIGHT },
    ],
  },
});
