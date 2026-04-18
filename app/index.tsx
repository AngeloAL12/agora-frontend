import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { token, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View
        testID="loading"
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/auth/onboarding" />;
  }

  if (user?.id_career == null) {
    return <Redirect href="/career" />;
  }

  return <Redirect href="/(tabs)/map" />;
}
