import { renderHook, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { usePushNotifications } from '../../hooks/usePushNotifications';

let mockIsDevice = true;

jest.mock('expo-device', () => ({
  get isDevice() {
    return mockIsDevice;
  },
}));

jest.mock('expo-notifications', () => ({
  AndroidImportance: { MAX: 5 },
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
}));

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        eas: { projectId: 'test-project-id' },
      },
    },
  },
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

const mockGetPermissions = Notifications.getPermissionsAsync as jest.Mock;
const mockRequestPermissions =
  Notifications.requestPermissionsAsync as jest.Mock;
const mockGetToken = Notifications.getExpoPushTokenAsync as jest.Mock;

describe('usePushNotifications', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns null token and status when not a physical device', async () => {
    mockIsDevice = false;

    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(result.current.expoPushToken).toBeNull();
      expect(result.current.permissionStatus).toBeNull();
    });

    mockIsDevice = true;
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
});
