const assert = require('node:assert/strict');
const path = require('node:path');

module.exports = async function checkAuthoredForms(browser, base, reportDir) {
  const routes = [
    ['/alliance/membership/contact/', ['name', 'email', 'organisation', 'telephone', 'subject', 'message']],
    ['/news-and-events/news-and-analysis/subscribe-newsletter/', ['email', 'name']],
  ];
  let layouts = 0;
  for (const javaScriptEnabled of [true, false]) {
    const page = await browser.newPage({javaScriptEnabled});
    for (const width of javaScriptEnabled ? [1920, 1440, 1024, 768, 375, 320] : [1440, 375]) {
      await page.setViewportSize({width, height: 900});
      for (const [route, names] of routes) {
        await page.goto(new URL(route.replace(/^\//, ''), base).href);
        const panel = page.locator('.form-panel');
        assert.equal(await panel.count(), 1, 'Exactly one authored form panel');
        assert.equal(await panel.locator('form').count(), 0, 'Unconnected preview cannot submit data');
        assert.equal(await panel.locator('button').isDisabled(), true);
        assert.deepEqual(await panel.locator('input, select, textarea').evaluateAll(fields => fields.map(field => field.name)), names);
        assert.equal(await panel.locator('input, select, textarea').evaluateAll(fields => fields.every(field => field.labels.length === 1 && (!field.getAttribute('aria-describedby') || document.getElementById(field.getAttribute('aria-describedby'))))), true, 'Every control has a label and valid help reference');
        const email = panel.getByLabel('Email address (required)');
        await email.fill('invalid');
        assert.equal(await email.evaluate(field => field.validity.typeMismatch), true);
        await email.fill('person@example.org');
        assert.equal(await email.evaluate(field => field.checkValidity()), true);
        const originalURL = page.url();
        await email.press('Enter');
        assert.equal(page.url(), originalURL, 'Enter cannot submit a preview');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, 'Form reflows');
        assert.equal(await panel.locator('input, select, button').evaluateAll(fields => fields.every(field => field.getBoundingClientRect().height >= 44)), true, 'Comfortable native control targets');
        if (javaScriptEnabled && width === 375) {
          await page.addScriptTag({path: process.env.AXE_PATH || require.resolve('axe-core/axe.min.js')});
          const issues = await page.evaluate(async () => (await axe.run('.form-panel', {runOnly: {type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(issue => issue.id));
          assert.deepEqual(issues, [], 'Form accessibility');
        }
        if (javaScriptEnabled && [1440, 375].includes(width)) await panel.screenshot({path: path.join(reportDir, `${names.length === 6 ? 'contact' : 'newsletter'}-form-${width}.png`)});
        layouts++;
      }
    }
    await page.close();
  }
  return layouts;
};
