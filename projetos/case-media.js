'use strict';

(() => {
  const videos = [...document.querySelectorAll('[data-demo-video]')];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const states = new Map(videos.map(video => [video, { visible: false, userPaused: false }]));

  function update(video) {
    const state = states.get(video);
    if (!state.visible || document.hidden || motion.matches) {
      video.pause();
      return;
    }
    if (!state.userPaused) {
      video.muted = true;
      // Se o navegador bloquear autoplay, os controles nativos continuam disponíveis.
      video.play().catch(() => {});
    }
  }

  for (const video of videos) {
    video.muted = true;
    video.addEventListener('pause', () => {
      if (states.get(video).visible && !document.hidden && !motion.matches) states.get(video).userPaused = true;
    });
    video.addEventListener('play', () => { states.get(video).userPaused = false; });
  }

  // Navegadores sem IntersectionObserver mantêm reprodução manual pelos controles.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        states.get(entry.target).visible = entry.isIntersecting && entry.intersectionRatio >= .25;
        update(entry.target);
      }
    }, { threshold: [0, .25] });
    videos.forEach(video => observer.observe(video));
  }

  motion.addEventListener('change', () => videos.forEach(update));
  document.addEventListener('visibilitychange', () => videos.forEach(update));
})();
