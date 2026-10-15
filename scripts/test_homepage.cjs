// Source-derived homepage checks, including narrow reflow and native navigation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = process.env.SITE_URL || 'http://127.0.0.1:4000/';
const url = route => new URL(route.replace(/^\//, ''), base).href;
const output = path.resolve(process.env.REPORT_ROOT || 'reports', 'homepage-tests');
const source = JSON.parse(fs.readFileSync('reports/preflight.json', 'utf8'));
const home = JSON.parse(fs.readFileSync('reports/index-navigation.json', 'utf8'))['/'];
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date(source.generated_at));
const news = source.records.filter(r => r.collection === 'news' && !r.alternate && r.properties.published_date).sort((a, b) => b.properties.published_date.localeCompare(a.properties.published_date)).slice(0, 3);
const events = source.records.filter(r => r.collection === 'events' && !r.alternate && (r.properties.end_datetime || r.properties.end_date || r.properties.start_datetime || r.properties.start_date).slice(0, 10) >= today).sort((a, b) => (a.properties.start_datetime || a.properties.start_date).localeCompare(b.properties.start_datetime || b.properties.start_date) || a.url.localeCompare(b.url)).slice(0, 2);
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = { widths: [1440, 1024, 768, 640, 375, 320], layouts: 0, accessibility: 0, nativeNavigation: 0, modelStates: 0, staticModel: 0 };
  try {
    const page = await browser.newPage();
    for (const width of report.widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('main h1').textContent(), home.home.title);
      assert.equal(await page.locator('main h1').count(), 1);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Reflow at ${width}`);
      assert.deepEqual(await page.locator('[data-featured="news"] h4 a').allTextContents(), news.map(r => r.title));
      assert.deepEqual(await page.locator('[data-featured="events"] h4 a').allTextContents(), events.map(r => r.title));
      assert.deepEqual(await page.locator('.home-page .index-navigation a').evaluateAll(links => links.map(a => a.href)), home.links.map(a => url(a.url)));
      assert.equal(await page.locator('main img[src$="placeholder.svg"]').count(), 0);
      assert.equal(await page.locator('.memory-cell').count(), 64, 'Complete static memory landscape');
      for (const control of await page.locator('[data-memory-state]').all()) {
        await control.focus(); await page.keyboard.press('Enter');
        assert.equal(await page.locator('[data-memory-model]').getAttribute('data-state'), await control.getAttribute('data-memory-state'));
        assert.equal(await page.locator('[data-memory-state][aria-pressed="true"]').count(), 1);
        assert.equal(await page.locator('#memory-explanation a').count(), 1);
        assert.equal(await page.locator('#memory-explanation').getAttribute('aria-live'), 'polite');
        assert.equal(await page.locator('[data-memory-capability]').textContent(), await control.getAttribute('data-memory-state') === 'readonly' ? 'DERIVED C1' : 'CAPABILITY C0');
        const state = await control.getAttribute('data-memory-state');
        const visual = {permitted: 'g.memory-access', rejected: 'g.memory-rejection', readonly: 'g.memory-write-rejection', compartments: 'g.memory-compartment'}[state];
        if (visual) await page.waitForFunction(selector => getComputedStyle(document.querySelector(selector)).opacity === '1', visual);
        if (state === 'readonly') await page.waitForFunction(() => getComputedStyle(document.querySelector('g.memory-rejection')).opacity === '0');
        report.modelStates++;
      }
      await page.locator('[data-memory-state="bounds"]').click();
      await page.evaluate(() => scrollTo(0, 0));

      for (const action of await page.locator('.home-hero .action-links a').all()) {
        assert.equal(await action.evaluate(a => a.getBoundingClientRect().height >= 44 && a.getBoundingClientRect().bottom <= 900), true, 'Hero actions fit in the first screen');
      }
      await page.addScriptTag({ path: process.env.AXE_PATH || require.resolve('axe-core/axe.min.js') });
      const violations = await page.evaluate(async () => (await axe.run('main', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })));
      assert.deepEqual(violations, [], `Accessibility at ${width}`);
      report.layouts++; report.accessibility++;
      // Full-page screenshots must include the deliberately lazy artwork.
      for (const artwork of await page.locator('main img[loading="lazy"]').all()) {
        await artwork.scrollIntoViewIfNeeded();
        await artwork.evaluate(img => img.decode());
      }
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(output, `homepage-${width}.png`), fullPage: true });
    }
    const plain = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
    await plain.goto(base);
    assert.equal(await plain.locator('.memory-svg').isVisible(), true);
    await plain.locator('.memory-notes summary').click();
    assert.equal(await plain.locator('[data-memory-copy]').count(), 5);
    assert.equal(await plain.locator('[data-memory-copy="readonly"]').isVisible(), true);
    report.staticModel++;
    const primary = plain.locator('.home-hero .primary-action');
    await primary.focus();
    await plain.keyboard.press('Enter');
    await plain.waitForURL(url(home.home.primary.url));
    assert.equal(await plain.locator('main h1').count(), 1);
    report.nativeNavigation++;
    // Every audience route and the platform-aware developer sequence is native.
    for (const journey of home.home.journeys) {
      await plain.goto(base);
      const link = plain.locator('.home-journeys a').filter({ hasText: journey.title });
      assert.equal(await link.count(), 1);
      await link.focus(); await plain.keyboard.press('Enter');
      await plain.waitForURL(url(journey.url));
      assert.equal(await plain.locator('main h1').count(), 1);
      report.nativeNavigation++;
    }
    await plain.goto(url('/build/'));
    const sequence = plain.locator('.learning-path h3 a');
    const expectedSteps = ['/guides/choose-a-platform/', '/guides/run-cheri-in-simulation/', '/guides/install-a-toolchain/', '/guides/build-your-first-application/', '/guides/port-existing-software/', '/guides/technical-faq/'];
    assert.deepEqual(await sequence.evaluateAll(links => links.map(a => a.href)), expectedSteps.map(url));
    for (const step of expectedSteps) {
      await plain.goto(url('/build/'));
      const link = plain.locator(`.learning-path a[href="${new URL(url(step)).pathname}"]`);
      await link.focus(); await plain.keyboard.press('Enter');
      await plain.waitForURL(url(step));
      assert.equal(await plain.locator('main h1').count(), 1);
      report.nativeNavigation++;
    }
    const still = await browser.newPage({reducedMotion: 'reduce', viewport: {width: 375, height: 900}});
    await still.goto(base);
    await still.locator('[data-memory-state="readonly"]').click();
    assert(await still.locator('g.memory-write-rejection').evaluate(element => parseFloat(getComputedStyle(element).transitionDuration) <= .001), 'Reduced motion removes the model transition');
    report.reducedMotion = true;
    await still.close();
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
