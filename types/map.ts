export interface MapPosition {
  x: number;
  y: number;
}

export type BuildingCategory = 'edificio' | 'laboratorio' | 'otro';

export interface BuildingData {
  id: number;
  code: string;
  label: string;
  aliases: string[];
  position: MapPosition;
  radius: number;
  category: BuildingCategory;
}

export interface PointOfInterestData {
  id: number;
  name: string;
  position: MapPosition;
  radius: number;
}

export interface RouteNode {
  id: string;
  position: MapPosition;
  buildingId?: number;
}

export interface RouteEdge {
  from: string;
  to: string;
  weight: number;
}

export interface GpsReference {
  gps: { latitude: number; longitude: number };
  pixel: MapPosition;
}

export interface BuildingMediaItem {
  id: number;
  url: string;
  floor: number;
}

export interface BuildingDetailResponse {
  id: number;
  name: string;
  description: string | null;
  images: BuildingMediaItem[];
  views_360: BuildingMediaItem[];
  created_at: string;
}

export interface PointMediaItem {
  id: number;
  url: string;
}

export interface PointDetailResponse {
  id: number;
  name: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  images: PointMediaItem[];
  views_360: PointMediaItem[];
  created_at: string;
}
