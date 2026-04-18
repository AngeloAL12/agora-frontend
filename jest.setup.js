/* global jest */
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: {
      install: jest.fn(),
    },
    GestureHandlerRootView: ({ children }) =>
      React.createElement(View, null, children),
    State: {},
    PanGestureHandler: ({ children }) =>
      React.createElement(View, null, children),
    TapGestureHandler: ({ children }) =>
      React.createElement(View, null, children),
    LongPressGestureHandler: ({ children }) =>
      React.createElement(View, null, children),
    FlingGestureHandler: ({ children }) =>
      React.createElement(View, null, children),
    ForceTouchGestureHandler: ({ children }) =>
      React.createElement(View, null, children),
    NativeViewGestureHandler: ({ children }) =>
      React.createElement(View, null, children),
    RotationGestureHandler: ({ children }) =>
      React.createElement(View, null, children),
    PinchGestureHandler: ({ children }) =>
      React.createElement(View, null, children),
    DrawerLayout: ({ children }) => React.createElement(View, null, children),
    Swipeable: ({ children }) => React.createElement(View, null, children),
    Directions: {},
  };
});
