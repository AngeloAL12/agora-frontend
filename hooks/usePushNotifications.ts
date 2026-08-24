import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

export type PushNotificationsState = {
  expoPushToken: string | null;
  permissionStatus: Notifications.PermissionStatus | null;
};

let hasLoggedMissingApsEnvironmentWarning = false;

function isRunningInExpoGo(): boolean {
  return Constants.executionEnvironment === 'storeClient';
}

function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

function configureNotificationsDisabledHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: false,
      shouldShowList: false,
    }),
  });
}

async function configureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

async function resolvePermissionStatus(): Promise<Notifications.PermissionStatus> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return existingStatus;

  const { status: requestedStatus } =
    await Notifications.requestPermissionsAsync();
  return requestedStatus;
}

function resolveProjectId(): string | undefined {
  return (
    (Constants.expoConfig?.extra?.eas?.projectId as string | undefined) ??
    Constants.easConfig?.projectId
  );
}

function isMissingApsEnvironmentEntitlement(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  return /aps-environment.*entitlement string found for application/i.test(
    error.message,
  );
}

async function fetchExpoPushToken(): Promise<string | null> {
  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: resolveProjectId(),
    });
    return token;
  } catch (error) {
    if (isMissingApsEnvironmentEntitlement(error)) {
      if (__DEV__ && !hasLoggedMissingApsEnvironmentWarning) {
        console.warn(
          '[PushNotifications] iOS push capability is not configured yet (missing aps-environment entitlement). Skipping token generation.',
        );
        hasLoggedMissingApsEnvironmentWarning = true;
      }
      return null;
    }

    console.error('[PushNotifications] Failed to generate token:', error);
    return null;
  }
}

async function registerForPushNotifications(
  requestPermission = true,
): Promise<PushNotificationsState> {
  if (Platform.OS === 'android' && isRunningInExpoGo()) {
    if (__DEV__) {
      console.warn(
        '[PushNotifications] Remote push not available in Expo Go on Android. Use a development build.',
      );
    }
    return { expoPushToken: null, permissionStatus: null };
  }

  configureNotificationHandler();
  await configureAndroidChannel();

  const permissionStatus = requestPermission
    ? await resolvePermissionStatus()
    : (await Notifications.getPermissionsAsync()).status;

  if (permissionStatus !== 'granted') {
    return { expoPushToken: null, permissionStatus };
  }

  if (!Device.isDevice) {
    if (__DEV__) {
      console.log(
        '[PushNotifications] Simulator detected: drag a .apns file to test locally.',
      );
    }
    return { expoPushToken: null, permissionStatus };
  }

  const token = await fetchExpoPushToken();
  return { expoPushToken: token, permissionStatus };
}

export function usePushNotifications(enabled = true): PushNotificationsState {
  const [state, setState] = useState<PushNotificationsState>({
    expoPushToken: null,
    permissionStatus: null,
  });
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!enabled) {
      configureNotificationsDisabledHandler();
      setState({ expoPushToken: null, permissionStatus: null });
      return;
    }

    registerForPushNotifications().then(setState);

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const returningToForeground =
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active';

      if (returningToForeground) {
        registerForPushNotifications(false).then(setState);
      }

      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const onReceived = Notifications.addNotificationReceivedListener(
      (notification) => {
        if (__DEV__) {
          console.log(
            `[PushNotifications] Notification received: ${notification.request.identifier}`,
          );
        }
      },
    );

    const onResponseReceived =
      Notifications.addNotificationResponseReceivedListener((response) => {
        if (__DEV__) {
          console.log(
            `[PushNotifications] Notification response: ${response.notification.request.identifier}`,
          );
        }
      });

    return () => {
      onReceived.remove();
      onResponseReceived.remove();
    };
  }, [enabled]);

  return state;
}
