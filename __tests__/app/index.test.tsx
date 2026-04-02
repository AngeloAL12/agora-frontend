import { render } from '@testing-library/react-native';
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

const { useAuth } = require('@/context/AuthContext');

describe('Index Screen', () => {
  it('renders blank view while loading', () => {
    useAuth.mockReturnValue({ token: null, isLoading: true });
    const { queryByTestId } = render(<Index />);
    expect(queryByTestId('redirect')).toBeNull();
  });

  it('redirects to home when token and career exist', () => {
    useAuth.mockReturnValue({
      token: 'jwt-token',
      user: { id_career: 1 },
      isLoading: false,
    });
    const { getByTestId } = render(<Index />);
    expect(getByTestId('redirect').props.children).toBe('/(tabs)/home');
  });

  it('redirects to career selection when token exists but no career', () => {
    useAuth.mockReturnValue({
      token: 'jwt-token',
      user: { id_career: null },
      isLoading: false,
    });
    const { getByTestId } = render(<Index />);
    expect(getByTestId('redirect').props.children).toBe('/career');
  });

  it('redirects to onboarding when no token', () => {
    useAuth.mockReturnValue({ token: null, isLoading: false });
    const { getByTestId } = render(<Index />);
    expect(getByTestId('redirect').props.children).toBe('/auth/onboarding');
  });
});
