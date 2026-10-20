(() => {
  const glossary = document.querySelector('[data-glossary]');
  if (!glossary) return;
  const search = glossary.querySelector('[data-glossary-search]');
  const counter = glossary.querySelector('[data-glossary-count]');
  const empty = glossary.querySelector('[data-glossary-empty]');
  const normalise = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  const entries = [...glossary.querySelectorAll('[data-glossary-entry]')].map(node => ({ node, text: normalise(node.querySelector('dfn').textContent + ' ' + node.querySelector('dd').textContent) }));
  const groups = [...glossary.querySelectorAll('[data-glossary-group]')];

  function update() {
    const terms = normalise(search.value.trim()).split(/\s+/).filter(Boolean);
    let visible = 0;
    entries.forEach(({ node, text }) => {
      node.hidden = !terms.every(term => text.includes(term));
      if (!node.hidden) visible++;
    });
    groups.forEach(group => { group.hidden = !group.querySelector('[data-glossary-entry]:not([hidden])'); });
    counter.textContent = `${visible} ${visible === 1 ? 'term' : 'terms'}${visible !== entries.length ? ` of ${entries.length}` : ''}`;
    empty.hidden = visible !== 0;
  }

  function clear() { search.value = ''; update(); }

  function revealTarget(focus = false) {
    if (!location.hash) return;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target || !glossary.contains(target)) return;
    clear();
    requestAnimationFrame(() => {
      target.scrollIntoView({ block: 'start' });
      if (focus) target.focus({ preventScroll: true });
    });
  }

  search.addEventListener('input', update);
  glossary.querySelectorAll('[data-glossary-clear], [data-glossary-reset]').forEach(button => {
    button.addEventListener('click', () => { clear(); search.focus(); });
  });
  glossary.querySelector('.glossary-index')?.addEventListener('click', event => {
    if (event.target.closest('a[href]')) clear();
  });
  glossary.querySelectorAll('.glossary-permalink').forEach(link => link.addEventListener('click', () => {
    // Repeated clicks on the current hash must also reveal a filtered term.
    clear();
    if (link.hash === location.hash) revealTarget(true);
  }));
  window.addEventListener('hashchange', () => revealTarget(true));
  glossary.querySelector('[data-glossary-controls]').hidden = false;
  update();
  revealTarget();
})();
