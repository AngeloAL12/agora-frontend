import { ClubCard } from '@/components/ClubCard';
import { ClubDiscoveryItem } from '@/components/ClubDiscoveryItem';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchInput } from '@/components/SearchInput';
import { colors, typography } from '@/constants/theme';
import { useSearch } from '@/hooks/useSearch';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { NotificationsModal } from '@/components/NotificationsModal';
import { useNotificationsContext } from '@/context/NotificationsContext';

// Mock basado en el response de GET /clubs
const DISCOVER_CLUBS_MOCK = [
  {
    id: 1,
    name: 'Skibidis',
    profile_image:
      'https://devimages.angelolo.lat/clubs/1/profile/bff7a643-5cc3-4aec-8ec9-53f04b336849.JPG',
    memberCount: 42,
  },
  {
    id: 2,
    name: 'Huerto Universitario',
    profile_image: null,
    memberCount: 15,
  },
  {
    id: 3,
    name: 'Robótica Mexicali',
    profile_image: null,
    memberCount: 88,
  },
  {
    id: 4,
    name: 'Club de programación',
    profile_image: null,
    memberCount: 88,
  },
  {
    id: 5,
    name: 'Club de futbol',
    profile_image: null,
    memberCount: 88,
  },
  {
    id: 6,
    name: 'Club de beisbol',
    profile_image: null,
    memberCount: 88,
  },
];

// Clubs del usuario (máximo 2 en el home, completos en my-clubs)
const MY_CLUBS_MOCK = [
  {
    id: 10,
    name: 'Club de Robótica',
    nextEvent: 'Jueves',
    profile_image: null,
  },
  {
    id: 11,
    name: 'Equipo de Básquetbol',
    profile_image: null,
  },
];

export default function ClubsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const {
    notifications,
    loading: notificationsLoading,
    markRead,
  } = useNotificationsContext();

  const hasMemberships = true;

  const [searchQuery, setSearchQuery] = useState('');

  const filteredMyClubs = useSearch(searchQuery, MY_CLUBS_MOCK, 'name');
  const filteredDiscoverClubs = useSearch(
    searchQuery,
    DISCOVER_CLUBS_MOCK,
    'name',
  );

  const scrollPaddingBottom = insets.bottom + 130;
  const fabBottom = insets.bottom + 96;

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.mainContainer}>
      <StatusBar backgroundColor={colors.bluePrimary} style="light" />

      <ScreenHeader
        align="left"
        showNotificationBell
        onNotificationPress={() => setNotificationsVisible(true)}
        searchInput={
          <SearchInput
            placeholder="Buscar clubes..."
            withShadow={false}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        }
      />

      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: scrollPaddingBottom },
          ]}
        >
          {/* ── Mis clubes (solo si tiene membresías) ── */}
          {hasMemberships && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionLabel}>ACTIVIDAD RECIENTE</Text>
                  <Text style={styles.sectionTitle}>Mis clubes</Text>
                </View>
                <Pressable onPress={() => router.push('/my-clubs')} hitSlop={8}>
                  <Text style={styles.seeAllText}>Ver todos</Text>
                </Pressable>
              </View>

              <View style={styles.cardList}>
                {filteredMyClubs

                  .slice(0, searchQuery ? undefined : 2)
                  .map((club) => (
                    <ClubCard
                      key={club.id}
                      name={club.name}
                      nextEvent={club.nextEvent}
                      imageSource={
                        club.profile_image
                          ? { uri: club.profile_image }
                          : undefined
                      }
                      onPress={() => {}}
                    />
                  ))}
                {filteredMyClubs.length === 0 && (
                  <Text style={styles.emptyText}>Sin resultados</Text>
                )}
              </View>
            </View>
          )}

          {/* ── Descubrir ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderCol}>
              <Text style={styles.sectionLabel}>EXPLORAR NUEVOS CLUBES</Text>
              <Text style={styles.sectionTitle}>Descubrir</Text>
            </View>

            <View style={styles.discoverList}>
              {filteredDiscoverClubs.map((club) => (
                <ClubDiscoveryItem
                  key={club.id}
                  name={club.name}
                  memberCount={club.memberCount}
                  imageSource={
                    club.profile_image ? { uri: club.profile_image } : undefined
                  }
                  onJoin={() => {}}
                />
              ))}
              {filteredDiscoverClubs.length === 0 && (
                <Text style={styles.emptyText}>Sin resultados</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* FAB — mismo patrón que Reportes */}
      <Pressable
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={() => router.push('/create-club')}
      >
        <Ionicons name="add" size={32} color={colors.gray900} />
      </Pressable>
      <NotificationsModal
        visible={notificationsVisible}
        onDismiss={() => setNotificationsVisible(false)}
        notifications={notifications}
        loading={notificationsLoading}
        onNotificationPress={markRead}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionHeaderCol: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.blueDark,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.gray950,
    letterSpacing: -0.6,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.blueDark,
    marginBottom: 4,
  },
  cardList: {
    gap: 16,
  },
  discoverList: {
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    textAlign: 'center',
    paddingVertical: 12,
  },
  fab: {
    position: 'absolute',
    right: 24,
    backgroundColor: colors.yellow,
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});
