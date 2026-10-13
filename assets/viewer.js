(() => {
  for (const pre of document.querySelectorAll('.front-matter-json code')) {
    try { pre.textContent = JSON.stringify(JSON.parse(pre.textContent), null, 2); }
    catch { pre.closest('details').classList.add('error'); }
  }
  const input = document.getElementById('record-filter');
  const select = document.getElementById('record-view');
  const rows = [...document.querySelectorAll('[data-audit-row]')];
  if (!input || !select) return;
  function update() {
    const query = input.value.trim().toLocaleLowerCase();
    const view = select.value;
    let count = 0;
    for (const row of rows) {
      const matchesView = view === 'all' ||
        view === 'missing-image' && row.dataset.primaryImage === 'false' ||
        view === 'missing-date' && row.dataset.missingDate === 'true' ||
        view === 'alternate' && row.dataset.alternate === 'true';
      row.hidden = !(matchesView && row.textContent.toLocaleLowerCase().includes(query));
      if (!row.hidden) count++;
    }
    document.getElementById('visible-count').textContent = `${count} ${count === 1 ? 'record' : 'records'}`;
  }
  input.addEventListener('input', update);
  select.addEventListener('change', update);
})();
