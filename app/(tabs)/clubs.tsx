import { ClubCard } from '@/components/ClubCard';
import { ClubDiscoveryItem } from '@/components/ClubDiscoveryItem';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchInput } from '@/components/SearchInput';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/hooks/useSearch';
import { getAllClubs, joinClub } from '@/services/clubService'; // 👈 Importamos joinClub
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
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

export default function ClubsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { token } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [realClubs, setRealClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 👇 1. Sacamos loadClubs AFUERA del useEffect
  const loadClubs = async () => {
    try {
      const data = await getAllClubs();
      setRealClubs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando clubes:', error);
      setRealClubs([]);
    } finally {
      setLoading(false);
    }
  };

  // 👇 2. El useEffect ahora solo llama a la función cuando entras
  useEffect(() => {
    loadClubs();
  }, []);

  // 3. Función para el botón Amarillo de "Unirse"
  const handleJoin = async (id: number, name: string) => {
    try {
      if (!token) {
        Alert.alert('Espera', 'Cargando tu sesión...');
        return;
      }

      await joinClub(id, token);
      Alert.alert('¡Excelente!', `Te has unido al club: ${name} 🎉`);

      // 👇 4. ¡LA MAGIA! Refrescamos la lista para que la pantalla se actualice sola
      await loadClubs();
    } catch (e: any) {
      const errorText =
        JSON.stringify(e) + (e?.message || '') + (e?.detail || '');

      if (errorText.includes('Ya eres miembro')) {
        Alert.alert('Aviso', '¡Ya formas parte de este club! 😎');
      } else {
        Alert.alert('Ups', 'No pudimos procesar tu solicitud.');
      }
    }
  };

  // Protegemos el slice y el search para que no truene si realClubs es undefined
  const clubsList = Array.isArray(realClubs) ? realClubs : [];
  const filteredDiscoverClubs = useSearch(searchQuery, clubsList, 'name');
  const filteredMyClubs = useSearch(searchQuery, clubsList.slice(0, 2), 'name');

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
