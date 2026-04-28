import { apiRequest } from './api';

export type LocalImageFile = {
  uri: string;
  type: string;
  name: string;
};

export type ComplaintStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

type ComplaintType = 'REPORT' | 'SUGGESTION';

type CreateComplaintPayload = {
  title: string;
  description: string;
  category: string;
  type: ComplaintType;
  token: string;
  refreshToken?: string;
  onTokenRefreshed?: (accessToken: string, refreshToken: string) => void;
  onRefreshFailed?: () => void;
  id_building?: number;
  classroom?: string;
  images?: LocalImageFile[];
};

export async function createComplaint(payload: CreateComplaintPayload) {
  const formData = new FormData();

  formData.append('title', payload.title.trim());
  formData.append('description', payload.description.trim());
  formData.append('category', payload.category);
  formData.append('type', payload.type);

  if (payload.type === 'REPORT') {
    if (typeof payload.id_building === 'number') {
      formData.append('id_building', String(payload.id_building));
    }

    if (payload.classroom?.trim()) {
      formData.append('classroom', payload.classroom.trim());
    }

    if (payload.images?.length) {
      payload.images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || `image_${index}.jpg`,
        } as any);
      });
    }
  }

  return apiRequest({
    method: 'POST',
    path: '/complaints',
    body: formData,
    token: payload.token,
    refreshToken: payload.refreshToken,
    onTokenRefreshed: payload.onTokenRefreshed,
    onRefreshFailed: payload.onRefreshFailed,
    isMultipart: true,
  });
}

type AuthenticatedRequestPayload = {
  token: string;
  refreshToken?: string;
  onTokenRefreshed?: (accessToken: string, refreshToken: string) => void;
  onRefreshFailed?: () => void;
};

export async function getAllComplaints<T>(
  payload: AuthenticatedRequestPayload,
  params?: { page?: number; limit?: number },
) {
  const query =
    params?.page && params?.limit
      ? `?page=${params.page}&limit=${params.limit}`
      : '';

  return apiRequest<T>({
    method: 'GET',
    path: `/complaints${query}`,
    token: payload.token,
    refreshToken: payload.refreshToken,
    onTokenRefreshed: payload.onTokenRefreshed,
    onRefreshFailed: payload.onRefreshFailed,
  });
}

export async function updateComplaintStatus(
  complaintId: number | string,
  status: ComplaintStatus,
  payload: AuthenticatedRequestPayload,
) {
  return apiRequest({
    method: 'PATCH',
    path: `/complaints/${complaintId}/status`,
    body: { status },
    token: payload.token,
    refreshToken: payload.refreshToken,
    onTokenRefreshed: payload.onTokenRefreshed,
    onRefreshFailed: payload.onRefreshFailed,
  });
}

export async function uploadComplaintEvidence(
  complaintId: number | string,
  file: LocalImageFile,
  payload: AuthenticatedRequestPayload,
) {
  const formData = new FormData();

  formData.append('file', {
    uri: file.uri,
    type: file.type || 'image/jpeg',
    name: file.name || 'evidence.jpg',
  } as any);

  return apiRequest({
    method: 'POST',
    path: `/complaints/${complaintId}/evidence`,
    body: formData,
    token: payload.token,
    refreshToken: payload.refreshToken,
    onTokenRefreshed: payload.onTokenRefreshed,
    onRefreshFailed: payload.onRefreshFailed,
    isMultipart: true,
  });
}
