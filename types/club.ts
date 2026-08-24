export interface ClubResponse {
  id: number;
  name: string;
  description: string;
  profile_image: string | null;
  cover_image: string | null;
  id_category: number | null;
  id_leader: number;
  is_private: boolean;
  members_count: number;
  user_is_member?: boolean;
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

export interface ClubPostImage {
  id: number;
  url: string;
}

export interface ClubPost {
  id: number;
  id_club: number;
  author: { id: number; name: string; photo?: string | null };
  content: string;
  images: ClubPostImage[];
  like_count: number;
  user_has_liked: boolean;
  comment_count: number;
  created_at: string;
}

export interface PostComment {
  id: number;
  id_post: number;
  content: string;
  created_at: string;
  user: { id: number; name: string; photo: string | null };
}

export interface CreateEventPayload {
  title: string;
  description: string;
  date: string;
  latitude: number;
  longitude: number;
}
