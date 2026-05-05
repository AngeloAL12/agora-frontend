import { CacheService } from '@/services/cacheService';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getMe, UserProfileResponse } from '../../services/authService';
import { useComplaints } from '../../hooks/useComplaints';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

// SVG Icons
const editIcon = require('@/assets/icons/profile/edit.svg');
const preferencesIcon = require('@/assets/icons/profile/preferences.svg');
const helpIcon = require('@/assets/icons/profile/help.svg');
const exitIcon = require('@/assets/icons/profile/exit.svg');
const PROFILE_CACHE_KEY = 'agora_profile_cache';

type TabType = 'info' | 'activity';

type ProfileCache = {
  full_name?: string;
  career?: string;
  email?: string;
  avatar_url?: string | null;
};

type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  color: string;
};

const parseProfileCache = (raw: string | null): ProfileCache | null => {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ProfileCache;
  } catch {
    return null;
  }
};

const formatRelativeDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffMinutes < 1) return 'Hace unos segundos';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const normalizeComplaintStatus = (status: string): string => {
  const normalized = status.trim().toUpperCase();

  if (normalized === 'PENDING') return 'Pendiente';
  if (normalized === 'IN_PROGRESS') return 'En proceso';
  if (normalized === 'RESOLVED') return 'Resuelto';
  if (normalized === 'REJECTED') return 'Rechazado';
  return 'Pendiente';
};

