import { publicContact } from './selectors.js';
// Fronteira de acesso aos registros; parâmetros são validados antes de chegar aqui.
export function recordsRepository(db) {
  return {
    createCustomer: data => db.customer.create({ data }),
    getCustomer: id => db.customer.findUnique({ where: { id } }),
    updateCustomer: (id, data) => db.customer.update({ where: { id }, data }),
    deleteCustomer: id => db.customer.delete({ where: { id } }),
    getProject: id => db.project.findUnique({ where: { id } }),
    deleteProject: id => db.project.delete({ where: { id } }),
    updateRequest: (id, data) => db.contactRequest.update({ where: { id }, data, select: publicContact })
  };
}
