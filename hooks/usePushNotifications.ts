import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type PushNotificationsState = {
  expoPushToken: string | null;
  permissionStatus: Notifications.PermissionStatus | null;
};

async function registerForPushNotificationsAsync(): Promise<PushNotificationsState> {
  if (!Device.isDevice) {
    return { expoPushToken: null, permissionStatus: null };
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return { expoPushToken: null, permissionStatus: finalStatus };
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as
    | string
    | undefined;
  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return { expoPushToken: token, permissionStatus: finalStatus };
}

export function usePushNotifications(): PushNotificationsState {
  const [state, setState] = useState<PushNotificationsState>({
    expoPushToken: null,
    permissionStatus: null,
  });

  useEffect(() => {
    registerForPushNotificationsAsync().then(setState);
  }, []);

  return state;
}
