import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';

export type HomeScreenKey = 'map' | 'complaints' | 'ia' | 'clubs' | 'profile';
export type LegacyHomeScreenKey = 'reports' | 'messages';

export type AppPreferences = {
  homeScreen?: HomeScreenKey | LegacyHomeScreenKey;
  notificationsEnabled?: boolean;
};

const PREFS_FILE_URI = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}agora_preferences.json`
  : null;

const LEGACY_PREFS_KEY = '@app_preferences';
const LEGACY_NOTIFICATIONS_KEY = 'agora_notifications_enabled';

export const HOME_ROUTE_BY_KEY: Record<
  HomeScreenKey,
  | '/(tabs)/map'
  | '/(tabs)/complaints'
  | '/(tabs)/ia'
  | '/(tabs)/clubs'
  | '/(tabs)/profile'
> = {
  map: '/(tabs)/map',
  complaints: '/(tabs)/complaints',
  ia: '/(tabs)/ia',
  clubs: '/(tabs)/clubs',
  profile: '/(tabs)/profile',
};

export const normalizeHomeScreen = (
  value?: HomeScreenKey | LegacyHomeScreenKey,
): HomeScreenKey | null => {
  if (!value) return null;
  if (value === 'reports') return 'complaints';
  if (value === 'messages') return 'ia';
  return value;
};

const parsePreferences = (raw: string): AppPreferences | null => {
  try {
    return JSON.parse(raw) as AppPreferences;
  } catch {
    return null;
  }
};

export async function readPreferences(): Promise<AppPreferences | null> {
  if (PREFS_FILE_URI) {
    try {
      const raw = await FileSystem.readAsStringAsync(PREFS_FILE_URI);
      const parsed = parsePreferences(raw);
      if (parsed) return parsed;
    } catch {
      // Fall back to legacy storage below.
    }
  }

  try {
    const [legacyPrefsRaw, legacyNotifications] = await Promise.all([
      SecureStore.getItemAsync(LEGACY_PREFS_KEY),
      SecureStore.getItemAsync(LEGACY_NOTIFICATIONS_KEY),
    ]);

    if (!legacyPrefsRaw && legacyNotifications == null) return null;

    const parsed = legacyPrefsRaw ? parsePreferences(legacyPrefsRaw) : null;
    return {
      ...parsed,
      notificationsEnabled:
        legacyNotifications == null
          ? parsed?.notificationsEnabled
          : legacyNotifications !== 'false',
    };
  } catch {
    return null;
  }
}

export async function savePreferences(
  preferences: AppPreferences,
): Promise<void> {
  if (!PREFS_FILE_URI) {
    throw new Error('Local preferences storage is unavailable.');
  }

  await FileSystem.writeAsStringAsync(
    PREFS_FILE_URI,
    JSON.stringify(preferences),
  );
}