export default function ProfileScreen() {
  const { user, token, refreshToken, setTokens, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const {
    reports: recentComplaints,
    loading: complaintsLoading,
    error: complaintsError,
    refetch: refetchComplaints,
  } = useComplaints();

  const [meData, setMeData] = useState<UserProfileResponse | null>(null);
  const [isLoadingMe, setIsLoadingMe] = useState(false);
  const [cachedProfile, setCachedProfile] = useState<ProfileCache | null>(null);
  const avatarSource =
    meData?.avatar_url ?? meData?.photo ?? cachedProfile?.avatar_url ?? null;
  const resolvedName =
    meData?.full_name ||
    meData?.name ||
    cachedProfile?.full_name ||
    user?.name ||
    'Usuario';
  const resolvedCareer =
    meData?.career || cachedProfile?.career || 'Sin asignar';

  const recentActivity = useMemo<ActivityItem[]>(() => {
    return [...recentComplaints]
      .sort(
        (left, right) =>
          new Date(right.created_at).getTime() -
          new Date(left.created_at).getTime(),
      )
      .slice(0, 3)
      .map((item) => {
        const type = item.type?.toUpperCase?.() ?? 'REPORT';
        const isSuggestion = type === 'SUGGESTION';
        const title = isSuggestion
          ? `Sugerencia enviada: ${item.title}`
          : `Reporte enviado: ${item.title}`;
        const location =
          item.id_building != null
            ? `Edificio ${item.id_building}${
                item.classroom ? `, Aula ${item.classroom}` : ''
              }`
            : 'Sin ubicación';
        const status = normalizeComplaintStatus(item.status);
        const evidenceCount = item.images?.length ?? 0;
        const evidenceText =
          evidenceCount > 0
            ? `${evidenceCount} evidencia${evidenceCount === 1 ? '' : 's'}`
            : 'Sin evidencia adjunta';

        return {
          id: String(item.id),
          title,
          subtitle: `${formatRelativeDate(item.created_at)} • ${location}`,
          meta: `${status} • ${evidenceText}`,
          color: isSuggestion ? colors.blueSecondary : colors.activityYellow,
        };
      });
  }, [recentComplaints]);

  const fetchMe = useCallback(async () => {
    if (!token) return;

    // session-aware cache check
    const cachedMe = CacheService.getMeData(token);
    if (cachedMe !== null) {
      setMeData(cachedMe);
      // Still load cache from SecureStore for consistency
      const cachedRaw = await SecureStore.getItemAsync(PROFILE_CACHE_KEY);
      setCachedProfile(parseProfileCache(cachedRaw));
      return;
    }

    setIsLoadingMe(true);
    try {
      const cachedRaw = await SecureStore.getItemAsync(PROFILE_CACHE_KEY);
      setCachedProfile(parseProfileCache(cachedRaw));
    } catch {
      setCachedProfile(null);
    }

    try {
      const remoteMe = await getMe(token);

      CacheService.setMeData(remoteMe, token);
      setMeData(remoteMe);
    } catch (err) {
      console.log('Error fetching me:', err);
      setMeData(null);
      try {
        const cachedRaw = await SecureStore.getItemAsync(PROFILE_CACHE_KEY);
        setCachedProfile(parseProfileCache(cachedRaw));
      } catch {
        setCachedProfile(null);
      }
    } finally {
      setIsLoadingMe(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchMe();
    }, [fetchMe]),
  );

  const renderInfoTab = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.menuContainer}>
        {/* Botón: Editar Información */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/edit-info')}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.iconBackground}>
              <ExpoImage
                source={editIcon}
                style={styles.menuIcon}
                contentFit="contain"
              />
            </View>
            <Text style={styles.menuItemText}>Editar información</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.gray700} />
        </TouchableOpacity>

        {/* Botón: Preferencias */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/preferences')}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.iconBackground}>
              <ExpoImage
                source={preferencesIcon}
                style={styles.menuIcon}
                contentFit="contain"
              />
            </View>
            <Text style={styles.menuItemText}>Preferencias</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.gray700} />
        </TouchableOpacity>

        {/* Botón: Ayuda y soporte */}
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={styles.iconBackground}>
              <ExpoImage
                source={helpIcon}
                style={styles.menuIcon}
                contentFit="contain"
              />
            </View>
            <Text style={styles.menuItemText}>Ayuda y soporte</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => logout()}>
        <ExpoImage
          source={exitIcon}
          style={styles.logoutIcon}
          contentFit="contain"
        />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );

  const renderActivityTab = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Actividad Reciente</Text>
      <View style={styles.activityCard}>
        {complaintsLoading ? (
          <View style={styles.activityEmptyState}>
            <Text style={styles.activityEmptyText}>Cargando actividad...</Text>
          </View>
        ) : complaintsError ? (
          <View style={styles.activityEmptyState}>
            <Text style={styles.activityEmptyTitle}>
              No pudimos cargar la actividad
            </Text>
            <Text style={styles.activityEmptyText}>{complaintsError}</Text>
            <TouchableOpacity
              style={styles.activityRetryButton}
              onPress={() => void refetchComplaints(true)}
            >
              <Text style={styles.activityRetryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : recentActivity.length === 0 ? (
          <View style={styles.activityEmptyState}>
            <Text style={styles.activityEmptyTitle}>
              Aún no hay actividad reciente
            </Text>
            <Text style={styles.activityEmptyText}>
              Cuando envíes reportes o sugerencias, aparecerán aquí con su
              fecha, ubicación y estado.
            </Text>
          </View>
        ) : (
          recentActivity.map((item, index) => {
            const isLast = index === recentActivity.length - 1;
            return (
              <View
                key={item.id}
                style={isLast ? styles.timelineItemLast : styles.timelineItem}
              >
                <View
                  style={isLast ? styles.timelineLeftLast : styles.timelineLeft}
                >
                  <View
                    style={[
                      styles.timelineDot,
                      { backgroundColor: item.color },
                    ]}
                  />
                  {!isLast ? <View style={styles.timelineLine} /> : null}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>{item.title}</Text>
                  <Text style={styles.timelineDate}>{item.subtitle}</Text>
                  <Text style={styles.timelineMeta}>{item.meta}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Hero Section */}
      <View style={[styles.heroBackground, { paddingTop: insets.top + 8 }]}>
        <View style={styles.heroShadowContainer}>
          <View style={styles.heroContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                {avatarSource ? (
                  <ExpoImage
                    source={avatarSource}
                    style={{ width: 96, height: 96, borderRadius: 48 }}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {meData?.full_name?.charAt(0).toUpperCase() ||
                      meData?.name?.charAt(0).toUpperCase() ||
                      user?.name?.charAt(0).toUpperCase() ||
                      'A'}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text
                style={styles.userName}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {resolvedName}
              </Text>
              <Text style={styles.userCareer}>{resolvedCareer}</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {isLoadingMe ? '-' : (meData?.clubs_count ?? '0')}
                </Text>
                <Text style={styles.statLabel}>CLUBES</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {isLoadingMe ? '-' : (meData?.complaints_count ?? '0')}
                </Text>
                <Text style={styles.statLabel}>REPORTES</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {isLoadingMe ? '-' : (meData?.likes_count ?? '0')}
                </Text>
                <Text style={styles.statLabel}>LIKES</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'info'
                ? styles.tabButtonActive
                : styles.tabButtonInactive,
            ]}
            onPress={() => setActiveTab('info')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'info'
                  ? styles.tabTextActive
                  : styles.tabTextInactive,
              ]}
            >
              Información
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'activity'
                ? styles.tabButtonActive
                : styles.tabButtonInactive,
            ]}
            onPress={() => setActiveTab('activity')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'activity'
                  ? styles.tabTextActive
                  : styles.tabTextInactive,
              ]}
            >
              Actividad
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'info' ? renderInfoTab() : renderActivityTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
  },
  heroBackground: {
    backgroundColor: colors.bluePrimary,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 16,
    paddingBottom: 4,
    alignItems: 'center',
  },
  heroShadowContainer: {
    width: '100%',
    shadowColor: 'rgba(0, 49, 114, 0.1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
    alignItems: 'center',
  },
  heroContent: {
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  avatarText: {
    fontSize: 36,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.bluePrimary,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.white,
    letterSpacing: -0.6,
    marginBottom: 4,
    textAlign: 'center',
  },
  userCareer: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interMedium,
    color: colors.bluePrimaryLight2,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.statsBackground,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.white,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.white,
    opacity: 0.7,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 160, // Aumentado padding para que Cerrar Sesión quede por encima de la navbar
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.gray100,
    borderRadius: 16,
    padding: 6,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.white,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.manropeBold,
  },
  tabTextActive: {
    color: colors.blueSecondary,
  },
  tabTextInactive: {
    color: colors.gray700,
  },
  sectionContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.blueSecondary,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  menuContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: colors.white,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    width: 20,
    height: 20,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray950,
  },
  badgeContainer: {
    width: 48,
    height: 32,
    borderRadius: 34,
    justifyContent: 'center',
  },
  badgeContainerEnabled: {
    backgroundColor: colors.bluePrimary,
  },
  badgeContainerDisabled: {
    backgroundColor: colors.gray100,
  },
  badgeDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeDotEnabled: {
    marginLeft: 22,
  },
  badgeDotDisabled: {
    marginLeft: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorContainer,
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  logoutIcon: {
    width: 18,
    height: 18,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.errorText,
  },
  activityCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineItemLast: {
    flexDirection: 'row',
    minHeight: 40,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 20,
    width: 8,
  },
  timelineLeftLast: {
    alignItems: 'center',
    marginRight: 20,
    width: 8,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    zIndex: 2, // Place above line
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E6E8EB',
    position: 'absolute',
    top: 10,
    bottom: -10,
    zIndex: 1, // Behind dot
    marginLeft: 0, // Since parent width is 8 and content centered
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24, // Space between items
  },
  timelineTitle: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interBold,
    color: colors.gray950,
    marginBottom: 4,
    lineHeight: 20,
  },
  timelineDate: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.activityGray,
  },
  timelineMeta: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray700,
  },
  activityEmptyState: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  activityEmptyTitle: {
    fontSize: 15,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
    textAlign: 'center',
    marginBottom: 6,
  },
  activityEmptyText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    textAlign: 'center',
    lineHeight: 20,
  },
  activityRetryButton: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: colors.bluePrimary,
  },
  activityRetryText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.white,
  },
});
