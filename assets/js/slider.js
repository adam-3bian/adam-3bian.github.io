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

    function hasKeyboardFocus() {
      const focused = document.activeElement;
      if (!focused || !slides[index].contains(focused)) return false;
      // Do not hide a slide link while a keyboard user is about to follow it.
      // Focus on the persistent dot selectors does not block playback.
      try { return focused.matches(':focus-visible'); }
      catch { return true; }
    }

    function schedule() {
      window.clearTimeout(timer);
      if (!allowAutoplay || motion.matches || document.hidden || hasKeyboardFocus()) return;
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
    if (typeof motion.addEventListener === 'function') motion.addEventListener('change', schedule);
    else if (typeof motion.addListener === 'function') motion.addListener(schedule);

    slider.classList.add('is-enhanced');
    if (controls) controls.hidden = indicators.length < 2;
    show(0);
  });
})();
