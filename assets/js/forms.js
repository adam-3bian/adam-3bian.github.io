(() => {
  'use strict';

  document.querySelectorAll('.site-form').forEach(form => {
    const sections = [...form.querySelectorAll('[data-form-section]')];
    const review = form.querySelector('[data-review]');
    const stepped = form.dataset.stepped === 'true';
    const available = form.dataset.available === 'true';
    const progress = form.querySelector('.form-progress');
    const backButton = form.querySelector('[data-back]');
    const nextButton = form.querySelector('[data-next]');
    const submitButton = form.querySelector('[data-submit]');
    const status = form.querySelector('.form-status');
    const errors = form.querySelector('.error-summary');
    const captchaPanel = form.querySelector('[data-captcha-panel]');
    const captcha = form.querySelector('altcha-widget');
    let currentStep = 0;
    let busy = false;
    let sent = false;

    form.noValidate = true;
    form.classList.add('form-enhanced');
    submitButton.disabled = false;
    if (!available) submitButton.textContent = stepped ? 'Check application' : 'Check message';

    function controls() {
      return [...form.querySelectorAll('input, select, textarea')];
    }

    function values(name) {
      return controls().filter(input =>
        (input.name === name || input.name === name + '[]') && !input.disabled &&
        (!['checkbox', 'radio'].includes(input.type) || input.checked)
      ).map(input => input.value);
    }

    function updateConditions() {
      form.querySelectorAll('[data-condition-name]').forEach(field => {
        const active = values(field.dataset.conditionName).includes(field.dataset.conditionValue);
        field.hidden = !active;
        field.querySelectorAll('input, select, textarea').forEach(input => {
          input.disabled = !active || input.hasAttribute('data-initial-disabled');
          if (input.dataset.requiredWhen) input.required = active;
        });
      });
      form.querySelectorAll('[data-row]').forEach(row => {
        const populated = [...row.querySelectorAll('input, select, textarea')].some(input => input.value.trim());
        row.querySelectorAll('[data-row-required]').forEach(input => { input.required = populated; });
      });
    }

    function labelOf(input) {
      const legend = input.closest('fieldset.form-field')?.querySelector('legend');
      return (legend?.textContent || input.labels?.[0]?.textContent || input.name).trim();
    }

    function clearErrors() {
      errors.replaceChildren();
      errors.hidden = true;
      form.querySelectorAll('[aria-invalid]').forEach(input => {
        input.removeAttribute('aria-invalid');
        const help = (input.getAttribute('aria-describedby') || '').split(' ').filter(id => !id.endsWith('-error'));
        if (help.length) input.setAttribute('aria-describedby', help.join(' '));
        else input.removeAttribute('aria-describedby');
      });
      form.querySelectorAll('.field-error').forEach(message => message.remove());
    }

    function showErrors(items) {
      clearErrors();
      const heading = document.createElement('h2');
      heading.textContent = 'Please check the following';
      const list = document.createElement('ul');
      items.forEach(({input, message}) => {
        const item = document.createElement('li');
        if (input) {
          input.setAttribute('aria-invalid', 'true');
          const inlineMessage = document.createElement('p');
          inlineMessage.className = 'field-error';
          inlineMessage.id = input.id + '-error';
          inlineMessage.textContent = message;
          input.closest('.form-field').append(inlineMessage);
          input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), inlineMessage.id].filter(Boolean).join(' '));
          const link = document.createElement('a');
          link.href = '#' + input.id;
          link.textContent = message;
          link.addEventListener('click', event => {
            event.preventDefault();
            const index = sections.indexOf(input.closest('[data-form-section]'));
            if (stepped && index >= 0) showStep(index, false);
            input.focus();
          });
          item.append(link);
        } else item.textContent = message;
        list.append(item);
      });
      errors.append(heading, list);
      errors.hidden = false;
      errors.focus();
    }

    function validate(scope = form) {
      updateConditions();
      const checked = new Set();
      const items = [];
      scope.querySelectorAll('.form-field input, .form-field select, .form-field textarea').forEach(input => {
        if (input.disabled || !input.willValidate || checked.has(input.name)) return;
        if (!input.checkValidity()) {
          checked.add(input.name);
          items.push({input, message: labelOf(input) + ': ' + input.validationMessage});
        }
      });
      if (items.length) {
        showErrors(items);
        return false;
      }
      clearErrors();
      return true;
    }

    function renderReview() {
      const content = review.querySelector('[data-review-content]');
      content.replaceChildren();
      sections.forEach(section => {
        const heading = document.createElement('h3');
        heading.textContent = section.querySelector('h2').textContent;
        const list = document.createElement('dl');
        section.querySelectorAll('.form-field').forEach(field => {
          const inputs = [...field.querySelectorAll('input, select, textarea')].filter(input => !input.disabled);
          if (!inputs.length) return;
          const selected = inputs.filter(input => !['checkbox', 'radio'].includes(input.type) || input.checked);
          const answer = selected.map(input => input.type === 'checkbox' ? (input.labels?.[0]?.textContent.trim() || input.value) : input.value).filter(Boolean).join(', ');
          if (!answer) return;
          const term = document.createElement('dt');
          const detail = document.createElement('dd');
          const row = field.closest('[data-row]')?.querySelector('legend')?.textContent.trim();
          const group = field.closest('[data-repeater]')?.querySelector('h3')?.textContent.trim();
          term.textContent = (row ? group + ' · ' + row + ' · ' : '') + labelOf(inputs[0]);
          detail.textContent = answer;
          list.append(term, detail);
        });
        content.append(heading, list);
      });
    }

    function showStep(index, focus = true) {
      if (!stepped || busy || sent) return;
      currentStep = Math.max(0, Math.min(index, sections.length));
      sections.forEach((section, position) => { section.hidden = position !== currentStep; });
      review.hidden = currentStep !== sections.length;
      if (!review.hidden) renderReview();
      if (captchaPanel) captchaPanel.hidden = review.hidden;
      progress.hidden = false;
      progress.querySelector('progress').value = currentStep + 1;
      progress.querySelector('[data-progress-text]').textContent = `Step ${currentStep + 1} of ${sections.length + 1}`;
      progress.querySelectorAll('[data-go-step]').forEach(button => {
        if (Number(button.dataset.goStep) === currentStep) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
      backButton.hidden = currentStep === 0;
      nextButton.hidden = currentStep === sections.length;
      submitButton.hidden = currentStep !== sections.length;
      nextButton.textContent = currentStep === sections.length - 1 ? 'Review answers' : 'Continue';
      if (focus) (sections[currentStep] || review).querySelector('h2').focus();
    }

    form.querySelectorAll('[data-repeater]').forEach(repeater => {
      const rows = repeater.querySelector('[data-rows]');
      [...rows.children].slice(1).forEach(row => row.remove());
      let rowIndex = 1;
      const addButton = repeater.querySelector('[data-add-row]');
      const rowStatus = repeater.querySelector('[data-row-status]');
      addButton.hidden = false;
      function renumber() {
        [...rows.children].forEach((row, index) => {
          row.querySelector('[data-row-number]').textContent = String(index + 1);
          const removeButton = row.querySelector('[data-remove-row]');
          removeButton.hidden = false;
          removeButton.setAttribute('aria-label', 'Remove ' + row.querySelector('legend').textContent.trim().toLowerCase());
        });
        addButton.disabled = rows.children.length >= Number(repeater.dataset.maxRows);
      }
      addButton.addEventListener('click', () => {
        if (addButton.disabled) return;
        const template = document.createElement('template');
        template.innerHTML = repeater.querySelector('[data-row-template]').innerHTML.replaceAll('row-index', String(rowIndex++));
        rows.append(template.content.cloneNode(true));
        renumber();
        rows.lastElementChild.querySelector('input, textarea, select').focus();
        rowStatus.textContent = `${rows.children.length} entries. Leave unused entries blank.`;
      });
      repeater.addEventListener('click', event => {
        const button = event.target.closest('[data-remove-row]');
        if (!button) return;
        const row = button.closest('[data-row]');
        const populated = [...row.querySelectorAll('input, textarea, select')].some(input => input.value.trim());
        if (populated && !window.confirm('Remove this entry and its answers?')) return;
        clearErrors();
        row.remove();
        renumber();
        addButton.focus();
        rowStatus.textContent = 'Entry removed.';
      });
      renumber();
    });

    const today = new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date());
    form.querySelectorAll('[data-not-future]').forEach(input => { input.max = today; });
    form.addEventListener('change', updateConditions);
    form.addEventListener('input', event => {
      if (event.target.closest('[data-row]')) updateConditions();
    });
    if (stepped) {
      nextButton.addEventListener('click', () => {
        if (validate(currentStep === sections.length - 1 ? form : sections[currentStep])) showStep(currentStep + 1);
      });
      backButton.addEventListener('click', () => { clearErrors(); showStep(currentStep - 1); });
      progress.querySelectorAll('[data-go-step]').forEach(button => {
        button.addEventListener('click', () => {
          const index = Number(button.dataset.goStep);
          if (index === sections.length && !validate()) return;
          clearErrors();
          showStep(index);
        });
      });
    }

    function notify(message, error = false) {
      status.textContent = message;
      status.dataset.error = String(error);
      status.hidden = false;
      status.focus();
    }

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy || sent) return;
      if (stepped && currentStep < sections.length) {
        if (validate(sections[currentStep])) showStep(currentStep + 1);
        return;
      }
      if (!validate()) return;
      if (!available) {
        notify('Your answers have been checked. Nothing has been sent. Please telephone the office or use the paper form.');
        return;
      }
      const payload = new URLSearchParams(new FormData(form));
      if (!payload.get('altcha')) {
        notify('Please complete the spam-protection check before sending.', true);
        return;
      }
      busy = true;
      submitButton.disabled = true;
      form.setAttribute('aria-busy', 'true');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch(form.action, {
          method: 'POST', body: payload, credentials: 'omit', signal: controller.signal,
          headers: {Accept: 'application/json'}
        });
        const result = await response.json();
        if (!response.ok || !result.ok) {
          if (result.errors) {
            showErrors(Object.entries(result.errors).map(([name, message]) => ({
              input: controls().find(input => input.name === name || input.name === name + '[]'), message
            })));
            return;
          }
          throw new Error(result.message || 'The form could not be sent. Your answers have been kept.');
        }
        sent = true;
        form.reset();
        sections.forEach(section => { section.hidden = true; });
        if (review) {
          review.hidden = true;
          review.querySelector('[data-review-content]').replaceChildren();
        }
        if (progress) progress.hidden = true;
        captchaPanel.hidden = true;
        form.querySelector('.form-actions').hidden = true;
        notify(result.message + (result.reference ? ' Reference: ' + result.reference : ''));
      } catch (error) {
        const message = error.name === 'AbortError'
          ? 'The connection timed out. Your answers have been kept. Please try again; the service checks duplicate submissions.'
          : error instanceof TypeError || error instanceof SyntaxError
            ? 'Unable to reach the form service. Your answers have been kept. Please try again later or telephone the office.'
            : error.message;
        notify(message, true);
      } finally {
        clearTimeout(timeout);
        busy = false;
        submitButton.disabled = sent;
        form.removeAttribute('aria-busy');
        if (!sent && typeof captcha.reset === 'function') captcha.reset();
      }
    });

    updateConditions();
    if (stepped) {
      const linkedSection = sections.findIndex(section =>
        [...section.querySelectorAll('[id]')].some(element => '#' + element.id === window.location.hash)
      );
      showStep(linkedSection < 0 ? 0 : linkedSection, false);
    }
  });
})();
