import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, typography } from '@/constants/theme';
import { ClubEvent } from '@/types/club';

const MONTH_ABBR = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
];

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

interface EventCardProps {
  event: ClubEvent;
  onPress?: () => void;
}

export default function EventCard({ event, onPress }: EventCardProps) {
  const date = new Date(event.date);
  const month = MONTH_ABBR[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.dateBox}>
        <Text style={styles.month}>{month}</Text>
        <Text style={styles.day}>{day}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.timeRow}>
          <ExpoImage
            source={require('@/assets/icons/clubs/clock.svg')}
            style={styles.clockIcon}
            contentFit="contain"
          />
          <Text style={styles.time}>{formatTime(event.date)}</Text>
        </View>
      </View>

      <View style={styles.chevronWrap}>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 17,
    gap: 16,
    marginBottom: 16,
  },
  dateBox: {
    width: 64,
    height: 80,
    backgroundColor: colors.eventDateBg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.blueSecondary,
    textTransform: 'uppercase',
  },
  day: {
    fontSize: 24,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.blueSecondary,
    lineHeight: 32,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
    lineHeight: 28,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clockIcon: {
    width: 12,
    height: 12,
  },
  time: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
  },
  chevronWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 20,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
});
