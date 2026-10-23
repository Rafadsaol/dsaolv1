import { randomBytes, timingSafeEqual } from 'node:crypto';
import { HttpError } from '../lib/errors.js';
import { publicUser } from '../repositories/selectors.js';
export function csrfToken(req) { return req.session.csrfToken ||= randomBytes(32).toString('hex'); }
export function sameOrigin(config) {
  return (req, res, next) => {
    const origin = req.get('origin');
    if (origin && origin !== config.APP_ORIGIN) return next(new HttpError(403, 'Origem não permitida.', 'ORIGIN_REJECTED'));
    if (origin === config.APP_ORIGIN) { res.set('Access-Control-Allow-Origin', origin); res.set('Access-Control-Allow-Credentials', 'true'); res.vary('Origin'); }
    if (req.method === 'OPTIONS') { res.set('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token, Idempotency-Key'); res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE'); return res.sendStatus(204); }
    next();
  };
}
export function requireCsrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const provided = req.get('X-CSRF-Token');
  const expected = req.session.csrfToken;
  if (!expected || !provided || !/^[a-f0-9]{64}$/.test(provided) || !timingSafeEqual(Buffer.from(expected), Buffer.from(provided))) return next(new HttpError(403, 'Atualize a página e tente novamente.', 'CSRF_INVALID'));
  next();
}
export function authentication(db) {
  const requireAuth = async (req, res, next) => {
    if (!req.session.userId) return next(new HttpError(401, 'Entre na sua conta para continuar.', 'UNAUTHENTICATED'));
    const user = await db.user.findUnique({ where: { id: req.session.userId }, select: publicUser });
    if (!user) return next(new HttpError(401, 'Sessão inválida.', 'UNAUTHENTICATED'));
    req.user = user; next();
  };
  const requireAdmin = (req, res, next) => req.user?.role === 'ADMIN' ? next() : next(new HttpError(403, 'Acesso restrito ao administrador.', 'FORBIDDEN'));
  return { requireAuth, requireAdmin };
}
