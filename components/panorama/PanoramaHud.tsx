import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { colors, typography } from '@/constants/theme';

interface PanoramaHudProps {
  opacity: SharedValue<number>;
  buildingName: string;
  shotLabel: string;
  floorLabel: string;
  canGoUp: boolean;
  canGoDown: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  photosOnFloorCount: number;
  currentPhotoIndex: number;
  onFloorUp: () => void;
  onFloorDown: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelectDot: (index: number) => void;
}

export default function PanoramaHud({
  opacity,
  buildingName,
  shotLabel,
  floorLabel,
  canGoUp,
  canGoDown,
  canGoPrev,
  canGoNext,
  photosOnFloorCount,
  currentPhotoIndex,
  onFloorUp,
  onFloorDown,
  onPrev,
  onNext,
  onSelectDot,
}: PanoramaHudProps) {
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      pointerEvents="box-none"
    >
      {/* Top label */}
      <View style={styles.topBar}>
        <Text style={styles.topLabel} numberOfLines={1}>
          {buildingName} • {shotLabel}
        </Text>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        {/* Floor buttons */}
        <View style={styles.floorRow}>
          <Pressable
            onPress={onFloorUp}
            disabled={!canGoUp}
            style={styles.floorBtn}
          >
            <Ionicons
              name="chevron-up"
              size={20}
              color={canGoUp ? '#fff' : '#555'}
            />
          </Pressable>
          <Text style={styles.floorLabel}>{floorLabel}</Text>
          <Pressable
            onPress={onFloorDown}
            disabled={!canGoDown}
            style={styles.floorBtn}
          >
            <Ionicons
              name="chevron-down"
              size={20}
              color={canGoDown ? '#fff' : '#555'}
            />
          </Pressable>
        </View>

        {/* Navigation arrows + dots */}
        <View style={styles.navRow}>
          <Pressable
            onPress={onPrev}
            disabled={!canGoPrev}
            style={styles.arrowBtn}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={canGoPrev ? '#fff' : '#555'}
            />
          </Pressable>

          <View style={styles.dotsRow}>
            {Array.from({ length: photosOnFloorCount }).map((_, i) => (
              <Pressable key={i} onPress={() => onSelectDot(i)} hitSlop={8}>
                <View
                  style={[
                    styles.dot,
                    i === currentPhotoIndex && styles.dotActive,
                  ]}
                />
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={onNext}
            disabled={!canGoNext}
            style={styles.arrowBtn}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={canGoNext ? '#fff' : '#555'}
            />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    pointerEvents: 'box-none',
  },
  topBar: {
    paddingTop: 60,
    paddingHorizontal: 60,
    alignItems: 'center',
  },
  topLabel: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interBold,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomBar: {
    paddingBottom: 50,
    paddingHorizontal: 20,
    gap: 12,
    alignItems: 'center',
  },
  floorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  floorBtn: {
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  floorLabel: {
    fontSize: 13,
    fontFamily: typography.fontFamily.interRegular,
    color: '#fff',
    minWidth: 90,
    textAlign: 'center',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  arrowBtn: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: colors.bluePrimary,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
