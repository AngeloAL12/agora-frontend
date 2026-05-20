import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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

const SCALE_X = DISPLAY_W / MAP_WIDTH;
const SCALE_Y = DISPLAY_H / MAP_HEIGHT;

// Hit area in SVG units, converted to display pixels
const HIT_SIZE_SVG = (MARKER_CIRCLE_R + MARKER_PILL_GAP + MARKER_PILL_H) * 2;
const HIT_W = HIT_SIZE_SVG * SCALE_X;
const HIT_H = HIT_SIZE_SVG * SCALE_Y;

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
      </Svg>

      {userPosition && (
        <UserLocationDot
          position={userPosition}
          scaleX={SCALE_X}
          scaleY={SCALE_Y}
        />
      )}

      {/* Hit areas are positioned in display-pixel coordinates to avoid
          transformOrigin (unsupported on New Architecture in release builds). */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {buildings.map((building) => (
          <Pressable
            key={building.id}
            onPress={() => onBuildingPress?.(building)}
            style={{
              position: 'absolute',
              left: building.position.x * SCALE_X - HIT_W / 2,
              top: building.position.y * SCALE_Y - MARKER_CIRCLE_R * SCALE_Y,
              width: HIT_W,
              height: HIT_H,
            }}
          />
        ))}
      </View>
    </View>
  );
}
