import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

function isExpoGoAndroid(): boolean {
  const constantsValue = Constants as {
    appOwnership?: string;
    executionEnvironment?: string;
    ExecutionEnvironment?: { StoreClient?: string };
    default?: {
      appOwnership?: string;
      executionEnvironment?: string;
      ExecutionEnvironment?: { StoreClient?: string };
    };
  };

  const appOwnership =
    constantsValue.appOwnership ?? constantsValue.default?.appOwnership;
  const executionEnvironment =
    constantsValue.executionEnvironment ??
    constantsValue.default?.executionEnvironment;
  const storeClientEnvironment =
    constantsValue.ExecutionEnvironment?.StoreClient ??
    constantsValue.default?.ExecutionEnvironment?.StoreClient;

  const isExpoGo =
    appOwnership === 'expo' ||
    executionEnvironment === 'storeClient' ||
    (storeClientEnvironment !== undefined &&
      executionEnvironment === storeClientEnvironment);

  return Platform.OS === 'android' && isExpoGo;
}

function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export type PushNotificationsState = {
  expoPushToken: string | null;
  permissionStatus: Notifications.PermissionStatus | null;
};

async function registerForPushNotificationsAsync(): Promise<PushNotificationsState> {
  if (isExpoGoAndroid()) {
    console.warn(
      'En Expo Go (Android) los push remotos no estan disponibles. Usa un development build.',
    );
    return { expoPushToken: null, permissionStatus: null };
  }

  setupNotificationHandler();

  // 1. Configuración exclusiva de Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // 2. Pedir permisos (¡ESTO AHORA SÍ CORRE EN EL SIMULADOR!)
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return { expoPushToken: null, permissionStatus: finalStatus };
  }

  // 3. AQUÍ detenemos al simulador. Ya nos dio permiso, pero no puede generar token real.
  if (!Device.isDevice) {
    console.log('En simulador: Arrastra el .apns');
    return { expoPushToken: null, permissionStatus: finalStatus };
  }

  // 4. Generar el token (Solo llegará aquí si es un teléfono físico de verdad)
  try {
    const projectId =
      (Constants.expoConfig?.extra?.eas?.projectId as string | undefined) ??
      Constants.easConfig?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return { expoPushToken: token, permissionStatus: finalStatus };
  } catch (error) {
    console.error('Error al generar el token:', error);
    return { expoPushToken: null, permissionStatus: finalStatus };
  }
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
