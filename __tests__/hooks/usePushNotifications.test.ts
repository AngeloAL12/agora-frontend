import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { usePushNotifications } from '../../hooks/usePushNotifications';

let mockIsDevice = true;
let mockPlatformOS: 'ios' | 'android' = 'ios';

jest.mock('expo-device', () => ({
  get isDevice() {
    return mockIsDevice;
  },
}));

jest.mock('expo-notifications', () => ({
  AndroidImportance: { MAX: 5 },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { extra: { eas: { projectId: 'test-project-id' } } },
    easConfig: undefined,
  },
}));

jest.mock('react-native', () => ({
  Platform: {
    get OS() {
      return mockPlatformOS;
    },
  },
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

const mockSetNotificationHandler =
  Notifications.setNotificationHandler as jest.Mock;
const mockSetNotificationChannel =
  Notifications.setNotificationChannelAsync as jest.Mock;
const mockGetPermissions = Notifications.getPermissionsAsync as jest.Mock;
const mockRequestPermissions =
  Notifications.requestPermissionsAsync as jest.Mock;
const mockGetToken = Notifications.getExpoPushTokenAsync as jest.Mock;

describe('usePushNotifications', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockIsDevice = true;
    mockPlatformOS = 'ios';

    const mockConstants = jest.requireMock('expo-constants').default;
    delete mockConstants.appOwnership;
    delete mockConstants.executionEnvironment;
    mockConstants.expoConfig.extra.eas.projectId = 'test-project-id';
    mockConstants.easConfig = undefined;
  });

  it('returns null token and status when not a physical device', async () => {
    mockIsDevice = false;
    mockGetPermissions.mockResolvedValueOnce({ status: 'granted' });

    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(result.current.expoPushToken).toBeNull();
      expect(result.current.permissionStatus).toBe('granted');
    });
  });

  it('returns null token when permission is denied', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'undetermined' });
    mockRequestPermissions.mockResolvedValueOnce({ status: 'denied' });

    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(result.current.expoPushToken).toBeNull();
      expect(result.current.permissionStatus).toBe('denied');
    });
  });

  it('returns token when permission is already granted', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'granted' });
    mockGetToken.mockResolvedValueOnce({
      data: 'ExponentPushToken[test-token]',
    });

    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(result.current.expoPushToken).toBe(
        'ExponentPushToken[test-token]',
      );
      expect(result.current.permissionStatus).toBe('granted');
    });

    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(mockSetNotificationChannel).not.toHaveBeenCalled();
  });

  it('returns token when permission is granted after request', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'undetermined' });
    mockRequestPermissions.mockResolvedValueOnce({ status: 'granted' });
    mockGetToken.mockResolvedValueOnce({
      data: 'ExponentPushToken[test-token]',
    });

    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(result.current.expoPushToken).toBe(
        'ExponentPushToken[test-token]',
      );
      expect(result.current.permissionStatus).toBe('granted');
    });
  });

  it('falls back to easConfig.projectId when extra.eas.projectId is undefined', async () => {
    const mockConstants = jest.requireMock('expo-constants').default;
    mockConstants.expoConfig.extra.eas.projectId = undefined;
    mockConstants.easConfig = { projectId: 'fallback-project-id' };

    mockGetPermissions.mockResolvedValueOnce({ status: 'granted' });
    mockGetToken.mockResolvedValueOnce({
      data: 'ExponentPushToken[fallback-token]',
    });

    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(result.current.expoPushToken).toBe(
        'ExponentPushToken[fallback-token]',
      );
      expect(result.current.permissionStatus).toBe('granted');
    });

    expect(mockGetToken).toHaveBeenCalledWith({
      projectId: 'fallback-project-id',
    });
  });

  it('configures Android notification channel on Android', async () => {
    mockPlatformOS = 'android';
    mockGetPermissions.mockResolvedValueOnce({ status: 'granted' });
    mockGetToken.mockResolvedValueOnce({
      data: 'ExponentPushToken[android-token]',
    });

    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(result.current.expoPushToken).toBe(
        'ExponentPushToken[android-token]',
      );
      expect(result.current.permissionStatus).toBe('granted');
    });

    expect(mockSetNotificationChannel).toHaveBeenCalledWith('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  });

  it('returns early in Expo Go on Android', async () => {
    mockPlatformOS = 'android';
    const mockConstants = jest.requireMock('expo-constants').default;
    mockConstants.appOwnership = 'expo';

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith(
        '[PushNotifications] Remote push not available in Expo Go on Android. Use a development build.',
      );
      expect(result.current.expoPushToken).toBeNull();
      expect(result.current.permissionStatus).toBeNull();
    });

    expect(mockSetNotificationHandler).not.toHaveBeenCalled();
    expect(mockSetNotificationChannel).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('returns null token when token generation fails', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'granted' });
    mockGetToken.mockRejectedValueOnce(new Error('token failure'));

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(result.current.expoPushToken).toBeNull();
      expect(result.current.permissionStatus).toBe('granted');
    });

    expect(errorSpy).toHaveBeenCalledWith(
      '[PushNotifications] Failed to generate token:',
      expect.any(Error),
    );
    errorSpy.mockRestore();
  });

  it('re-registers when app returns to foreground', async () => {
    mockGetPermissions
      .mockResolvedValueOnce({ status: 'granted' })
      .mockResolvedValueOnce({ status: 'granted' });
    mockGetToken
      .mockResolvedValueOnce({ data: 'ExponentPushToken[token-1]' })
      .mockResolvedValueOnce({ data: 'ExponentPushToken[token-2]' });

    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(result.current.expoPushToken).toBe('ExponentPushToken[token-1]');
    });

    const mockAppState = jest.requireMock('react-native').AppState;
    const changeCallback = mockAppState.addEventListener.mock.calls[0][1];

    act(() => changeCallback('background'));
    act(() => changeCallback('active'));

    await waitFor(() => {
      expect(result.current.expoPushToken).toBe('ExponentPushToken[token-2]');
    });

    expect(mockGetPermissions).toHaveBeenCalledTimes(2);
  });

  it('logs received notification identifier in dev mode', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'granted' });
    mockGetToken.mockResolvedValueOnce({ data: 'ExponentPushToken[test]' });

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled();
    });

    const callback = (
      Notifications.addNotificationReceivedListener as jest.Mock
    ).mock.calls[0][0];
    callback({ request: { identifier: 'notif-123' } });

    expect(logSpy).toHaveBeenCalledWith(
      '[PushNotifications] Notification received: notif-123',
    );
    logSpy.mockRestore();
  });

  it('logs notification response identifier in dev mode', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'granted' });
    mockGetToken.mockResolvedValueOnce({ data: 'ExponentPushToken[test]' });

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(
        Notifications.addNotificationResponseReceivedListener,
      ).toHaveBeenCalled();
    });

    const callback = (
      Notifications.addNotificationResponseReceivedListener as jest.Mock
    ).mock.calls[0][0];
    callback({ notification: { request: { identifier: 'notif-456' } } });

    expect(logSpy).toHaveBeenCalledWith(
      '[PushNotifications] Notification response: notif-456',
    );
    logSpy.mockRestore();
  });

  it('registers a handler with expected notification behavior', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'granted' });
    mockGetToken.mockResolvedValueOnce({
      data: 'ExponentPushToken[test-token]',
    });

    renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(mockSetNotificationHandler).toHaveBeenCalledTimes(1);
    });

    const handlerConfig = mockSetNotificationHandler.mock.calls[0][0];
    await expect(handlerConfig.handleNotification()).resolves.toEqual({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    });
  });
});
