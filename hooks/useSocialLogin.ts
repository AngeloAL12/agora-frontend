import {
  ResponseType,
  exchangeCodeAsync,
  makeRedirectUri,
  useAuthRequest,
} from 'expo-auth-session';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';

import {
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_REDIRECT_URI,
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

WebBrowser.maybeCompleteAuthSession();

export type Provider = 'google' | 'microsoft';

export type UseSocialLoginReturn = {
  loadingProvider: Provider | null;
  error: string | null;
  handleGooglePress: () => void;
  handleMicrosoftPress: () => void;
  googleReady: boolean;
};

export function useSocialLogin(): UseSocialLoginReturn {
  const auth = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [googleRequest, googleResponse, promptGoogle] = useAuthRequest(
    {
      clientId: GOOGLE_IOS_CLIENT_ID,
      responseType: ResponseType.Code,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: GOOGLE_REDIRECT_URI,
      usePKCE: true,
    },
    googleDiscovery,
  );

  const microsoftRedirectUri = makeRedirectUri({ scheme: 'agorafrontend' });
  const [, microsoftResponse, promptMicrosoft] = useAuthRequest(
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
          redirectUri: GOOGLE_REDIRECT_URI,
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

  const handleGooglePress = useCallback(() => {
    setError(null);
    setLoadingProvider('google');
    promptGoogle();
  }, [promptGoogle]);

  const handleMicrosoftPress = useCallback(() => {
    setError(null);
    setLoadingProvider('microsoft');
    promptMicrosoft();
  }, [promptMicrosoft]);

  return {
    loadingProvider,
    error,
    handleGooglePress,
    handleMicrosoftPress,
    googleReady: !!googleRequest,
  };
}
