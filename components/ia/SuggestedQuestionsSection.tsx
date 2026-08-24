import { colors, typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SuggestedQuestion } from './SuggestedQuestion';

interface Question {
  id: string;
  text: string;
}

interface SuggestedQuestionsSectionProps {
  questions: Question[];
  onQuestionPress: (text: string) => void;
  visible?: boolean;
}

export const SuggestedQuestionsSection = ({
  questions,
  onQuestionPress,
  visible = true,
}: SuggestedQuestionsSectionProps) => {
  if (!visible) return null;
  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>✨</Text>
        <Text style={styles.headerText}>Preguntas sugeridas</Text>
      </View>

      {/* Question chips */}
      <View style={styles.list}>
        {questions.map((q) => (
          <SuggestedQuestion
            key={q.id}
            text={q.text}
            onPress={onQuestionPress}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingVertical: 8,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
  },
  list: {
    gap: 12,
  },
});
