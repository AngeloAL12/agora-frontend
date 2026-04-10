import { colors } from '@/constants/theme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Cada punto tiene el mismo ciclo (1200ms), desplazado 200ms respecto al anterior.
    // El delay inicial fuera del loop garantiza que el escalonado se mantenga indefinidamente.
    const anims = [dot1, dot2, dot3].map((dot, i) => {
      const anim = Animated.sequence([
        Animated.delay(i * 200),
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.delay(600),
          ]),
        ),
      ]);
      anim.start();
      return anim;
    });

    return () => anims.forEach((a) => a.stop());
  }, [dot1, dot2, dot3]);

  const dotAnimatedStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -5],
        }),
      },
    ],
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.bubble}>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, dotAnimatedStyle(dot1)]} />
          <Animated.View style={[styles.dot, dotAnimatedStyle(dot2)]} />
          <Animated.View style={[styles.dot, dotAnimatedStyle(dot3)]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  bubble: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderTopLeftRadius: 0,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 18,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.blueSecondary,
  },
});
