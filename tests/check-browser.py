"""Responsive, accessibility and form interaction checks.

Start the built site on SITE_URL (default http://127.0.0.1:4200).
Requires Playwright and a local axe-core file in AXE_PATH. Tests never send email.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

SITE_URL = os.environ.get('SITE_URL', 'http://127.0.0.1:4200').rstrip('/')
AXE_PATH = os.environ['AXE_PATH']
REPORT_DIR = Path(os.environ.get('REPORT_DIR', 'work/browser'))
REPORT_DIR.mkdir(parents=True, exist_ok=True)
ROUTES = ['/', '/about/', '/cooperative/', '/repairs/', '/rent/', '/allocations/', '/apply/', '/fire-gas-safety/', '/key-issues/', '/documents/', '/contact/', '/form-information/', '/404.html']


def fill_required(page):
    fields = page.locator('[data-form-section]:visible input:visible, [data-form-section]:visible select:visible, [data-form-section]:visible textarea:visible')
    for index in range(fields.count()):
        field = fields.nth(index)
        props = field.evaluate('(el) => ({required:el.required,disabled:el.disabled,type:el.type,name:el.name,value:el.value,tag:el.tagName,options:el.options ? [...el.options].map(option => option.value).filter(Boolean) : []})')
        if not props['required'] or props['disabled']: continue
        if props['type'] == 'radio':
            group = page.locator('[name="' + props['name'] + '"]')
            if not group.evaluate_all('(els) => els.some(el => el.checked)'):
                no = group.locator('xpath=self::*[@value="No"]')
                (no if no.count() else group.first).check()
        elif props['type'] == 'checkbox': field.check()
        elif props['tag'] == 'SELECT':
            if not props['value']: field.select_option('No' if 'No' in props['options'] else props['options'][0])
        elif not props['value']:
            value = '2000-01-01' if props['type'] == 'date' else '1' if props['type'] == 'number' else 'example@example.invalid' if props['type'] == 'email' else 'Fictional test answer'
            field.fill(value)


def run():
    results = []
    with sync_playwright() as playwright:
        executable = os.environ.get('CHROMIUM_PATH')
        browser = playwright.chromium.launch(**({'executable_path': executable} if executable else {}), args=['--no-sandbox'])
        page = browser.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        # Block all outbound submission requests; interactions below use the unavailable state.
        page.route('**/*', lambda route: route.abort() if route.request.method == 'POST' else route.continue_())
        for width in [320, 390, 768, 1440]:
            page.set_viewport_size({'width': width, 'height': 900})
            for route in ROUTES:
                page.goto(SITE_URL + route)
                assert page.locator('h1').count() == 1
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, route, 'horizontal overflow')
                results.append({'width': width, 'route': route, 'overflow': False})
                if route in ['/', '/contact/', '/apply/', '/key-issues/']:
                    page.add_script_tag(path=AXE_PATH)
                    audit = page.evaluate("async () => await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}})")
                    violations = [{'id': item['id'], 'impact': item['impact'], 'targets': [node['target'] for node in item['nodes']]} for item in audit['violations']]
                    assert not violations, (width, route, violations)
                    if width in [390, 768, 1440]:
                        name = route.strip('/') or 'home'
                        page.screenshot(path=str(REPORT_DIR / f'{name}-{width}.png'), full_page=True)
        page.set_viewport_size({'width': 390, 'height': 844})
        page.goto(SITE_URL + '/contact/')
        menu = page.get_by_role('button', name='Menu', exact=True)
        menu.click()
        assert menu.get_attribute('aria-expanded') == 'true'
        page.locator('summary').filter(has_text='Services').click()
        page.keyboard.press('Escape')
        assert page.locator('details[open]').count() == 0
        page.keyboard.press('Escape')
        assert menu.get_attribute('aria-expanded') == 'false'
        assert menu.evaluate('(el) => el === document.activeElement')
        page.locator('[data-submit]').click()
        assert page.locator('.error-summary').is_visible()
        assert page.locator('.field-error').count() >= 4
        page.locator('.error-summary a').first.click()
        assert page.locator('[name=name]').evaluate('(el) => el === document.activeElement')
        page.locator('[name=name]').fill('Example Resident')
        page.locator('[name=email]').fill('resident@example.invalid')
        page.locator('[name=subject]').select_option('General enquiry')
        page.locator('[name=message]').fill('A fictional message used for browser validation only.')
        page.locator('[name=privacy]').check()
        page.locator('[data-submit]').click()
        assert 'Nothing has been sent' in page.locator('.form-status').inner_text()
        assert page.locator('[name=name]').input_value() == 'Example Resident'
        page.goto(SITE_URL + '/apply/')
        assert page.locator('[data-form-section]:visible').count() == 1
        page.locator('[name=joint_application][value=Yes]').check()
        assert page.locator('[name=joint_surname]').is_visible()
        assert page.locator('[name=joint_surname]').get_attribute('required') is not None
        page.locator('[name=joint_application][value=No]').check()
        assert page.locator('[name=joint_surname]').is_disabled()
        for index in range(6):
            if index == 1:
                repeater = page.locator('[data-repeater=moving_people]')
                assert repeater.locator('[data-row]').count() == 1
                repeater.locator('[data-add-row]').click()
                assert repeater.locator('[data-row]').count() == 2
                repeater.locator('[name="moving_people[1][surname]"]').fill('Example')
                page.locator('[data-next]').click()
                assert page.locator('.error-summary').is_visible()
                repeater.locator('[name="moving_people[1][first_names]"]').fill('Person')
            fill_required(page)
            page.locator('[data-next]').click()
            assert page.locator('[data-progress-text]').inner_text() == f'Step {index + 2} of 7', page.locator('.error-summary').inner_text()
        assert page.locator('[data-review]').is_visible()
        assert 'Example' in page.locator('[data-review-content]').inner_text()
        assert page.locator('[data-review-content] script').count() == 0
        page.locator('[data-go-step="0"]').click()
        page.locator('[name=applicant_surname]').fill('Updated example')
        page.locator('[data-go-step="6"]').click()
        assert 'Updated example' in page.locator('[data-review-content]').inner_text()
        page.locator('[data-submit]').click()
        assert 'Nothing has been sent' in page.locator('.form-status').inner_text()
        # No-JavaScript users keep all content, native navigation and the paper route.
        context = browser.new_context(java_script_enabled=False, viewport={'width': 320, 'height': 900})
        no_js = context.new_page()
        no_js.goto(SITE_URL + '/apply/')
        assert no_js.locator('[data-form-section]:visible').count() == 6
        assert no_js.locator('[data-submit]').is_disabled()
        assert no_js.locator('.nav-list').is_visible()
        assert no_js.locator('a[href$="housing-application-form-2025.pdf"]').count() >= 1
        assert not errors, errors
        context.close()
        browser.close()
    (REPORT_DIR / 'results.json').write_text(json.dumps(results, indent=2) + '\n')
    print(f'PASS: {len(results)} responsive page checks, 16 axe audits, navigation, validation, conditional fields, repeat rows, review edits and no-JavaScript fallbacks.')

if __name__ == '__main__': run()
