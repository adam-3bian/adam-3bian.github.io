// An illustrative model, not an emulator. All technical explanations and links
// are present in static HTML; this script changes only the selected example.
(() => {
  const model = document.querySelector('[data-memory-model]');
  if (!model) return;
  const controls = model.querySelector('.memory-controls');
  const explanation = model.querySelector('#memory-explanation');
  const result = model.querySelector('[data-memory-result]');
  const accessLabel = model.querySelector('[data-memory-access-label]');
  const permission = model.querySelector('[data-memory-permission]');
  const capability = model.querySelector('[data-memory-capability]');
  controls.hidden = false;
  for (const button of controls.querySelectorAll('button')) {
    button.disabled = false;
    button.addEventListener('click', () => {
      const state = button.dataset.memoryState;
      const source = model.querySelector(`[data-memory-copy="${state}"]`);
      if (!source) return;
      model.dataset.state = state;
      for (const peer of controls.querySelectorAll('button')) peer.setAttribute('aria-pressed', String(peer === button));
      const heading = document.createElement('h3'); heading.textContent = source.dataset.title;
      const paragraph = document.createElement('p');
      // Clone trusted, build-generated native text and links; never parse input.
      paragraph.append(...[...source.childNodes].map(node => node.cloneNode(true)));
      explanation.replaceChildren(heading, paragraph);
      result.textContent = source.dataset.result;
      accessLabel.textContent = state === 'readonly' ? 'STORE · PERMISSION FAULT' : 'AUTHORISED ACCESS';
      capability.textContent = state === 'readonly' ? 'DERIVED C1' : 'CAPABILITY C0';
      permission.textContent = state === 'readonly' ? 'load only' : 'load + store';
    });
  }
})();
