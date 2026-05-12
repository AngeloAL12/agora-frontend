import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import EventCard from '@/components/clubs/EventCard';
import PostCard from '@/components/clubs/PostCard';
import { MOCK_POSTS } from '@/constants/mockPosts';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getClubById, getClubEvents, joinClub } from '@/services/clubService';
import { ClubEvent, ClubResponse } from '@/types/club';

type Tab = 'posts' | 'events';
const JOINED_CLUBS_KEY = 'agora_joined_clubs';

async function getJoinedClubIds(userId?: number): Promise<number[]> {
  if (!userId) return [];

  const raw = await SecureStore.getItemAsync(`${JOINED_CLUBS_KEY}_${userId}`);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is number => typeof item === 'number')
      : [];
  } catch {
    return [];
  }
}

async function saveJoinedClubId(
  userId: number | undefined,
  clubId: number,
): Promise<void> {
  if (!userId) return;

  const currentIds = await getJoinedClubIds(userId);
  if (currentIds.includes(clubId)) return;

  await SecureStore.setItemAsync(
    `${JOINED_CLUBS_KEY}_${userId}`,
    JSON.stringify([...currentIds, clubId]),
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();

  const [club, setClub] = useState<ClubResponse | null>(null);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);

  const isLeader = club && user ? club.id_leader === user.id : false;

  const load = useCallback(async () => {
    if (!id || !token) return;
    try {
      const [clubData, eventsData, joinedClubIds] = await Promise.all([
        getClubById(id),
        getClubEvents(Number(id), token),
        getJoinedClubIds(user?.id),
      ]);
      setClub(clubData);
      setEvents(eventsData);
      setIsMember(
        clubData.id_leader === user?.id || joinedClubIds.includes(clubData.id),
      );
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, [id, token, user?.id]);

  const handleJoinClub = useCallback(async () => {
    if (!club || !token || isMember || joining) return;

    setJoining(true);

    try {
      await joinClub(club.id, token);
      await saveJoinedClubId(user?.id, club.id);
      setIsMember(true);
      setClub((current) =>
        current
          ? { ...current, members_count: current.members_count + 1 }
          : current,
      );
    } catch (error: any) {
      const message = error?.detail || error?.message || '';
      const normalizedMessage = String(message).toLowerCase();

      if (
        normalizedMessage.includes('miembro') ||
        normalizedMessage.includes('member')
      ) {
        await saveJoinedClubId(user?.id, club.id);
        setIsMember(true);
        return;
      }

      Alert.alert('Error', message || 'No se pudo unir al club.');
    } finally {
      setJoining(false);
    }
  }, [club, isMember, joining, token, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.bluePrimary} />
      </View>
    );
  }

  if (!club) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se pudo cargar el club.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenHeader
        variant="primary"
        showBackButton
        backButtonColor={colors.white}
        showNotificationBell
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          {club.cover_image ? (
            <ExpoImage
              source={{ uri: club.cover_image }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.heroPlaceholder]} />
          )}
          <LinearGradient
            colors={['rgba(0,49,114,0)', 'rgba(0,49,114,0.6)']}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Profile section */}
        <View style={styles.profileSection}>
          <View style={styles.profileTop}>
            <View style={styles.avatarWrap}>
              {club.profile_image ? (
                <ExpoImage
                  source={{ uri: club.profile_image }}
                  style={styles.avatarImg}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>
                    {getInitials(club.name)}
                  </Text>
                </View>
              )}
            </View>

            <Pressable
              style={[
                styles.memberBadge,
                (isMember || joining) && styles.memberBadgeDisabled,
              ]}
              onPress={handleJoinClub}
              disabled={isMember || joining}
            >
              <Text style={styles.memberBadgeText}>
                {joining ? 'Uniendo...' : isMember ? 'Miembro' : 'Unirse'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.nameBlock}>
            <Text style={styles.clubName}>{club.name}</Text>
            <Text style={styles.clubDesc}>{club.description}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsBar}>
            <TouchableOpacity
              style={styles.stat}
              onPress={() =>
                router.push({
                  pathname: '/club/members' as never,
                  params: { id: club.id },
                })
              }
              activeOpacity={0.7}
            >
              <Text style={styles.statNumber}>{club.members_count}</Text>
              <Text style={styles.statLabel}>MIEMBROS</Text>
            </TouchableOpacity>

            <View style={styles.stat}>
              <Text style={styles.statNumber}>{MOCK_POSTS.length}</Text>
              <Text style={styles.statLabel}>PUBLICACIONES</Text>
            </View>
          </View>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabsWrap}>
          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
              onPress={() => setActiveTab('posts')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'posts' && styles.tabTextActive,
                ]}
              >
                Publicaciones
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'events' && styles.tabActive]}
              onPress={() => setActiveTab('events')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'events' && styles.tabTextActive,
                ]}
              >
                Eventos
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'posts' ? (
            MOCK_POSTS.map((post) => <PostCard key={post.id} post={post} />)
          ) : events.length === 0 ? (
            <Text style={styles.emptyText}>No hay eventos próximos.</Text>
          ) : (
            events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() =>
                  router.push({
                    pathname: '/club/event/[eventId]' as never,
                    params: { eventId: event.id, clubId: club.id },
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB — solo líder */}
      {isLeader && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 24 }]}
          onPress={() =>
            router.push({
              pathname: '/club/create-event' as never,
              params: { id: club.id },
            })
          }
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={32} color={colors.gray900} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.whiteSoft },
  scroll: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.whiteSoft,
  },
  errorText: {
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    fontSize: 16,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.bluePrimary,
    borderRadius: 8,
  },
  backBtnText: {
    color: colors.white,
    fontFamily: typography.fontFamily.interSemiBold,
    fontSize: 14,
  },

  // Hero
  hero: {
    height: 175,
    backgroundColor: colors.bluePrimary,
    overflow: 'hidden',
  },
  heroPlaceholder: {
    backgroundColor: colors.bluePrimary,
  },

  // Profile section
  profileSection: {
    paddingHorizontal: 16,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: -48,
    marginBottom: 8,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 9999,
    borderWidth: 4,
    borderColor: colors.backgroundScreen,
    overflow: 'hidden',
    backgroundColor: colors.blueSecondary,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 30,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.white,
    lineHeight: 36,
  },
  memberBadge: {
    backgroundColor: colors.yellow,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  memberBadgeDisabled: {
    opacity: 0.9,
  },
  memberBadgeText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
    lineHeight: 20,
  },
  nameBlock: {
    paddingTop: 8,
    gap: 4,
  },
  clubName: {
    fontSize: 24,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.blueDark,
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  clubDesc: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    lineHeight: 22,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 5,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle20,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: 18,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.blueDark,
    lineHeight: 24,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.statsLabel,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Tabs
  tabsWrap: {
    paddingHorizontal: 26,
    paddingTop: 16,
    paddingBottom: 8,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.gray100,
    borderRadius: 16,
    padding: 6,
    gap: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray700,
  },
  tabTextActive: {
    color: colors.blueSecondary,
  },

  // Content
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
    fontSize: 14,
    marginTop: 32,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});
