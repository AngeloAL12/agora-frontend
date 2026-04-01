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
  googleReady: boolean;
};

function isRunningInExpoGo(): boolean {
  return Constants.executionEnvironment === 'storeClient';
}

export function useSocialLogin(): UseSocialLoginReturn {
  const auth = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastHandledGoogleCodeRef = useRef<string | null>(null);
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
          router.replace('/(tabs)/home');
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
    [auth],
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
      } catch (err) {
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
    }
  }, [auth, googleResponse, googleRequest, handleGoogleAuthorizationCode]);

  useEffect(() => {
    const maybeHandleGoogleUrl = (url: string | null) => {
      if (!url || !url.startsWith(googleRedirectUri)) {
        return;
      }

      const { queryParams } = Linking.parse(url);
      const code =
        typeof queryParams?.code === 'string' ? queryParams.code : null;

      if (code) {
        handleGoogleAuthorizationCode(code);
      }
    };

    Linking.getInitialURL().then(maybeHandleGoogleUrl);

    const subscription = Linking.addEventListener('url', ({ url }) => {
      maybeHandleGoogleUrl(url);
    });

    return () => subscription.remove();
  }, [googleRedirectUri, handleGoogleAuthorizationCode]);

  useEffect(() => {
    if (microsoftResponse?.type === 'success') {
      const code = microsoftResponse.params?.code;
      if (!code || !microsoftRequest?.codeVerifier) {
        auth.finishAuthentication();
        setError('No se pudo obtener el token de Microsoft.');
        setLoadingProvider(null);
        return;
      }

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
        .catch(() => {
          auth.finishAuthentication();
          setError('Error al intercambiar el token de Microsoft.');
          setLoadingProvider(null);
        });
    } else if (microsoftResponse?.type === 'error') {
      auth.finishAuthentication();
      setError('Error al iniciar sesión con Microsoft. Inténtalo de nuevo.');
      setLoadingProvider(null);
    }
  }, [auth, microsoftResponse, microsoftRequest, handleLoginResponse]);

  const handleGooglePress = useCallback(() => {
    if (Platform.OS === 'android' && isRunningInExpoGo()) {
      setError(
        'Google Sign-In no funciona en Expo Go para Android. Usa una development build.',
      );
      auth.finishAuthentication();
      setLoadingProvider(null);
      return;
    }

    setError(null);
    auth.startAuthentication();
    setLoadingProvider('google');
    promptGoogle();
  }, [auth, googleClientId, googleRedirectUri, promptGoogle]);

  const handleMicrosoftPress = useCallback(() => {
    if (Platform.OS === 'android' && isRunningInExpoGo()) {
      setError(
        'El login social no funciona en Expo Go para Android. Usa una development build.',
      );
      auth.finishAuthentication();
      setLoadingProvider(null);
      return;
    }

    setError(null);
    auth.startAuthentication();
    setLoadingProvider('microsoft');
    promptMicrosoft();
  }, [auth, promptMicrosoft]);

  return {
    loadingProvider,
    error,
    handleGooglePress,
    handleMicrosoftPress,
    googleReady: !!googleRequest,
  };
}
