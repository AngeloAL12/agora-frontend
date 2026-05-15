import CirclePreviewModal from '@/components/CirclePreviewModal';
import CircularImagePicker from '@/components/CircularImagePicker';
import CoverImagePicker from '@/components/CoverImagePicker';
import { ScreenHeader } from '@/components/ScreenHeader';
import SegmentedControl from '@/components/SegmentedControl';
import SuccessBottomSheet from '@/components/SuccessBottomSheet';
import { theme } from '@/constants/theme';
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
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const appendImage = (
  fd: FormData,
  field: string,
  asset: ImagePicker.ImagePickerAsset,
  fallbackName: string,
) =>
  fd.append(field, {
    uri: asset.uri,
    name: asset.fileName || fallbackName,
    type: asset.mimeType || 'image/jpeg',
  } as unknown as Blob);

export default function CreateClubFlow() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [logoAsset, setLogoAsset] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [coverAsset, setCoverAsset] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingLogoAsset, setPendingLogoAsset] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const progressAnim = useRef(new Animated.Value(50)).current;
  const successSheetRef = useRef<BottomSheetModal>(null);
  const errorSheetRef = useRef<BottomSheetModal>(null);
  const [errorSheet, setErrorSheet] = useState<{
    title: string;
    message: string;
  }>({ title: '', message: '' });

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: step === 1 ? 50 : 100,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const showError = (title: string, message: string) => {
    setErrorSheet({ title, message });
    errorSheetRef.current?.present();
  };

  const goToClubs = () => router.replace('/clubs');

  const pickImage = async (type: 'logo' | 'cover') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showError('Permiso denegado', 'Necesitamos acceso a tus fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'logo' ? [1, 1] : [12, 4],
      quality: 1,
    });

    if (!result.canceled) {
      if (type === 'logo') setPendingLogoAsset(result.assets[0]);
      else setCoverAsset(result.assets[0]);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!name.trim()) {
        showError('Faltan datos', 'Por favor, escribe el nombre del club.');
        return;
      }
      setStep(2);
    } else {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        if (!token) {
          showError('Sesión expirada', 'Por favor inicia sesión de nuevo.');
          return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('is_private', isPrivate.toString());

        if (logoAsset)
          appendImage(formData, 'profile_image', logoAsset, 'photo.jpg');
        if (coverAsset)
          appendImage(formData, 'cover_image', coverAsset, 'cover.jpg');

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
        showError(
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
    else goToClubs();
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
                  <CircularImagePicker
                    uri={logoAsset?.uri ?? null}
                    onPress={() => pickImage('logo')}
                  />
                  <Text style={styles.helperText}>
                    Mínimo recomendado: 400px x 400px.
                  </Text>
                </View>
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.label}>FOTO DE PORTADA</Text>
                <CoverImagePicker
                  asset={coverAsset}
                  onPick={() => pickImage('cover')}
                  onRemove={() => setCoverAsset(null)}
                  placeholder={require('../assets/images/Background.png')}
                />
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

      <CirclePreviewModal
        visible={!!pendingLogoAsset}
        uri={pendingLogoAsset?.uri ?? null}
        title="Vista previa del logo"
        hint="Así se verá el logo del club"
        onCancel={() => setPendingLogoAsset(null)}
        onConfirm={() => {
          setLogoAsset(pendingLogoAsset);
          setPendingLogoAsset(null);
        }}
      />

      <SuccessBottomSheet
        ref={successSheetRef}
        title="¡Club creado!"
        message="Tu club ha sido creado exitosamente. Ya puedes empezar a invitar miembros."
        primaryLabel="Ver mis clubes"
        secondaryLabel=""
        onPrimaryPress={goToClubs}
        onDismiss={goToClubs}
      />

      <SuccessBottomSheet
        ref={errorSheetRef}
        title={errorSheet.title}
        message={errorSheet.message}
        variant="error"
        primaryLabel="Entendido"
        secondaryLabel=""
        onPrimaryPress={() => errorSheetRef.current?.dismiss()}
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
  mainButtonDisabled: { opacity: 0.6 },
  mainButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
