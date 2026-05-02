import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import {
  HOME_ROUTE_BY_KEY,
  normalizeHomeScreen,
  readPreferences,
} from '@/lib/preferencesStorage';

export default function IndexScreen() {
  const { token, user, isLoading } = useAuth();
  const [homeRoute, setHomeRoute] = useState<
    | '/(tabs)/map'
    | '/(tabs)/complaints'
    | '/(tabs)/ia'
    | '/(tabs)/clubs'
    | '/(tabs)/profile'
  >('/(tabs)/map');

  useEffect(() => {
    let mounted = true;

    readPreferences()
      .then((prefs) => {
        if (!mounted || !prefs) return;
        const homeScreen = normalizeHomeScreen(prefs.homeScreen);
        if (homeScreen) {
          setHomeRoute(HOME_ROUTE_BY_KEY[homeScreen]);
        }
      })
      .catch(() => {
        // default to map
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) return <View style={{ flex: 1 }} />;

  if (token && user) {
    if (user?.id_career == null) return <Redirect href="/career" />;
    return <Redirect href={homeRoute as any} />;
  }

  return <Redirect href="/auth/onboarding" />;
}
