import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

type Props = {
  uri: string | null;
  onPress: () => void;
  size?: number;
};

export default function CircularImagePicker({
  uri,
  onPress,
  size = 90,
}: Props) {
  const radius = size / 2;
  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: radius,
            overflow: 'hidden',
          },
        ]}
      >
        {uri && <Image source={{ uri }} style={styles.image} />}
      </View>
      <TouchableOpacity style={styles.addButton} onPress={onPress}>
        <View style={styles.plusCircle}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  circle: {
    backgroundColor: '#ECEEF1',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  image: { width: '100%', height: '100%' },
  addButton: { position: 'absolute', bottom: -5, right: -5 },
  plusCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#192A56',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
