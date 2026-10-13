// Browser-only tooling; the published menu uses native HTML and vanilla JS.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const base = process.env.SITE_URL || 'http://127.0.0.1:4000/';
const reportDir = path.resolve('reports/navigation-tests');
fs.mkdirSync(reportDir, { recursive: true });
const widths = [1440, 1024, 768, 640, 375];
const report = { widths, panelsChecked: 0, accessibilityChecks: 0 };

async function assertContained(page, desktop) {
  const problems = await page.evaluate(isDesktop => {
    const errors = [];
    if (document.documentElement.scrollWidth > innerWidth + 1) errors.push('Horizontal overflow');
    for (const element of document.querySelectorAll('.primary-menu[open] > .primary-menu-panel')) {
      const rect = element.getBoundingClientRect();
      if (rect.left < 0 || rect.right > innerWidth + 1) errors.push('Menu escapes the page');
      if (isDesktop && (rect.top < 0 || rect.bottom > innerHeight + 1)) errors.push('Menu escapes the viewport');
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
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
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
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal((await page.goto(base)).status(), 200);
      const desktop = width >= 1024;
      const toggle = page.locator('#navigation-toggle');
      const navigation = page.locator('#primary-navigation');
      const menus = page.locator('.primary-menu');
      assert.equal(await menus.count(), 5);
      assert.equal(await page.locator('.source-nav a').count(), 96, 'Existing primary routes were lost');
      assert.equal(await page.locator('.collection-nav a').count(), 10);
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
        if (desktop) {
          assert.equal(await page.locator('main').evaluate(element => element.getBoundingClientRect().top), mainTop, 'Desktop menu moved article content');
          const groups = panel.locator('.menu-groups');
          const columns = await groups.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
          assert.equal(columns, await groups.locator(':scope > li').count(), 'Menu groups are not separate columns');
          assert.equal(await panel.locator('.menu-group-disclosure > summary:visible').count(), 0);
          const last = panel.locator('a').last();
          await last.scrollIntoViewIfNeeded();
          const rect = await last.boundingBox();
          assert(rect.y >= 0 && rect.y + rect.height <= 900, 'Last link is inaccessible in a long menu');
        } else {
          const group = panel.locator('.menu-group-disclosure').first();
          assert.equal(await group.locator('a').first().isVisible(), false);
          await group.locator(':scope > summary').click();
          assert.equal(await group.locator('a').first().isVisible(), true);
        }
        await assertContained(page, desktop);
        report.panelsChecked++;
        if (index === 2) {
          await page.evaluate(() => scrollTo(0, 0));
          await page.screenshot({ path: path.join(reportDir, `build-menu-${width}.png`) });
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
    await page.keyboard.press('Tab'); // First mobile group disclosure.
    assert.equal(await page.locator('.primary-menu[open] .menu-group-disclosure > summary').first().evaluate(element => element === document.activeElement), true);
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.primary-menu[open] .menu-group-disclosure').first().locator('a').first().evaluate(element => element === document.activeElement), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.primary-menu[open] .menu-group-disclosure').first().getAttribute('open'), null);
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
    await mobile.locator('.primary-menu[open] .menu-group-disclosure > summary').first().tap();
    await assertContained(mobile, false);
    const destination = await mobile.locator('.primary-menu[open] .menu-group-disclosure a').first().getAttribute('href');
    await mobile.locator('.primary-menu[open] .menu-group-disclosure a').first().tap();
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
      assert.equal(await fallback.locator('.primary-menu[open] .menu-group-disclosure a').first().isVisible(), true);
      await assertContained(fallback, width >= 1024);
      await context.close();
    }
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
