(() => {
  const dialog = document.querySelector('#image-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const media = dialog.querySelector('.image-dialog-media');
  const caption = dialog.querySelector('figcaption');
  const closeButton = dialog.querySelector('[data-image-close]');
  let trigger;

  document.querySelectorAll('.content img.image-left, .content img.image-right, .content img.image-full').forEach((image) => {
    if (image.closest('a') || image.classList.contains('no-zoom')) return;
    const link = document.createElement('a');
    link.className = 'image-link';
    ['image-left', 'image-right', 'image-full'].forEach((alignment) => {
      if (image.classList.contains(alignment)) {
        link.classList.add(alignment);
        image.classList.remove(alignment);
      }
    });
    link.href = image.dataset.fullImage || image.currentSrc || image.src;
    link.setAttribute('data-image-overlay', '');
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-label', 'Enlarge ' + image.alt);
    image.replaceWith(link);
    link.append(image);
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-image-overlay]');
    if (!link || !link.querySelector('img')) return;
    event.preventDefault();
    trigger = link;
    const thumbnail = link.querySelector('img');
    const image = document.createElement('img');
    image.src = link.href;
    image.alt = thumbnail.alt;
    // Let a separately supplied full-size image establish its own natural ratio.
    if (link.href === thumbnail.src || link.href === thumbnail.currentSrc) {
      if (thumbnail.getAttribute('width')) image.setAttribute('width', thumbnail.getAttribute('width'));
      if (thumbnail.getAttribute('height')) image.setAttribute('height', thumbnail.getAttribute('height'));
    }
    caption.textContent = thumbnail.dataset.caption || thumbnail.alt;
    media.replaceChildren(image);
    dialog.showModal();
    document.documentElement.classList.add('has-image-dialog');
    closeButton.focus();
  });

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('has-image-dialog');
    media.replaceChildren();
    if (trigger && trigger.isConnected) trigger.focus();
  });
})();
