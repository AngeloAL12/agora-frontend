import { Club } from '@/types/club';
import { useMemo, useState } from 'react';

export const useClubSearch = (clubs: Club[]) => {
  const [searchText, setSearchText] = useState('');

  const filteredClubs = useMemo(() => {
    const normalizedQuery = searchText.trim().toLowerCase();

    if (!normalizedQuery) return clubs;

    return clubs.filter((club) =>
      club.title.toLowerCase().includes(normalizedQuery),
    );
  }, [clubs, searchText]);

  return {
    searchText,
    setSearchText,
    filteredClubs,
  };
};
