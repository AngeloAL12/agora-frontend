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
    | '/(tabs)/messages'
    | '/(tabs)/clubs'
    | '/(tabs)/profile'
  >('/(tabs)/map');
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    readPreferences()
      .then((prefs) => {
        if (!mounted) return;
        const homeScreen = normalizeHomeScreen(prefs?.homeScreen);
        if (homeScreen) {
          setHomeRoute(HOME_ROUTE_BY_KEY[homeScreen]);
        }
        setOnboardingSeen(prefs?.onboardingSeen ?? false);
      })
      .catch(() => {
        if (mounted) setOnboardingSeen(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading || onboardingSeen === null) return <View style={{ flex: 1 }} />;

  if (token) {
    if (user?.id_career == null) return <Redirect href="/setup/name" />;
    return <Redirect href={homeRoute} />;
  }

  if (onboardingSeen) return <Redirect href="/auth/onboarding" />;
  return <Redirect href="/auth/slides" />;
}
