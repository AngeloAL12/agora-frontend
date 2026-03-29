import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Image as ExpoImage } from 'expo-image';
import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, typography } from '@/constants/theme';
import { useSocialLogin } from '@/hooks/useSocialLogin';

interface LoginBottomSheetProps {
  onDismiss?: () => void;
}

const LoginBottomSheet = React.forwardRef<
  BottomSheetModal,
  LoginBottomSheetProps
>(({ onDismiss }, ref) => {
  const insets = useSafeAreaInsets();
  const {
    loadingProvider,
    error,
    handleGooglePress,
    handleMicrosoftPress,
    googleReady,
  } = useSocialLogin();

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      onDismiss={onDismiss}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.indicator}
      style={styles.sheetOuter}
    >
      <BottomSheetView
        style={[
          styles.contentContainer,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
      >
        <Text style={styles.title}>Inicia Sesión</Text>
        <Text style={styles.subtitle}>
          Accede solo con tu cuenta institucional
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.loginButton, styles.googleButton]}
            activeOpacity={0.8}
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
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, styles.microsoftButton]}
            activeOpacity={0.8}
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
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.8} style={styles.helpButton}>
          <Text style={styles.helpText}>¿Problemas para iniciar sesión?</Text>
          <ExpoImage
            source={require('@/assets/icons/right_top_arrow.svg')}
            style={styles.helpIcon}
            contentFit="contain"
          />
        </TouchableOpacity>

        <Text style={styles.termsText}>
          Al continuar, aceptas nuestros{' '}
          <Text style={styles.linkText}>Términos de Servicio</Text> y{' '}
          <Text style={styles.linkText}>Privacidad</Text>.
        </Text>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetOuter: {
    marginHorizontal: 6,
  },
  sheetBackground: {
    backgroundColor: colors.white,
    borderRadius: 52,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  indicator: {
    backgroundColor: colors.sheetIndicator,
    width: 48,
    height: 6,
    borderRadius: 9999,
  },
  contentContainer: {
    paddingHorizontal: 33,
    alignItems: 'center',
    paddingTop: 32,
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
