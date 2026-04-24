import { ClubEvent } from '@/types/club';
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
        <Text style={styles.time}>◷ {event.time}</Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(195,198,210,0.15)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,

    shadowColor: '#003172',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  dateBox: {
    width: 56,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#EEF1F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: {
    fontSize: 10,
    fontWeight: '700',
    color: '#003172',
    textTransform: 'uppercase',
    lineHeight: 14,
  },
  day: {
    fontSize: 24,
    fontWeight: '800',
    color: '#003172',
    lineHeight: 30,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#191C1E',
    lineHeight: 20,
  },
  time: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '400',
    color: '#434751',
    lineHeight: 14,
  },
  chevron: {
    fontSize: 24,
    color: '#B8C1D1',
    lineHeight: 24,
  },
});
