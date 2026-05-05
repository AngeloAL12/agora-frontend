import { Complaint } from '@/hooks/useComplaints';
import { UserProfileResponse } from './authService';
import type { ComplaintDetail } from '@/hooks/useComplaintDetail';
import type { ClubMessage } from '@/hooks/useClubChat';

interface SessionCache<T> {
  data: T;
  token: string;
}

let meDataCache: SessionCache<UserProfileResponse> | null = null;
let complaintsCache: SessionCache<Complaint[]> | null = null;
export const complaintDetailCache: Record<string, ComplaintDetail> = {};
export const sessionMessagesByClub: Record<string, ClubMessage[]> = {};

export const CacheService = {
  getMeData: (token: string) => {
    if (meDataCache && meDataCache.token === token) {
      return meDataCache.data;
    }
    return null;
  },
  setMeData: (data: UserProfileResponse, token: string) => {
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
    for (const key of Object.keys(complaintDetailCache)) {
      delete complaintDetailCache[key];
    }
    for (const key of Object.keys(sessionMessagesByClub)) {
      delete sessionMessagesByClub[key];
    }
  },
};
