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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import CategoryChip from '../../components/report/CategoryChip';
import FormField from '../../components/report/FormField';
import SegmentedControl from '../../components/report/SegmentedControl';
import SuccessModal from '../../components/report/SuccessModal';
import {
  REPORT_CATEGORIES,
  REPORT_LOCATIONS,
  REPORT_TABS,
} from '../../constants/report';
import { ReportType } from '../../types/report';

export default function CreateReportScreen() {
  const [reportType, setReportType] = useState<ReportType>('report');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Mantenimiento');
  const [selectedLocation, setSelectedLocation] = useState(REPORT_LOCATIONS[0]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [classroom, setClassroom] = useState('Aula G01');
  const [description, setDescription] = useState('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const isSubmitDisabled = useMemo(() => {
    return title.trim().length === 0 || description.trim().length === 0;
  }, [title, description]);

  const handleSubmit = () => {
    if (isSubmitDisabled) return;
    setIsSuccessModalVisible(true);
  };

  const handleSelectLocation = (location: string) => {
    setSelectedLocation(location);
    setIsLocationDropdownOpen(false);
  };

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topDot} />

          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1F315D" />
            </Pressable>

            <Text style={styles.headerTitle}>Crear</Text>

            <View style={styles.headerSpacer} />
          </View>

          <SegmentedControl
            options={REPORT_TABS}
            selectedValue={reportType}
            onChange={(value) => setReportType(value as ReportType)}
          />

          <FormField
            label="TÍTULO"
            placeholder="Ej. Silla rota"
            value={title}
            onChangeText={setTitle}
          />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CATEGORÍA</Text>

            <View style={styles.categoryList}>
              {REPORT_CATEGORIES.map((category) => (
                <CategoryChip
                  key={category}
                  label={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                />
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.sectionLabel}>UBICACIÓN</Text>

              <View style={styles.dropdownWrapper}>
                <Pressable
                  style={styles.selectField}
                  onPress={() => setIsLocationDropdownOpen((prev) => !prev)}
                >
                  <Text style={styles.selectFieldText}>{selectedLocation}</Text>
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
                              isSelected && styles.dropdownItemTextSelected,
                            ]}
                          >
                            {location}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.column}>
              <Text style={styles.sectionLabel}>AULA</Text>

              <TextInput
                value={classroom}
                onChangeText={setClassroom}
                placeholder="Aula G01"
                placeholderTextColor="#9BA3AE"
                style={styles.inputField}
              />
            </View>
          </View>

          <FormField
            label="DESCRIPCIÓN"
            placeholder="Describe la situación encontrada..."
            value={description}
            onChangeText={setDescription}
            multiline
          />

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

          <Pressable
            style={[
              styles.submitButton,
              isSubmitDisabled && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
          >
            <Text style={styles.submitButtonText}>Enviar</Text>
          </Pressable>
        </ScrollView>
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
  content: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 30,
  },
  topDot: {
    alignSelf: 'center',
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: '#11131A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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
  },
  column: {
    flex: 1,
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 20,
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
  dropdownMenu: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
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
    color: '#1F2937',
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
  submitButton: {
    height: 58,
    marginTop: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F4A97',
  },
  submitButtonDisabled: {
    opacity: 0.55,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
