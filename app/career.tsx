import { Button } from '@/components/Button';
import { SearchInput } from '@/components/SearchInput';
import { getCareerIcon } from '@/constants/careers';
import { useSearch } from '@/hooks/useSearch';
import { useCareers } from '@/hooks/useCareers';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { updateMyCareer } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import type { Career } from '@/types/career';

export default function CareerScreen() {
  const router = useRouter();
  const { token, updateUser, logout } = useAuth();
  const { careers, loading, error, refetch } = useCareers();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const filteredCareers = useSearch(searchQuery, careers, 'name');

  const loadingInitialCareers = loading && careers.length === 0;
  const showErrorState =
    !loadingInitialCareers && careers.length === 0 && !!error;

  const handleFinish = async () => {
    if (!selectedId || !token) return;

    const selected = careers.find((c) => c.id === selectedId);
    if (!selected) return;

    setIsSubmitting(true);
    try {
      await updateMyCareer(selected.id, token);
      await updateUser({ id_career: selected.id });
      router.replace('/(tabs)/map');
    } catch {
      Alert.alert(
        'Error',
        'No se pudo guardar tu carrera. Inténtalo de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async () => {
    setIsRefreshing(true);
    await refetch(true);
    setIsRefreshing(false);
  };

  const renderItem = ({ item }: { item: Career }) => {
    const isSelected = selectedId === item.id;
    const icon = getCareerIcon(item.id);
    return (
      <Pressable
        onPress={() => setSelectedId(item.id)}
        style={[styles.careerCard, isSelected && styles.careerCardSelected]}
      >
        <View style={styles.careerContent}>
          <View style={styles.iconBackground}>
            {icon ? (
              <ExpoImage
                source={icon}
                style={styles.careerIcon}
                contentFit="contain"
              />
            ) : (
              <Ionicons
                name="school-outline"
                size={20}
                color={colors.bluePrimary}
              />
            )}
          </View>
          <Text style={styles.careerName}>{item.name}</Text>
        </View>
      </Pressable>
    );
  };

  if (loadingInitialCareers) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={['bottom', 'left', 'right']}
      >
        <StatusBar backgroundColor={colors.backgroundScreen} style="dark" />
        <View style={styles.loadingScreen}>
          <ActivityIndicator color={colors.bluePrimary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar backgroundColor={colors.backgroundScreen} style="dark" />
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 16,
          },
        ]}
      >
        <Pressable
          style={styles.backButton}
          onPress={async () => {
            await logout();
            router.replace('/auth/onboarding');
          }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.gray950} />
        </Pressable>
        <Text style={styles.headerTitle}>Carrera</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content header */}
      <View style={styles.contentHeader}>
        <Text style={styles.label}>¡YA CASI ESTAMOS!</Text>
        <Text style={styles.title}>Selecciona tu{'\n'}Ingeniería</Text>
      </View>

      {showErrorState ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>
            No se pudieron cargar las carreras
          </Text>
          <Text style={styles.errorSubtitle}>
            {error ??
              'Revisa que el backend esté encendido y que el teléfono pueda acceder a la red.'}
          </Text>
          <Button
            text={isRefreshing ? 'Reintentando...' : 'Reintentar'}
            onPress={handleRetry}
            variant="primary"
            size="large"
            fullWidth
            disabled={isRefreshing}
            style={styles.retryButton}
          />
        </View>
      ) : (
        <SearchInput
          placeholder="Buscar carrera..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchContainer}
        />
      )}

      {/* Career list */}
      <FlatList
        data={filteredCareers}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        ListEmptyComponent={
          loading || showErrorState ? null : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                No hay carreras disponibles.
              </Text>
              <Text style={styles.emptySubtitle}>
                Intenta más tarde o revisa la conexión con el backend.
              </Text>
            </View>
          )
        }
      />

      <View style={styles.footer}>
        {isSubmitting ? (
          <View style={styles.loadingButton}>
            <ActivityIndicator color={colors.white} />
          </View>
        ) : (
          <Button
            text="Terminar"
            onPress={handleFinish}
            variant="primary"
            size="large"
            fullWidth
            disabled={selectedId === null}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundScreen,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundScreen,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 16,
    backgroundColor: colors.backgroundScreen,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 9999,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 32,
  },

  contentHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
  },

  label: {
    fontSize: 12,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.bluePrimary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.blueSecondary,
    letterSpacing: -0.5,
    lineHeight: 34,
  },

  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  errorCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
    gap: 10,
  },
  errorTitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
  },
  errorSubtitle: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    lineHeight: 20,
  },
  retryButton: {
    borderRadius: 30,
    backgroundColor: colors.bluePrimary,
  },

  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
  },
  emptyState: {
    paddingHorizontal: 16,
    paddingTop: 28,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    textAlign: 'center',
    lineHeight: 20,
  },

  careerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 1,
  },
  careerCardSelected: {
    borderColor: colors.bluePrimary,
  },
  careerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  careerIcon: {
    width: 22,
    height: 22,
  },
  careerName: {
    flex: 1,
    fontSize: 16,
    fontFamily: typography.fontFamily.interMedium,
    color: colors.gray950,
  },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: colors.backgroundScreen,
  },
  loadingButton: {
    backgroundColor: colors.bluePrimary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
