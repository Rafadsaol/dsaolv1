import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { hashPassword } from '../src/services/passwords.js';

test('SQL versionado: tabelas, índices, hash, unicidade e chaves estrangeiras em PostgreSQL real', async () => {
  const url = process.env.TEST_DATABASE_URL;
  assert.ok(url && new URL(url).pathname.endsWith('_test'), 'Configure TEST_DATABASE_URL separado com sufixo _test.');
  const client = new pg.Client({ connectionString: url }); await client.connect();
  try {
    await client.query('BEGIN');
    const schema = `validation_${randomUUID().replaceAll('-', '')}`;
    // Identificador gerado internamente e restrito a letras/números, sem entrada do navegador.
    await client.query(`CREATE SCHEMA "${schema}"`); await client.query(`SET LOCAL search_path TO "${schema}"`);
    await client.query(await readFile(new URL('../prisma/migrations/202610230001_initial/migration.sql', import.meta.url), 'utf8'));
    const user = randomUUID(), customer = randomUUID(), project = randomUUID();
    const hash = await hashPassword(randomUUID());
    await client.query('INSERT INTO "User" (id,name,email,"passwordHash","updatedAt") VALUES ($1,$2,$3,$4,NOW())', [user, 'Pessoa Fictícia', 'pessoa@example.test', hash]);
    const expectViolation = async (sql, args, code) => { await client.query('SAVEPOINT expected_error'); try { await client.query(sql, args); assert.fail('A restrição deveria rejeitar esta operação.'); } catch (error) { assert.equal(error.code, code); } finally { await client.query('ROLLBACK TO SAVEPOINT expected_error'); } };
    await expectViolation('INSERT INTO "User" (id,name,email,"passwordHash","updatedAt") VALUES ($1,$2,$3,$4,NOW())', [randomUUID(), 'Outro Fictício', 'pessoa@example.test', hash], '23505');
    await expectViolation('UPDATE "User" SET "passwordHash"=$1 WHERE id=$2', ['texto-puro', user], '23514');
    await expectViolation('UPDATE "User" SET email=$1 WHERE id=$2', ['UPPER@EXAMPLE.TEST', user], '23514');
    await client.query('INSERT INTO "Customer" (id,name,email,"updatedAt") VALUES ($1,$2,$3,NOW())', [customer, 'Cliente Fictício', 'cliente@example.test']);
    await client.query('INSERT INTO "Project" (id,title,description,"customerId","updatedAt") VALUES ($1,$2,$3,$4,NOW())', [project, 'Projeto Fictício', 'Descrição fictícia suficiente', customer]);
    await expectViolation('DELETE FROM "Customer" WHERE id=$1', [customer], '23503');
    await expectViolation('UPDATE "Project" SET "customerId"=$1 WHERE id=$2', [randomUUID(), project], '23503');
    await expectViolation('UPDATE "Project" SET status=$1 WHERE id=$2', ['INVALIDO', project], '22P02');
    await client.query('INSERT INTO session (sid,sess,expire) VALUES ($1,$2,NOW()+INTERVAL \'1 hour\')', ['sessao-ficticia', JSON.stringify({ userId: user })]);
    const session = await client.query('SELECT sess FROM session WHERE sid=$1', ['sessao-ficticia']); assert.equal(session.rows[0].sess.userId, user);
    const indexes = await client.query('SELECT indexname FROM pg_indexes WHERE schemaname=$1', [schema]); assert(indexes.rows.some(r => r.indexname === 'Project_customerId_idx')); assert(indexes.rows.some(r => r.indexname === 'session_expire_idx'));
    await client.query('DELETE FROM "Project" WHERE id=$1', [project]); await client.query('DELETE FROM "Customer" WHERE id=$1', [customer]);
  } finally { await client.query('ROLLBACK'); await client.end(); }
});
