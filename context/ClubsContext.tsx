import React, { createContext, useContext, useMemo, useState } from 'react';
import { Club } from '@/types/club';

const INITIAL_DISCOVER_CLUBS: Club[] = [
  {
    id: '1',
    title: 'Club de Ajedrez',
    members: 42,
    image:
      'https://images.unsplash.com/photo-1580541832626-2a7131ee809f?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '2',
    title: 'Huerto Universitario',
    members: 15,
    iconName: 'leaf-outline',
  },
  {
    id: '3',
    title: 'Robótica Mexicali',
    members: 88,
    iconName: 'hardware-chip-outline',
  },
  {
    id: '4',
    title: 'Club de programación',
    members: 88,
    iconName: 'code-slash-outline',
  },
  {
    id: '5',
    title: 'Club de futbol',
    members: 88,
    iconName: 'football-outline',
  },
  {
    id: '6',
    title: 'Club de beisbol',
    members: 88,
    iconName: 'baseball-outline',
  },
];

type ClubsContextType = {
  myClubs: Club[];
  discoverClubs: Club[];
  joinClub: (club: Club) => void;
  leaveClub: (clubId: string) => void;
};

const ClubsContext = createContext<ClubsContextType | undefined>(undefined);

export const ClubsProvider = ({ children }: { children: React.ReactNode }) => {
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [discoverClubs, setDiscoverClubs] = useState<Club[]>(
    INITIAL_DISCOVER_CLUBS,
  );

  const joinClub = (club: Club) => {
    const joinedClub: Club = {
      ...club,
      joined: true,
      event: 'Evento: Próximamente',
    };

    setDiscoverClubs((prev) => prev.filter((item) => item.id !== club.id));
    setMyClubs((prev) => [joinedClub, ...prev]);
  };

  const leaveClub = (clubId: string) => {
    const clubToLeave = myClubs.find((club) => club.id === clubId);
    if (!clubToLeave) return;

    const restoredClub: Club = {
      id: clubToLeave.id,
      title: clubToLeave.title,
      members: clubToLeave.members ?? 88,
      image: clubToLeave.image,
      iconName: clubToLeave.iconName,
    };

    setMyClubs((prev) => prev.filter((club) => club.id !== clubId));
    setDiscoverClubs((prev) => [restoredClub, ...prev]);
  };

  const value = useMemo(
    () => ({
      myClubs,
      discoverClubs,
      joinClub,
      leaveClub,
    }),
    [myClubs, discoverClubs],
  );

  return (
    <ClubsContext.Provider value={value}>{children}</ClubsContext.Provider>
  );
};

export const useClubs = () => {
  const context = useContext(ClubsContext);

  if (!context) {
    throw new Error('useClubs debe usarse dentro de ClubsProvider');
  }

  return context;
};
