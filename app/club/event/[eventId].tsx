import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CustomLoadingScreen from '@/components/CustomLoadingScreen';

import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getClubEvents } from '@/services/clubService';
import { ClubEvent } from '@/types/club';

const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]}, ${d.getFullYear()}`;
}

export default function EventDetailScreen() {
  const { eventId, clubId } = useLocalSearchParams<{
    eventId: string;
    clubId: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  const [event, setEvent] = useState<ClubEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!clubId || !token) return;
    try {
      const events = await getClubEvents(Number(clubId), token);
      const found = events.find((e) => e.id === Number(eventId));
      setEvent(found ?? null);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, [clubId, eventId, token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <CustomLoadingScreen message="Cargando evento..." />;
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Evento no encontrado.</Text>
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
        title="Detalles del evento"
        align="center"
        showBackButton
        backButtonColor={colors.white}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Name card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>NOMBRE</Text>
          <Text style={styles.eventTitle}>{event.title}</Text>

          <View style={styles.dateRow}>
            <ExpoImage
              source={require('@/assets/icons/clubs/clock.svg')}
              style={styles.calIcon}
              contentFit="contain"
              tintColor={colors.gray700}
            />
            <Text style={styles.dateText}>{formatDate(event.date)}</Text>
          </View>
        </View>

        {/* Description card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>DESCRIPCIÓN</Text>
          <Text style={styles.description}>
            {event.description ?? 'Sin descripción.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.whiteSoft },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 22,
    gap: 16,
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
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
    gap: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interBold,
    color: colors.activityGray,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  eventTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.blueSecondary,
    lineHeight: 28,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calIcon: {
    width: 11,
    height: 12,
  },
  dateText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    lineHeight: 20,
  },
  description: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray950,
    lineHeight: 26,
  },
});
