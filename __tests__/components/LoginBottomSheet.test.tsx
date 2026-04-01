import { act, fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { exchangeCodeAsync } from 'expo-auth-session';
import { router } from 'expo-router';
import { loginWithGoogle, loginWithMicrosoft } from '@/services/authService';
import LoginBottomSheet from '../../components/LoginBottomSheet';

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

let mockGoogleResponse: unknown = null;
let mockMicrosoftResponse: unknown = null;
let mockGoogleRequest: unknown = { codeVerifier: 'verifier123' };
let mockMicrosoftRequest: unknown = { codeVerifier: 'msVerifier123' };

jest.mock('expo-auth-session', () => ({
  ResponseType: { Code: 'code' },
  makeRedirectUri: jest.fn((_options?: unknown) => 'agorafrontend://auth'),
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

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
}));

jest.mock('@gorhom/bottom-sheet', () => {
  const { forwardRef } = require('react');
  const { View } = require('react-native');

  const BottomSheetModal = forwardRef(
    ({ children }: { children: React.ReactNode }, _ref: unknown) => (
      <View>{children}</View>
    ),
  );
  BottomSheetModal.displayName = 'BottomSheetModal';

  const BottomSheetView = ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  );
  BottomSheetView.displayName = 'BottomSheetView';

  const BottomSheetBackdrop = () => null;
  BottomSheetBackdrop.displayName = 'BottomSheetBackdrop';

  const BottomSheetModalProvider = ({
    children,
  }: {
    children: React.ReactNode;
  }) => <View>{children}</View>;
  BottomSheetModalProvider.displayName = 'BottomSheetModalProvider';

  return {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetBackdrop,
    BottomSheetModalProvider,
  };
});

function renderSheet() {
  const ref = React.createRef<BottomSheetModal>();
  return render(<LoginBottomSheet ref={ref} />);
}

describe('LoginBottomSheet', () => {
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
      logout: jest.fn(),
      startAuthentication: jest.fn(),
      finishAuthentication: jest.fn(),
    });
  });

  it('renders Google and Microsoft buttons', () => {
    const { getByText } = renderSheet();
    expect(getByText('Continuar con Google')).toBeTruthy();
    expect(getByText('Continuar con Microsoft')).toBeTruthy();
  });

  it('pressing Google button calls promptGoogle and shows loading only on Google button', () => {
    const { getByText, queryByText } = renderSheet();
    fireEvent.press(getByText('Continuar con Google'));
    expect(mockPromptGoogle).toHaveBeenCalledTimes(1);
    expect(getByText('Cargando...')).toBeTruthy();
    expect(queryByText('Continuar con Google')).toBeNull();
    expect(getByText('Continuar con Microsoft')).toBeTruthy();
  });

  it('pressing Microsoft button calls promptMicrosoft', () => {
    const { getByText } = renderSheet();
    fireEvent.press(getByText('Continuar con Microsoft'));
    expect(mockPromptMicrosoft).toHaveBeenCalledTimes(1);
  });

  it('googleResponse success with valid code exchanges token and navigates home', async () => {
    (exchangeCodeAsync as jest.Mock).mockResolvedValue({
      idToken: 'google-id-token',
    });
    (loginWithGoogle as jest.Mock).mockResolvedValue({
      access_token: 'jwt',
      token_type: 'bearer',
      user: { id: 1, email: 'a@itmexicali.edu.mx', name: 'A' },
    });

    mockGoogleResponse = { type: 'success', params: { code: 'auth-code' } };

    renderSheet();

    // Let useEffect fire and exchangeCodeAsync run
    await act(async () => {});
    expect(exchangeCodeAsync).toHaveBeenCalled();

    // Let loginWithGoogle and router.replace run
    await act(async () => {});
    expect(loginWithGoogle).toHaveBeenCalledWith('google-id-token');
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/home');
  });

  it('googleResponse success without code sets error', async () => {
    mockGoogleResponse = { type: 'success', params: {} };

    const { getByText } = renderSheet();
    await act(async () => {});

    expect(getByText('No se pudo obtener el token de Google.')).toBeTruthy();
  });

  it('googleResponse success without codeVerifier sets error', async () => {
    mockGoogleRequest = null;
    mockGoogleResponse = { type: 'success', params: { code: 'auth-code' } };

    const { getByText } = renderSheet();
    await act(async () => {});

    expect(getByText('No se pudo obtener el token de Google.')).toBeTruthy();
  });

  it('googleResponse type error sets error message', async () => {
    mockGoogleResponse = { type: 'error' };

    const { getByText } = renderSheet();
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

    renderSheet();
    await act(async () => {});
    expect(exchangeCodeAsync).toHaveBeenCalled();
    await act(async () => {});

    expect(loginWithMicrosoft).toHaveBeenCalledWith('ms-id-token');
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/home');
  });

  it('microsoftResponse success without code sets error', async () => {
    mockMicrosoftResponse = { type: 'success', params: {} };

    const { getByText } = renderSheet();
    await act(async () => {});

    expect(getByText('No se pudo obtener el token de Microsoft.')).toBeTruthy();
  });

  it('microsoftResponse success without codeVerifier sets error', async () => {
    mockMicrosoftRequest = null;
    mockMicrosoftResponse = {
      type: 'success',
      params: { code: 'ms-auth-code' },
    };

    const { getByText } = renderSheet();
    await act(async () => {});

    expect(getByText('No se pudo obtener el token de Microsoft.')).toBeTruthy();
  });

  it('microsoftResponse exchangeCodeAsync failure sets error', async () => {
    (exchangeCodeAsync as jest.Mock).mockRejectedValue(
      new Error('exchange failed'),
    );
    mockMicrosoftResponse = {
      type: 'success',
      params: { code: 'ms-auth-code' },
    };

    const { getByText } = renderSheet();
    await act(async () => {});

    expect(
      getByText('Error al intercambiar el token de Microsoft.'),
    ).toBeTruthy();
  });

  it('microsoftResponse success without idToken in exchange result sets error', async () => {
    (exchangeCodeAsync as jest.Mock).mockResolvedValue({ idToken: null });
    mockMicrosoftResponse = {
      type: 'success',
      params: { code: 'ms-auth-code' },
    };

    const { getByText } = renderSheet();
    await act(async () => {});

    expect(
      getByText('No se pudo obtener el id_token de Microsoft.'),
    ).toBeTruthy();
  });

  it('microsoftResponse type error sets error message', async () => {
    mockMicrosoftResponse = { type: 'error' };

    const { getByText } = renderSheet();
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

    const { getByText } = renderSheet();
    await act(async () => {});
    await act(async () => {});

    expect(
      getByText('No se pudo conectar al servidor. Verifica tu conexión.'),
    ).toBeTruthy();
  });

  it('googleResponse exchangeCodeAsync failure sets error', async () => {
    (exchangeCodeAsync as jest.Mock).mockRejectedValue(
      new Error('exchange failed'),
    );

    mockGoogleResponse = { type: 'success', params: { code: 'auth-code' } };

    const { getByText } = renderSheet();
    await act(async () => {});

    expect(getByText('Error al intercambiar el token de Google.')).toBeTruthy();
  });

  it('googleResponse success without idToken in exchange result sets error', async () => {
    (exchangeCodeAsync as jest.Mock).mockResolvedValue({ idToken: null });

    mockGoogleResponse = { type: 'success', params: { code: 'auth-code' } };

    const { getByText } = renderSheet();
    await act(async () => {});

    expect(getByText('No se pudo obtener el id_token de Google.')).toBeTruthy();
  });
});
