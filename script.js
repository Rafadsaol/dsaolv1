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

window.matchMedia('(min-width: 821px)').addEventListener('change', closeMenu);

// Uma atualização por frame mantém leve o destaque das seções do menu.
const sectionLinks = [...menu.querySelectorAll('a[href^="#"]')];
const sections = sectionLinks.map((link) => document.querySelector(link.hash));
let navigationFrame = null;

function updateActiveSection() {
  const headerBottom = document.querySelector('.header').getBoundingClientRect().bottom;
  const anchorOffset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  let activeIndex = 0;
  sections.forEach((section, index) => {
    const sectionOffset = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
    if (section.getBoundingClientRect().top <= Math.max(headerBottom + 32, anchorOffset + sectionOffset + 2)) {
      activeIndex = index;
    }
  });
  // The last section may be too short to reach the header on a tall viewport.
  if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
    activeIndex = sections.length - 1;
  }
  sectionLinks.forEach((link, index) => {
    if (index === activeIndex) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  navigationFrame = null;
}

function scheduleNavigationUpdate() {
  if (navigationFrame === null) navigationFrame = window.requestAnimationFrame(updateActiveSection);
}

window.addEventListener('scroll', scheduleNavigationUpdate, { passive: true });
window.addEventListener('resize', scheduleNavigationUpdate);
window.addEventListener('load', scheduleNavigationUpdate);
updateActiveSection();
