import { useAuth } from '@/context/AuthContext';
import { theme } from '@/constants/theme';
import { apiRequest } from '@/services/api';
import { getMe, UserMeResponse } from '@/services/authService';
import { useCareers } from '@/hooks/useCareers';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const extractStudentId = (email: string): string => {
  const atIndex = email.indexOf('@');
  if (atIndex <= 1) return '';
  return email.slice(1, atIndex);
};

type ServerProfileUpdate = {
  full_name: string;
  id_career: number | null;
};

type CachedProfile = {
  full_name: string;
  career: string;
  email: string;
  avatar_url: string | null;
};

const PROFILE_CACHE_KEY = 'agora_profile_cache';

const parseCachedProfile = (raw: string | null): CachedProfile | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedProfile;
  } catch {
    return null;
  }
};

export default function EditInfoScreen() {
  const { token, user, updateUser } = useAuth();
  const { careers, loading: careersLoading } = useCareers(token ?? undefined);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const selectFieldRef = useRef<View>(null);

  const [fullName, setFullName] = useState('');
  const [career, setCareer] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [initialAvatarUri, setInitialAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCareerDropdownOpen, setIsCareerDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 0 });

  const selectedCareerLabel = useMemo(
    () => career || 'Selecciona una carrera',
    [career],
  );

  const loadUser = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const cachedRaw = await SecureStore.getItemAsync(PROFILE_CACHE_KEY);
      const cachedProfile = parseCachedProfile(cachedRaw);

      if (cachedProfile) {
        setFullName(cachedProfile.full_name);
        setCareer(cachedProfile.career);
        setEmail(cachedProfile.email);
        setStudentId(extractStudentId(cachedProfile.email));
        setAvatarUri(cachedProfile.avatar_url);
        setInitialAvatarUri(cachedProfile.avatar_url);
        setLoading(false);
      }

      const data = await getMe(token);
      const resolvedName = data.full_name || data.name || user?.name || '';
      const resolvedEmail = data.email || user?.email || '';
      const resolvedAvatar = data.avatar_url ?? data.photo ?? null;
      const resolvedCareer = data.career ?? cachedProfile?.career ?? '';

      setFullName(resolvedName);
      setCareer(resolvedCareer);
      setEmail(resolvedEmail);
      setStudentId(extractStudentId(resolvedEmail));
      setAvatarUri(resolvedAvatar ?? cachedProfile?.avatar_url ?? null);
      setInitialAvatarUri(resolvedAvatar ?? cachedProfile?.avatar_url ?? null);
    } catch {
      const fallbackRaw = await SecureStore.getItemAsync(PROFILE_CACHE_KEY);
      const fallbackProfile = parseCachedProfile(fallbackRaw);

      if (fallbackProfile) {
        setFullName(fallbackProfile.full_name);
        setCareer(fallbackProfile.career);
        setEmail(fallbackProfile.email);
        setStudentId(extractStudentId(fallbackProfile.email));
        setAvatarUri(fallbackProfile.avatar_url);
        setInitialAvatarUri(fallbackProfile.avatar_url);
      } else {
        const fallbackName = user?.name ?? '';
        const fallbackEmail = user?.email ?? '';
        setFullName(fallbackName);
        setCareer('');
        setEmail(fallbackEmail);
        setStudentId(extractStudentId(fallbackEmail));
        setAvatarUri(null);
        setInitialAvatarUri(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token, user?.email, user?.name]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const handleOpenCareerDropdown = useCallback(() => {
    if (isCareerDropdownOpen) {
      setIsCareerDropdownOpen(false);
      return;
    }
    selectFieldRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const dropdownMaxHeight = 280;
      const spaceBelow = windowHeight - (pageY + height + 8);
      const spaceAbove = pageY - 8;
      if (spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow) {
        setDropdownPosition({
          top: undefined,
          bottom: windowHeight - pageY + 8,
          left: pageX,
          width,
        });
      } else {
        const topPosition = Math.min(
          pageY + height + 8,
          Math.max(8, windowHeight - dropdownMaxHeight - 8),
        );
        setDropdownPosition({
          top: topPosition,
          bottom: undefined,
          left: pageX,
          width,
        });
      }
      setIsCareerDropdownOpen(true);
    });
  }, [isCareerDropdownOpen, windowHeight]);

  const handleSelectCareer = useCallback((label: string) => {
    setCareer(label);
    setIsCareerDropdownOpen(false);
  }, []);

  const pickPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso requerido',
        'Necesitamos acceso a la galería para cambiar la foto.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!token) {
      Alert.alert(
        'Sesión no disponible',
        'Vuelve a iniciar sesión para guardar los cambios.',
      );
      return;
    }
    if (!fullName.trim()) {
      Alert.alert('Campo requerido', 'El nombre no puede estar vacío.');
      return;
    }
    try {
      setSaving(true);

      const selectedCareer = careers.find((item) => item.name === career);
      const nextAvatar = avatarUri ?? initialAvatarUri ?? null;

      const form = new FormData();
      form.append('name', fullName.trim());

      if (selectedCareer?.id != null) {
        form.append('id_career', String(selectedCareer.id));
      }

      if (avatarUri && avatarUri !== initialAvatarUri) {
        const filename =
          avatarUri.split('/').pop() || `avatar-${Date.now()}.jpg`;
        const ext = filename.includes('.')
          ? filename.split('.').pop() || 'jpg'
          : 'jpg';
        form.append('photo', {
          uri: avatarUri,
          name: filename,
          type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        } as unknown as Blob);
      }

      await apiRequest<UserMeResponse>({
        method: 'PATCH',
        path: '/users/me',
        token,
        body: form,
        isMultipart: true,
      });

      const cachedProfile: CachedProfile = {
        full_name: fullName.trim(),
        career,
        email,
        avatar_url: nextAvatar,
      };

      await SecureStore.setItemAsync(
        PROFILE_CACHE_KEY,
        JSON.stringify(cachedProfile),
      );

      await updateUser({ name: fullName.trim(), email });
      setInitialAvatarUri(nextAvatar);
      setAvatarUri(nextAvatar);
      Alert.alert('Éxito', 'Los cambios se guardaron correctamente.');
    } catch (error) {
      console.log('Error saving profile:', error);
      Alert.alert('Error', 'No se pudo guardar la información del perfil.');
    } finally {
      setSaving(false);
    }
  }, [
    avatarUri,
    career,
    careers,
    email,
    fullName,
    initialAvatarUri,
    token,
    updateUser,
  ]);

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.palette.surface}
      />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          onPress={() => router.replace('/profile')}
        >
          <Ionicons name="arrow-back" size={24} color={theme.palette.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Editar información</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.palette.surface }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.photoSection}>
            <Pressable style={styles.avatarContainer} onPress={pickPhoto}>
              <View style={styles.avatarCircle}>
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarInitial}>
                    {fullName?.trim()?.charAt(0).toUpperCase() ||
                      user?.name?.charAt(0).toUpperCase() ||
                      'A'}
                  </Text>
                )}
              </View>
              <View style={styles.editBadge}>
                <Ionicons name="pencil" size={13} color={theme.colors.white} />
              </View>
            </Pressable>
            <Text style={styles.photoLabel}>FOTO</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>NOMBRE COMPLETO</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nombre completo"
                placeholderTextColor={theme.palette.textSecondary}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>CARRERA</Text>
              <View ref={selectFieldRef}>
                <Pressable
                  style={[styles.input, styles.selectRow]}
                  onPress={handleOpenCareerDropdown}
                >
                  <Text
                    style={
                      career ? styles.selectValue : styles.selectPlaceholder
                    }
                  >
                    {selectedCareerLabel}
                  </Text>
                  <Ionicons
                    name={isCareerDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={theme.palette.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>CORREO INSTITUCIONAL</Text>
                <Ionicons
                  name="lock-closed"
                  size={11}
                  color={theme.palette.textSecondary}
                />
              </View>
              <View style={[styles.input, styles.inputDisabled]}>
                <Text style={styles.inputDisabledText}>{email}</Text>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>MATRÍCULA</Text>
                <Ionicons
                  name="lock-closed"
                  size={11}
                  color={theme.palette.textSecondary}
                />
              </View>
              <View style={[styles.input, styles.inputDisabled]}>
                <Text style={styles.inputDisabledText}>{studentId}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            { opacity: pressed || saving ? 0.8 : 1 },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Guardar</Text>
          )}
        </Pressable>
      </View>

      <Modal
        visible={isCareerDropdownOpen}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsCareerDropdownOpen(false)}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setIsCareerDropdownOpen(false)}
        />
        <View
          style={[
            styles.dropdownMenu,
            {
              ...(dropdownPosition.top !== undefined && {
                top: dropdownPosition.top,
              }),
              ...(dropdownPosition.bottom !== undefined && {
                bottom: dropdownPosition.bottom,
              }),
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            },
          ]}
        >
          <ScrollView
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            bounces={false}
            style={styles.dropdownScroll}
            contentContainerStyle={styles.dropdownContent}
          >
            {careersLoading && careers.length === 0 ? (
              <View style={styles.dropdownLoading}>
                <ActivityIndicator color={theme.palette.primary} />
              </View>
            ) : careers.length === 0 ? (
              <View style={styles.dropdownEmpty}>
                <Text style={styles.dropdownEmptyText}>
                  No hay carreras disponibles.
                </Text>
              </View>
            ) : (
              careers.map((item) => {
                const isSelected = item.name === career;
                return (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.dropdownItemSelected,
                    ]}
                    onPress={() => handleSelectCareer(item.name)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isSelected && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.palette.surface },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: theme.palette.surface,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: theme.typography.fontFamily.interSemiBold,
    color: theme.palette.primary,
  },
  scrollContent: {
    paddingBottom: 20,
    backgroundColor: theme.palette.surface,
  },
  photoSection: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
    backgroundColor: theme.palette.surface,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: theme.palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  avatarInitial: {
    fontSize: 34,
    fontFamily: theme.typography.fontFamily.manropeExtraBold,
    color: theme.colors.white,
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.palette.surface,
  },
  photoLabel: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.interSemiBold,
    color: theme.palette.textSecondary,
    letterSpacing: 0.5,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 16,
    backgroundColor: theme.palette.surface,
  },
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.interSemiBold,
    color: theme.palette.primary,
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: theme.colors.gray100,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.interRegular,
    color: theme.palette.textPrimary,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectValue: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.interRegular,
    color: theme.palette.textPrimary,
  },
  selectPlaceholder: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.interRegular,
    color: theme.palette.textSecondary,
  },
  inputDisabled: {
    opacity: 0.72,
  },
  inputDisabledText: {
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.interRegular,
    color: theme.palette.textSecondary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.palette.surface,
  },
  saveButton: {
    backgroundColor: theme.palette.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.interSemiBold,
    color: theme.colors.white,
  },
  dropdownMenu: {
    position: 'absolute',
    maxHeight: 280,
    borderRadius: 14,
    backgroundColor: theme.palette.surface,
    borderWidth: 1,
    borderColor: theme.colors.gray100,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  dropdownScroll: {
    maxHeight: 280,
  },
  dropdownContent: {
    paddingVertical: 4,
  },
  dropdownLoading: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownEmpty: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dropdownEmptyText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.interRegular,
    color: theme.palette.textSecondary,
    textAlign: 'center',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: theme.palette.surface,
  },
  dropdownItemSelected: {
    backgroundColor: theme.colors.primaryContainer,
  },
  dropdownItemText: {
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.interRegular,
    color: theme.palette.textPrimary,
  },
  dropdownItemTextSelected: {
    fontFamily: theme.typography.fontFamily.interSemiBold,
    color: theme.palette.primary,
  },
});
