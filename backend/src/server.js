import { loadConfig } from './config/env.js';
import { createApp } from './app.js';
try {
  const config = loadConfig();
  const app = await createApp(config);
  await app.locals.db.$queryRaw`SELECT 1`;
  const server = app.listen(config.PORT, config.HOST, () => console.log(`Servidor local ativo na porta ${config.PORT}.`));
  const stop = () => server.close(async () => { await app.locals.close(); process.exit(0); });
  process.once('SIGTERM', stop); process.once('SIGINT', stop);
} catch { console.error('Não foi possível iniciar. Confira o .env e a disponibilidade do PostgreSQL.'); process.exit(1); }
