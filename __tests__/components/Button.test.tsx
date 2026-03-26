import { render } from '@testing-library/react-native';
import React from 'react';
import { Button } from '../../components/Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button text="Submit" onPress={() => {}} />);
    expect(getByText('Submit')).toBeTruthy();
  });
});
