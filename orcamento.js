'use strict';

(() => {
  const form = document.querySelector('#quote-form');
  const feedback = document.querySelector('#quote-feedback');
  const fields = [...form.querySelectorAll('input, select, textarea')];
  const service = document.querySelector('#quote-service');
  // Os rótulos vêm do próprio select, evitando listas divergentes entre HTML e mensagem.
  const serviceNames = new Map([...service.options].filter(option => option.value).map(option => [option.value, option.textContent]));
  const validDDDs = new Set([
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', '27', '28',
    '31', '32', '33', '34', '35', '37', '38', '41', '42', '43', '44', '45', '46', '47', '48', '49',
    '51', '53', '54', '55', '61', '62', '63', '64', '65', '66', '67', '68', '69',
    '71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89',
    '91', '92', '93', '94', '95', '96', '97', '98', '99'
  ]);

  function brazilianPhone(value) {
    if (!/^[+\d\s().-]+$/.test(value)) return null;
    let digits = value.replace(/\D/g, '');
    if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) digits = digits.slice(2);
    const subscriber = digits.slice(2);
    if (!validDDDs.has(digits.slice(0, 2)) || !/^(?:9\d{8}|[2-5]\d{7})$/.test(subscriber) || /^(\d)\1+$/.test(subscriber)) return null;
    return digits;
  }

  function businessNumber() {
    const config = window.DSAOL_CONFIG?.whatsapp;
    if (!config || config.isPlaceholder !== false || typeof config.number !== 'string') return null;
    if (!/^55\d{10,11}$/.test(config.number)) return null;
    return brazilianPhone(config.number) ? config.number : null;
  }

  function validationMessage(field) {
    const value = field.value.trim();
    if (field.type === 'checkbox') return field.checked ? '' : 'Confirme a ciência sobre o uso dos dados para preparar o contato.';
    if (field.required && !value) return 'Preencha este campo.';
    if (field.maxLength > 0 && value.length > field.maxLength) return `Use no máximo ${field.maxLength} caracteres.`;
    switch (field.id) {
      case 'quote-name':
        return value.length >= 3 && value.split(/\s+/).length >= 2 && /^[\p{L}\p{M}.'’ -]+$/u.test(value) ? '' : 'Informe seu nome completo, com nome e sobrenome.';
      case 'quote-email':
        return !field.validity.typeMismatch && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Informe um e-mail válido, como nome@empresa.com.';
      case 'quote-phone':
        return brazilianPhone(value) ? '' : 'Informe um telefone brasileiro válido, com DDD. Ex.: (11) 91234-5678.';
      case 'quote-service':
        return serviceNames.has(value) ? '' : 'Selecione um dos serviços disponíveis.';
      case 'quote-description':
        return value.length >= 20 ? '' : 'Descreva seu projeto com pelo menos 20 caracteres.';
      default:
        return '';
    }
  }

  function validateField(field) {
    const message = validationMessage(field);
    document.querySelector(`#${field.id}-error`).textContent = message;
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    return !message;
  }

  function configurationError() {
    feedback.textContent = 'O WhatsApp comercial ainda não está configurado. Nenhuma mensagem foi aberta. Use o contato por e-mail na seção Contato.';
    feedback.dataset.state = 'error';
    feedback.focus();
  }

  function openWhatsApp(number, message) {
    // Nenhum dado é enviado por fetch, formulário HTTP, analytics ou armazenamento.
    // Esta abertura só acontece após uma ação explícita do visitante.
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    // O link permanece disponível se o navegador bloquear a nova aba/janela.
    // Com noopener/noreferrer, retorno null não confirma bloqueio de pop-up.
    const retry = document.createElement('a');
    retry.href = url;
    retry.target = '_blank';
    retry.rel = 'noopener noreferrer';
    retry.className = 'button secondary';
    retry.textContent = 'Abrir conversa no WhatsApp (nova aba)';
    feedback.dataset.state = 'info';
    feedback.replaceChildren(
      document.createTextNode('Se o WhatsApp não abriu, permita a abertura de novas abas ou use o link abaixo. Revise e confirme o envio no WhatsApp.'),
      document.createElement('br'), retry
    );
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      // Alguns ambientes restritos lançam erro; o link manual continua utilizável.
      feedback.focus();
    }
  }

  function validateForm() {
    const invalid = fields.filter((field) => !validateField(field));
    if (invalid.length) {
      feedback.dataset.state = 'error';
      feedback.textContent = `Revise ${invalid.length === 1 ? 'o campo indicado' : 'os campos indicados'} antes de continuar.`;
      invalid[0].focus();
      return false;
    }
    return true;
  }

  // O registro opcional reutiliza a mesma validação sem abrir o WhatsApp.
  form.addEventListener('quote:validate', event => {
    if (!validateForm()) event.preventDefault();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    const number = businessNumber();
    if (!number) return configurationError();
    const value = (id) => document.querySelector(`#quote-${id}`).value.trim();
    const phone = brazilianPhone(value('phone'));
    const message = [
      'Olá, dSaOl Web Studio! Gostaria de solicitar um orçamento de site.',
      '', `Nome: ${value('name')}`, `Empresa: ${value('company') || 'Não informada'}`,
      `Serviço solicitado: ${serviceNames.get(service.value)}`, '',
      'Descrição do projeto:', value('description'), '',
      `E-mail: ${value('email')}`, `WhatsApp de contato: +55 ${phone}`
    ].join('\n');
    openWhatsApp(number, message);
  });

  fields.forEach((field) => {
    field.addEventListener(field.matches('select, [type="checkbox"]') ? 'change' : 'input', () => {
      if (field.hasAttribute('aria-invalid')) validateField(field);
      feedback.textContent = '';
      delete feedback.dataset.state;
    });
  });

  const preset = new URLSearchParams(window.location.search).get('servico');
  if (serviceNames.has(preset)) service.value = preset;

  document.querySelector('#whatsapp-floating').addEventListener('click', () => {
    const number = businessNumber();
    if (!number) return configurationError();
    openWhatsApp(number, 'Olá, dSaOl Web Studio! Gostaria de conversar sobre a criação de um site.');
  });

  // Sem JavaScript, o botão permanece desabilitado e não há submissão HTTP.
  form.noValidate = true;
  document.querySelector('#quote-submit').disabled = false;
  document.querySelector('#whatsapp-floating').disabled = false;
})();
