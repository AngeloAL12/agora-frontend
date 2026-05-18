import React from 'react';
import { Polyline } from 'react-native-svg';

import type { MapPosition } from '@/types/map';

interface RoutePathProps {
  points: MapPosition[];
}

export default function RoutePath({ points }: RoutePathProps) {
  if (points.length < 2) return null;

  const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <>
      <Polyline
        points={pointsStr}
        fill="none"
        stroke="rgba(0, 0, 0, 0.2)"
        strokeWidth={60}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points={pointsStr}
        fill="none"
        stroke="#F1C806"
        strokeWidth={40}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}
