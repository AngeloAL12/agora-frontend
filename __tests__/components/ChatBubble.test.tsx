import { ChatBubble } from '@/components/ia/ChatBubble';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

jest.mock('expo-image', () => ({
  Image: () => null,
}));

jest.mock('react-native-markdown-display', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) =>
      React.createElement(Text, null, children),
  };
});

describe('ChatBubble', () => {
  it('abre las opciones al mantener presionado un mensaje ajeno', () => {
    const onMessageLongPress = jest.fn();
    const { getByLabelText } = render(
      <ChatBubble
        sender="assistant"
        senderName="Ana"
        message="Mensaje de prueba"
        onMessageLongPress={onMessageLongPress}
      />,
    );

    const bubble = getByLabelText('Mensaje de Ana: Mensaje de prueba');
    fireEvent(bubble, 'longPress');

    expect(onMessageLongPress).toHaveBeenCalledTimes(1);
  });

  it('no convierte los mensajes propios en acciones reportables', () => {
    const { queryByLabelText, getByText } = render(
      <ChatBubble sender="user" senderName="Tú" message="Mi mensaje" />,
    );

    expect(getByText('Mi mensaje')).toBeTruthy();
    expect(queryByLabelText('Mensaje de Tú: Mi mensaje')).toBeNull();
  });
});
