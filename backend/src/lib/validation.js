import { z } from 'zod';
import { HttpError } from './errors.js';
const email = z.email().max(254).transform(s => s.toLowerCase());
const name = z.string().trim().min(3).max(100);
const password = z.string().min(12).max(128);
const optional = max => z.string().trim().max(max).optional().transform(s => s || null);
export function validPhone(value) {
  if (!/^[+\d\s().-]+$/.test(value)) return false;
  let n = value.replace(/\D/g, '');
  if ((n.length === 12 || n.length === 13) && n.startsWith('55')) n = n.slice(2);
  const ddds = '11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99'.split(' ');
  return ddds.includes(n.slice(0, 2)) && /^(9\d{8}|[2-5]\d{7})$/.test(n.slice(2)) && !/^(\d)\1+$/.test(n.slice(2));
}
const phone = z.string().trim().max(22).refine(validPhone, 'Telefone brasileiro com DDD inválido.');
export const schemas = {
  signup: z.object({ name, email, password }).strict(),
  login: z.object({ email, password: z.string().min(1).max(128) }).strict(),
  forgot: z.object({ email }).strict(),
  reset: z.object({ token: z.string().regex(/^[a-f0-9]{64}$/), password }).strict(),
  customer: z.object({ name, email, phone: phone.optional().or(z.literal('')).transform(s => s || null), company: optional(100) }).strict(),
  project: z.object({ title: z.string().trim().min(3).max(160), description: z.string().trim().min(10).max(4000),
    status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']), customerId: z.uuid() }).strict(),
  request: z.object({ name, email, phone, service: z.enum(['sites', 'automacao', 'infraestrutura', 'outro']),
    message: z.string().trim().min(20).max(2000), consent: z.literal(true) }).strict(),
  requestStatus: z.object({ status: z.enum(['NEW', 'IN_REVIEW', 'CONTACTED', 'CLOSED']) }).strict(),
  id: z.uuid(),
  pagination: z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(100).default(''), status: z.string().max(32).optional() }).strict()
};
export function parse(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) throw new HttpError(400, 'Revise os dados informados.', 'VALIDATION_ERROR', result.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })));
  return result.data;
}
