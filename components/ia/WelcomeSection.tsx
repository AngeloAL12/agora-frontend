import { colors, typography } from '@/constants/theme';
import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const avatarSource = require('@/assets/icons/AiBot/buffalo-with-background.svg');

interface WelcomeSectionProps {
  title?: string;
  subtitle?: string;
}

export const WelcomeSection = ({
  title = 'Asistente',
  subtitle = '¿Cómo puedo ayudarte hoy?',
}: WelcomeSectionProps) => {
  return (
    <View style={styles.container}>
      <ExpoImage
        source={avatarSource}
        style={styles.avatar}
        contentFit="contain"
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 8,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.blueSecondary,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interMedium,
    color: colors.gray700,
    textAlign: 'center',
  },
});
