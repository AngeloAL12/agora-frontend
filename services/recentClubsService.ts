import * as SecureStore from 'expo-secure-store';

const MAX_RECENT = 10;
const storeKey = (userId: number) => `recent_clubs_${userId}`;

export async function recordClubVisit(
  clubId: number,
  userId: number,
): Promise<void> {
  const raw = await SecureStore.getItemAsync(storeKey(userId));
  const ids: number[] = raw ? (JSON.parse(raw) as number[]) : [];
  const updated = [clubId, ...ids.filter((id) => id !== clubId)].slice(
    0,
    MAX_RECENT,
  );
  await SecureStore.setItemAsync(storeKey(userId), JSON.stringify(updated));
}

export async function getRecentClubIds(userId: number): Promise<number[]> {
  const raw = await SecureStore.getItemAsync(storeKey(userId));
  return raw ? (JSON.parse(raw) as number[]) : [];
}
