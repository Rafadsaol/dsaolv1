import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { Writable } from 'node:stream';
import { loadConfig } from '../src/config/env.js';
import { createDatabase } from '../src/repositories/db.js';
import { bootstrapAdmin } from '../src/services/bootstrap.js';
import { parse, schemas } from '../src/lib/validation.js';
import { bootstrapFeedback } from '../src/lib/bootstrap-feedback.js';
// Credenciais somente pelo terminal interativo. Nenhuma senha em argumentos, env ou logs.
if (!stdin.isTTY || !stdout.isTTY) { console.error('Execute em um terminal interativo.'); process.exit(1); }
let muted = false;
const output = new Writable({ write(chunk, encoding, callback) { if (!muted) stdout.write(chunk); callback(); } });
const rl = createInterface({ input: stdin, output, terminal: true });
let db;
try {
  db = createDatabase(loadConfig().DATABASE_URL);
  const name = await rl.question('Nome do primeiro administrador: ');
  const email = await rl.question('E-mail: ');
  stdout.write('Senha (mínimo 12 caracteres, entrada oculta): '); muted = true;
  const password = await rl.question(''); muted = false; stdout.write('\n');
  stdout.write('Confirme a senha: '); muted = true;
  const confirmation = await rl.question(''); muted = false; stdout.write('\n');
  if (password !== confirmation) throw Object.assign(new Error(), { code: 'PASSWORD_CONFIRMATION' });
  const data = parse(schemas.signup, { name, email, password });
  await bootstrapAdmin(db, data);
  console.log('Primeiro administrador criado.');
} catch (error) { muted = false; console.error(`Administrador não criado. ${bootstrapFeedback(error)}`); process.exitCode = 1; }
finally { rl.close(); if (db) await db.$disconnect(); }
