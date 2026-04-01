import { render } from '@testing-library/react-native';
import React from 'react';
import { Badge } from '../../components/Badge';

describe('Badge Component', () => {
  it('renders member variant', () => {
    const { getByText } = render(<Badge label="Member" />);
    expect(getByText('Member')).toBeTruthy();
  });

  it('renders join variant', () => {
    const { getByText } = render(<Badge label="Join" variant="join" />);
    expect(getByText('Join')).toBeTruthy();
  });
});
