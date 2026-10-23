(() => {
  // An unavailable optional image should leave the content intact without a fake portrait.
  document.querySelectorAll('.catalog-media img, .record-portrait img').forEach((image) => {
    const omit = () => {
      const frame = image.closest('.catalog-media, .record-portrait');
      const card = image.closest('.catalog-card');
      if (card) card.classList.add('without-image');
      if (frame) frame.remove();
    };
    image.addEventListener('error', omit, {once: true});
    if (image.complete && !image.naturalWidth) omit();
  });
  // Record when the form was loaded, so the endpoint can reject instant submissions.
  document.querySelectorAll('input[data-form-timestamp]').forEach((input) => {
    input.value = Date.now();
  });
  // Wait for a valid captcha proof, including while the widget loads or solves.
  // Reset failed challenges before ALTCHA's form listener starts another attempt.
  document.addEventListener('submit', (event) => {
    const captcha = event.target.querySelector('altcha-widget');
    if (!captcha) return;
    const state = captcha.getState?.();
    if (state === 'verified') return;
    event.preventDefault();
    if (state === 'error' || state === 'expired') captcha.reset();
  }, true);
  // A textarea has no pattern attribute, so treat whitespace-only text as empty.
  document.querySelectorAll('form textarea[required]').forEach((textarea) => {
    const check = () => textarea.setCustomValidity(textarea.value.trim() ? '' : 'Please fill in this field.');
    textarea.addEventListener('input', check);
    check();
  });
  // Markdown authors need only the image and its alignment class.
  document.querySelectorAll('.content img').forEach((image) => {
    if (!image.hasAttribute('loading')) image.setAttribute('loading', 'lazy');
  });

  // Kramdown can interpret pipe-separated navigation links as a table. These
  // single-row, link-only structures are choices, not comparison data. Retain
  // every destination, label and trailing punctuation using the common cards.
  document.querySelectorAll('.content table:not(:has(th))').forEach((table) => {
    const rows = [...table.querySelectorAll('tr')];
    const cells = [...table.querySelectorAll('td')];
    if (rows.length !== 1 || cells.length < 2 || cells.length > 4 || table.querySelector('caption, thead, tfoot, [id]:not(a)')) return;
    if (!cells.every(cell => cell.children.length === 1 && cell.firstElementChild.tagName === 'A' &&
      [...cell.childNodes].every(node => node.nodeType !== Node.TEXT_NODE || /^[\s.,;:!?]*$/.test(node.textContent)))) return;
    const choices = document.createElement('div');
    choices.className = `cards columns-${cells.length}`;
    if (table.id) choices.id = table.id;
    cells.forEach(cell => {
      const link = cell.firstElementChild;
      link.classList.add('card', 'navigation-choice');
      [...cell.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => {
        if (node.textContent.trim()) link.append(node);
      });
      choices.append(link);
    });
    table.replaceWith(choices);
  });

  // Ordinary Kramdown tables need no author-supplied HTML wrapper.
  document.querySelectorAll('.content table').forEach((table) => {
    let region = table.parentElement;
    if (!region.classList.contains('table-scroll')) {
      region = document.createElement('div');
      region.className = 'table-scroll';
      table.before(region);
      region.append(table);
    }
    region.setAttribute('role', 'region');
    const caption = table.querySelector('caption');
    const label = table.getAttribute('aria-label') || (caption && caption.textContent.trim()) || 'Table';
    region.setAttribute('aria-label', label + ' — scroll horizontally to see all columns');
    const update = () => {
      if (region.scrollWidth > region.clientWidth + 1) region.tabIndex = 0;
      else region.removeAttribute('tabindex');
    };
    update();
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(update);
      observer.observe(region);
      observer.observe(table);
    } else {
      window.addEventListener('resize', update);
    }
  });

  // Long code examples remain scrollable without adding HTML to Markdown.
  document.querySelectorAll('.content pre').forEach((block) => {
    const update = () => {
      if (block.scrollWidth > block.clientWidth + 1) {
        block.tabIndex = 0;
        block.setAttribute('role', 'region');
        if (!block.hasAttribute('aria-label')) block.setAttribute('aria-label', 'Code example — scroll horizontally');
      } else {
        block.removeAttribute('tabindex');
      }
    };
    update();
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(block);
    else window.addEventListener('resize', update);
  });

  // Explicit Markdown/front-matter attributes also work without JavaScript.
  // Catch any unmarked off-site web links added by an author as well.
  document.querySelectorAll('a[href]').forEach((link) => {
    let url;
    try { url = new URL(link.getAttribute('href'), document.baseURI); }
    catch { return; }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
    // An explicit target always wins, including _self and named browsing contexts.
    if (link.hasAttribute('target') && link.target !== '_blank') return;
    if (url.origin === window.location.origin && link.target !== '_blank') return;
    link.relList.add('noopener', 'noreferrer');
    link.target = '_blank';
    if (!link.title) link.title = 'Opens in a new tab';
  });
})();
