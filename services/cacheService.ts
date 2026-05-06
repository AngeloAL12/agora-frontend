import { Complaint } from '@/hooks/useComplaints';
import { UserProfileResponse } from './authService';
import type { ComplaintDetail } from '@/hooks/useComplaintDetail';
import type { ClubMessage } from '@/hooks/useClubChat';
import type { ClubResponse } from '@/types/club';

interface SessionCache<T> {
  data: T;
  token: string;
}

let meDataCache: SessionCache<UserProfileResponse> | null = null;
let complaintsCache: SessionCache<Complaint[]> | null = null;
let allClubsCache: SessionCache<ClubResponse[]> | null = null;
let myClubsCache: SessionCache<ClubResponse[]> | null = null;
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

  getAllClubs: (token: string) => {
    if (allClubsCache && allClubsCache.token === token) {
      return allClubsCache.data;
    }
    return null;
  },
  setAllClubs: (data: ClubResponse[], token: string) => {
    allClubsCache = { data, token };
  },
  clearAllClubs: () => {
    allClubsCache = null;
  },

  getMyClubs: (token: string) => {
    if (myClubsCache && myClubsCache.token === token) {
      return myClubsCache.data;
    }
    return null;
  },
  setMyClubs: (data: ClubResponse[], token: string) => {
    myClubsCache = { data, token };
  },
  clearMyClubs: () => {
    myClubsCache = null;
  },

  clearAll: () => {
    meDataCache = null;
    complaintsCache = null;
    allClubsCache = null;
    myClubsCache = null;
    for (const key of Object.keys(complaintDetailCache)) {
      delete complaintDetailCache[key];
    }
    for (const key of Object.keys(sessionMessagesByClub)) {
      delete sessionMessagesByClub[key];
    }
  },
};
