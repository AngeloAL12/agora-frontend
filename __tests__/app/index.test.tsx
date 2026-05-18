import { act, render } from '@testing-library/react-native';
import Index from '../../app/index';

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text } = require('react-native');
    return <Text testID="redirect">{href}</Text>;
  },
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/preferencesStorage', () => ({
  readPreferences: jest.fn(),
  normalizeHomeScreen: jest.fn(() => null),
  HOME_ROUTE_BY_KEY: {},
}));

const { useAuth } = require('@/context/AuthContext');
const { readPreferences } = require('@/lib/preferencesStorage');

describe('Index Screen', () => {
  beforeEach(() => {
    readPreferences.mockResolvedValue({ onboardingSeen: true });
  });

  it('renders blank view while loading auth', () => {
    useAuth.mockReturnValue({ token: null, isLoading: true });
    const { queryByTestId } = render(<Index />);
    expect(queryByTestId('redirect')).toBeNull();
  });

  it('renders blank view while preferences are loading', () => {
    readPreferences.mockReturnValue(new Promise(() => {}));
    useAuth.mockReturnValue({ token: null, isLoading: false });
    const { queryByTestId } = render(<Index />);
    expect(queryByTestId('redirect')).toBeNull();
  });

  it('redirects to map when token and career exist', async () => {
    useAuth.mockReturnValue({
      token: 'jwt-token',
      user: { id_career: 1 },
      isLoading: false,
    });
    const { getByTestId } = render(<Index />);
    await act(async () => {});
    expect(getByTestId('redirect').props.children).toBe('/(tabs)/map');
  });

  it('redirects to name setup when token exists but no career', async () => {
    useAuth.mockReturnValue({
      token: 'jwt-token',
      user: { id_career: null },
      isLoading: false,
    });
    const { getByTestId } = render(<Index />);
    await act(async () => {});
    expect(getByTestId('redirect').props.children).toBe('/setup/name');
  });

  it('redirects to onboarding when no token and slides already seen', async () => {
    useAuth.mockReturnValue({ token: null, isLoading: false });
    const { getByTestId } = render(<Index />);
    await act(async () => {});
    expect(getByTestId('redirect').props.children).toBe('/auth/onboarding');
  });

  it('redirects to slides on first launch', async () => {
    readPreferences.mockResolvedValue({ onboardingSeen: false });
    useAuth.mockReturnValue({ token: null, isLoading: false });
    const { getByTestId } = render(<Index />);
    await act(async () => {});
    expect(getByTestId('redirect').props.children).toBe('/auth/slides');
  });
});
