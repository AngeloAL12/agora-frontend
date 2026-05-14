import * as Haptics from 'expo-haptics';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetInternal,
} from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import React, { useCallback, useRef } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';

import { colors } from '@/constants/theme';

const SUPPORTS_BLUR = Platform.OS === 'ios';

interface AppBottomSheetProps {
  children: React.ReactNode;
  onDismiss?: () => void;
  minBottomPadding?: number;
  contentStyle?: ViewStyle;
}

const AppBottomSheet = React.forwardRef<BottomSheetModal, AppBottomSheetProps>(
  ({ children, onDismiss, minBottomPadding = 24, contentStyle }, ref) => {
    const insets = useSafeAreaInsets();

    const InnerContent = () => {
      const { animatedPosition } = useBottomSheetInternal();
      const prevPositionRef = useRef<number | null>(null);
      const hasVibratedRef = useRef(false);

      useAnimatedReaction(
        () => animatedPosition.value,
        (value) => {
          const prev = prevPositionRef.current;
          prevPositionRef.current = value;

          // Primera vez o transición de cerrado a abierto
          if (prev === null || (prev < -300 && value > -100)) {
            if (!hasVibratedRef.current) {
              hasVibratedRef.current = true;
              runOnJS(Haptics.notificationAsync)(
                Haptics.NotificationFeedbackType.Success,
              );
            }
          }

          // Reiniciar flag cuando está completamente cerrado
          if (value < -300) {
            hasVibratedRef.current = false;
          }
        },
      );

      return (
        <BottomSheetView
          style={[
            styles.contentContainer,
            { paddingBottom: Math.max(insets.bottom, minBottomPadding) },
            contentStyle,
          ]}
        >
          {children}
        </BottomSheetView>
      );
    };

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={1}
          pressBehavior="close"
          style={styles.backdropContainer}
        >
          {SUPPORTS_BLUR ? (
            <BlurView
              intensity={8}
              pointerEvents="none"
              style={styles.blurBackdrop}
            />
          ) : (
            <View pointerEvents="none" style={styles.fallbackBackdrop} />
          )}
        </BottomSheetBackdrop>
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        onDismiss={onDismiss}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.indicator}
        style={styles.sheetOuter}
      >
        <InnerContent />
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  backdropContainer: {
    backgroundColor: 'transparent',
  },
  blurBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  fallbackBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  sheetOuter: {
    marginHorizontal: 6,
    elevation: 20,
  },
  sheetBackground: {
    backgroundColor: colors.white,
    borderRadius: 52,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  indicator: {
    backgroundColor: colors.sheetIndicator,
    width: 48,
    height: 6,
    borderRadius: 9999,
  },
  contentContainer: {
    paddingHorizontal: 33,
    alignItems: 'center',
    paddingTop: 32,
  },
});

AppBottomSheet.displayName = 'AppBottomSheet';

export default AppBottomSheet;
