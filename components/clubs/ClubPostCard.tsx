import { ClubPost } from '@/types/club';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ClubPostCardProps {
  post: ClubPost;
  onPressLike?: () => void;
  onPressComment?: () => void;
  onPressShare?: () => void;
}

const ClubPostCard = ({
  post,
  onPressLike,
  onPressComment,
  onPressShare,
}: ClubPostCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.postHeader}>
        <View style={styles.postAvatar}>
          <Text style={styles.postAvatarText}>{post.authorInitials}</Text>
        </View>

        <View style={styles.postAuthorInfo}>
          <Text style={styles.postAuthor}>{post.author}</Text>
          <Text style={styles.postMeta}>{post.publishedAt}</Text>
        </View>
      </View>

      <Image
        source={require('@/assets/images/post-robotica.png')}
        style={styles.postImage}
      />

      <Text style={styles.postText}>{post.content}</Text>

      <View style={styles.postFooter}>
        <View style={styles.postFooterLeft}>
          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.7}
            onPress={onPressLike}
          >
            <Image
              source={require('@/assets/images/corazon.png')}
              style={styles.icon}
            />
            <Text style={styles.footerAction}>{post.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.7}
            onPress={onPressComment}
          >
            <Image
              source={require('@/assets/images/comentario.png')}
              style={styles.icon}
            />
            <Text style={styles.footerAction}>{post.comments}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.7} onPress={onPressShare}>
          <Text style={styles.footerAction}>↗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ClubPostCard;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 8,
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginBottom: 10,
    gap: 5,
  },
  postAvatar: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    backgroundColor: '#D8E2FF',

    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  postAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#003172',
    textAlign: 'center',
  },
  postAuthorInfo: {
    justifyContent: 'center',
  },
  postAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E2A3A',
  },
  postMeta: {
    fontSize: 8,
    color: '#6C7480',
    marginTop: 1,
  },
  postImage: {
    width: '100%',
    height: 208,
    resizeMode: 'cover',
  },
  postText: {
    paddingHorizontal: 8,
    paddingTop: 10,
    fontSize: 12,
    lineHeight: 18,
    color: '#6C7480',
  },
  postFooter: {
    marginTop: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 11,

    gap: 12,
  },
  footerAction: {
    fontSize: 13,
    fontWeight: '700',
    color: '#434751',
    lineHeight: 16,
  },

  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  icon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
});
