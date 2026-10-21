(() => {
  document.querySelectorAll('[data-programme]').forEach(programme => {
    const tabs = [...programme.querySelectorAll('[data-programme-tab]')];
    const days = [...programme.querySelectorAll('[data-programme-day]')];
    if (tabs.length < 2 || tabs.length !== days.length) return;

    const tablist = programme.querySelector('[data-programme-tabs]');
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', 'Programme days');
    tabs.forEach((tab, index) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', days[index].id);
      days[index].setAttribute('role', 'tabpanel');
      days[index].setAttribute('aria-labelledby', tab.id);
      days[index].tabIndex = 0;
      days[index].querySelector('.programme-date').classList.add('visually-hidden');
    });

    function select(index, focus = false) {
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
        days[i].hidden = i !== index;
      });
      if (focus) tabs[index].focus();
    }

    function revealHash() {
      let id;
      try { id = decodeURIComponent(location.hash.slice(1)); } catch { return false; }
      const target = document.getElementById(id);
      const day = target?.closest('[data-programme-day]');
      const index = days.indexOf(day);
      if (index === -1) return false;
      select(index);
      requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
      return true;
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        select(index);
        history.replaceState(null, '', tab.hash);
      });
      tab.addEventListener('keydown', event => {
        if (event.key === ' ') {
          event.preventDefault();
          tab.click();
          return;
        }
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        select(next, true);
        history.replaceState(null, '', tabs[next].hash);
      });
    });
    select(0);
    revealHash();
    window.addEventListener('hashchange', revealHash);
  });
})();
