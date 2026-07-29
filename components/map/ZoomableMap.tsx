import React, { forwardRef, useImperativeHandle } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { MAP_HEIGHT, MAP_WIDTH } from '@/constants/mapData';

const mapSource = require('@/assets/map/map.webp');

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const MAP_ASPECT = MAP_WIDTH / MAP_HEIGHT;

// Map is 1.3× screen height so there is room to pan vertically at scale=1.
export const DISPLAY_H = SCREEN_H * 1.3;
export const DISPLAY_W = DISPLAY_H * MAP_ASPECT;

// Map starts centered on screen (both axes)
const MAP_LEFT = (SCREEN_W - DISPLAY_W) / 2;
const MAP_TOP = (SCREEN_H - DISPLAY_H) / 2;

const MIN_SCALE = 1;
const MAX_SCALE = 5;

// Extra pixels of freedom past the map edge (shows the map background colour).
const PAN_SLACK = 80;

// Maximum translation so the map can overscroll by PAN_SLACK pixels.
// Animated.View is screen-sized; React Native scales around its center.
function limitTx(s: number) {
  'worklet';
  return Math.max(0, (DISPLAY_W * s - SCREEN_W) / 2) + PAN_SLACK;
}
function limitTy(s: number) {
  'worklet';
  return Math.max(0, (DISPLAY_H * s - SCREEN_H) / 2) + PAN_SLACK;
}
function clampPt(x: number, y: number, s: number) {
  'worklet';
  return {
    x: Math.max(-limitTx(s), Math.min(limitTx(s), x)),
    y: Math.max(-limitTy(s), Math.min(limitTy(s), y)),
  };
}

export interface ZoomableMapRef {
  zoomIn: () => void;
  zoomOut: () => void;
  focusOnPoint: (mapX: number, mapY: number, targetScale?: number) => void;
}

interface ZoomableMapProps {
  children?: React.ReactNode;
}

