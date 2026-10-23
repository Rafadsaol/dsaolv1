import { z } from 'zod';

export function loadConfig(env = process.env) {
  const schema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    HOST: z.string().default('127.0.0.1'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    APP_ORIGIN: z.url(), DATABASE_URL: z.string().min(1),
    SESSION_SECRET: z.string().min(64), TRUST_PROXY: z.enum(['0', '1']).default('0'),
    EMAIL_TRANSPORT: z.enum(['file', 'smtp']).default('file'),
    CONTACT_REQUESTS_ENABLED: z.enum(['true', 'false']).default('false')
  });
  const parsed = schema.safeParse(env);
  if (!parsed.success) throw new Error(`Configuração inválida: ${[...new Set(parsed.error.issues.map(i => i.path[0]))].join(', ')}`);
  const c = parsed.data;
  const origin = new URL(c.APP_ORIGIN);
  if (origin.origin !== c.APP_ORIGIN) throw new Error('APP_ORIGIN deve conter somente protocolo, host e porta.');
  if (c.SESSION_SECRET.startsWith('SUBSTITUA')) throw new Error('Defina um SESSION_SECRET aleatório.');
  if (c.NODE_ENV === 'production' && (origin.protocol !== 'https:' || c.EMAIL_TRANSPORT !== 'smtp' || !env.SMTP_HOST || !env.MAIL_FROM)) {
    throw new Error('Produção requer HTTPS e entrega SMTP configurada.');
  }
  return { ...c, production: c.NODE_ENV === 'production', trustProxy: c.TRUST_PROXY === '1' ? 1 : false,
    contactsEnabled: c.CONTACT_REQUESTS_ENABLED === 'true',
    smtp: { host: env.SMTP_HOST, port: Number(env.SMTP_PORT || 587), secure: env.SMTP_SECURE === 'true',
      user: env.SMTP_USER, password: env.SMTP_PASSWORD, from: env.MAIL_FROM } };
}
