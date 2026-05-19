import React from 'react';
import { StyleSheet } from 'react-native';
import Svg from 'react-native-svg';

import { MAP_HEIGHT, MAP_WIDTH } from '@/constants/mapData';
import type { BuildingData, MapPosition } from '@/types/map';

import BuildingMarker from './BuildingMarker';
import RoutePath from './RoutePath';
import UserLocationDot from './UserLocationDot';

interface MapOverlayProps {
  buildings: BuildingData[];
  selectedBuildingId: number | null;
  routePoints: MapPosition[] | null;
  userPosition: MapPosition | null;
  onBuildingPress: (building: BuildingData) => void;
}

export default function MapOverlay({
  buildings,
  selectedBuildingId,
  routePoints,
  userPosition,
  onBuildingPress,
}: MapOverlayProps) {
  return (
    <Svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      style={StyleSheet.absoluteFill}
    >
      {routePoints && <RoutePath points={routePoints} />}
      {buildings.map((building) => (
        <BuildingMarker
          key={building.id}
          building={building}
          isSelected={building.id === selectedBuildingId}
          onPress={onBuildingPress}
        />
      ))}
      {userPosition && <UserLocationDot position={userPosition} />}
    </Svg>
  );
}
