// Browser regressions for consolidated routes, legal lists and empty metadata.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = new URL(process.env.SITE_URL || 'http://127.0.0.1:4000/');
const url = route => new URL(route.replace(/^\//, ''), base).href;
const reportDir = 'reports/content-tests';
fs.mkdirSync(reportDir, { recursive: true });
const report = { widths: [1440, 1024, 768, 640, 375], layoutChecks: 0, accessibilityChecks: 0, redirects: 0 };

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    for (const width of report.widths) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['/policies/competition-law-statement/', '/policies/intellectual-property-policy/', '/policies/trademark-policy/', '/papers/', '/policies/', '/organisations/cheri-alliance/']) {
        await page.goto(url(route));
        const problems = await page.evaluate(() => {
          const errors = [];
          if (document.documentElement.scrollWidth > innerWidth + 1) errors.push('Horizontal overflow');
          for (const panel of document.querySelectorAll('.metadata')) {
            if (!panel.textContent.trim() || panel.textContent.trim() === 'Placeholder image') errors.push('Empty metadata');
          }
          for (const list of document.querySelectorAll('.legal-clauses')) {
            if (list.tagName !== 'OL' || getComputedStyle(list).listStyleType !== 'none') errors.push('Incorrect legal-list markers');
            const rect = list.getBoundingClientRect();
            if (rect.left < 0 || rect.right > innerWidth) errors.push('Legal list escapes viewport');
          }
          return errors;
        });
        assert.deepEqual(problems, [], `${width}px ${route}`);
        report.layoutChecks++;
        if (route === '/organisations/cheri-alliance/') {
          assert.equal(await page.locator('main h1').count(), 1, 'Duplicate Alliance page heading');
          assert.equal((await page.locator('.article-content').innerText()).includes('|'), false, 'Broken administrative table is visible');
          await page.screenshot({ path: path.join(reportDir, `cheri-alliance-${width}.png`), fullPage: true });
        }
        if (route === '/policies/competition-law-statement/') {
          assert.equal(await page.locator('.clause-number').count(), 28);
          assert.equal(await page.locator('.metadata time').textContent(), 'August 2024');
          assert.equal(await page.locator('.metadata time').getAttribute('datetime'), '2024-08');
          await page.screenshot({ path: path.join(reportDir, `competition-law-${width}.png`), fullPage: true });
        }
        if (width === 1440 && process.env.AXE_PATH) {
          await page.addScriptTag({ path: process.env.AXE_PATH });
          const violations = await page.evaluate(async () => (await axe.run('main', {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
          })).violations.map(v => ({ id: v.id, impact: v.impact })));
          assert.deepEqual(violations, [], route);
          report.accessibilityChecks++;
        }
      }
    }
    // Native refresh redirects and normal destination links survive without JS.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const plain = await context.newPage();
    const aliases = [
      ['/discover/resources/academic-papers/', '/papers/'],
      ['/competition-law-statement/', '/policies/competition-law-statement/'],
      ['/code-of-conduct/', '/policies/code-of-conduct/'],
      ['/trademark/', '/policies/trademark/'],
      ['/legal-and-policies/', '/policies/'],
      ['/news-and-events/news-and-analysis/latest-news/', '/news/'],
      ['/policies/ip-policy/', '/policies/intellectual-property-policy/'],
      ['/policies/trademark-original/', '/policies/trademark/'],
    ];
    for (const [source, destination] of aliases) {
      await plain.goto(url(source));
      await plain.waitForURL(url(destination));
      assert.equal(await plain.locator('link[rel="canonical"]').getAttribute('href'), 'https://adam-3bian.github.io' + new URL(url(destination)).pathname);
      report.redirects++;
    }
    await context.close();
    fs.writeFileSync(path.join(reportDir, 'results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
