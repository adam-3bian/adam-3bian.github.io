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

// Only editorial illustrations and photo galleries opt into the viewer. Lists,
// portraits, logos, hero images, and existing links keep their own behaviour.
(() => {
  if (typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) return;
  const selector = 'img.image-left, img.image-right, img.image-full, figure.image-left img, figure.image-right img, figure.image-full img, .image-gallery img';
  const excluded = 'a, button, label, summary, [role="button"], [role="link"], [aria-hidden="true"], [data-no-image-viewer], .cards, .logo-gallery, .portrait-gallery, .record-gallery, .image-logo, .image-icon, .lead-image';
  const articles = [...document.querySelectorAll('article .article-content')].map(article =>
    [...article.querySelectorAll(selector)].filter(image => !image.closest(excluded) && !['none', 'presentation'].includes(image.getAttribute('role')))
  ).filter(images => images.length);
  if (!articles.length) return;

  const dialog = document.createElement('dialog');
  dialog.id = 'image-viewer';
  dialog.className = 'image-viewer';
  dialog.setAttribute('aria-labelledby', 'image-viewer-title');
  dialog.setAttribute('aria-describedby', 'image-viewer-caption');
  dialog.innerHTML = `
    <h2 id="image-viewer-title" class="visually-hidden">Image viewer</h2>
    <button type="button" class="image-viewer-close" aria-label="Close image viewer" autofocus>Close ×</button>
    <figure>
      <img alt="">
      <figcaption id="image-viewer-caption" aria-live="polite"></figcaption>
    </figure>
    <nav aria-label="Image navigation">
      <button type="button" class="image-viewer-previous" aria-label="Previous image">← Previous</button>
      <p class="image-viewer-status" role="status" aria-live="polite" aria-atomic="true"></p>
      <button type="button" class="image-viewer-next" aria-label="Next image">Next →</button>
    </nav>`;
  document.body.append(dialog);
  const enlarged = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');
  const status = dialog.querySelector('[role="status"]');
  const close = dialog.querySelector('.image-viewer-close');
  const previous = dialog.querySelector('.image-viewer-previous');
  const next = dialog.querySelector('.image-viewer-next');
  let images = [];
  let index = 0;
  let origin;
  let scrollY = 0;

  function showImage() {
    const image = images[index];
    // The Markdown src is the original bundled asset, not a resized thumbnail.
    enlarged.src = image.dataset.fullSrc || image.src;
    enlarged.alt = image.alt;
    caption.textContent = image.closest('figure')?.querySelector('figcaption')?.textContent.trim() || image.alt;
    caption.hidden = !caption.textContent;
    status.textContent = `Image ${index + 1} of ${images.length}`;
    previous.hidden = next.hidden = images.length < 2;
  }

  function openImage(articleImages, selected) {
    images = articleImages;
    index = selected;
    origin = images[index];
    showImage();
    scrollY = window.scrollY;
    document.body.style.setProperty('--image-viewer-scroll-top', `${-scrollY}px`);
    document.documentElement.classList.add('image-viewer-open');
    document.body.classList.add('image-viewer-open');
    dialog.showModal();
    close.focus({ preventScroll: true });
  }

  function move(direction) {
    index = (index + direction + images.length) % images.length;
    showImage();
  }

  function restorePage() {
    if (!document.body.classList.contains('image-viewer-open')) return;
    document.documentElement.classList.remove('image-viewer-open');
    document.body.classList.remove('image-viewer-open');
    document.body.style.removeProperty('--image-viewer-scroll-top');
    window.scrollTo({ top: scrollY, behavior: 'instant' });
    origin?.focus({ preventScroll: true });
    enlarged.removeAttribute('src');
  }

  function closeImage() {
    dialog.close();
    restorePage();
  }

  for (const articleImages of articles) {
    articleImages.forEach((image, selected) => {
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-haspopup', 'dialog');
      image.setAttribute('aria-controls', dialog.id);
      image.setAttribute('aria-label', `Enlarge image: ${image.alt || `Image ${selected + 1}`}`);
      image.addEventListener('click', () => openImage(articleImages, selected));
      image.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openImage(articleImages, selected);
        }
      });
    });
  }
  close.addEventListener('click', closeImage);
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeImage();
  });
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('button:not([hidden])')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  // Ignore drags that start on the image and finish on the backdrop.
  let dismiss = false;
  const outsideImage = target => target === dialog || target === enlarged.parentElement;
  dialog.addEventListener('pointerdown', event => { dismiss = outsideImage(event.target); });
  dialog.addEventListener('click', event => {
    if (dismiss && outsideImage(event.target)) closeImage();
  });
  dialog.addEventListener('close', () => {
    if (!dialog.open) restorePage();
  });
})();
