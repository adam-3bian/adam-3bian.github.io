// Native details keep every route usable without this enhancement.
(() => {
  const header = document.querySelector('.site-header');
  const navigation = document.getElementById('header-navigation');
  const toggle = document.getElementById('navigation-toggle');
  const primary = document.getElementById('primary-navigation');
  if (!header || !navigation || !toggle || !primary) return;

  const desktop = window.matchMedia('(min-width: 64rem)');
  const menus = [...primary.querySelectorAll('.primary-menu')];
  const groups = [...primary.querySelectorAll('.menu-group-disclosure')];
  const summaryFor = menu => menu.querySelector(':scope > summary');
  const closeMenus = () => menus.forEach(menu => { menu.open = false; });

  function setNavigation(open) {
    navigation.hidden = !desktop.matches && !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', `${open ? 'Close' : 'Open'} navigation`);
  }

  function containPanels() {
    if (!desktop.matches) return;
    for (const menu of menus.filter(menu => menu.open)) {
      const panel = menu.querySelector('.primary-menu-panel');
      panel.style.setProperty('--menu-top', `${Math.max(0, panel.getBoundingClientRect().top)}px`);
    }
  }

  function openMenu(menu) {
    if (menus.includes(menu)) menus.forEach(peer => { if (peer !== menu) peer.open = false; });
    menu.open = true;
    containPanels();
  }

  for (const menu of menus) {
    menu.addEventListener('toggle', () => {
      if (menu.open) {
        menus.forEach(peer => { if (peer !== menu) peer.open = false; });
        containPanels();
      }
    });
  }

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    if (!open) closeMenus();
    setNavigation(open);
  });

  header.addEventListener('keydown', event => {
    const summary = event.target.closest('summary');
    const menu = summary?.parentElement;
    if (summary && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      openMenu(menu);
      const links = [...menu.querySelectorAll('a')].filter(link => link.getClientRects().length);
      links[event.key === 'ArrowUp' ? links.length - 1 : 0]?.focus();
    } else if (summary && desktop.matches && menus.includes(menu) && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const index = menus.indexOf(menu);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? menus.length - 1 :
        (index + (event.key === 'ArrowRight' ? 1 : -1) + menus.length) % menus.length;
      closeMenus();
      summaryFor(menus[next]).focus();
    } else if (event.key === 'Escape' || (event.key === 'ArrowLeft' && !summary)) {
      const group = !desktop.matches && event.target.closest('.menu-group-disclosure[open]');
      const open = group || menus.find(menu => menu.open);
      if (open) {
        event.preventDefault();
        open.open = false;
        summaryFor(open).focus();
      } else if (event.key === 'Escape' && !navigation.hidden && !desktop.matches) {
        event.preventDefault();
        setNavigation(false);
        toggle.focus();
      }
    }
  });

  document.addEventListener('click', event => {
    if (!header.contains(event.target)) {
      closeMenus();
      setNavigation(false);
    }
  });
  header.addEventListener('focusout', event => {
    if (!header.contains(event.relatedTarget)) {
      closeMenus();
      setNavigation(false);
    }
  });

  function changeMode() {
    const focused = document.activeElement;
    const focusWasInNavigation = navigation.contains(focused);
    closeMenus();
    groups.forEach(group => { group.open = desktop.matches; });
    toggle.hidden = desktop.matches;
    setNavigation(false);
    if (!desktop.matches && focusWasInNavigation) toggle.focus();
    if (desktop.matches && focused === toggle) summaryFor(menus[0])?.focus();
  }
  desktop.addEventListener('change', changeMode);
  window.addEventListener('resize', containPanels);
  window.addEventListener('scroll', containPanels, { passive: true });
  changeMode();
})();
