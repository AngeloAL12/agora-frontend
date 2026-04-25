import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';

interface ReportCardProps {
  folio: string;
  title: string;
  description: string;
  date: string;
  status: string;
  onPress?: () => void;
}

const statusColors: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  'En proceso': { bg: '#FDEB71', text: '#3E2723', label: 'En proceso' },
  Resuelto: { bg: '#D4EFDF', text: '#145A32', label: 'Resuelto' },
  Rechazado: { bg: '#FADBD8', text: '#78281F', label: 'Rechazado' },
  Pendiente: { bg: '#E5E7E9', text: '#1A1A1A', label: 'Pendiente' },
  PENDING: { bg: '#E5E7E9', text: '#1A1A1A', label: 'Pendiente' },
  IN_PROGRESS: { bg: '#FDEB71', text: '#3E2723', label: 'En proceso' },
  RESOLVED: { bg: '#D4EFDF', text: '#145A32', label: 'Resuelto' },
  REJECTED: { bg: '#FADBD8', text: '#78281F', label: 'Rechazado' },
};

export const ReportCard = ({
  folio,
  title,
  description,
  date,
  status,
  onPress,
}: ReportCardProps) => {
  const colors = statusColors[status] || statusColors['PENDING'];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.folio}>FOLIO #{folio}</Text>
        <View style={[styles.badge, { backgroundColor: colors.bg }]}>
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {colors.label}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>

      <View style={styles.footer}>
        <Ionicons name="calendar-clear-outline" size={15} color="#95A5A6" />
        <Text style={styles.date}>{date}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,

    borderWidth: 1,
    borderColor: 'rgba(195, 198, 210, 0.1)',

    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  folio: {
    color: '#1E488F',
    fontWeight: 'bold',
    fontSize: 12,
  },
  badge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E323C',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  description: {
    color: '#566573',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    color: '#95A5A6',
    fontSize: 12,
  },
});
