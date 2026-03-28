export const fontFamily = {
  ManropeExtraBold: 'ManropeExtraBold',
  ManropeBold: 'ManropeBold',
  InterBold: 'InterBold',
  InterSemiBold: 'InterSemiBold',
  InterMedium: 'InterMedium',
  InterRegular: 'InterRegular',
} as const;

export const fontFiles = {
  [fontFamily.ManropeExtraBold]: require('../assets/fonts/Manrope-ExtraBold.ttf'),
  [fontFamily.ManropeBold]: require('../assets/fonts/Manrope-Bold.ttf'),
  [fontFamily.InterBold]: require('../assets/fonts/Inter-Bold.ttf'),
  [fontFamily.InterSemiBold]: require('../assets/fonts/Inter-SemiBold.ttf'),
  [fontFamily.InterMedium]: require('../assets/fonts/Inter-Medium.ttf'),
  [fontFamily.InterRegular]: require('../assets/fonts/Inter-Regular.ttf'),
} as const;
