import { createHash } from 'node:crypto';
import { HttpError } from '../lib/errors.js';
import { publicUser, publicContact } from '../repositories/selectors.js';
export function adminService(db) {
  const list = async (model, where, query, options = {}) => {
    const [items, total] = await db.$transaction([db[model].findMany({ where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, orderBy: { createdAt: 'desc' }, ...options }), db[model].count({ where })]);
    return { data: items, pagination: { page: query.page, pageSize: query.pageSize, total, pages: Math.max(1, Math.ceil(total / query.pageSize)) } };
  };
  return {
    listUsers: q => list('user', q.search ? { OR: [{ name: { contains: q.search, mode: 'insensitive' } }, { email: { contains: q.search, mode: 'insensitive' } }] } : {}, q, { select: publicUser }),
    listCustomers: q => list('customer', q.search ? { OR: ['name', 'email', 'company'].map(f => ({ [f]: { contains: q.search, mode: 'insensitive' } })) } : {}, q),
    listProjects: q => list('project', { ...(q.search ? { title: { contains: q.search, mode: 'insensitive' } } : {}), ...(q.status ? { status: q.status } : {}) }, q, { include: { customer: { select: { id: true, name: true } } } }),
    listRequests: q => list('contactRequest', { ...(q.search ? { OR: ['name', 'email', 'message'].map(f => ({ [f]: { contains: q.search, mode: 'insensitive' } })) } : {}), ...(q.status ? { status: q.status } : {}) }, q, { select: publicContact }),
    async dashboard() { const [customers, projects, inProgress, requests] = await db.$transaction([db.customer.count(), db.project.count(), db.project.count({ where: { status: 'IN_PROGRESS' } }), db.contactRequest.count()]); return { customers, projects, inProgress, requests }; },
    async createProject(data) { if (!await db.customer.findUnique({ where: { id: data.customerId } })) throw new HttpError(400, 'Selecione um cliente existente.', 'CUSTOMER_INVALID'); return db.project.create({ data }); },
    async updateProject(id, data) { if (!await db.customer.findUnique({ where: { id: data.customerId } })) throw new HttpError(400, 'Selecione um cliente existente.', 'CUSTOMER_INVALID'); return db.project.update({ where: { id }, data }); },
    async contact(data, key) {
      const { consent, ...payload } = data;
      const payloadHash = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
      const existing = await db.contactRequest.findUnique({ where: { idempotencyKey: key } });
      if (existing) { if (existing.payloadHash !== payloadHash) throw new HttpError(409, 'A solicitação foi alterada. Tente novamente.', 'IDEMPOTENCY_CONFLICT'); return { id: existing.id, duplicate: true }; }
      try { const record = await db.contactRequest.create({ data: { ...payload, idempotencyKey: key, payloadHash } }); return { id: record.id, duplicate: false }; }
      catch (error) { if (error.code !== 'P2002') throw error; const record = await db.contactRequest.findUnique({ where: { idempotencyKey: key } }); if (record?.payloadHash === payloadHash) return { id: record.id, duplicate: true }; throw new HttpError(409, 'Solicitação em conflito.', 'IDEMPOTENCY_CONFLICT'); }
    }
  };
}
