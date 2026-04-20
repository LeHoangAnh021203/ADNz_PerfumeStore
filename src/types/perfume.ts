export interface PerfumeMedia {
  thumbnail: string | null;
  images: string[];
  videos: string[];
}

export interface Perfume {
  _id: string;
  brand: string;
  brand_slug: string;
  fragrance_name: string;
  full_name: string;
  slug: string;
  requested_terms?: string[];
  category: string;
  gender: string;
  concentration: string | null;
  olfactive_family: string;
  key_notes: string[];
  top_notes: string[];
  middle_notes: string[];
  base_notes: string[];
  official_description_excerpt: string;
  source_url: string;
  source_quality?: string;
  media: PerfumeMedia;
  is_active: boolean;
  notes_source_url?: string;
  notes_source_quality?: string;
}
