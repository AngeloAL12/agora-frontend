import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ClubEventDetailScreen() {
  const { title, date, description } = useLocalSearchParams<{
    title: string;
    date: string;
    description: string;
  }>();

  return (
    <View style={styles.safeArea}>
      <ScreenHeader
        title="Detalles del evento"
        leftAction={
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/clubs' as any);
              }
            }}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </Pressable>
        }
      />

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>NOMBRE</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.date}>⌚ {date}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>DESCRIPCIÓN</Text>
          <Text style={styles.description}>
            {description ||
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at libero nibh. Integer faucibus elementum ligula ac fermentum. Duis ultrices urna ac orci posuere dictum. Pellentesque convallis porttitor odio eget vulputate.'}
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
    backgroundColor: colors.white,
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
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
  date: {
    fontSize: 12,
    color: colors.gray700,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.gray950,
  },
});
