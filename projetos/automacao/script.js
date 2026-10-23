'use strict';

(() => {
  const run = document.querySelector('#run-automation');
  const reset = document.querySelector('#reset-automation');
  const state = document.querySelector('#automation-state');
  const steps = [...document.querySelectorAll('.workflow-step')];
  const log = document.querySelector('#execution-log');
  const empty = document.querySelector('#log-empty');
  const messages = [
    'Solicitação fictícia recebida.',
    'Dados de exemplo validados.',
    'Processamento simulado concluído.',
    'Fluxo demonstrativo finalizado. Nenhuma operação real foi realizada.'
  ];
  let timer = null;
  let running = false;
  let currentStep = 0;

  function appendLog(message) {
    empty.hidden = true;
    const entry = document.createElement('li');
    const time = document.createElement('time');
    const now = new Date();
    time.dateTime = now.toISOString();
    time.textContent = now.toLocaleTimeString('pt-BR');
    const text = document.createElement('span');
    text.textContent = message;
    entry.append(time, text);
    log.append(entry);
  }

  function clearExecution() {
    window.clearTimeout(timer);
    timer = null;
    running = false;
    currentStep = 0;
    run.disabled = false;
    run.textContent = 'Executar automação';
    log.replaceChildren();
    empty.hidden = false;
    steps.forEach((step) => {
      step.dataset.state = 'pending';
      step.removeAttribute('aria-current');
      step.querySelector('.step-status').textContent = 'Aguardando';
    });
  }

  function advance() {
    if (!running) return;
    const step = steps[currentStep];
    step.dataset.state = 'active';
    step.setAttribute('aria-current', 'step');
    step.querySelector('.step-status').textContent = 'Em execução';
    state.textContent = `Etapa ${currentStep + 1} de ${steps.length}: ${step.querySelector('h3').textContent}.`;
    timer = window.setTimeout(() => {
      step.dataset.state = 'complete';
      step.removeAttribute('aria-current');
      step.querySelector('.step-status').textContent = 'Concluída';
      appendLog(messages[currentStep]);
      currentStep += 1;
      if (currentStep < steps.length) return advance();
      timer = null;
      running = false;
      run.disabled = false;
      run.textContent = 'Executar novamente';
      state.textContent = 'Simulação concluída. Nenhum dado foi processado de verdade.';
    }, 1000);
  }

  run.addEventListener('click', () => {
    if (running) return;
    clearExecution();
    running = true;
    run.disabled = true;
    appendLog('Iniciando uma execução fictícia.');
    advance();
  });
  reset.addEventListener('click', () => {
    clearExecution();
    state.textContent = 'Demonstração reiniciada. Pronto para executar.';
  });
  window.addEventListener('pagehide', () => {
    clearExecution();
    state.textContent = 'Pronto para executar.';
  });
})();
