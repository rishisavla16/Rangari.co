import { del } from '@vercel/blob';
import { requireAdmin } from '../_lib/auth.js';
import { allowMethod, badRequest, readBody } from '../_lib/http.js';

const blobPattern = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i;

export default async function handler(req, res) {
  if (!allowMethod(req, res, ['DELETE'])) return;
  if (!await requireAdmin(req, res)) return;
  const url = String(readBody(req)?.url || '');
  if (!blobPattern.test(url)) return badRequest(res, 'Only public Vercel Blob image URLs can be deleted.');
  try {
    await del(url);
    return res.status(204).end();
  } catch (error) {
    console.error('Blob deletion failed', error);
    return res.status(500).json({ error: 'Image deletion failed.' });
  }
}
