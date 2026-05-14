import { CAREERS_LIST, getCareerIcon } from '@/constants/careers';
import { theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/services/api';
import { getMe, UserProfileResponse } from '@/services/authService';
import { CacheService } from '@/services/cacheService';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage, type ImageSource } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
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
  TextInput,
  useWindowDimensions,
  View,
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

const LockIcon = require('@/assets/icons/profile/lock.svg') as ImageSource;
const findCareerIdByName = (name: string | null | undefined) => {
  if (!name) return null;
  const normalizedName = name.toLowerCase().trim();

  // 1. Exact match (case insensitive)
  const exact = CAREERS_LIST.find(
    (c) => c.name.toLowerCase().trim() === normalizedName,
  );
  if (exact) return exact.id;

  // 2. Partial match (if one contains the other)
  const partial = CAREERS_LIST.find((c) => {
    const cName = c.name.toLowerCase().trim();
    return cName.includes(normalizedName) || normalizedName.includes(cName);
  });

  return partial ? partial.id : null;
};

type CachedProfile = {
  full_name: string;
  career: string;
  email: string;
  id_career?: number | null;
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
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const selectFieldRef = useRef<View>(null);
  const [fullName, setFullName] = useState(user?.name || '');
  const [selectedCareerId, setSelectedCareerId] = useState<number | null>(
    user?.id_career ?? null,
  );
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);
  const [initialAvatarUri, setInitialAvatarUri] = useState<string | null>(null);
  const [, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCareerDropdownOpen, setIsCareerDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 0 });

  const selectedCareerLabel = useMemo(() => {
    if (selectedCareerId === null) return 'Selecciona una carrera';
    const found = CAREERS_LIST.find((c) => c.id === selectedCareerId);
    return found ? found.name : 'Selecciona una carrera';
  }, [selectedCareerId]);

  const loadUser = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const cachedRaw = await SecureStore.getItemAsync(PROFILE_CACHE_KEY);
      const cachedProfile = parseCachedProfile(cachedRaw);

      if (cachedProfile) {
        const foundId =
          cachedProfile.id_career || findCareerIdByName(cachedProfile.career);
        setFullName(cachedProfile.full_name);
        if (foundId) setSelectedCareerId(foundId);
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
      const careerName = data.career || cachedProfile?.career || '';
      const foundId = findCareerIdByName(careerName) || user?.id_career;

      setFullName(resolvedName);
      if (foundId) setSelectedCareerId(foundId);
      setEmail(resolvedEmail);
      setStudentId(extractStudentId(resolvedEmail));
      setAvatarUri(resolvedAvatar ?? cachedProfile?.avatar_url ?? null);
      setInitialAvatarUri(resolvedAvatar ?? cachedProfile?.avatar_url ?? null);
    } catch {
      const fallbackRaw = await SecureStore.getItemAsync(PROFILE_CACHE_KEY);
      const fallbackProfile = parseCachedProfile(fallbackRaw);

      if (fallbackProfile) {
        const foundId =
          fallbackProfile.id_career ||
          findCareerIdByName(fallbackProfile.career);
        setFullName(fallbackProfile.full_name);
        if (foundId) setSelectedCareerId(foundId);
        setEmail(fallbackProfile.email);
        setStudentId(extractStudentId(fallbackProfile.email));
        setAvatarUri(fallbackProfile.avatar_url);
        setInitialAvatarUri(fallbackProfile.avatar_url);
      } else {
        const fallbackName = user?.name ?? '';
        const fallbackEmail = user?.email ?? '';
        setFullName(fallbackName);
        setSelectedCareerId(null);
        setEmail(fallbackEmail);
        setStudentId(extractStudentId(fallbackEmail));
        setAvatarUri(null);
        setInitialAvatarUri(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token, user?.email, user?.name, user?.id_career]);

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

  const handleSelectCareer = useCallback((id: number) => {
    setSelectedCareerId(id);
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
      setPendingAvatarUri(result.assets[0].uri);
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

      const nextAvatar = avatarUri ?? initialAvatarUri ?? null;

      const form = new FormData();
      form.append('name', fullName.trim());

      if (selectedCareerId != null) {
        form.append('id_career', String(selectedCareerId));
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

      await apiRequest<UserProfileResponse>({
        method: 'PATCH',
        path: '/users/me',
        token,
        body: form,
        isMultipart: true,
      });

      CacheService.clearMeData();

      const cachedProfile: CachedProfile = {
        full_name: fullName.trim(),
        career: selectedCareerLabel,
        email,
        id_career: selectedCareerId,
        avatar_url: nextAvatar,
      };

      await SecureStore.setItemAsync(
        PROFILE_CACHE_KEY,
        JSON.stringify(cachedProfile),
      );

      await updateUser({
        name: fullName.trim(),
        email,
        id_career: selectedCareerId,
      });
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
    email,
    fullName,
    initialAvatarUri,
    selectedCareerId,
    selectedCareerLabel,
    token,
    updateUser,
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
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
          <Ionicons name="arrow-back" size={24} color={theme.colors.blueDark} />
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
                  <View style={styles.selectTextContainer}>
                    {selectedCareerId !== null && (
                      <ExpoImage
                        source={getCareerIcon(selectedCareerId)}
                        style={styles.selectIcon}
                        contentFit="contain"
                      />
                    )}
                    <Text
                      style={
                        selectedCareerId !== null
                          ? styles.selectValue
                          : styles.selectPlaceholder
                      }
                      numberOfLines={1}
                    >
                      {selectedCareerLabel}
                    </Text>
                  </View>
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
                <Text style={styles.fieldLabelGray}>CORREO INSTITUCIONAL</Text>
                <ExpoImage
                  source={LockIcon}
                  style={{
                    width: 11,
                    height: 11,
                    tintColor: theme.palette.textSecondary,
                  }}
                  contentFit="contain"
                />
              </View>
              <View style={[styles.input, styles.inputDisabled]}>
                <Text style={styles.inputDisabledText}>{email}</Text>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabelGray}>MATRÍCULA</Text>
                <ExpoImage
                  source={LockIcon}
                  style={{
                    width: 11,
                    height: 11,
                    tintColor: theme.palette.textSecondary,
                  }}
                  contentFit="contain"
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
            {CAREERS_LIST.map((item) => {
              const isSelected = item.id === selectedCareerId;
              const icon = getCareerIcon(item.id);
              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.dropdownItem,
                    isSelected && styles.dropdownItemSelected,
                  ]}
                  onPress={() => handleSelectCareer(item.id)}
                >
                  <View style={styles.dropdownItemContent}>
                    <View style={styles.dropdownIconBox}>
                      <ExpoImage
                        source={icon}
                        style={styles.dropdownItemIcon}
                        contentFit="contain"
                      />
                    </View>
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isSelected && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={!!pendingAvatarUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingAvatarUri(null)}
      >
        <View style={styles.circlePreviewOverlay}>
          <View style={styles.circlePreviewCard}>
            <Text style={styles.circlePreviewTitle}>Vista previa de foto</Text>
            <View style={styles.circlePreviewImageWrapper}>
              {pendingAvatarUri && (
                <Image
                  source={{ uri: pendingAvatarUri }}
                  style={styles.circlePreviewImage}
                />
              )}
            </View>
            <Text style={styles.circlePreviewHint}>
              Así se verá tu foto de perfil
            </Text>
            <View style={styles.circlePreviewActions}>
              <Pressable
                style={styles.circlePreviewCancel}
                onPress={() => setPendingAvatarUri(null)}
              >
                <Text style={styles.circlePreviewCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.circlePreviewConfirm}
                onPress={() => {
                  setAvatarUri(pendingAvatarUri);
                  setPendingAvatarUri(null);
                }}
              >
                <Text style={styles.circlePreviewConfirmText}>Usar foto</Text>
              </Pressable>
            </View>
          </View>
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
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.interBold,
    color: theme.colors.blueDark,
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
    fontFamily: theme.typography.fontFamily.interRegular,
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
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.interSemiBold,
    color: theme.colors.blueSecondary,
    letterSpacing: 0.6,
  },
  fieldLabelGray: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.interSemiBold,
    color: theme.colors.activityGray,
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
  selectTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectIcon: {
    width: 20,
    height: 20,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.palette.surface,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownItemIcon: {
    width: 18,
    height: 18,
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
  circlePreviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  circlePreviewCard: {
    backgroundColor: theme.palette.surface,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
  },
  circlePreviewTitle: {
    fontSize: 17,
    fontFamily: theme.typography.fontFamily.interBold,
    color: theme.colors.blueDark,
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
    fontFamily: theme.typography.fontFamily.interSemiBold,
  },
  circlePreviewConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.blueDark,
    alignItems: 'center',
  },
  circlePreviewConfirmText: {
    fontSize: 15,
    color: '#fff',
    fontFamily: theme.typography.fontFamily.interBold,
  },
});
