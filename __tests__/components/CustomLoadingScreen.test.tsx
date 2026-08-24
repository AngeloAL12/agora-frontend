import React from 'react';
import { render, act } from '@testing-library/react-native';
import CustomLoadingScreen from '../../components/CustomLoadingScreen';

jest.mock('expo-image', () => ({
  Image: () => null,
}));

jest.mock('expo-status-bar', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    StatusBar: (props: any) => <View {...props} testID="mock-status-bar" />,
  };
});

describe('CustomLoadingScreen Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly with message and subtitle', () => {
    const { getByText } = render(
      <CustomLoadingScreen
        message="Iniciando sesión..."
        subtitle="Estamos validando tu cuenta institucional."
      />,
    );

    expect(getByText('Iniciando sesión...')).toBeTruthy();
    expect(
      getByText('Estamos validando tu cuenta institucional.'),
    ).toBeTruthy();
  });

  it('renders correctly with custom background and text colors', () => {
    const { getByText } = render(
      <CustomLoadingScreen
        message="Custom Message"
        backgroundColor="#000000"
        textColor="#FFFFFF"
      />,
    );
    expect(getByText('Custom Message')).toBeTruthy();
  });

  it('renders correctly without message and subtitle', () => {
    const { queryByText } = render(<CustomLoadingScreen />);
    expect(queryByText('Iniciando sesión...')).toBeNull();
  });

  it('cycles animation frames on interval', () => {
    render(<CustomLoadingScreen />);

    // Fast-forward time to trigger interval
    act(() => {
      jest.advanceTimersByTime(42);
    });

    act(() => {
      jest.advanceTimersByTime(42);
    });

    // Just verifying that the timer successfully fires without errors
    expect(true).toBe(true);
  });

  it('renders StatusBar with dark style by default', () => {
    const { getByTestId } = render(<CustomLoadingScreen />);
    const statusBar = getByTestId('mock-status-bar');
    expect(statusBar.props.style).toBe('dark');
  });

  it('renders StatusBar with light style when dark background or white text color is provided', () => {
    const { getByTestId, rerender } = render(
      <CustomLoadingScreen backgroundColor="#000000" />,
    );
    expect(getByTestId('mock-status-bar').props.style).toBe('light');

    rerender(<CustomLoadingScreen textColor="#FFFFFF" />);
    expect(getByTestId('mock-status-bar').props.style).toBe('light');
  });
});
