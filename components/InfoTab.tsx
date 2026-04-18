import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { MenuRow } from '@/components/MenuRow';

interface InfoTabProps {
  onEditInfo: () => void;
  onPreferences: () => void;
  onHelp: () => void;
  onLogout: () => void;
}

export function InfoTab({
  onEditInfo,
  onPreferences,
  onHelp,
  onLogout,
}: InfoTabProps) {
  return (
    <View>
      <MenuRow
        iconName="create-outline"
        label="Editar información"
        onPress={onEditInfo}
        showDivider
      />
      <MenuRow
        iconName="options-outline"
        label="Preferencias"
        onPress={onPreferences}
        showDivider
      />
      <MenuRow
        iconName="help-circle-outline"
        label="Ayuda y soporte"
        onPress={onHelp}
      />
      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          { opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={onLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.errorContainer,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.interSemiBold,
    color: theme.colors.error,
  },
});
