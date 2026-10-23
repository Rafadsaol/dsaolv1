import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { Writable } from 'node:stream';
import { loadConfig } from '../src/config/env.js';
import { createDatabase } from '../src/repositories/db.js';
import { bootstrapAdmin } from '../src/services/bootstrap.js';
import { parse, schemas } from '../src/lib/validation.js';
// Credenciais somente pelo terminal interativo. Nenhuma senha em argumentos, env ou logs.
if (!stdin.isTTY || !stdout.isTTY) { console.error('Execute em um terminal interativo.'); process.exit(1); }
let muted = false;
const output = new Writable({ write(chunk, encoding, callback) { if (!muted) stdout.write(chunk); callback(); } });
const rl = createInterface({ input: stdin, output, terminal: true });
const db = createDatabase(loadConfig().DATABASE_URL);
try {
  const name = await rl.question('Nome do primeiro administrador: ');
  const email = await rl.question('E-mail: ');
  stdout.write('Senha (mínimo 12 caracteres, entrada oculta): '); muted = true;
  const password = await rl.question(''); muted = false; stdout.write('\n');
  stdout.write('Confirme a senha: '); muted = true;
  const confirmation = await rl.question(''); muted = false; stdout.write('\n');
  if (password !== confirmation) throw new Error('As senhas não coincidem.');
  const data = parse(schemas.signup, { name, email, password });
  await bootstrapAdmin(db, data);
  console.log('Primeiro administrador criado.');
} catch { muted = false; console.error('Administrador não criado. Confira os campos, a confirmação e se já existe um administrador/e-mail cadastrado.'); process.exitCode = 1; }
finally { rl.close(); await db.$disconnect(); }
