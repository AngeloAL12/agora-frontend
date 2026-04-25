import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import SuccessBottomSheet from '@/components/SuccessBottomSheet';
import { LinearGradient } from 'expo-linear-gradient';

const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

export default function ClubCreateEventScreen() {
  const successSheetRef = useRef<BottomSheetModal>(null);

  const handleCreateEvent = () => {
    successSheetRef.current?.present();
  };

  const handleSuccessDone = () => {
    successSheetRef.current?.dismiss();

    router.replace({
      pathname: '/club-robotica-test',
      params: {
        tab: 'eventos',
      },
    } as any);
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <View style={styles.headerSide}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
            <Image
              source={require('@/assets/icons/regreso.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Crear evento</Text>
        </View>

        <View style={styles.headerSide} />
      </View>

      <View style={styles.container}>
        <Text style={styles.label}>NOMBRE</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Conferencias sobre IA"
          placeholderTextColor="#8A9099"
        />

        <Text style={styles.label}>DESCRIPCIÓN</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe las actividades que realizarán en tu evento"
          placeholderTextColor="#8A9099"
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>FECHA</Text>

        <View style={styles.dateContainer}>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>INICIO</Text>
            <TouchableOpacity style={styles.dateSelect}>
              <Text style={styles.dateText}>Abril 06</Text>
              <Image
                source={require('@/assets/icons/SVG.png')}
                style={styles.dateIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>FINAL</Text>
            <TouchableOpacity style={styles.dateSelect}>
              <Text style={styles.dateText}>Abril 08</Text>
              <Image
                source={require('@/assets/icons/SVG.png')}
                style={styles.dateIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        <LinearGradient
          colors={['#003172', '#1E488F']}
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
          <SuccessBottomSheet
            ref={successSheetRef}
            title="¡Bien hecho!"
            message="Tu nuevo Evento ha sido creado."
            primaryLabel="Listo"
            secondaryLabel=""
            onPrimaryPress={handleSuccessDone}
          />
        </LinearGradient>
      </View>

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
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 56 + STATUS_BAR_HEIGHT,
    paddingTop: STATUS_BAR_HEIGHT,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  headerSide: {
    width: 56,
    height: 56,
    justifyContent: 'center',
  },

  headerCenter: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#192A56',
    textAlign: 'center',
  },

  backIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: '#003172',
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },

  label: {
    width: 149,
    height: 16,
    fontSize: 12,
    fontWeight: '700',
    color: '#434751',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 16,
  },

  input: {
    minHeight: 54,
    height: 51,
    borderRadius: 8,
    backgroundColor: '#E3E7EA',
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#191C1E',
  },

  textArea: {
    minHeight: 92,
    paddingTop: 16,
    lineHeight: 20,
  },

  dateContainer: {
    width: '100%',
    height: 100,
    backgroundColor: '#F2F4F7',
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
    fontWeight: '700',
    color: '#434751',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
    paddingLeft: 6,
  },

  dateSelect: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#E3E7EA',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 24,
  },

  chevron: {
    fontSize: 16,
    color: '#6B7280',
  },

  createButton: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 32,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#003172',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  buttonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dateIcon: {
    width: 16,
    height: 16,
    tintColor: '#434751',
  },
});
