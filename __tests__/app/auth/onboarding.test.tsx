import { act, fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Linking } from 'react-native';

import { loginWithGoogle, loginWithMicrosoft } from '@/services/authService';
import { exchangeCodeAsync } from 'expo-auth-session';
import { router } from 'expo-router';
import Onboarding from '../../../app/auth/onboarding';

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

(globalThis as Record<string, unknown>).requestAnimationFrame = (
  cb: FrameRequestCallback,
) => {
  cb(0);
  return 0;
};

const mockPromptGoogle = jest.fn();
const mockPromptMicrosoft = jest.fn();
const mockStartAuthentication = jest.fn();
const mockFinishAuthentication = jest.fn();

let mockGoogleResponse: unknown = null;
let mockMicrosoftResponse: unknown = null;
let mockGoogleRequest: unknown = { codeVerifier: 'verifier123' };
let mockMicrosoftRequest: unknown = { codeVerifier: 'msVerifier123' };

jest.mock('expo-auth-session', () => ({
  ResponseType: { Code: 'code' },
  makeRedirectUri: jest.fn((_options?: unknown) => 'ag0ra://auth'),
  // Distinguish Google vs Microsoft by the discovery tokenEndpoint
  useAuthRequest: jest.fn(
    (_config: unknown, discovery: { tokenEndpoint?: string }) => {
      const isGoogle = discovery?.tokenEndpoint?.includes('googleapis');
      if (isGoogle) {
        return [mockGoogleRequest, mockGoogleResponse, mockPromptGoogle];
      }
      return [mockMicrosoftRequest, mockMicrosoftResponse, mockPromptMicrosoft];
    },
  ),
  exchangeCodeAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

const mockLogin = jest.fn();
// useAuth must return a STABLE reference so handleLoginResponse's useCallback
// dep on `auth` doesn't change on every re-render (which would cause infinite loops)
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/services/authService', () => ({
  loginWithGoogle: jest.fn(),
  loginWithMicrosoft: jest.fn(),
}));

jest.mock('expo-image', () => ({
  Image: () => null,
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
    SafeAreaView: ({ children, style, ...props }: any) => (
      <View style={style} {...props}>
        {children}
      </View>
    ),
  };
});

jest.mock('react-native-reanimated', () => ({
  useAnimatedReaction: jest.fn(),
  runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
  useSharedValue: (val: unknown) => ({ value: val }),
}));

function renderOnboarding() {
  return render(<Onboarding />);
}

