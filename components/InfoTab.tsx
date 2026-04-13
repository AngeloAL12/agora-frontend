import React from 'react';
import { StyleSheet, Switch, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import AyudaIcon from '@/assets/Iconos/ayuda-soporte.svg';
import EditarInfoIcon from '@/assets/Iconos/editar-info.svg';
import NotificationIcon from '@/assets/Iconos/notification.svg';

interface InfoTabProps {
  notificationsOn: boolean;
  onToggleNotifications: (v: boolean) => void;
  onEditInfo: () => void;
  onHelp: () => void;
  onLogout: () => void;
}

export const InfoTab = ({
  notificationsOn,
  onToggleNotifications,
  onEditInfo,
  onHelp,
  onLogout,
}: InfoTabProps) => {
  return (
    <View>
      <Pressable style={styles.menuItem} onPress={onEditInfo}>
        <View style={styles.menuIconBg}>
          <EditarInfoIcon width={20} height={20} fill={theme.palette.primary} />
        </View>
        <Text style={styles.menuLabel}>Editar información</Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.palette.textSecondary}
        />
      </Pressable>

      <View style={styles.separator} />

      <View style={styles.menuItem}>
        <View style={styles.menuIconBg}>
          <NotificationIcon
            width={20}
            height={20}
            fill={theme.palette.primary}
          />
        </View>
        <Text style={styles.menuLabel}>Notificaciones</Text>
        <Switch
          value={notificationsOn}
          onValueChange={onToggleNotifications}
          trackColor={{
            false: theme.colors.gray300,
            true: theme.palette.primary,
          }}
          thumbColor={theme.colors.white}
        />
      </View>

      <View style={styles.separator} />

      <Pressable style={styles.menuItem} onPress={onHelp}>
        <View style={styles.menuIconBg}>
          <AyudaIcon width={20} height={20} fill={theme.palette.primary} />
        </View>
        <Text style={styles.menuLabel}>Ayuda y soporte</Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.palette.textSecondary}
        />
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.logoutBtn,
          { opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={onLogout}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color={theme.palette.error}
        />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.blue100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.interMedium,
    color: theme.palette.textPrimary,
  },
  separator: { height: 1, backgroundColor: theme.palette.divider },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.errorContainer,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.interBold,
    color: theme.palette.error,
  },
});
