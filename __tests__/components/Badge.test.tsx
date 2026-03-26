import { render } from '@testing-library/react-native';
import React from 'react';
import { Badge } from '../../components/Badge';

describe('Badge Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Badge label="Member" />);
    expect(getByText('Member')).toBeTruthy();
  });
});
