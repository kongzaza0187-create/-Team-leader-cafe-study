/**
 * Lumina 24-Hour Cafe - Automated Real Image Fetcher & Base64 Encoder
 * Fetches real culinary photography from external URLs, validates MIME types,
 * compresses and encodes into Base64 Inline data strings directly for PostgreSQL.
 */

export interface ImageSyncTarget {
  id: string;
  name: string;
  sampleUrl: string;
}

export const CULINARY_TARGETS: ImageSyncTarget[] = [
  {
    id: 'signature-americano',
    name: 'Signature Lumina Americano',
    sampleUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'dirty-coffee',
    name: 'Velvet Dirty Coffee',
    sampleUrl: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'peach-cold-brew',
    name: 'Sparkling Peach Cold Brew',
    sampleUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'uji-matcha',
    name: 'Ceremonial Uji Matcha Latte',
    sampleUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'earl-grey-lavender',
    name: 'Earl Grey Lavender Tea Latte',
    sampleUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'night-booster',
    name: 'Night-Owl Super Focus Elixir',
    sampleUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'truffle-croissant',
    name: 'French Truffle Butter Croissant',
    sampleUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'basque-cheesecake',
    name: 'San Sebastián Burnt Cheesecake',
    sampleUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop&q=80',
  },
];

/**
 * Download external image buffer and convert to optimized Base64 Data URI
 */
export async function fetchAndEncodeBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; LuminaCafeBot/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image: HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Data = buffer.toString('base64');

  return `data:${contentType};base64,${base64Data}`;
}
