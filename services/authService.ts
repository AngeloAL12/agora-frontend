import { apiRequest } from './api';

type AuthOptions = {
  refreshToken?: string;
  onTokenRefreshed?: (accessToken: string, refreshToken: string) => void;
  onRefreshFailed?: () => void;
};

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  id_career: number | null;
  role?: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AuthUser;
};

export type RefreshResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshResponse> {
  return apiRequest<RefreshResponse>({
    method: 'POST',
    path: '/auth/refresh',
    body: { refresh_token: refreshToken },
  });
}

export async function loginWithGoogle(idToken: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>({
    method: 'POST',
    path: '/auth/google/mobile-login',
    body: { token: idToken },
  });
}

export async function loginWithMicrosoft(
  idToken: string,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>({
    method: 'POST',
    path: '/auth/microsoft/mobile-login',
    body: { token: idToken },
  });
}

export async function savePushToken(
  pushToken: string,
  accessToken: string,
  opts?: AuthOptions,
): Promise<void> {
  await apiRequest<{ message: string }>({
    method: 'POST',
    path: '/push-token',
    body: { push_token: pushToken },
    token: accessToken,
    ...opts,
  });
}

export async function updateMyCareer(
  careerId: number,
  accessToken: string,
  opts?: AuthOptions,
): Promise<{ id_career: number }> {
  return apiRequest<{ id_career: number }>({
    method: 'PATCH',
    path: '/users/me/career',
    body: { career_id: careerId },
    token: accessToken,
    ...opts,
  });
}

export type UserMeResponse = {
  id: number;
  email: string;
  role: string;
  name: string;
};

export type UserProfileResponse = UserMeResponse & {
  full_name?: string;
  clubs_count: number;
  complaints_count: number;
  likes_count: number;
  career: string | null;
  photo: string | null;
  avatar_url?: string | null;
};

export async function getMe(
  accessToken: string,
  opts?: AuthOptions,
): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>({
    method: 'GET',
    path: '/users/me',
    token: accessToken,
    ...opts,
  });
}
