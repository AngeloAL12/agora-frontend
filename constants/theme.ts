import { fontFamily } from './fonts';

export const colors = {
  yellow: '#F1C806',
  bluePrimary: '#1E488F',
  blueSecondary: '#003172',
  blueDark: '#192A56',
  white: '#FFFFFF',
  whiteSoft: '#FCFBFB',
  whiteTransparent90: 'rgba(255, 255, 255, 0.9)',
  backgroundScreen: '#F7F9FB',
  borderSubtle: 'rgba(195,198,210,0.15)',
  sheetIndicator: 'rgba(195,198,210,0.5)',
  gray900: '#2E323C',
  gray700: '#434751',
  black: '#000000',
  gray950: '#191C1E',
  error: '#D32F2F',
  bluePrimaryLight: 'rgba(30, 72, 143, 0.2)',
  gray100: '#F2F4F7',
  glassBackground: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.4)',
  errorContainer: '#FFDAD6',
  errorText: '#BA1A1A',
  primaryContainer: '#D8E2FF',
  bluePrimaryLight2: 'rgba(219,234,254,0.8)',
  statsBackground: 'rgba(255,255,255,0.1)',
  activityYellow: '#CBA800',
  activityGray: '#747782',
  borderColor: '#D1D5DB',
  gray200: '#ECEEF1',
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
