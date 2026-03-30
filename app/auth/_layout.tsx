import { useAuth } from '@/context/AuthContext';
import { colors, typography } from '@/constants/theme';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function AuthLayout() {
  const { token, isLoading, isAuthenticating } = useAuth();

  if (isLoading) {
    return <View style={{ flex: 1 }} />;
  }

  if (token) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }} />
      {isAuthenticating ? (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={colors.bluePrimary} />
          <Text style={styles.loaderTitle}>Iniciando sesión...</Text>
          <Text style={styles.loaderSubtitle}>
            Estamos validando tu cuenta institucional.
          </Text>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundScreen,
    paddingHorizontal: 24,
  },
  loaderTitle: {
    marginTop: 20,
    fontSize: 24,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
  },
  loaderSubtitle: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    textAlign: 'center',
  },
});
