import { api } from './api.js';
const form = document.querySelector('#auth-form');
const feedback = document.querySelector('#auth-feedback');
const button = form.querySelector('button');
const original = button.textContent;
const mode = form.dataset.mode;
const resetToken = new URLSearchParams(location.hash.slice(1)).get('token');
if (mode === 'reset') history.replaceState(null, '', location.pathname);
form.addEventListener('submit', async event => {
  event.preventDefault(); if (button.disabled) return;
  button.disabled = true; button.textContent = 'Aguarde…'; form.setAttribute('aria-busy', 'true'); feedback.textContent = ''; delete feedback.dataset.error;
  try {
    const data = Object.fromEntries(new FormData(form));
    if (mode === 'reset') data.token = resetToken || '';
    const endpoint = { login: 'login', register: 'register', forgot: 'forgot-password', reset: 'reset-password' }[mode];
    const result = await api(`/auth/${endpoint}`, { method: 'POST', body: data });
    if (mode === 'login' && result.data.role === 'ADMIN') { location.assign('/admin/'); return; }
    feedback.textContent = mode === 'login' ? 'Você entrou como usuário comum. O painel é restrito a administradores.' : mode === 'register' ? 'Conta criada. Agora você pode entrar.' : result.data.message;
    form.reset();
    if (mode === 'login') {
      const logout = document.createElement('button'); logout.type = 'button'; logout.className = 'button secondary'; logout.textContent = 'Sair da conta';
      logout.addEventListener('click', async () => { try { await api('/auth/logout', { method: 'POST' }); location.assign('/auth/login.html'); } catch { feedback.textContent = 'Não foi possível sair. Tente novamente.'; } }); feedback.append(logout);
    }
  } catch (error) { feedback.dataset.error = 'true'; feedback.textContent = error.message || 'Serviço indisponível. Tente novamente.'; }
  finally { button.disabled = false; button.textContent = original; form.removeAttribute('aria-busy'); }
});
button.disabled = false;
