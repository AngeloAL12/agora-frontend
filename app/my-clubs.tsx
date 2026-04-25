import { ClubCard } from '@/components/ClubCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, typography } from '@/constants/theme';
import { getAllClubs } from '@/services/clubService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export default function MyClubsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollPaddingBottom = insets.bottom + 130;

  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const data = await getAllClubs();
        setClubs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error cargando mis clubes:', error);
        setClubs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.mainContainer}>
      <StatusBar backgroundColor={colors.white} style="dark" />

      <ScreenHeader
        title="Mis clubes"
        align="center"
        variant="white"
        containerStyle={{
          backgroundColor: colors.whiteSoft,
          elevation: 0,
          shadowOpacity: 0,
        }}
        leftAction={
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="arrow-back" size={24} color={colors.blueDark} />
          </Pressable>
        }
      />

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color={colors.bluePrimary} />
            <Text style={styles.loadingText}>Cargando tus clubes...</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: scrollPaddingBottom },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>ACTIVIDAD RECIENTE</Text>
            </View>

            <View style={styles.list}>
              {clubs.map((club) => (
                <ClubCard
                  key={club.id}
                  name={club.name}
                  nextEvent={club.nextEvent}
                  imageSource={
                    club.profile_image ? { uri: club.profile_image } : undefined
                  }
                  onPress={() =>
                    router.push({
                      pathname: '/club/[id]' as any,
                      params: { id: club.id },
                    })
                  }
                />
              ))}

              {clubs.length === 0 && (
                <Text style={styles.emptyText}>
                  Aún no formas parte de ningún club.
                </Text>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.blueDark,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  list: {
    gap: 16,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    marginTop: 24,
  },
});
