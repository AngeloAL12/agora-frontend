import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { ClubChat } from '@/constants/chats';
import { useAuth } from '@/context/AuthContext';
import { clubChatManager } from '@/services/clubChatManager';
import { useAuthRequest } from './useAuthRequest';

interface ClubDetailResponse {
  id: number;
  name: string;
  profile_image: string | null;
  cover_image: string | null;
  id_category: number;
  id_leader: number;
  members_count: number;
  created_at: string;
}

const IA_CHAT: ClubChat = {
  id: 'bufalo-ia',
  name: 'Bufi',
  type: 'ia',
  avatarSource: null,
  lastMessage: '¡Hola! Soy el asistente virtual del…',
  timestamp: 'Ahora',
  unreadCount: 0,
};

export function useMyChats() {
  const authRequest = useAuthRequest();
  const { token, user } = useAuth();
  const [chats, setChats] = useState<ClubChat[]>([IA_CHAT]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      setError(null);
      try {
        const clubs = await authRequest<ClubDetailResponse[]>({
          method: 'GET',
          path: '/clubs/me',
        });
        const clubChats: ClubChat[] = clubs.map((club) => ({
          id: String(club.id),
          name: club.name,
          type: 'club' as const,
          avatarSource: club.profile_image ? { uri: club.profile_image } : null,
          lastMessage: '',
          timestamp: '',
        }));
        setChats([IA_CHAT, ...clubChats]);
      } catch {
        setError('No se pudieron cargar los chats.');
      } finally {
        setIsLoading(false);
      }
    },
    [authRequest],
  );

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useFocusEffect(
    useCallback(() => {
      fetchChats(true);
    }, [fetchChats]),
  );

  useEffect(() => {
    if (!token || !user?.id) return;
    const clubIds = chats.filter((c) => c.type === 'club').map((c) => c.id);
    if (clubIds.length > 0) {
      clubChatManager.init(clubIds, token, user.id);
    }
  }, [token, user?.id, chats]);

  return { chats, isLoading, error, refetch: fetchChats };
}
