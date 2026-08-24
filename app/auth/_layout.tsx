import CustomLoadingScreen from '@/components/CustomLoadingScreen';
import { useAuth } from '@/context/AuthContext';
import { Redirect, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function AuthLayout() {
  const { token, isLoading, isAuthenticating } = useAuth();

  if (isLoading) {
    return <CustomLoadingScreen />;
  }

  if (token) {
    return <Redirect href="/" />;
  }

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }} />
      {isAuthenticating ? (
        <View style={styles.loaderOverlay}>
          <CustomLoadingScreen
            message="Iniciando sesión..."
            subtitle="Estamos validando tu cuenta institucional."
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
