import { createRequire } from 'node:module';
import { PrismaPg } from '@prisma/adapter-pg';
const require = createRequire(import.meta.url);
export function createDatabase(url) {
  let PrismaClient;
  try { ({ PrismaClient } = require('@prisma/client')); }
  catch { const error = new Error('Cliente Prisma não gerado. Execute npm run prisma:generate.'); error.code = 'PRISMA_CLIENT_MISSING'; throw error; }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }), log: [] });
}
