import { SignJWT, jwtVerify } from 'jose';

const encoder = new TextEncoder();
const cookieName = 'rangari_admin';

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error('AUTH_SECRET must be at least 32 characters.');
  return encoder.encode(value);
}

function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map((item) => {
    const index = item.indexOf('=');
    return index < 0 ? [] : [item.slice(0, index).trim(), decodeURIComponent(item.slice(index + 1).trim())];
  }).filter((entry) => entry.length));
}

export async function sessionFromRequest(req) {
  const token = cookies(req)[cookieName];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === 'admin' && payload.sub ? payload : null;
  } catch { return null; }
}

export async function requireAdmin(req, res) {
  const session = await sessionFromRequest(req);
  if (session) return session;
  res.status(401).json({ error: 'Sign in is required.' });
  return null;
}

export async function setSession(res, user) {
  const token = await new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret());
  const secure = process.env.VERCEL ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${secure}`);
}

export function clearSession(res) {
  const secure = process.env.VERCEL ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}
