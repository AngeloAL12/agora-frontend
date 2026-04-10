import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { FloatingTabBar } from '@/components/FloatingTabBar';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock('expo-blur', () => {
  const ReactNative = require('react-native');
  return {
    BlurView: ({ children }: { children: React.ReactNode }) => (
      <ReactNative.View>{children}</ReactNative.View>
    ),
  };
});

jest.mock('expo-image', () => {
  const ReactNative = require('react-native');
  return {
    Image: ({ accessibilityLabel }: { accessibilityLabel?: string }) => (
      <ReactNative.View accessibilityLabel={accessibilityLabel} />
    ),
  };
});

type MockRoute = {
  key: string;
  name: string;
};

function createProps(routeNames: string[]): BottomTabBarProps {
  const routes: MockRoute[] = routeNames.map((name) => ({
    key: `${name}-key`,
    name,
  }));

  const emit = jest.fn(() => ({ defaultPrevented: false }));
  const navigate = jest.fn();

  return {
    state: {
      key: 'tab-state',
      index: 0,
      routeNames,
      routes,
      type: 'tab',
      stale: false,
      history: [],
      preloadedRouteKeys: [],
    },
    descriptors: Object.fromEntries(
      routes.map((route) => [
        route.key,
        {
          key: route.key,
          options: {
            title:
              route.name === 'map'
                ? 'Mapa'
                : route.name === 'ia'
                  ? 'IA'
                  : route.name === 'clubs'
                    ? 'Clubs'
                    : route.name === 'complaints'
                      ? 'Quejas'
                      : route.name === 'profile'
                        ? 'Perfil'
                        : route.name,
          },
          route,
          navigation: {} as unknown as BottomTabBarProps['navigation'],
          render: jest.fn(),
        },
      ]),
    ) as unknown as BottomTabBarProps['descriptors'],
    navigation: {
      emit,
      navigate,
    } as unknown as BottomTabBarProps['navigation'],
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };
}

describe('FloatingTabBar', () => {
  it('navigates when a tab is pressed', () => {
    const props = createProps(['map', 'complaints', 'ia', 'clubs', 'profile']);
    const { getByRole } = render(<FloatingTabBar {...props} />);

    fireEvent.press(getByRole('tab', { name: 'Quejas' }));

    expect(props.navigation.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress', target: 'complaints-key' }),
    );
    expect(props.navigation.navigate).toHaveBeenCalledWith('complaints');
  });

  it('uses friendly accessibility labels and selected state', () => {
    const props = createProps(['map', 'complaints', 'ia', 'clubs', 'profile']);
    const { getByRole } = render(<FloatingTabBar {...props} />);

    const mapTab = getByRole('tab', { name: 'Mapa' });
    const profileTab = getByRole('tab', { name: 'Perfil' });

    expect(mapTab).toBeTruthy();
    expect(profileTab).toBeTruthy();
    expect(mapTab.props.accessibilityState).toEqual({ selected: true });
  });

  it('renders even if a route icon is not mapped', () => {
    const props = createProps([
      'map',
      'complaints',
      'ia',
      'clubs',
      'profile',
      'extra',
    ]);

    const { getByRole } = render(<FloatingTabBar {...props} />);

    expect(getByRole('tab', { name: 'extra' })).toBeTruthy();
  });
});
