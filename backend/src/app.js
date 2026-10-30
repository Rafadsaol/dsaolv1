import express from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import pg from 'pg';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createDatabase } from './repositories/db.js';
import { createMailer } from './services/mail.js';
import { createAuthService } from './services/auth.js';
import { adminService } from './services/admin.js';
import { apiRoutes } from './routes/api.js';
import { authentication } from './middlewares/security.js';
import { errorHandler } from './lib/errors.js';
const root = fileURLToPath(new URL('../../', import.meta.url));
const web = fileURLToPath(new URL('../public/', import.meta.url));
export async function createApp(config) {
  const db = createDatabase(config.DATABASE_URL);
  const pool = new pg.Pool({ connectionString: config.DATABASE_URL });
  pool.on('error', () => console.error('Conexão de sessões indisponível.'));
  const PgStore = connectPg(session);
  const store = new PgStore({ pool, tableName: 'session', createTableIfMissing: false, pruneSessionInterval: 60 });
  const app = express(); app.disable('x-powered-by'); app.set('trust proxy', config.trustProxy);
  app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'"], imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"], objectSrc: ["'none'"], frameAncestors: ["'none'"], upgradeInsecureRequests: config.production ? [] : null } }, referrerPolicy: { policy: 'no-referrer' }, strictTransportSecurity: config.production ? undefined : false }));
  app.use(express.json({ limit: '16kb', type: 'application/json' }));
  app.use(session({ name: 'dsaol.sid', secret: config.SESSION_SECRET, store, resave: false, saveUninitialized: false,
    cookie: { httpOnly: true, secure: config.secureCookies, sameSite: 'lax', maxAge: 8 * 60 * 60_000, path: '/' } }));
  const auth = await createAuthService(db, createMailer(config));
  app.use('/api/v1', rateLimit({ windowMs: 15 * 60_000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message: 'Muitas requisições. Tente novamente mais tarde.' } } }), apiRoutes(db, config, auth, adminService(db)));
  app.use('/auth', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); }, express.static(path.join(web, 'auth'), { dotfiles: 'deny' }));
  const { requireAuth, requireAdmin } = authentication(db);
  app.use('/admin', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!req.session.userId) return res.redirect('/auth/login.html');
    next();
  }, requireAuth, requireAdmin, express.static(path.join(web, 'admin'), { dotfiles: 'deny' }));
  // Nunca servir a raiz do checkout: .env, migrations, backups e node_modules ficam fora da lista.
  for (const name of ['index.html', 'style.css', 'script.js', 'config.js', 'orcamento.js', 'solicitacoes.js', 'favicon.svg']) {
    app.get(name === 'index.html' ? ['/', '/index.html'] : `/${name}`, (req, res) => res.sendFile(path.join(root, name)));
  }
  // Fontes locais e SVG públicos; nunca expor a raiz ou arquivos internos.
  app.use('/assets', (req, res, next) => {
    if (!/\.(woff2|svg)$/i.test(req.path)) return res.sendStatus(404);
    next();
  }, express.static(path.join(root, 'assets'), { dotfiles: 'deny' }));
  for (const directory of ['servicos', 'projetos']) app.use(`/${directory}`, (req, res, next) => {
    if (path.extname(req.path) && !/\.(html|css|js|svg|png|jpg|jpeg|webp|ico)$/i.test(req.path)) return res.sendStatus(404);
    next();
  }, express.static(path.join(root, directory), { dotfiles: 'deny' }));
  app.use((req, res) => res.status(404).type('text').send('Página não encontrada.'));
  app.use(errorHandler);
  app.locals.db = db;
  app.locals.close = async () => { store.close(); await pool.end(); await db.$disconnect(); };
  return app;
}
