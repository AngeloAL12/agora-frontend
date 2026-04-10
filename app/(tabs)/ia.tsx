import { colors, typography } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IAScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Búfalo IA</Text>
      <Text style={styles.subtitle}>Tu asistente virtual</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundScreen,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
  },
});
