import { colors, typography } from '@/constants/theme';
import { getClubById } from '@/services/clubService';
import { ClubResponse } from '@/types/club';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [club, setClub] = useState<ClubResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    getClubById(id as string)
      .then(setClub)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.bluePrimary} />
      </View>
    );
  }

  if (error || !club) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se pudo cargar el club.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: club.name,
          headerTitleStyle: { fontFamily: typography.fontFamily.manropeBold },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.gray900} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.content}>
        <Text style={styles.clubName}>{club.name}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="people-outline" size={16} color={colors.gray700} />
          <Text style={styles.metaText}>{club.members_count} miembros</Text>
        </View>

        <Text style={styles.sectionTitle}>Sobre el club</Text>
        <Text style={styles.description}>
          {club.description || 'No hay descripción disponible para este club.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.whiteSoft },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  content: { padding: 24 },
  clubName: {
    fontSize: 28,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.gray950,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  metaText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray900,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    lineHeight: 24,
  },
  errorText: {
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    fontSize: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.bluePrimary,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontFamily: typography.fontFamily.interSemiBold,
    fontSize: 14,
  },
});
