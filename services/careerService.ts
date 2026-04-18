import { apiRequest } from './api';

import type { Career } from '@/types/career';

export async function getCareers(token?: string): Promise<Career[]> {
  return apiRequest<Career[]>({
    method: 'GET',
    path: '/careers',
    token,
  });
}
