import { hashPassword } from './passwords.js';
export async function bootstrapAdmin(db, data) {
  const passwordHash = await hashPassword(data.password);
  return db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(572905)`;
    if (await tx.user.count({ where: { role: 'ADMIN' } })) throw new Error('Já existe um administrador.');
    return tx.user.create({ data: { name: data.name, email: data.email, passwordHash, role: 'ADMIN' }, select: { id: true } });
  });
}
