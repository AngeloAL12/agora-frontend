import { apiRequest } from './api';

export type AuthUser = {
  id: number;
  email: string;
  name: string;
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
