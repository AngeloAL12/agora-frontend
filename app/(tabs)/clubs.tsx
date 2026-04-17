import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { ClubCard } from '@/components/clubs/ClubCard';
import { ClubsFab } from '@/components/clubs/ClubsFab';
import { MyClubCard } from '@/components/clubs/MyClubCard';
import { COLORS } from '@/constants/colors';
import { useClubs } from '@/context/ClubsContext';
import { Club } from '@/types/club';

export default function ClubsScreen() {
  const [searchText, setSearchText] = useState('');
  const { myClubs, discoverClubs, joinClub, leaveClub } = useClubs();

  const filteredMyClubs = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return myClubs;

    return myClubs.filter((club) => club.title.toLowerCase().includes(query));
  }, [myClubs, searchText]);

  const filteredDiscoverClubs = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return discoverClubs;

    return discoverClubs.filter((club) =>
      club.title.toLowerCase().includes(query),
    );
  }, [discoverClubs, searchText]);

  const handleJoinClub = (club: Club) => {
    joinClub(club);
  };

  const handleClubOptions = (club: Club) => {
    Alert.alert(
      club.title,
      '¿Qué deseas hacer?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir del club',
          style: 'destructive',
          onPress: () => leaveClub(club.id),
        },
      ],
      { cancelable: true },
    );
  };

  const handleOpenJoinedClub = (club: Club) => {
    Alert.alert('Club', `Abrir detalle de ${club.title}`);
  };

  const handleCreateClub = () => {
    Alert.alert('Nuevo club', 'Crear club próximamente');
  };

  const handleNotifications = () => {
    Alert.alert('Notificaciones', 'Pantalla futura');
  };

  // ✅ AQUÍ ESTÁ LA NAVEGACIÓN CORRECTA
  const handleViewAll = () => {
    router.push('/(tabs)/my-clubs');
  };

  const renderSearchInput = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={20} color="#7A7A7A" />
      <TextInput
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Buscar clubes..."
        placeholderTextColor="#7A7A7A"
        style={styles.input}
      />
    </View>
  );

  const hasJoinedClubs = myClubs.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.container}>
        <ScreenHeader
          title=""
          align="left"
          showNotificationBell
          onNotificationPress={handleNotifications}
          searchInput={renderSearchInput()}
        />

        <FlatList
          data={filteredDiscoverClubs}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ClubCard club={item} onJoin={handleJoinClub} />
          )}
          ListHeaderComponent={
            <>
              {hasJoinedClubs && (
                <>
                  <View style={styles.recentSection}>
                    <Text style={styles.overline}>ACTIVIDAD RECIENTE</Text>

                    <View style={styles.row}>
                      <Text style={styles.mainTitle}>Mis clubes</Text>

                      {/* 🔥 TEXTO CLICKABLE (NO BOTÓN) */}
                      <Pressable onPress={handleViewAll}>
                        <Text style={styles.viewAll}>Ver todos</Text>
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.joinedSection}>
                    {filteredMyClubs.slice(0, 2).map((club: Club) => (
                      <MyClubCard
                        key={club.id}
                        club={club}
                        onPressCard={() => {}}
                        onPressArrow={() => {}}
                      />
                    ))}
                  </View>
                </>
              )}

              <View style={styles.discoverHeader}>
                <Text style={styles.overline}>EXPLORAR NUEVOS CLUBES</Text>
                <Text style={styles.sectionTitle}>Descubrir</Text>
              </View>
            </>
          }
        />

        <ClubsFab onPress={handleCreateClub} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 160,
  },
  recentSection: {
    marginBottom: 12,
  },
  joinedSection: {
    marginBottom: 10,
  },
  discoverHeader: {
    marginBottom: 12,
  },
  overline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#192A56',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '700',
    color: '#233B6E',
  },
  searchContainer: {
    height: 40,
    backgroundColor: '#F1F3F5',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 0,
  },
});
