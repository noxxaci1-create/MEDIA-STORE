import { getAuth } from 'firebase-admin/auth';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

function init() {
  if (getApps().length) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON belum diatur.');
  initializeApp({ credential: cert(JSON.parse(raw)) });
}
init();

export async function requireUser(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) {
    const e = new Error('Authorization Bearer Firebase ID token diperlukan.'); e.statusCode = 401; throw e;
  }
  return getAuth().verifyIdToken(h.slice(7));
}

export function sendError(res, err) {
  const status = err.statusCode || 500;
  res.status(status).json({ ok: false, error: err.message || 'Internal server error' });
}
