let csrf;
export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  if (!['GET', 'HEAD'].includes(method)) {
    if (!csrf) { const response = await fetch('/api/v1/auth/csrf', { credentials: 'same-origin' }); const json = await response.json(); if (!response.ok) throw new Error(json.error?.message || 'Não foi possível iniciar uma sessão segura.'); csrf = json.data.csrfToken; }
    headers['X-CSRF-Token'] = csrf;
  }
  const response = await fetch(`/api/v1${path}`, { method, credentials: 'same-origin', headers: { ...headers, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = response.status === 204 ? null : await response.json();
  if (data?.csrfToken) csrf = data.csrfToken;
  if (!response.ok) { const error = new Error(data?.error?.message || 'Operação indisponível.'); error.status = response.status; error.fields = data?.error?.fields; throw error; }
  return data;
}
