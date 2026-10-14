// Local static search. Queries stay on this website and results use text nodes.
(() => {
  const form = document.getElementById('site-search');
  if (!form) return;
  const input = document.getElementById('search-query');
  const type = document.getElementById('search-type');
  const status = document.getElementById('search-status');
  const results = document.getElementById('search-results');
  const region = document.getElementById('search-results-region');
  const indexURL = new URL(form.dataset.indexUrl, location.href);
  const prefix = indexURL.pathname.slice(0, indexURL.pathname.indexOf('/assets/'));
  const normalise = value => String(value || '').normalize('NFKC').toLocaleLowerCase('en-GB');
  const collator = new Intl.Collator('en-GB', { sensitivity: 'base', numeric: true });
  const fullDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' });
  const monthDate = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const labels = new Map([...type.options].map(option => [option.value, option.text]));
  let indexPromise;
  let revision = 0;

  function loadIndex() {
    if (!indexPromise) indexPromise = fetch(indexURL, { credentials: 'omit', cache: 'force-cache' }).then(response => {
      if (!response.ok) throw new Error('Unavailable index');
      return response.json();
    }).then(payload => {
      if (payload.version !== 1 || !Array.isArray(payload.records)) throw new Error('Invalid index');
      const seen = new Set();
      return payload.records.filter(record => {
        if (typeof record.title !== 'string' || typeof record.url !== 'string') return false;
        const target = new URL(record.url, location.href);
        if (target.origin !== location.origin || !target.pathname.startsWith(`${prefix}/`) || seen.has(target.pathname)) return false;
        seen.add(target.pathname);
        record.href = target.href;
        record.titleKey = normalise(record.title);
        record.summaryKey = normalise(record.summary);
        record.keywordKey = normalise(record.keywords);
        record.searchKey = normalise(`${record.title} ${record.summary || ''} ${record.keywords || ''} ${record.text || ''} ${record.date || ''} ${labels.get(record.type) || record.type}`);
        return true;
      });
    }).catch(error => { indexPromise = undefined; throw error; });
    return indexPromise;
  }

  function setURL(push) {
    const address = new URL(location.href);
    for (const [key, value] of [['q', input.value.trim()], ['type', type.value]]) {
      if (value) address.searchParams.set(key, value); else address.searchParams.delete(key);
    }
    if (address.href !== location.href) history[push ? 'pushState' : 'replaceState'](null, '', address);
  }

  async function search() {
    const current = ++revision;
    const submittedQuery = input.value.trim();
    const selectedType = type.value;
    const query = normalise(submittedQuery);
    results.replaceChildren(); region.hidden = true;
    if (!query) { status.textContent = "Enter a topic, resource or person's name to search."; return; }
    status.textContent = 'Searching…';
    try {
      const records = await loadIndex();
      if (current !== revision) return;
      const terms = query.split(/\s+/u);
      const matches = records.filter(record => (!selectedType || record.type === selectedType) && terms.every(term => record.searchKey.includes(term))).map(record => ({
        record,
        score: (record.titleKey === query ? 100 : record.titleKey.startsWith(query) ? 50 : 0) + terms.reduce((score, term) => score + (record.titleKey.includes(term) ? 30 : 0) + (record.summaryKey.includes(term) ? 6 : 0) + (record.keywordKey.includes(term) ? 3 : 0), 0),
      })).sort((a, b) => b.score - a.score || collator.compare(a.record.title, b.record.title) || a.record.url.localeCompare(b.record.url));
      const fragment = document.createDocumentFragment();
      for (const { record } of matches) {
        const row = document.createElement('li');
        const heading = document.createElement('h3');
        const link = document.createElement('a');
        link.href = record.href; link.textContent = record.title; heading.append(link);
        const metadata = document.createElement('p'); metadata.className = 'result-meta'; metadata.textContent = labels.get(record.type) || record.type;
        if (record.date) {
          const time = document.createElement('time'); time.dateTime = String(record.date);
          time.textContent = /^\d{4}-\d{2}-\d{2}$/.test(record.date) ? fullDate.format(new Date(`${record.date}T00:00:00Z`)) : /^\d{4}-\d{2}$/.test(record.date) ? monthDate.format(new Date(`${record.date}-01T00:00:00Z`)) : String(record.date);
          metadata.append(' · ', time);
        }
        const description = document.createElement('p'); description.textContent = record.summary || '';
        row.append(heading, metadata); if (description.textContent) row.append(description);
        fragment.append(row);
      }
      results.append(fragment); region.hidden = !matches.length;
      status.textContent = matches.length ? `${matches.length} ${matches.length === 1 ? 'result' : 'results'} for “${submittedQuery}”${selectedType ? ` in ${labels.get(selectedType)}` : ''}.` : `No results for “${submittedQuery}”. Try fewer terms or another content type.`;
    } catch {
      if (current === revision) status.textContent = 'Search is unavailable because its local index could not be loaded. Try again or browse the section links below.';
    }
  }

  form.addEventListener('submit', event => { event.preventDefault(); setURL(true); search(); });
  type.addEventListener('change', () => { setURL(false); search(); });
  form.addEventListener('reset', event => { event.preventDefault(); input.value = ''; type.value = ''; setURL(false); search(); input.focus(); });
  function restoreQuery() {
    const state = new URLSearchParams(location.search);
    input.value = (state.get('q') || '').slice(0, input.maxLength);
    type.value = labels.has(state.get('type')) ? state.get('type') : '';
    search();
  }
  window.addEventListener('popstate', restoreQuery);
  form.querySelector('fieldset').disabled = false;
  restoreQuery();
})();
