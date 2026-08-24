import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
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

type PickerTarget = 'start' | 'end';
type PickerMode = 'date' | 'time';
type PickerState = { target: PickerTarget; mode: PickerMode } | null;

function formatDate(date: Date): string {
  return date.toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CreateEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  const successRef = useRef<BottomSheetModal>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [picker, setPicker] = useState<PickerState>(null);
  const pendingDateRef = useRef<Date | null>(null);

  function openPicker(target: PickerTarget) {
    Keyboard.dismiss();
    pendingDateRef.current = null;
    setPicker({ target, mode: 'date' });
  }

  function handlePickerChange(_: unknown, selected?: Date) {
    if (!picker || !selected) return;
    pendingDateRef.current = selected;
  }

  function confirmPicker() {
    if (!picker || !pendingDateRef.current) return;

    if (picker.mode === 'date') {
      if (Platform.OS === 'ios') {
        setPicker({ target: picker.target, mode: 'time' });
      } else {
        setPicker({ target: picker.target, mode: 'time' });
      }
    } else {
      const base = pendingDateRef.current;
      finalizeDateTime(picker.target, base);
      setPicker(null);
      pendingDateRef.current = null;
    }
  }

  function cancelPicker() {
    setPicker(null);
    pendingDateRef.current = null;
  }

  function finalizeDateTime(target: PickerTarget, date: Date) {
    if (target === 'start') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'El nombre es requerido';
    if (!description.trim()) e.description = 'La descripción es requerida';
    if (!startDate) e.startDate = 'La fecha de inicio es requerida';
    else if (startDate <= new Date()) e.startDate = 'La fecha debe ser futura';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate() || !token || !id || !startDate) return;
    setSubmitting(true);
    try {
      await createClubEvent(
        Number(id),
        {
          title: title.trim(),
          description: description.trim(),
          date: startDate.toISOString(),
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

  const pickerValue =
    picker?.mode === 'date'
      ? ((picker.target === 'start' ? startDate : endDate) ?? new Date())
      : (pendingDateRef.current ?? new Date());

  const pickerMin =
    picker?.target === 'end' && picker.mode === 'date' && startDate
      ? startDate
      : new Date();

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

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>FECHA</Text>
            <View style={styles.datePicker}>
              <View style={styles.dateCol}>
                <Text style={styles.dateSubLabel}>INICIO</Text>
                <TouchableOpacity
                  style={[
                    styles.dateInput,
                    errors.startDate && styles.inputError,
                  ]}
                  onPress={() => openPicker('start')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dateText,
                      !startDate && styles.datePlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {startDate ? formatDate(startDate) : '20 may 2026'}
                  </Text>
                  <ExpoImage
                    source={require('@/assets/icons/clubs/clock.svg')}
                    style={styles.calIcon}
                    contentFit="contain"
                    tintColor={colors.gray700}
                  />
                </TouchableOpacity>
                {errors.startDate && (
                  <Text style={styles.errorMsg}>{errors.startDate}</Text>
                )}
              </View>

              <View style={styles.dateCol}>
                <Text style={styles.dateSubLabel}>FINAL</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => openPicker('end')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dateText,
                      !endDate && styles.datePlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {endDate ? formatDate(endDate) : '22 may 2026'}
                  </Text>
                  <ExpoImage
                    source={require('@/assets/icons/clubs/clock.svg')}
                    style={styles.calIcon}
                    contentFit="contain"
                    tintColor={colors.gray700}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {errors.submit && (
            <Text style={[styles.errorMsg, styles.submitError]}>
              {errors.submit}
            </Text>
          )}
        </ScrollView>

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

      {picker && Platform.OS === 'ios' && (
        <Modal transparent animationType="fade">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={pickerValue}
                mode={picker.mode}
                display="spinner"
                minimumDate={pickerMin}
                onChange={handlePickerChange}
                textColor={colors.gray950}
              />
              <View style={styles.pickerActions}>
                <TouchableOpacity
                  style={[styles.pickerBtn, styles.pickerBtnCancel]}
                  onPress={cancelPicker}
                >
                  <Text style={styles.pickerBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickerBtn, styles.pickerBtnConfirm]}
                  onPress={confirmPicker}
                >
                  <Text
                    style={[styles.pickerBtnText, styles.pickerBtnTextConfirm]}
                  >
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {picker && Platform.OS !== 'ios' && (
        <DateTimePicker
          value={pickerValue}
          mode={picker.mode}
          display="default"
          minimumDate={pickerMin}
          onChange={handlePickerChange}
        />
      )}

      <SuccessBottomSheet
        ref={successRef}
        title="¡Bien hecho!"
        message="Tu nuevo Evento ha sido creado."
        primaryLabel="Listo"
        secondaryLabel=""
        onPrimaryPress={() => {
          successRef.current?.dismiss();
          router.back();
        }}
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
    fontSize: 14,
    fontFamily: typography.fontFamily.interMedium,
    color: colors.gray950,
  },
  datePlaceholder: {
    color: colors.searchPlaceholder,
  },
  calIcon: {
    width: 20,
    height: 20,
  },
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
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: colors.white,
    paddingBottom: 20,
  },
  pickerActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  pickerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  pickerBtnCancel: {
    backgroundColor: colors.gray100,
  },
  pickerBtnConfirm: {
    backgroundColor: colors.bluePrimary,
  },
  pickerBtnText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray700,
  },
  pickerBtnTextConfirm: {
    color: colors.white,
  },
});
