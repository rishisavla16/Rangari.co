import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL before seeding.');
const sql = neon(process.env.DATABASE_URL);
const readJson = async (file) => JSON.parse(await readFile(new URL(`../public/data/${file}`, import.meta.url), 'utf8'));
const [home, about, footer, gallery] = await Promise.all(['home.json', 'about.json', 'footer.json', 'gallery.json'].map(readJson));

for (const [key, value] of Object.entries({ home, about, footer })) {
  await sql('INSERT INTO site_content (content_key, value, updated_at) VALUES ($1, $2::jsonb, now()) ON CONFLICT (content_key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()', [key, JSON.stringify(value)]);
}
for (const [index, card] of gallery.cards.entries()) {
  const image = (filename) => `/assets/images/${filename}`;
  await sql(
    'INSERT INTO gallery_cards (legacy_id, title, description, primary_image, images, sort_order) VALUES ($1, $2, $3, $4, $5::jsonb, $6) ON CONFLICT (legacy_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, primary_image = EXCLUDED.primary_image, images = EXCLUDED.images, sort_order = EXCLUDED.sort_order, updated_at = now()',
    [card.id, card.title, card.description, image(card.primary), JSON.stringify(card.images.map(image)), index]
  );
}
console.log(`Seeded ${gallery.cards.length} gallery cards and public site content.`);
