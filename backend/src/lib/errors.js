export class HttpError extends Error {
  constructor(status, message, code = 'REQUEST_ERROR', fields) { super(message); Object.assign(this, { status, code, fields }); }
}
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.type === 'entity.too.large') return res.status(413).json({ error: { code: 'BODY_TOO_LARGE', message: 'Requisição muito grande.' } });
  if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'JSON inválido.' } });
  if (error.code === 'P2002') return res.status(409).json({ error: { code: 'CONFLICT', message: 'Não foi possível concluir: registro em conflito.' } });
  if (error.code === 'P2003') return res.status(409).json({ error: { code: 'RELATED_RECORDS', message: 'Este registro possui relacionamentos. Remova os projetos vinculados antes de excluir o cliente.' } });
  if (error.code === 'P2025') return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Registro não encontrado.' } });
  const status = error instanceof HttpError ? error.status : 500;
  if (status >= 500) console.error('Falha interna ao atender uma requisição.');
  res.status(status).json({ error: { code: error instanceof HttpError ? error.code : 'INTERNAL_ERROR',
    message: status >= 500 ? 'Não foi possível concluir a operação.' : error.message,
    ...(error.fields ? { fields: error.fields } : {}) } });
}
