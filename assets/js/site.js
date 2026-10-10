(() => {
  const normalize = (value) => value.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  document.querySelectorAll('[data-unconnected-form]').forEach((form) => {
    form.addEventListener('submit', (event) => event.preventDefault());
  });
  document.querySelectorAll('[data-collection-index]').forEach((directory) => {
    const query = directory.querySelector('#directory-query');
    if (!query) return;
    const filter = directory.querySelector('#directory-filter');
    const items = [...directory.querySelectorAll('[data-directory-item]')];
    const count = directory.querySelector('[data-directory-count]');
    const empty = directory.querySelector('[data-directory-empty]');
    directory.querySelector('[data-directory-controls]').hidden = false;
    const update = () => {
      const terms = normalize(query.value).trim().split(/\s+/).filter(Boolean);
      const role = filter ? filter.value : '';
      let visible = 0;
      items.forEach((item) => {
        const matches = terms.every((term) => normalize(item.dataset.search).includes(term));
        const roles = (item.dataset.roles || '').split(' ');
        item.hidden = !matches || (role && !roles.includes(role) && item.dataset.status !== role);
        if (!item.hidden) visible++;
      });
      count.textContent = `${visible} of ${items.length} shown`;
      empty.hidden = visible !== 0;
    };
    query.addEventListener('input', update);
    if (filter) filter.addEventListener('change', update);
    update();
  });
  const search = document.querySelector('[data-site-search]');
  if (!search) return;
  const form = search.querySelector('form');
  const input = search.querySelector('#site-query');
  const type = search.querySelector('#site-type');
  const status = search.querySelector('[data-search-status]');
  const results = search.querySelector('[data-search-results]');
  const params = new URLSearchParams(location.search);
  input.value = params.get('q') || '';
  if ([...type.options].some((option) => option.value === params.get('type'))) type.value = params.get('type');
  let indexPromise;
  let generation = 0;
  const load = () => indexPromise ||= fetch(search.dataset.index).then((response) => {
    if (!response.ok) throw new Error('Search index unavailable');
    return response.json();
  }).then((records) => records.map((record) => ({...record, searchable: normalize(record.title + ' ' + record.text)})))
    .catch((error) => { indexPromise = undefined; throw error; });
  const update = async () => {
    const current = ++generation;
    const terms = normalize(input.value).trim().split(/\s+/).filter(Boolean);
    const selection = type.value;
    const url = new URL(location.href);
    if (input.value.trim()) url.searchParams.set('q', input.value.trim()); else url.searchParams.delete('q');
    if (selection) url.searchParams.set('type', selection); else url.searchParams.delete('type');
    history.replaceState(null, '', url);
    results.replaceChildren();
    if (!terms.length && !selection) { status.textContent = 'Enter a name or topic to search.'; return; }
    status.textContent = 'Searching…';
    try {
      const records = await load();
      if (current !== generation) return;
      const matches = records.filter((record) => (!selection || record.type === selection) && terms.every((term) => record.searchable.includes(term)))
        .map((record) => ({record, score: terms.filter((term) => normalize(record.title).includes(term)).length}))
        .sort((a, b) => b.score - a.score || a.record.title.localeCompare(b.record.title));
      status.textContent = matches.length ? `${matches.length} result${matches.length === 1 ? '' : 's'}${matches.length > 50 ? ' — showing the first 50' : ''}.` : 'No results. Try another name, topic or content type.';
      for (const {record} of matches.slice(0, 50)) {
        const li = document.createElement('li'); li.className = 'search-result';
        const heading = document.createElement('h2');
        const link = document.createElement('a'); link.href = record.url; link.textContent = record.title;
        heading.append(link);
        const kind = document.createElement('p'); kind.className = 'meta'; kind.textContent = record.type.replaceAll('-', ' ');
        const excerpt = document.createElement('p'); excerpt.textContent = record.summary;
        li.append(heading, kind, excerpt); results.append(li);
      }
    } catch (error) {
      if (current === generation) status.textContent = 'Search is temporarily unavailable. Try again or browse the navigation.';
    }
  };
  form.addEventListener('submit', (event) => { event.preventDefault(); update(); });
  type.addEventListener('change', update);
  let timer;
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(update, 150); });
  update();
})();
