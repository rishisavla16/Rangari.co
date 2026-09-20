import { clearSession } from '../_lib/auth.js';
import { allowMethod } from '../_lib/http.js';

export default function handler(req, res) {
  if (!allowMethod(req, res, ['POST'])) return;
  clearSession(res);
  res.status(204).end();
}
