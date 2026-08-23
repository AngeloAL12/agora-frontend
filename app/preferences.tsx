import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  StatusBar,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage, type ImageSource } from 'expo-image';
import { theme } from '@/constants/theme';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import SuccessBottomSheet from '@/components/SuccessBottomSheet';
import ConfirmBottomSheet from '@/components/ConfirmBottomSheet';
import { useAuth } from '@/context/AuthContext';
import { deleteMyAccount } from '@/services/authService';
import type { ApiError } from '@/services/api';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  HomeScreenKey,
  normalizeHomeScreen,
  readPreferences,
  savePreferences,
} from '@/lib/preferencesStorage';

import CustomLoadingScreen from '@/components/CustomLoadingScreen';

const MapIcon = require('@/assets/icons/navbar/map.svg') as ImageSource;
const ReportsIcon = require('@/assets/icons/navbar/reports.svg') as ImageSource;
const MailboxIcon = require('@/assets/icons/navbar/mailbox.svg') as ImageSource;
const ClubsIcon = require('@/assets/icons/navbar/clubs.svg') as ImageSource;
const ProfileIcon = require('@/assets/icons/navbar/profile.svg') as ImageSource;
const NotificationsIcon =
  require('@/assets/icons/profile/notifications.svg') as ImageSource;

interface HomeScreenOption {
  id: HomeScreenKey;
  label: string;
  Icon: ImageSource;
}

// Options using SVG assets
const HOME_SCREEN_OPTIONS: HomeScreenOption[] = [
  { id: 'map', label: 'Mapa', Icon: MapIcon },
  { id: 'complaints', label: 'Reportes', Icon: ReportsIcon },
  { id: 'messages', label: 'Mensajes', Icon: MailboxIcon },
  { id: 'clubs', label: 'Clubes', Icon: ClubsIcon },
  { id: 'profile', label: 'Perfil', Icon: ProfileIcon },
];

const NAV_ICON_SIZE = 20;

