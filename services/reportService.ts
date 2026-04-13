import { apiRequest } from './api';

export type LocalImageFile = {
  uri: string;
  type: string;
  name: string;
};

type ComplaintType = 'REPORT' | 'SUGGESTION';

type CreateComplaintPayload = {
  title: string;
  description: string;
  category: string;
  type: ComplaintType;
  token: string;
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
    isMultipart: true,
  });
}
