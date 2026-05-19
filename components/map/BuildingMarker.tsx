import React from 'react';
import { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import type { BuildingData } from '@/types/map';

interface BuildingMarkerProps {
  building: BuildingData;
  isSelected: boolean;
  onPress: (building: BuildingData) => void;
}

const CIRCLE_R = 110;
const ICON_SCALE = 5; // 22×18 icon → 88×72 SVG units, fits inside r=110
const ICON_W = 22;
const ICON_H = 18;
const PILL_GAP = 18;
const PILL_H = 70;
const PILL_RX = 35;

// hat.svg path (viewBox 0 0 22 18)
const HAT_PATH =
  'M20 14V7.1L11 12L2.98023e-08 6L11 0L22 6V14H20ZM11 18L4 14.2V9.2L11 13L18 9.2V14.2L11 18Z';

export default function BuildingMarker({
  building,
  isSelected,
  onPress,
}: BuildingMarkerProps) {
  const { x, y } = building.position;

  const iconOffX = x - (ICON_W / 2) * ICON_SCALE;
  const iconOffY = y - (ICON_H / 2) * ICON_SCALE;

  const fontSize = building.label.length > 10 ? 32 : 38;
  const pillW = Math.max(220, building.label.length * fontSize * 0.65 + 60);
  const pillX = x - pillW / 2;
  const pillY = y + CIRCLE_R + PILL_GAP;
  const textY = pillY + PILL_H / 2 + fontSize * 0.36;

  return (
    <G onPress={() => onPress(building)}>
      {/* Pill shadow */}
      <Rect
        x={pillX + 2}
        y={pillY + 4}
        width={pillW}
        height={PILL_H}
        rx={PILL_RX}
        fill="rgba(0,0,0,0.12)"
      />
      {/* Pill */}
      <Rect
        x={pillX}
        y={pillY}
        width={pillW}
        height={PILL_H}
        rx={PILL_RX}
        fill="#D6E4F7"
      />
      <SvgText
        x={x}
        y={textY}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="bold"
        fill="#003172"
      >
        {building.label}
      </SvgText>

      {/* Circle shadow */}
      <Circle cx={x} cy={y + 5} r={CIRCLE_R} fill="rgba(0,0,0,0.12)" />
      {/* Circle */}
      <Circle
        cx={x}
        cy={y}
        r={CIRCLE_R}
        fill="#0C2D6B"
        stroke={isSelected ? '#F1C806' : 'white'}
        strokeWidth={isSelected ? 18 : 14}
      />

      {/* Graduation cap */}
      <G transform={`translate(${iconOffX}, ${iconOffY}) scale(${ICON_SCALE})`}>
        <Path d={HAT_PATH} fill="white" />
      </G>
    </G>
  );
}
