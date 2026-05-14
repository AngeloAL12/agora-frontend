import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import AppBottomSheet from '@/components/AppBottomSheet';
import { Button } from '@/components/Button';
import { colors, typography } from '@/constants/theme';

interface PrivateClubBottomSheetProps {
  clubName: string;
  onRequest: () => void;
  onCancel?: () => void;
  onDismiss?: () => void;
  loading?: boolean;
}

const PrivateClubBottomSheet = React.forwardRef<
  BottomSheetModal,
  PrivateClubBottomSheetProps
>(({ clubName, onRequest, onCancel, onDismiss, loading }, ref) => {
  return (
    <AppBottomSheet ref={ref} onDismiss={onDismiss} minBottomPadding={24}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed" size={36} color={colors.bluePrimary} />
        </View>

        <Text style={styles.title}>Club privado</Text>
        <Text style={styles.message}>
          <Text style={styles.clubName}>{clubName}</Text>
          {
            ' es un club privado. El líder del club deberá aprobar tu solicitud para que puedas unirte.'
          }
        </Text>

        <View style={styles.actions}>
          <Button
            text="Solicitar acceso"
            onPress={onRequest}
            fullWidth
            size="large"
            disabled={loading}
          />

          <TouchableOpacity
            onPress={onCancel}
            style={styles.cancelButton}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppBottomSheet>
  );
});

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
  title: {
    fontSize: 26,
    lineHeight: 32,
    color: colors.bluePrimary,
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
  clubName: {
    fontFamily: typography.fontFamily.interBold,
    color: colors.blueDark,
  },
  actions: {
    width: '100%',
    marginTop: 32,
    gap: 12,
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

PrivateClubBottomSheet.displayName = 'PrivateClubBottomSheet';

export default PrivateClubBottomSheet;
