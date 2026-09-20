import bcrypt from 'bcryptjs';
import { createUser, getUserByEmail } from '../_lib/db.js';
import { setSession } from '../_lib/auth.js';
import { allowMethod, badRequest, readBody } from '../_lib/http.js';

export default async function handler(req, res) {
  if (!allowMethod(req, res, ['POST'])) return;
  const body = readBody(req);
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');
  if (!email || !password) return badRequest(res, 'Email and password are required.');
  try {
    let user = await getUserByEmail(email);
    if (!user && email === String(process.env.ADMIN_BOOTSTRAP_EMAIL || '').toLowerCase() && password === process.env.ADMIN_BOOTSTRAP_PASSWORD) {
      user = await createUser({ email, passwordHash: await bcrypt.hash(password, 12) });
    } else if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    await setSession(res, user);
    return res.status(200).json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login failed', error);
    return res.status(500).json({ error: 'Unable to sign in. Check the server configuration.' });
  }
}
