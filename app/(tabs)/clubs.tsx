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
import { typography } from '@/constants/theme';

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

  const handleCreateClub = () => {};
  const handleNotifications = () => {};

  const handleViewAll = () => {
    router.push('/(tabs)/my-clubs');
  };

  const renderSearchInput = () => (
    <View style={styles.searchContainer}>
      <Ionicons
        name="search-outline"
        size={20}
        color="#7A7A7A"
        style={styles.searchIcon}
      />
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

  recentSection: { marginBottom: 12 },
  joinedSection: { marginBottom: 10 },
  discoverHeader: { marginBottom: 12 },

  overline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#192A56',
    letterSpacing: 1.2,
    lineHeight: 16,
    textTransform: 'uppercase',
    alignSelf: 'stretch',
    marginBottom: 4,
  },

  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#192A56',
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#191C1E',
    lineHeight: 28,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '700',
    color: '#192A56',
    lineHeight: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    paddingRight: 16,
    paddingBottom: 14,
    paddingLeft: 48,
    position: 'relative',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  searchIcon: {
    position: 'absolute',
    left: 16,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
});
