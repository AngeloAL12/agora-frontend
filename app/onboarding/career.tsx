import { Button } from '@/components/Button';
import { SearchInput } from '@/components/SearchInput';
import { getCareerIcon } from '@/constants/careers';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useCareers } from '@/hooks/useCareers';
import { useSearch } from '@/hooks/useSearch';
import { updateMyCareer } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
import type { Career } from '@/types/career';

export default function OnboardingCareerScreen() {
  const { token, updateUser, logout } = useAuth();
  const { careers, loading, error, refetch } = useCareers(token ?? undefined);
  const insets = useSafeAreaInsets();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredCareers = useSearch(searchQuery, careers || [], 'name');
  const loadingInitialCareers = loading && (careers?.length ?? 0) === 0;
  const showErrorState = !loading && (careers?.length ?? 0) === 0 && !!error;

  const handleFinish = async () => {
    if (!selectedId || !token) return;
    const selected = (careers || []).find((c) => c.id === selectedId);
    if (!selected) return;

    setIsSubmitting(true);
    try {
      await updateMyCareer(selected.id, token);
      await updateUser({ id_career: selected.id });
      router.replace('/');
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
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
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
        <Text style={styles.stepIndicator}>2/2</Text>
      </View>

      {/* Title */}
      <View style={styles.contentHeader}>
        <Text style={styles.welcomeLabel}>¡YA CASI ESTAMOS!</Text>
        <Text style={styles.title}>Selecciona tu{'\n'}Ingeniería</Text>
      </View>

      {/* Search o error */}
      {showErrorState ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>
            No se pudieron cargar las carreras
          </Text>
          <Text style={styles.errorSubtitle}>
            {error ?? 'Revisa tu conexión e inténtalo de nuevo.'}
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

      {/* Lista */}
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

      {/* Footer */}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: colors.backgroundScreen,
  },
  backButton: {
    padding: 8,
    borderRadius: 9999,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
  },
  stepIndicator: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray700,
    minWidth: 36,
    textAlign: 'right',
  },
  contentHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  welcomeLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.bluePrimary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.blueSecondary,
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  errorCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray100,
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
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 12,
  },
  emptyState: {
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
    paddingHorizontal: 20,
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
