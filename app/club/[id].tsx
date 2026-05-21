import { Ionicons } from '@expo/vector-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppBottomSheet from '@/components/AppBottomSheet';
import PrivateClubBottomSheet from '@/components/PrivateClubBottomSheet';
import { ScreenHeader } from '@/components/ScreenHeader';
import SuccessBottomSheet from '@/components/SuccessBottomSheet';
import EventCard from '@/components/clubs/EventCard';
import PostCard from '@/components/clubs/PostCard';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import {
  CacheService,
  clubDetailCache,
  clubEventsCache,
  clubPostsCache,
} from '@/services/cacheService';
import {
  getClubById,
  getClubEvents,
  getClubMembers,
  getClubPosts,
  joinClub,
  leaveClub,
} from '@/services/clubService';
import { recordClubVisit } from '@/services/recentClubsService';
import { ClubEvent, ClubPost, ClubResponse } from '@/types/club';

import CustomLoadingScreen from '@/components/CustomLoadingScreen';

type Tab = 'posts' | 'events';

const PAGE_SIZE = 20;

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
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [isMember, setIsMember] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);

  const isFetchingMore = useRef(false);
  const leaveSheetRef = useRef<BottomSheetModal>(null);
  const privateClubSheetRef = useRef<BottomSheetModal>(null);
  const requestSentSheetRef = useRef<BottomSheetModal>(null);
  const errorSheetRef = useRef<BottomSheetModal>(null);

  const isLeader = club && user ? club.id_leader === user.id : false;

  const load = useCallback(
    async (forceRefresh = false) => {
      if (!id || !token) return;
      const key = String(id);

      if (
        !forceRefresh &&
        clubDetailCache[key] &&
        clubPostsCache[key] &&
        clubEventsCache[key]
      ) {
        const cachedPosts = clubPostsCache[key];
        setClub(clubDetailCache[key]);
        setPosts(cachedPosts);
        setEvents(clubEventsCache[key]);
        setHasMorePosts(
          cachedPosts.length > 0 && cachedPosts.length % PAGE_SIZE === 0,
        );
        setIsMember(clubDetailCache[key].user_is_member ?? false);
        setLoading(false);
        return;
      }

      try {
        const [clubData, eventsData, postsData, membersData] =
          await Promise.all([
            getClubById(id, token),
            getClubEvents(Number(id), token).catch(() => [] as ClubEvent[]),
            getClubPosts(Number(id), token, 1, PAGE_SIZE).catch(
              () => [] as ClubPost[],
            ),
            getClubMembers(Number(id), token).catch(() => []),
          ]);
        const resolvedIsMember =
          clubData.user_is_member ?? membersData.some((m) => m.id === user?.id);
        clubDetailCache[key] = {
          ...clubData,
          user_is_member: resolvedIsMember,
        };
        clubEventsCache[key] = eventsData;
        clubPostsCache[key] = postsData;
        setClub(clubData);
        setEvents(eventsData);
        setPosts(postsData);
        setPostsPage(1);
        setHasMorePosts(postsData.length === PAGE_SIZE);
        setIsMember(resolvedIsMember);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    },
    [id, token, user],
  );

  const fetchNextPage = useCallback(async () => {
    if (!id || !token || isFetchingMore.current || loadingMore || !hasMorePosts)
      return;

    isFetchingMore.current = true;
    setLoadingMore(true);

    try {
      const nextPage = postsPage + 1;
      const newPosts = await getClubPosts(
        Number(id),
        token,
        nextPage,
        PAGE_SIZE,
      );
      if (newPosts.length > 0) {
        const key = String(id);
        const updated = [...posts, ...newPosts];
        clubPostsCache[key] = updated;
        setPosts(updated);
        setPostsPage(nextPage);
        setHasMorePosts(newPosts.length === PAGE_SIZE);
      } else {
        setHasMorePosts(false);
      }
    } catch {
      // silently ignore
    } finally {
      setLoadingMore(false);
      isFetchingMore.current = false;
    }
  }, [id, token, loadingMore, hasMorePosts, postsPage, posts]);

  useEffect(() => {
    load();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [load]);

  useEffect(() => {
    if (id && user?.id) {
      void recordClubVisit(Number(id), user.id);
    }
  }, [id, user?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }

  const handleJoinConfirm = useCallback(async () => {
    if (!club || !token || membershipLoading) return;
    privateClubSheetRef.current?.dismiss();
    setMembershipLoading(true);
    try {
      const result = await joinClub(club.id, token);
      if (result.request_id) {
        requestSentSheetRef.current?.present();
      } else {
        setIsMember(true);
        setClub((prev) =>
          prev ? { ...prev, members_count: prev.members_count + 1 } : prev,
        );
      }
    } catch {
      errorSheetRef.current?.present();
    } finally {
      setMembershipLoading(false);
    }
  }, [club, token, membershipLoading]);

  const handleJoin = useCallback(() => {
    if (!club || membershipLoading) return;
    if (club.is_private) {
      privateClubSheetRef.current?.present();
    } else {
      void handleJoinConfirm();
    }
  }, [club, membershipLoading, handleJoinConfirm]);

  const handleLeave = useCallback(async () => {
    if (!club || !token || !user || membershipLoading) return;
    leaveSheetRef.current?.dismiss();
    setIsMember(false);
    setClub((prev) =>
      prev
        ? { ...prev, members_count: Math.max(0, prev.members_count - 1) }
        : prev,
    );
    setMembershipLoading(true);
    try {
      await leaveClub(club.id, token);
      CacheService.clearMyClubs();
    } catch {
      setIsMember(true);
      setClub((prev) =>
        prev ? { ...prev, members_count: prev.members_count + 1 } : prev,
      );
      errorSheetRef.current?.present();
    } finally {
      setMembershipLoading(false);
    }
  }, [club, token, user, membershipLoading]);

  const listData = useMemo<(ClubPost | ClubEvent)[]>(
    () => (activeTab === 'posts' ? posts : events),
    [activeTab, posts, events],
  );

  const renderItem = useCallback(
    ({ item }: { item: ClubPost | ClubEvent }) => {
      if ('user_has_liked' in item) {
        return (
          <PostCard
            post={item as ClubPost}
            clubId={Number(id)}
            token={token ?? ''}
          />
        );
      }
      const event = item as ClubEvent;
      return (
        <EventCard
          event={event}
          onPress={() =>
            router.push({
              pathname: '/club/event/[eventId]' as never,
              params: { eventId: event.id, clubId: club?.id },
            })
          }
        />
      );
    },
    [id, token, router, club?.id],
  );

  const ListHeader = useMemo(() => {
    function Header() {
      if (!club) return null;
      return (
        <>
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

              {isLeader ? (
                <View style={styles.memberBadge}>
                  <Text style={styles.memberBadgeText}>Administrador</Text>
                </View>
              ) : isMember ? (
                <TouchableOpacity
                  style={styles.memberBadge}
                  onPress={() => leaveSheetRef.current?.present()}
                  activeOpacity={0.75}
                  disabled={membershipLoading}
                >
                  <Text style={styles.memberBadgeText}>Miembro</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.joinBadge}
                  onPress={handleJoin}
                  activeOpacity={0.75}
                  disabled={membershipLoading}
                >
                  <Text style={styles.joinBadgeText}>Unirse</Text>
                </TouchableOpacity>
              )}
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
                <Text style={styles.statNumber}>{posts.length}</Text>
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
        </>
      );
    }
    return Header;
  }, [
    club,
    posts.length,
    router,
    activeTab,
    isMember,
    isLeader,
    membershipLoading,
    handleJoin,
  ]);

  if (loading) {
    return <CustomLoadingScreen message="Cargando club..." />;
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

      <FlatList
        data={listData}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        initialNumToRender={PAGE_SIZE}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={40}
        windowSize={7}
        removeClippedSubviews
        onEndReached={() => {
          if (activeTab === 'posts' && hasMorePosts) void fetchNextPage();
        }}
        onEndReachedThreshold={0.45}
        ItemSeparatorComponent={() => <View style={styles.cardGap} />}
        ListHeaderComponent={ListHeader()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {activeTab === 'posts'
              ? 'Aún no hay publicaciones.'
              : 'No hay eventos próximos.'}
          </Text>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.bluePrimary} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.bluePrimary]}
            tintColor={colors.bluePrimary}
          />
        }
      />

      {(isMember || isLeader) && (activeTab === 'posts' || isLeader) && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 24 }]}
          onPress={() => {
            if (activeTab === 'posts') {
              router.push({
                pathname: '/club/create-post' as never,
                params: { id: club.id, clubName: club.name },
              });
            } else {
              router.push({
                pathname: '/club/create-event' as never,
                params: { id: club.id },
              });
            }
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={32} color={colors.gray900} />
        </TouchableOpacity>
      )}

      <PrivateClubBottomSheet
        ref={privateClubSheetRef}
        clubName={club.name}
        onRequest={handleJoinConfirm}
        onCancel={() => privateClubSheetRef.current?.dismiss()}
        onDismiss={() => {}}
        loading={membershipLoading}
      />

      <SuccessBottomSheet
        ref={requestSentSheetRef}
        title="Solicitud enviada"
        message="El líder del club revisará tu solicitud. Te notificaremos cuando sea aprobada."
        primaryLabel="Entendido"
        onPrimaryPress={() => requestSentSheetRef.current?.dismiss()}
        secondaryLabel=""
      />

      <SuccessBottomSheet
        ref={errorSheetRef}
        variant="error"
        title="Ups"
        message="No pudimos procesar tu solicitud."
        primaryLabel="Entendido"
        onPrimaryPress={() => errorSheetRef.current?.dismiss()}
        secondaryLabel=""
      />

      <AppBottomSheet ref={leaveSheetRef}>
        <View style={styles.leaveSheetContainer}>
          <View style={styles.leaveSheetIconWrap}>
            <Ionicons
              name="exit-outline"
              size={48}
              color={colors.bluePrimary}
            />
          </View>
          <Text style={styles.leaveSheetTitle}>¿Salir del club?</Text>
          <Text style={styles.leaveSheetMessage}>
            Dejarás de ser miembro y ya no podrás ver el contenido exclusivo ni
            publicar en este club.
          </Text>
          <View style={styles.leaveSheetActions}>
            <TouchableOpacity
              style={styles.leaveConfirmButton}
              onPress={handleLeave}
              activeOpacity={0.8}
            >
              <Text style={styles.leaveConfirmText}>Salir del club</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.leaveCancelButton}
              onPress={() => leaveSheetRef.current?.dismiss()}
              activeOpacity={0.7}
            >
              <Text style={styles.leaveCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.whiteSoft },
  listContent: {
    paddingHorizontal: 16,
  },
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
    marginHorizontal: -16,
    backgroundColor: colors.bluePrimary,
    overflow: 'hidden',
  },
  heroPlaceholder: {
    backgroundColor: colors.bluePrimary,
  },

  // Profile section
  profileSection: {
    marginHorizontal: -16,
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
  memberBadgeText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
    lineHeight: 20,
  },
  joinBadge: {
    backgroundColor: colors.bluePrimary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  joinBadgeText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.white,
    lineHeight: 20,
  },

  // Leave sheet
  leaveSheetContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  leaveSheetIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.bluePrimaryLight,
    backgroundColor: colors.white,
    shadowColor: colors.bluePrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 24,
  },
  leaveSheetTitle: {
    fontSize: 26,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.bluePrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  leaveSheetMessage: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray950,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 290,
    marginBottom: 32,
  },
  leaveSheetActions: {
    width: '100%',
    gap: 12,
  },
  leaveConfirmButton: {
    backgroundColor: colors.bluePrimary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveConfirmText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: typography.fontFamily.manropeBold,
  },
  leaveCancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveCancelText: {
    color: colors.bluePrimary,
    fontSize: 16,
    fontFamily: typography.fontFamily.manropeBold,
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
    marginHorizontal: -16,
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

  cardGap: { height: 8 },
  footerLoader: {
    paddingVertical: 18,
    alignItems: 'center',
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
