import { getSiteContent, updateContent } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';
import { allowMethod, badRequest, readBody } from '../_lib/http.js';

const allowedKeys = new Set(['home', 'about', 'footer']);

export default async function handler(req, res) {
  if (!allowMethod(req, res, ['GET', 'PUT'])) return;
  if (!await requireAdmin(req, res)) return;
  try {
    if (req.method === 'GET') return res.status(200).json(await getSiteContent());
    const body = readBody(req);
    if (!allowedKeys.has(body?.key) || !body?.value || typeof body.value !== 'object') return badRequest(res, 'A valid content section is required.');
    return res.status(200).json(await updateContent(body.key, body.value));
  } catch (error) {
    console.error('Admin content failed', error);
    return res.status(500).json({ error: 'Unable to save content.' });
  }
}
