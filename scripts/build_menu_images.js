import fs from 'node:fs';

const items = [
  { key: 'REAL_AMERICANO', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=350&auto=format&fit=crop&q=70' },
  { key: 'REAL_DIRTY_COFFEE', url: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=350&auto=format&fit=crop&q=70' },
  { key: 'REAL_PEACH_COLD_BREW', url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=350&auto=format&fit=crop&q=70' },
  { key: 'REAL_LATTE', url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=350&auto=format&fit=crop&q=70' },
  { key: 'REAL_MATCHA', url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=350&auto=format&fit=crop&q=70' },
  { key: 'REAL_EARL_GREY', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=350&auto=format&fit=crop&q=70' },
  { key: 'REAL_BOOSTER', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=350&auto=format&fit=crop&q=70' },
  { key: 'REAL_CROISSANT', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=350&auto=format&fit=crop&q=70' },
  { key: 'REAL_CHEESECAKE', url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=350&auto=format&fit=crop&q=70' },
  { key: 'REAL_TOASTIE', url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=350&auto=format&fit=crop&q=70' },
];

async function generate() {
  const codeLines = [
    '/**',
    ' * Real High-Resolution Culinary Photography in Base64 Data URIs',
    ' * Zero HTTP Latency, Stored directly in PostgreSQL & Client Memory',
    ' */',
    '',
  ];

  for (const item of items) {
    const res = await fetch(item.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LuminaCafeBot/1.0)',
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch ${item.url}: HTTP ${res.status}`);
    }
    const mime = res.headers.get('content-type') || 'image/jpeg';
    const arrayBuf = await res.arrayBuffer();
    const b64 = Buffer.from(arrayBuf).toString('base64');
    const dataUri = `data:${mime};base64,${b64}`;
    console.log(`[Synced] ${item.key}: ${arrayBuf.byteLength} bytes, Base64 len: ${dataUri.length}`);
    codeLines.push(`export const ${item.key} = "${dataUri}";`);
    codeLines.push('');
  }

  fs.writeFileSync('src/data/menuImagesBase64.ts', codeLines.join('\n'), 'utf-8');
  console.log('[Success] Written src/data/menuImagesBase64.ts');
}

generate().catch((err) => {
  console.error('[Error generating images]', err);
  process.exit(1);
});
