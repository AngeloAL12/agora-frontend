import { colors, typography } from '@/constants/theme';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

const addIcon = require('@/assets/icons/AiBot/add.svg');
const sendIcon = require('@/assets/icons/AiBot/arrow-send.svg');

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttach?: () => void;
  placeholder?: string;
  showAttach?: boolean;
}

export const ChatInput = ({
  value,
  onChangeText,
  onSend,
  onAttach,
  placeholder = 'Preguntar al asistente',
  showAttach = false,
}: ChatInputProps) => {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.glassWrapper}>
        <BlurView intensity={60} tint="light" style={styles.blurContainer}>
          <View style={styles.innerContainer}>
            {/* Attach button */}
            {showAttach && (
              <Pressable
                style={({ pressed }) => [
                  styles.attachButton,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onAttach?.();
                }}
                accessibilityRole="button"
                accessibilityLabel="Adjuntar archivo"
              >
                <ExpoImage
                  source={addIcon}
                  style={styles.addIcon}
                  contentFit="contain"
                />
              </Pressable>
            )}

            {/* Text input */}
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={`${colors.gray700}99`}
              multiline={true}
              blurOnSubmit={false}
              returnKeyType="default"
              underlineColorAndroid="transparent"
            />

            {/* Send button */}
            <Pressable
              style={({ pressed }) => [
                styles.sendButton,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSend();
              }}
              accessibilityRole="button"
              accessibilityLabel="Enviar mensaje"
            >
              <ExpoImage
                source={sendIcon}
                style={styles.sendIcon}
                contentFit="contain"
              />
            </Pressable>
          </View>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 25,
    marginBottom: 0,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  glassWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  blurContainer: {
    backgroundColor: colors.glassBackground,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 9,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  addIcon: {
    width: 14,
    height: 14,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray950,
    paddingTop: Platform.OS === 'ios' ? 12 : 9,
    paddingBottom: Platform.OS === 'ios' ? 11 : 9,
    paddingHorizontal: 12,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: 'transparent',
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.blueSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  sendIcon: {
    width: 19,
    height: 16,
  },
});
