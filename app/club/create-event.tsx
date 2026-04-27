import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import SuccessBottomSheet from '@/components/SuccessBottomSheet';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { createClubEvent } from '@/services/clubService';

export default function CreateEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  const successRef = useRef<BottomSheetModal>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'El nombre es requerido';
    if (!description.trim()) e.description = 'La descripción es requerida';
    if (!startDate.trim()) e.startDate = 'La fecha de inicio es requerida';
    else {
      const d = new Date(startDate);
      if (isNaN(d.getTime())) e.startDate = 'Formato inválido (ej. 2026-05-20)';
      else if (d <= new Date()) e.startDate = 'La fecha debe ser futura';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate() || !token || !id) return;
    setSubmitting(true);
    try {
      await createClubEvent(
        Number(id),
        {
          title: title.trim(),
          description: description.trim(),
          date: new Date(startDate).toISOString(),
          latitude: 0,
          longitude: 0,
        },
        token,
      );
      successRef.current?.present();
    } catch {
      setErrors({ submit: 'No se pudo crear el evento. Intenta de nuevo.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.root}>
      <ScreenHeader
        variant="white"
        title="Crear evento"
        align="center"
        showBackButton
        backButtonColor={colors.blueDark}
        containerStyle={styles.header}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title field */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>NOMBRE</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="Ej. Conferencias sobre IA"
              placeholderTextColor={colors.searchPlaceholder}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />
            {errors.title && (
              <Text style={styles.errorMsg}>{errors.title}</Text>
            )}
          </View>

          {/* Description field */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>DESCRIPCIÓN</Text>
            <TextInput
              style={[styles.textarea, errors.description && styles.inputError]}
              placeholder="Describe las actividades que realizarán en tu evento"
              placeholderTextColor={colors.searchPlaceholder}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {errors.description && (
              <Text style={styles.errorMsg}>{errors.description}</Text>
            )}
          </View>

          {/* Date fields */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>FECHA</Text>
            <View style={styles.datePicker}>
              <View style={styles.dateCol}>
                <Text style={styles.dateSubLabel}>INICIO</Text>
                <View
                  style={[
                    styles.dateInput,
                    errors.startDate && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={styles.dateText}
                    placeholder="2026-05-20"
                    placeholderTextColor={colors.searchPlaceholder}
                    value={startDate}
                    onChangeText={setStartDate}
                    keyboardType="numbers-and-punctuation"
                  />
                  <ExpoImage
                    source={require('@/assets/icons/clubs/clock.svg')}
                    style={styles.calIcon}
                    contentFit="contain"
                    tintColor={colors.gray700}
                  />
                </View>
                {errors.startDate && (
                  <Text style={styles.errorMsg}>{errors.startDate}</Text>
                )}
              </View>

              <View style={styles.dateCol}>
                <Text style={styles.dateSubLabel}>FINAL</Text>
                <View style={styles.dateInput}>
                  <TextInput
                    style={styles.dateText}
                    placeholder="2026-05-22"
                    placeholderTextColor={colors.searchPlaceholder}
                    value={endDate}
                    onChangeText={setEndDate}
                    keyboardType="numbers-and-punctuation"
                  />
                  <ExpoImage
                    source={require('@/assets/icons/clubs/clock.svg')}
                    style={styles.calIcon}
                    contentFit="contain"
                    tintColor={colors.gray700}
                  />
                </View>
              </View>
            </View>
          </View>

          {errors.submit && (
            <Text style={[styles.errorMsg, styles.submitError]}>
              {errors.submit}
            </Text>
          )}
        </ScrollView>

        {/* Submit button */}
        <View
          style={[styles.submitWrap, { paddingBottom: insets.bottom + 16 }]}
        >
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>
              {submitting ? 'Creando...' : 'Crear'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <SuccessBottomSheet
        ref={successRef}
        title="¡Bien hecho!"
        message="Tu nuevo Evento ha sido creado."
        primaryLabel="Listo"
        onPrimaryPress={() => {
          successRef.current?.dismiss();
          router.back();
        }}
        onDismiss={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: { shadowOpacity: 0, elevation: 0 },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 22,
    gap: 18,
  },
  fieldWrap: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interBold,
    color: colors.gray700,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  input: {
    backgroundColor: colors.eventDateBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: typography.fontFamily.interMedium,
    color: colors.gray950,
  },
  textarea: {
    backgroundColor: colors.eventDateBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 16,
    fontFamily: typography.fontFamily.interMedium,
    color: colors.gray950,
    minHeight: 100,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.errorText,
  },
  errorMsg: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.errorText,
  },
  submitError: {
    textAlign: 'center',
    marginTop: 4,
  },

  // Date pickers
  datePicker: {
    backgroundColor: colors.gray100,
    borderRadius: 16,
    padding: 6,
    flexDirection: 'row',
    gap: 16,
  },
  dateCol: {
    flex: 1,
    gap: 4,
  },
  dateSubLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interBold,
    color: colors.gray700,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    paddingLeft: 4,
  },
  dateInput: {
    backgroundColor: colors.eventDateBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    fontFamily: typography.fontFamily.interMedium,
    color: colors.gray950,
  },
  calIcon: {
    width: 20,
    height: 20,
  },

  // Submit
  submitWrap: {
    paddingHorizontal: 22,
    paddingTop: 8,
    backgroundColor: colors.white,
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bluePrimary,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 18,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.white,
    lineHeight: 28,
  },
});
