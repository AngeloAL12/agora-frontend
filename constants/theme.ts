import { fontFamily } from './fonts';

export const colors = {
  yellow: '#F1C806',
  bluePrimary: '#1E488F',
  blueDark: '#192A56',
  white: '#FFFFFF',
  whiteSoft: '#FCFBFB',
  gray900: '#2E323C',
  gray700: '#434751',
  black: '#000000',
  gray950: '#191C1E',
} as const;

export const palette = {
  background: colors.whiteSoft,
  surface: colors.white,
  textPrimary: colors.gray950,
  textSecondary: colors.gray700,
  heading: colors.gray900,
  border: colors.gray700,
  primary: colors.bluePrimary,
  primaryDark: colors.blueDark,
  accent: colors.yellow,
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
