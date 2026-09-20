import { sessionFromRequest } from '../_lib/auth.js';
import { allowMethod } from '../_lib/http.js';

export default async function handler(req, res) {
  if (!allowMethod(req, res, ['GET'])) return;
  const session = await sessionFromRequest(req);
  if (!session) return res.status(401).json({ error: 'Not signed in.' });
  return res.status(200).json({ user: { id: session.sub, email: session.email, role: session.role } });
}
