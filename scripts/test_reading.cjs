// Long-form measure, native contents, and keyboard scrolling for static articles.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = process.env.SITE_URL || 'http://127.0.0.1:4000/';
const url = route => new URL(route.replace(/^\//, ''), base).href;
const output = path.resolve(process.env.REPORT_ROOT || 'reports', 'reading-tests');
const routes = ['/guides/install-a-toolchain/', '/guides/choose-a-platform/', '/build/technology/capabilities/', '/build/technology/cheri-and-rust-technical/', '/case-studies/morello/', '/case-studies/cheriot/', '/reference/linux-roadmap/print.html', '/reference/CHERI-seL4-Exercises/print.html'];
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = { widths: [1440, 1024, 768, 640, 375, 320], layouts: 0, accessibility: 0, nativeContents: 0, scrollRegions: 0 };
  try {
    const page = await browser.newPage();
    for (const width of report.widths) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of routes) {
        await page.goto(url(route));
        assert.equal(await page.locator('main h1').count(), 1, 'One primary article heading');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${route} reflow at ${width}`);
        const errors = await page.evaluate(() => {
          const problems = [];
          for (const p of document.querySelectorAll('.article-content > p:not(:has(img))')) {
            const maximum = parseFloat(getComputedStyle(p).maxWidth);
            if (Number.isFinite(maximum) && p.getBoundingClientRect().width > maximum + 1) problems.push('Prose measure exceeded');
          }
          for (const link of document.querySelectorAll('.table-of-contents a')) if (!document.getElementById(decodeURIComponent(link.hash.slice(1)))) problems.push('Contents target missing');
          for (const table of document.querySelectorAll('.article-content table')) if (!table.parentElement.matches('.table-scroll[tabindex="0"][role="region"]')) problems.push('Table lacks native scrolling region');
          return problems;
        });
        assert.deepEqual(errors, [], `${route} ${width}`);
        if (width === 375 && route !== '/reference/CHERI-seL4-Exercises/print.html') {
          await page.addScriptTag({ path: process.env.AXE_PATH || require.resolve('axe-core/axe.min.js') });
          const issues = await page.evaluate(async () => (await axe.run('main', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })));
          assert.deepEqual(issues, [], `${route} accessibility`); report.accessibility++;
        }
        if (['/guides/install-a-toolchain/', '/case-studies/morello/'].includes(route) && [1440, 375].includes(width)) await page.screenshot({ path: path.join(output, `${route.split('/').filter(Boolean).at(-1)}-${width}.png`), fullPage: true });
        report.layouts++;
      }
    }
    const plain = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 375, height: 1000 } });
    await plain.goto(url('/guides/install-a-toolchain/'));
    await plain.locator('.table-of-contents > summary').focus();
    await plain.keyboard.press('Enter');
    const first = plain.locator('.table-of-contents a').first();
    const fragment = await first.getAttribute('href');
    await first.focus(); await plain.keyboard.press('Enter');
    assert.equal(new URL(plain.url()).hash, fragment);
    assert.equal(await plain.locator(fragment).count(), 1);
    report.nativeContents++;
    await plain.goto(url('/build/technology/cheri-and-rust-technical/'));
    const table = plain.locator('.article-content .table-scroll').first();
    await table.focus();
    assert.equal(await table.evaluate(region => parseFloat(getComputedStyle(region).outlineWidth) >= 3), true);
    if (await table.evaluate(region => region.scrollWidth > region.clientWidth)) {
      await plain.keyboard.press('ArrowRight'); await plain.waitForTimeout(120);
      assert(await table.evaluate(region => region.scrollLeft > 0), 'Keyboard scrolls a wide table');
    }
    report.scrollRegions++;
    await plain.goto(url('/guides/install-a-toolchain/'));
    await plain.locator('.article-content pre').first().focus();
    assert.equal(await plain.locator('.article-content pre').first().evaluate(pre => parseFloat(getComputedStyle(pre).outlineWidth) >= 3), true);
    report.scrollRegions++;
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
