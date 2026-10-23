import { loadConfig } from '../src/config/env.js';
import { createDatabase } from '../src/repositories/db.js';
const config = loadConfig();
if (config.production) throw new Error('Seed demonstrativo não permitido em produção.');
const db = createDatabase(config.DATABASE_URL);
try {
  const existing = await db.customer.findFirst({ where: { email: 'empresa-demo@example.test' } });
  if (!existing) await db.customer.create({ data: { name: 'Cliente Fictício de Estudo', email: 'empresa-demo@example.test', company: 'Empresa Demonstrativa',
    projects: { create: { title: 'Projeto de laboratório', description: 'Exemplo fictício para praticar o painel administrativo.', status: 'PLANNED' } } } });
  console.log('Seed demonstrativo concluído. Nenhum usuário ou senha administrativa criado.');
} finally { await db.$disconnect(); }
