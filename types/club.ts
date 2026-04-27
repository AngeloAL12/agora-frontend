export interface ClubResponse {
  id: number;
  name: string;
  description: string;
  profile_image: string | null;
  cover_image: string | null;
  id_category: number;
  id_leader: number;
  members_count: number;
}

export interface ClubCategory {
  id: number;
  name: string;
}

export interface ClubEvent {
  id: number;
  id_club: number;
  title: string;
  description: string | null;
  date: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  author: { id: number; name: string };
}

export interface ClubMember {
  id: number;
  name: string;
  photo: string | null;
  is_leader: boolean;
}

export interface ClubPost {
  id: number;
  author: { id: number; name: string; photo?: string };
  content: string;
  image?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  date: string;
  latitude: number;
  longitude: number;
}
