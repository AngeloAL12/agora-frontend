import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../../constants/theme';

export default function CreateClubStepOne() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'open' | 'closed'>('open');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1A2138" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear club</Text>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressTextRow}>
          <Text style={styles.stepText}>PASO 1: DATOS GENERALES</Text>
          <Text style={styles.stepCount}>1 de 2</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: '50%' }]} />
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>NOMBRE</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Taqueros Programadores"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { marginTop: 24 }]}>DESCRIPCIÓN</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Cuéntanos de que trata el club, sus objetivos y que actividades realizarán..."
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <Text style={[styles.label, { marginTop: 24 }]}>TIPO</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeOption,
              type === 'open' && styles.typeOptionActive,
            ]}
            onPress={() => setType('open')}
          >
            <Text
              style={[
                styles.typeText,
                type === 'open' && styles.typeTextActive,
              ]}
            >
              Abierto
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeOption,
              type === 'closed' && styles.typeOptionActive,
            ]}
            onPress={() => setType('closed')}
          >
            <Text
              style={[
                styles.typeText,
                type === 'closed' && styles.typeTextActive,
              ]}
            >
              Cerrado
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.helperText}>
          *{' '}
          {type === 'open'
            ? 'Los clubes abiertos permiten que cualquier estudiante se una sin previa aprobación.'
            : 'Los clubes cerrados requieren que el administrador apruebe las solicitudes de unión.'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push('/create-club/identity' as any)}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A2138',
    marginLeft: 16,
  },
  progressSection: { marginBottom: 32 },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.bluePrimary,
    letterSpacing: 0.5,
  },
  stepCount: { fontSize: 12, color: '#666' },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: theme.colors.yellow,
    borderRadius: 3,
  },
  form: { flex: 1 },
  label: { fontSize: 12, fontWeight: '700', color: '#444', marginBottom: 8 },
  input: {
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E8E9EB',
  },
  textArea: { height: 120, paddingTop: 16 },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    padding: 4,
    marginTop: 4,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeOptionActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  typeText: { fontSize: 14, fontWeight: '600', color: '#666' },
  typeTextActive: { color: theme.colors.bluePrimary },
  helperText: { fontSize: 11, color: '#999', marginTop: 12, lineHeight: 16 },
  primaryButton: {
    backgroundColor: theme.colors.bluePrimary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
