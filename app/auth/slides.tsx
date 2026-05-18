import { colors, typography } from '@/constants/theme';
import { markOnboardingSeen } from '@/lib/preferencesStorage';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

const DOT_SIZE = 10;
const DOT_GAP = 8;
const EXPANDED_WIDTH = DOT_SIZE * 2 + DOT_GAP; // width a dot expands to when "filled"

const SLIDES = [
  {
    image: require('@/assets/images/onboardings/screen1.png'),
    title: 'Únete a la Comunidad',
    subtitle:
      'Descubre clubes de robótica, programación, deportes y más. ¡Haz amigos con tus mismos intereses!',
  },
  {
    image: require('@/assets/images/onboardings/screen2.png'),
    title: 'Tú voz importa',
    subtitle:
      'Ayúdanos a mejorar el campus informando cualquier desperfecto de forma rápida y sencilla.',
  },
  {
    image: require('@/assets/images/onboardings/screen3.png'),
    title: 'Mapa interactivo',
    subtitle:
      'Explora el instituto con facilidad. Encuentra edificios, laboratorios y áreas comunes en tiempo real.',
  },
] as const;

function Dot({ state }: { state: 'active' | 'completed' | 'upcoming' }) {
  const widthAnim = useRef(
    new Animated.Value(state === 'completed' ? EXPANDED_WIDTH : DOT_SIZE),
  ).current;

  // Animate to correct target whenever state changes
  const targetWidth =
    state === 'active' || state === 'upcoming' ? DOT_SIZE : EXPANDED_WIDTH;

  Animated.timing(widthAnim, {
    toValue: targetWidth,
    duration: 300,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: false,
  }).start();

  if (state === 'upcoming') {
    return <View style={styles.dotUpcoming} />;
  }

  return (
    <Animated.View
      style={[
        styles.dotFilled,
        {
          width: widthAnim,
          opacity: state === 'active' ? 1 : 0.7,
        },
      ]}
    />
  );
}

export default function SlidesScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const { height } = useWindowDimensions();

  const handleNext = async () => {
    if (activeIndex < SLIDES.length - 1) {
      setActiveIndex((i) => i + 1);
      return;
    }
    try {
      await markOnboardingSeen();
    } catch {}
    router.replace('/auth/onboarding');
  };

  const slide = SLIDES[activeIndex];
  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Text style={styles.agora}>Agora</Text>

      <View style={[styles.imageContainer, { maxHeight: height * 0.4 }]}>
        <ExpoImage
          source={slide.image}
          style={styles.image}
          contentFit="contain"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>

      <View style={styles.spacer} />

      <View style={styles.bottomRow}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <Dot
              key={i}
              state={
                i < activeIndex
                  ? 'completed'
                  : i === activeIndex
                    ? 'active'
                    : 'upcoming'
              }
            />
          ))}
        </View>

        <Pressable style={styles.buttonWrapper} onPress={handleNext}>
          <LinearGradient
            colors={[colors.blueSecondary, colors.bluePrimary]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {isLast ? 'Empezar' : 'Siguiente'}
            </Text>
            <ExpoImage
              source={require('@/assets/icons/right_arrow.svg')}
              style={styles.buttonIcon}
              contentFit="contain"
            />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundScreen,
    paddingTop: 60,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  agora: {
    fontSize: 12,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.blueSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 21,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignSelf: 'stretch',
  },
  title: {
    fontSize: 32,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.gray950,
    textAlign: 'left',
    letterSpacing: -0.75,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    textAlign: 'left',
    marginTop: 8,
    lineHeight: 20,
  },
  spacer: {
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DOT_GAP,
  },
  dotFilled: {
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.blueSecondary,
  },
  dotUpcoming: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.blueSecondary,
    opacity: 0.4,
  },
  buttonWrapper: {
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
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 12,
    gap: 10,
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
