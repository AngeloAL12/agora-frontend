import { fontFamily } from './fonts';

export const colors = {
  yellow: '#F1C806',
  bluePrimary: '#1E488F',
  blueDark: '#192A56',
  blue100: '#D8E2FF',
  white: '#FFFFFF',
  whiteSoft: '#FCFBFB',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray900: '#2E323C',
  gray700: '#434751',
  black: '#000000',
  gray950: '#191C1E',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
} as const;

export const palette = {
  background: colors.whiteSoft,
  surface: colors.white,
  surfaceVariant: colors.gray200,
  textPrimary: colors.gray950,
  textSecondary: colors.gray700,
  heading: colors.gray900,
  border: colors.gray300,
  divider: colors.gray200,
  primary: colors.bluePrimary,
  primaryDark: colors.blueDark,
  primaryContainer: colors.blueDark,
  onPrimary: colors.white,
  accent: colors.yellow,
  shadow: colors.black,
  error: colors.error,
  errorContainer: colors.errorContainer,
  onError: colors.white,
} as const;

export const typography = {
  fontFamily: {
    manropeExtraBold: fontFamily.ManropeExtraBold,
    manropeBold: fontFamily.ManropeBold,
    interBold: fontFamily.InterBold,
    interSemiBold: fontFamily.InterSemiBold,
    interMedium: fontFamily.InterMedium,
    interRegular: fontFamily.InterRegular,
  },
} as const;

export const theme = {
  colors,
  palette,
  typography,
} as const;

export default theme;
