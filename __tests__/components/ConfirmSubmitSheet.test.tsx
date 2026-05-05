import ConfirmSubmitSheet from '@/components/ConfirmSubmitSheet';
import { render } from '@testing-library/react-native';
import React from 'react';

describe('ConfirmSubmitSheet Component', () => {
  it('debe mostrar el estado de carga (Enviando...) correctamente', () => {
    const mockOnConfirm = jest.fn();

    const { getByText } = render(
      <ConfirmSubmitSheet isLoading={true} onConfirm={mockOnConfirm} />,
    );

    expect(getByText('Enviando...')).toBeTruthy();
  });

  it('debe mostrar el texto normal (Enviar) cuando no está cargando', () => {
    const mockOnConfirm = jest.fn();

    const { getByText } = render(
      <ConfirmSubmitSheet isLoading={false} onConfirm={mockOnConfirm} />,
    );

    expect(getByText('Enviar')).toBeTruthy();
  });
});
