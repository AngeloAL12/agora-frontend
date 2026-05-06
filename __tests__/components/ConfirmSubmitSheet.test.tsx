import ConfirmSubmitSheet from '@/components/ConfirmSubmitSheet';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/components/AppBottomSheet', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockSheet = React.forwardRef(function MockSheetComponent(
    props: any,
    ref: any,
  ) {
    return <View>{props.children}</View>;
  });

  MockSheet.displayName = 'AppBottomSheetMock';

  return {
    __esModule: true,
    default: MockSheet,
    AppBottomSheet: MockSheet,
  };
});

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

  it('debe llamar onConfirm al presionar Enviar', () => {
    const mockOnConfirm = jest.fn();

    const { getByText } = render(
      <ConfirmSubmitSheet isLoading={false} onConfirm={mockOnConfirm} />,
    );

    fireEvent.press(getByText('Enviar'));

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('no debe llamar onConfirm al presionar Cancelar', () => {
    const mockOnConfirm = jest.fn();

    const { getByText } = render(
      <ConfirmSubmitSheet isLoading={false} onConfirm={mockOnConfirm} />,
    );

    fireEvent.press(getByText('Cancelar'));

    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
});
