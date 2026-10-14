// Progressive controls for complete native directories. Facets use source data.
(() => {
  const normalise = value => String(value || '').normalize('NFKC').toLocaleLowerCase('en-GB');
  const collator = new Intl.Collator('en-GB', { sensitivity: 'base', numeric: true });
  for (const listing of document.querySelectorAll('.listing')) {
    const form = listing.querySelector('.directory-controls');
    if (!form) continue;
    const count = listing.querySelector('.directory-count');
    const empty = listing.querySelector('.directory-empty');
    const input = form.elements.q;
    const sort = form.elements.sort;
    const collection = listing.dataset.listing;
    let rows;
    try {
      rows = [...listing.querySelectorAll('[data-directory-item]')].map((element, position) => ({ element, parent: element.parentElement, position, data: JSON.parse(element.dataset.directoryItem), text: normalise(element.textContent) }));
    } catch { continue; } // Keep the complete static list when enhancement fails.
    const total = rows.length;
    const facets = [];
    const roleLabels = { speaker: 'Speakers', board: 'Board members', author: 'Named authors' };
    const tierLabels = { full: 'Full members', community: 'Community members', unspecified: 'Tier not specified', founder: 'Founding members' };
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: listing.dataset.timeZone || 'UTC' }).format(new Date());
    const eventPeriod = data => data.exact ? new Date(data.final).getTime() >= Date.now() ? 'upcoming' : 'past' : String(data.final).slice(0, 10) >= today ? 'upcoming' : 'past';
    if (collection === 'events' && !listing.dataset.status) {
      for (const row of rows) {
        const group = listing.querySelector(`[data-event-period="${eventPeriod(row.data)}"] .cards`);
        if (group) { group.append(row.element); row.parent = group; }
      }
    }
    function addFacet(key, label, valuesFor, labelFor) {
      const values = new Set(rows.flatMap(row => valuesFor(row.data)));
      if (values.size < 2) return;
      const control = document.createElement('p'); control.className = 'control-field';
      const name = document.createElement('label'); name.textContent = label; name.htmlFor = `directory-${collection}-${key}`;
      const select = document.createElement('select'); select.name = key; select.id = name.htmlFor;
      control.append(name);
      select.add(new Option('All', ''));
      for (const value of [...values].sort((a, b) => collator.compare(labelFor(a), labelFor(b)))) select.add(new Option(labelFor(value), value));
      control.append(select); form.querySelector('fieldset').insertBefore(control, form.querySelector('button'));
      facets.push({ key, select, valuesFor });
    }
    if (collection === 'people') addFacet('role', 'Documented role', data => data.roles || [], value => roleLabels[value]);
    if (collection === 'organisations') addFacet('membership', 'Membership', data => [data.tier || 'unspecified', ...(data.founder ? ['founder'] : [])], value => tierLabels[value]);
    if (['news', 'academic-papers', 'reports', 'events', 'policies'].includes(collection)) addFacet('year', 'Source year', data => [data.date ? String(data.date).slice(0, 4) : 'unspecified'], value => value === 'unspecified' ? 'Date not specified' : value);
    if (['hardware', 'software'].includes(collection)) addFacet('kind', 'Resource type', data => [data.type || 'unspecified'], value => value === 'unspecified' ? 'Type not specified' : value);
    if (collection === 'events' && !listing.dataset.status) addFacet('period', 'Event period', data => [eventPeriod(data)], value => value === 'upcoming' ? 'Upcoming and current' : 'Past');
    if (['academic-papers', 'software', 'guides', 'reports'].includes(collection)) {
      const labels = new Map(rows.flatMap(row => (row.data.platforms || []).map(platform => [platform.value, platform.label])));
      addFacet('platform', 'Related hardware', data => (data.platforms || []).map(platform => platform.value), value => labels.get(value));
    }
    const parents = [...new Set(rows.map(row => row.parent))];
    function compare(a, b) {
      const title = collator.compare(a.data.title, b.data.title) || a.data.title.localeCompare(b.data.title) || a.position - b.position;
      if (sort.value === 'title') return title;
      if (sort.value === 'title-desc') return -title;
      if (sort.value === 'newest' || sort.value === 'oldest') {
        if (!a.data.date || !b.data.date) return !a.data.date && !b.data.date ? title : a.data.date ? -1 : 1;
        const date = String(a.data.date).localeCompare(String(b.data.date));
        return (sort.value === 'newest' ? -date : date) || title;
      }
      if (collection === 'events' && !listing.dataset.status) {
        const date = String(a.data.date).localeCompare(String(b.data.date));
        return (a.parent.closest('[data-event-period]').dataset.eventPeriod === 'past' ? -date : date) || title;
      }
      return a.position - b.position;
    }
    function storeState() {
      const address = new URL(location.href);
      for (const [key, value] of [['q', input.value.trim()], ['sort', sort.value === 'original' ? '' : sort.value], ...facets.map(facet => [facet.key, facet.select.value])]) {
        if (value) address.searchParams.set(key, value); else address.searchParams.delete(key);
      }
      history.replaceState(null, '', address);
    }
    function update() {
      const terms = normalise(input.value.trim()).split(/\s+/u).filter(Boolean);
      let shown = 0;
      for (const row of rows) {
        row.element.hidden = !(terms.every(term => row.text.includes(term)) && facets.every(facet => !facet.select.value || facet.valuesFor(row.data).includes(facet.select.value)));
        if (!row.element.hidden) shown++;
      }
      for (const parent of parents) for (const row of rows.filter(row => row.parent === parent).sort(compare)) parent.append(row.element);
      for (const group of listing.querySelectorAll('.event-period')) {
        const matches = [...group.querySelectorAll('[data-directory-item]')].some(element => !element.hidden);
        const message = group.querySelector(':scope > p');
        if (message) message.hidden = matches;
        group.hidden = !matches && (terms.length > 0 || facets.some(facet => facet.select.value));
      }
      for (const link of listing.querySelectorAll('.alphabet-navigation a')) {
        const target = rows.filter(row => !row.element.hidden && normalise(row.data.title).startsWith(normalise(link.dataset.letter))).sort(compare)[0];
        link.parentElement.hidden = !target;
        if (target) link.setAttribute('href', `#${target.element.id}`);
      }
      const selected = facets.filter(facet => facet.select.value).map(facet => facet.select.selectedOptions[0].text);
      count.textContent = `${shown} of ${total} ${shown === 1 ? 'result' : 'results'}${selected.length ? ` · ${selected.join(' · ')}` : ''}`;
      empty.hidden = shown !== 0;
      storeState();
    }
    const state = new URLSearchParams(location.search);
    input.value = (state.get('q') || '').slice(0, input.maxLength);
    if ([...sort.options].some(option => option.value === state.get('sort'))) sort.value = state.get('sort');
    for (const facet of facets) if ([...facet.select.options].some(option => option.value === state.get(facet.key))) facet.select.value = state.get(facet.key);
    let timer;
    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(update, 250); });
    form.addEventListener('change', update);
    form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); update(); });
    form.addEventListener('reset', event => { event.preventDefault(); clearTimeout(timer); input.value = ''; sort.value = 'original'; facets.forEach(facet => { facet.select.value = ''; }); update(); input.focus(); });
    form.hidden = false;
    update();
  }
})();
