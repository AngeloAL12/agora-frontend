import { render } from '@testing-library/react-native';
import React from 'react';
import { Button } from '../../components/Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button text="Submit" onPress={() => {}} />);
    expect(getByText('Submit')).toBeTruthy();
  });

  it('renders different variants and sizes', () => {
    const { getByText: getSecondary } = render(
      <Button
        text="Secondary"
        variant="secondary"
        disabled
        onPress={() => {}}
      />,
    );
    expect(getSecondary('Secondary')).toBeTruthy();

    const { getByText: getSmall } = render(
      <Button text="Small" size="small" onPress={() => {}} />,
    );
    expect(getSmall('Small')).toBeTruthy();

    const { getByText: getLarge } = render(
      <Button text="Large" size="large" fullWidth onPress={() => {}} />,
    );
    expect(getLarge('Large')).toBeTruthy();
  });
});
