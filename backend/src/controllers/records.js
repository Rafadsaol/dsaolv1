import { parse, schemas } from '../lib/validation.js';
import { HttpError } from '../lib/errors.js';
export function recordsController(repo, service) {
  const id = req => parse(schemas.id, req.params.id);
  const found = record => { if (!record) throw new HttpError(404, 'Registro não encontrado.'); return record; };
  return {
    createCustomer: async (req, res) => res.status(201).json({ data: await repo.createCustomer(parse(schemas.customer, req.body)) }),
    getCustomer: async (req, res) => res.json({ data: found(await repo.getCustomer(id(req))) }),
    updateCustomer: async (req, res) => res.json({ data: await repo.updateCustomer(id(req), parse(schemas.customer, req.body)) }),
    deleteCustomer: async (req, res) => { await repo.deleteCustomer(id(req)); res.status(204).end(); },
    createProject: async (req, res) => res.status(201).json({ data: await service.createProject(parse(schemas.project, req.body)) }),
    getProject: async (req, res) => res.json({ data: found(await repo.getProject(id(req))) }),
    updateProject: async (req, res) => res.json({ data: await service.updateProject(id(req), parse(schemas.project, req.body)) }),
    deleteProject: async (req, res) => { await repo.deleteProject(id(req)); res.status(204).end(); },
    updateRequest: async (req, res) => res.json({ data: await repo.updateRequest(id(req), parse(schemas.requestStatus, req.body)) })
  };
}
