// Optional browser regression checks; no browser dependency ships with the site.
// Serve a production _site build on port 4000, then run with Playwright installed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const siteDir = path.resolve(process.env.SITE_DIR || '_site');
const base = new URL(process.env.SITE_URL || 'http://127.0.0.1:4000/');
const reportDir = path.resolve('reports/image-tests');
fs.mkdirSync(reportDir, { recursive: true });
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const htmlFiles = walk(siteDir).filter(file => file.endsWith('.html'));
const routeFor = file => '/' + path.relative(siteDir, file).replaceAll(path.sep, '/').replace(/index\.html$/, '');
const pageURL = route => new URL(route.replace(/^\//, ''), base).href;
const imageRoutes = [];
let references = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const route = routeFor(file);
  if (/class="[^"]*\b(?:image-(?:left|right|full|logo|icon|gallery))\b/.test(html)) imageRoutes.push(route);
  for (const match of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)) {
    const url = new URL(match[1].replaceAll('&amp;', '&'), pageURL(route));
    if (url.origin !== base.origin || url.protocol === 'data:') continue;
    const relative = decodeURIComponent(url.pathname).slice(base.pathname.length);
    assert(fs.statSync(path.join(siteDir, relative)).isFile(), `Missing built image: ${route} -> ${url.pathname}`);
    references++;
  }
}
console.log(`Asset paths: ${references} local image references across ${htmlFiles.length} HTML files passed.`);

const representativeRoutes = [
  '/', '/checks/', '/people/', '/guides/install-a-toolchain/', '/software/cheri-linux/',
  '/hardware/x730/', '/people/adam-finney/', '/organisations/codasip/',
  '/groups/cheri-linux-working-group/', '/papers/cheriot-complete-memory-safety-for-embedded-devices/',
  '/policies/code-of-conduct/',
];
const routes = [...new Set([...imageRoutes, ...representativeRoutes])];
const widths = [1440, 1024, 768, 640, 375];
const screenshotRoutes = [
  '/adopt/assurance-and-adoption/case-studies/', '/alliance/leadership/governing-board/',
  '/events/embedded-world-2026/', '/hardware/x730/',
];
const report = { imagePages: imageRoutes.length, pages: routes.length, widths, references, layoutChecks: 0 };

