import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { randomUUID, randomBytes } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { loadConfig } from '../src/config/env.js';

test('V5 com PostgreSQL real, sem mocks de autenticação ou Prisma', { timeout: 90000 }, async t => {
  const url = process.env.TEST_DATABASE_URL;
  assert.ok(url && new URL(url).pathname.endsWith('_test'), 'Configure um banco separado TEST_DATABASE_URL com sufixo _test.');
  let createApp;
  try { ({ createApp } = await import('../src/app.js')); } catch { assert.fail('Cliente Prisma não gerado. Execute npm run prisma:generate com acesso aos downloads oficiais.'); }
  const { bootstrapAdmin } = await import('../src/services/bootstrap.js');
  const config = { ...loadConfig(), DATABASE_URL: url, NODE_ENV: 'test', production: false, contactsEnabled: true };
  let app;
  try { app = await createApp(config); } catch (error) { if (error.code === 'PRISMA_CLIENT_MISSING') assert.fail('Cliente Prisma não gerado. A suíte integrada não executou os fluxos.'); throw error; }
  let db = app.locals.db;
  const suffix = randomUUID(), email = `user-${suffix}@example.test`, adminEmail = `admin-${suffix}@example.test`, password = randomBytes(20).toString('hex');
  let visitor = request.agent(app), user = request.agent(app), admin = request.agent(app);
  let customer, project, contact;
  const csrf = async agent => (await agent.get('/api/v1/auth/csrf').expect(200)).body.data.csrfToken;
  const write = async (agent, method, path, body) => {
    // Termine a requisição CSRF antes de abrir outra no servidor temporário do Supertest.
    const token = await csrf(agent);
    return agent[method](path).set('X-CSRF-Token', token).send(body);
  };
  const login = (agent, address = email, secret = password) => write(agent, 'post', '/api/v1/auth/login', { email: address, password: secret });
  try {
    await db.$queryRaw`SELECT 1`;
    assert.equal(await db.user.count({ where: { role: 'ADMIN' } }), 0, 'Use um banco de teste exclusivo sem administrador anterior.');
    await t.test('público acessível e arquivos privados bloqueados', async () => {
      for (const path of ['/', '/style.css', '/solicitacoes.js', '/servicos/automacao/index.html', '/projetos/loja/index.html']) await visitor.get(path).expect(200);
      for (const path of ['/backend/.env', '/.env', '/backend/prisma/schema.prisma', '/backend/package.json', '/.git/config']) await visitor.get(path).expect(404);
      await visitor.get('/admin/').expect(302); await visitor.get('/api/v1/admin/customers').expect(401);
    });
    await t.test('cadastro, CSRF, USER público e login com senha errada', async () => {
      const body = { name: 'Pessoa Fictícia', email, password };
      await visitor.post('/api/v1/auth/register').send(body).expect(403);
      assert.equal((await write(visitor, 'post', '/api/v1/auth/register', { ...body, role: 'ADMIN' })).status, 400);
      const created = await write(visitor, 'post', '/api/v1/auth/register', body); assert.equal(created.status, 201); assert.equal(created.body.data.role, 'USER'); assert.equal(created.body.data.passwordHash, undefined);
      assert.equal((await login(user, email, 'senha-ficticia-incorreta')).status, 401);
      const oldCsrf = await csrf(user), entered = await login(user); assert.equal(entered.status, 200); assert.notEqual(entered.body.csrfToken, oldCsrf);
      assert.match(entered.headers['set-cookie'][0], /HttpOnly/); assert.match(entered.headers['set-cookie'][0], /SameSite=Lax/); assert.equal(entered.body.data.passwordHash, undefined);
      await user.get('/api/v1/auth/me').expect(200); await user.get('/api/v1/admin/dashboard').expect(403); await user.get('/admin/').expect(403);
    });
    await t.test('bootstrap de ADMIN único e listagem sem hash', async () => {
      await bootstrapAdmin(db, { name: 'Administrador Fictício', email: adminEmail, password });
      await assert.rejects(bootstrapAdmin(db, { name: 'Outro Fictício', email: `other-${suffix}@example.test`, password }));
      assert.equal((await login(admin, adminEmail)).status, 200); await admin.get('/admin/').expect(200);
      const users = await admin.get('/api/v1/admin/users').expect(200); assert(users.body.data.every(u => !('passwordHash' in u)));
      assert.equal((await write(user, 'post', '/api/v1/admin/customers', { name: 'Cliente Fictício', email: 'falso@example.test' })).status, 403);
    });
    await t.test('CRUD e integridade de clientes/projetos, paginação e busca', async () => {
      const created = await write(admin, 'post', '/api/v1/admin/customers', { name: 'Cliente Fictício', email: `customer-${suffix}@example.test`, company: 'Empresa Fictícia' }); assert.equal(created.status, 201); customer = created.body.data;
      const payload = { title: 'Projeto Fictício', description: 'Descrição de um projeto fictício de laboratório.', status: 'PLANNED', customerId: customer.id };
      const result = await write(admin, 'post', '/api/v1/admin/projects', payload); assert.equal(result.status, 201); project = result.body.data;
      assert.equal((await write(admin, 'delete', `/api/v1/admin/customers/${customer.id}`)).status, 409);
      assert.equal((await write(admin, 'put', `/api/v1/admin/projects/${project.id}`, { ...payload, status: 'IN_PROGRESS' })).status, 200);
      assert.equal((await write(admin, 'put', `/api/v1/admin/customers/${customer.id}`, { name: 'Cliente Fictício Alterado', email: customer.email })).status, 200);
      const listed = await admin.get('/api/v1/admin/projects?status=IN_PROGRESS&pageSize=1').expect(200); assert.equal(listed.body.pagination.pageSize, 1);
      await admin.get('/api/v1/admin/customers?pageSize=1000').expect(400); await admin.get(`/api/v1/admin/projects/${randomUUID()}`).expect(404);
    });
    await t.test('solicitação com consentimento, idempotência e atualização ADMIN', async () => {
      const payload = { name: 'Visitante Fictício', email: 'visitante@example.test', phone: '41912345678', service: 'sites', message: 'Uma solicitação fictícia com descrição suficiente.', consent: true };
      const key = randomUUID(), token = await csrf(visitor);
      const send = data => visitor.post('/api/v1/contact-requests').set('X-CSRF-Token', token).set('Idempotency-Key', key).send(data);
      assert.equal((await send({ ...payload, consent: false })).status, 400);
      const first = await send(payload); assert.equal(first.status, 201); contact = first.body.data;
      const second = await send(payload); assert.equal(second.status, 200); assert.equal(second.body.data.id, contact.id);
      assert.equal((await send({ ...payload, message: 'Uma mensagem fictícia diferente com descrição.' })).status, 409);
      assert.equal((await write(admin, 'patch', `/api/v1/admin/contact-requests/${contact.id}`, { status: 'CONTACTED' })).status, 200);
      const dashboard = await admin.get('/api/v1/admin/dashboard').expect(200); assert(dashboard.body.data.customers >= 1); assert(dashboard.body.data.inProgress >= 1);
    });
    await t.test('sessão e dados persistem após reiniciar a aplicação', async () => {
      const entered = await login(admin, adminEmail), cookie = entered.headers['set-cookie'][0].split(';')[0];
      await app.locals.close(); app = await createApp(config); db = app.locals.db;
      await request(app).get('/api/v1/auth/me').set('Cookie', cookie).expect(200); await request(app).get(`/api/v1/admin/projects/${project.id}`).set('Cookie', cookie).expect(200);
      visitor = request.agent(app); user = request.agent(app); admin = request.agent(app); await login(user); await login(admin, adminEmail);
    });
    await t.test('recuperação genérica, token apenas em e-mail local, uso único e expiração', async () => {
      const existing = await write(visitor, 'post', '/api/v1/auth/forgot-password', { email }), missing = await write(visitor, 'post', '/api/v1/auth/forgot-password', { email: `missing-${suffix}@example.test` }); assert.equal(existing.status, 202); assert.deepEqual(existing.body, missing.body);
      let token; for (const name of await readdir(new URL('../.mail/', import.meta.url))) { const entry = JSON.parse(await readFile(new URL(`../.mail/${name}`, import.meta.url), 'utf8')); if (entry.to === email) token = /#token=([a-f0-9]{64})/.exec(entry.text)?.[1]; }
      assert.ok(token); const record = await db.passwordResetToken.findFirst({ where: { user: { email } } }); assert.notEqual(record.tokenHash, token);
      await db.passwordResetToken.update({ where: { id: record.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
      assert.equal((await write(visitor, 'post', '/api/v1/auth/reset-password', { token, password })).status, 400);
      await db.passwordResetToken.update({ where: { id: record.id }, data: { expiresAt: new Date(Date.now() + 60000) } });
      const newPassword = randomBytes(20).toString('hex'); assert.equal((await write(visitor, 'post', '/api/v1/auth/reset-password', { token, password: newPassword })).status, 200);
      assert.equal((await write(visitor, 'post', '/api/v1/auth/reset-password', { token, password: newPassword })).status, 400); await user.get('/api/v1/auth/me').expect(401);
      assert.equal((await login(user, email, newPassword)).status, 200); assert.equal((await write(user, 'post', '/api/v1/auth/logout')).status, 204); await user.get('/api/v1/auth/me').expect(401);
    });
    await t.test('rate limiting, validação e exclusões', async () => {
      const limited = request.agent(app), token = await csrf(limited); let blocked = false;
      for (let i = 0; i < 11; i++) { const result = await limited.post('/api/v1/auth/login').set('X-CSRF-Token', token).send({ email: `absent-${suffix}@example.test`, password }); if (result.status === 429) { blocked = true; break; } } assert.equal(blocked, true);
      assert.equal((await write(admin, 'delete', `/api/v1/admin/projects/${project.id}`)).status, 204); project = null;
      assert.equal((await write(admin, 'delete', `/api/v1/admin/customers/${customer.id}`)).status, 204); customer = null;
    });
  } finally {
    if (project) await db.project.deleteMany({ where: { id: project.id } });
    if (customer) await db.customer.deleteMany({ where: { id: customer.id } });
    if (contact) await db.contactRequest.deleteMany({ where: { id: contact.id } });
    await db.user.deleteMany({ where: { email: { in: [email, adminEmail] } } });
    await app.locals.close();
  }
});
