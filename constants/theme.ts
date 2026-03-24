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
    manropeExtraBold: 'Manrope-ExtraBold',
    manropeBold: 'Manrope-Bold',
    interBold: 'Inter-Bold',
    interSemiBold: 'Inter-SemiBold',
    interMedium: 'Inter-Medium',
    interRegular: 'Inter-Regular',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40,
  },
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const theme = {
  colors,
  palette,
  typography,
  spacing,
  radius,
} as const;

export default theme;
