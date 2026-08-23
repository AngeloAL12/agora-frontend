import PreferencesScreen from '@/app/preferences';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

const mockDeleteMyAccount = jest.fn();
const mockLogout = jest.fn();
const mockRouterReplace = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    replace: (...args: unknown[]) => mockRouterReplace(...args),
  },
  Stack: {
    Screen: () => null,
  },
}));

jest.mock('expo-image', () => ({
  Image: () => null,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('react-native-safe-area-context', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');

  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    token: 'access-token',
    refreshToken: 'refresh-token',
    logout: mockLogout,
    isDemoMode: false,
  }),
}));

jest.mock('@/lib/preferencesStorage', () => ({
  normalizeHomeScreen: (value: string | undefined) => value,
  readPreferences: jest.fn().mockResolvedValue({
    notificationsEnabled: true,
    homeScreen: 'complaints',
  }),
  savePreferences: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/services/authService', () => ({
  deleteMyAccount: (...args: unknown[]) => mockDeleteMyAccount(...args),
}));

jest.mock('@/components/SuccessBottomSheet', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/ConfirmBottomSheet', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pressable, Text, View } = require('react-native');

  const MockConfirmSheet = React.forwardRef(function MockConfirmSheet(
    props: {
      confirmLabel: string;
      errorMessage?: string | null;
      onConfirm?: () => void;
    },
    _ref: unknown,
  ) {
    return (
      <View>
        <Pressable onPress={props.onConfirm}>
          <Text>{props.confirmLabel}</Text>
        </Pressable>
        {props.errorMessage ? <Text>{props.errorMessage}</Text> : null}
      </View>
    );
  });

  return {
    __esModule: true,
    default: MockConfirmSheet,
  };
});

describe('PreferencesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteMyAccount.mockResolvedValue(undefined);
    mockLogout.mockResolvedValue(undefined);
  });

  it('elimina la cuenta, limpia la sesión y vuelve al inicio', async () => {
    const { findByText, getByText } = render(<PreferencesScreen />);

    expect(await findByText('Eliminar cuenta')).toBeTruthy();
    fireEvent.press(getByText('Sí, eliminar cuenta'));

    await waitFor(() => {
      expect(mockDeleteMyAccount).toHaveBeenCalledWith(
        'access-token',
        expect.objectContaining({ refreshToken: 'refresh-token' }),
      );
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockRouterReplace).toHaveBeenCalledWith('/');
    });
  });
});
