import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { View } from 'react-native';

export default function IndexScreen() {
  const { token, user, isLoading } = useAuth();

  if (isLoading) return <View style={{ flex: 1 }} />;

  if (token) {
    if (user?.id_career == null) return <Redirect href="/career" />;
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/auth/onboarding" />;
}
