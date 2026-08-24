import { InfoCard } from '@/components/complaint/InfoCard';
import { REPORT_BUILDINGS } from '@/constants/complaint';
import { render } from '@testing-library/react-native';
import React from 'react';

describe('InfoCard Component', () => {
  it('debe mapear el id_building al nombre real del edificio', () => {
    const testBuilding = REPORT_BUILDINGS[0];

    const mockComplaint = {
      id: 100,
      type: 'REPORT',
      category: 'MAINTENANCE',
      id_building: testBuilding.id,
      classroom: '12',
      description: 'Prueba de mapeo',
      status: 'PENDING',
    };

    const { getByText } = render(<InfoCard complaint={mockComplaint as any} />);

    expect(getByText(new RegExp(testBuilding.label, 'i'))).toBeTruthy();
    expect(getByText(/Aula 12/i)).toBeTruthy();
  });
});
