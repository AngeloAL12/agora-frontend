import { colors, typography } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, Modal, StyleSheet, Text, View } from 'react-native';

export function NoInternetModal() {
  const { isConnected } = useNetworkStatus();

  return (
    <Modal
      visible={!isConnected}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={12} style={styles.backdrop} tint="dark">
          <Card />
        </BlurView>
      ) : (
        <View style={[styles.backdrop, styles.backdropAndroid]}>
          <Card />
        </View>
      )}
    </Modal>
  );
}

function Card() {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="wifi-outline" size={32} color={colors.bluePrimary} />
      </View>
      <Text style={styles.title}>Sin conexión</Text>
      <Text style={styles.message}>
        Verifica tu conexión a Internet e intenta de nuevo.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  backdropAndroid: {
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    backgroundColor: colors.bluePrimaryLight2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: colors.bluePrimaryLight,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    color: colors.bluePrimary,
    fontFamily: typography.fontFamily.manropeExtraBold,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interMedium,
    textAlign: 'center',
    maxWidth: 260,
  },
});
