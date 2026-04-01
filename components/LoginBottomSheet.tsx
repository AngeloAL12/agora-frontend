import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppBottomSheet from '@/components/AppBottomSheet';
import { colors, typography } from '@/constants/theme';
import { useSocialLogin } from '@/hooks/useSocialLogin';

interface LoginBottomSheetProps {
  onDismiss?: () => void;
}

const LoginBottomSheet = React.forwardRef<
  BottomSheetModal,
  LoginBottomSheetProps
>(({ onDismiss }, ref) => {
  const {
    loadingProvider,
    error,
    handleGooglePress,
    handleMicrosoftPress,
    googleReady,
  } = useSocialLogin();

  return (
    <AppBottomSheet ref={ref} onDismiss={onDismiss} minBottomPadding={24}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Inicia Sesión</Text>
        <Text style={styles.subtitle}>
          Accede solo con tu cuenta institucional
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.buttonsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              styles.googleButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleGooglePress}
            disabled={!googleReady || loadingProvider !== null}
          >
            <ExpoImage
              source={require('@/assets/icons/google_logo.svg')}
              style={styles.googleIcon}
              contentFit="contain"
            />
            <Text style={styles.googleButtonText}>
              {loadingProvider === 'google'
                ? 'Cargando...'
                : 'Continuar con Google'}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              styles.microsoftButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleMicrosoftPress}
            disabled={loadingProvider !== null}
          >
            <ExpoImage
              source={require('@/assets/icons/microsoft_logo.svg')}
              style={styles.microsoftIcon}
              contentFit="contain"
            />
            <Text style={styles.microsoftButtonText}>
              {loadingProvider === 'microsoft'
                ? 'Cargando...'
                : 'Continuar con Microsoft'}
            </Text>
          </Pressable>
        </View>

        {/* TODO: implementar navegación de ayuda */}
        <Pressable
          style={({ pressed }) => [
            styles.helpButton,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={styles.helpText}>¿Problemas para iniciar sesión?</Text>
          <ExpoImage
            source={require('@/assets/icons/right_top_arrow.svg')}
            style={styles.helpIcon}
            contentFit="contain"
          />
        </Pressable>

        <Text style={styles.termsText}>
          Al continuar, aceptas nuestros{' '}
          <Text style={styles.linkText}>Términos de Servicio</Text> y{' '}
          <Text style={styles.linkText}>Privacidad</Text>.
        </Text>
      </View>
    </AppBottomSheet>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
    marginBottom: 8,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  errorText: {
    fontFamily: typography.fontFamily.interRegular,
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  loginButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  googleButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray950,
  },
  microsoftButton: {
    backgroundColor: colors.bluePrimary,
    shadowColor: colors.bluePrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 4,
  },
  microsoftIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  microsoftButtonText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.white,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  helpText: {
    fontSize: 14,
    color: colors.blueSecondary,
    fontFamily: typography.fontFamily.interMedium,
  },
  helpIcon: {
    width: 10,
    height: 10,
    marginLeft: 6,
  },
  termsText: {
    fontSize: 12,
    color: colors.gray700,
    textAlign: 'center',
    fontFamily: typography.fontFamily.interMedium,
    lineHeight: 16,
  },
  linkText: {
    color: colors.blueSecondary,
    fontFamily: typography.fontFamily.interBold,
  },
});

LoginBottomSheet.displayName = 'LoginBottomSheet';

export default LoginBottomSheet;
