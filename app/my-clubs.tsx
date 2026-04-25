import { ClubCard } from '@/components/ClubCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const ALL_MY_CLUBS_MOCK = [
  {
    id: 11,
    name: 'Equipo de Básquetbol',
    nextEvent: 'Mañana',
    profile_image: null,
    created_at: '2026-04-19T23:31:34.510350Z',
  },
  {
    id: 10,
    name: 'Club de Robótica',
    nextEvent: 'Jueves',
    profile_image: null,
    created_at: '2026-04-18T10:00:00.000000Z',
  },
  {
    id: 12,
    name: 'Skibidis',
    nextEvent: undefined,
    profile_image:
      'https://devimages.angelolo.lat/clubs/1/profile/bff7a643-5cc3-4aec-8ec9-53f04b336849.JPG',
    created_at: '2026-04-17T08:00:00.000000Z',
  },
  {
    id: 13,
    name: 'Club de futbol',
    nextEvent: undefined,
    profile_image: null,
    created_at: '2026-04-10T08:00:00.000000Z',
  },
  {
    id: 14,
    name: 'Club de beisbol',
    nextEvent: undefined,
    profile_image: null,
    created_at: '2026-03-01T08:00:00.000000Z',
  },
];

export default function MyClubsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollPaddingBottom = insets.bottom + 130;

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.mainContainer}>
      <StatusBar backgroundColor={colors.white} style="dark" />

      <ScreenHeader
        title="Mis clubes"
        align="center"
        variant="white"
        containerStyle={{
          backgroundColor: colors.whiteSoft,
          elevation: 0,
          shadowOpacity: 0,
        }}
        leftAction={
          <Pressable
            onPress={() => router.push('/clubs')}
            hitSlop={8}
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="arrow-back" size={24} color={colors.blueDark} />
          </Pressable>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>ACTIVIDAD RECIENTE</Text>
          </View>

          <View style={styles.list}>
            {ALL_MY_CLUBS_MOCK.map((club) => (
              <ClubCard
                key={club.id}
                name={club.name}
                nextEvent={club.nextEvent}
                imageSource={
                  club.profile_image ? { uri: club.profile_image } : undefined
                }
                onPress={() => {}}
              />
            ))}
          </View>
        </ScrollView>
      </View>
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
  sectionHeader: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.blueDark,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  list: {
    gap: 16,
  },
});
