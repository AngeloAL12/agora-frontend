import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import React, { useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors } from '@/constants/theme';

interface ImageViewerProps {
  visible: boolean;
  images: { id: string | number; url: string }[];
  selectedIndex: number;
  onClose: () => void;
}

const SCREEN_W = Dimensions.get('window').width;
const SCREEN_H = Dimensions.get('window').height;

export default function ImageViewer({
  visible,
  images,
  selectedIndex,
  onClose,
}: ImageViewerProps) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(e.scale, 4));
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value > 1) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const combined = Gesture.Simultaneous(pinchGesture, panGesture);

  const handleClose = () => {
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <GestureDetector gesture={combined}>
        <View style={styles.container}>
          <Pressable style={styles.backdrop} onPress={handleClose} />
          <View style={styles.content}>
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={28} color={colors.white} />
            </Pressable>
            {images[selectedIndex] && (
              <Animated.View style={imageAnimatedStyle}>
                <ExpoImage
                  source={{ uri: images[selectedIndex].url }}
                  style={styles.image}
                  contentFit="contain"
                />
              </Animated.View>
            )}
          </View>
        </View>
      </GestureDetector>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  image: {
    width: SCREEN_W,
    height: SCREEN_H * 0.8,
  },
});
