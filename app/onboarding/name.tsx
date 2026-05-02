import { Button } from '@/components/Button';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getMe } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const extractStudentId = (email: string): string => {
  const atIndex = email.indexOf('@');
  if (atIndex <= 1) return '';
  return email.slice(1, atIndex);
};

export default function OnboardingNameScreen() {
  const { token, user, updateUser } = useAuth();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getMe(token);
      const resolvedName = data.full_name || data.name || user?.name || '';
      const resolvedEmail = data.email || user?.email || '';
      setFullName(resolvedName);
      setEmail(resolvedEmail);
      setStudentId(extractStudentId(resolvedEmail));
    } catch {
      setEmail(user?.email ?? '');
      setStudentId(extractStudentId(user?.email ?? ''));
    } finally {
      setLoading(false);
    }
  }, [token, user?.email, user?.name]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const handleNext = async () => {
    if (!fullName.trim()) {
      Alert.alert('Campo requerido', 'El nombre no puede estar vacío.');
      return;
    }
    await updateUser({ name: fullName.trim() });
    router.replace('/onboarding/career');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.bluePrimary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar backgroundColor={colors.backgroundScreen} style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace('/auth/onboarding')}
        >
          <Ionicons name="arrow-back" size={20} color={colors.gray950} />
        </Pressable>
        <Text style={styles.headerTitle}>Nombre</Text>
        <Text style={styles.stepIndicator}>1/2</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.welcomeLabel}>¡BIENVENIDO!</Text>
            <Text style={styles.title}>Ingresa tu{'\n'}Nombre</Text>
          </View>

          {/* Fields */}
          <View style={styles.form}>
            {/* Nombre completo */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>NOMBRE COMPLETO</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nombre completo"
                placeholderTextColor={colors.gray700}
                autoCapitalize="words"
              />
            </View>

            {/* Correo institucional */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabelGray}>CORREO INSTITUCIONAL</Text>
                <Ionicons name="lock-closed" size={11} color={colors.gray700} />
              </View>
              <View style={[styles.input, styles.inputDisabled]}>
                <Text style={styles.inputDisabledText}>{email}</Text>
              </View>
            </View>

            {/* Matrícula */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabelGray}>MATRÍCULA</Text>
                <Ionicons name="lock-closed" size={11} color={colors.gray700} />
              </View>
              <View style={[styles.input, styles.inputDisabled]}>
                <Text style={styles.inputDisabledText}>{studentId}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          text="Siguiente"
          onPress={handleNext}
          variant="primary"
          size="large"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundScreen,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundScreen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: colors.backgroundScreen,
  },
  backButton: {
    padding: 8,
    borderRadius: 9999,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
  },
  stepIndicator: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray700,
    minWidth: 36,
    textAlign: 'right',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  titleSection: {
    marginBottom: 32,
  },
  welcomeLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.bluePrimary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.blueSecondary,
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  form: {
    gap: 20,
  },
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.bluePrimary,
    letterSpacing: 0.6,
  },
  fieldLabelGray: {
    fontSize: 11,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray700,
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: colors.gray100,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray950,
  },
  inputDisabled: {
    opacity: 0.72,
    justifyContent: 'center',
  },
  inputDisabledText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.backgroundScreen,
  },
});
