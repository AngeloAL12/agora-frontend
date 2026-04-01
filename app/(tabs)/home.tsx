import SuccessBottomSheet from '@/components/SuccessBottomSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const successBottomSheetRef = useRef<BottomSheetModal>(null);

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/onboarding');
  };

  const handleOpenSuccess = () => {
    successBottomSheetRef.current?.present();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      {user ? <Text style={styles.welcome}>Hola, {user.name}</Text> : null}

      <Pressable
        style={[styles.button, styles.successButton]}
        onPress={handleOpenSuccess}
      >
        <Text style={styles.buttonText}>Abrir Success Sheet</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => router.push('/map')}>
        <Text style={styles.buttonText}>Ir a Map</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </Pressable>

      <SuccessBottomSheet
        message="Tu reporte ha sido enviado exitosamente al personal acádemico"
        ref={successBottomSheetRef}
        onPrimaryPress={() => successBottomSheetRef.current?.dismiss()}
      />
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
  successButton: {
    backgroundColor: colors.bluePrimary,
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
