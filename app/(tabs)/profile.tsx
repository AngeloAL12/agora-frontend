import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>

      {user && (
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={() => logout()}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 30,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 'auto',
    marginBottom: 120,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
