import { colors, typography } from '@/constants/theme';
import { getClubById } from '@/services/clubService';
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
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const data = await getClubById(id as string);
          setClub(data);
        }
      } catch (error) {
        console.error('Error al obtener detalles del club:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.bluePrimary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Configura el encabezado de la pantalla */}
      <Stack.Screen
        options={{
          title: 'Detalle del Club',
          headerTitleStyle: { fontFamily: typography.fontFamily.manropeBold },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.gray900} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.content}>
        <Text style={styles.clubName}>{club?.name || 'Club sin nombre'}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ID: {id}</Text>
        </View>

        <Text style={styles.sectionTitle}>Sobre el club</Text>
        <Text style={styles.description}>
          {club?.description ||
            'No hay una descripción disponible para este club todavía. ¡Pregunta a los encargados!'}
        </Text>

        {/* Aquí podrías agregar más info que venga de tu backend */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.whiteSoft },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24 },
  clubName: {
    fontSize: 28,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.gray950,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: colors.bluePrimary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  badgeText: {
    color: colors.bluePrimary,
    fontFamily: typography.fontFamily.interSemiBold,
    fontSize: 12,
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
});
