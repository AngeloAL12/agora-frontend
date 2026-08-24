import ConfirmBottomSheet from '@/components/ConfirmBottomSheet';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/components/AppBottomSheet', () => {
  // Jest requiere dependencias locales dentro de la fábrica del mock.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');

  const MockSheet = React.forwardRef(function MockSheetComponent(
    props: { children: React.ReactNode },
    _ref: unknown,
  ) {
    return <View>{props.children}</View>;
  });

  return {
    __esModule: true,
    default: MockSheet,
  };
});

describe('ConfirmBottomSheet', () => {
  it('muestra el error y permite reintentar', () => {
    const onConfirm = jest.fn();
    const { getByText } = render(
      <ConfirmBottomSheet
        title="¿Eliminar cuenta?"
        message="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        errorMessage="No se pudo eliminar la cuenta."
        onConfirm={onConfirm}
      />,
    );

    expect(getByText('No se pudo eliminar la cuenta.')).toBeTruthy();
    fireEvent.press(getByText('Eliminar'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('deshabilita las acciones mientras está procesando', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const { getByText, getAllByRole } = render(
      <ConfirmBottomSheet
        title="¿Eliminar cuenta?"
        message="Esta acción no se puede deshacer."
        cancelLabel="Cancelar"
        isLoading
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    const actions = getAllByRole('button', { disabled: true });
    expect(actions).toHaveLength(2);
    fireEvent.press(getByText('Cancelar'));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });
});
