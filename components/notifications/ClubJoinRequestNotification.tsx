import { Image as ExpoImage } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getClubById, resolveJoinRequest } from '@/services/clubService';
import type { NotificationItem } from '@/types/notification';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

interface Props {
  notification: NotificationItem;
  onResolved?: (notifId: number, action: 'ACCEPT' | 'REJECT') => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function ClubJoinRequestNotification({
  notification,
  onResolved,
}: Props) {
  const { token } = useAuth();
  const [clubImage, setClubImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resolved, setResolved] = useState(false);

  const clubId = notification.reference_id;
  const requestId = notification.extra_id;

  useEffect(() => {
    if (!clubId) return;
    getClubById(clubId, token ?? undefined)
      .then((club) => setClubImage(club.profile_image ?? null))
      .catch(() => {});
  }, [clubId, token]);

  const handleAction = async (action: 'ACCEPT' | 'REJECT') => {
    if (!token || !clubId || !requestId || loading || resolved) return;
    setLoading(true);
    try {
      await resolveJoinRequest(clubId, requestId, action, token);
      setResolved(true);
      onResolved?.(notification.id, action);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  // Parse "Nombre quiere unirse a ClubName" from title
  const titleParts = notification.title.match(/^(.+?) quiere unirse a (.+)$/);
  const requesterName = titleParts?.[1] ?? notification.title;
  const clubName = titleParts?.[2] ?? '';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatarWrap}>
          {clubImage ? (
            <ExpoImage
              source={{ uri: clubImage }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>
                {getInitials(clubName || requesterName)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.bodyText} numberOfLines={3}>
            <Text style={styles.requesterName}>{requesterName}</Text>
            <Text> quiere unirse a tu club </Text>
            <Text style={styles.clubName}>"{clubName}".</Text>
          </Text>
          <Text style={styles.timestamp}>
            {formatRelativeTime(notification.created_at)}
          </Text>
        </View>
      </View>

      {!resolved ? (
        <View style={styles.buttonsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.acceptButton,
              pressed && { opacity: 0.85 },
              loading && { opacity: 0.6 },
            ]}
            onPress={() => handleAction('ACCEPT')}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.acceptText}>Aceptar</Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.rejectButton,
              pressed && { opacity: 0.7 },
              loading && { opacity: 0.6 },
            ]}
            onPress={() => handleAction('REJECT')}
            disabled={loading}
          >
            <Text style={styles.rejectText}>Rechazar</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.resolvedLabel}>Solicitud resuelta</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    flexShrink: 0,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 40,
    height: 40,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bluePrimaryLight2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 14,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.bluePrimary,
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray950,
    fontFamily: typography.fontFamily.interRegular,
  },
  requesterName: {
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.blueSecondary,
  },
  clubName: {
    fontFamily: typography.fontFamily.interSemiBold,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.activityGray,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.blueSecondary,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  acceptText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.white,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle30,
  },
  rejectText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray700,
  },
  resolvedLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.activityGray,
    textAlign: 'center',
    paddingVertical: 4,
  },
});
