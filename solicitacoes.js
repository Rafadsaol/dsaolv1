'use strict';
(() => {
  const panel = document.querySelector('#backend-contact');
  const button = document.querySelector('#register-request');
  const consent = document.querySelector('#backend-consent');
  const feedback = document.querySelector('#backend-feedback');
  const form = document.querySelector('#quote-form');
  let key = null, sending = false;
  // Consulta apenas disponibilidade. Nenhum dado do formulário é transmitido aqui.
  fetch('/api/v1/public-config', { credentials: 'same-origin' }).then(r => r.ok ? r.json() : null).then(data => { if (data?.data?.authEnabled === true) document.querySelector('#account-link').hidden = false; if (data?.data?.contactRequestsEnabled === true) panel.hidden = false; }).catch(() => {});
  form.addEventListener('input', () => { key = null; feedback.textContent = ''; });
  button.addEventListener('click', async () => {
    if (sending) return;
    if (!consent.checked) { feedback.textContent = 'Marque a autorização específica para registrar a solicitação no site.'; consent.focus(); return; }
    if (!form.reportValidity()) return;
    sending = true; button.disabled = true; button.textContent = 'Registrando…';
    try {
      key ||= crypto.randomUUID();
      const requestKey = key;
      const read = field => document.querySelector(`#quote-${field}`).value.trim();
      const payload = { name: read('name'), email: read('email'), phone: read('phone'), service: read('service'), message: read('description'), consent: true };
      const csrfResponse = await fetch('/api/v1/auth/csrf', { credentials: 'same-origin' });
      if (!csrfResponse.ok) throw new Error();
      const csrf = await csrfResponse.json();
      const response = await fetch('/api/v1/contact-requests', { method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf.data.csrfToken, 'Idempotency-Key': requestKey },
        body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'Não foi possível registrar.');
      feedback.textContent = result.data.message;
    } catch { feedback.textContent = 'Não foi possível registrar no site. Você ainda pode usar o botão de orçamento pelo WhatsApp.'; }
    finally { sending = false; button.disabled = false; button.textContent = 'Registrar solicitação no site'; }
  });
})();
