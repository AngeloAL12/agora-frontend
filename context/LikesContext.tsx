import React, { createContext, useCallback, useContext, useState } from 'react';

interface PostState {
  liked: boolean;
  likeCount: number;
  commentCount: number;
}

interface LikesContextValue {
  getPost: (clubId: number, postId: number) => PostState | undefined;
  setPost: (
    clubId: number,
    postId: number,
    liked: boolean,
    likeCount: number,
    commentCount?: number,
  ) => void;
  setLike: (
    clubId: number,
    postId: number,
    liked: boolean,
    count: number,
  ) => void;
}

const LikesContext = createContext<LikesContextValue | null>(null);

export function LikesProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Record<string, PostState>>({});

  const getPost = useCallback(
    (clubId: number, postId: number): PostState | undefined => {
      return posts[`${clubId}-${postId}`];
    },
    [posts],
  );

  const setPost = useCallback(
    (
      clubId: number,
      postId: number,
      liked: boolean,
      likeCount: number,
      commentCount?: number,
    ) => {
      const key = `${clubId}-${postId}`;
      setPosts((prev) => {
        const current = prev[key];
        return {
          ...prev,
          [key]: {
            liked,
            likeCount,
            commentCount:
              commentCount !== undefined
                ? commentCount
                : (current?.commentCount ?? 0),
          },
        };
      });
    },
    [],
  );

  const setLike = useCallback(
    (clubId: number, postId: number, liked: boolean, count: number) => {
      setPost(clubId, postId, liked, count);
    },
    [setPost],
  );

  const value: LikesContextValue = {
    getPost,
    setPost,
    setLike,
  };

  return (
    <LikesContext.Provider value={value}>{children}</LikesContext.Provider>
  );
}

export function useLikes(): LikesContextValue {
  const context = useContext(LikesContext);
  if (!context) {
    throw new Error('useLikes must be used within a LikesProvider');
  }
  return context;
}
