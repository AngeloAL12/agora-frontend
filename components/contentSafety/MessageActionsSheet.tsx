import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppBottomSheet from '@/components/AppBottomSheet';
import { colors, typography } from '@/constants/theme';

interface MessageActionsSheetProps {
  authorName: string;
  onReport: () => void;
  onCancel: () => void;
  onDismiss?: () => void;
}

const MessageActionsSheet = React.forwardRef<
  BottomSheetModal,
  MessageActionsSheetProps
>(({ authorName, onReport, onCancel, onDismiss }, ref) => (
  <AppBottomSheet ref={ref} onDismiss={onDismiss} minBottomPadding={18}>
    <View style={styles.container}>
      <View style={styles.heading}>
        <View style={styles.iconWrap}>
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color={colors.bluePrimary}
          />
        </View>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>Opciones del mensaje</Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            Mensaje enviado por {authorName}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Denunciar mensaje de ${authorName}`}
        onPress={onReport}
        style={({ pressed }) => [
          styles.reportAction,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.reportIcon}>
          <Ionicons name="flag-outline" size={20} color={colors.errorText} />
        </View>
        <View style={styles.actionCopy}>
          <Text style={styles.reportTitle}>Reportar mensaje</Text>
          <Text style={styles.actionDescription}>
            Enviar este mensaje a revisión administrativa.
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={17}
          color={colors.activityGray}
        />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={onCancel}
        style={({ pressed }) => [
          styles.cancelButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.cancelText}>Cancelar</Text>
      </Pressable>
    </View>
  </AppBottomSheet>
));

const styles = StyleSheet.create({
  container: { width: '100%', gap: 14 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
  },
  headingCopy: { flex: 1, gap: 2 },
  title: {
    fontSize: 18,
    color: colors.blueDark,
    fontFamily: typography.fontFamily.manropeBold,
  },
  subtitle: {
    fontSize: 11,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  reportAction: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 16,
    padding: 12,
    gap: 11,
    backgroundColor: colors.white,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorContainer,
  },
  actionCopy: { flex: 1, gap: 2 },
  reportTitle: {
    fontSize: 14,
    color: colors.errorText,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  actionDescription: {
    fontSize: 10,
    lineHeight: 15,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  cancelButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: colors.gray100,
  },
  cancelText: {
    fontSize: 14,
    color: colors.gray900,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  pressed: { opacity: 0.7 },
});

MessageActionsSheet.displayName = 'MessageActionsSheet';

export default MessageActionsSheet;
