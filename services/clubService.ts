import { apiRequest } from './api';

export interface ClubResponse {
  id: number;
  name: string;
  description: string;
  profile_image: string | null;
  cover_image: string | null;
  id_category: number;
  id_leader: number;
  members_count?: number;
}

export const getAllClubs = async () => {
  try {
    const response = await apiRequest({
      method: 'GET',
      path: '/clubs/',
    });
    return response as any;
  } catch (error) {
    console.error('Error al obtener la lista de clubes:', error);
    throw error;
  }
};

export const getClubById = async (id: string | number) => {
  try {
    const response = await apiRequest({
      method: 'GET',
      path: `/clubs/${id}`,
    });
    return response as any;
  } catch (error) {
    console.error('Error al obtener el detalle del club:', error);
    throw error;
  }
};

export const joinClub = async (clubId: string | number, token: string) => {
  try {
    const response = await apiRequest({
      method: 'POST',
      path: `/clubs/${clubId}/members`,
      token: token,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getMyClubs = async (token: string) => {
  const response = await apiRequest({
    method: 'GET',
    path: '/users/me/clubs/',
    token: token,
  });
  return response;
};

export const createClub = async (formData: FormData, token: string) => {
  try {
    // Ahora solo pedimos 2 cosas: formData y token
    const response = await apiRequest({
      method: 'POST',
      path: '/clubs',
      body: formData, // Mandamos la maleta completa
      token: token,
      isMultipart: true, // 👈 ¡ESTO ES CLAVE para que acepte las fotos!
    });
    return response;
  } catch (error) {
    console.error('Error al crear el club:', error);
    throw error;
  }
};
