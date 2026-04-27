import {
  ClubCategory,
  ClubEvent,
  ClubMember,
  ClubResponse,
  CreateEventPayload,
} from '@/types/club';
import { apiRequest } from './api';

export const getAllClubs = (token?: string): Promise<ClubResponse[]> =>
  apiRequest({ method: 'GET', path: '/clubs', token });

export const getMyClubs = (token: string): Promise<ClubResponse[]> =>
  apiRequest({ method: 'GET', path: '/clubs/me', token });

export const getClubById = (id: string | number): Promise<ClubResponse> =>
  apiRequest({ method: 'GET', path: `/clubs/${id}` });

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
