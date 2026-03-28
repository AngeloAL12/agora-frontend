import { render } from '@testing-library/react-native';
import React from 'react';
import { Input } from '../../components/Input';

describe('Input Component', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Search" />);
    expect(getByPlaceholderText('Search')).toBeTruthy();
  });
});