describe('Onboarding Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGoogleResponse = null;
    mockMicrosoftResponse = null;
    mockGoogleRequest = { codeVerifier: 'verifier123' };
    mockMicrosoftRequest = { codeVerifier: 'msVerifier123' };
    mockLogin.mockResolvedValue(undefined);
    // Return the same stable object reference every call so that `auth` never
    // changes between renders, keeping `handleLoginResponse` stable
    const { useAuth } = jest.requireMock('@/context/AuthContext');
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      token: null,
      user: null,
      isLoading: false,
      isAuthenticating: false,
      authError: null,
      logout: jest.fn(),
      startAuthentication: mockStartAuthentication,
      finishAuthentication: mockFinishAuthentication,
      setAuthError: jest.fn(),
    });
  });

  it('renders Google and Microsoft buttons', () => {
    const { getByText } = renderOnboarding();
    expect(getByText('Continuar con Google')).toBeTruthy();
    expect(getByText('Continuar con Microsoft')).toBeTruthy();
  });

  it('opens support, terms, and privacy links', () => {
    const openURLSpy = jest
      .spyOn(Linking, 'openURL')
      .mockResolvedValue(true as never);
    const { getByText } = renderOnboarding();

    fireEvent.press(getByText('¿Problemas para iniciar sesión?'));
    fireEvent.press(getByText('Términos de Servicio'));
    fireEvent.press(getByText('Privacidad'));

    expect(openURLSpy).toHaveBeenNthCalledWith(1, 'https://ag0ra.pro/soporte');
    expect(openURLSpy).toHaveBeenNthCalledWith(2, 'https://ag0ra.pro/terminos');
    expect(openURLSpy).toHaveBeenNthCalledWith(
      3,
      'https://ag0ra.pro/privacidad',
    );

    openURLSpy.mockRestore();
  });

  it('pressing Google button calls promptGoogle and shows loading only on Google button', () => {
    const { getByText, queryByText } = renderOnboarding();
    fireEvent.press(getByText('Continuar con Google'));
    expect(mockPromptGoogle).toHaveBeenCalledTimes(1);
    expect(getByText('Cargando...')).toBeTruthy();
    expect(queryByText('Continuar con Google')).toBeNull();
    expect(getByText('Continuar con Microsoft')).toBeTruthy();
  });

  it('pressing Microsoft button calls promptMicrosoft', () => {
    const { getByText } = renderOnboarding();
    fireEvent.press(getByText('Continuar con Microsoft'));
    expect(mockPromptMicrosoft).toHaveBeenCalledTimes(1);
  });

  it('google cancel response clears loading state', async () => {
    const { getByText, rerender } = renderOnboarding();

    fireEvent.press(getByText('Continuar con Google'));
    expect(getByText('Cargando...')).toBeTruthy();

    mockGoogleResponse = { type: 'cancel' };
    rerender(<Onboarding />);
    await act(async () => {});

    expect(getByText('Continuar con Google')).toBeTruthy();
    expect(mockFinishAuthentication).toHaveBeenCalled();
  });

  it('microsoft dismiss response clears loading state', async () => {
    const { getByText, rerender } = renderOnboarding();

    fireEvent.press(getByText('Continuar con Microsoft'));
    expect(getByText('Cargando...')).toBeTruthy();

    mockMicrosoftResponse = { type: 'dismiss' };
    rerender(<Onboarding />);
    await act(async () => {});

    expect(getByText('Continuar con Microsoft')).toBeTruthy();
    expect(mockFinishAuthentication).toHaveBeenCalled();
  });

  it('googleResponse success with valid code exchanges token and navigates map', async () => {
    (exchangeCodeAsync as jest.Mock).mockResolvedValue({
      idToken: 'google-id-token',
    });
    (loginWithGoogle as jest.Mock).mockResolvedValue({
      access_token: 'jwt',
      token_type: 'bearer',
      user: { id: 1, email: 'a@itmexicali.edu.mx', name: 'A' },
    });

    mockGoogleResponse = { type: 'success', params: { code: 'auth-code' } };

    renderOnboarding();

    // Let useEffect fire and exchangeCodeAsync run
    await act(async () => {});
    expect(exchangeCodeAsync).toHaveBeenCalled();

    // Let loginWithGoogle and router.replace run
    await act(async () => {});
    expect(loginWithGoogle).toHaveBeenCalledWith('google-id-token');
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/map');
  });

  it('googleResponse success without code sets error', async () => {
    mockGoogleResponse = { type: 'success', params: {} };

    const { getByText } = renderOnboarding();
    await act(async () => {});

    expect(getByText('No se pudo obtener el token de Google.')).toBeTruthy();
  });

  it('googleResponse success without codeVerifier sets error', async () => {
    mockGoogleRequest = null;
    mockGoogleResponse = { type: 'success', params: { code: 'auth-code' } };

    const { getByText } = renderOnboarding();
    await act(async () => {});

    expect(getByText('No se pudo obtener el token de Google.')).toBeTruthy();
  });

  it('googleResponse type error sets error message', async () => {
    mockGoogleResponse = { type: 'error' };

    const { getByText } = renderOnboarding();
    await act(async () => {});

    expect(
      getByText('Error al iniciar sesión con Google. Inténtalo de nuevo.'),
    ).toBeTruthy();
  });

  it('microsoftResponse success with valid code exchanges token and navigates', async () => {
    (exchangeCodeAsync as jest.Mock).mockResolvedValue({
      idToken: 'ms-id-token',
    });
    (loginWithMicrosoft as jest.Mock).mockResolvedValue({
      access_token: 'jwt',
      token_type: 'bearer',
      user: { id: 2, email: 'b@mexicali.tecnm.mx', name: 'B' },
    });

    mockMicrosoftResponse = {
      type: 'success',
      params: { code: 'ms-auth-code' },
    };

    renderOnboarding();
    await act(async () => {});
    expect(exchangeCodeAsync).toHaveBeenCalled();
    await act(async () => {});

    expect(loginWithMicrosoft).toHaveBeenCalledWith('ms-id-token');
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/map');
  });

  it('microsoftResponse success without code sets error', async () => {
    mockMicrosoftResponse = { type: 'success', params: {} };

    const { getByText } = renderOnboarding();
    await act(async () => {});

    expect(getByText('No se pudo obtener el token de Microsoft.')).toBeTruthy();
  });

  it('microsoftResponse success without codeVerifier sets error', async () => {
    mockMicrosoftRequest = null;
    mockMicrosoftResponse = {
      type: 'success',
      params: { code: 'ms-auth-code' },
    };

    const { getByText } = renderOnboarding();
    await act(async () => {});

    expect(getByText('No se pudo obtener el token de Microsoft.')).toBeTruthy();
  });

  it('microsoftResponse exchangeCodeAsync failure sets error', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (exchangeCodeAsync as jest.Mock).mockRejectedValue(
      new Error('exchange failed'),
    );
    mockMicrosoftResponse = {
      type: 'success',
      params: { code: 'ms-auth-code' },
    };

    const { getByText } = renderOnboarding();
    await act(async () => {});

    expect(
      getByText(
        'Error al intercambiar el token de Microsoft. Detalle: exchange failed',
      ),
    ).toBeTruthy();
    errorSpy.mockRestore();
  });

  it('microsoftResponse success without idToken in exchange result sets error', async () => {
    (exchangeCodeAsync as jest.Mock).mockResolvedValue({ idToken: null });
    mockMicrosoftResponse = {
      type: 'success',
      params: { code: 'ms-auth-code' },
    };

    const { getByText } = renderOnboarding();
    await act(async () => {});

    expect(
      getByText('No se pudo obtener el id_token de Microsoft.'),
    ).toBeTruthy();
  });

  it('microsoftResponse type error sets error message', async () => {
    mockMicrosoftResponse = { type: 'error' };

    const { getByText } = renderOnboarding();
    await act(async () => {});

    expect(
      getByText('Error al iniciar sesión con Microsoft. Inténtalo de nuevo.'),
    ).toBeTruthy();
  });

  it('network error in handleLoginResponse shows connection error', async () => {
    const networkError = new TypeError('Network request failed');
    (exchangeCodeAsync as jest.Mock).mockResolvedValue({
      idToken: 'google-id-token',
    });
    (loginWithGoogle as jest.Mock).mockRejectedValue(networkError);

    mockGoogleResponse = { type: 'success', params: { code: 'auth-code' } };

    const { getByText } = renderOnboarding();
    await act(async () => {});
    await act(async () => {});

    expect(
      getByText('No se pudo conectar al servidor. Verifica tu conexión.'),
    ).toBeTruthy();
  });

  it('googleResponse exchangeCodeAsync failure sets error', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (exchangeCodeAsync as jest.Mock).mockRejectedValue(
      new Error('exchange failed'),
    );

    mockGoogleResponse = { type: 'success', params: { code: 'auth-code' } };

    const { getByText } = renderOnboarding();
    await act(async () => {});

    expect(getByText('Error al intercambiar el token de Google.')).toBeTruthy();
    errorSpy.mockRestore();
  });

  it('googleResponse success without idToken in exchange result sets error', async () => {
    (exchangeCodeAsync as jest.Mock).mockResolvedValue({ idToken: null });

    mockGoogleResponse = { type: 'success', params: { code: 'auth-code' } };

    const { getByText } = renderOnboarding();
    await act(async () => {});

    expect(getByText('No se pudo obtener el id_token de Google.')).toBeTruthy();
  });
});
