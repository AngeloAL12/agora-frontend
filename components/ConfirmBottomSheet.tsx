import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AppBottomSheet from '@/components/AppBottomSheet';
import { colors, typography } from '@/constants/theme';

interface ConfirmBottomSheetProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onDismiss?: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

const ConfirmBottomSheet = React.forwardRef<
  BottomSheetModal,
  ConfirmBottomSheetProps
>(
  (
    {
      title,
      message,
      confirmLabel = 'Confirmar',
      cancelLabel = 'Cancelar',
      onConfirm,
      onCancel,
      onDismiss,
      isLoading = false,
      errorMessage,
    },
    ref,
  ) => {
    return (
      <AppBottomSheet ref={ref} onDismiss={onDismiss} minBottomPadding={24}>
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <ExpoImage
              source={require('@/assets/icons/clubs/bad_cancel.svg')}
              style={styles.iconImage}
              contentFit="contain"
              tintColor={colors.errorText}
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {errorMessage ? (
            <Text style={styles.errorMessage} accessibilityRole="alert">
              {errorMessage}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              onPress={onConfirm}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityState={{ disabled: isLoading, busy: isLoading }}
              style={({ pressed }) => [
                styles.confirmButton,
                (pressed || isLoading) && { opacity: 0.8 },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.errorText} />
              ) : (
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              )}
            </Pressable>

            <Pressable
              onPress={onCancel}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityState={{ disabled: isLoading }}
              style={({ pressed }) => [
                styles.cancelButton,
                (pressed || isLoading) && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
          </View>
        </View>
      </AppBottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  container: {
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
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 24,
  },
  iconImage: {
    width: 36,
    height: 36,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    color: colors.errorText,
    fontFamily: typography.fontFamily.manropeExtraBold,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    paddingHorizontal: 16,
    maxWidth: 290,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 26,
    color: colors.gray950,
    fontFamily: typography.fontFamily.interMedium,
  },
  errorMessage: {
    marginTop: 16,
    paddingHorizontal: 12,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: colors.errorText,
    fontFamily: typography.fontFamily.interMedium,
  },
  actions: {
    width: '100%',
    marginTop: 32,
    gap: 12,
  },
  confirmButton: {
    backgroundColor: colors.errorContainer,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: 18,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.errorText,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.bluePrimary,
    lineHeight: 24,
  },
});

ConfirmBottomSheet.displayName = 'ConfirmBottomSheet';

export default ConfirmBottomSheet;
