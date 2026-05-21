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
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatInput } from '@/components/ia/ChatInput';

import CustomLoadingScreen from '@/components/CustomLoadingScreen';

import { ScreenHeader } from '@/components/ScreenHeader';
import ImageViewer from '@/components/ImageViewer';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLikes } from '@/context/LikesContext';
import { createPostComment, getPostComments } from '@/services/clubService';
import { useDebouncedLike } from '@/hooks/useDebouncedLike';
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
  likeCount: number;
  liked: boolean;
  onLike: () => void;
  onCommentPress: () => void;
  onImagePress?: (index: number) => void;
}

function PostHeader({
  authorName,
  authorPhoto,
  content,
  createdAt,
  images,
  commentCount,
  likeCount,
  liked,
  onLike,
  onCommentPress,
  onImagePress,
}: PostHeaderProps) {
  const [avatarError, setAvatarError] = useState(false);
  const showAvatar = !!authorPhoto && !avatarError && authorPhoto !== '';

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
        <Pressable onPress={() => onImagePress?.(0)}>
          <ExpoImage
            source={{ uri: images[0].url }}
            style={headerStyles.singleImage}
            contentFit="cover"
          />
        </Pressable>
      )}

      {/* Multiple images */}
      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={headerStyles.imageRow}
        >
          {images.map((img, index) => (
            <Pressable key={img.id} onPress={() => onImagePress?.(index)}>
              <ExpoImage
                source={{ uri: img.url }}
                style={headerStyles.multiImage}
                contentFit="cover"
              />
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Actions row */}
      <View style={headerStyles.actions}>
        <Pressable
          style={headerStyles.actionBtn}
          onPress={onLike}
          activeOpacity={0.7}
        >
          <ExpoImage
            source={require('@/assets/icons/clubs/like_heart.svg')}
            style={headerStyles.actionIcon}
            contentFit="contain"
            tintColor={liked ? colors.error : colors.gray700}
          />
          <Text
            style={[headerStyles.actionCount, liked && { color: colors.error }]}
          >
            {likeCount}
          </Text>
        </Pressable>
        <Pressable
          style={headerStyles.actionBtn}
          onPress={onCommentPress}
          activeOpacity={0.7}
        >
          <ExpoImage
            source={require('@/assets/icons/clubs/comment_post.svg')}
            style={headerStyles.actionIcon}
            contentFit="contain"
            tintColor={colors.gray700}
          />
          <Text style={headerStyles.actionCount}>{commentCount}</Text>
        </Pressable>
      </View>

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
  const { getPost, setLike, setPost } = useLikes();
  const { toggleLike } = useDebouncedLike();

  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [inputHeight, setInputHeight] = useState(58);
  const listRef = useRef<FlatList>(null);

  // Mirror exactly the chat screen keyboard tracking
  const keyboard = useAnimatedKeyboard();
  const animatedKeyboardStyle = useAnimatedStyle(() => ({
    paddingBottom: Math.max(keyboard.height.value + 16, insets.bottom + 16),
  }));

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const inputBottomPadding = keyboardVisible ? 16 : insets.bottom + 16;

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

  const [failedAvatars, setFailedAvatars] = useState<Set<number>>(new Set());

  const postState = getPost(Number(clubId), Number(postId)) ?? {
    liked: false,
    likeCount: 0,
    commentCount: 0,
  };

  async function handleLike() {
    if (!token) return;
    toggleLike(
      Number(clubId),
      Number(postId),
      token,
      postState.liked,
      postState.likeCount,
      setLike,
    );
  }

  function handleCommentPress() {
    // ChatInput manages its own focus
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !token || !clubId || !postId) return;
    try {
      const newComment = await createPostComment(
        Number(clubId),
        Number(postId),
        trimmed,
        token,
      );
      setComments((prev) => [...prev, newComment]);
      setPost(
        Number(clubId),
        Number(postId),
        postState.liked,
        postState.likeCount,
        postState.commentCount + 1,
      );
      setText('');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      // silently ignore
    }
  }

  function handleAvatarError(userId: number) {
    setFailedAvatars((prev) => new Set(prev).add(userId));
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
        likeCount={postState.likeCount}
        liked={postState.liked}
        onLike={handleLike}
        onCommentPress={handleCommentPress}
        onImagePress={(index) => {
          setSelectedImageIndex(index);
          setImageModalVisible(true);
        }}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      authorName,
      authorPhoto,
      content,
      createdAt,
      parsedImages,
      comments.length,
      postState.likeCount,
      postState.liked,
    ],
  );

  function renderComment({ item }: { item: PostComment }) {
    const showPhoto = item.user.photo && !failedAvatars.has(item.user.id);

    return (
      <View style={styles.commentRow}>
        <View style={styles.commentAvatar}>
          {showPhoto && item.user.photo ? (
            <ExpoImage
              source={{ uri: item.user.photo }}
              style={styles.commentAvatarImg}
              contentFit="cover"
              onError={() => handleAvatarError(item.user.id)}
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

  if (loading) {
    return <CustomLoadingScreen message="Cargando publicación..." />;
  }

  const renderContent = (paddingBottom: number) => (
    <View style={styles.flex}>
      <FlatList
        ref={listRef}
        data={comments}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderComment}
        ListHeaderComponent={listHeader}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: inputHeight + paddingBottom + 12 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.emptyText}>Sé el primero en comentar.</Text>
        }
      />

      {/* Input — exactly like chat screen */}
      <View
        style={[
          styles.inputContainer,
          { position: 'absolute', bottom: paddingBottom, left: 0, right: 0 },
        ]}
        onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}
      >
        <ChatInput
          value={text}
          onChangeText={setText}
          onSend={handleSend}
          placeholder="Escribe un comentario..."
        />
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <ScreenHeader
        variant="white"
        title="Post"
        align="center"
        showBackButton
        backButtonColor={colors.blueDark}
        containerStyle={styles.header}
      />

      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
          keyboardVerticalOffset={0}
        >
          {renderContent(inputBottomPadding)}
        </KeyboardAvoidingView>
      ) : (
        <Animated.View style={[styles.flex, animatedKeyboardStyle]}>
          {renderContent(0)}
        </Animated.View>
      )}

      <ImageViewer
        visible={imageModalVisible}
        images={parsedImages}
        selectedIndex={selectedImageIndex}
        onClose={() => setImageModalVisible(false)}
      />
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
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    width: 17,
    height: 17,
  },
  actionCount: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray700,
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
  inputContainer: {
    zIndex: 10,
  },

  listContent: {
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
    paddingHorizontal: 16,
  },

  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 16,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
});
