import { HeaderBackButton } from '@/components/HeaderBackButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import SuccessBottomSheet from '@/components/SuccessBottomSheet';
import { colors, typography } from '@/constants/theme';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type DateTarget = 'start' | 'end';

const formatDate = (date: Date) =>
  date.toLocaleDateString('es-MX', {
    month: 'long',
    day: '2-digit',
  });

const formatMonth = (date: Date) =>
  date.toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  });

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const addMonths = (date: Date, months: number) => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
};

export default function ClubCreateEventScreen() {
  const successSheetRef = useRef<BottomSheetModal>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const initialStartDate = new Date(2026, 3, 26);

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(addDays(initialStartDate, 2));

  const [dateTarget, setDateTarget] = useState<DateTarget | null>(null);
  const [tempDate, setTempDate] = useState(new Date());

  const openDatePicker = (target: DateTarget) => {
    setDateTarget(target);
    setTempDate(target === 'start' ? startDate : endDate);
  };

  const closeDatePicker = () => {
    setDateTarget(null);
  };

  const saveDate = () => {
    if (dateTarget === 'start') {
      setStartDate(tempDate);
    }

    if (dateTarget === 'end') {
      setEndDate(tempDate);
    }

    closeDatePicker();
  };

  const handleCreateEvent = () => {
    if (!name.trim() || !description.trim()) {
      return;
    }

    successSheetRef.current?.present();
  };

  const handleSuccessDone = () => {
    successSheetRef.current?.dismiss();

    router.replace({
      pathname: '/(tabs)/clubs',
      params: { tab: 'eventos' },
    } as any);
  };

  return (
    <View style={styles.safeArea}>
      <ScreenHeader
        title="Crear evento"
        align="center"
        variant="white"
        containerStyle={styles.header}
        leftAction={<HeaderBackButton color={colors.blueDark} />}
        rightAction={<View style={styles.headerSide} />}
      />

      <View style={styles.container}>
        <Text style={styles.label}>NOMBRE</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Ej. Conferencias sobre IA"
          placeholderTextColor={colors.activityGray}
        />

        <Text style={styles.label}>DESCRIPCIÓN</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          placeholder="Describe las actividades que realizarán en tu evento"
          placeholderTextColor={colors.activityGray}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>FECHA</Text>

        <View style={styles.dateContainer}>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>INICIO</Text>

            <TouchableOpacity
              style={styles.dateSelect}
              activeOpacity={0.8}
              onPress={() => openDatePicker('start')}
            >
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
              <Image
                source={require('@/assets/icons/SVG.png')}
                style={styles.dateIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>FINAL</Text>

            <TouchableOpacity
              style={styles.dateSelect}
              activeOpacity={0.8}
              onPress={() => openDatePicker('end')}
            >
              <Text style={styles.dateText}>{formatDate(endDate)}</Text>
              <Image
                source={require('@/assets/icons/SVG.png')}
                style={styles.dateIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        <LinearGradient
          colors={[colors.blueSecondary, colors.bluePrimary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.createButton}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.buttonInner}
            onPress={handleCreateEvent}
          >
            <Text style={styles.createButtonText}>Crear</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <Modal transparent visible={dateTarget !== null} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.dateModal}>
            <Text style={styles.modalTitle}>Seleccionar fecha</Text>

            <Text style={styles.modalDate}>{formatDate(tempDate)}</Text>

            <View style={styles.monthContainer}>
              <TouchableOpacity
                style={styles.monthButton}
                activeOpacity={0.8}
                onPress={() => setTempDate(addMonths(tempDate, -1))}
              >
                <Text style={styles.monthButtonText}>Mes anterior</Text>
              </TouchableOpacity>

              <Text style={styles.monthText}>{formatMonth(tempDate)}</Text>

              <TouchableOpacity
                style={styles.monthButton}
                activeOpacity={0.8}
                onPress={() => setTempDate(addMonths(tempDate, 1))}
              >
                <Text style={styles.monthButtonText}>Mes siguiente</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => setTempDate(addDays(tempDate, -1))}
              >
                <Text style={styles.modalOptionText}>Día anterior</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => setTempDate(addDays(tempDate, 1))}
              >
                <Text style={styles.modalOptionText}>Día siguiente</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={closeDatePicker}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={saveDate}>
                <Text style={styles.saveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SuccessBottomSheet
        ref={successSheetRef}
        title="¡Bien hecho!"
        message="Tu nuevo Evento ha sido creado."
        primaryLabel="Listo"
        secondaryLabel=""
        onPrimaryPress={handleSuccessDone}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
  },
  header: {
    height: 50,
    backgroundColor: colors.whiteSoft,
    paddingHorizontal: 24,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerSide: {
    width: 32,
    height: 32,
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 56,
    gap: 5,
  },
  label: {
    height: 16,
    fontSize: 12,
    lineHeight: 16,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interBold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 16,
  },
  input: {
    height: 51,
    borderRadius: 8,
    backgroundColor: colors.gray100,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.gray950,
    fontFamily: typography.fontFamily.interMedium,
  },
  textArea: {
    height: 76,
    paddingTop: 12,
    lineHeight: 20,
  },
  dateContainer: {
    width: '100%',
    height: 100,
    backgroundColor: colors.gray100,
    borderRadius: 16,
    padding: 6,
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interBold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
    paddingLeft: 6,
  },
  dateSelect: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
    fontFamily: typography.fontFamily.interMedium,
    textTransform: 'capitalize',
  },
  dateIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: colors.gray700,
  },
  createButton: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 32,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 28,
    fontFamily: typography.fontFamily.manropeBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.black + '80',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dateModal: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: colors.white,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    color: colors.gray950,
    fontFamily: typography.fontFamily.manropeBold,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalDate: {
    fontSize: 20,
    color: colors.blueSecondary,
    fontFamily: typography.fontFamily.manropeBold,
    textAlign: 'center',
    textTransform: 'capitalize',
    marginBottom: 16,
  },
  monthContainer: {
    gap: 8,
    marginBottom: 14,
  },
  monthButton: {
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonText: {
    fontSize: 14,
    color: colors.gray950,
    fontFamily: typography.fontFamily.interMedium,
  },
  monthText: {
    fontSize: 15,
    color: colors.blueSecondary,
    fontFamily: typography.fontFamily.interBold,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  modalActions: {
    gap: 10,
  },
  modalOption: {
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionText: {
    fontSize: 14,
    color: colors.gray950,
    fontFamily: typography.fontFamily.interMedium,
  },
  modalFooter: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelText: {
    fontSize: 14,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interMedium,
  },
  saveText: {
    fontSize: 14,
    color: colors.blueSecondary,
    fontFamily: typography.fontFamily.interBold,
  },
});
