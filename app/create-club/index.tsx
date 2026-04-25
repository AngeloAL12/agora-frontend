import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
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
import { theme } from '../../constants/theme';
import { ClubResponse, createClub } from '../../services/clubService';

export default function CreateClubFlow() {
  const router = useRouter();
  const { token } = useAuth();

  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [idCategory, setIdCategory] = useState<number>(1);
  const [clubType, setClubType] = useState('Abierto');

  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [coverUri, setCoverUri] = useState<string | null>(null);

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
      if (type === 'logo') setLogoUri(result.assets[0].uri);
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
      try {
        if (!token) {
          Alert.alert('Sesión expirada', 'Por favor inicia sesión de nuevo.');
          return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('id_category', idCategory.toString());

        // Se agrega el tipo de club al payload
        formData.append('club_type', clubType);

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

        const result = (await createClub(formData, token)) as ClubResponse;

        if (result && result.id) {
          Alert.alert('¡Éxito!', 'Club creado correctamente', [
            {
              text: 'OK',
              onPress: () => router.replace('/clubs'),
            },
          ]);
        }
      } catch (error: unknown) {
        const e = error as { detail?: string; message?: string };
        const msg = e.detail || e.message || 'No se pudo crear el club';
        Alert.alert('Atención', msg);
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
      <View style={styles.container}>
        <ScreenHeader
          title="Crear club"
          variant="white"
          containerStyle={{ elevation: 0, borderBottomWidth: 0 }}
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
              <View
                style={[
                  styles.progressBarFill,
                  { width: step === 1 ? '50%' : '100%' },
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
                  placeholder="Cuéntanos de qué trata el club..."
                  placeholderTextColor="#43475180"
                  multiline
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>TIPO</Text>
                <View style={styles.typeCardsFrame}>
                  <TouchableOpacity
                    style={[
                      styles.typeCard,
                      clubType === 'Abierto' && styles.typeCardSelected,
                    ]}
                    onPress={() => setClubType('Abierto')}
                  >
                    <Text
                      style={[
                        styles.typeCardText,
                        clubType === 'Abierto'
                          ? styles.textSelected
                          : styles.textUnselected,
                      ]}
                    >
                      Abierto
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeCard,
                      clubType === 'Cerrado' && styles.typeCardSelected,
                    ]}
                    onPress={() => setClubType('Cerrado')}
                  >
                    <Text
                      style={[
                        styles.typeCardText,
                        clubType === 'Cerrado'
                          ? styles.textSelected
                          : styles.textUnselected,
                      ]}
                    >
                      Cerrado
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* Texto de ayuda restaurado */}
                <Text style={styles.visibilityHelpText}>
                  {clubType === 'Abierto'
                    ? 'Los clubes abiertos permiten que cualquier estudiante se una sin previa aprobación.'
                    : 'Los clubes cerrados requieren aprobación del líder para nuevos miembros.'}
                </Text>
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
                <View style={styles.sectionCard}>
                  <TouchableOpacity
                    style={[styles.coverWrapper, { overflow: 'hidden' }]}
                    onPress={() => pickImage('cover')}
                  >
                    <Image
                      source={
                        coverUri
                          ? { uri: coverUri }
                          : require('../../assets/images/Background.png')
                      }
                      style={
                        coverUri ? styles.fullImage : styles.coverPlaceholder
                      }
                      resizeMode={coverUri ? 'cover' : 'contain'}
                    />
                  </TouchableOpacity>
                  <Text style={styles.selectFileText}>Seleccionar archivo</Text>
                  <Text style={styles.helperText}>
                    Mínimo recomendado: 1200px x 400px.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.mainButton} onPress={handleNext}>
            <Text style={styles.mainButtonText}>
              {step === 1 ? 'Siguiente' : 'Crear Club'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
  typeCardsFrame: {
    width: 358,
    height: 52,
    borderRadius: 16,
    padding: 6,
    backgroundColor: '#F2F4F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeCard: {
    width: 173,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeCardSelected: { backgroundColor: '#FFFFFF' },
  typeCardText: { fontFamily: 'Inter', fontSize: 14 },
  textSelected: { fontWeight: '700', color: '#003172' },
  textUnselected: { fontWeight: '600', color: '#434751' },
  visibilityHelpText: { fontSize: 11, color: '#64748B', marginTop: 8 },
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
    backgroundColor: '#F5F6F8',
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
  mainButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
