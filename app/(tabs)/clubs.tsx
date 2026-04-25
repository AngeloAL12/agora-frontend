import { ClubCard } from '@/components/ClubCard';
import { ClubDiscoveryItem } from '@/components/ClubDiscoveryItem';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchInput } from '@/components/SearchInput';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/hooks/useSearch';
import { getAllClubs, getMyClubs, joinClub } from '@/services/clubService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export interface ClubResponse {
  id: number;
  name: string;
  description: string;
  profile_image: string | null;
  cover_image: string | null;
  id_category: number;
  id_leader: number;
  members_count?: number;
  nextEvent?: string;
}

export default function ClubsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [discoverClubs, setDiscoverClubs] = useState<ClubResponse[]>([]);
  const [myClubs, setMyClubs] = useState<ClubResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      if (!token) return;
      const [allClubsData, myClubsData] = await Promise.all([
        getAllClubs().catch(() => []),
        getMyClubs(token).catch((error) => {
          console.warn(
            'getMyClubs dio error (Seguro es el 404 del backend):',
            error,
          );
          return [];
        }),
      ]);

      setDiscoverClubs(Array.isArray(allClubsData) ? allClubsData : []);
      setMyClubs(Array.isArray(myClubsData) ? myClubsData : []);
    } catch (error) {
      console.error('Error general cargando clubes:', error);
      setDiscoverClubs([]);
      setMyClubs([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [token]),
  );

  const handleJoin = async (id: number, name: string) => {
    try {
      if (!token) {
        Alert.alert('Espera', 'Cargando tu sesión...');
        return;
      }

      await joinClub(id, token);
      Alert.alert('¡Excelente!', `Te has unido al club: ${name} 🎉`);
      await loadData();
    } catch (error: unknown) {
      const e = error as { status?: number; detail?: string; message?: string };

      if (e?.status === 400 || e?.detail?.toLowerCase().includes('miembro')) {
        Alert.alert('Aviso', '¡Ya formas parte de este club! 😎');
      } else {
        Alert.alert('Ups', e?.detail || 'No pudimos procesar tu solicitud.');
      }
    }
  };

  const filteredDiscoverClubs = useSearch(searchQuery, discoverClubs, 'name');
  const filteredMyClubs = useSearch(searchQuery, myClubs, 'name');

  const scrollPaddingBottom = insets.bottom + 130;
  const fabBottom = insets.bottom + 96;

  if (loading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={colors.bluePrimary} />
        <Text style={styles.loadingText}>Conectando con Agora...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.mainContainer}>
      <StatusBar backgroundColor={colors.bluePrimary} style="light" />

      <ScreenHeader
        align="left"
        showNotificationBell
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
          {/* ── Mis clubes ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionLabel}>ACTIVIDAD RECIENTE</Text>
                <Text style={styles.sectionTitle}>Mis clubes</Text>
              </View>
              <Pressable
                onPress={() => router.push('/my-clubs' as any)}
                hitSlop={8}
              >
                <Text style={styles.seeAllText}>Ver todos</Text>
              </Pressable>
            </View>

            <View style={styles.cardList}>
              {filteredMyClubs.map((club) => (
                <ClubCard
                  key={club.id}
                  name={club.name}
                  nextEvent={club.nextEvent}
                  imageSource={
                    club.profile_image ? { uri: club.profile_image } : undefined
                  }
                  onPress={() =>
                    router.push({
                      pathname: '/club/[id]' as any,
                      params: { id: club.id },
                    })
                  }
                />
              ))}
              {filteredMyClubs.length === 0 && (
                <Text style={styles.emptyText}>
                  No estás en ningún club aún
                </Text>
              )}
            </View>
          </View>

          {/* ── Descubrir ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderCol}>
              <Text style={styles.sectionLabel}>EXPLORAR NUEVOS CLUBES</Text>
              <Text style={styles.sectionTitle}>Descubrir</Text>
            </View>

            <View style={styles.discoverList}>
              {filteredDiscoverClubs.map((club) => (
                <Pressable
                  key={club.id}
                  onPress={() =>
                    router.push({
                      pathname: '/club/[id]' as any,
                      params: { id: club.id },
                    })
                  }
                >
                  <ClubDiscoveryItem
                    name={club.name}
                    memberCount={club.members_count || 0}
                    imageSource={
                      club.profile_image
                        ? { uri: club.profile_image }
                        : undefined
                    }
                    onJoin={() => handleJoin(club.id, club.name)}
                  />
                </Pressable>
              ))}
              {filteredDiscoverClubs.length === 0 && (
                <Text style={styles.emptyText}>Sin resultados</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>

      <Pressable
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={() => router.push('/create-club' as any)}
      >
        <Ionicons name="add" size={32} color={colors.gray900} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: colors.whiteSoft },
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 24 },
  section: { marginBottom: 16 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionHeaderCol: { marginBottom: 16 },
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
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.blueDark,
  },
  cardList: { gap: 16 },
  discoverList: { gap: 12 },
  emptyText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    textAlign: 'center',
    paddingVertical: 12,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.whiteSoft,
  },
  loadingText: {
    marginTop: 12,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
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
  },
});
