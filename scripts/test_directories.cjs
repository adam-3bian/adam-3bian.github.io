// Progressive directories preserve every source record and native card link.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = process.env.SITE_URL || 'http://127.0.0.1:4000/';
const url = route => new URL(route.replace(/^\//, ''), base).href;
const output = path.resolve(process.env.REPORT_ROOT || 'reports', 'directory-tests');
const source = JSON.parse(fs.readFileSync('reports/preflight.json', 'utf8'));
const board = fs.readFileSync('_data/governing-board.yml', 'utf8').split('\n').filter(line => line.startsWith('- ')).map(line => line.slice(2));
const routes = ['/people/', '/organisations/', '/news/', '/events/', '/academic-papers/', '/hardware/', '/software/', '/guides/', '/reports/', '/working-groups/'];
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = { widths: [1440, 1024, 768, 640, 375, 320], layouts: 0, accessibility: 0, functionality: 0, noJavaScript: 0 };
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => { throw error; });
    for (const width of report.widths) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await page.goto(url(route));
        const listing = page.locator('.listing');
        const collection = await listing.getAttribute('data-listing');
        assert.equal(await listing.locator('.directory-controls').isVisible(), true, route);
        const records = source.records.filter(record => record.collection === collection && !record.alternate);
        const actual = await listing.locator('.card').evaluateAll(cards => cards.map(card => card.dataset.recordUrl).sort());
        assert.deepEqual(actual, records.map(record => record.url).sort(), 'Complete directory before filters');
        assert.equal(await listing.locator('[data-directory-item]:visible').count(), records.length, 'Missing metadata must remain in the default view');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${route} ${width}`);
        const query = listing.getByLabel('Find in this directory');
        await query.fill('cheri-directory-no-result-329432');
        await query.press('Enter');
        assert.equal(await listing.locator('.directory-empty').isVisible(), true);
        assert.equal(await listing.locator('[data-directory-item]:visible').count(), 0);
        await listing.getByRole('button', { name: 'Reset', exact: true }).click();
        assert.equal(await listing.locator('[data-directory-item]:visible').count(), records.length);
        assert.equal(await query.evaluate(input => document.activeElement === input), true);
        assert.equal(await listing.locator('.directory-count').getAttribute('role'), 'status');
        if (width === 375 || width === 1440) {
          await page.addScriptTag({ path: process.env.AXE_PATH || require.resolve('axe-core/axe.min.js') });
          const issues = await page.evaluate(async () => (await axe.run('main', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })));
          assert.deepEqual(issues, [], `${route} accessibility`); report.accessibility++;
        }
        if (['/people/', '/organisations/', '/events/'].includes(route) && [1440, 375].includes(width)) await page.screenshot({ path: path.join(output, `${collection}-${width}.png`), fullPage: true });
        report.layouts++; report.functionality += 2;
      }
    }
    await page.goto(url('/people/'));
    for (const [value, expected] of [['speaker', source.records.filter(record => record.collection === 'people' && !record.alternate && record.properties.is_speaker).map(record => record.url)], ['board', board.map(slug => `/people/${slug}/`)]]) {
      await page.getByLabel('Documented role').selectOption(value);
      assert.deepEqual(await page.locator('[data-directory-item]:visible .card').evaluateAll(cards => cards.map(card => card.dataset.recordUrl).sort()), expected.sort());
      report.functionality++;
    }
    await page.goto(url('/organisations/'));
    await page.getByLabel('Membership', { exact: true }).selectOption('full');
    assert.deepEqual(await page.locator('[data-directory-item]:visible .card').evaluateAll(cards => cards.map(card => card.dataset.recordUrl).sort()), source.records.filter(record => record.collection === 'organisations' && !record.alternate && record.properties.membership_tier === 'full').map(record => record.url).sort());
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    const alpha = page.locator('.alphabet-navigation a').first();
    await alpha.focus(); await page.keyboard.press('Enter');
    assert.equal(await page.locator(':target').getAttribute('tabindex'), '-1');
    report.functionality += 2;
    await page.goto(url('/news/'));
    await page.getByLabel('Sort by').selectOption('newest');
    const dates = await page.locator('[data-directory-item]:visible').evaluateAll(rows => rows.map(row => JSON.parse(row.dataset.directoryItem).date).filter(Boolean));
    assert.deepEqual(dates, [...dates].sort().reverse(), 'Newest source dates first, unknown dates retained last');
    const missing = source.records.filter(record => record.collection === 'news' && !record.alternate && !record.properties.published_date);
    assert.equal(await page.locator('[data-directory-item]:visible').count(), source.records.filter(record => record.collection === 'news' && !record.alternate).length);
    if (missing.length) {
      await page.getByLabel('Source year').selectOption('unspecified');
      assert.equal(await page.locator('[data-directory-item]:visible').count(), missing.length);
    }
    report.functionality++;
    await page.goto(url('/events/'));
    assert.equal(await page.locator('[data-event-period]').count(), 2);
    await page.getByLabel('Event period').selectOption('past');
    assert.equal(await page.locator('[data-event-period="upcoming"]').isVisible(), false);
    assert.equal(await page.locator('[data-event-period="past"]').isVisible(), true);
    report.functionality++;
    const plain = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
    for (const route of routes) {
      await plain.goto(url(route));
      assert.equal(await plain.locator('.directory-controls').isVisible(), false);
      const collection = await plain.locator('.listing').getAttribute('data-listing');
      assert.equal(await plain.locator('.listing .card:visible').count(), source.records.filter(record => record.collection === collection && !record.alternate).length);
      report.noJavaScript++;
    }
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
