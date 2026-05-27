import { colors, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

export type MediaPickerImage = {
  uri: string;
  name?: string;
};

type Props = {
  images: MediaPickerImage[];
  onPick: () => void;
  onRemove: (uri: string) => void;
  maxImages?: number;
  style?: StyleProp<ViewStyle>;
  placeholderStyle?: StyleProp<ViewStyle>;
  thumbnailListStyle?: StyleProp<ViewStyle>;
};

export default function MediaPicker({
  images,
  onPick,
  onRemove,
  maxImages = 3,
  style,
  placeholderStyle,
  thumbnailListStyle,
}: Props) {
  return (
    <View style={[styles.mediaSection, style]}>
      {images.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.thumbnailList, thumbnailListStyle]}
        >
          {images.map((img) => (
            <View key={img.uri} style={styles.thumbnailWrap}>
              <ExpoImage
                source={{ uri: img.uri }}
                style={styles.thumbnail}
                contentFit="cover"
              />
              <Pressable
                style={styles.removeBtn}
                onPress={() => onRemove(img.uri)}
              >
                <View style={styles.removeBtnBg} />
                <Ionicons
                  name="close-circle"
                  size={24}
                  color={colors.errorText}
                />
              </Pressable>
            </View>
          ))}
          {images.length < maxImages && (
            <Pressable
              style={({ pressed }) => [
                styles.addMoreBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={onPick}
            >
              <Ionicons name="add" size={28} color={colors.blueSecondary} />
            </Pressable>
          )}
        </ScrollView>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.mediaPlaceholder,
            placeholderStyle,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={onPick}
        >
          <View style={styles.mediaIconCircle}>
            <ExpoImage
              source={require('@/assets/icons/clubs/image.svg')}
              style={styles.mediaIcon}
              contentFit="contain"
              tintColor={colors.blueSecondary}
            />
          </View>
          <Text style={styles.mediaPlaceholderText}>Añadir fotos o videos</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mediaSection: {
    paddingTop: 16,
  },
  mediaPlaceholder: {
    borderWidth: 2,
    borderColor: colors.borderSubtle30,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 8,
  },
  mediaIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 9999,
    backgroundColor: '#D8E2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaIcon: {
    width: 22,
    height: 22,
  },
  mediaPlaceholderText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interBold,
    color: 'rgba(67,71,81,0.6)',
    lineHeight: 20,
  },
  thumbnailList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
    flexDirection: 'row',
  },
  thumbnailWrap: {
    position: 'relative',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  removeBtnBg: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.white,
  },
  addMoreBtn: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderSubtle20,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
