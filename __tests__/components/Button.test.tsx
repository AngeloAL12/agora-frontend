import { render } from '@testing-library/react-native';
import React from 'react';
import { Button } from '../../components/Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button text="Submit" onPress={() => {}} />);
    expect(getByText('Submit')).toBeTruthy();
  });

  it('renders different variants and sizes', () => {
    render(
      <Button
        text="Secondary"
        variant="secondary"
        disabled
        onPress={() => {}}
      />,
    );
    render(<Button text="Small" size="small" onPress={() => {}} />);
    render(<Button text="Large" size="large" fullWidth onPress={() => {}} />);
  });
});
