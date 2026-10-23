import { defineConfig } from 'prisma/config';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
// Parser nativo do Node: suporta aspas e mantém as variáveis já fornecidas pelo processo.
if (existsSync('.env')) loadEnvFile('.env');
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL }
});
