import { ClubCategory, ClubResponse } from '@/types/club';
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
