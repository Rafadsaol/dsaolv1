import { api } from '/auth/api.js';
const $ = selector => document.querySelector(selector);
const titles = { dashboard: 'Dashboard', customers: 'Clientes', projects: 'Projetos', requests: 'Solicitações', users: 'Usuários' };
const endpoints = { customers: 'customers', projects: 'projects', requests: 'contact-requests', users: 'users' };
const projectStatuses = { PLANNED: 'Planejado', IN_PROGRESS: 'Em andamento', COMPLETED: 'Concluído', CANCELLED: 'Cancelado' };
const requestStatuses = { NEW: 'Nova', IN_REVIEW: 'Em análise', CONTACTED: 'Contato realizado', CLOSED: 'Encerrada' };
let view = 'dashboard', page = 1, pages = 1, currentRecords = [], editing = null, busy = false, loadVersion = 0;
function message(text, error = false) { $('#feedback').textContent = text; $('#feedback').dataset.error = String(error); }
function node(tag, text, className) { const element = document.createElement(tag); if (text !== undefined) element.textContent = text; if (className) element.className = className; return element; }
function field(key, label, type = 'text', value = '', required = true, max = 100) {
  const wrap = node('div'); const labelNode = node('label', label); labelNode.htmlFor = `edit-${key}`;
  const input = node(type === 'textarea' ? 'textarea' : 'input'); input.id = `edit-${key}`; input.name = key; if (type !== 'textarea') input.type = type; input.required = required; input.maxLength = max; input.value = value || ''; wrap.append(labelNode, input); $('#editor-fields').append(wrap); return input;
}
function selectField(key, label, options, value) {
  const wrap = node('div'); const labelNode = node('label', label); labelNode.htmlFor = `edit-${key}`;
  const select = node('select'); select.id = `edit-${key}`; select.name = key; select.required = true;
  for (const [id, title] of Object.entries(options)) select.add(new Option(title, id));
  if (value) select.value = value; wrap.append(labelNode, select); $('#editor-fields').append(wrap); return select;
}
function addDetails(list, label, value) { list.append(node('dt', label), node('dd', value ?? 'Não informado')); }
async function load() {
  const version = ++loadVersion; message('Carregando…'); $('#listing').hidden = view === 'dashboard'; $('#dashboard').hidden = view !== 'dashboard';
  $('#new-record').hidden = !['customers', 'projects'].includes(view); $('#view-title').textContent = titles[view];
  document.querySelectorAll('.admin-sidebar nav a').forEach(a => { if (a.hash === `#${view}`) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  try {
    if (view === 'dashboard') {
      const { data } = await api('/admin/dashboard'); if (version !== loadVersion) return;
      $('#dashboard').replaceChildren();
      for (const [key, title] of Object.entries({ customers: 'Total de clientes', projects: 'Total de projetos', inProgress: 'Projetos em andamento', requests: 'Solicitações recebidas' })) { const card = node('article', undefined, 'admin-metric'); card.append(node('h2', title), node('p', String(data[key]))); $('#dashboard').append(card); }
    } else {
      const query = new URLSearchParams({ page, pageSize: 10, search: $('#search').value }); if ($('#status-filter').value) query.set('status', $('#status-filter').value);
      const result = await api(`/admin/${endpoints[view]}?${query}`); if (version !== loadVersion) return;
      currentRecords = result.data; pages = result.pagination.pages; $('#records').replaceChildren();
      for (const record of currentRecords) renderRecord(record);
      $('#result-count').textContent = `${result.pagination.total} registro(s) encontrado(s).`;
      $('#page-info').textContent = `Página ${page} de ${pages}`; $('#previous').disabled = page <= 1; $('#next').disabled = page >= pages;
    }
    message('');
  } catch (error) { if (version !== loadVersion) return; if (error.status === 401) return location.assign('/auth/login.html'); message(error.message || 'Serviço indisponível.', true); }
}
function renderRecord(record) {
  const card = node('li', undefined, 'record'); card.append(node('h2', record.title || record.name)); const details = node('dl');
  if (view === 'customers') { addDetails(details, 'E-mail', record.email); addDetails(details, 'Telefone', record.phone); addDetails(details, 'Empresa', record.company); }
  if (view === 'projects') { addDetails(details, 'Cliente', record.customer.name); addDetails(details, 'Status', projectStatuses[record.status]); addDetails(details, 'Descrição', record.description); }
  if (view === 'requests') { addDetails(details, 'E-mail', record.email); addDetails(details, 'Telefone', record.phone); addDetails(details, 'Serviço', record.service); addDetails(details, 'Descrição', record.message); addDetails(details, 'Status', requestStatuses[record.status]); }
  if (view === 'users') { addDetails(details, 'E-mail', record.email); addDetails(details, 'Perfil', record.role); }
  addDetails(details, 'Criado em', new Date(record.createdAt).toLocaleString('pt-BR')); card.append(details);
  if (view !== 'users') {
    const actions = node('div', undefined, 'record-actions'); const edit = node('button', view === 'requests' ? 'Atualizar status' : 'Editar'); edit.type = 'button'; edit.setAttribute('aria-label', `Editar ${record.title || record.name}`); edit.addEventListener('click', () => openEditor(record)); actions.append(edit);
    if (view !== 'requests') { const remove = node('button', 'Excluir', 'danger'); remove.type = 'button'; remove.setAttribute('aria-label', `Excluir ${record.title || record.name}`); remove.addEventListener('click', async () => { if (!confirm(`Confirma a exclusão de ${record.title || record.name}?`)) return; remove.disabled = true; try { await api(`/admin/${endpoints[view]}/${record.id}`, { method: 'DELETE' }); await load(); message('Registro excluído.'); } catch (e) { message(e.message, true); remove.disabled = false; } }); actions.append(remove); }
    card.append(actions);
  }
  $('#records').append(card);
}
async function openEditor(record = null) {
  editing = record; $('#editor-fields').replaceChildren(); $('#editor-feedback').textContent = ''; $('#editor-title').textContent = record ? 'Editar registro' : 'Novo registro';
  if (view === 'customers') { field('name', 'Nome *', 'text', record?.name); field('email', 'E-mail *', 'email', record?.email, true, 254); field('phone', 'Telefone com DDD', 'tel', record?.phone, false, 22); field('company', 'Empresa', 'text', record?.company, false); }
  if (view === 'projects') {
    field('title', 'Título *', 'text', record?.title, true, 160); field('description', 'Descrição (mínimo 10 caracteres) *', 'textarea', record?.description, true, 4000); selectField('status', 'Status *', projectStatuses, record?.status);
    const lookup = node('div', undefined, 'lookup'); const search = node('input'); search.type = 'search'; search.placeholder = 'Buscar cliente por nome/e-mail'; search.setAttribute('aria-label', 'Buscar cliente para o projeto'); search.maxLength = 100; const lookupButton = node('button', 'Buscar clientes'); lookupButton.type = 'button'; lookup.append(search, lookupButton); $('#editor-fields').append(lookup);
    const select = selectField('customerId', 'Cliente *', {}, record?.customerId);
    const loadCustomers = async () => { try { const result = await api(`/admin/customers?${new URLSearchParams({ pageSize: 100, search: search.value })}`); select.replaceChildren(new Option('Selecione um cliente', '')); for (const customer of result.data) select.add(new Option(customer.name, customer.id)); if (record) { if (![...select.options].some(o => o.value === record.customerId)) { const customer = await api(`/admin/customers/${record.customerId}`); select.add(new Option(customer.data.name, customer.data.id)); } select.value = record.customerId; } if (result.pagination.total > 100) $('#editor-feedback').textContent = 'Há mais de 100 clientes. Refine a busca para localizar o cliente.'; } catch { $('#editor-feedback').textContent = 'Não foi possível consultar os clientes.'; } };
    lookupButton.addEventListener('click', loadCustomers); await loadCustomers();
  }
  if (view === 'requests') selectField('status', 'Status *', requestStatuses, record.status);
  $('#editor').showModal();
}
$('#editor-form').addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return; busy = true; $('#save-record').disabled = true; $('#save-record').textContent = 'Salvando…';
  try {
    const body = Object.fromEntries(new FormData(event.currentTarget));
    await api(`/admin/${endpoints[view]}${editing ? `/${editing.id}` : ''}`, { method: view === 'requests' ? 'PATCH' : editing ? 'PUT' : 'POST', body });
    $('#editor').close(); await load(); message('Registro salvo.');
  } catch (e) { $('#editor-feedback').dataset.error = 'true'; $('#editor-feedback').textContent = e.message || 'Não foi possível salvar.'; }
  finally { busy = false; $('#save-record').disabled = false; $('#save-record').textContent = 'Salvar'; }
});
$('#close-editor').addEventListener('click', () => $('#editor').close());
$('#new-record').addEventListener('click', () => openEditor());
$('#filters').addEventListener('submit', event => { event.preventDefault(); page = 1; load(); });
$('#previous').addEventListener('click', () => { if (page > 1) { page--; load(); } });
$('#next').addEventListener('click', () => { if (page < pages) { page++; load(); } });
$('#logout').addEventListener('click', async () => { try { await api('/auth/logout', { method: 'POST' }); location.assign('/auth/login.html'); } catch (e) { message(e.message || 'Não foi possível sair.', true); } });
function navigate() {
  if ($('#editor').open) $('#editor').close();
  view = Object.hasOwn(titles, location.hash.slice(1)) ? location.hash.slice(1) : 'dashboard'; page = 1; $('#search').value = ''; const statuses = view === 'projects' ? projectStatuses : view === 'requests' ? requestStatuses : null;
  $('#status-filter-wrap').hidden = !statuses; $('#status-filter').replaceChildren(new Option('Todos', '')); for (const [value, title] of Object.entries(statuses || {})) $('#status-filter').add(new Option(title, value)); load();
}
window.addEventListener('hashchange', navigate);
try { const { data } = await api('/auth/me'); if (data.role !== 'ADMIN') throw new Error('Acesso restrito.'); $('#admin-user').textContent = data.name; navigate(); }
catch { location.assign('/auth/login.html'); }
