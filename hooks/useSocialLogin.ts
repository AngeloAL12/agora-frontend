import {
  ResponseType,
  exchangeCodeAsync,
  useAuthRequest,
} from 'expo-auth-session';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_IOS_REDIRECT_URI,
  MICROSOFT_CLIENT_ID,
  googleDiscovery,
  microsoftDiscovery,
} from '@/constants/oauthConfig';
import { useAuth } from '@/context/AuthContext';
import type { ApiError } from '@/services/api';
import {
  LoginResponse,
  loginWithGoogle,
  loginWithMicrosoft,
} from '@/services/authService';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export type Provider = 'google' | 'microsoft';

export type UseSocialLoginReturn = {
  loadingProvider: Provider | null;
  error: string | null;
  handleGooglePress: () => void;
  handleMicrosoftPress: () => void;
  handleDismissError: () => void;
  googleReady: boolean;
};

function isRunningInExpoGo(): boolean {
  return Constants.executionEnvironment === 'storeClient';
}

export function useSocialLogin(): UseSocialLoginReturn {
  const auth = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const error = localError ?? auth.authError;
  const setError = useCallback(
    (err: string | null) => {
      setLocalError(err);
      auth.setAuthError(err);
    },
    [auth],
  );
  const lastHandledGoogleCodeRef = useRef<string | null>(null);
  const lastHandledMicrosoftCodeRef = useRef<string | null>(null);
  const googleClientId = GOOGLE_IOS_CLIENT_ID;
  const googleRedirectUri = GOOGLE_IOS_REDIRECT_URI;

  const [googleRequest, googleResponse, promptGoogle] = useAuthRequest(
    {
      clientId: googleClientId,
      responseType: ResponseType.Code,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: googleRedirectUri,
      usePKCE: true,
    },
    googleDiscovery,
  );

  const microsoftRedirectUri = 'agorafrontend://auth';
  const [microsoftRequest, microsoftResponse, promptMicrosoft] = useAuthRequest(
    {
      clientId: MICROSOFT_CLIENT_ID,
      responseType: 'code',
      scopes: ['openid', 'profile', 'email'],
      redirectUri: microsoftRedirectUri,
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
        requestAnimationFrame(() => {
          router.replace('/(tabs)/map');
        });
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
        auth.finishAuthentication();
        setLoadingProvider(null);
      }
    },
    [auth, setError],
  );

  const handleGoogleAuthorizationCode = useCallback(
    async (code: string) => {
      if (!googleRequest?.codeVerifier) {
        auth.finishAuthentication();
        setError('No se pudo obtener el token de Google.');
        setLoadingProvider(null);
        return;
      }

      if (lastHandledGoogleCodeRef.current === code) {
        return;
      }

      lastHandledGoogleCodeRef.current = code;

      try {
        const tokenResponse = await exchangeCodeAsync(
          {
            clientId: googleClientId,
            code,
            redirectUri: googleRedirectUri,
            extraParams: { code_verifier: googleRequest.codeVerifier },
          },
          { tokenEndpoint: 'https://oauth2.googleapis.com/token' },
        );

        const idToken = tokenResponse.idToken;
        if (!idToken) {
          auth.finishAuthentication();
          setError('No se pudo obtener el id_token de Google.');
          setLoadingProvider(null);
          return;
        }

        await handleLoginResponse(() => loginWithGoogle(idToken));
      } catch {
        auth.finishAuthentication();
        setError('Error al intercambiar el token de Google.');
        setLoadingProvider(null);
      }
    },
    [
      auth,
      googleClientId,
      googleRedirectUri,
      googleRequest,
      handleLoginResponse,
      setError,
    ],
  );

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const code = googleResponse.params?.code;
      if (!code || !googleRequest?.codeVerifier) {
        auth.finishAuthentication();
        setError('No se pudo obtener el token de Google.');
        setLoadingProvider(null);
        return;
      }
      handleGoogleAuthorizationCode(code);
    } else if (googleResponse?.type === 'error') {
      auth.finishAuthentication();
      setError('Error al iniciar sesión con Google. Inténtalo de nuevo.');
      setLoadingProvider(null);
    } else if (
      (googleResponse?.type === 'cancel' ||
        googleResponse?.type === 'dismiss') &&
      loadingProvider === 'google'
    ) {
      auth.finishAuthentication();
      setLoadingProvider(null);
    }
  }, [
    auth,
    googleResponse,
    googleRequest,
    handleGoogleAuthorizationCode,
    loadingProvider,
    setError,
  ]);

  useEffect(() => {
    const maybeHandleGoogleUrl = (url: string | null) => {
      if (!url || !url.startsWith(googleRedirectUri)) {
        return;
      }

      const { queryParams } = Linking.parse(url);
      const code =
        typeof queryParams?.code === 'string' ? queryParams.code : null;

      if (code) {
        auth.startAuthentication();
        setLoadingProvider('google');
        handleGoogleAuthorizationCode(code);
      }
    };

    Linking.getInitialURL().then(maybeHandleGoogleUrl);

    const subscription = Linking.addEventListener('url', ({ url }) => {
      maybeHandleGoogleUrl(url);
    });

    return () => subscription.remove();
  }, [auth, googleRedirectUri, handleGoogleAuthorizationCode]);

  useEffect(() => {
    if (microsoftResponse?.type === 'success') {
      const code = microsoftResponse.params?.code;
      if (!code || !microsoftRequest?.codeVerifier) {
        auth.finishAuthentication();
        setError('No se pudo obtener el token de Microsoft.');
        setLoadingProvider(null);
        return;
      }

      if (lastHandledMicrosoftCodeRef.current === code) {
        return;
      }
      lastHandledMicrosoftCodeRef.current = code;

      exchangeCodeAsync(
        {
          clientId: MICROSOFT_CLIENT_ID,
          code,
          redirectUri: microsoftRedirectUri,
          extraParams: { code_verifier: microsoftRequest.codeVerifier },
        },
        { tokenEndpoint: microsoftDiscovery.tokenEndpoint },
      )
        .then((tokenResponse) => {
          const idToken = tokenResponse.idToken;
          if (idToken) {
            handleLoginResponse(() => loginWithMicrosoft(idToken));
          } else {
            auth.finishAuthentication();
            setError('No se pudo obtener el id_token de Microsoft.');
            setLoadingProvider(null);
          }
        })
        .catch((exchangeError) => {
          console.error('Microsoft token exchange error:', exchangeError);
          const detail =
            exchangeError instanceof Error
              ? exchangeError.message
              : String(exchangeError);
          auth.finishAuthentication();
          setError(
            `Error al intercambiar el token de Microsoft. Detalle: ${detail}`,
          );
          setLoadingProvider(null);
        });
    } else if (microsoftResponse?.type === 'error') {
      auth.finishAuthentication();
      setError('Error al iniciar sesión con Microsoft. Inténtalo de nuevo.');
      setLoadingProvider(null);
    } else if (
      (microsoftResponse?.type === 'cancel' ||
        microsoftResponse?.type === 'dismiss') &&
      loadingProvider === 'microsoft'
    ) {
      auth.finishAuthentication();
      setLoadingProvider(null);
    }
  }, [
    auth,
    microsoftResponse,
    microsoftRequest,
    handleLoginResponse,
    loadingProvider,
    setError,
  ]);

  const handleDismissError = useCallback(() => {
    setLocalError(null);
    auth.setAuthError(null);
  }, [auth]);

  const handleGooglePress = useCallback(() => {
    if (Platform.OS === 'android' && isRunningInExpoGo()) {
      setError(
        'Google Sign-In no funciona en Expo Go para Android. Usa una development build.',
      );
      auth.finishAuthentication();
      setLoadingProvider(null);
      return;
    }

    auth.startAuthentication();
    setLoadingProvider('google');
    promptGoogle();
  }, [auth, promptGoogle, setError]);

  const handleMicrosoftPress = useCallback(() => {
    if (Platform.OS === 'android' && isRunningInExpoGo()) {
      setError(
        'El login social no funciona en Expo Go para Android. Usa una development build.',
      );
      auth.finishAuthentication();
      setLoadingProvider(null);
      return;
    }

    auth.startAuthentication();
    setLoadingProvider('microsoft');
    promptMicrosoft();
  }, [auth, promptMicrosoft, setError]);

  return {
    loadingProvider,
    error,
    handleGooglePress,
    handleMicrosoftPress,
    handleDismissError,
    googleReady: !!googleRequest,
  };
}
