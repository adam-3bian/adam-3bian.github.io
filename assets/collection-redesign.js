/* Progressive enhancement for real Jekyll collection pages. */
(() => {
  'use strict';
  const mobile = matchMedia('(max-width: 63.999rem)');
  const groups = [...document.querySelectorAll('.primary-menu-panel .menu-group')];
  groups.forEach((group, i) => {
    const heading = group.querySelector(':scope > .menu-group-label');
    const links = group.querySelector(':scope > .menu-links');
    if (!heading || !links) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'subcategory-toggle';
    button.textContent = heading.textContent.trim();
    button.setAttribute('aria-controls', 'subcategory-' + i);
    links.id = 'subcategory-' + i;
    heading.replaceChildren(button);
    button.addEventListener('click', () => {
      if (!mobile.matches) return;
      const expanded = group.classList.toggle('is-expanded');
      button.setAttribute('aria-expanded', String(expanded));
    });
  });
  function syncMode() {
    groups.forEach(group => {
      const button = group.querySelector('.subcategory-toggle');
      if (!button) return;
      group.classList.add('is-expanded');
      button.disabled = !mobile.matches;
      button.setAttribute('aria-expanded', 'true');
    });
  }
  mobile.addEventListener('change', syncMode);
  syncMode();

  for (const listing of document.querySelectorAll('.listing[data-listing]')) {
    const heading = listing.querySelector('.section-heading');
    if (!heading || !listing.querySelector('.cards')) continue;
    const controls = document.createElement('div');
    controls.className = 'directory-view';
    controls.setAttribute('role','group');
    controls.setAttribute('aria-label','Collection layout');
    for (const mode of ['grid','list']) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = mode === 'grid' ? 'Grid' : 'List';
      button.setAttribute('aria-pressed', String(mode === 'grid'));
      button.addEventListener('click', () => {
        listing.dataset.view = mode;
        controls.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      });
      controls.append(button);
    }
    listing.dataset.view = 'grid';
    heading.append(controls);
  }
})();
