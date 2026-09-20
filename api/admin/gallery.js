import { deleteGalleryCard, getSiteContent, saveGalleryCard } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';
import { allowMethod, badRequest, readBody } from '../_lib/http.js';

function cleanCard(body) {
  const title = String(body?.title || '').trim();
  const description = String(body?.description || '').trim();
  const primaryImage = String(body?.primaryImage || '').trim();
  const images = Array.isArray(body?.images) ? body.images.map(String).filter((image) => image.length <= 2_000) : [];
  const sortOrder = Number.isInteger(Number(body?.sortOrder)) ? Number(body.sortOrder) : 0;
  if (!title || title.length > 160 || !primaryImage || primaryImage.length > 2_000 || images.length === 0 || images.length > 100) return null;
  return { id: body?.id ? String(body.id) : null, title, description: description.slice(0, 5_000), primaryImage, images, sortOrder };
}

export default async function handler(req, res) {
  if (!allowMethod(req, res, ['GET', 'POST', 'PUT', 'DELETE'])) return;
  if (!await requireAdmin(req, res)) return;
  try {
    if (req.method === 'GET') return res.status(200).json((await getSiteContent()).gallery);
    if (req.method === 'DELETE') {
      const id = String(req.query?.id || '');
      if (!id) return badRequest(res, 'A card id is required.');
      const deleted = await deleteGalleryCard(id);
      return deleted ? res.status(204).end() : res.status(404).json({ error: 'Gallery card not found.' });
    }
    const card = cleanCard(readBody(req));
    if (!card) return badRequest(res, 'Title, primary image, and at least one image are required.');
    if (req.method === 'PUT' && !card.id) return badRequest(res, 'A card id is required to update a card.');
    return res.status(req.method === 'POST' ? 201 : 200).json(await saveGalleryCard(card));
  } catch (error) {
    console.error('Admin gallery failed', error);
    return res.status(500).json({ error: 'Unable to save the gallery card.' });
  }
}
