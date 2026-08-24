import { useCallback } from 'react';

import { likePost, unlikePost } from '@/services/clubService';

const DEBOUNCE_DELAY = 500; // ms

const pendingLikes = new Map<string, ReturnType<typeof setTimeout>>();
const inFlight = new Set<string>();

export function useDebouncedLike() {
  const toggleLike = useCallback(
    async (
      clubId: number,
      postId: number,
      token: string,
      currentLiked: boolean,
      currentLikeCount: number,
      setLike: (
        clubId: number,
        postId: number,
        liked: boolean,
        count: number,
      ) => void,
    ) => {
      const key = `${clubId}-${postId}`;

      // Ignore if request is already in flight
      if (inFlight.has(key)) {
        return;
      }

      // Cancel previous debounce if exists
      if (pendingLikes.has(key)) {
        clearTimeout(pendingLikes.get(key)!);
      }

      // Update context immediately for optimistic UI
      const newCount = currentLiked
        ? currentLikeCount - 1
        : currentLikeCount + 1;
      setLike(clubId, postId, !currentLiked, newCount);

      // Debounce the API call
      const timeoutId = setTimeout(async () => {
        inFlight.add(key);
        try {
          const res = currentLiked
            ? await unlikePost(clubId, postId, token)
            : await likePost(clubId, postId, token);

          // Update context with server response
          setLike(clubId, postId, !currentLiked, res.like_count);
        } catch {
          // Revert on error
          setLike(clubId, postId, currentLiked, currentLikeCount);
        } finally {
          pendingLikes.delete(key);
          inFlight.delete(key);
        }
      }, DEBOUNCE_DELAY);

      pendingLikes.set(key, timeoutId);
    },
    [],
  );

  return { toggleLike };
}
