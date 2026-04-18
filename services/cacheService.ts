import { Complaint } from '@/hooks/useComplaints';
import { UserMeResponse } from './authService';

interface SessionCache<T> {
  data: T;
  token: string;
}

let meDataCache: SessionCache<UserMeResponse> | null = null;
let complaintsCache: SessionCache<Complaint[]> | null = null;

export const CacheService = {
  getMeData: (token: string) => {
    if (meDataCache && meDataCache.token === token) {
      return meDataCache.data;
    }
    return null;
  },
  setMeData: (data: UserMeResponse, token: string) => {
    meDataCache = { data, token };
  },
  clearMeData: () => {
    meDataCache = null;
  },

  getComplaints: (token: string) => {
    if (complaintsCache && complaintsCache.token === token) {
      return complaintsCache.data;
    }
    return null;
  },
  setComplaints: (data: Complaint[], token: string) => {
    complaintsCache = { data, token };
  },
  clearComplaints: () => {
    complaintsCache = null;
  },

  clearAll: () => {
    meDataCache = null;
    complaintsCache = null;
  },
};
