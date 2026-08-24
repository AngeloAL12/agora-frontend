import { colors, typography } from '@/constants/theme';
import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

const capIcon = require('@/assets/icons/AiBot/graduation-cap.svg');

interface SuggestedQuestionProps {
  text: string;
  onPress: (text: string) => void;
}

export const SuggestedQuestion = React.memo(
  ({ text, onPress }: SuggestedQuestionProps) => {
    return (
      <Pressable
        style={({ pressed }) => [styles.container, pressed && styles.pressed]}
        onPress={() => onPress(text)}
        accessibilityRole="button"
      >
        <ExpoImage source={capIcon} style={styles.icon} contentFit="contain" />
        <Text style={styles.text} numberOfLines={2}>
          {text}
        </Text>
      </Pressable>
    );
  },
);

SuggestedQuestion.displayName = 'SuggestedQuestion';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    width: '100%',
  },
  pressed: {
    opacity: 0.75,
  },
  icon: {
    width: 22,
    height: 20,
    flexShrink: 0,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.fontFamily.interMedium,
    color: colors.gray700,
    lineHeight: 20,
  },
});
