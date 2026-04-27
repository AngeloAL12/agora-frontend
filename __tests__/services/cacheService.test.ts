import { Complaint } from '@/hooks/useComplaints';
import { UserProfileResponse } from '@/services/authService';
import { CacheService } from '@/services/cacheService';

const tokenA = 'token-a';
const tokenB = 'token-b';

const meData: UserProfileResponse = {
  id: 1,
  email: 'user@example.com',
  role: 'student',
  name: 'User One',
  full_name: 'User One Full',
  clubs_count: 2,
  complaints_count: 3,
  likes_count: 4,
  career: 'Engineering',
  photo: null,
  avatar_url: null,
};

const complaints: Complaint[] = [
  {
    id: 10,
    type: 'complaint',
    title: 'Broken light',
    description: 'Hallway light is broken',
    status: 'OPEN',
    created_at: '2026-04-18T00:00:00.000Z',
  },
];

describe('CacheService', () => {
  beforeEach(() => {
    CacheService.clearAll();
  });

  it('returns me data for the same token and null for different token', () => {
    CacheService.setMeData(meData, tokenA);

    expect(CacheService.getMeData(tokenA)).toEqual(meData);
    expect(CacheService.getMeData(tokenB)).toBeNull();
  });

  it('clears me data cache', () => {
    CacheService.setMeData(meData, tokenA);
    CacheService.clearMeData();

    expect(CacheService.getMeData(tokenA)).toBeNull();
  });

  it('returns complaints for the same token and null for different token', () => {
    CacheService.setComplaints(complaints, tokenA);

    expect(CacheService.getComplaints(tokenA)).toEqual(complaints);
    expect(CacheService.getComplaints(tokenB)).toBeNull();
  });

  it('clears complaints cache', () => {
    CacheService.setComplaints(complaints, tokenA);
    CacheService.clearComplaints();

    expect(CacheService.getComplaints(tokenA)).toBeNull();
  });

  it('clears all caches', () => {
    CacheService.setMeData(meData, tokenA);
    CacheService.setComplaints(complaints, tokenA);

    CacheService.clearAll();

    expect(CacheService.getMeData(tokenA)).toBeNull();
    expect(CacheService.getComplaints(tokenA)).toBeNull();
  });
});
