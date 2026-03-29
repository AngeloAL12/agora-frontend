import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { colors } from '@/constants/theme';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/onboarding');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      {user ? <Text style={styles.welcome}>Hola, {user.name}</Text> : null}

      <Pressable style={styles.button} onPress={() => router.push('/map')}>
        <Text style={styles.buttonText}>Ir a Map</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  welcome: {
    fontSize: 16,
    color: colors.gray700,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: colors.gray950,
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#8B0000',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
