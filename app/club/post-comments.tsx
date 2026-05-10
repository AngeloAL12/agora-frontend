import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { createPostComment, getPostComments } from '@/services/clubService';
import { ClubPostImage, PostComment } from '@/types/club';

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'Hace un momento';
  if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} día${days !== 1 ? 's' : ''}`;
}

const SCREEN_W = Dimensions.get('window').width;

interface PostHeaderProps {
  authorName: string;
  authorPhoto: string;
  content: string;
  createdAt: string;
  images: ClubPostImage[];
  commentCount: number;
}

function PostHeader({
  authorName,
  authorPhoto,
  content,
  createdAt,
  images,
  commentCount,
}: PostHeaderProps) {
  const [avatarError, setAvatarError] = useState(false);
  const showAvatar = !!authorPhoto && !avatarError;

  return (
    <View style={headerStyles.container}>
      {/* Author row */}
      <View style={headerStyles.authorRow}>
        {showAvatar ? (
          <ExpoImage
            source={{ uri: authorPhoto }}
            style={headerStyles.avatar}
            contentFit="cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <View style={headerStyles.avatarFallback}>
            <Text style={headerStyles.avatarInitials}>
              {getInitials(authorName)}
            </Text>
          </View>
        )}
        <View style={headerStyles.authorInfo}>
          <Text style={headerStyles.authorName}>{authorName}</Text>
          <Text style={headerStyles.timestamp}>{timeAgo(createdAt)}</Text>
        </View>
      </View>

      {/* Content text */}
      <Text style={headerStyles.content}>{content}</Text>

      {/* Single image */}
      {images.length === 1 && (
        <ExpoImage
          source={{ uri: images[0].url }}
          style={headerStyles.singleImage}
          contentFit="cover"
        />
      )}

      {/* Multiple images */}
      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={headerStyles.imageRow}
        >
          {images.map((img) => (
            <ExpoImage
              key={img.id}
              source={{ uri: img.url }}
              style={headerStyles.multiImage}
              contentFit="cover"
            />
          ))}
        </ScrollView>
      )}

      {/* Comments divider */}
      <View style={headerStyles.divider}>
        <Text style={headerStyles.commentCount}>
          {commentCount === 1 ? '1 comentario' : `${commentCount} comentarios`}
        </Text>
      </View>
    </View>
  );
}

export default function PostCommentsScreen() {
  const {
    clubId,
    postId,
    authorName,
    authorPhoto,
    content,
    createdAt,
    images,
  } = useLocalSearchParams<{
    clubId: string;
    postId: string;
    authorName: string;
    authorPhoto: string;
    content: string;
    createdAt: string;
    images: string;
  }>();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const parsedImages = useMemo<ClubPostImage[]>(() => {
    try {
      return images ? (JSON.parse(images) as ClubPostImage[]) : [];
    } catch {
      return [];
    }
  }, [images]);

  const load = useCallback(async () => {
    if (!clubId || !postId || !token) return;
    try {
      const data = await getPostComments(Number(clubId), Number(postId), token);
      setComments(data);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, [clubId, postId, token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !token || !clubId || !postId) return;
    setSending(true);
    try {
      const newComment = await createPostComment(
        Number(clubId),
        Number(postId),
        trimmed,
        token,
      );
      setComments((prev) => [...prev, newComment]);
      setText('');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      // silently ignore
    } finally {
      setSending(false);
    }
  }

  const listHeader = useMemo(
    () => (
      <PostHeader
        authorName={authorName ?? ''}
        authorPhoto={authorPhoto ?? ''}
        content={content ?? ''}
        createdAt={createdAt ?? ''}
        images={parsedImages}
        commentCount={comments.length}
      />
    ),
    [
      authorName,
      authorPhoto,
      content,
      createdAt,
      parsedImages,
      comments.length,
    ],
  );

  function renderComment({ item }: { item: PostComment }) {
    return (
      <View style={styles.commentRow}>
        <View style={styles.commentAvatar}>
          {item.user.photo ? (
            <ExpoImage
              source={{ uri: item.user.photo }}
              style={styles.commentAvatarImg}
              contentFit="cover"
            />
          ) : (
            <View style={styles.commentAvatarFallback}>
              <Text style={styles.commentAvatarInitials}>
                {getInitials(item.user.name)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.commentBubble}>
          <Text style={styles.commentAuthor}>{item.user.name}</Text>
          <Text style={styles.commentText}>{item.content}</Text>
          <Text style={styles.commentTime}>{timeAgo(item.created_at)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenHeader
        variant="white"
        title={authorName ? `Post de ${authorName}` : 'Comentarios'}
        align="center"
        showBackButton
        backButtonColor={colors.blueDark}
        containerStyle={styles.header}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.bluePrimary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={comments}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderComment}
            ListHeaderComponent={listHeader}
            contentContainerStyle={[
              styles.listContent,
              comments.length === 0 && styles.listEmpty,
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Sé el primero en comentar.</Text>
            }
          />
        )}

        {/* Input bar */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un comentario..."
            placeholderTextColor={colors.searchPlaceholder}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!text.trim() || sending) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={18} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: 8,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 9999,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.blueSecondary,
  },
  authorInfo: { gap: 2 },
  authorName: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray950,
  },
  timestamp: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.activityGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  singleImage: {
    width: SCREEN_W,
    aspectRatio: 16 / 9,
  },
  imageRow: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  multiImage: {
    width: 240,
    height: 160,
    borderRadius: 10,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentCount: {
    fontSize: 13,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray700,
  },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundScreen },
  header: { shadowOpacity: 0, elevation: 0 },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 12,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: typography.fontFamily.interRegular,
    fontSize: 14,
    color: colors.gray700,
    textAlign: 'center',
    paddingTop: 24,
  },

  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  commentAvatar: {
    marginTop: 2,
  },
  commentAvatarImg: {
    width: 34,
    height: 34,
    borderRadius: 9999,
  },
  commentAvatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 9999,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarInitials: {
    fontSize: 11,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.blueSecondary,
  },
  commentBubble: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 2,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  commentAuthor: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray950,
  },
  commentText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 9,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.activityGray,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle20,
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray950,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: colors.bluePrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