export default function PreferencesScreen() {
  const insets = useSafeAreaInsets();
  const { token, refreshToken, logout, isDemoMode } = useAuth();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [homeScreen, setHomeScreen] = useState<HomeScreenKey>('complaints');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const feedbackSheetRef = useRef<BottomSheetModal>(null);
  const deleteSheetRef = useRef<BottomSheetModal>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [feedbackSheet, setFeedbackSheet] = useState<{
    title: string;
    message: string;
    variant: 'success' | 'error';
  }>({ title: '', message: '', variant: 'success' });

  const loadPreferences = useCallback(async () => {
    try {
      const prefs = await readPreferences();
      if (prefs?.notificationsEnabled != null) {
        setNotificationsOn(prefs.notificationsEnabled);
      }
      const normalizedHomeScreen = normalizeHomeScreen(prefs?.homeScreen);
      if (normalizedHomeScreen) setHomeScreen(normalizedHomeScreen);
    } catch {
      // usar defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPreferences();
  }, [loadPreferences]);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      await savePreferences({
        homeScreen,
        notificationsEnabled: notificationsOn,
      });
      setFeedbackSheet({
        title: '¡Listo!',
        message: 'Las preferencias se guardaron correctamente.',
        variant: 'success',
      });
      feedbackSheetRef.current?.present();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudieron guardar las preferencias.';
      setFeedbackSheet({ title: 'Error', message, variant: 'error' });
      feedbackSheetRef.current?.present();
    } finally {
      setSaving(false);
    }
  }, [notificationsOn, homeScreen]);

  const handleDeleteAccount = useCallback(async () => {
    if (!token) {
      setDeleteError(
        'No encontramos una sesión activa. Inicia sesión de nuevo.',
      );
      return;
    }

    setDeletingAccount(true);
    setDeleteError(null);

    try {
      await deleteMyAccount(token, {
        refreshToken: refreshToken ?? undefined,
        // No persistimos tokens renovados: esta operación termina la sesión.
        onTokenRefreshed: () => undefined,
      });
      deleteSheetRef.current?.dismiss();
      await logout();
      router.replace('/');
    } catch (error) {
      const apiError = error as ApiError | null;
      setDeleteError(
        apiError?.detail ||
          apiError?.message ||
          'No pudimos eliminar tu cuenta. Inténtalo de nuevo.',
      );
    } finally {
      setDeletingAccount(false);
    }
  }, [logout, refreshToken, token]);

  if (loading) {
    return <CustomLoadingScreen message="Cargando preferencias..." />;
  }

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
          <Ionicons name="arrow-back" size={24} color={theme.palette.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Preferencias</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Notificaciones ── */}
        <Text style={styles.sectionLabel}>NOTIFICACIONES</Text>
        <View style={styles.card}>
          <View style={styles.notifRow}>
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: theme.colors.primaryContainer,
                  borderRadius: 12,
                },
              ]}
            >
              <ExpoImage
                source={NotificationsIcon}
                style={{
                  width: NAV_ICON_SIZE,
                  height: NAV_ICON_SIZE,
                  tintColor: theme.palette.primary,
                }}
                contentFit="contain"
              />
            </View>
            <Text style={styles.rowLabel}>Notificaciones</Text>
            <Switch
              value={notificationsOn}
              onValueChange={setNotificationsOn}
              trackColor={{
                false: theme.colors.gray100,
                true: theme.palette.primary,
              }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        {/* ── Pantalla de inicio ── */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
          PANTALLA DE INICIO
        </Text>
        <View style={styles.card}>
          {HOME_SCREEN_OPTIONS.map((option, index) => {
            const isSelected = homeScreen === option.id;
            const iconColor = theme.palette.primary;

            return (
              <React.Fragment key={option.id}>
                <Pressable
                  style={({ pressed }) => [
                    styles.optionRow,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => setHomeScreen(option.id)}
                >
                  {/* SVG icon */}
                  <View style={styles.iconBox}>
                    <ExpoImage
                      source={option.Icon}
                      style={{
                        width: NAV_ICON_SIZE,
                        height: NAV_ICON_SIZE,
                        tintColor: iconColor,
                      }}
                      contentFit="contain"
                    />
                  </View>

                  <Text style={styles.rowLabel}>{option.label}</Text>

                  {/* Radio button */}
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </Pressable>

                {index < HOME_SCREEN_OPTIONS.length - 1 && (
                  <View style={styles.divider} />
                )}
              </React.Fragment>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
          SEGURIDAD Y COMUNIDAD
        </Text>
        <View style={styles.card}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.optionRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.push('/my-content-reports')}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name="flag-outline"
                size={20}
                color={theme.palette.primary}
              />
            </View>
            <Text style={styles.rowLabel}>Mis denuncias</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.gray700}
            />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.optionRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.push('/blocked-users')}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name="person-remove-outline"
                size={20}
                color={theme.palette.primary}
              />
            </View>
            <Text style={styles.rowLabel}>Usuarios bloqueados</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.gray700}
            />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.optionRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.push('/community-guidelines')}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={theme.palette.primary}
              />
            </View>
            <Text style={styles.rowLabel}>Normas de comunidad</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.gray700}
            />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.optionRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.push('/support')}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name="help-buoy-outline"
                size={20}
                color={theme.palette.primary}
              />
            </View>
            <Text style={styles.rowLabel}>Contacto y soporte</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.gray700}
            />
          </Pressable>
        </View>

        {!isDemoMode ? (
          <>
            <Text style={[styles.sectionLabel, styles.accountSectionLabel]}>
              CUENTA
            </Text>
            <View style={styles.card}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Eliminar cuenta"
                style={({ pressed }) => [
                  styles.optionRow,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {
                  setDeleteError(null);
                  deleteSheetRef.current?.present();
                }}
              >
                <View style={[styles.iconBox, styles.deleteIconBox]}>
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={theme.colors.errorText}
                  />
                </View>
                <View style={styles.deleteCopy}>
                  <Text style={styles.deleteTitle}>Eliminar cuenta</Text>
                  <Text style={styles.deleteSubtitle}>
                    Borra tus datos personales y cierra todas tus sesiones.
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.gray700}
                />
              </Pressable>
            </View>
          </>
        ) : null}
      </ScrollView>

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

      <SuccessBottomSheet
        ref={feedbackSheetRef}
        title={feedbackSheet.title}
        message={feedbackSheet.message}
        variant={feedbackSheet.variant}
        primaryLabel="Entendido"
        secondaryLabel=""
        onPrimaryPress={() => feedbackSheetRef.current?.dismiss()}
      />

      <ConfirmBottomSheet
        ref={deleteSheetRef}
        title="¿Eliminar tu cuenta?"
        message="Tu perfil, foto, datos personales y sesiones se eliminarán. Tus reportes y actividad institucional se conservarán de forma anónima. Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar cuenta"
        cancelLabel="Conservar mi cuenta"
        isLoading={deletingAccount}
        errorMessage={deleteError}
        onConfirm={() => void handleDeleteAccount()}
        onCancel={() => {
          setDeleteError(null);
          deleteSheetRef.current?.dismiss();
        }}
        onDismiss={() => setDeleteError(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.palette.surface },
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  loadingContainer: {
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.interSemiBold,
    color: theme.palette.primary,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  card: {
    backgroundColor: theme.palette.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.interSemiBold,
    color: theme.palette.textPrimary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: theme.palette.primary,
    backgroundColor: theme.palette.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray100,
    marginLeft: 54,
  },
  accountSectionLabel: {
    marginTop: 24,
  },
  deleteIconBox: {
    backgroundColor: theme.colors.errorContainer,
  },
  deleteCopy: {
    flex: 1,
    paddingRight: 12,
  },
  deleteTitle: {
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.interSemiBold,
    color: theme.colors.errorText,
  },
  deleteSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: theme.typography.fontFamily.interRegular,
    color: theme.palette.textSecondary,
  },
  footer: { paddingHorizontal: 20, paddingVertical: 16 },
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
});
