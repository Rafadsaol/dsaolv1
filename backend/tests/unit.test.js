import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import { randomBytes } from 'node:crypto';
import { schemas, parse, validPhone } from '../src/lib/validation.js';
import { loadConfig } from '../src/config/env.js';
import { hashPassword, verifyPassword, randomToken, hashToken } from '../src/services/passwords.js';
import { requireCsrf, sameOrigin } from '../src/middlewares/security.js';
import { errorHandler } from '../src/lib/errors.js';
test('Argon2id verifica senha e rejeita senha diferente', async () => {
  const secret = randomBytes(24).toString('hex'), hash = await hashPassword(secret);
  assert.ok(hash.startsWith('$argon2id$')); assert.notEqual(hash, secret); assert.equal(await verifyPassword(hash, secret), true); assert.equal(await verifyPassword(hash, 'senha-ficticia-incorreta'), false);
});
test('cadastro rejeita role do navegador, senha curta e e-mail inválido', () => {
  const data = { name: 'Pessoa Fictícia', email: 'pessoa@example.test', password: 'uma-senha-ficticia-longa' };
  assert.equal(parse(schemas.signup, { ...data, email: 'PESSOA@EXAMPLE.TEST' }).email, 'pessoa@example.test');
  for (const extra of [{ role: 'ADMIN' }, { password: 'curta' }, { email: 'invalido' }]) assert.throws(() => parse(schemas.signup, { ...data, ...extra }));
});
test('telefone, consentimento, UUID, projeto e paginação validados', () => {
  assert.equal(validPhone('+55 (41) 91234-5678'), true); assert.equal(validPhone('(20) 99999-9999'), false);
  assert.throws(() => parse(schemas.request, { name: 'Teste Fictício', email: 'falso@example.test', phone: '41912345678', service: 'sites', message: 'Uma descrição fictícia suficientemente longa.', consent: false }));
  assert.throws(() => parse(schemas.pagination, { pageSize: 1000 })); assert.throws(() => parse(schemas.id, '../.env'));
  assert.throws(() => parse(schemas.project, { title: 'abc', description: 'curta', status: 'INVENTADO', customerId: 'nao-uuid' }));
});
test('tokens são aleatórios, hash determinístico e diferente do token', () => {
  const a = randomToken(), b = randomToken(); assert.match(a, /^[a-f0-9]{64}$/); assert.notEqual(a, b); assert.equal(hashToken(a), hashToken(a)); assert.notEqual(hashToken(a), a);
});
test('CSRF bloqueia token ausente/incorreto e aceita token da sessão', async () => {
  const token = randomToken(), app = express();
  // Fixture isolada do middleware; autenticação do produto usa sessão PostgreSQL real.
  app.use((req, res, next) => { req.session = { csrfToken: token }; next(); }); app.use(requireCsrf); app.post('/', (req, res) => res.sendStatus(204)); app.use(errorHandler);
  await request(app).post('/').expect(403); await request(app).post('/').set('X-CSRF-Token', '0'.repeat(64)).expect(403); await request(app).post('/').set('X-CSRF-Token', token).expect(204);
});
test('origens arbitrárias não recebem acesso com credenciais', async () => {
  const app = express(); app.use(sameOrigin({ APP_ORIGIN: 'http://127.0.0.1:3000' })); app.get('/', (req, res) => res.json({ ok: true })); app.use(errorHandler);
  const rejected = await request(app).get('/').set('Origin', 'https://outra-origem.example').expect(403); assert.equal(rejected.headers['access-control-allow-origin'], undefined);
  await request(app).get('/').set('Origin', 'http://127.0.0.1:3000').expect('Access-Control-Allow-Origin', 'http://127.0.0.1:3000').expect(200);
});
test('produção exige HTTPS e SMTP em vez de transporte de arquivo', () => {
  assert.throws(() => loadConfig({ NODE_ENV: 'production', APP_ORIGIN: 'http://127.0.0.1:3000', DATABASE_URL: 'postgresql://example', SESSION_SECRET: randomToken(), EMAIL_TRANSPORT: 'file' }));
});
