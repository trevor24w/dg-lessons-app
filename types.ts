export interface VideoData {
  id: string;
  title: string;
  channel: string;
  duration: string;
  views: string;
  viewCount: number; // Numeric representation for sorting
  durationSeconds: number; // Numeric representation for sorting
  isShort: boolean;
  thumbnailUrl?: string;
  topics?: string[]; // Added topics field
}

export type SortOption = 'views' | 'duration' | 'title' | 'channel';
export type SortDirection = 'asc' | 'desc';

export interface FilterOptions {
  search: string;
  channel: string[];
  isShort: boolean | null;
  minDuration: number | null;
  maxDuration: number | null;
  topics: string[]; // Added topics filter
}
