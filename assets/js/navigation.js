(() => {
  const header = document.querySelector('.site-header');
  const navigation = document.querySelector('#primary-navigation');
  const hamburger = document.querySelector('#hamburger');
  if (!header || !navigation || !hamburger) return;

  const buttons = Array.from(navigation.querySelectorAll('.submenu-toggle'));
  const targets = new Map(buttons.map((button) => [button, document.getElementById(button.getAttribute('aria-controls'))]));
  const owners = new Map(Array.from(targets, ([button, menu]) => [menu, button]));
  const groupButtons = buttons.filter((button) => button.classList.contains('menu-group-toggle'));
  const positionClasses = ['opens-left', 'opens-up', 'align-start', 'menu-docked', 'docked-left'];
  const desktop = () => getComputedStyle(navigation).getPropertyValue('--navigation-mode').trim() === 'flyout';
  const activeButton = (button) => !groupButtons.includes(button) || !desktop();
  const directButton = (item) => item.querySelector(':scope > .submenu-toggle, :scope > .submenu-row > .submenu-toggle');
  const visibleItems = (menu) => Array.from(menu.querySelectorAll('a, .menu-group-toggle')).filter((item) => !item.closest('[hidden]') && (item.tagName === 'A' || activeButton(item)));

  function setNavigation(open) {
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', (open ? 'Close' : 'Open') + ' navigation');
    navigation.dataset.open = String(open);
  }

  function setExpanded(button, expanded) {
    button.setAttribute('aria-expanded', String(expanded));
    const indicator = button.querySelector('.menu-indicator');
    if (indicator) indicator.textContent = expanded ? '▲' : '▼';
  }

  function close(button) {
    const menu = targets.get(button);
    if (!menu) return;
    menu.querySelectorAll('.submenu-toggle[aria-expanded="true"]').forEach(close);
    // Mega-menu groups are plain, expanded columns on desktop and disclosures
    // on mobile. Their hidden desktop triggers are never keyboard destinations.
    const expanded = groupButtons.includes(button) && desktop();
    setExpanded(button, expanded);
    menu.hidden = !expanded;
    menu.classList.remove(...positionClasses);
  }

  function closeAll() {
    buttons.filter((button) => button.getAttribute('aria-expanded') === 'true').forEach(close);
  }

  function position(menu, button) {
    menu.classList.remove(...positionClasses);
    if (!desktop() || menu.classList.contains('menu-group-links')) return;
    const width = document.documentElement.clientWidth || window.innerWidth;
    const height = window.innerHeight;
    const rawGap = getComputedStyle(navigation).getPropertyValue('--menu-viewport-gap').trim();
    const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const gap = (parseFloat(rawGap) || 0) * (rawGap.endsWith('rem') ? fontSize : 1);
    const parentMenu = button.closest('.submenu');
    const mega = menu.classList.contains('megamenu');
    menu.style.setProperty('--menu-top', Math.max(gap, Math.min(header.getBoundingClientRect().bottom, height - 100)) + 'px');
    let rect;

    if (menu.classList.contains('flyout')) {
      if (parentMenu && parentMenu.classList.contains('opens-left')) menu.classList.add('opens-left');
      rect = menu.getBoundingClientRect();
      if (rect.right > width - gap) menu.classList.add('opens-left');
      if (menu.getBoundingClientRect().left < gap) menu.classList.remove('opens-left');
      if (menu.getBoundingClientRect().bottom > height - gap) menu.classList.add('opens-up');
    } else if (!mega && menu.getBoundingClientRect().left < gap) {
      menu.classList.add('align-start');
    }

    rect = menu.getBoundingClientRect();
    const horizontalGap = mega ? 0 : gap;
    const clippedParent = parentMenu && parentMenu.classList.contains('menu-docked');
    if (clippedParent || rect.left < horizontalGap || rect.right > width - horizontalGap || rect.top < gap || rect.bottom > height - gap) {
      menu.classList.add('menu-docked');
      if (!mega && button.getBoundingClientRect().left < width / 2) menu.classList.add('docked-left');
    }
  }

  function open(button) {
    const menu = targets.get(button);
    if (!menu || !activeButton(button)) return;
    const ancestor = button.closest('.submenu');
    if (ancestor && ancestor.hidden && owners.has(ancestor)) open(owners.get(ancestor));
    const item = button.closest('li');
    Array.from(item.parentElement.children).forEach((sibling) => {
      const peer = directButton(sibling);
      if (peer && peer !== button) close(peer);
    });
    setExpanded(button, true);
    menu.hidden = false;
    position(menu, button);
  }

  header.addEventListener('click', (event) => {
    const button = event.target.closest('#hamburger, .submenu-toggle');
    if (!button || !header.contains(button) || (button !== hamburger && !activeButton(button))) return;
    if (button === hamburger) {
      const opening = button.getAttribute('aria-expanded') !== 'true';
      if (!opening) closeAll();
      setNavigation(opening);
    } else if (button.getAttribute('aria-expanded') === 'true') {
      close(button);
    } else {
      open(button);
    }
  });

  header.addEventListener('keydown', (event) => {
    const row = event.target.closest('.submenu-row');
    const button = event.target.closest('.submenu-toggle') || (row && row.querySelector('.submenu-toggle'));
    if (button && activeButton(button) && ['ArrowDown', 'ArrowUp', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      open(button);
      const items = visibleItems(targets.get(button));
      if (items.length) items[event.key === 'ArrowUp' ? items.length - 1 : 0].focus();
    } else if (event.key === 'ArrowLeft') {
      const menu = event.target.closest('.flyout, .menu-group-links');
      if (menu && owners.has(menu) && activeButton(owners.get(menu))) {
        event.preventDefault();
        const owner = owners.get(menu);
        close(owner);
        owner.focus();
      }
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const expanded = buttons.filter((button) => activeButton(button) && button.getAttribute('aria-expanded') === 'true');
    // Descendant triggers follow their ancestors in document order. Close the
    // deepest open disclosure even when a mouse opened it without moving focus.
    const button = expanded[expanded.length - 1];
    if (button) {
      event.preventDefault();
      close(button);
      button.focus();
    } else if (hamburger.getAttribute('aria-expanded') === 'true') {
      event.preventDefault();
      setNavigation(false);
      hamburger.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) {
      closeAll();
      setNavigation(false);
    }
  });

  header.addEventListener('focusout', (event) => {
    if (!header.contains(event.relatedTarget)) {
      closeAll();
      setNavigation(false);
    }
  });

  // Pointer hover is visual feedback only. Native click/tap and keyboard
  // activation share one disclosure state, so a first click never closes
  // a menu that was opened accidentally while approaching its trigger.
  window.addEventListener('resize', () => {
    closeAll();
    groupButtons.forEach(close);
    setNavigation(false);
  });

  document.documentElement.classList.add('js');
  groupButtons.forEach(close);
  clearTimeout(window.cheriNavigationWait);
  document.documentElement.classList.remove('navigation-pending');
})();
