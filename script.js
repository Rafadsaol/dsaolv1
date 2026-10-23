'use strict';

// Endereço provisório: substitua pelo e-mail real antes de publicar.
const CONTACT_EMAIL = 'contato@dsaol.it';

const emailContact = document.querySelector('#email-contact');
emailContact.href = `mailto:${CONTACT_EMAIL}`;
document.querySelector('#year').textContent = new Date().getFullYear();

const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#menu');

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menu.classList.remove('is-open');
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menu.classList.toggle('is-open', !isOpen);
});

menu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    // Move o foco ao destino antes de ocultar o menu no celular.
    const target = document.querySelector(link.getAttribute('href'));
    if (menuToggle.getAttribute('aria-expanded') === 'true' && target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    closeMenu();
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.nav')) closeMenu();
});

window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
