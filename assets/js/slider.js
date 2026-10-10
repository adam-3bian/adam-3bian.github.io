(() => {
  document.querySelectorAll('.slider').forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll('.slide'));
    if (slides.length < 2) return;
    const controls = slider.querySelector('.slider-controls');
    const indicators = Array.from(slider.querySelectorAll('[data-slide]'));
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const minimum = parseInt(getComputedStyle(slider).getPropertyValue('--slider-min-interval'), 10) || 3000;
    const interval = Math.max(minimum, parseInt(slider.dataset.interval, 10) || 5000);
    const allowAutoplay = slider.dataset.autoplay === 'true';
    let index = 0;
    let timer;
    let paused = false;
    const playback = slider.querySelector("[data-slider-toggle]");

    function hasFocus() {
      return slider.contains(document.activeElement);
    }

    function updatePlayback() {
      if (!playback) return;
      playback.disabled = motion.matches;
      playback.textContent = motion.matches ? 'Automatic slides off' : paused ? 'Play slides' : 'Pause slides';
    }

    function schedule() {
      window.clearTimeout(timer);
      if (!allowAutoplay || paused || motion.matches || document.hidden || hasFocus()) return;
      timer = window.setTimeout(() => show(index + 1), interval);
    }

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, position) => {
        const inactive = position !== index;
        slide.hidden = inactive;
        slide.toggleAttribute('inert', inactive);
        if (inactive) slide.setAttribute('aria-hidden', 'true');
        else slide.removeAttribute('aria-hidden');
      });
      indicators.forEach((button, position) => {
        if (position === index) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      });
      schedule();
    }

    if (playback) playback.addEventListener('click', () => {
      paused = !paused;
      updatePlayback();
      schedule();
    });

    indicators.forEach((button) => button.addEventListener('click', () => {
      const next = Number(button.dataset.slide);
      if (Number.isInteger(next) && next >= 0 && next < slides.length) show(next);
    }));
    slider.addEventListener('focusin', schedule);
    // Wait until the browser has updated focus and its input modality.
    const afterInteraction = () => window.setTimeout(schedule, 0);
    slider.addEventListener('focusout', afterInteraction);
    slider.addEventListener('pointerdown', afterInteraction);
    document.addEventListener('visibilitychange', schedule);
    // Re-evaluate the current preference without latching autoplay off.
    const preferenceChanged = () => { updatePlayback(); schedule(); };
    if (typeof motion.addEventListener === 'function') motion.addEventListener('change', preferenceChanged);
    else if (typeof motion.addListener === 'function') motion.addListener(preferenceChanged);

    slider.classList.add('is-enhanced');
    if (controls) controls.hidden = indicators.length < 2;
    updatePlayback();
    show(0);
  });
})();
