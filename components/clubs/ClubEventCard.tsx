import { colors } from '@/constants/theme';
import { ClubEvent } from '@/types/club';
import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ClubEventCardProps {
  event: ClubEvent;
  onPress?: () => void;
}

const ClubEventCard = ({ event, onPress }: ClubEventCardProps) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.dateBox}>
        <Text style={styles.month}>{event.month}</Text>
        <Text style={styles.day}>{event.day}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.timeRow}>
          <ExpoImage
            source={require('@/assets/icons/reloj.svg')}
            style={styles.timeIcon}
            contentFit="contain"
          />
          <Text style={styles.time}>{event.time}</Text>
        </View>
      </View>

      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

export default ClubEventCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 114,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,

    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },

  dateBox: {
    width: 56,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  month: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.blueSecondary,
    textTransform: 'uppercase',
    lineHeight: 14,
  },

  day: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.blueSecondary,
    lineHeight: 30,
  },

  info: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray950,
    lineHeight: 28,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  timeIcon: {
    width: 12,
    height: 12,
    tintColor: colors.gray700,
    marginRight: 6,
  },

  time: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.gray700,
    lineHeight: 16,
  },

  chevron: {
    fontSize: 24,
    color: colors.borderColor,
    lineHeight: 24,
  },
});
