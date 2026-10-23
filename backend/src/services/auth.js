import { publicUser } from '../repositories/selectors.js';
import { hashPassword, verifyPassword, randomToken, hashToken } from './passwords.js';
import { HttpError } from '../lib/errors.js';
export async function createAuthService(db, mailer) {
  const dummyHash = await hashPassword(randomToken());
  return {
    async register(data) { return db.user.create({ data: { name: data.name, email: data.email, passwordHash: await hashPassword(data.password), role: 'USER' }, select: publicUser }); },
    async login(data) {
      const user = await db.user.findUnique({ where: { email: data.email } });
      const valid = await verifyPassword(user?.passwordHash || dummyHash, data.password);
      if (!user || !valid) throw new HttpError(401, 'E-mail ou senha inválidos.', 'INVALID_CREDENTIALS');
      const { passwordHash, ...safe } = user;
      return safe;
    },
    async forgot(email) {
      const user = await db.user.findUnique({ where: { email }, select: { id: true } });
      if (!user) return;
      const token = randomToken();
      // Uma solicitação anterior não invalida links entregues, evitando negação de serviço.
      await db.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 15 * 60_000) } });
      try { await mailer(email, token); } catch { console.error('Não foi possível entregar a recuperação de senha.'); }
    },
    async reset(token, password) {
      const tokenHash = hashToken(token);
      const record = await db.passwordResetToken.findUnique({ where: { tokenHash } });
      if (!record || record.usedAt || record.expiresAt <= new Date()) throw new HttpError(400, 'Link inválido ou expirado.', 'RESET_INVALID');
      const passwordHash = await hashPassword(password);
      await db.$transaction(async tx => {
        const result = await tx.passwordResetToken.updateMany({ where: { id: record.id, usedAt: null, expiresAt: { gt: new Date() } }, data: { usedAt: new Date() } });
        if (result.count !== 1) throw new HttpError(400, 'Link inválido ou expirado.', 'RESET_INVALID');
        await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
        await tx.passwordResetToken.updateMany({ where: { userId: record.userId, usedAt: null }, data: { usedAt: new Date() } });
        await tx.$executeRaw`DELETE FROM "session" WHERE sess->>'userId' = ${record.userId}`;
      });
    }
  };
}
