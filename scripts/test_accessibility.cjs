// Automated review complements the documented manual assistive-technology pass.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = process.env.SITE_URL || 'http://127.0.0.1:4000/';
const url = route => new URL(route.replace(/^\//, ''), base).href;
const output = path.resolve(process.env.REPORT_ROOT || 'reports', 'accessibility-tests');
const routes = ['/', '/build/', '/search/', '/people/', '/organisations/', '/events/', '/guides/install-a-toolchain/', '/case-studies/morello/', '/build/technology/cheri-and-rust-technical/'];
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = { equivalentZoomWidths: [720, 360, 320], reflow: 0, textScaling: 0, accessibility: 0, skipLinks: 0, keyboardControls: 0, noJavaScript: 0 };
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    function contained() { return page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1); }
    for (const width of report.equivalentZoomWidths) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of routes) {
        await page.goto(url(route));
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await contained(), true, `${route}: reflow at ${width}`);
        assert.equal(await page.locator('main').count(), 1);
        assert.equal(await page.locator('main h1').count(), 1);
        report.reflow++;
        if (width === 320) {
          await page.addScriptTag({ path: process.env.AXE_PATH || require.resolve('axe-core/axe.min.js') });
          const issues = await page.evaluate(async () => (await axe.run({ runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })));
          assert.deepEqual(issues, [], `${route}: whole-page accessibility`);
          report.accessibility++;
          await page.keyboard.press('Tab');
          assert.equal(await page.locator('.skip-link').evaluate(a => a === document.activeElement), true, 'Skip link is first keyboard stop');
          assert.equal(await page.locator('.skip-link').evaluate(a => a.getBoundingClientRect().top >= 0 && parseFloat(getComputedStyle(a).outlineWidth) >= 3), true, 'Skip link visible with focus');
          await page.keyboard.press('Enter');
          assert.equal(await page.locator('main').evaluate(main => main === document.activeElement), true, 'Skip link moves focus to main');
          report.skipLinks++;
        }
      }
    }
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of routes) {
        await page.goto(url(route));
        await page.evaluate(() => document.documentElement.style.fontSize = '200%');
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await contained(), true, `${route}: 200% text at ${width}`);
        assert.equal(await page.locator('main').isVisible(), true);
        report.textScaling++;
      }
    }
    await page.setViewportSize({ width: 375, height: 1000 });
    await page.goto(url('/search/'));
    const query = page.getByLabel('Search terms');
    await query.focus(); await query.fill('Morello'); await page.keyboard.press('Enter');
    await page.locator('#search-status').filter({ hasText: /results? for/ }).waitFor();
    assert.equal(await query.evaluate(input => input === document.activeElement), true, 'Search update retains query focus');
    const result = page.locator('#search-results a').first();
    await result.focus(); await page.keyboard.press('Enter');
    await page.waitForURL(url('/hardware/morello/'));
    report.keyboardControls++;
    await page.goto(url('/people/'));
    const filter = page.getByLabel('Find in this directory');
    await filter.focus(); await filter.fill('no-match-491503');
    await page.locator('.directory-empty').waitFor({ state: 'visible' });
    assert.equal(await filter.evaluate(input => input === document.activeElement), true, 'Filter retains focus');
    const reset = page.getByRole('button', { name: 'Reset', exact: true });
    await reset.focus(); await page.keyboard.press('Enter');
    assert.equal(await filter.inputValue(), '');
    assert.equal(await filter.evaluate(input => input === document.activeElement), true, 'Reset returns focus to query');
    report.keyboardControls++;
    const plain = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 320, height: 1000 } });
    for (const route of routes) {
      await plain.goto(url(route));
      assert.equal(await plain.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      assert.equal(await plain.locator('.site-footer a[href$="/checks/"]').count(), 0);
      assert.equal(await plain.locator('.footer-navigation a').count() > 0, true);
      report.noJavaScript++;
    }
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
