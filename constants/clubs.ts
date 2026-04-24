import { ClubDetail } from '../types/club';

export const CLUB_DETAIL_MOCK: ClubDetail = {
  id: 'club-robotica',
  name: 'Club de Robótica',
  description: 'Innovación y desarrollo tecnológico del TecNM Mexicali.',
  coverImage:
    'https://images.unsplash.com/photo-1561144257-e32e8efc6c4f?auto=format&fit=crop&w=1200&q=80',
  initials: 'AA',
  isMember: true,
  stats: {
    members: 42,
    publications: 156,
  },
  posts: [
    {
      id: 'post-1',
      author: 'Angelo Alvarado',
      publishedAt: 'HACE 2 HORAS',
      content:
        '¡Preparándonos para el concurso nacional! Hoy probamos los sensores de proximidad con gran éxito. #TecNMMexicali #Robotics',
      imageUrl:
        'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=1200&q=80',
      likes: 124,
      comments: 18,
      authorInitials: 'AA',
    },
  ],
  events: [
    {
      id: 'event-1',
      month: 'OCT',
      day: '22',
      title: 'Hackathon de Hardware',
      time: '09:00 AM',
    },
    {
      id: 'event-2',
      month: 'NOV',
      day: '05',
      title: 'Prototipos 3D',
      time: '11:00 AM',
    },
    {
      id: 'event-3',
      month: 'NOV',
      day: '12',
      title: 'Visita Industrial',
      time: '10:00 AM',
    },
  ],
};
