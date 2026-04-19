import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
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
import { useNotificationsPreference } from '../../hooks/useNotificationsPreference';
import { getMe, UserMeResponse } from '../../services/authService';

// SVG Icons
const editIcon = require('@/assets/icons/profile/edit.svg');
const notificationsIcon = require('@/assets/icons/profile/notifications.svg');
const helpIcon = require('@/assets/icons/profile/help.svg');
const exitIcon = require('@/assets/icons/profile/exit.svg');

type TabType = 'info' | 'activity';

export default function ProfileScreen() {
  const { user, token, refreshToken, setTokens, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const { notificationsEnabled, isLoading, setNotificationsEnabled } =
    useNotificationsPreference();

  const [meData, setMeData] = useState<UserMeResponse | null>(null);
  const [isLoadingMe, setIsLoadingMe] = useState(false);

  useEffect(() => {
    if (!token) return;
    setIsLoadingMe(true);
    getMe(token, {
      refreshToken: refreshToken ?? undefined,
      onTokenRefreshed: (newAccess, newRefresh) => {
        setTokens(newAccess, newRefresh).catch(() => {});
      },
      onRefreshFailed: () => {
        logout().catch(() => {});
      },
    })
      .then(setMeData)
      .catch((err) => console.log('Error fetching me:', err))
      .finally(() => setIsLoadingMe(false));
  }, [token]);

  const renderInfoTab = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
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

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setNotificationsEnabled(!notificationsEnabled)}
          disabled={isLoading}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.iconBackground}>
              <ExpoImage
                source={notificationsIcon}
                style={styles.menuIcon}
                contentFit="contain"
              />
            </View>
            <Text style={styles.menuItemText}>Notificaciones</Text>
          </View>
          <View
            style={[
              styles.badgeContainer,
              notificationsEnabled
                ? styles.badgeContainerEnabled
                : styles.badgeContainerDisabled,
            ]}
          >
            <View
              style={[
                styles.badgeDot,
                notificationsEnabled
                  ? styles.badgeDotEnabled
                  : styles.badgeDotDisabled,
              ]}
            />
          </View>
        </TouchableOpacity>

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
        {/* Timeline Item 1 */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View
              style={[
                styles.timelineDot,
                { backgroundColor: colors.activityYellow },
              ]}
            />
            <View style={styles.timelineLine} />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>
              Asistencia al Club de Ajedrez
            </Text>
            <Text style={styles.timelineDate}>Hace 2 horas • Edificio G</Text>
          </View>
        </View>

        {/* Timeline Item 2 */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View
              style={[
                styles.timelineDot,
                { backgroundColor: colors.blueSecondary },
              ]}
            />
            <View style={styles.timelineLine} />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>
              Comentaste en una publicación
            </Text>
            <Text style={styles.timelineDate}>Ayer • 14:30 PM</Text>
          </View>
        </View>

        {/* Timeline Item 3 (Last) */}
        <View style={styles.timelineItemLast}>
          <View style={styles.timelineLeftLast}>
            <View
              style={[
                styles.timelineDot,
                { backgroundColor: colors.activityGray },
              ]}
            />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>
              Diste like a una publicación
            </Text>
            <Text style={styles.timelineDate}>05 Mar 2026</Text>
          </View>
        </View>
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
                {meData?.photo ? (
                  <ExpoImage
                    source={meData.photo}
                    style={{ width: 96, height: 96, borderRadius: 48 }}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {meData?.name?.charAt(0).toUpperCase() ||
                      user?.name?.charAt(0).toUpperCase() ||
                      'A'}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {meData?.name || user?.name || 'Usuario'}
              </Text>
              <Text style={styles.userCareer}>
                {meData?.career || 'Sin asignar'}
              </Text>
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
    maxWidth: 370,
  },
  heroContent: {
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingHorizontal: 32,
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
  },
  userCareer: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interMedium,
    color: colors.bluePrimaryLight2,
    textAlign: 'center',
    paddingHorizontal: 32,
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
    paddingBottom: 160,
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
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E6E8EB',
    position: 'absolute',
    top: 10,
    bottom: -10,
    zIndex: 1,
    marginLeft: 0,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
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
});
