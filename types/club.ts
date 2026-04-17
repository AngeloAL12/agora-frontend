export type ClubIconName =
  | 'leaf-outline'
  | 'hardware-chip-outline'
  | 'code-slash-outline'
  | 'football-outline'
  | 'baseball-outline'
  | 'people-outline';

export interface Club {
  id: string;
  title: string;
  members?: number;
  image?: string;
  iconName?: string;
  joined?: boolean;
  event?: string;
}
