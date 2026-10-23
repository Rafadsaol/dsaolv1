import { parse, schemas } from '../lib/validation.js';
import { csrfToken } from '../middlewares/security.js';
const regenerate = req => new Promise((resolve, reject) => req.session.regenerate(e => e ? reject(e) : resolve()));
const save = req => new Promise((resolve, reject) => req.session.save(e => e ? reject(e) : resolve()));
export function authController(service) {
  return {
    register: async (req, res) => { const user = await service.register(parse(schemas.signup, req.body)); res.status(201).json({ data: user }); },
    login: async (req, res) => {
      const user = await service.login(parse(schemas.login, req.body));
      await regenerate(req); req.session.userId = user.id; const token = csrfToken(req); await save(req);
      res.json({ data: user, csrfToken: token });
    },
    logout: async (req, res) => {
      await new Promise((resolve, reject) => req.session.destroy(e => e ? reject(e) : resolve()));
      res.clearCookie('dsaol.sid', { path: '/' }); res.status(204).end();
    },
    forgot: async (req, res) => { await service.forgot(parse(schemas.forgot, req.body).email); res.status(202).json({ data: { message: 'Se o endereço estiver cadastrado, enviaremos instruções de recuperação.' } }); },
    reset: async (req, res) => { const data = parse(schemas.reset, req.body); await service.reset(data.token, data.password); res.json({ data: { message: 'Senha redefinida. Entre novamente na sua conta.' } }); }
  };
}
