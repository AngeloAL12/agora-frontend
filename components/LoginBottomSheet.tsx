import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {
  ResponseType,
  exchangeCodeAsync,
  makeRedirectUri,
  useAuthRequest,
} from 'expo-auth-session';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import type { ApiError } from '@/services/api';
import {
  LoginResponse,
  loginWithGoogle,
  loginWithMicrosoft,
} from '@/services/authService';

WebBrowser.maybeCompleteAuthSession();

const MICROSOFT_CLIENT_ID = process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID ?? '';
const rawGoogleIosId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

const isSchemeFormat = rawGoogleIosId.startsWith('com.googleusercontent.apps.');

const GOOGLE_IOS_CLIENT_ID = isSchemeFormat
  ? `${rawGoogleIosId.replace('com.googleusercontent.apps.', '')}.apps.googleusercontent.com`
  : rawGoogleIosId;
const googleIosScheme = isSchemeFormat
  ? rawGoogleIosId
  : `com.googleusercontent.apps.${rawGoogleIosId.replace('.apps.googleusercontent.com', '')}`;
const googleRedirectUri = `${googleIosScheme}:/`;

const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

const microsoftDiscovery = {
  authorizationEndpoint:
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
};

interface LoginBottomSheetProps {
  onDismiss?: () => void;
}

const LoginBottomSheet = React.forwardRef<
  BottomSheetModal,
  LoginBottomSheetProps
>(({ onDismiss }, ref) => {
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<
    'google' | 'microsoft' | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const [googleRequest, googleResponse, promptGoogle] = useAuthRequest(
    {
      clientId: GOOGLE_IOS_CLIENT_ID,
      responseType: ResponseType.Code,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: googleRedirectUri,
      usePKCE: true,
    },
    googleDiscovery,
  );

  const redirectUri = makeRedirectUri({ scheme: 'agorafrontend' });
  const [, microsoftResponse, promptMicrosoft] = useAuthRequest(
    {
      clientId: MICROSOFT_CLIENT_ID,
      responseType: 'code',
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      usePKCE: true,
    },
    microsoftDiscovery,
  );

  const handleLoginResponse = useCallback(
    async (loginFn: () => Promise<LoginResponse>) => {
      try {
        setError(null);
        const response = await loginFn();
        await auth.login(response);
        router.replace('/(tabs)/home');
      } catch (err) {
        const apiErr = err as ApiError;
        const isNetworkError =
          err instanceof TypeError &&
          (err as TypeError).message === 'Network request failed';
        const message = isNetworkError
          ? 'No se pudo conectar al servidor. Verifica tu conexión.'
          : (apiErr?.detail ??
            'Ocurrió un error inesperado. Inténtalo de nuevo.');
        setError(message);
      } finally {
        setLoadingProvider(null);
      }
    },
    [auth],
  );

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const code = googleResponse.params?.code;
      if (!code || !googleRequest?.codeVerifier) {
        setError('No se pudo obtener el token de Google.');
        setLoadingProvider(null);
        return;
      }

      exchangeCodeAsync(
        {
          clientId: GOOGLE_IOS_CLIENT_ID,
          code,
          redirectUri: googleRedirectUri,
          extraParams: { code_verifier: googleRequest.codeVerifier },
        },
        { tokenEndpoint: 'https://oauth2.googleapis.com/token' },
      )
        .then((tokenResponse) => {
          const idToken = tokenResponse.idToken;
          if (idToken) {
            handleLoginResponse(() => loginWithGoogle(idToken));
          } else {
            setError('No se pudo obtener el id_token de Google.');
            setLoadingProvider(null);
          }
        })
        .catch(() => {
          setError('Error al intercambiar el token de Google.');
          setLoadingProvider(null);
        });
    } else if (googleResponse?.type === 'error') {
      setError('Error al iniciar sesión con Google. Inténtalo de nuevo.');
      setLoadingProvider(null);
    }
  }, [googleResponse, googleRequest, handleLoginResponse]);

  useEffect(() => {
    if (microsoftResponse?.type === 'success') {
      const idToken = microsoftResponse.authentication?.idToken;
      if (idToken) {
        handleLoginResponse(() => loginWithMicrosoft(idToken));
      } else {
        setError('No se pudo obtener el token de Microsoft.');
        setLoadingProvider(null);
      }
    } else if (microsoftResponse?.type === 'error') {
      setError('Error al iniciar sesión con Microsoft. Inténtalo de nuevo.');
      setLoadingProvider(null);
    }
  }, [microsoftResponse, handleLoginResponse]);

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
            onPress={() => {
              setError(null);
              setLoadingProvider('google');
              promptGoogle();
            }}
            disabled={!googleRequest || loadingProvider !== null}
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
            onPress={() => {
              setError(null);
              setLoadingProvider('microsoft');
              promptMicrosoft();
            }}
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
    color: 'red',
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
