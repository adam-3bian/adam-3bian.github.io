(() => {
  const form = document.querySelector('.directory-search');
  const listing = document.querySelector('.listing');
  if (!form || !listing) return;
  const input = form.querySelector('input[type="search"]');
  const items = [...listing.querySelectorAll('#directory-list > li')];
  const count = listing.querySelector('#listing-count');
  const empty = listing.querySelector('.directory-empty');
  const clear = form.querySelector('button[type="reset"]');
  const searchable = items.map(item => ({ item, text: item.textContent.toLocaleLowerCase('en-GB') }));
  function update() {
    const words = input.value.trim().toLocaleLowerCase('en-GB').split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const { item, text } of searchable) {
      item.hidden = !words.every(word => text.includes(word));
      if (!item.hidden) visible++;
    }
    count.textContent = words.length ? `${visible} of ${items.length} results` : `${items.length} ${items.length === 1 ? 'result' : 'results'}`;
    empty.hidden = visible > 0;
    clear.disabled = !input.value;
  }
  form.addEventListener('submit', event => event.preventDefault());
  input.addEventListener('input', update);
  form.addEventListener('reset', () => {
    input.value = '';
    update();
    input.focus();
  });
  form.hidden = false;
  update();
})();
