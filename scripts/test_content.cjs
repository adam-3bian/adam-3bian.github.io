// Browser regressions for directories, semantic properties and consolidated routes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = new URL(process.env.SITE_URL || 'http://127.0.0.1:4000/');
const url = route => new URL(route.replace(/^\//, ''), base).href;
const reportDir = path.join(process.env.REPORT_ROOT || 'reports', 'content-tests');
fs.mkdirSync(reportDir, { recursive: true });
const report = { widths: [1440, 1024, 768, 640, 375], layoutChecks: 0, accessibilityChecks: 0, redirects: 0, indexChecks: 0, noScriptIndexes: 0, footerChecks: 0, footerAccessibilityChecks: 0, noScriptCards: 0, noScriptRelatedLinks: 0, noScriptFooter: 0 };
const preflight = JSON.parse(fs.readFileSync('reports/preflight.json', 'utf8'));
const indexes = JSON.parse(fs.readFileSync('reports/index-navigation.json', 'utf8'));
const footer = JSON.parse(fs.readFileSync('reports/footer-navigation.json', 'utf8'));
const logoMasks = JSON.parse(fs.readFileSync('_data/organisation-logos.json', 'utf8'));
const cardRoutes = ['/people/', '/organisations/', '/news/', '/events/', '/academic-papers/', '/hardware/', '/software/', '/guides/', '/policies/', '/case-studies/', '/reports/', '/checks/', '/working-groups/', '/alliance/leadership/governing-board/', '/adopt/assurance-and-adoption/cheri-enabled-products/'];
const groups = preflight.records.filter(r => r.collection === 'working-groups' && !r.alternate).map(r => r.url).sort();
const board = fs.readFileSync('_data/governing-board.yml', 'utf8').split('\n').filter(l => l.startsWith('- ')).map(l => `/people/${l.slice(2)}/`);
const routes = [
  '/policies/competition-law-statement/',
  '/policies/intellectual-property-policy/',
  '/policies/trademark-policy/',
  '/academic-papers/',
  '/policies/',
  '/organisations/cheri-alliance/',
  '/people/adam-finney/',
  '/people/alex-richardson/',
  '/people/allison-randal/',
  '/people/andrew-lindsay/',
  '/news/ai-has-compressed-the-attack-timeline/',
  '/events/cheri-blossoms-conference-2026/',
  '/academic-papers/it-is-time-to-standardize-principles-and-practices-for-software-memory-safety/',
  '/hardware/x730/',
  '/software/cheri-linux/',
  '/working-groups/cheri-linux-working-group/',
  '/guides/install-a-toolchain/',
  '/discover/why-cheri/cheri-and-rust/',
  '/working-groups/',
  '/alliance/leadership/governing-board/',
  '/news-and-events/events-and-archive/past-events/',
  '/news-and-events/events-and-archive/upcoming-events/',
  '/alliance/leadership/members/',
  '/news-and-events/people-and-opportunities/speakers/',
  '/organisations/3bian/',
  '/news/secure-and-resilient-systems-in-the-era-of-cra-and-iot/',
  '/reports/',
  '/case-studies/',
  '/case-studies/morello/',
  '/case-studies/cheribsd/',
  '/case-studies/cheriot/',
  '/case-studies/codasip-x730/',
  '/reports/an-introduction-to-cheri/',
  '/events/embedded-world-2026/',
  '/discover/understand/how-does-cheri-work/',
  '/checks/',
  ...cardRoutes,
  ...Object.keys(indexes),
].filter((route, index, all) => all.indexOf(route) === index);

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    for (const width of report.widths) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await page.goto(url(route));
        const problems = await page.evaluate(() => {
          const errors = [];
          if (document.documentElement.scrollWidth > innerWidth + 1) errors.push('Horizontal overflow');
          const footer = document.querySelector('.site-footer');
          if (!footer || footer.querySelector('div, span, details, summary')) errors.push('Footer semantics or hidden links');
          for (const link of document.querySelectorAll('.site-footer a, .link-grid a')) {
            const rect = link.getBoundingClientRect();
            if (rect.height < 44 || rect.left < 0 || rect.right > innerWidth) errors.push('Footer or related link touch target/containment');
            if (link.closest('.link-grid')) {
              const row = link.parentElement.getBoundingClientRect();
              if (Math.abs(rect.width - row.width) > 1 || Math.abs(rect.height - row.height) > 1) errors.push('Related-link row is not fully clickable');
            }
          }
          if (document.querySelector('.relationships small, .relationships div, .relationships span')) errors.push('Technical labels or wrappers in related content');
          for (const panel of document.querySelectorAll('.metadata')) {
            if (!panel.textContent.trim() || panel.textContent.trim() === 'Placeholder image') errors.push('Empty metadata');
            if (!panel.querySelector('dl > dt')) errors.push('Metadata without facts');
            if (panel.querySelector('table, div, span') || panel.querySelector('h2')?.textContent !== 'At a glance') errors.push('Record summary is not reader-facing');
          }
          if (document.querySelector('article .inspector, article .front-matter-json, .lead-image[src$="placeholder.svg"]')) errors.push('Authoring data or empty image fallback on a public record');
          for (const logo of document.querySelectorAll('img.image-logo')) {
            const background = getComputedStyle(logo).backgroundColor;
            if (logo.dataset.imageBackground === 'dark') {
              if (background !== getComputedStyle(document.documentElement).color) errors.push('Light logo artwork lacks its contrast frame');
            } else if (background !== 'rgba(0, 0, 0, 0)') errors.push('Unnecessary logo display background');
          }
          for (const nav of document.querySelectorAll('.resource-links')) {
            if (nav.tagName !== 'NAV' || !nav.querySelector('ul > li > a')) errors.push('Resource links lack navigation/list semantics');
            if (/Original image|Placeholder image/.test(nav.textContent)) errors.push('Unnecessary image download');
            for (const link of nav.querySelectorAll('a')) {
              const rect = link.getBoundingClientRect();
              if (rect.height < 44 || rect.left < 0 || rect.right > innerWidth) errors.push('Resource link touch target or containment');
            }
          }
          for (const value of document.querySelectorAll('.metadata dd, .organisation-details dd, .record-properties dd')) {
            const rect = value.getBoundingClientRect();
            const style = getComputedStyle(value);
            if (style.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(style.borderBottomWidth) !== 0) errors.push('Property value still styled as a table cell');
            if (rect.left < 0 || rect.right > innerWidth || value.scrollWidth > value.clientWidth + 1) errors.push('Metadata value overflows');
            const label = value.previousElementSibling;
            const labelRect = label.getBoundingClientRect();
            if (label.tagName !== 'DT') errors.push('Unpaired property label');
            if (innerWidth <= 640 && labelRect.bottom > rect.top + 1) errors.push('Mobile property does not stack');
            if (innerWidth > 640 && Math.abs(labelRect.top - rect.top) > 1) errors.push('Desktop property row does not align');
          }
          for (const listing of document.querySelectorAll('.cards')) {
            const cards = [...listing.querySelectorAll('.card')];
            const destinations = cards.map(c => c.href);
            if (new Set(destinations).size !== destinations.length) errors.push('Repeated directory cards');
            for (const card of cards) {
              const rect = card.getBoundingClientRect();
              const item = card.parentElement.getBoundingClientRect();
              if (card.tagName !== 'A' || Math.abs(rect.width - item.width) > 1 || Math.abs(rect.height - item.height) > 1) errors.push('Card does not have a full-area native link');
              if (rect.left < 0 || rect.right > innerWidth || card.scrollWidth > card.clientWidth + 1) errors.push('Card overflows');
              if (card.parentElement.tagName !== 'LI' || card.parentElement.parentElement.tagName !== 'UL') errors.push('Cards lack list semantics');
              if (card.querySelector('div, span, a, button, img[src$="placeholder.svg"]')) errors.push('Unnecessary or interactive card content');
            }
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
        const footerLinks = await page.locator('.footer-navigation a').evaluateAll(links => links.map(link => ({ title: [...link.childNodes].filter(n => n.nodeType === 3 || n.nodeType === 1 && n.getAttribute('aria-hidden') !== 'true').map(n => n.textContent).join('').trim(), href: link.href })));
        assert.deepEqual(footerLinks, footer.groups.flatMap(group => group.links).map(link => ({ title: link.title, href: url(link.url) })), 'Footer must preserve configured links');
        assert.deepEqual(await page.locator('.footer-group-label').allTextContents(), footer.groups.map(group => group.title));
        assert.deepEqual(await page.locator('.footer-utilities a').evaluateAll(links => links.map(link => ({ title: [...link.childNodes].filter(n => n.nodeType === 3 || n.nodeType === 1 && n.getAttribute('aria-hidden') !== 'true').map(n => n.textContent).join('').trim(), href: link.href }))), footer.utilities.map(link => ({ title: link.title, href: url(link.url) })));
        assert.equal(await page.locator('.footer-groups').evaluate(list => getComputedStyle(list).gridTemplateColumns.split(' ').length), width <= 640 ? 1 : width < 1024 ? 2 : 4, 'Footer column layout');
        report.footerChecks++;
        if (route === '/') await page.locator('.site-footer').screenshot({ path: path.join(reportDir, `footer-${width}.png`) });
        if (route === '/case-studies/') await page.locator('.relationships').screenshot({ path: path.join(reportDir, `related-links-${width}.png`) });
        if (['/case-studies/', '/reports/'].includes(route)) {
          const collection = route === '/case-studies/' ? 'case-studies' : 'reports';
          const targets = await page.locator('.listing .card').evaluateAll(cards => cards.map(card => card.dataset.recordUrl).sort());
          assert.deepEqual(targets, preflight.records.filter(record => record.collection === collection && !record.alternate).map(record => record.url).sort(), 'Complete new collection directory');
          await page.screenshot({ path: path.join(reportDir, `${collection}-directory-${width}.png`), fullPage: true });
        }
        if (route === '/events/embedded-world-2026/') {
          assert.equal(await page.locator('.metadata dt').first().textContent(), 'When');
          assert.deepEqual(await page.locator('.metadata time').evaluateAll(times => times.map(time => time.dateTime)), ['2026-03-10', '2026-03-12']);
          await page.screenshot({ path: path.join(reportDir, `event-details-${width}.png`), fullPage: true });
        }
        if (route === '/adopt/assurance-and-adoption/cheri-enabled-products/') {
          const targets = await page.locator('.listing .card').evaluateAll(cards => cards.map(card => card.dataset.recordUrl).sort());
          const certified = preflight.records.filter(record => record.collection === 'hardware' && record.properties.certification === 'cheri-enabled' && !record.alternate);
          assert(certified.length > 0, 'No certified hardware source records');
          assert.deepEqual(targets, certified.map(record => record.url).sort(), 'Certified directory must follow hardware front matter');
          assert.equal(await page.locator('.article-content > img, .article-content > p > img').count(), 0, 'Repeated certification logos');
          await page.screenshot({ path: path.join(reportDir, `certified-products-${width}.png`), fullPage: true });
        }
        if (route === '/checks/') {
          assert.equal(await page.locator('[data-audit-row]').count(), preflight.record_count);
          assert.equal(await page.locator('.cards .card').count(), preflight.collection_count);
          await page.screenshot({ path: path.join(reportDir, `audit-summary-${width}.png`) });
        }
        if (indexes[route]) {
          const expected = indexes[route];
          assert.equal(await page.locator('main h1').count(), 1, 'Index has one title');
          assert.equal(await page.locator('main h1').textContent(), expected.home?.title || expected.title);
          if (route === '/') {
            assert.equal(await page.locator('.hero-definition').textContent(), expected.summary);
            assert.equal(await page.locator('.home-purpose').textContent(), expected.title, 'Preserve the original introduction');
            assert.deepEqual(await page.locator('.home-hero .action-links a').evaluateAll(links => links.map(link => ({ title: [...link.childNodes].filter(n => n.nodeType === 3 || n.nodeType === 1 && n.getAttribute('aria-hidden') !== 'true').map(n => n.textContent).join('').trim(), href: link.href }))), [expected.home.primary, expected.home.secondary].map(link => ({ title: link.title, href: url(link.url) })), 'Homepage calls to action');
            assert.equal(await page.locator('.home-journeys > li').count(), expected.home.journeys.length, 'All source-backed audience pathways');
            assert.deepEqual(await page.locator('.home-page .cards .card').evaluateAll(links => links.map(link => link.href)), expected.home.examples.map(slug => url(`/case-studies/${slug}/`)), 'Verified canonical case studies');
            const newsDates = await page.locator('[data-featured="news"] time').evaluateAll(times => times.map(time => time.dateTime));
            assert.ok(newsDates.length > 0 && newsDates.every(date => /^\d{4}-\d{2}-\d{2}$/.test(date)), 'Only source-dated news is featured');
            assert.deepEqual(newsDates, [...newsDates].sort().reverse(), 'Recent news is newest first');
            assert.equal(await page.locator('main .metadata, main .relationships, main .inspector, main .front-matter-json').count(), 0, 'Homepage does not expose record or authoring panels');
          } else {
            assert.equal(await page.locator('.index-intro > p').textContent(), expected.landing.description);
            assert.deepEqual(await page.locator('.recommended-routes a').evaluateAll(links => links.map(a => a.href)), expected.landing.introductory_routes.map(url), 'Source-backed starting points');
            assert.deepEqual(await page.locator('.featured-resources a').evaluateAll(links => links.map(a => a.href)), expected.landing.featured_routes.map(url), 'Source-backed featured resources');
            assert.deepEqual(await page.locator('.learning-path a').evaluateAll(links => links.map(a => a.href)), (expected.landing.learning_routes || []).map(url), 'Developer progression');
            assert.equal(await page.locator('main .metadata, main .relationships, main .inspector, main .front-matter-json').count(), 0, 'Landing pages do not expose record or authoring panels');
          }
          const actual = await page.locator('main .index-navigation a').evaluateAll(links => links.map(link => ({ title: [...link.childNodes].filter(n => n.nodeType === 3 || n.nodeType === 1 && n.getAttribute('aria-hidden') !== 'true').map(n => n.textContent).join('').trim(), href: link.href })));
          assert.deepEqual(actual, expected.links.map(link => ({ title: link.title, href: url(link.url) })), 'Index must match the mega-menu labels and order');
          assert.deepEqual(await page.locator('.index-group-label').allTextContents(), expected.groups.map(group => group.title));
          const listProblems = await page.locator('main .index-navigation').evaluate(nav => [...nav.querySelectorAll('a')].flatMap(link => {
            const rect = link.getBoundingClientRect();
            return rect.left < 0 || rect.right > innerWidth || rect.height < 44 ? ['Index link containment or touch target'] : [];
          }));
          assert.deepEqual(listProblems, [], `${route} at ${width}px`);
          if (expected.groups.length) {
            const columns = await page.locator('.index-pages').evaluate(list => getComputedStyle(list).gridTemplateColumns.split(' ').length);
            assert.equal(columns, width <= 640 ? 1 : width < 1024 ? 2 : expected.columns, 'Responsive menu grouping');
          }
          report.indexChecks++;
          const name = route === '/' ? 'home' : route.replaceAll('/', '');
          await page.screenshot({ path: path.join(reportDir, `index-${name}-${width}.png`), fullPage: true });
        }
        if (route === '/working-groups/') {
          const targets = await page.locator('.listing .card').evaluateAll(cards => cards.map(c => c.dataset.recordUrl));
          assert.deepEqual(targets.sort(), groups, 'Complete working-group directory');
          assert.equal(await page.locator('.listing img').count(), 0, 'Repeated generic group image');
          assert.equal(await page.locator('.listing .card-description').count(), groups.length);
          await page.screenshot({ path: path.join(reportDir, `working-groups-${width}.png`), fullPage: true });
        }
        if (route === '/alliance/leadership/governing-board/') {
          const targets = await page.locator('.listing .card').evaluateAll(cards => cards.map(c => c.dataset.recordUrl));
          assert.deepEqual(targets, board, 'Board cards must match the ordered roster');
          assert.equal(await page.locator('.listing img.image-portrait').count(), board.length);
          assert.equal(await page.locator('.image-gallery').count(), 0, 'Duplicated static board gallery');
          await page.screenshot({ path: path.join(reportDir, `governing-board-${width}.png`), fullPage: true });
        }
        if (route === '/news-and-events/events-and-archive/past-events/') {
          assert.equal(await page.locator('#event-archive').count(), 0, 'Repeated Markdown archive heading');
          const dates = await page.locator('.listing .card time').evaluateAll(nodes => nodes.map(n => n.dateTime));
          assert.deepEqual(dates, [...dates].sort().reverse(), 'Past events must be newest first');
          await page.screenshot({ path: path.join(reportDir, `past-events-${width}.png`), fullPage: true });
        }
        if (route === '/organisations/3bian/') {
          assert.equal(await page.locator('main a').filter({ hasText: /^Source$/ }).count(), 0, 'Import citation label');
        }
        if (route === '/organisations/cheri-alliance/') {
          assert.equal(await page.locator('main h1').count(), 1, 'Duplicate Alliance page heading');
          assert.equal((await page.locator('.article-content').innerText()).includes('|'), false, 'Broken administrative table is visible');
          assert.deepEqual(await page.locator('.resource-links a').allTextContents(), ['Visit website', 'LinkedIn']);
          assert.equal(await page.locator('.metadata').count(), 0, 'Link-only page still has a metadata container');
          await page.screenshot({ path: path.join(reportDir, `cheri-alliance-${width}.png`), fullPage: true });
        }
        if (route === '/academic-papers/it-is-time-to-standardize-principles-and-practices-for-software-memory-safety/') {
          await page.screenshot({ path: path.join(reportDir, `paper-metadata-${width}.png`) });
        }
        if (route === '/policies/competition-law-statement/') {
          assert.equal(await page.locator('.clause-number').count(), 28);
          assert.equal(await page.locator('.metadata time').textContent(), 'August 2024');
          assert.equal(await page.locator('.metadata time').getAttribute('datetime'), '2024-08');
          await page.screenshot({ path: path.join(reportDir, `competition-law-${width}.png`), fullPage: true });
        }
        if (width === 1440 && process.env.AXE_PATH) {
          await page.addScriptTag({ path: process.env.AXE_PATH });
          const violations = await page.evaluate(async () => (await axe.run(['main', '.site-footer'], {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
          })).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })));
          assert.deepEqual(violations, [], route);
          report.accessibilityChecks++;
          report.footerAccessibilityChecks++;
        }
      }
    }
    // Review all verified source logos at their actual detail-page size.
    for (const record of preflight.records.filter(record => record.collection === 'organisations' && record.properties.image_source)) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(url(record.url));
      await page.locator('.lead-image').evaluate(image => image.decode());
      await page.locator('.record-header').screenshot({ path: path.join(reportDir, `source-logo-${record.url.split('/')[2]}.png`) });
      if (record.properties.image_background === 'dark') {
        assert.equal(await page.locator('.lead-image').getAttribute('data-image-background'), 'dark');
        await page.goto(url('/organisations/'));
        const darkCard = page.locator(`.card[data-record-url="${record.url}"]`);
        assert.equal(await darkCard.locator('img').getAttribute('data-image-background'), 'dark');
        await darkCard.screenshot({ path: path.join(reportDir, 'light-artwork-card.png') });
      }
    }
    // Verify actual rendered transparency and original pixels, including the
    // intentionally white S and cream seal interior that must remain visible.
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const logo of logoMasks) {
      await page.goto(url(`/organisations/${logo.slug}/`));
      const problems = await page.locator('.lead-image.image-logo').evaluate(async (displayed, config) => {
        await displayed.decode();
        const original = new Image(); original.src = config.sourceURL; await original.decode();
        const canvas = document.createElement('canvas'); canvas.width = original.naturalWidth; canvas.height = original.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(original, 0, 0); const before = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(displayed, 0, 0, canvas.width, canvas.height);
        const after = ctx.getImageData(0, 0, canvas.width, canvas.height).data; const errors = [];
        for (const [x, y] of [[0,0],[canvas.width-1,0],[0,canvas.height-1],[canvas.width-1,canvas.height-1]]) {
          if (after[(y * canvas.width + x) * 4 + 3] !== 0) errors.push('Canvas background remains opaque');
        }
        let checked = 0;
        for (let y = Math.floor(canvas.height * .15); y < canvas.height * .85; y += Math.max(1, Math.floor(canvas.height / 24))) {
          for (let x = Math.floor(canvas.width * .15); x < canvas.width * .85; x += Math.max(1, Math.floor(canvas.width / 30))) {
            const i = (y * canvas.width + x) * 4;
            if (before[i+3] === 255 && before[i]+before[i+1]+before[i+2] < 660) {
              if ([0,1,2,3].some(channel => Math.abs(before[i+channel] - after[i+channel]) > 2)) errors.push('Original logo artwork changed');
              checked++;
            }
          }
        }
        if (!checked) errors.push('No original artwork pixels checked');
        if (config.preserveRectangle) {
          const [left, top, width, height] = config.preserveRectangle; let whites = 0;
          for (let y = top; y < top + height; y += 4) for (let x = left; x < left + width; x += 4) {
            const i = (y * canvas.width + x) * 4;
            if (before[i] > 248 && before[i+1] > 248 && before[i+2] > 248 && before[i+3] === 255) {
              if ([0,1,2,3].some(channel => Math.abs(before[i+channel] - after[i+channel]) > 2)) errors.push('Intentional white artwork removed');
              whites++;
            }
          }
          if (!whites) errors.push('No intentional white artwork checked');
        }
        if (config.clipEllipse) {
          const [cx, cy, rx, ry] = config.clipEllipse;
          for (const [dx,dy] of [[0,0],[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]]) {
            const i = (Math.round(cy + dy * ry) * canvas.width + Math.round(cx + dx * rx)) * 4;
            if ([0,1,2,3].some(channel => Math.abs(before[i+channel] - after[i+channel]) > 2)) errors.push('Seal interior changed');
          }
        }
        return [...new Set(errors)];
      }, { sourceURL: url(logo.source), preserveRectangle: logo.preserve_rectangle, clipEllipse: logo.clip_ellipse });
      assert.deepEqual(problems, [], logo.slug);
      await page.locator('.record-header').screenshot({ path: path.join(reportDir, `logo-${logo.slug}.png`) });
    }
    await page.goto(url('/checks/'));
    await page.locator('#record-collection').selectOption('reports');
    assert.equal(await page.locator('[data-audit-row]:visible').count(), 5);
    await page.locator('#record-view').selectOption('placeholder');
    assert.equal(await page.locator('[data-audit-row]:visible').count(), 5, 'Report image coverage uses actual source-image status');
    await page.locator('#record-filter').fill('introduction');
    assert.equal(await page.locator('[data-audit-row]:visible').count(), 1);
    await page.locator('[data-audit-row]:visible .audit-properties > summary').click();
    assert.equal(JSON.parse(await page.locator('[data-audit-row]:visible .front-matter-json').textContent()).published_year, 2019);
    // Native refresh redirects and normal destination links survive without JS.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const plain = await context.newPage();
    const aliases = preflight.records.filter(record => record.alias_target && record.properties.layout === 'redirect').map(record => [record.url, record.alias_target]);
    for (const [source, destination] of aliases) {
      await plain.goto(url(source));
      await plain.waitForURL(url(destination));
      assert.equal(await plain.locator('link[rel="canonical"]').getAttribute('href'), 'https://adam-3bian.github.io' + new URL(url(destination)).pathname);
      report.redirects++;
    }
    // Card navigation uses ordinary links, including keyboard use without JS.
    for (const width of [1440, 375]) {
      await plain.setViewportSize({ width, height: 900 });
      for (const route of cardRoutes) {
        await plain.goto(url(route));
        const first = plain.locator('.card').first();
        const target = await first.getAttribute('data-record-url');
        const box = await first.boundingBox();
        // Click empty bottom-right padding, then verify keyboard activation too.
        await first.click({ position: { x: box.width - 8, y: box.height - 8 } });
        await plain.waitForURL(url(target));
        assert.equal(await plain.locator('main h1').count(), 1, 'Card padding must open a complete profile');
        await plain.goto(url(route));
        await plain.keyboard.press('Tab');
        await first.focus();
        assert.equal(await first.evaluate(link => getComputedStyle(link).outlineStyle !== 'none' && parseFloat(getComputedStyle(link).outlineWidth) >= 2), true, 'Visible card keyboard focus');
        await plain.keyboard.press('Enter');
        await plain.waitForURL(url(target));
        report.noScriptCards++;
      }
      await plain.goto(url('/case-studies/'));
      const related = plain.locator('.link-grid a').first();
      const relatedTarget = new URL(await related.getAttribute('href'), plain.url()).href;
      const relatedBox = await related.boundingBox();
      await related.click({ position: { x: relatedBox.width - 8, y: relatedBox.height - 8 } });
      await plain.waitForURL(relatedTarget);
      report.noScriptRelatedLinks++;
      await plain.goto(url('/'));
      assert.equal(await plain.locator('.footer-navigation a').count(), footer.groups.flatMap(group => group.links).length, 'All footer links available without JS');
      const footerLink = plain.locator('.footer-navigation a').first();
      await footerLink.focus();
      await plain.keyboard.press('Enter');
      await plain.waitForURL(url(footer.groups[0].links[0].url));
      report.noScriptFooter++;
    }
    for (const [route, expected] of Object.entries(indexes)) {
      await plain.goto(url(route));
      assert.deepEqual(await plain.locator('main .index-navigation a').allTextContents(), expected.links.map(link => link.title));
      const first = plain.locator('main .index-navigation a').first();
      await first.focus();
      await plain.keyboard.press('Enter');
      await plain.waitForURL(url(expected.links[0].url));
      assert.equal(await plain.locator('main h1').count(), 1, 'Index link opens its destination without JS');
      report.noScriptIndexes++;
    }
    await plain.goto(url('/checks/'));
    assert.equal(await plain.locator('[data-audit-row]:visible').count(), preflight.record_count, 'Complete audit remains available without JS');
    const properties = plain.locator('.audit-properties').first();
    await properties.locator('summary').focus();
    await plain.keyboard.press('Enter');
    assert.equal(await properties.getAttribute('open'), '', 'Native properties disclosure works without JS');
    await context.close();
    fs.writeFileSync(path.join(reportDir, 'results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
