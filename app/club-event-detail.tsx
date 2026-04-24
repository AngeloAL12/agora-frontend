import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Platform,
} from 'react-native';

const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

export default function ClubEventDetailScreen() {
  const { title, date, description } = useLocalSearchParams<{
    title: string;
    date: string;
    description: string;
  }>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E488F" />

      {/* 🔵 HEADER */}
      <View style={styles.header}>
        {/* 🔙 BACK */}
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => router.back()}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            source={require('@/assets/icons/regreso.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        {/* 🧠 TITLE */}
        <Text style={styles.headerTitle}>Detalles del evento</Text>

        {/* 👻 ESPACIADOR */}
        <View style={styles.headerIcon} />
      </View>

      {/* 📦 CONTENIDO */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E488F',
  },

  header: {
    height: 50 + STATUS_BAR_HEIGHT,
    paddingTop: STATUS_BAR_HEIGHT,
    backgroundColor: '#1E488F',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 24,
  },

  headerIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
    padding: 16,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A9099',
    letterSpacing: 1,
    marginBottom: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003172',
    marginBottom: 8,
  },

  date: {
    fontSize: 12,
    color: '#434751',
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#191C1E',
  },
});
