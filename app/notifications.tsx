import { ScreenHeader } from '@/components/ScreenHeader';
import ClubJoinRequestNotification from '@/components/notifications/ClubJoinRequestNotification';
import {
  NOTIFICATION_ICON_BG_MAP,
  NOTIFICATION_ICON_MAP,
} from '@/constants/notificationIcons';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useNotificationsContext } from '@/context/NotificationsContext';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationCategory } from '@/types/notification';
import { formatRelativeTime } from '@/utils/formatRelativeTime';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const TABS: { label: string; value: NotificationCategory | 'ALL' }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Reportes', value: 'REPORTS' },
  { label: 'Clubes', value: 'CLUBS' },
];

export default function NotificationsScreen() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<NotificationCategory | 'ALL'>(
    'ALL',
  );

  const category = activeTab === 'ALL' ? undefined : activeTab;
  const { notifications, loading, refetch } = useNotifications(
    token,
    category,
    50,
  );
  const { markRead: markReadContext } = useNotificationsContext();
  const [localRead, setLocalRead] = useState<Set<number>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const handleNotificationPress = useCallback(
    (id: number) => {
      setLocalRead((prev) => new Set(prev).add(id));
      markReadContext(id);
    },
    [markReadContext],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      <ScreenHeader
        title="Notificaciones"
        showBackButton={true}
        backButtonColor={colors.white}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.bluePrimary]}
            tintColor={colors.bluePrimary}
          />
        }
      >
        <View style={[styles.tabsRow, { marginTop: insets.top > 0 ? 16 : 16 }]}>
          {TABS.map((tab) => (
            <Pressable
              key={tab.value}
              style={[styles.tab, activeTab === tab.value && styles.tabActive]}
              onPress={() => setActiveTab(tab.value)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.value && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.bluePrimary} size="large" />
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={40}
              color={colors.gray700}
            />
            <Text style={styles.emptyText}>
              No tienes notificaciones por ahora
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {notifications.map((item, index) => {
              const isLast = index === notifications.length - 1;
              if (item.event_type === 'CLUB_JOIN_REQUEST') {
                return (
                  <View key={item.id} style={styles.clubRequestWrapper}>
                    {index !== 0 && (
                      <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                      </View>
                    )}
                    <ClubJoinRequestNotification
                      notification={item}
                      onResolved={(id) => handleNotificationPress(id)}
                    />
                    {!isLast && (
                      <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                      </View>
                    )}
                  </View>
                );
              }
              return (
                <View key={item.id}>
                  <Pressable
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    onPress={() => handleNotificationPress(item.id)}
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
                        {!item.is_read && !localRead.has(item.id) && (
                          <View style={styles.unreadDot} />
                        )}
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
                  {!isLast && (
                    <View style={styles.dividerContainer}>
                      <View style={styles.divider} />
                    </View>
                  )}
                </View>
              );
            })}
            <View style={styles.endLabelContainer}>
              <Text style={styles.endLabel}>
                FIN DE LAS NOTIFICACIONES RECIENTES
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingLeft: 16,
    paddingRight: 24,
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 0,
  },
  tabActive: {
    backgroundColor: colors.bluePrimary,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  tabText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interSemiBold,
    color: '#566573',
  },
  tabTextActive: {
    color: colors.white,
    fontFamily: typography.fontFamily.interBold,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
  },
  list: {
    backgroundColor: colors.white,
    marginTop: 8,
    marginBottom: 16,
  },
  clubRequestWrapper: {},
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
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
    gap: 4,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: 14,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
    flex: 1,
    marginRight: 8,
  },
  notifTime: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interMedium,
    color: '#747782',
  },
  notifBody: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interRegular,
    color: '#434751',
    lineHeight: 16.5,
  },
  dividerContainer: {
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray100,
  },
  endLabelContainer: {
    alignItems: 'center',
    paddingBottom: 32,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    marginHorizontal: 32,
    marginTop: 16,
  },
  endLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interRegular,
    color: 'rgba(116,119,130,0.6)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
