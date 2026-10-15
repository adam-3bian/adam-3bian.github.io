// Browser-only tooling; the published menu uses native HTML and vanilla JS.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { chromium } = require('playwright');

const base = process.env.SITE_URL || 'http://127.0.0.1:4000/';
const reportDir = path.resolve(process.env.REPORT_ROOT || 'reports', 'navigation-tests');
fs.mkdirSync(reportDir, { recursive: true });
const widths = [1440, 1024, 768, 640, 375, 320];
const report = { widths, panelsChecked: 0, accessibilityChecks: 0 };
const audit = JSON.parse(fs.readFileSync('reports/preflight.json', 'utf8'));
const indexes = JSON.parse(fs.readFileSync('reports/index-navigation.json', 'utf8'));
const primarySource = JSON.parse(fs.readFileSync('_data/primary-navigation.json', 'utf8'));
const footerSource = JSON.parse(fs.readFileSync('_data/footer_navigation.json', 'utf8'));
const navigationBaseline = JSON.parse(fs.readFileSync('scripts/fixtures/navigation-baseline.json', 'utf8'));
const stableNavigation = value => Array.isArray(value) ? value.map(stableNavigation) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stableNavigation(value[key])])) : value;
const navigationDigest = value => createHash('sha256').update(JSON.stringify(stableNavigation(value))).digest('hex');
assert.equal(navigationDigest(primarySource), navigationBaseline.header_sha256, 'Front-matter migration must preserve every header label, route, column, group and position');
// The only authorised destination additions are the two restored starter-kit socials.
const expectedSocial = [
  {title: 'LinkedIn', url: 'https://www.linkedin.com/company/cheri-alliance/'},
  {title: 'Mastodon', url: 'https://infosec.exchange/@cheri_alliance'},
  {title: 'Slack', url: 'https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/cheri-slack.html'},
];
assert.deepEqual(footerSource.utilities, expectedSocial, 'Complete verified social destinations, in starter-kit order');
assert.equal(navigationDigest({...footerSource, utilities: footerSource.utilities.slice(0, 1)}), navigationBaseline.footer_sha256, 'Preserve every original footer group, label, route, position and utility');
assert.deepEqual(footerSource, JSON.parse(fs.readFileSync('reports/footer-navigation.json', 'utf8')), 'Rendered footer and verification report share generated navigation');
report.navigationBaseline = navigationBaseline.commit;
const flatten = nodes => nodes.flatMap(node => [...(node.url ? [node.url] : []), ...flatten(node.groups || node.links || [])]);
const expectedPrimaryRoutes = flatten(primarySource);
const expectedMenuLinks = expectedPrimaryRoutes.length;
assert.equal(expectedMenuLinks, navigationBaseline.header_link_occurrences);
assert.equal(footerSource.groups.flatMap(group => group.links).length, navigationBaseline.footer_link_occurrences);
const buildSource = primarySource.find(section => section.url === '/build/');
assert.deepEqual(buildSource.groups.map(group => group.title), ['Build', 'Technology', 'Resources']);
assert.deepEqual(buildSource.groups[0].links[0].links.map(link => link.title), ['Building Secure Software', 'Choose a Platform', 'Run CHERI in Simulation', 'Install a Toolchain', 'Build Your First Application', 'Port Existing Software', 'Build Compartments']);
assert.equal(buildSource.groups[0].links[1].status, 'TBD');
assert.deepEqual(buildSource.groups[1].links[0].links.map(link => link.title), ['Tags & Validity', 'Bounds', 'Permissions', 'Provenance', 'Sealing']);
assert.equal(buildSource.groups[1].columns, 2, 'Technical concepts have a dedicated wide-screen subcolumn');
assert.deepEqual(buildSource.groups[1].links[1].links.map(link => link.title), ['Spatial Memory Safety', 'Temporal Memory Safety', 'Compartmentalisation', 'Hybrid Systems', 'Pure-Capability Systems', 'CHERI and Rust — Technical Overview']);

async function assertContained(page, desktop) {
  const problems = await page.evaluate(isDesktop => {
    const errors = [];
    if (document.documentElement.scrollWidth > innerWidth + 1) errors.push('Horizontal overflow');
    for (const element of document.querySelectorAll('.primary-menu[open] > .primary-menu-panel')) {
      const rect = element.getBoundingClientRect();
      if (rect.left < 0 || rect.right > innerWidth + 1) errors.push('Menu escapes the page');
      if (isDesktop && (rect.top < 0 || rect.bottom > innerHeight + 1)) errors.push(`Menu escapes ${innerHeight}px viewport: top ${rect.top}, bottom ${rect.bottom}, max-height ${getComputedStyle(element).maxHeight}`);
      for (const link of element.querySelectorAll('a')) {
        if (!link.getClientRects().length) continue;
        const box = link.getBoundingClientRect();
        if (box.left < rect.left || box.right > rect.right + 1) errors.push('Link escapes its panel');
      }
    }
    return errors;
  }, desktop);
  assert.deepEqual(problems, [], problems.join('; '));
}

