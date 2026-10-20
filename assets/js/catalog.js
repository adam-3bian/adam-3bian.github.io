(() => {
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* Storage is optional. */ } }
  };

  const themeButton = document.querySelector('[data-theme-toggle]');
  const logo = document.querySelector('.brand img');
  const applyTheme = (theme) => {
    document.body.dataset.theme = theme;
    if (themeButton) {
      themeButton.hidden = false;
      themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
      themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    }
    if (logo && logo.dataset[theme]) logo.src = logo.dataset[theme];
  };
  applyTheme(storage.get('cheri-theme') || document.body.dataset.theme || 'light');
  themeButton?.addEventListener('click', () => {
    const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    storage.set('cheri-theme', next);
    applyTheme(next);
  });

  document.querySelectorAll('[data-catalog]').forEach((catalog) => {
    const list = catalog.querySelector('[data-catalog-list]');
    const items = [...list.children];
    const search = catalog.querySelector('[data-search-input]');
    const filter = catalog.querySelector('[data-filter-input]');
    const sort = catalog.querySelector('[data-sort-input]');
    const counter = catalog.querySelector('[data-result-count]');
    const empty = catalog.querySelector('[data-empty-state]');
    const buttons = [...catalog.querySelectorAll('[data-view-button]')];
    const parameters = new URLSearchParams(location.search);
    const normalise = (value) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
    const records = items.map((node, index) => ({
      node, index, title: node.dataset.title || '',
      search: normalise(node.dataset.search || ''),
      facets: (node.dataset.facet || '').split('|||').map(x => x.trim()).filter(Boolean),
      date: node.dataset.date ? Date.parse(node.dataset.date) : NaN
    }));
    const collator = new Intl.Collator(document.documentElement.lang, { sensitivity: 'base', numeric: true });
    const facets = [...new Set(records.flatMap(record => record.facets))].sort(collator.compare);
    facets.forEach((value) => filter.add(new Option(value, value)));
    catalog.querySelector('[data-filter-control]').hidden = facets.length < 2;
    if (!records.some(record => Number.isFinite(record.date))) {
      catalog.querySelectorAll('[data-date-option]').forEach(option => option.remove());
    }
    search.value = parameters.get('q') || '';
    if (facets.includes(parameters.get('filter'))) filter.value = parameters.get('filter');
    if ([...sort.options].some(option => option.value === parameters.get('sort'))) sort.value = parameters.get('sort');

    let view = parameters.get('view') || storage.get('cheri-catalog-view') || 'list';
    const setView = (next, persist = true) => {
      view = next === 'grid' ? 'grid' : 'list';
      catalog.dataset.view = view;
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.viewButton === view)));
      if (persist) storage.set('cheri-catalog-view', view);
    };
    const updateAddress = () => {
      const url = new URL(location.href);
      [['q', search.value.trim()], ['filter', filter.value], ['sort', sort.value === 'default' ? '' : sort.value], ['view', view === 'list' ? '' : view]].forEach(([name, value]) => {
        if (value) url.searchParams.set(name, value); else url.searchParams.delete(name);
      });
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    };
    const update = (address = true) => {
      const terms = normalise(search.value.trim()).split(/\s+/).filter(Boolean);
      let visible = 0;
      const ordered = [...records].sort((a, b) => {
        if (sort.value === 'title-asc') return collator.compare(a.title, b.title);
        if (sort.value === 'title-desc') return collator.compare(b.title, a.title);
        if (sort.value.startsWith('date-')) {
          if (!Number.isFinite(a.date)) return Number.isFinite(b.date) ? 1 : a.index - b.index;
          if (!Number.isFinite(b.date)) return -1;
          return (sort.value === 'date-asc' ? a.date - b.date : b.date - a.date) || a.index - b.index;
        }
        return a.index - b.index;
      });
      const fragment = document.createDocumentFragment();
      ordered.forEach((record) => {
        const match = terms.every(term => record.search.includes(term)) && (!filter.value || record.facets.includes(filter.value));
        record.node.hidden = !match;
        if (match) visible++;
        fragment.append(record.node);
      });
      list.append(fragment);
      counter.textContent = `${visible} ${visible === 1 ? 'result' : 'results'}${visible !== records.length ? ` of ${records.length}` : ''}`;
      empty.hidden = visible !== 0;
      if (address) updateAddress();
    };
    search.addEventListener('input', () => update());
    filter.addEventListener('change', () => update());
    sort.addEventListener('change', () => update());
    buttons.forEach(button => button.addEventListener('click', () => { setView(button.dataset.viewButton); updateAddress(); }));
    catalog.querySelector('[data-reset]').addEventListener('click', () => {
      search.value = ''; filter.value = ''; sort.value = 'default'; update(); search.focus();
    });
    setView(view, false);
    update(false);
    catalog.querySelector('[data-catalog-controls]').hidden = false;
  });
})();
