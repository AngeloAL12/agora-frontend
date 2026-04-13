import React, { useState, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  Pressable,
  ImageSourcePropType,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { ActivityTab, ActivityItem } from '@/components/ActivityTab';
import { InfoTab } from '@/components/InfoTab';
import { StatBox } from '@/components/StatBox';
import { API_BASE_URL, apiFetchJson } from '@/lib/api';

interface UserProfile {
  name: string;
  career: string;
  avatar: ImageSourcePropType | null;
  stats: { clubs: number; reports: number; likes: number };
}

type BackendActivityItem = {
  id?: string | number;
  type?: unknown;
  club_name?: string;
  location?: string;
  timestamp?: string;
  title?: string;
  subtitle?: string;
};

type BackendUserProfile = {
  full_name?: string;
  career?: string;
  avatar_url?: string | null;
  stats?: {
    clubs_count?: number;
    reports_count?: number;
    likes_count?: number;
    clubs?: number;
    reports?: number;
    likes?: number;
  };
  recent_activities?: BackendActivityItem[];
};

const isActivityType = (value: unknown): value is ActivityItem['type'] =>
  value === 'club' || value === 'comment' || value === 'like';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'info' | 'activity'>('info');
  const [notificationsOn, setNotifications] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleEditInfo = () =>
    Alert.alert('Editar información', 'Navega a la pantalla de edición.');
  const handleHelp = () => Alert.alert('Ayuda y soporte', 'Abriendo soporte…');
  const handleLogout = () =>
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => router.replace('/'),
      },
    ]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setLoadError(null);

      const data = await apiFetchJson<BackendUserProfile>('/users/me');

      setUser({
        name: data.full_name ?? 'Usuario',
        career: data.career ?? 'Estudiante',
        avatar: data.avatar_url ? { uri: data.avatar_url } : null,
        stats: {
          clubs: data.stats?.clubs_count ?? data.stats?.clubs ?? 0,
          reports: data.stats?.reports_count ?? data.stats?.reports ?? 0,
          likes: data.stats?.likes_count ?? data.stats?.likes ?? 0,
        },
      });

      const dotColorByType: Record<ActivityItem['type'], string> = {
        club: theme.palette.accent,
        comment: theme.palette.primary,
        like: theme.palette.error,
      };

      const mappedActivities: ActivityItem[] = (
        data.recent_activities ?? []
      ).map((item, index) => {
        const activityType: ActivityItem['type'] = isActivityType(item.type)
          ? item.type
          : 'comment';

        return {
          id: String(item.id ?? `${activityType}-${index}`),
          type: activityType,
          clubName: item.club_name,
          location: item.location,
          timestamp: item.timestamp,
          title: item.title,
          subtitle: item.subtitle,
          dotColor: dotColorByType[activityType],
        };
      });

      setActivities(mappedActivities);
    } catch (error) {
      console.error('Error cargando el perfil:', error);
      setLoadError('No se pudo cargar tu perfil. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.safe, styles.center]}>
        <ActivityIndicator size="large" color={theme.palette.onPrimary} />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={[styles.safe, styles.center, styles.errorContainer]}>
        <Text style={styles.errorTitle}>Ocurrió un error</Text>
        <Text style={styles.errorSubtitle}>{loadError}</Text>
        {__DEV__ && <Text style={styles.errorMeta}>API: {API_BASE_URL}</Text>}
        <Pressable style={styles.retryButton} onPress={fetchUserData}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.palette.primary}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            {user.avatar ? (
              <Image source={user.avatar} style={styles.avatarImage} />
            ) : (
              <Ionicons
                name="person-outline"
                size={40}
                color={theme.palette.onPrimary}
              />
            )}
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userCareer}>{user.career}</Text>

          <View style={styles.statsRow}>
            <StatBox label="CLUBES" value={user.stats.clubs} />
            <StatBox label="REPORTES" value={user.stats.reports} />
            <StatBox label="LIKES" value={user.stats.likes} />
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.tab,
              activeTab === 'info' && styles.tabActive,
              { opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => setActiveTab('info')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'info' && styles.tabTextActive,
              ]}
            >
              Información
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.tab,
              activeTab === 'activity' && styles.tabActive,
              { opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => setActiveTab('activity')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'activity' && styles.tabTextActive,
              ]}
            >
              Actividad
            </Text>
          </Pressable>
        </View>

        <View style={styles.contentContainer}>
          {activeTab === 'info' ? (
            <View style={styles.cardInfo}>
              <InfoTab
                notificationsOn={notificationsOn}
                onToggleNotifications={setNotifications}
                onEditInfo={handleEditInfo}
                onHelp={handleHelp}
                onLogout={handleLogout}
              />
            </View>
          ) : (
            <View style={styles.activityContainer}>
              <Text style={styles.activityTitle}>Actividad Reciente</Text>
              <View style={styles.cardActivity}>
                <ActivityTab activities={activities} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.palette.primary },
  scroll: { flex: 1, backgroundColor: theme.palette.background },
  scrollContent: { flexGrow: 1, paddingBottom: 100 },
  header: {
    backgroundColor: theme.palette.primary,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: theme.palette.onPrimary,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: theme.palette.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: { width: '100%', height: '100%' },
  userName: {
    fontSize: 22,
    fontFamily: theme.typography.fontFamily.manropeBold,
    color: theme.palette.onPrimary,
    marginBottom: 4,
  },
  userCareer: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.interRegular,
    color: theme.palette.onPrimary,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.palette.surfaceVariant,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 25,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  tabActive: {
    backgroundColor: theme.palette.surface,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.interSemiBold,
    color: theme.palette.textSecondary,
  },
  tabTextActive: { color: theme.palette.primary },
  contentContainer: { marginTop: 12, flex: 1 },
  cardInfo: {
    marginHorizontal: 20,
    backgroundColor: theme.palette.surface,
    borderRadius: 18,
    padding: 16,
  },
  activityContainer: { flex: 1 },
  activityTitle: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.interBold,
    color: theme.palette.primary,
    marginBottom: 16,
    marginLeft: 20,
  },
  cardActivity: {
    backgroundColor: theme.palette.surface,
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 20,
  },
  center: { justifyContent: 'center', alignItems: 'center' },
  errorContainer: { paddingHorizontal: 24 },
  errorTitle: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily.interBold,
    color: theme.palette.onPrimary,
    textAlign: 'center',
  },
  errorSubtitle: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.interRegular,
    color: theme.palette.onPrimary,
    opacity: 0.85,
    textAlign: 'center',
  },
  errorMeta: {
    marginTop: 10,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.interRegular,
    color: theme.palette.onPrimary,
    opacity: 0.75,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: theme.palette.onPrimary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.interSemiBold,
    color: theme.palette.primary,
  },
});
