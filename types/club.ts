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
