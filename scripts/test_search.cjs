// Search correctness, local-only requests, safe text, reflow and no-JS fallback.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = process.env.SITE_URL || 'http://127.0.0.1:4000/';
const url = route => new URL(route.replace(/^\//, ''), base).href;
const output = path.resolve(process.env.REPORT_ROOT || 'reports', 'search-tests');
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = { widths: [1440, 1024, 768, 640, 375, 320], layouts: 0, accessibility: 0, functionality: 0, noJavaScript: 0 };
  try {
    const response = await (await browser.newContext()).request.get(url('/assets/search-index.json'));
    assert.equal(response.status(), 200);
    const raw = await response.text();
    assert(Buffer.byteLength(raw) < 1024 * 1024, 'Index should remain under one MiB');
    const payload = JSON.parse(raw);
    assert.equal(payload.version, 1);
    const prefix = new URL(base).pathname.replace(/\/$/, '');
    const expected = JSON.parse(fs.readFileSync('reports/public-records.json', 'utf8')).filter(route => route !== '/search/').map(route => prefix + route).sort();
    assert.deepEqual(payload.records.map(record => record.url).sort(), expected, 'Exactly the canonical public resources');
    assert.equal(new Set(payload.records.map(record => record.url)).size, payload.records.length);
    for (const record of payload.records) {
      assert.deepEqual(Object.keys(record).sort(), ['date', 'keywords', 'summary', 'text', 'title', 'type', 'url']);
      assert(record.title && [...record.summary].length <= 240 && [...record.text].length <= 1200);
      assert(!record.url.includes('/checks/') && !record.url.includes('/source-versions/'));
    }
    report.records = payload.records.length; report.indexBytes = Buffer.byteLength(raw);
    const page = await browser.newPage();
    const requests = [];
    page.on('request', request => requests.push(request.url()));
    for (const width of report.widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(url('/search/'));
      await page.locator('#site-search fieldset').evaluate(field => { if (field.disabled) throw new Error('Search controls disabled'); });
      const before = requests.filter(address => address.includes('/assets/search-index.json')).length;
      await page.getByLabel('Search terms').fill('MoReLLo');
      await page.getByLabel('Search terms').press('Enter');
      await page.locator('#search-status').filter({ hasText: /results? for/ }).waitFor();
      assert.equal(await page.locator('#search-results a').first().getAttribute('href'), url('/hardware/morello/'), 'Exact title beats mentions');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Search reflow ${width}`);
      assert.equal(await page.locator('#search-status').getAttribute('role'), 'status');
      assert.equal(await page.locator('#search-status').getAttribute('aria-atomic'), 'true');
      await page.addScriptTag({ path: process.env.AXE_PATH || require.resolve('axe-core/axe.min.js') });
      const violations = await page.evaluate(async () => (await axe.run('main', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })));
      assert.deepEqual(violations, [], `Search accessibility ${width}`);
      await page.getByLabel('Content type').selectOption('academic-papers');
      await page.locator('#search-status').filter({ hasText: 'in Academic papers' }).waitFor();
      assert((await page.locator('#search-results .result-meta').allTextContents()).every(text => text.startsWith('Academic papers')));
      assert.equal(requests.filter(address => address.includes('/assets/search-index.json')).length, before + 1, 'One index request per page, cached across queries');
      await page.screenshot({ path: path.join(output, `search-${width}.png`), fullPage: true });
      report.layouts++; report.accessibility++;
    }
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    assert.equal(await page.getByLabel('Search terms').inputValue(), '');
    assert.equal(await page.getByLabel('Search terms').evaluate(input => input === document.activeElement), true);
    async function submit(query) {
      await page.getByLabel('Search terms').fill(query);
      await page.getByLabel('Search terms').press('Enter');
      await page.locator('#search-status').filter({ hasText: query }).waitFor();
    }
    await submit('cheri linux');
    assert.equal(await page.locator('#search-results a').first().getAttribute('href'), url('/software/cheri-linux/'));
    await submit('C++');
    assert(await page.locator('#search-results > li').count() > 0, 'Special characters are literal search terms');
    const special = '<img src=x onerror="window.searchXSS=true">';
    await submit(special);
    assert.match(await page.locator('#search-status').textContent(), /^No results/);
    assert.equal(await page.locator('#search-results img, #search-status img').count(), 0);
    assert.equal(await page.evaluate(() => window.searchXSS), undefined);
    await submit('cheri-no-result-294923981');
    assert.match(await page.locator('#search-status').textContent(), /^No results/);
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    assert.match(await page.locator('#search-status').textContent(), /^Enter/);
    assert(requests.every(address => new URL(address).origin === new URL(base).origin), 'Every browser request stays on this website');
    assert(requests.filter(address => address.includes('/assets/search-index.json')).every(address => !new URL(address).search), 'Visitor queries never enter index requests');
    report.functionality += 7;
    const failure = await browser.newPage();
    await failure.route('**/assets/search-index.json', route => route.abort());
    await failure.goto(url('/search/?q=Morello'));
    await failure.locator('#search-status').filter({ hasText: 'Search is unavailable' }).waitFor();
    assert.equal(await failure.locator('#search-results-region').isVisible(), false);
    report.functionality++;
    const plain = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
    await plain.goto(url('/search/'));
    assert.equal(await plain.locator('noscript').isVisible(), true);
    assert.equal(await plain.locator('#site-search fieldset').getAttribute('disabled'), '');
    const browse = plain.locator('.article-content .link-grid a').first();
    await browse.focus(); await plain.keyboard.press('Enter');
    await plain.waitForURL(url('/discover/'));
    report.noJavaScript++;
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
