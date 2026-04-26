import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import type {
  NotificationCategory,
  NotificationEventType,
} from '@/types/notification';

const ICON_MAP: Record<NotificationEventType, string> = {
  COMPLAINT_SUBMITTED: require('@/assets/notifications/sent.svg') as string,
  COMPLAINT_IN_PROGRESS:
    require('@/assets/notifications/updatedreport.svg') as string,
  COMPLAINT_RESOLVED: require('@/assets/notifications/resolved.svg') as string,
  COMPLAINT_REJECTED: require('@/assets/notifications/refused.svg') as string,
};

const ICON_BG_MAP: Record<NotificationEventType, string> = {
  COMPLAINT_SUBMITTED: '#EAF7EF',
  COMPLAINT_IN_PROGRESS: '#DBEAFE',
  COMPLAINT_RESOLVED: '#D4EFDF',
  COMPLAINT_REJECTED: '#FADBD8',
};

const ICON_TINT_MAP: Record<NotificationEventType, string> = {
  COMPLAINT_SUBMITTED: colors.reportResolvedText,
  COMPLAINT_IN_PROGRESS: colors.bluePrimary,
  COMPLAINT_RESOLVED: colors.reportResolvedText,
  COMPLAINT_REJECTED: colors.reportRejectedText,
};

const formatRelativeTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  if (diffMinutes < 1) return 'Justo ahora';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return 'Ayer';
  return `${diffDays} días atrás`;
};

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
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
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

      {/* Content */}
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
              return (
                <View key={item.id}>
                  <View style={styles.notifItem}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: ICON_BG_MAP[item.event_type] },
                      ]}
                    >
                      <ExpoImage
                        source={ICON_MAP[item.event_type]}
                        style={styles.icon}
                        contentFit="contain"
                      />
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
                  {!isLast && <View style={styles.divider} />}
                </View>
              );
            })}
            <Text style={styles.endLabel}>
              FIN DE LAS NOTIFICACIONES RECIENTES
            </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: colors.bluePrimary,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.white,
  },
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.white,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  tabActive: {
    backgroundColor: colors.bluePrimary,
    shadowOpacity: 0,
    elevation: 0,
  },
  tabText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray700,
  },
  tabTextActive: {
    color: colors.white,
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
    marginHorizontal: 0,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 0,
    paddingHorizontal: 16,
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    gap: 14,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 22,
    height: 22,
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
    color: '#566573',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray100,
  },
  endLabel: {
    textAlign: 'center',
    fontSize: 11,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray700,
    letterSpacing: 0.5,
    paddingVertical: 20,
  },
});
