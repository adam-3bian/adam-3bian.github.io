(() => {
  // Markdown authors need only the image and its alignment class.
  document.querySelectorAll('.content img').forEach((image) => {
    if (!image.hasAttribute('loading')) image.setAttribute('loading', 'lazy');
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
    link.target = '_blank';
    link.relList.add('noopener', 'noreferrer');
    if (!link.title) link.title = 'Opens in a new tab';
  });
})();
