import { mkdir, writeFile, chmod } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
export function createMailer(config) {
  return async (email, token) => {
    // Fragmentos não são enviados ao servidor ao carregar a página de recuperação.
    const link = `${config.APP_ORIGIN}/auth/reset.html#token=${token}`;
    const message = { to: email, subject: 'Redefinição de senha — dSaOl IT', text: `Use este link em até 15 minutos para redefinir sua senha:\n${link}\nSe não solicitou, ignore esta mensagem.` };
    if (config.EMAIL_TRANSPORT === 'file') {
      if (config.production) throw new Error('Transporte local não permitido em produção.');
      const dir = fileURLToPath(new URL('../../.mail/', import.meta.url));
      await mkdir(dir, { recursive: true, mode: 0o700 }); await chmod(dir, 0o700);
      await writeFile(`${dir}/${randomUUID()}.json`, JSON.stringify(message), { mode: 0o600 });
      return;
    }
    const s = config.smtp;
    const transport = nodemailer.createTransport({ host: s.host, port: s.port, secure: s.secure, requireTLS: config.production,
      ...(s.user ? { auth: { user: s.user, pass: s.password } } : {}) });
    await transport.sendMail({ ...message, from: s.from });
  };
}
