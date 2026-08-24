import { useMemo } from 'react';

export function useSearch<T>(
  searchQuery: string,
  data: T[],
  searchKey: keyof T | (keyof T)[],
) {
  const searchKeyDeps = Array.isArray(searchKey)
    ? searchKey.join(',')
    : String(searchKey);

  return useMemo(() => {
    const removeAccents = (str: string) =>
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const query = removeAccents(searchQuery.trim().toLowerCase());
    if (!query || !data) return data;

    const keys = searchKeyDeps.split(',') as (keyof T)[];

    return data.filter((item) => {
      return keys.some((key) => {
        const val = item[key];
        if (typeof val === 'string') {
          return removeAccents(val.toLowerCase()).includes(query);
        }
        return false;
      });
    });
  }, [searchQuery, data, searchKeyDeps]);
}
