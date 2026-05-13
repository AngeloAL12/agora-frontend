import type { ImagePickerAsset } from 'expo-image-picker';

import {
  ClubCategory,
  ClubEvent,
  ClubMember,
  ClubPost,
  ClubResponse,
  CreateEventPayload,
  PostComment,
} from '@/types/club';
import { apiRequest } from './api';

export const getAllClubs = (token?: string): Promise<ClubResponse[]> =>
  apiRequest({ method: 'GET', path: '/clubs', token });

export const getMyClubs = (token: string): Promise<ClubResponse[]> =>
  apiRequest({ method: 'GET', path: '/clubs/me', token });

export const getClubById = (
  id: string | number,
  token?: string,
): Promise<ClubResponse> =>
  apiRequest({ method: 'GET', path: `/clubs/${id}`, token });

export const leaveClub = (clubId: number, token: string): Promise<void> =>
  apiRequest({ method: 'DELETE', path: `/clubs/${clubId}/members/me`, token });

export const getClubCategories = (): Promise<ClubCategory[]> =>
  apiRequest({ method: 'GET', path: '/clubs/categories' });

export const joinClub = (
  clubId: number,
  token: string,
): Promise<{ message: string }> =>
  apiRequest({ method: 'POST', path: `/clubs/${clubId}/members`, token });

export const createClub = (
  formData: FormData,
  token: string,
): Promise<ClubResponse> =>
  apiRequest({
    method: 'POST',
    path: '/clubs',
    body: formData,
    token,
    isMultipart: true,
  });

export const getClubEvents = (
  clubId: number,
  token: string,
): Promise<ClubEvent[]> =>
  apiRequest({ method: 'GET', path: `/clubs/${clubId}/events`, token });

export const createClubEvent = (
  clubId: number,
  data: CreateEventPayload,
  token: string,
): Promise<ClubEvent> =>
  apiRequest({
    method: 'POST',
    path: `/clubs/${clubId}/events`,
    body: data,
    token,
  });

export const getClubMembers = (
  clubId: number,
  token: string,
): Promise<ClubMember[]> =>
  apiRequest({ method: 'GET', path: `/clubs/${clubId}/members`, token });

export const removeMember = (
  clubId: number,
  userId: number,
  token: string,
): Promise<void> =>
  apiRequest({
    method: 'DELETE',
    path: `/clubs/${clubId}/members/${userId}`,
    token,
  });

export const transferLeader = (
  clubId: number,
  userId: number,
  token: string,
): Promise<void> =>
  apiRequest({
    method: 'PATCH',
    path: `/clubs/${clubId}/members/${userId}/leader`,
    token,
  });

export const getClubPosts = (
  clubId: number,
  token: string,
  page = 1,
  limit = 20,
): Promise<ClubPost[]> =>
  apiRequest({
    method: 'GET',
    path: `/clubs/${clubId}/posts?page=${page}&limit=${limit}`,
    token,
  });

export const likePost = (
  clubId: number,
  postId: number,
  token: string,
): Promise<{ id_post: number; id_user: number; like_count: number }> =>
  apiRequest({
    method: 'POST',
    path: `/clubs/${clubId}/posts/${postId}/like`,
    body: {},
    token,
  });

export const unlikePost = (
  clubId: number,
  postId: number,
  token: string,
): Promise<{ id_post: number; id_user: number; like_count: number }> =>
  apiRequest({
    method: 'DELETE',
    path: `/clubs/${clubId}/posts/${postId}/like`,
    body: {},
    token,
  });

export const getPostComments = (
  clubId: number,
  postId: number,
  token: string,
): Promise<PostComment[]> =>
  apiRequest({
    method: 'GET',
    path: `/clubs/${clubId}/posts/${postId}/comments`,
    token,
  });

export const createPostComment = (
  clubId: number,
  postId: number,
  content: string,
  token: string,
): Promise<PostComment> =>
  apiRequest({
    method: 'POST',
    path: `/clubs/${clubId}/posts/${postId}/comments`,
    body: { content },
    token,
  });

export const createClubPost = (
  clubId: number,
  content: string,
  images: ImagePickerAsset[],
  token: string,
): Promise<ClubPost> => {
  const formData = new FormData();
  formData.append('content', content);
  images.forEach((asset) => {
    formData.append('images', {
      uri: asset.uri,
      name: asset.fileName ?? `photo_${Date.now()}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
    } as unknown as Blob);
  });
  return apiRequest({
    method: 'POST',
    path: `/clubs/${clubId}/posts`,
    body: formData,
    token,
    isMultipart: true,
  });
};
