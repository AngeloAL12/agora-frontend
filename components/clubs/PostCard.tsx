import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors, typography } from '@/constants/theme';
import { likePost, unlikePost } from '@/services/clubService';
import { ClubPost } from '@/types/club';

interface PostCardProps {
  post: ClubPost;
  clubId: number;
  token: string;
}

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

export default function PostCard({ post, clubId, token }: PostCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(post.user_has_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [avatarError, setAvatarError] = useState(false);

  async function handleLike() {
    const wasLiked = liked;
    // Optimistic update
    setLiked(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));
    try {
      const res = wasLiked
        ? await unlikePost(clubId, post.id, token)
        : await likePost(clubId, post.id, token);
      setLikeCount(res.like_count);
    } catch {
      // Revert on error
      setLiked(wasLiked);
      setLikeCount((c) => c + (wasLiked ? 1 : -1));
    }
  }

  function handleNavigateToPost() {
    router.push({
      pathname: '/club/post/[postId]' as never,
      params: {
        postId: post.id,
        clubId,
        authorName: post.author.name,
        authorPhoto: post.author.photo ?? '',
        content: post.content,
        createdAt: post.created_at,
        images: JSON.stringify(post.images),
        likeCount: liked ? likeCount : post.like_count,
      },
    });
  }

  const showAvatar = post.author.photo && !avatarError;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.97 : 1 }]}
      onPress={handleNavigateToPost}
    >
      <View style={styles.header}>
        {showAvatar ? (
          <ExpoImage
            source={{ uri: post.author.photo! }}
            style={styles.avatar}
            contentFit="cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitials}>
              {getInitials(post.author.name)}
            </Text>
          </View>
        )}
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.author.name}</Text>
          <Text style={styles.timestamp}>{timeAgo(post.created_at)}</Text>
        </View>
      </View>

      {post.images?.[0]?.url && (
        <ExpoImage
          source={{ uri: post.images[0].url }}
          style={styles.coverImage}
          contentFit="cover"
        />
      )}

      <View style={styles.body}>
        <Text style={styles.content}>{post.content}</Text>

        <View style={styles.actions}>
          <View style={styles.actionsLeft}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <ExpoImage
                source={require('@/assets/icons/clubs/like_heart.svg')}
                style={styles.actionIcon}
                contentFit="contain"
                tintColor={liked ? colors.bluePrimary : colors.gray700}
              />
              <Text
                style={[styles.actionCount, liked && styles.actionCountLiked]}
              >
                {likeCount}
              </Text>
            </TouchableOpacity>

            <View style={styles.actionBtn}>
              <ExpoImage
                source={require('@/assets/icons/clubs/comment_post.svg')}
                style={styles.actionIcon}
                contentFit="contain"
                tintColor={colors.gray700}
              />
              <Text style={styles.actionCount}>{post.comment_count}</Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.7}>
            <ExpoImage
              source={require('@/assets/icons/clubs/share.svg')}
              style={styles.actionIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 9999,
  },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.blueSecondary,
  },
  authorInfo: {
    gap: 2,
  },
  authorName: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray950,
  },
  timestamp: {
    fontSize: 9,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.activityGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coverImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 16,
  },
  content: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionsLeft: {
    flexDirection: 'row',
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
  actionCountLiked: {
    color: colors.bluePrimary,
  },
});
