import { apiRequest } from './api';

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  id_career: number | null;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

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
): Promise<void> {
  await apiRequest<{ message: string }>({
    method: 'POST',
    path: '/push-token',
    body: { push_token: pushToken },
    token: accessToken,
  });
}

export async function updateMyCareer(
  careerId: number,
  accessToken: string,
): Promise<{ id_career: number }> {
  return apiRequest<{ id_career: number }>({
    method: 'PATCH',
    path: '/users/me/career',
    body: { career_id: careerId },
    token: accessToken,
  });
}

export type UserMeResponse = {
  name: string;
  clubs_count: number;
  complaints_count: number;
  likes_count: number;
  career: string | null;
  photo: string | null;
};

export async function getMe(accessToken: string): Promise<UserMeResponse> {
  return apiRequest<UserMeResponse>({
    method: 'GET',
    path: '/users/me',
    token: accessToken,
  });
}