const ZoomableMap = forwardRef<ZoomableMapRef, ZoomableMapProps>(
  ({ children }, ref) => {
    // Live transform values
    const scale = useSharedValue(1);
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);

    // Saved at end of each gesture (starting point for the next)
    const savedScale = useSharedValue(1);
    const savedTx = useSharedValue(0);
    const savedTy = useSharedValue(0);

    // Incremental pinch tracking (previous-frame values)
    const prevEScale = useSharedValue(1);
    const prevFocalX = useSharedValue(0);
    const prevFocalY = useSharedValue(0);

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        const newScale = Math.min(MAX_SCALE, scale.value * 1.5);
        const c = clampPt(tx.value, ty.value, newScale);
        scale.value = withTiming(newScale, { duration: 250 });
        tx.value = withTiming(c.x, { duration: 250 });
        ty.value = withTiming(c.y, { duration: 250 });
        savedScale.value = newScale;
        savedTx.value = c.x;
        savedTy.value = c.y;
      },
      zoomOut: () => {
        const newScale = Math.max(MIN_SCALE, scale.value / 1.5);
        const c = clampPt(tx.value, ty.value, newScale);
        scale.value = withTiming(newScale, { duration: 250 });
        tx.value = withTiming(c.x, { duration: 250 });
        ty.value = withTiming(c.y, { duration: 250 });
        savedScale.value = newScale;
        savedTx.value = c.x;
        savedTy.value = c.y;
      },
      focusOnPoint: (mapX: number, mapY: number, targetScale: number = 2.5) => {
        const newScale = Math.min(
          MAX_SCALE,
          Math.max(targetScale, scale.value),
        );

        const lx = MAP_LEFT + (mapX / MAP_WIDTH) * DISPLAY_W;
        const ly = MAP_TOP + (mapY / MAP_HEIGHT) * DISPLAY_H;

        const rawTx = newScale * (SCREEN_W / 2 - lx);
        const rawTy = newScale * (SCREEN_H / 2 - ly);
        const c = clampPt(rawTx, rawTy, newScale);

        scale.value = withTiming(newScale, { duration: 350 });
        tx.value = withTiming(c.x, { duration: 350 });
        ty.value = withTiming(c.y, { duration: 350 });

        savedScale.value = newScale;
        savedTx.value = c.x;
        savedTy.value = c.y;
      },
    }));

    // ── Pinch: incremental formula so clamped frames apply d=1 (no jitter) ──
    // Each frame we compute only the delta since the last frame, not from start.
    // When scale is clamped, d = newScale/scale = 1 → pure pan, zero oscillation.
    const pinchGesture = Gesture.Pinch()
      .onStart((e) => {
        prevEScale.value = 1;
        prevFocalX.value = e.focalX;
        prevFocalY.value = e.focalY;
      })
      .onUpdate((e) => {
        const eScaleDelta = e.scale / prevEScale.value;
        prevEScale.value = e.scale;

        const rawNewScale = scale.value * eScaleDelta;
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, rawNewScale));

        // Freeze when at boundary: pinch past it OR noise oscillating around 1.0
        const atBoundary =
          rawNewScale <= MIN_SCALE ||
          rawNewScale >= MAX_SCALE ||
          (newScale === MIN_SCALE && Math.abs(eScaleDelta - 1) < 0.01) ||
          (newScale === MAX_SCALE && Math.abs(eScaleDelta - 1) < 0.01);
        if (atBoundary) {
          prevFocalX.value = e.focalX;
          prevFocalY.value = e.focalY;
          scale.value = newScale;
          return;
        }

        const d = newScale / scale.value;

        const cfx = e.focalX - SCREEN_W / 2;
        const cfy = e.focalY - SCREEN_H / 2;
        const pfx = prevFocalX.value - SCREEN_W / 2;
        const pfy = prevFocalY.value - SCREEN_H / 2;

        prevFocalX.value = e.focalX;
        prevFocalY.value = e.focalY;

        const c = clampPt(
          cfx + d * (tx.value - pfx),
          cfy + d * (ty.value - pfy),
          newScale,
        );
        scale.value = newScale;
        tx.value = c.x;
        ty.value = c.y;
      })
      .onEnd(() => {
        savedScale.value = scale.value;
        savedTx.value = tx.value;
        savedTy.value = ty.value;
      });

    // ── Pan: 1-finger only so it never conflicts with pinch ──
    const panGesture = Gesture.Pan()
      .minPointers(1)
      .maxPointers(1)
      .minDistance(10)
      .onUpdate((e) => {
        const c = clampPt(
          savedTx.value + e.translationX,
          savedTy.value + e.translationY,
          scale.value,
        );
        tx.value = c.x;
        ty.value = c.y;
      })
      .onEnd(() => {
        savedTx.value = tx.value;
        savedTy.value = ty.value;
      });

    // ── Double-tap: zoom in on tap point, or reset ──
    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd((e) => {
        if (scale.value > 1.5) {
          scale.value = withTiming(1, { duration: 300 });
          tx.value = withTiming(0, { duration: 300 });
          ty.value = withTiming(0, { duration: 300 });
          savedScale.value = 1;
          savedTx.value = 0;
          savedTy.value = 0;
        } else {
          const targetScale = 3;
          const scaleDiff = targetScale / scale.value;
          const cfx = e.x - SCREEN_W / 2;
          const cfy = e.y - SCREEN_H / 2;
          const c = clampPt(
            cfx + scaleDiff * (tx.value - cfx),
            cfy + scaleDiff * (ty.value - cfy),
            targetScale,
          );
          scale.value = withTiming(targetScale, { duration: 300 });
          tx.value = withTiming(c.x, { duration: 300 });
          ty.value = withTiming(c.y, { duration: 300 });
          savedScale.value = targetScale;
          savedTx.value = c.x;
          savedTy.value = c.y;
        }
      });

    const composed = Gesture.Race(pinchGesture, panGesture, doubleTap);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: tx.value },
        { translateY: ty.value },
        { scale: scale.value },
      ],
    }));

    return (
      <View style={styles.screen}>
        <GestureDetector gesture={composed}>
          <Animated.View style={[styles.animatedContainer, animatedStyle]}>
            <View style={styles.mapWrapper}>
              <Image
                source={mapSource}
                style={styles.mapImage}
                resizeMode="stretch"
                resizeMethod="resize"
              />
              {children}
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    );
  },
);

ZoomableMap.displayName = 'ZoomableMap';

export default ZoomableMap;

const styles = StyleSheet.create({
  screen: {
    width: SCREEN_W,
    height: SCREEN_H,
    overflow: 'hidden',
    backgroundColor: '#6990d0',
  },
  animatedContainer: {
    width: SCREEN_W,
    height: SCREEN_H,
  },
  mapWrapper: {
    position: 'absolute',
    left: MAP_LEFT,
    top: MAP_TOP,
    width: DISPLAY_W,
    height: DISPLAY_H,
  },
  mapImage: {
    width: DISPLAY_W,
    height: DISPLAY_H,
  },
});
