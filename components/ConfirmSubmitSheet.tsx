import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppBottomSheet from '@/components/AppBottomSheet';
import { colors } from '@/constants/theme';

interface ConfirmSubmitSheetProps {
  onConfirm: () => void;
  isLoading: boolean;
  isSuggestion?: boolean;
}

const ConfirmSubmitSheet = forwardRef<
  BottomSheetModal,
  ConfirmSubmitSheetProps
>(({ onConfirm, isLoading, isSuggestion }, ref) => {
  const handlePressConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm();
    if (ref && 'current' in ref && ref.current) {
      ref.current.dismiss();
    }
  };

  const handlePressCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (ref && 'current' in ref && ref.current) {
      ref.current.dismiss();
    }
  };

  return (
    <AppBottomSheet ref={ref} minBottomPadding={24}>
      <View style={styles.sheetContainer}>
        <View style={styles.sheetIconWrap}>
          <Ionicons name="checkmark" size={48} color={colors.bluePrimary} />
        </View>

        <Text style={styles.sheetTitle}>Confirmar Envío</Text>
        <Text style={styles.sheetMessage}>
          {isSuggestion
            ? 'Una vez enviada, no podrás editar esta sugerencia. ¿Seguro que quieres enviarla?'
            : 'Una vez enviado, no podrás editar este reporte. ¿Seguro que quieres enviarlo?'}
        </Text>

        <View style={styles.sheetActions}>
          <Pressable
            style={({ pressed }) => [
              styles.sheetConfirmButton,
              (pressed || isLoading) && { opacity: 0.8 },
            ]}
            onPress={handlePressConfirm}
            disabled={isLoading}
          >
            <Text style={styles.sheetConfirmText}>
              {isLoading ? 'Enviando...' : 'Enviar'}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.sheetCancelButton,
              (pressed || isLoading) && { opacity: 0.6 },
            ]}
            onPress={handlePressCancel}
            disabled={isLoading}
          >
            <Text style={styles.sheetCancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </AppBottomSheet>
  );
});

const styles = StyleSheet.create({
  sheetContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sheetIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
  sheetTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.bluePrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  sheetMessage: {
    fontSize: 16,
    color: colors.gray950,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 290,
    marginBottom: 32,
  },
  sheetActions: {
    width: '100%',
    gap: 12,
  },
  sheetConfirmButton: {
    backgroundColor: colors.bluePrimary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetConfirmText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  sheetCancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCancelText: {
    color: colors.bluePrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});

ConfirmSubmitSheet.displayName = 'ConfirmSubmitSheet';

export default ConfirmSubmitSheet;
