const nav = document.querySelector('[data-nav]');
const navToggle = document.querySelector('[data-nav-toggle]');
const menuToggles = [...document.querySelectorAll('[data-menu-toggle]')];
const desktop = window.matchMedia('(min-width: 48rem)');

function closeMenus(except = null) {
  menuToggles.forEach(toggle => {
    if (toggle === except) return;

    toggle.setAttribute('aria-expanded', 'false');
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));
    if (panel) panel.hidden = true;
  });
}

function closeNavigation() {
  navToggle?.setAttribute('aria-expanded', 'false');
  nav?.removeAttribute('data-open');
  closeMenus();
}

navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!open));
  nav?.toggleAttribute('data-open', !open);
});

menuToggles.forEach(toggle => {
  toggle.addEventListener('click', () => {
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));
    const open = toggle.getAttribute('aria-expanded') === 'true';

    closeMenus(toggle);
    toggle.setAttribute('aria-expanded', String(!open));
    if (panel) panel.hidden = open;
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeNavigation();
});

document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenus();
});

desktop.addEventListener('change', closeNavigation);