async function loaded(page, route) {
  const response = await page.goto(pageURL(route));
  assert.equal(response.status(), 200, route);
  // Existing cards load offscreen thumbnails lazily. Request those assets in
  // the test so the all-page broken-image check does not wait for scrolling.
  await page.locator('img[loading="lazy"]').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
  await page.waitForFunction(() => [...document.images].every(image => image.complete));
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => { throw error; });
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of routes) {
        await loaded(page, route);
        const problems = await page.evaluate(() => {
          const errors = [];
          const root = document.documentElement;
          if (root.scrollWidth > window.innerWidth + 1) errors.push(`Page overflow: ${root.scrollWidth}`);
          for (const image of document.querySelectorAll('img[src]')) {
            if (!image.naturalWidth) errors.push(`Broken image: ${image.getAttribute('src')}`);
          }
          for (const article of document.querySelectorAll('.article-content')) {
            const bounds = article.getBoundingClientRect();
            const main = document.querySelector('main').getBoundingClientRect();
            if (Math.abs(bounds.width - main.width) > 1) errors.push('Article does not span the page container');
            const floats = [];
            for (const image of article.querySelectorAll('img')) {
              const rect = image.getBoundingClientRect();
              if (rect.left < bounds.left - 1 || rect.right > bounds.right + 1) errors.push(`Image escapes article: ${image.src}`);
              const grouped = image.closest('.image-gallery');
              if (grouped) {
                const item = image.closest('li').getBoundingClientRect();
                if (rect.left < item.left - 1 || rect.right > item.right + 1) errors.push('Image escapes its gallery item');
              }
              const aligned = image.closest('.image-left, .image-right');
              if (aligned) {
                const style = getComputedStyle(aligned);
                const alignedRect = aligned.getBoundingClientRect();
                const expected = window.innerWidth > 960 ? .42 : 1;
                if (Math.abs(alignedRect.width / bounds.width - expected) > .01) errors.push('Incorrect aligned image width');
                if (style.float !== (window.innerWidth > 960 ? aligned.classList.contains('image-left') ? 'left' : 'right' : 'none')) errors.push('Incorrect responsive float');
                if (style.float !== 'none') {
                  floats.push({ element: aligned, rect: alignedRect });
                  // Check a real text line, not merely the paragraph's box.
                  const paragraph = image.closest('p')?.nextElementSibling;
                  if (paragraph?.tagName === 'P' && paragraph.firstChild?.nodeType === Node.TEXT_NODE) {
                    const range = document.createRange();
                    range.setStart(paragraph.firstChild, 0);
                    range.setEnd(paragraph.firstChild, Math.min(20, paragraph.firstChild.length));
                    const line = range.getBoundingClientRect();
                    if (line.top < alignedRect.bottom) {
                      if (style.float === 'left' && line.left < alignedRect.right + 10) errors.push('Text does not wrap beside left image');
                      if (style.float === 'right' && line.right > alignedRect.left - 10) errors.push('Text does not wrap beside right image');
                    }
                  }
                }
              }
              const full = image.closest('.image-full');
              if (full && Math.abs(full.getBoundingClientRect().width - bounds.width) > 1) errors.push('Full-width image is restricted');
            }
            for (const heading of article.querySelectorAll(':scope > :is(h1,h2,h3,h4,h5,h6,hr,section), :scope > .image-gallery')) {
              for (const float of floats) {
                if (float.element.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING && heading.getBoundingClientRect().top < float.rect.bottom - 1) errors.push('Heading or group overlaps a preceding float');
              }
            }
            for (const section of document.querySelectorAll('.relationships, .onward, .inspector, .site-footer')) {
              for (const float of floats) if (section.getBoundingClientRect().top < float.rect.bottom - 1) errors.push('Float escapes into metadata or footer');
            }
          }
          return errors;
        });
        assert.deepEqual(problems, [], `${width}px ${route}: ${problems.join('; ')}`);
        report.layoutChecks++;
        if (screenshotRoutes.includes(route)) {
          await page.locator('.article-content').screenshot({ path: path.join(reportDir, `${route.split('/').filter(Boolean).at(-1)}-${width}.png`) });
        }
      }
      console.log(`${width}px: ${routes.length} pages passed containment, wrapping, clearing and asset checks.`);
    }

    const editorial = '/adopt/assurance-and-adoption/case-studies/';
    await loaded(page, editorial);
    assert.deepEqual(await page.locator('.article-content img').evaluateAll(images => images.map(image => image.className)), ['image-left', 'image-right', 'image-left']);
    const first = page.locator('.article-content img[role="button"]').first();
    await first.scrollIntoViewIfNeeded();
    await first.focus();
    const originalScroll = await page.evaluate(() => scrollY);
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Image viewer' });
    await dialog.waitFor({ state: 'visible' });
    assert.equal(await page.getByRole('button', { name: 'Close image viewer' }).evaluate(element => document.activeElement === element), true);
    assert.equal(await page.locator('.image-viewer-status').textContent(), 'Image 1 of 3');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('.image-viewer-status').textContent(), 'Image 2 of 3');
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('.image-viewer-status').textContent(), 'Image 1 of 3');
    await page.getByRole('button', { name: 'Previous image' }).click();
    assert.equal(await page.locator('.image-viewer-status').textContent(), 'Image 3 of 3');
    await page.getByRole('button', { name: 'Next image' }).click();
    assert.equal(await page.locator('.image-viewer-status').textContent(), 'Image 1 of 3');
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press(i < 5 ? 'Tab' : 'Shift+Tab');
      assert(await page.evaluate(() => document.activeElement.closest('dialog') !== null), 'Focus left the modal');
    }
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).overflow), 'hidden');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await first.evaluate(image => document.activeElement === image), true);
    assert.equal(await page.evaluate(() => scrollY), originalScroll);
    await page.keyboard.press('Space');
    await dialog.waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Close image viewer' }).click();
    await dialog.waitFor({ state: 'hidden' });
    await first.click();
    await dialog.waitFor({ state: 'visible' });
    await page.mouse.click(2, 2);
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await first.evaluate(image => document.activeElement === image), true);

    // Preserve the actions of linked/interactive images, even if aligned.
    // A separate context avoids adding these fixtures to the audited pages.
    const linked = await browser.newPage();
    await linked.route('**/assets/viewer.js', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: `document.querySelector('.article-content').insertAdjacentHTML('beforeend', '<a id="linked-image" href="#linked-image"><img class="image-left" src="/assets/shared/source-assets/5a6300ace656-cheri.png" alt="Linked example"></a><button id="interactive-image"><img class="image-right" src="/assets/shared/source-assets/5a6300ace656-cheri.png" alt="Interactive example"></button>');\n${await response.text()}` });
    });
    await loaded(linked, editorial);
    assert.equal(await linked.locator('#linked-image img, #interactive-image img').evaluateAll(images => images.some(image => image.hasAttribute('role') || image.hasAttribute('tabindex'))), false);
    await linked.locator('#linked-image img').click();
    assert(new URL(linked.url()).hash === '#linked-image');
    assert.equal(await linked.locator('dialog[open]').count(), 0);
    await linked.close();

    await loaded(page, '/news/beyond-software-patching/');
    await page.locator('figure.image-full img[role="button"]').nth(1).click();
    assert.equal(await page.locator('.image-viewer figcaption').textContent(), await page.locator('.article-content figcaption').nth(1).textContent());
    await page.screenshot({ path: path.join(reportDir, 'image-viewer-375.png') });
    const axePath = process.env.AXE_PATH;
    if (axePath) {
      await page.addScriptTag({ path: axePath });
      const accessibility = await page.evaluate(async () => axe.run('dialog', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
      assert.deepEqual(accessibility.violations.map(issue => ({ id: issue.id, impact: issue.impact })), [], 'Dialog accessibility violations');
      report.axe = 'WCAG 2 A/AA and 2.1 AA: no dialog violations';
    }
    await page.keyboard.press('Escape');
    await loaded(page, '/checks/');
    const beforeFilter = await page.locator('[data-audit-row]:visible').count();
    await page.locator('#record-filter').fill('Morello');
    const afterFilter = await page.locator('[data-audit-row]:visible').count();
    assert(afterFilter > 0 && afterFilter < beforeFilter, 'Existing audit filter no longer works');
    assert.equal(await page.locator('dialog').count(), 0, 'Viewer appeared on an audit page');
    await loaded(page, '/people/');
    assert.equal(await page.locator('.cards img[role="button"], .lead-image[role="button"]').count(), 0, 'Viewer changed card or hero behaviour');
    await loaded(page, '/hardware/x730/');
    await page.locator('.article-content img[role="button"]').click();
    assert.equal(await page.locator('.image-viewer-previous:visible, .image-viewer-next:visible').count(), 0);
    await page.screenshot({ path: path.join(reportDir, 'image-viewer-diagram-375.png') });
    await page.keyboard.press('Escape');

    // The touch controls work without swipe gestures, and no animation is used.
    const touch = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const mobile = await touch.newPage();
    await loaded(mobile, editorial);
    await mobile.locator('.article-content img[role="button"]').first().tap();
    await mobile.getByRole('button', { name: 'Next image' }).tap();
    assert.equal(await mobile.locator('.image-viewer-status').textContent(), 'Image 2 of 3');
    const containment = await mobile.locator('.image-viewer img').evaluate(image => {
      const rect = image.getBoundingClientRect();
      return rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight && getComputedStyle(image).animationName === 'none';
    });
    assert(containment, 'Touch viewer image overflow or animation');
    await mobile.getByRole('button', { name: 'Close image viewer' }).tap();
    assert.equal(await mobile.locator('dialog[open]').count(), 0);
    await touch.close();

    const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
    const fallback = await noJS.newPage();
    await fallback.goto(pageURL(editorial));
    assert.equal(await fallback.locator('.article-content img').count(), 3);
    assert.equal(await fallback.locator('.article-content img[role="button"], dialog').count(), 0);
    await noJS.close();
    report.viewer = 'Mouse, Enter/Space, arrows, wraparound, buttons, Escape, backdrop, focus return, scroll lock, captions, exclusions, single image, touch, reduced motion and no-JS passed';
    fs.writeFileSync(path.join(reportDir, 'results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(report.viewer);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
