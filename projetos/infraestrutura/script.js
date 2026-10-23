'use strict';

(() => {
  const toggle = document.querySelector('#toggle-simulation');
  const state = document.querySelector('#simulation-state');
  const metrics = { cpu: 32, ram: 48, storage: 61, network: 120 };
  const history = Array(20).fill(metrics.cpu);
  let timer = null;

  function fluctuate(value, range, max = 100) {
    return Math.max(0, Math.min(max, value + Math.round((Math.random() - 0.5) * range)));
  }

  function updateMetrics() {
    metrics.cpu = fluctuate(metrics.cpu, 30);
    metrics.ram = fluctuate(metrics.ram, 12);
    metrics.storage = fluctuate(metrics.storage, 2);
    metrics.network = fluctuate(metrics.network, 100, 500);
    Object.entries(metrics).forEach(([name, value]) => {
      document.querySelector(`#${name}-value`).textContent = value;
      const meter = document.querySelector(`#${name}-meter`);
      meter.value = value;
      meter.textContent = `${value}${name === 'network' ? ' Mbps' : '%'}`;
    });
    history.push(metrics.cpu);
    history.shift();
    document.querySelector('#cpu-line').setAttribute('points', history.map((value, index) =>
      `${10 + index * (580 / (history.length - 1))},${210 - value * 2}`
    ).join(' '));
    document.querySelector('#chart-description').textContent = `20 amostras simuladas. CPU atual: ${metrics.cpu}%. Mínima: ${Math.min(...history)}%. Máxima: ${Math.max(...history)}%.`;
    const statuses = [
      { state: 'online', text: 'Operacional' },
      { state: 'attention', text: 'Atenção' },
      { state: 'offline', text: 'Indisponível' }
    ];
    document.querySelectorAll('.server-status').forEach((server) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      server.dataset.state = status.state;
      server.textContent = status.text;
    });
  }

  function pause() {
    window.clearInterval(timer);
    timer = null;
    toggle.textContent = 'Iniciar simulação';
    toggle.setAttribute('aria-pressed', 'false');
    state.textContent = 'Simulação pausada. Nenhuma conexão real.';
  }

  toggle.addEventListener('click', () => {
    if (timer !== null) return pause();
    updateMetrics();
    timer = window.setInterval(updateMetrics, 1600);
    toggle.textContent = 'Pausar simulação';
    toggle.setAttribute('aria-pressed', 'true');
    state.textContent = 'Simulação ativa — atualização a cada 1,6 segundo.';
  });
  window.addEventListener('pagehide', pause);
})();
