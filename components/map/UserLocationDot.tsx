import React, { useEffect } from 'react';
import { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { MapPosition } from '@/types/map';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface UserLocationDotProps {
  position: MapPosition;
}

export default function UserLocationDot({ position }: UserLocationDotProps) {
  const pulseRadius = useSharedValue(80);
  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    pulseRadius.value = withRepeat(
      withTiming(200, { duration: 1500 }),
      -1,
      true,
    );
    pulseOpacity.value = withRepeat(
      withTiming(0, { duration: 1500 }),
      -1,
      true,
    );
  }, [pulseRadius, pulseOpacity]);

  const animatedPulseProps = useAnimatedProps(() => ({
    r: pulseRadius.value,
    opacity: pulseOpacity.value,
  }));

  return (
    <>
      <AnimatedCircle
        cx={position.x}
        cy={position.y}
        fill="#4285F4"
        animatedProps={animatedPulseProps}
      />
      <Circle
        cx={position.x}
        cy={position.y}
        r={70}
        fill="#4285F4"
        stroke="#FFFFFF"
        strokeWidth={20}
      />
    </>
  );
}
