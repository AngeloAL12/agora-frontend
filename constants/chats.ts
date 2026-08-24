/**
 * Mock data para la pantalla de Mensajes.
 * Cuando la funcionalidad de chats de clubs esté implementada en el backend,
 * este mock será reemplazado por datos reales de la API.
 */

export type ChatType = 'ia' | 'club';

export interface ClubChat {
  id: string;
  name: string;
  type: ChatType;
  /** URI remoto o require() local. null = usar placeholder */
  avatarSource: { uri: string } | null;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  sortKey?: number;
}

export const CLUB_CHATS_MOCK: ClubChat[] = [
  {
    id: 'bufalo-ia',
    name: 'Bufi',
    type: 'ia',
    avatarSource: null, // usa el asset local de IA
    lastMessage: '¡Hola! Soy el asistente virtual del…',
    timestamp: 'Ahora',
    unreadCount: 1,
  },
  {
    id: 'club-robotica',
    name: 'Club de Robótica',
    type: 'club',
    avatarSource: null,
    lastMessage: 'Carlos: ¿Quién trae el soldador…',
    timestamp: '10:45 AM',
    unreadCount: 12,
  },
  {
    id: 'club-programacion',
    name: 'Club de programación',
    type: 'club',
    avatarSource: null,
    lastMessage: 'Ya envié el reporte de cálculo, aví…',
    timestamp: 'Ayer',
  },
  {
    id: 'club-futbol',
    name: 'Club de futbol',
    type: 'club',
    avatarSource: null,
    lastMessage: '¿Vamos a ir a la biblioteca saliendo …',
    timestamp: 'Lunes',
  },
  {
    id: 'club-beisbol',
    name: 'Club de beisbol',
    type: 'club',
    avatarSource: null,
    lastMessage: 'Se les recuerda que la junta informa…',
    timestamp: '24 Oct',
  },
];
