import { Button } from '@/components/Button';
import { SearchInput } from '@/components/SearchInput';
import { useSearch } from '@/hooks/useSearch';
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

import { Career, CAREERS } from '@/constants/careers';

export default function CareerScreen() {
  const router = useRouter();
  const { token, updateUser, logout } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();

  const filteredCareers = useSearch(searchQuery, CAREERS, 'name');

  const handleFinish = async () => {
    if (!selectedId || !token) return;

    const selected = CAREERS.find((c) => c.id === selectedId);
    if (!selected) return;

    setIsSubmitting(true);
    try {
      await updateMyCareer(selected.careerId, token);
      await updateUser({ id_career: selected.careerId });
      router.replace('/(tabs)/home');
    } catch {
      Alert.alert(
        'Error',
        'No se pudo guardar tu carrera. Inténtalo de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItem = ({ item }: { item: Career }) => {
    const isSelected = selectedId === item.id;
    return (
      <Pressable
        onPress={() => setSelectedId(item.id)}
        style={[styles.careerCard, isSelected && styles.careerCardSelected]}
      >
        <View style={styles.careerContent}>
          <View style={styles.iconBackground}>
            <ExpoImage
              source={item.icon}
              style={styles.careerIcon}
              contentFit="contain"
            />
          </View>
          <Text style={styles.careerName}>{item.name}</Text>
        </View>
      </Pressable>
    );
  };

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

      {/* Search bar */}
      <SearchInput
        placeholder="Buscar carrera..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        containerStyle={styles.searchContainer}
      />

      {/* Career list */}
      <FlatList
        data={filteredCareers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />

      {/* Footer button */}
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

  // List
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
  },

  // Career card
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

  // Footer
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
