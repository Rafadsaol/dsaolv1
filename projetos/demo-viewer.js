'use strict';

(() => {
  const projects = {
    'linha-tenue': { title: 'Linha Tênue', url: 'https://linhatenuev1.pages.dev/' },
    'cidade-do-sabor': { title: 'Cidade do Sabor', url: 'https://cidadedosaborv1.pages.dev/' }
  };
  const triggers = [...document.querySelectorAll('[data-open-demo]')];
  if (!triggers.length) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'demo-dialog';
  dialog.id = 'demo-viewer';
  dialog.setAttribute('aria-labelledby', 'demo-viewer-title');
  dialog.setAttribute('aria-describedby', 'demo-viewer-notice');
  dialog.innerHTML = `<header class="demo-viewer-header"><div><span class="demo-viewer-label">DEMONSTRAÇÃO INTERATIVA</span><h2 id="demo-viewer-title"></h2></div><div class="demo-viewer-controls" role="group" aria-label="Formato da demonstração"><button type="button" data-demo-view="desktop" aria-pressed="true">Desktop</button><button type="button" data-demo-view="mobile" aria-pressed="false">Celular</button></div><button type="button" class="demo-viewer-close" aria-label="Fechar demonstração">Fechar <span aria-hidden="true">×</span></button></header><div class="demo-viewer-stage"><div class="demo-frame-wrap"></div></div><footer class="demo-viewer-footer"><p id="demo-viewer-notice">Projeto conceitual. Use dados fictícios; não há compras ou pedidos reais.</p><div><span class="demo-viewer-status" role="status"></span><button type="button" class="demo-viewer-reload">Recarregar demo</button></div></footer>`;
  document.body.append(dialog);
  const title = dialog.querySelector('h2');
  const wrap = dialog.querySelector('.demo-frame-wrap');
  const status = dialog.querySelector('[role="status"]');
  const close = dialog.querySelector('.demo-viewer-close');
  const views = [...dialog.querySelectorAll('[data-demo-view]')];
  let opener, project, timer, previousOverflow, previousScroll;

  function loadDemo() {
    clearTimeout(timer);
    status.textContent = 'Carregando demonstração…';
    const frame = document.createElement('iframe');
    frame.title = `Demonstração interativa de ${project.title}`;
    frame.referrerPolicy = 'no-referrer';
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-modals allow-downloads');
    frame.addEventListener('load', () => {
      clearTimeout(timer);
      // O evento load não confirma o conteúdo de uma origem externa.
      status.textContent = 'Se a tela não aparecer, tente recarregar a demo.';
    });
    frame.src = project.url;
    wrap.replaceChildren(frame);
    timer = setTimeout(() => { status.textContent = 'Está demorando? Tente recarregar a demo.'; }, 12000);
  }

  triggers.forEach(button => {
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', dialog.id);
    button.addEventListener('click', () => {
      project = projects[button.dataset.openDemo];
      if (!project || dialog.open) return;
      opener = button;
      title.textContent = project.title;
      dialog.dataset.view = 'desktop';
      views.forEach(view => view.setAttribute('aria-pressed', String(view.dataset.demoView === 'desktop')));
      previousScroll = { top: window.scrollY, left: window.scrollX };
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
      close.focus({ preventScroll: true });
      loadDemo();
    });
  });
  views.forEach(button => button.addEventListener('click', () => {
    dialog.dataset.view = button.dataset.demoView;
    views.forEach(view => view.setAttribute('aria-pressed', String(view === button)));
  }));
  close.addEventListener('click', () => dialog.close());
  dialog.querySelector('.demo-viewer-reload').addEventListener('click', loadDemo);
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    clearTimeout(timer);
    wrap.replaceChildren();
    document.body.style.overflow = previousOverflow;
    opener?.focus({ preventScroll: true });
    window.scrollTo({ ...previousScroll, behavior: 'instant' });
  });
})();
