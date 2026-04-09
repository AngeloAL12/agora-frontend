import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  StatusBar,
  Alert,
} from 'react-native';

import { Button } from '@/components/Button';
import CategoryChip from '@/components/report/CategoryChip';
import FormField from '@/components/report/FormField';
import SegmentedControl from '@/components/report/SegmentedControl';
import SuccessModal from '@/components/report/SuccessModal';
import {
  REPORT_CATEGORIES,
  REPORT_LOCATIONS,
  REPORT_TABS,
} from '@/constants/report';
import { colors } from '@/constants/theme';
import { ReportType } from '@/types/report';

export default function CreateReportScreen() {
  const [reportType, setReportType] = useState<ReportType>('report');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Mantenimiento');
  const [selectedLocation, setSelectedLocation] = useState(REPORT_LOCATIONS[0]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [classroom, setClassroom] = useState('');
  const [description, setDescription] = useState('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const isSuggestion = reportType === 'suggestion';

  const suggestionCategories = [
    'Mantenimiento',
    'Limpieza',
    'Seguridad',
    'Servicios',
    'Infraestructura',
    'General',
  ];

  const activeCategories = isSuggestion
    ? suggestionCategories
    : REPORT_CATEGORIES;

  const isSubmitDisabled = useMemo(() => {
    return title.trim().length === 0 || description.trim().length === 0;
  }, [title, description]);

  const handleSubmit = async () => {
    if (isSubmitDisabled) return;

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error('No se encontró EXPO_PUBLIC_API_URL en el .env');
      }

      // ⚠️ IMPORTANTE: CAMBIA ESTO POR TU TOKEN REAL
      // Ejemplo: const token = session?.accessToken;
      const token = 'AQUI_VA_TU_TOKEN';

      if (!token || token === 'AQUI_VA_TU_TOKEN') {
        throw new Error('Falta el token del usuario logueado');
      }

      const formData = new FormData();

      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', selectedCategory);

      const response = await fetch(`${apiUrl}complaints`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || 'No se pudo enviar el reporte');
      }

      setIsSuccessModalVisible(true);
    } catch (error) {
      console.error('Error al enviar el reporte:', error);

      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al enviar el reporte',
      );
    }
  };

  const handleSelectLocation = (location: string) => {
    setSelectedLocation(location);
    setIsLocationDropdownOpen(false);
  };

  const handleClassroomChange = (value: string) => {
    let numericValue = value.replace(/[^0-9]/g, '');
    numericValue = numericValue.slice(0, 2);

    if (numericValue !== '') {
      const numberValue = parseInt(numericValue, 10);
      if (numberValue > 43) numericValue = '43';
    }

    setClassroom(numericValue);
  };

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.screen}>
          {isLocationDropdownOpen && (
            <Pressable
              style={styles.overlay}
              onPress={() => setIsLocationDropdownOpen(false)}
            />
          )}

          <ScrollView
            contentContainerStyle={[
              styles.content,
              isSuggestion && styles.suggestionContent,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={!isLocationDropdownOpen}
          >
            <View style={styles.header}>
              <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#1F315D" />
              </Pressable>

              <Text style={styles.headerTitle}>Crear</Text>

              <View style={styles.headerSpacer} />
            </View>

            <SegmentedControl
              options={REPORT_TABS}
              selectedValue={reportType}
              onChange={(value) => {
                setReportType(value as ReportType);
                setIsLocationDropdownOpen(false);
              }}
            />

            <View style={styles.section}>
              <FormField
                label="TÍTULO"
                placeholder="Ej. Silla rota"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>CATEGORÍA</Text>
              <View style={styles.categoryList}>
                {activeCategories.map((category) => (
                  <CategoryChip
                    key={category}
                    label={category}
                    selected={selectedCategory === category}
                    onPress={() => setSelectedCategory(category)}
                  />
                ))}
              </View>
            </View>

            {!isSuggestion && (
              <View style={styles.row}>
                <View style={[styles.column, styles.locationColumn]}>
                  <Text style={styles.sectionLabel}>UBICACIÓN</Text>

                  <View style={styles.dropdownWrapper}>
                    <Pressable
                      style={styles.selectField}
                      onPress={() => setIsLocationDropdownOpen((prev) => !prev)}
                    >
                      <Text style={styles.selectFieldText}>
                        {selectedLocation}
                      </Text>
                      <Ionicons
                        name={
                          isLocationDropdownOpen ? 'chevron-up' : 'chevron-down'
                        }
                        size={20}
                        color="#667085"
                      />
                    </Pressable>

                    {isLocationDropdownOpen && (
                      <View style={styles.dropdownMenu}>
                        <ScrollView
                          nestedScrollEnabled
                          showsVerticalScrollIndicator
                          keyboardShouldPersistTaps="handled"
                          style={styles.dropdownScroll}
                        >
                          {REPORT_LOCATIONS.map((location) => {
                            const isSelected = location === selectedLocation;

                            return (
                              <Pressable
                                key={location}
                                style={[
                                  styles.dropdownItem,
                                  isSelected && styles.dropdownItemSelected,
                                ]}
                                onPress={() => handleSelectLocation(location)}
                              >
                                <Text
                                  style={[
                                    styles.dropdownItemText,
                                    isSelected &&
                                      styles.dropdownItemTextSelected,
                                  ]}
                                >
                                  {location}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.column}>
                  <Text style={styles.sectionLabel}>AULA</Text>

                  <TextInput
                    value={classroom}
                    onChangeText={handleClassroomChange}
                    placeholder="Ej. 12"
                    placeholderTextColor="#9BA3AE"
                    style={styles.inputField}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>DESCRIPCIÓN</Text>
              <TextInput
                placeholder="Describe la situación encontrada..."
                placeholderTextColor="#9BA3AE"
                value={description}
                onChangeText={setDescription}
                multiline
                style={styles.descriptionInput}
                textAlignVertical="top"
              />
            </View>

            {!isSuggestion && (
              <View style={styles.section}>
                <View style={styles.evidenceHeader}>
                  <Text style={styles.sectionLabel}>EVIDENCIA</Text>
                  <Text style={styles.evidenceLimit}>Máximo 3</Text>
                </View>

                <Pressable style={styles.evidenceBox}>
                  <Ionicons name="camera-outline" size={28} color="#495361" />
                  <Text style={styles.evidenceText}>SUBIR</Text>
                </Pressable>
              </View>
            )}

            <Button text="Envíar" onPress={handleSubmit} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={isSuccessModalVisible}
        onClose={() => setIsSuccessModalVisible(false)}
        onSeeDetails={() => setIsSuccessModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFB',
  },
  screen: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 90,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 30,
  },
  suggestionContent: {
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 6 : 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F315D',
  },
  headerSpacer: {
    width: 40,
  },
  section: {
    marginBottom: 18,
  },
  sectionLabel: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#3E4650',
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
    alignItems: 'flex-start',
    zIndex: 50,
  },
  column: {
    flex: 1,
  },
  locationColumn: {
    zIndex: 100,
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 100,
  },
  selectField: {
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#E9EDF2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectFieldText: {
    fontSize: 16,
    color: '#1F2937',
  },
  descriptionInput: {
    minHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#E9EDF2',
    fontSize: 16,
    color: colors.blueSecondary,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    height: 220,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    zIndex: 999,
    elevation: 10,
  },
  dropdownScroll: {
    flexGrow: 0,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  dropdownItemSelected: {
    backgroundColor: '#EEF2F6',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#1F2937',
  },
  dropdownItemTextSelected: {
    fontWeight: '700',
    color: '#163D79',
  },
  inputField: {
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#E9EDF2',
    fontSize: 16,
    color: colors.blueSecondary,
  },
  evidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  evidenceLimit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F4E94',
  },
  evidenceBox: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#B9C1CC',
    backgroundColor: '#EEF2F6',
  },
  evidenceText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#3E4650',
  },
});
