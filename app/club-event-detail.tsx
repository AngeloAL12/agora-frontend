import { HeaderBackButton } from '@/components/HeaderBackButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

const calendarIcon = require('@/assets/icons/Calendario.svg');

export default function ClubEventDetailScreen() {
  const { title, date, description } = useLocalSearchParams<{
    title: string;
    date: string;
    description?: string;
  }>();

  return (
    <View style={styles.safeArea}>
      <ScreenHeader
        title="Detalles del evento"
        variant="primary"
        leftAction={<HeaderBackButton color={colors.white} />}
      />

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>NOMBRE</Text>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.dateRow}>
            <ExpoImage
              source={calendarIcon}
              style={styles.dateIcon}
              contentFit="contain"
            />
            <Text style={styles.date}>{date}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>DESCRIPCIÓN</Text>
          <Text style={styles.description}>
            {description || 'Sin descripción'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bluePrimary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundScreen,
    padding: 16,
  },
  card: {
    backgroundColor: colors.whiteSoft,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gray700,
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.bluePrimary,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  dateIcon: {
    width: 10.5,
    height: 11.67,
    tintColor: colors.gray700,
  },
  date: {
    fontSize: 14,
    color: colors.gray700,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.gray950,
  },
});
