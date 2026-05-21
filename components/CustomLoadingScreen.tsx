import { colors, typography } from '@/constants/theme';
import { Image as ExpoImage } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const loadingFrames = [
  require('@/assets/icons/loading-screen/f01.svg'),
  require('@/assets/icons/loading-screen/f02.svg'),
  require('@/assets/icons/loading-screen/f03.svg'),
  require('@/assets/icons/loading-screen/f04.svg'),
  require('@/assets/icons/loading-screen/f05.svg'),
  require('@/assets/icons/loading-screen/f06.svg'),
  require('@/assets/icons/loading-screen/f07.svg'),
  require('@/assets/icons/loading-screen/f08.svg'),
  require('@/assets/icons/loading-screen/f09.svg'),
  require('@/assets/icons/loading-screen/f10.svg'),
  require('@/assets/icons/loading-screen/f11.svg'),
  require('@/assets/icons/loading-screen/f12.svg'),
  require('@/assets/icons/loading-screen/f13.svg'),
  require('@/assets/icons/loading-screen/f14.svg'),
  require('@/assets/icons/loading-screen/f15.svg'),
  require('@/assets/icons/loading-screen/f16.svg'),
  require('@/assets/icons/loading-screen/f17.svg'),
  require('@/assets/icons/loading-screen/f18.svg'),
  require('@/assets/icons/loading-screen/f19.svg'),
  require('@/assets/icons/loading-screen/f20.svg'),
  require('@/assets/icons/loading-screen/f21.svg'),
  require('@/assets/icons/loading-screen/f22.svg'),
  require('@/assets/icons/loading-screen/f23.svg'),
  require('@/assets/icons/loading-screen/f24.svg'),
];

const frameSequence = [
  // 1-19
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  // 2-19
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  // 20-24
  20, 21, 22, 23, 24,
  // 23-24
  23, 24,
  // 23-24
  23, 24,
  // 23
  23,
  // 22-19 (en reversa)
  22, 21, 20, 19,
].map((f) => f - 1);

interface CustomLoadingScreenProps {
  message?: string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
}

export default function CustomLoadingScreen({
  message,
  subtitle,
  backgroundColor,
  textColor,
}: CustomLoadingScreenProps) {
  const [sequenceIndex, setSequenceIndex] = useState(0);

  useEffect(() => {
    // 24 FPS (~41.67ms per frame)
    const interval = setInterval(() => {
      setSequenceIndex((prev) => (prev + 1) % frameSequence.length);
    }, 100.0);

    return () => clearInterval(interval);
  }, []);

  const frameIndex = frameSequence[sequenceIndex];

  return (
    <View
      style={[styles.container, backgroundColor ? { backgroundColor } : null]}
    >
      <View style={styles.animationContainer}>
        <ExpoImage
          source={loadingFrames[frameIndex]}
          style={styles.frame}
          contentFit="contain"
          priority="high"
        />
      </View>
      {message ? (
        <Text style={[styles.message, textColor ? { color: textColor } : null]}>
          {message}
        </Text>
      ) : null}
      {subtitle ? (
        <Text
          style={[styles.subtitle, textColor ? { color: textColor } : null]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundScreen,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  animationContainer: {
    width: 200,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: '100%',
    height: '100%',
  },
  message: {
    marginTop: 24,
    fontSize: 20,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    textAlign: 'center',
    lineHeight: 20,
  },
});
