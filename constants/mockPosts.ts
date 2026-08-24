import { ClubPost } from '@/types/club';

export const MOCK_POSTS: ClubPost[] = [
  {
    id: 1,
    id_club: 1,
    author: { id: 1, name: 'Angelo Alvarado' },
    content:
      '¡Preparándonos para el concurso nacional!\nHoy probamos los sensores de proximidad con gran éxito. 🦾 #TecNMMexicali #Robotics',
    images: [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
      },
    ],
    like_count: 124,
    user_has_liked: false,
    comment_count: 18,
    created_at: new Date(Date.now() - 2 * 3_600_000).toISOString(),
  },
  {
    id: 2,
    id_club: 1,
    author: { id: 2, name: 'Sofía Martínez' },
    content:
      'Reunión de planeación el viernes a las 4pm en el Lab B-201. ¡Todos los miembros están invitados! 📅',
    images: [],
    like_count: 47,
    user_has_liked: false,
    comment_count: 6,
    created_at: new Date(Date.now() - 26 * 3_600_000).toISOString(),
  },
  {
    id: 3,
    id_club: 1,
    author: { id: 3, name: 'Carlos Mendoza' },
    content:
      'Compartimos los avances del proyecto de brazo robótico. ¡El equipo está haciendo un gran trabajo! 💪 #Innovación',
    images: [
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1561144257-e32e8efc6c4f?w=800&q=80',
      },
    ],
    like_count: 89,
    user_has_liked: false,
    comment_count: 12,
    created_at: new Date(Date.now() - 3 * 24 * 3_600_000).toISOString(),
  },
];
