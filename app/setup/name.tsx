import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const LockIcon = require('@/assets/icons/profile/lock.svg') as ImageSource;

function extractStudentId(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 1) return '';
  return email.slice(1, atIndex);
}

export default function NameSetupScreen() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(user?.name ?? '');

  const email = user?.email ?? '';
  const studentId = extractStudentId(email);

  const handleBack = async () => {
    await logout();
    router.replace('/auth/onboarding');
  };

  const handleNext = async () => {
    await updateUser({ name: name.trim() });
    router.replace('/career');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar backgroundColor={colors.backgroundScreen} style="dark" />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color={colors.gray950} />
        </Pressable>
        <Text style={styles.headerTitle}>Nombre</Text>
        <Text style={styles.headerStep}>1/2</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>¡BIENVENIDO!</Text>
          <Text style={styles.title}>Ingresa tu Nombre</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>NOMBRE COMPLETO</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre completo"
              placeholderTextColor={colors.gray700}
            />
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabelLocked}>CORREO INSTITUCIONAL</Text>
              <ExpoImage
                source={LockIcon}
                style={styles.lockIcon}
                contentFit="contain"
              />
            </View>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.inputDisabledText}>{email}</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabelLocked}>MATRÍCULA</Text>
              <ExpoImage
                source={LockIcon}
                style={styles.lockIcon}
                contentFit="contain"
              />
            </View>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.inputDisabledText}>{studentId}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.buttonWrapper, !name.trim() && { opacity: 0.5 }]}
          onPress={handleNext}
          disabled={!name.trim()}
        >
          <LinearGradient
            colors={[colors.blueSecondary, colors.bluePrimary]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Siguiente</Text>
            <ExpoImage
              source={require('@/assets/icons/right_arrow.svg')}
              style={styles.buttonIcon}
              contentFit="contain"
            />
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundScreen,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 16,
    backgroundColor: colors.backgroundScreen,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 9999,
    width: 36,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
    letterSpacing: -0.5,
  },
  headerStep: {
    fontSize: 20,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
    letterSpacing: -0.5,
    width: 36,
    textAlign: 'right',
    paddingRight: 8,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 20,
  },

  label: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.blueDark,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: -12,
  },
  title: {
    fontSize: 30,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.blueDark,
    letterSpacing: -0.5,
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
    fontSize: 12,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.blueSecondary,
    letterSpacing: 0.6,
  },
  fieldLabelLocked: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.activityGray,
    letterSpacing: 0.6,
  },
  lockIcon: {
    width: 11,
    height: 11,
    tintColor: colors.activityGray,
  },

  input: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 15,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray950,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputDisabled: {
    backgroundColor: '#E0E3E6',
    justifyContent: 'center',
  },
  inputDisabledText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
  },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 12,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: typography.fontFamily.manropeBold,
  },
  buttonIcon: {
    width: 16,
    height: 16,
  },
});
