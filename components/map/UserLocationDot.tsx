import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
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
  scaleX: number;
  scaleY: number;
}

export default function UserLocationDot({
  position,
  scaleX,
  scaleY,
}: UserLocationDotProps) {
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

  const sizeX = 400 * scaleX;
  const sizeY = 400 * scaleY;
  const left = position.x * scaleX - sizeX / 2;
  const top = position.y * scaleY - sizeY / 2;

  return (
    <View
      style={[
        styles.container,
        {
          left,
          top,
          width: sizeX,
          height: sizeY,
        },
      ]}
      pointerEvents="none"
    >
      <Svg viewBox="0 0 400 400" width="100%" height="100%">
        <AnimatedCircle
          cx={200}
          cy={200}
          fill="#4285F4"
          animatedProps={animatedPulseProps}
        />
        <Circle
          cx={200}
          cy={200}
          r={70}
          fill="#4285F4"
          stroke="#FFFFFF"
          strokeWidth={20}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});
