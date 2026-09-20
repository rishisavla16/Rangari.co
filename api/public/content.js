import { getSiteContent } from '../_lib/db.js';
import { allowMethod } from '../_lib/http.js';

export default async function handler(req, res) {
  if (!allowMethod(req, res, ['GET'])) return;
  try {
    const content = await getSiteContent();
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(content);
  } catch (error) {
    console.error('Public content failed', error);
    return res.status(503).json({ error: 'Content is temporarily unavailable.' });
  }
}
