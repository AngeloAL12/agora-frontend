import { ScreenHeader } from '@/components/ScreenHeader';
import SuccessBottomSheet from '@/components/SuccessBottomSheet';
import { colors, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ClubCreateEventScreen() {
  const successSheetRef = useRef<BottomSheetModal>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateEvent = () => {
    if (!name.trim() || !description.trim()) return;
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
        leftAction={
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/clubs' as any);
              }
            }}
            hitSlop={8}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.blueSecondary}
            />
          </Pressable>
        }
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
            <TouchableOpacity style={styles.dateSelect} activeOpacity={0.8}>
              <Text style={styles.dateText}>Abril 06</Text>
              <Image
                source={require('@/assets/icons/SVG.png')}
                style={styles.dateIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>FINAL</Text>
            <TouchableOpacity style={styles.dateSelect} activeOpacity={0.8}>
              <Text style={styles.dateText}>Abril 08</Text>
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
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 12,
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
    backgroundColor: '#E3E7EA',
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
    backgroundColor: '#E3E7EA',
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
});