async function assertAccessible(page) {
  if (!process.env.AXE_PATH) return;
  await page.addScriptTag({ path: process.env.AXE_PATH });
  const violations = await page.evaluate(async () => (await axe.run('.site-header', {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
  })).violations.map(issue => ({ id: issue.id, impact: issue.impact })));
  assert.deepEqual(violations, [], 'Header accessibility violations');
  report.accessibilityChecks++;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  let page;
  try {
    page = await browser.newPage();
    page.on('pageerror', error => { throw error; });
    const coverage = await browser.newPage();
    const destinations = new Set(expectedPrimaryRoutes.map(route => new URL(route.replace(/^\//, ''), base).pathname));
    for (const route of Object.keys(indexes)) {
      await coverage.goto(new URL(route.replace(/^\//, ''), base).href);
      for (const href of await coverage.locator('main .index-navigation a').evaluateAll(links => links.map(a => new URL(a.href).pathname))) destinations.add(href);
    }
    for (const route of Object.values(indexes).flatMap(index => index.links.map(link => link.url))) assert(destinations.has(new URL(route.replace(/^\//, ''), base).pathname), `Canonical destination coverage: ${route}`);
    report.destinationCoverage = destinations.size;
    report.activeSectionChecks = 0;
    for (const width of [1440, 375]) {
      await coverage.setViewportSize({ width, height: 900 });
      for (const [route, section] of [['/hardware/morello/', '/build/'], ['/guides/install-a-toolchain/', '/build/'], ['/software/cheribsd/', '/build/'], ['/case-studies/morello/', '/adopt/'], ['/people/adam-finney/', '/alliance/'], ['/organisations/codasip/', '/alliance/'], ['/academic-papers/cheri-concentrate-practical-compressed-capabilities/', '/discover/'], ['/news/ai-has-compressed-the-attack-timeline/', '/news-and-events/'], ['/news-and-events/people-and-opportunities/speakers/', '/news-and-events/'], ['/adopt/assurance-and-adoption/cheri-enabled-products/', '/adopt/']]) {
        await coverage.goto(new URL(route.replace(/^\//, ''), base).href);
        assert.equal(await coverage.locator('.primary-menu > .current-section').count(), 1, 'One conceptual active section');
        const current = coverage.locator('.primary-menu:has(> .current-section) > .primary-menu-panel > .section-link');
        assert.equal(await current.getAttribute('aria-current'), 'true');
        assert.equal(await current.getAttribute('href'), new URL(section.replace(/^\//, ''), base).pathname);
        report.activeSectionChecks++;
      }
    }
    await coverage.close();
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal((await page.goto(base)).status(), 200);
      const desktop = width >= 1024;
      const toggle = page.locator('#navigation-toggle');
      const navigation = page.locator('#primary-navigation');
      const menus = page.locator('.primary-menu');
      assert.equal(await menus.count(), 5);
      assert.equal(await page.locator('.source-nav a').count(), expectedMenuLinks, 'Primary menu must match the complete configured hierarchy');
      assert.deepEqual(await page.locator('.source-nav a').evaluateAll(links => links.map(a => new URL(a.href).pathname)), expectedPrimaryRoutes.map(route => new URL(route.replace(/^\//, ''), base).pathname));
      assert.equal(await page.locator('.collection-footer').count(), 0, 'No redundant shortcut band');
      assert.equal(await page.locator('.site-header a[href$="/checks/"], .site-footer a[href$="/checks/"]').count(), 0, 'No editorial utility in visitor navigation');
      assert.equal(await page.locator('.site-header .brand img').getAttribute('alt'), 'CHERI Alliance');
      const socialLinks = page.locator('.footer-utilities a');
      assert.deepEqual(await socialLinks.allTextContents(), expectedSocial.map(link => link.title));
      for (let social = 0; social < expectedSocial.length; social++) {
        const link = socialLinks.nth(social);
        assert.equal(await link.getAttribute('href'), expectedSocial[social].url);
        await link.scrollIntoViewIfNeeded();
        const icon = link.locator('img');
        await icon.evaluate(img => img.decode());
        assert.equal(await icon.evaluate(img => img.naturalWidth > 0 && img.getBoundingClientRect().width === 24 && img.getBoundingClientRect().height === 24), true, 'Social icon loads at its intended size');
        assert.equal(await link.evaluate(a => a.getBoundingClientRect().height >= 44 && a.getBoundingClientRect().width >= 44), true, 'Social touch target');
        assert.equal(new URL(await icon.getAttribute('src'), base).pathname.startsWith(new URL(base).pathname), true, 'Social icons respect the deployment base URL');
      }
      await page.evaluate(() => scrollTo(0, 0));
      const footerRoutes = await page.locator('.footer-navigation a').evaluateAll(links => links.map(link => new URL(link.href).pathname));
      assert.equal(new Set(footerRoutes).size, footerRoutes.length, 'Footer destinations appear once');
      for (const collection of audit.collections) assert(footerRoutes.includes(new URL(collection.url.replace(/^\//, ''), base).pathname), `Directory remains reachable: ${collection.url}`);
      assert.equal(await toggle.isVisible(), !desktop);
      assert.equal(await navigation.isVisible(), desktop);
      if (!desktop) {
        await toggle.click();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      }
      await assertAccessible(page);
      const mainTop = await page.locator('main').evaluate(element => element.getBoundingClientRect().top);
      for (let index = 0; index < await menus.count(); index++) {
        await page.evaluate(() => scrollTo(0, 0));
        const menu = menus.nth(index);
        await menu.locator(':scope > summary').click();
        assert.equal(await page.locator('.primary-menu[open]').count(), 1, 'More than one primary menu is open');
        const panel = menu.locator('.primary-menu-panel');
        await panel.waitFor({ state: 'visible' });
        assert.deepEqual(await panel.locator('.menu-group-label').allTextContents(), primarySource[index].groups.map(group => group.title), 'Every category heading is preserved');
        assert.equal(await panel.locator('.menu-group-label').evaluateAll(headings => headings.every(heading => {
          const style = getComputedStyle(heading);
          return heading.getClientRects().length > 0 && style.visibility === 'visible' && parseFloat(style.fontSize) >= 16 && Number(style.fontWeight) >= 600;
        })), true, 'Category headings remain visible and prominent at every viewport');
        if (desktop) {
          assert.equal(await page.locator('main').evaluate(element => element.getBoundingClientRect().top), mainTop, 'Desktop menu moved article content');
          const groups = panel.locator('.menu-groups');
          const columns = await groups.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
          assert.equal(columns, await groups.locator(':scope > li').count(), 'Menu groups are not separate columns');
          assert.equal(await panel.locator('details').count(), 0, 'No unnecessary nested disclosure level');
          const last = panel.locator('a').last();
          await last.scrollIntoViewIfNeeded();
          const rect = await last.boundingBox();
          assert(rect.y >= 0 && rect.y + rect.height <= 900, 'Last link is inaccessible in a long menu');
        } else {
          assert.equal(await panel.locator('.menu-group a').first().isVisible(), true, 'Second-level links available immediately');
          assert.equal(await panel.locator('details').count(), 0, 'Mobile needs no third disclosure level');
        }
        await assertContained(page, desktop);
        report.panelsChecked++;
        if (index === 2 || index === 3) {
          await page.evaluate(() => scrollTo(0, 0));
          await page.screenshot({ path: path.join(reportDir, `${index === 2 ? 'build' : 'alliance'}-menu-${width}.png`) });
          await assertAccessible(page);
        }
        await menu.locator(':scope > summary').click();
      }
      if (!desktop) {
        await toggle.click();
        assert.equal(await navigation.isVisible(), false);
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      }
      console.log(`${width}px: all five menus, routes, groups and containment passed.`);
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(base);
    const summaries = page.locator('.primary-menu > summary');
    await summaries.first().focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('.primary-menu[open]').count(), 1);
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.locator('.primary-menu[open] .section-link').first().evaluate(element => element === document.activeElement), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.primary-menu[open]').count(), 0);
    assert.equal(await summaries.first().evaluate(element => element === document.activeElement), true);
    await page.keyboard.press('ArrowRight');
    assert.equal(await summaries.nth(1).evaluate(element => element === document.activeElement), true);
    await page.keyboard.press('Space');
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.primary-menu[open] .section-link').first().evaluate(element => element === document.activeElement), true);
    await page.keyboard.press('Escape');
    await page.keyboard.press('End');
    assert.equal(await summaries.last().evaluate(element => element === document.activeElement), true);
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowUp');
    assert.equal(await page.locator('.primary-menu[open] a').last().evaluate(element => element === document.activeElement), true);
    await page.mouse.click(1, 899);
    assert.equal(await page.locator('.primary-menu[open]').count(), 0, 'Outside click did not close the menu');
    await summaries.first().click();
    await page.locator('main a').first().focus();
    assert.equal(await page.locator('.primary-menu[open]').count(), 0, 'Focus leaving the header did not close the menu');

    // Long menus must scroll within short desktop viewports.
    await page.setViewportSize({ width: 1024, height: 320 });
    await page.evaluate(() => scrollTo(0, 0));
    await summaries.nth(2).click();
    await assertContained(page, true);
    await page.locator('.primary-menu[open] a').last().scrollIntoViewIfNeeded();
    const lastRect = await page.locator('.primary-menu[open] a').last().boundingBox();
    assert(lastRect.y >= 0 && lastRect.y + lastRect.height <= 320);

    // Breakpoint changes close hidden disclosures and keep focus visible.
    await page.locator('.primary-menu[open] a').first().focus();
    await page.setViewportSize({ width: 375, height: 812 });
    await page.locator('#navigation-toggle').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#navigation-toggle').evaluate(element => element === document.activeElement), true);
    assert.equal(await page.locator('.primary-menu[open]').count(), 0);
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab'); // Overview link.
    await page.keyboard.press('Tab'); // First second-level destination.
    assert.equal(await page.locator('.primary-menu[open] .menu-group a').first().evaluate(element => element === document.activeElement), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.primary-menu[open]').count(), 0);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#primary-navigation').isVisible(), false);
    assert.equal(await page.locator('#navigation-toggle').evaluate(element => element === document.activeElement), true);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.locator('#primary-navigation').waitFor({ state: 'visible' });
    assert.equal(await summaries.first().evaluate(element => element === document.activeElement), true);

    // Real touch controls and reduced motion need no hover or animations.
    const touch = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const mobile = await touch.newPage();
    await mobile.goto(base);
    await mobile.locator('#navigation-toggle').tap();
    await mobile.locator('.primary-menu > summary').first().tap();
    await assertContained(mobile, false);
    const destination = await mobile.locator('.primary-menu[open] .menu-group a').first().getAttribute('href');
    await mobile.locator('.primary-menu[open] .menu-group a').first().tap();
    await mobile.waitForURL(new URL(destination, base).href);
    assert.equal(await mobile.locator('#primary-navigation').isVisible(), false);
    await touch.close();

    for (const width of [1440, 375]) {
      const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
      const fallback = await context.newPage();
      await fallback.goto(base);
      assert.equal(await fallback.locator('#navigation-toggle').isVisible(), false);
      assert.equal(await fallback.locator('#primary-navigation').isVisible(), true);
      await fallback.locator('.primary-menu > summary').first().click();
      assert.equal(await fallback.locator('.primary-menu[open] .menu-group a').first().isVisible(), true);
      await assertContained(fallback, width >= 1024);
      await context.close();
    }
    const delayed = await browser.newPage({ viewport: { width: 375, height: 900 } });
    let releaseNavigation;
    const navigationGate = new Promise(resolve => { releaseNavigation = resolve; });
    await delayed.route('**/navigation.js', async route => { await navigationGate; await route.continue(); });
    await delayed.goto(base, { waitUntil: 'commit' });
    await delayed.locator('#navigation-toggle').waitFor({ state: 'visible' });
    await delayed.locator('main').waitFor({ state: 'visible' });
    // FontFaceSet.ready can wait for document load in older Chromium. The
    // navigation request is intentionally held here, so load only these fonts.
    await delayed.evaluate(() => Promise.all([document.fonts.load('400 16px Poppins'), document.fonts.load('600 16px Poppins')]));
    const reservedFrame = await delayed.locator('main').boundingBox();
    releaseNavigation();
    await delayed.waitForLoadState('load');
    assert(Math.abs(reservedFrame.y - (await delayed.locator('main').boundingBox()).y) < 1, 'Deferred mobile navigation does not shift the content');
    await delayed.close();
    const unavailable = await browser.newPage({ viewport: { width: 375, height: 900 } });
    await unavailable.route('**/navigation.js', route => route.abort());
    await unavailable.goto(base);
    assert.equal(await unavailable.locator('#navigation-toggle').isVisible(), false, 'Failed enhancement hides its inert control');
    assert.equal(await unavailable.locator('#primary-navigation').isVisible(), true, 'Failed enhancement retains native navigation');
    await unavailable.locator('.primary-menu > summary').first().focus();
    await unavailable.keyboard.press('Enter');
    assert.equal(await unavailable.locator('.primary-menu[open] .menu-group a').first().isVisible(), true);
    await unavailable.close();
    report.loading = 'Stable deferred mobile frame and native navigation after script failure';
    report.behavior = 'Native disclosures, Enter/Space, Tab, arrow keys, Escape/focus return, outside click, focus exit, breakpoint changes, short viewports, touch, links, reduced motion and no-JS passed';
    fs.writeFileSync(path.join(reportDir, 'results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(report.behavior);
  } catch (error) {
    if (page) await page.screenshot({ path: path.join(reportDir, 'failure.png'), fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
