import MediaPicker from '@/components/MediaPicker';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getMe } from '@/services/authService';
import { CacheService, clubPostsCache } from '@/services/cacheService';
import { createClubPost } from '@/services/clubService';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const MAX_IMAGES = 3;

export default function CreatePostScreen() {
  const { id, clubName } = useLocalSearchParams<{
    id: string;
    clubName: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const cached = CacheService.getMeData(token);
    const url = cached?.avatar_url ?? cached?.photo ?? null;
    if (url) {
      setPhotoUrl(url);
      return;
    }
    getMe(token)
      .then((me) => setPhotoUrl(me.avatar_url ?? me.photo ?? null))
      .catch(() => {});
  }, [token]);

  async function pickImages() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: MAX_IMAGES - images.length,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets].slice(0, MAX_IMAGES));
    }
  }

  function removeImage(uri: string) {
    setImages((prev) => prev.filter((img) => img.uri !== uri));
  }

  async function handleSubmit() {
    if (!content.trim()) {
      setError('Escribe algo antes de publicar.');
      return;
    }
    if (!token || !id) return;

    setError('');
    setSubmitting(true);
    try {
      await createClubPost(Number(id), content.trim(), images, token);
      delete clubPostsCache[String(id)];
      router.back();
    } catch {
      setError('No se pudo crear la publicación. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.backgroundScreen}
      />
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              { opacity: pressed ? 0.6 : 1 },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.blueDark} />
          </Pressable>

          <Text
            style={styles.headerTitle}
            numberOfLines={1}
            pointerEvents="none"
          >
            Crear publicación
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.publishBtn,
              submitting && styles.publishBtnDisabled,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.publishText}>Publicar</Text>
            )}
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* User identity */}
          <View style={styles.identityRow}>
            <View style={styles.avatar}>
              {photoUrl ? (
                <ExpoImage
                  source={{ uri: photoUrl }}
                  style={styles.avatarImg}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>
                    {getInitials(user?.name ?? 'U')}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.identityInfo}>
              <Text style={styles.userName}>{user?.name ?? ''}</Text>
              <View style={styles.clubBadge}>
                <Ionicons
                  name="people-outline"
                  size={12}
                  color={colors.gray700}
                />
                <Text style={styles.clubBadgeText} numberOfLines={1}>
                  {clubName ?? ''}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={10}
                  color={colors.gray700}
                />
              </View>
            </View>
          </View>

          {/* Composer */}
          <View style={styles.composerCard}>
            <TextInput
              style={styles.composerInput}
              placeholder={`¿Qué quieres compartir con el club?`}
              placeholderTextColor="rgba(67,71,81,0.4)"
              value={content}
              onChangeText={(text) => {
                setContent(text);
                if (error) setError('');
              }}
              multiline
              textAlignVertical="top"
            />

            {/* Media area */}
            <MediaPicker
              images={images}
              onPick={pickImages}
              onRemove={removeImage}
              maxImages={MAX_IMAGES}
            />
          </View>

          {error ? <Text style={styles.errorMsg}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundScreen },
  headerWrap: {
    backgroundColor: colors.backgroundScreen,
    paddingBottom: 12,
  },
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 16,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.blueDark,
    letterSpacing: -0.3,
  },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 24,
  },

  publishBtn: {
    backgroundColor: colors.bluePrimary,
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBtnDisabled: {
    opacity: 0.6,
  },
  publishText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.white,
    lineHeight: 16,
  },

  // Identity row
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    overflow: 'hidden',
    backgroundColor: colors.bluePrimary,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontFamily: typography.fontFamily.manropeExtraBold,
    color: colors.white,
  },
  identityInfo: {
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
    lineHeight: 24,
  },
  clubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  clubBadgeText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray700,
    lineHeight: 16,
    maxWidth: 180,
  },

  // Composer card
  composerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  composerInput: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    fontSize: 18,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray950,
    minHeight: 160,
    lineHeight: 28,
  },

  // Error
  errorMsg: {
    fontSize: 13,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.errorText,
    textAlign: 'center',
  },
});
