import { useFonts } from 'expo-font';
import { fontFiles } from '../constants/fonts';

export const useAppFonts = () => {
  return useFonts(fontFiles);
};
