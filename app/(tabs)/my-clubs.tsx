import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MyClubCard } from '@/components/clubs/MyClubCard';
import { COLORS } from '@/constants/colors';
import { useClubs } from '@/context/ClubsContext';

export default function MyClubsScreen() {
  const { myClubs } = useClubs();

  const handleBack = () => {
    router.push('/(tabs)/clubs');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          </Pressable>

          <Text style={styles.headerTitle} pointerEvents="none">
            Mis clubes
          </Text>
        </View>

        <FlatList
          data={myClubs}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <MyClubCard
              club={item}
              onPressCard={() => {}}
              onPressArrow={() => {}}
            />
          )}
          ListHeaderComponent={
            <View style={styles.sectionHeader}>
              <Text style={styles.overline}>ACTIVIDAD RECIENTE</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                Aún no perteneces a ningún club
              </Text>
              <Text style={styles.emptyText}>
                Cuando te unas a uno aparecerá aquí.
              </Text>
            </View>
          }
        />
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
  header: {
    height: 56,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 12,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 120,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  overline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#233B6E',
    letterSpacing: 0.7,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
