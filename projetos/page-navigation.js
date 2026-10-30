'use strict';

(() => {
  // Somente atualizar a página reinicia a leitura. Links com âncora e o
  // histórico de voltar/avançar conservam o comportamento do navegador.
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation?.type !== 'reload') return;

  const previousRestoration = history.scrollRestoration;
  history.scrollRestoration = 'manual';

  // Uma âncora antiga não deve levar novamente à seção após o F5.
  if (location.hash) {
    history.replaceState(history.state, '', location.pathname + location.search);
  }

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) return;
    const resetScroll = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    resetScroll();
    // A restauração de alguns navegadores termina depois do pageshow.
    requestAnimationFrame(resetScroll);
  });

  window.addEventListener('pagehide', () => {
    history.scrollRestoration = previousRestoration;
  });
})();
