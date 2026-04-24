import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function DevScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          marginBottom: 20,
          fontWeight: '600',
        }}
      >
        Pantalla de desarrollo
      </Text>

      <TouchableOpacity
        onPress={() => router.push('/club-robotica-test' as any)}
        style={{
          backgroundColor: '#0D47A1',
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: '#FFF', fontWeight: '600' }}>
          Ir a Club Robótica
        </Text>
      </TouchableOpacity>
    </View>
  );
}
