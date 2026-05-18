import { apiRequest } from './api';

import type { BuildingDetailResponse, PointDetailResponse } from '@/types/map';

export function getBuildingDetail(id: number, token: string) {
  return apiRequest<BuildingDetailResponse>({
    method: 'GET',
    path: `/map/buildings/${id}`,
    token,
  });
}

export function getPointDetail(id: number, token: string) {
  return apiRequest<PointDetailResponse>({
    method: 'GET',
    path: `/map/points/${id}`,
    token,
  });
}
