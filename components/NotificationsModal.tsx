import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  NOTIFICATION_ICON_BG_MAP,
  NOTIFICATION_ICON_MAP,
} from '@/constants/notificationIcons';
import { colors, typography } from '@/constants/theme';
import type { NotificationItem } from '@/types/notification';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

interface NotificationsModalProps {
  visible: boolean;
  onDismiss: () => void;
  notifications: NotificationItem[];
  loading?: boolean;
  onNotificationPress?: (id: number) => void;
}

export function NotificationsModal({
  visible,
  onDismiss,
  notifications,
  loading = false,
  onNotificationPress,
}: NotificationsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.overlay} onPress={onDismiss} />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ width: 32 }} />
          <Text style={styles.title}>Notificaciones</Text>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onDismiss}
          >
            <Text style={styles.closeX}>✕</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.bluePrimary} />
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No tienes notificaciones por ahora
              </Text>
            </View>
          ) : (
            notifications.map((item, index) => {
              const isLast = index === notifications.length - 1;
              return (
                <View key={item.id}>
                  <Pressable
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    onPress={() => onNotificationPress?.(item.id)}
                  >
                    <View style={styles.notifItem}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor:
                              NOTIFICATION_ICON_BG_MAP[item.event_type],
                          },
                        ]}
                      >
                        <ExpoImage
                          source={NOTIFICATION_ICON_MAP[item.event_type]}
                          style={styles.icon}
                          contentFit="contain"
                        />
                        {!item.is_read && <View style={styles.unreadDot} />}
                      </View>
                      <View style={styles.notifContent}>
                        <View style={styles.notifHeader}>
                          <Text style={styles.notifTitle}>{item.title}</Text>
                          <Text style={styles.notifTime}>
                            {formatRelativeTime(item.created_at)}
                          </Text>
                        </View>
                        <Text style={styles.notifBody}>{item.body}</Text>
                      </View>
                    </View>
                  </Pressable>
                  {!isLast && <View style={styles.divider} />}
                </View>
              );
            })
          )}
        </ScrollView>

        <Pressable
          style={({ pressed }) => [
            styles.viewAllButton,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => {
            onDismiss();
            router.push('/notifications');
          }}
        >
          <Text style={styles.viewAllText}>Ver todas</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  container: {
    position: 'absolute',
    top: '15%',
    left: 16,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  title: {
    fontSize: 18,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.bluePrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: {
    fontSize: 13,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  list: {
    maxHeight: 340,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    textAlign: 'center',
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    gap: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 20,
    height: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bluePrimary,
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray900,
    flex: 1,
    marginRight: 8,
  },
  notifTime: {
    fontSize: 11,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
  },
  notifBody: {
    fontSize: 13,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.notifBodyText,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray100,
  },
  viewAllButton: {
    backgroundColor: colors.bluePrimary,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.white,
  },
});
