// Progressive directories preserve every source record and native card link.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = process.env.SITE_URL || 'http://127.0.0.1:4000/';
const url = route => new URL(route.replace(/^\//, ''), base).href;
const output = path.resolve(process.env.REPORT_ROOT || 'reports', 'directory-tests');
const source = JSON.parse(fs.readFileSync('reports/preflight.json', 'utf8'));
const ordering = JSON.parse(fs.readFileSync('_data/collection_order.json', 'utf8'));
const board = fs.readFileSync('_data/governing-board.yml', 'utf8').split('\n').filter(line => line.startsWith('- ')).map(line => line.slice(2));
const today = new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/London'}).format(new Date(source.generated_at));
const eventPeriod = record => { const p = record.properties; const final = p.end_datetime || p.end_date || p.start_datetime || p.start_date; const exact = p.end_datetime || (!p.end_date && p.start_datetime); return exact ? Date.parse(final) >= Date.parse(source.generated_at) ? 'upcoming' : 'past' : final.slice(0,10) >= today ? 'upcoming' : 'past'; };
const routes = ['/people/', '/organisations/', '/news/', '/events/', '/academic-papers/', '/hardware/', '/software/', '/guides/', '/reports/', '/working-groups/', '/policies/', '/case-studies/'];
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = { widths: [1920, 1440, 1024, 768, 640, 375, 320], layouts: 0, accessibility: 0, functionality: 0, noJavaScript: 0, defaultOrdering: 0, curatedOrdering: 0 };
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
        const expectedOrder = collection === 'events' ? [
          ...ordering.collections.events.filter(route => records.some(record => record.url === route && eventPeriod(record) === 'upcoming')),
          ...ordering.event_archive.filter(route => records.some(record => record.url === route && eventPeriod(record) === 'past')),
        ] : ordering.collections[collection];
        assert.deepEqual(await listing.locator('.card').evaluateAll(cards => cards.map(card => card.dataset.recordUrl)), expectedOrder, `${collection} default source order`);
        report.defaultOrdering++;

        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${route} ${width}`);
        assert.equal(await listing.locator('input[type=search], input[name=q]').count(), 0, 'No embedded search on directory indexes');
        const breadcrumbs = page.getByRole('navigation', {name: 'Breadcrumb', exact: true});
        assert.equal(await breadcrumbs.count(), 1, 'One shared breadcrumb trail');
        assert.equal(await breadcrumbs.locator('a').first().getAttribute('href'), new URL(base).pathname, 'Home respects the baseurl');
        assert.equal((await breadcrumbs.locator('[aria-current=page]').innerText()).trim(), (await page.locator('main h1').innerText()).trim());
        const geometry = await listing.evaluate(element => {
          const grid = element.querySelector('.cards');
          const card = grid.querySelector('.card');
          return {width: grid.getBoundingClientRect().width, frame: document.querySelector('main').getBoundingClientRect().width, columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length, card: card?.getBoundingClientRect().width};
        });
        assert(Math.abs(geometry.width - geometry.frame) < 1, 'Directory grid fills the shared frame');
        assert.equal(geometry.columns, width <= 640 ? 1 : collection === 'academic-papers' || collection === 'reports' || width < 1024 ? 2 : 3, 'Responsive card columns');
        const sort = listing.getByLabel('Sort by');
        await sort.selectOption('title-desc');
        const titles = await listing.locator('.card h3, .card h4').allTextContents();
        // Event groups remain separate; every other directory sorts as one grid.
        if (collection !== 'events') {
          const names = titles.map(title => title.trim());
          assert.deepEqual(names, [...names].sort(new Intl.Collator('en-GB', {sensitivity: 'base', numeric: true}).compare).reverse());
        }
        await listing.getByRole('button', {name: 'Reset', exact: true}).click();
        assert.equal(await listing.locator('[data-directory-item]:visible').count(), records.length);
        assert.equal(await sort.evaluate(input => document.activeElement === input), true, 'Reset returns focus to sorting');
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
    await page.goto(url('/people/?q=retired-directory-query'));
    assert.equal(await page.locator('[data-directory-item]:visible').count(), ordering.collections.people.length, 'Retired query parameters cannot invisibly hide records');
    assert.equal(new URL(page.url()).searchParams.has('q'), false);
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
    const pastYear = source.records.find(record => record.collection === 'events' && eventPeriod(record) === 'past')?.properties.start_date?.slice(0, 4);
    if (pastYear) {
      await page.getByRole('button', {name: 'Reset', exact: true}).click();
      await page.getByLabel('Source year').selectOption(pastYear);
      await page.getByLabel('Event period').selectOption('upcoming');
      assert.equal(await page.locator('.directory-empty').isVisible(), true, 'Empty facet combination has a clear state');
      await page.getByRole('button', {name: 'Reset', exact: true}).click();
      assert.equal(await page.locator('.directory-empty').isVisible(), false);
      report.functionality++;
    }
    const plain = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
    for (const route of routes) {
      await plain.goto(url(route));
      assert.equal(await plain.locator('.directory-controls').isVisible(), false);
      const collection = await plain.locator('.listing').getAttribute('data-listing');
      assert.equal(await plain.locator('.listing .card:visible').count(), source.records.filter(record => record.collection === collection && !record.alternate).length);
      report.noJavaScript++;
      const all = source.records.filter(record => record.collection === collection && !record.alternate);
      const expected = collection === 'events' ? [...ordering.collections.events.filter(route => all.some(record => record.url === route && eventPeriod(record) === 'upcoming')), ...ordering.event_archive.filter(route => all.some(record => record.url === route && eventPeriod(record) === 'past'))] : ordering.collections[collection];
      assert.deepEqual(await plain.locator('.listing .card').evaluateAll(cards => cards.map(card => card.dataset.recordUrl)), expected, 'Static defaults match enhanced defaults');
      report.defaultOrdering++;

    }
    for (const [route, expected] of [
      ['/alliance/leadership/governing-board/', board.map(slug => `/people/${slug}/`)],
      ['/news-and-events/people-and-opportunities/speakers/', ordering.collections.people.filter(route => source.records.some(r => r.url === route && r.properties.is_speaker))],
      ['/alliance/leadership/members/', ordering.collections.organisations.filter(route => source.records.some(r => r.url === route && r.properties.membership_tier))],
    ]) {
      for (const target of [plain, page]) {
        await target.goto(url(route));
        assert.deepEqual(await target.locator('.listing .card').evaluateAll(cards => cards.map(card => card.dataset.recordUrl)), expected, `Purposeful order: ${route}`);
        report.curatedOrdering++;
      }
    }
    // The real source-backed controls reserve the list's position before JS.
    const delayed = await browser.newPage({viewport: {width: 375, height: 900}});
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await delayed.route('**/directories.js', async route => { await gate; await route.continue(); });
    await delayed.goto(url('/people/'), {waitUntil: 'commit'});
    await delayed.locator('.directory-controls').waitFor({state: 'visible'});
    await delayed.locator('.listing .cards').waitFor({state: 'visible'});
    await delayed.evaluate(() => Promise.all([document.fonts.load('400 16px Poppins'), document.fonts.load('600 16px Poppins')]));
    assert.equal(await delayed.locator('.directory-controls fieldset').evaluate(fieldset => fieldset.disabled), true);
    assert.equal(await delayed.getByLabel('Sort by').isDisabled(), true);
    const reserved = await delayed.locator('.listing .cards').boundingBox();
    release();
    await delayed.waitForLoadState('load');
    const enhanced = await delayed.locator('.listing .cards').boundingBox();
    assert(Math.abs(reserved.y - enhanced.y) < 1, 'Directory enhancement must not shift the list');
    assert.equal(await delayed.getByLabel('Sort by').isDisabled(), false);
    await delayed.close();
    const unavailable = await browser.newPage({viewport: {width: 375, height: 900}});
    await unavailable.route('**/directories.js', route => route.abort());
    await unavailable.goto(url('/people/'));
    assert.equal(await unavailable.locator('.directory-controls').isVisible(), false);
    assert.equal(await unavailable.locator('.listing .card:visible').count(), ordering.collections.people.length, 'Failed enhancement keeps every native record');
    await unavailable.close();
    report.loading = 'Stable deferred controls and complete fallback after script failure';
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
