export interface Painting {
  id: string;
  title: string;
  description: string | null;
  year: number | null;
  dimensions: string | null;
  technique: string | null;
  image_url: string;
  thumbnail_url: string | null;
  category: string | null;
  is_sold: boolean;
  price: number | null;
  display_order: number;
  created_at: string;
  updated_at: string;
  // AI-generated fields
  ai_description: string | null;
  ai_keywords: string[] | null;
  ai_mood: string | null;
  ai_colors: string[] | null;
  gallery_images?: PaintingGalleryImage[];
}

export interface PaintingGalleryImage {
  id: string;
  painting_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface PaintingFormData {
  title: string;
  description?: string;
  year?: number;
  dimensions?: string;
  technique?: string;
  category?: string;
  is_sold?: boolean;
  price?: number;
}

export type Category = 'Paisagem' | 'Retrato' | 'Natureza Morta' | 'Abstrato' | 'Marinha' | 'Flores' | 'Outro';

export const CATEGORIES: Category[] = [
  'Paisagem',
  'Retrato',
  'Natureza Morta',
  'Abstrato',
  'Marinha',
  'Flores',
  'Outro'
];
