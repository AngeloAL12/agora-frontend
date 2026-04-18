import LoginBottomSheet from '@/components/LoginBottomSheet';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

export default function Onboarding() {
  const { login } = useAuth();
  const loginSheetRef = useRef<BottomSheetModal>(null);
  const { height } = useWindowDimensions();

  const handleOpenLogin = () => {
    loginSheetRef.current?.present();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.school}>TecNM Mexicali</Text>

      <View style={[styles.imageContainer, { maxHeight: height * 0.4 }]}>
        <ExpoImage
          source={require('@/assets/images/loginOverviewCard.png')}
          style={styles.image}
          contentFit="contain"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>¡Bienvenido Búfalo!</Text>
        <Text style={styles.subtitle}>
          Se parte de la comunidad ahora mismo
        </Text>
      </View>

      <View style={styles.spacer} />

      <View style={styles.buttonSection}>
        <Pressable style={styles.buttonWrapper} onPress={handleOpenLogin}>
          <LinearGradient
            colors={[colors.blueSecondary, colors.bluePrimary]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Empezar</Text>
            <ExpoImage
              source={require('@/assets/icons/right_arrow.svg')}
              style={styles.buttonIcon}
              contentFit="contain"
            />
          </LinearGradient>
        </Pressable>
      </View>

      <LoginBottomSheet
        ref={loginSheetRef}
        onDismiss={() => loginSheetRef.current?.dismiss()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundScreen,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 16,
  },
  school: {
    fontSize: 12,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.blueSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 21,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: undefined,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 21,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.gray950,
    textAlign: 'center',
    letterSpacing: -0.75,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    textAlign: 'center',
    marginTop: 8,
  },
  spacer: {
    flex: 1,
  },
  buttonSection: {
    width: '100%',
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 12,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: typography.fontFamily.manropeBold,
  },
  buttonIcon: {
    width: 16,
    height: 16,
  },
});
