(() => {
  'use strict';
  const navigation = document.querySelector('[data-navigation]');
  if (!navigation) return;
  const menuButton = navigation.querySelector('.menu-button');
  const menu = navigation.querySelector('.nav-list');
  const mobile = window.matchMedia('(max-width: 48rem)');
  navigation.classList.add('nav-enhanced');

  function closeMenu() {
    menu.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
  function updateMenu() {
    menuButton.hidden = !mobile.matches;
    closeMenu();
  }
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(expanded));
    menu.classList.toggle('is-open', expanded);
  });
  document.addEventListener('click', event => {
    if (navigation.contains(event.target)) return;
    closeMenu();
    navigation.querySelectorAll('details[open]').forEach(detail => { detail.open = false; });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const dropdown = navigation.querySelector('details[open]');
    if (dropdown) {
      dropdown.open = false;
      dropdown.querySelector('summary').focus();
    } else if (menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });
  mobile.addEventListener('change', updateMenu);
  updateMenu();
})();
