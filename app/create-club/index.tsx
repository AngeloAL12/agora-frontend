import { ScreenHeader } from '@/components/ScreenHeader';
import SegmentedControl from '@/components/SegmentedControl';
import SuccessBottomSheet from '@/components/SuccessBottomSheet';
import { useAuth } from '@/context/AuthContext';
import { CacheService } from '@/services/cacheService';
import { createClub } from '@/services/clubService';
import { recordClubVisit } from '@/services/recentClubsService';
import { Ionicons } from '@expo/vector-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../../constants/theme';

export default function CreateClubFlow() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingLogoUri, setPendingLogoUri] = useState<string | null>(null);
  const progressAnim = useRef(new Animated.Value(50)).current;
  const successSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: step === 1 ? 50 : 100,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const pickImage = async (type: 'logo' | 'cover') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'logo' ? [1, 1] : [12, 4],
      quality: 1,
    });

    if (!result.canceled) {
      if (type === 'logo') setPendingLogoUri(result.assets[0].uri);
      else setCoverUri(result.assets[0].uri);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!name.trim()) {
        Alert.alert('Faltan datos', 'Por favor, escribe el nombre del club.');
        return;
      }
      setStep(2);
    } else {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        if (!token) {
          Alert.alert('Sesión expirada', 'Por favor inicia sesión de nuevo.');
          return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('is_private', isPrivate.toString());

        if (logoUri) {
          formData.append('profile_image', {
            uri: logoUri,
            name: 'photo.jpg',
            type: 'image/jpeg',
          } as unknown as Blob);
        }

        if (coverUri) {
          formData.append('cover_image', {
            uri: coverUri,
            name: 'cover.jpg',
            type: 'image/jpeg',
          } as unknown as Blob);
        }

        const result = await createClub(formData, token);
        if (result?.id) {
          CacheService.clearMyClubs();
          CacheService.clearAllClubs();
          if (user?.id) void recordClubVisit(result.id, user.id);
          successSheetRef.current?.present();
        }
      } catch (error: unknown) {
        console.log('[createClub error]', JSON.stringify(error));
        const e = error as { detail?: string; message?: string };
        Alert.alert(
          'Atención',
          e.detail || e.message || 'No se pudo crear el club',
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else router.replace('/clubs');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScreenHeader
          title="Crear club"
          variant="white"
          containerStyle={{
            elevation: 0,
            borderBottomWidth: 0,
            shadowOpacity: 0,
          }}
          leftAction={
            <Pressable onPress={handleBack} style={{ padding: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#192A56" />
            </Pressable>
          }
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.progressSection}>
            <View style={styles.progressTextRow}>
              <Text style={styles.stepText}>
                {step === 1 ? 'PASO 1: DATOS GENERALES' : 'PASO 2: IDENTIDAD'}
              </Text>
              <Text style={styles.stepCount}>{step} de 2</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>

          {step === 1 ? (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NOMBRE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Taqueros Programadores"
                  placeholderTextColor="#43475180"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>DESCRIPCIÓN</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Cuéntanos de qué trata el club, sus objetivos y actividades..."
                  placeholderTextColor="#43475180"
                  multiline
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>TIPO</Text>
                <SegmentedControl
                  options={['Abierto', 'Cerrado']}
                  selectedIndex={isPrivate ? 1 : 0}
                  onChange={(i) => setIsPrivate(i === 1)}
                  hint="* Los clubes abiertos permiten que cualquier estudiante se una sin previa aprobación."
                />
              </View>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <View style={styles.sectionContainer}>
                <Text style={styles.label}>LOGO</Text>
                <View style={styles.sectionCard}>
                  <View style={styles.logoWrapper}>
                    <View style={[styles.logoCircle, { overflow: 'hidden' }]}>
                      {logoUri && (
                        <Image
                          source={{ uri: logoUri }}
                          style={styles.fullImage}
                        />
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => pickImage('logo')}
                    >
                      <View style={styles.plusCircle}>
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.helperText}>
                    Mínimo recomendado: 400px x 400px.
                  </Text>
                </View>
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.label}>FOTO DE PORTADA</Text>
                {coverUri ? (
                  <TouchableOpacity
                    style={styles.coverPreviewWrapper}
                    onPress={() => pickImage('cover')}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={{ uri: coverUri }}
                      style={styles.coverPreviewImage}
                      resizeMode="cover"
                    />
                    <View style={styles.coverEditOverlay}>
                      <Pressable
                        style={styles.coverDeleteBadge}
                        onPress={(e) => {
                          e.stopPropagation();
                          setCoverUri(null);
                        }}
                        hitSlop={8}
                      >
                        <Ionicons name="close" size={14} color="#fff" />
                      </Pressable>
                      <View style={styles.coverEditBadge}>
                        <Ionicons name="pencil" size={14} color="#fff" />
                      </View>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.sectionCard}>
                    <TouchableOpacity
                      style={[styles.coverWrapper, { overflow: 'hidden' }]}
                      onPress={() => pickImage('cover')}
                    >
                      <Image
                        source={require('../../assets/images/Background.png')}
                        style={styles.coverPlaceholder}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <Text style={styles.selectFileText}>
                      Seleccionar archivo
                    </Text>
                    <Text style={styles.helperText}>
                      Mínimo recomendado: 1200px x 400px.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.mainButton,
              isSubmitting && styles.mainButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={isSubmitting}
          >
            <Text style={styles.mainButtonText}>
              {step === 1
                ? 'Siguiente'
                : isSubmitting
                  ? 'Creando...'
                  : 'Crear Club'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={!!pendingLogoUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingLogoUri(null)}
      >
        <View style={styles.circlePreviewOverlay}>
          <View style={styles.circlePreviewCard}>
            <Text style={styles.circlePreviewTitle}>Vista previa del logo</Text>
            <View style={styles.circlePreviewImageWrapper}>
              {pendingLogoUri && (
                <Image
                  source={{ uri: pendingLogoUri }}
                  style={styles.circlePreviewImage}
                />
              )}
            </View>
            <Text style={styles.circlePreviewHint}>
              Así se verá el logo del club
            </Text>
            <View style={styles.circlePreviewActions}>
              <Pressable
                style={styles.circlePreviewCancel}
                onPress={() => setPendingLogoUri(null)}
              >
                <Text style={styles.circlePreviewCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.circlePreviewConfirm}
                onPress={() => {
                  setLogoUri(pendingLogoUri);
                  setPendingLogoUri(null);
                }}
              >
                <Text style={styles.circlePreviewConfirmText}>Usar foto</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <SuccessBottomSheet
        ref={successSheetRef}
        title="¡Club creado!"
        message="Tu club ha sido creado exitosamente. Ya puedes empezar a invitar miembros."
        primaryLabel="Ver mis clubes"
        secondaryLabel=""
        onPrimaryPress={() => router.replace('/clubs')}
        onDismiss={() => router.replace('/clubs')}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  progressSection: { width: '100%', maxWidth: 358, marginVertical: 20 },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepText: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 12,
    color: '#003172',
    textTransform: 'uppercase',
  },
  stepCount: { fontSize: 13, color: '#666' },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: theme.colors.yellow,
    borderRadius: 3,
  },
  formContainer: { width: '100%', alignItems: 'center' },
  label: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 12,
    color: '#434751',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  inputGroup: { width: '100%', maxWidth: 358, marginBottom: 20 },
  input: {
    width: '100%',
    backgroundColor: '#E0E3E6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    fontSize: 16,
    color: '#1A2138',
  },
  textArea: { height: 120, paddingVertical: 16 },
  sectionContainer: { width: '100%', maxWidth: 358, marginBottom: 20 },
  sectionCard: {
    width: '100%',
    height: 210,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    position: 'relative',
    width: 90,
    height: 90,
    marginBottom: 16,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#ECEEF1',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  coverWrapper: {
    width: '100%',
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholder: { width: '65%', height: '65%' },
  fullImage: { width: '100%', height: '100%' },
  coverPreviewWrapper: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
  },
  coverPreviewImage: {
    width: '100%',
    height: '100%',
  },
  coverEditOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 10,
    gap: 8,
  },
  coverDeleteBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#CC3333CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverEditBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#192A56CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#192A56',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: { position: 'absolute', bottom: -5, right: -5 },
  selectFileText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#192A56',
    marginBottom: 8,
  },
  helperText: { fontSize: 12, color: '#434751' },
  footer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  mainButton: {
    backgroundColor: '#192A56',
    width: '100%',
    maxWidth: 358,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  mainButtonDisabled: {
    opacity: 0.6,
  },
  mainButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  circlePreviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  circlePreviewCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
  },
  circlePreviewTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#192A56',
    marginBottom: 24,
  },
  circlePreviewImageWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  circlePreviewImage: {
    width: '100%',
    height: '100%',
  },
  circlePreviewHint: {
    marginTop: 16,
    fontSize: 13,
    color: '#666',
    marginBottom: 24,
  },
  circlePreviewActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  circlePreviewCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  circlePreviewCancelText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
  circlePreviewConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#192A56',
    alignItems: 'center',
  },
  circlePreviewConfirmText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
  },
});
