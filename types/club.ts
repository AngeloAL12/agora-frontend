export type ClubTabKey = 'publicaciones' | 'eventos';

export interface ClubStatsData {
  members: number;
  publications: number;
}

export interface ClubPost {
  id: string;
  author: string;
  publishedAt: string;
  content: string;
  imageUrl: string;
  likes: number;
  comments: number;
  authorInitials: string;
}

export interface ClubDetail {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  initials: string;
  isMember: boolean;
  stats: ClubStatsData;
  posts: ClubPost[];
  events: ClubEvent[];
}

export interface ClubEvent {
  id: string;
  month: string;
  day: string;
  title: string;
  time: string;
}
