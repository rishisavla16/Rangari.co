import { neon } from '@neondatabase/serverless';

export function database() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  return neon(process.env.DATABASE_URL);
}

export async function getSiteContent() {
  const sql = database();
  const [contentRows, gallery] = await Promise.all([
    sql('SELECT content_key, value FROM site_content', []),
    sql('SELECT id, legacy_id, title, description, primary_image, images, sort_order FROM gallery_cards ORDER BY sort_order, created_at', [])
  ]);
  const content = Object.fromEntries(contentRows.map((row) => [row.content_key, row.value]));
  return { ...content, gallery: gallery.map((card) => ({ ...card, images: card.images || [] })) };
}

export async function getUserByEmail(email) {
  const sql = database();
  const rows = await sql('SELECT id, email, password_hash, role FROM users WHERE email = $1 LIMIT 1', [email]);
  return rows[0] || null;
}

export async function createUser({ email, passwordHash }) {
  const sql = database();
  const rows = await sql(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
    [email, passwordHash, 'admin']
  );
  return rows[0];
}

export async function updateContent(contentKey, value) {
  const sql = database();
  const rows = await sql(
    'INSERT INTO site_content (content_key, value, updated_at) VALUES ($1, $2::jsonb, now()) ON CONFLICT (content_key) DO UPDATE SET value = EXCLUDED.value, updated_at = now() RETURNING content_key, value',
    [contentKey, JSON.stringify(value)]
  );
  return rows[0];
}

export async function saveGalleryCard(card) {
  const sql = database();
  const params = [card.title, card.description, card.primaryImage, JSON.stringify(card.images), card.sortOrder];
  if (card.id) {
    const rows = await sql(
      'UPDATE gallery_cards SET title = $1, description = $2, primary_image = $3, images = $4::jsonb, sort_order = $5, updated_at = now() WHERE id = $6 RETURNING id, legacy_id, title, description, primary_image, images, sort_order',
      [...params, card.id]
    );
    return rows[0] || null;
  }
  const rows = await sql(
    'INSERT INTO gallery_cards (title, description, primary_image, images, sort_order) VALUES ($1, $2, $3, $4::jsonb, $5) RETURNING id, legacy_id, title, description, primary_image, images, sort_order',
    params
  );
  return rows[0];
}

export async function deleteGalleryCard(id) {
  const sql = database();
  const rows = await sql('DELETE FROM gallery_cards WHERE id = $1 RETURNING id', [id]);
  return rows.length > 0;
}
