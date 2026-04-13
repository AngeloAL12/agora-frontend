import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import CategoryChip from '@/components/report/CategoryChip';
import FormField from '@/components/report/FormField';
import SegmentedControl from '@/components/report/SegmentedControl';
import SuccessModal from '@/components/report/SuccessModal';
import {
  REPORT_BUILDINGS,
  REPORT_CATEGORIES,
  REPORT_TABS,
  SUGGESTION_CATEGORIES,
} from '@/constants/report';
import { colors } from '@/constants/theme';
import { useCreateComplaintForm } from '@/hooks/useCreateComplaintForm';
import { ReportType } from '@/types/report';

type BuildingOption = {
  id: number;
  label: string;
};

export default function CreateReportScreen() {
  const [reportType, setReportType] = useState<ReportType>('report');
  const [selectedLocation, setSelectedLocation] = useState<BuildingOption>(
    REPORT_BUILDINGS[0],
  );
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [classroom, setClassroom] = useState('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const {
    title,
    setTitle,
    description,
    setDescription,
    category,
    setCategory,
    images,
    loading,
    isSubmitDisabled,
    pickImage,
    removeImage,
    handleSubmit,
  } = useCreateComplaintForm();

  const isSuggestion = reportType === 'suggestion';

  const activeCategories = isSuggestion
    ? SUGGESTION_CATEGORIES
    : REPORT_CATEGORIES;

  const handleSelectLocation = (location: BuildingOption) => {
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

  const onSubmit = async () => {
    await handleSubmit({
      type: reportType,
      id_building: isSuggestion ? undefined : selectedLocation.id,
      classroom: isSuggestion ? undefined : classroom,
      onSuccess: () => {
        setIsSuccessModalVisible(true);
        setClassroom('');
        setSelectedLocation(REPORT_BUILDINGS[0]);
        setIsLocationDropdownOpen(false);
      },
    });
  };

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.screen}>
          {isLocationDropdownOpen && (
            <View pointerEvents="box-none" style={styles.overlayContainer}>
              <Pressable
                style={styles.overlay}
                onPress={() => setIsLocationDropdownOpen(false)}
              />
            </View>
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
                {activeCategories.map((item) => (
                  <CategoryChip
                    key={item.value}
                    label={item.label}
                    selected={category === item.value}
                    onPress={() => setCategory(item.value)}
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
                        {selectedLocation.label}
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
                          nestedScrollEnabled={true}
                          scrollEnabled={true}
                          showsVerticalScrollIndicator={true}
                          keyboardShouldPersistTaps="handled"
                          bounces={false}
                          style={styles.dropdownScroll}
                          contentContainerStyle={styles.dropdownContent}
                        >
                          {REPORT_BUILDINGS.map((location) => {
                            const isSelected =
                              location.id === selectedLocation.id;

                            return (
                              <Pressable
                                key={location.id}
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
                                  {location.label}
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
                    placeholder="Ej. G01"
                    placeholderTextColor="#9BA3AE"
                    style={styles.inputField}
                    maxLength={10}
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
                  <Text style={styles.evidenceLimit}>
                    Máximo 3 ({images.length}/3)
                  </Text>
                </View>

                <Pressable style={styles.evidenceBox} onPress={pickImage}>
                  <Ionicons name="camera-outline" size={28} color="#495361" />
                  <Text style={styles.evidenceText}>SUBIR</Text>
                </Pressable>

                {images.length > 0 && (
                  <View style={styles.imageList}>
                    {images.map((image, index) => (
                      <View
                        key={`${image.uri}-${index}`}
                        style={styles.imageItem}
                      >
                        <Text style={styles.imageName} numberOfLines={1}>
                          {image.name}
                        </Text>

                        <Pressable onPress={() => removeImage(index)}>
                          <Text style={styles.removeText}>Eliminar</Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <Button
              text={loading ? 'Enviando...' : 'Enviar'}
              onPress={onSubmit}
              disabled={loading || isSubmitDisabled}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={isSuccessModalVisible}
        onClose={() => {
          setIsSuccessModalVisible(false);
        }}
        onSeeDetails={() => {
          setIsSuccessModalVisible(false);
        }}
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
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 90,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
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
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 6 : 12,
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
    maxHeight: 280,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 999,
    elevation: 12,
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
  imageList: {
    marginTop: 12,
    gap: 8,
  },
  imageItem: {
    backgroundColor: '#EEF2F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageName: {
    flex: 1,
    marginRight: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  removeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C62828',
  },
});
