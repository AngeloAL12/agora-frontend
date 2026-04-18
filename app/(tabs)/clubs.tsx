import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
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

  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clubType, setClubType] = useState('Abierto');

  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [coverUri, setCoverUri] = useState<string | null>(null);

  const pickImage = async (type: 'logo' | 'cover') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos acceso a tus fotos para subir la imagen.',
      );
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

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        Alert.alert('Faltan datos', 'Por favor, escribe el nombre del club.');
        return;
      }
      setStep(2);
    } else {
      Alert.alert('¡Éxito!', 'Club creado correctamente');
      router.push('/' as any);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Tabs.Screen
          options={{ tabBarStyle: { display: 'none' }, headerShown: false }}
        />

        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#192A56" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear club</Text>
          <View style={{ width: 40 }} />
        </View>

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
                  placeholder="Cuéntanos de que trata el club, sus objetivos y actividades..."
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
                    activeOpacity={0.9}
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
                    activeOpacity={0.9}
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

                <Text style={styles.visibilityHelpText}>
                  * Los clubes abiertos permiten que cualquier estudiante se una
                  sin previa aprobación.
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
                      activeOpacity={0.8}
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
              {step === 1 ? 'Siguiente' : 'Crear'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },

  header: {
    backgroundColor: '#FFFFFF',
    height: 100,
    paddingTop: 45,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.5,
    color: '#192A56',
    flex: 1,
    textAlign: 'center',
  },
  backButton: { padding: 8 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
    lineHeight: 16,
    letterSpacing: 1.2,
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
    lineHeight: 16,
    letterSpacing: 1.2,
    color: '#434751',
    textTransform: 'uppercase',
    marginBottom: 8,
    alignSelf: 'flex-start',
    width: '100%',
  },

  inputGroup: { width: '100%', maxWidth: 358, marginBottom: 20 },
  input: {
    width: '100%',
    backgroundColor: '#E0E3E6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '500',
    lineHeight: 24,
    color: '#1A2138',
  },
  textArea: { height: 120 },

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
    backgroundColor: 'transparent',
  },
  typeCardSelected: {
    backgroundColor: '#FFFFFF',
  },

  typeCardText: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  textSelected: {
    fontWeight: '700',
    color: '#003172',
  },
  textUnselected: {
    fontWeight: '600',
    color: '#434751',
  },

  visibilityHelpText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 11,
    lineHeight: 16.5,
    color: '#64748B',
    marginTop: 8,
    alignSelf: 'flex-start',
  },

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
  logoWrapper: { position: 'relative', width: 90, height: 90, marginBottom: 8 },
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
    marginBottom: 1,
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
    textAlign: 'center',
    marginBottom: 8,
  },
  helperText: { fontSize: 12, color: '#434751', textAlign: 'center' },

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
