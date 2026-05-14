import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppBottomSheet from '@/components/AppBottomSheet';
import { Button } from '@/components/Button';
import { colors, typography } from '@/constants/theme';

interface SuccessBottomSheetProps {
  onDismiss?: () => void;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
  title?: string;
  message?: string;
  variant?: 'success' | 'error';
}

const DEFAULT_MESSAGE =
  ' Tu reporte ha sido enviado exitosamente al personal académico ';

const SuccessBottomSheet = React.forwardRef<
  BottomSheetModal,
  SuccessBottomSheetProps
>(
  (
    {
      onDismiss,
      onPrimaryPress,
      onSecondaryPress,
      primaryLabel = 'Listo',
      secondaryLabel = 'Ver detalles del reporte',
      title = '¡Bien hecho!',
      message = DEFAULT_MESSAGE,
      variant = 'success',
    },
    ref,
  ) => {
    const isError = variant === 'error';
    return (
      <AppBottomSheet ref={ref} onDismiss={onDismiss} minBottomPadding={24}>
        <View style={styles.contentContainer}>
          <View style={[styles.iconWrap, isError && styles.iconWrapError]}>
            <ExpoImage
              source={
                isError
                  ? require('@/assets/icons/clubs/bad_cancel.svg')
                  : require('@/assets/icons/check.svg')
              }
              style={isError ? styles.iconImageError : styles.iconImage}
              contentFit="contain"
              tintColor={isError ? colors.errorText : undefined}
            />
          </View>

          <Text style={[styles.title, isError && styles.titleError]}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actionsContainer}>
            <Button
              text={primaryLabel}
              onPress={onPrimaryPress ?? (() => {})}
              fullWidth
              size="large"
            />

            {secondaryLabel ? (
              <Pressable
                onPress={onSecondaryPress}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </AppBottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.bluePrimaryLight,
    backgroundColor: colors.white,
    shadowColor: colors.bluePrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 24,
  },
  iconImage: {
    width: 34,
    height: 26,
  },
  iconWrapError: {
    borderColor: colors.errorContainer,
    shadowColor: colors.errorText,
  },
  iconImageError: {
    width: 36,
    height: 36,
  },
  titleError: {
    color: colors.errorText,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    color: colors.bluePrimary,
    fontFamily: typography.fontFamily.manropeExtraBold,
    marginBottom: 12,
  },
  message: {
    paddingHorizontal: 24,
    maxWidth: 290,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 26,
    color: colors.gray950,
    fontFamily: typography.fontFamily.interMedium,
  },
  actionsContainer: {
    width: '100%',
    marginTop: 32,
    gap: 12,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.bluePrimary,
    fontFamily: typography.fontFamily.manropeBold,
  },
});

SuccessBottomSheet.displayName = 'SuccessBottomSheet';

export default SuccessBottomSheet;
