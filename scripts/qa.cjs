// Run with Node and Playwright available. No live enquiries or production hits.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4178';
const out = path.join(root, '.qa');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const results = [];
  const pageErrors = [];
  const context = await browser.newContext();
  await context.route(/https:\/\/games\.(roblox|roproxy)\.com\//, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ data: [{ playing: 3, visits: 125, maxPlayers: 50 }] }),
    headers: { 'access-control-allow-origin': '*' },
  }));
  const page = await context.newPage();
  page.on('pageerror', error => pageErrors.push(error.message));
  let liveCounterRequests = 0;
  page.on('request', request => { if (request.url().startsWith('https://hits.sh/')) liveCounterRequests++; });
  for (const [width, height] of [[320,800],[375,812],[390,844],[430,932],[768,1024],[900,900],[1024,900],[1440,1000],[844,390]]) {
    await page.setViewportSize({ width, height });
    await page.goto(base, { waitUntil: 'networkidle' });
    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      h1: document.querySelectorAll('h1').length,
      missingAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.querySelector(a.getAttribute('href'))).map(a => a.outerHTML),
      missingAlt: document.querySelectorAll('img:not([alt])').length,
    }));
    assert.equal(layout.overflow, false, `overflow at ${width}`);
    assert.equal(layout.h1, 1);
    assert.equal(layout.missingAlt, 0);
    assert.deepEqual(layout.missingAnchors, []);
    if ([320,390,1440].includes(width)) await page.screenshot({ path: path.join(out, `hero-${width}.png`) });
    results.push({ check: 'layout', width, height, ...layout });
  }
  assert.equal(liveCounterRequests, 0, 'Preview must not increment public counter');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('[data-menu-button]').click();
  assert.equal(await page.locator('[data-menu-button]').getAttribute('aria-expanded'), 'true');
  await page.screenshot({ path: path.join(out, 'menu-mobile.png') });
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-menu-button]').getAttribute('aria-expanded'), 'false');
  assert.equal(await page.locator('[data-menu-button]').evaluate(el => el === document.activeElement), true);
  await page.locator('[data-menu-button]').click();
  await page.locator('[data-nav] a[href="#work"]').click();
  assert.equal(await page.locator('[data-menu-button]').getAttribute('aria-expanded'), 'false');
  await page.locator('[data-showcase="hoverboard"]').click();
  assert.equal(await page.locator('[data-showcase-title]').textContent(), 'Hoverboard Obby');
  assert.equal(await page.locator('[data-showcase-link]').getAttribute('href'), 'https://youtu.be/lEorSYMsxoU');
  await page.locator('[data-showcase="simulator"]').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('[data-showcase-title]').textContent(), 'Connected Simulator Framework');
  results.push({ check: 'mobile menu / Escape / focus return / keyboard project switch', passed: true });

  await page.locator('[name="brief"]').fill('Please keep this existing project description.');
  for (const [scope, type] of [['Feature package','Gameplay system'],['Systems build','Gameplay system'],['Playable prototype','Playable prototype']]) {
    await page.locator(`[data-scope="${scope}"]`).click();
    assert.equal(await page.locator('[name="selectedScope"]').inputValue(), scope);
    assert.equal(await page.locator('[name="projectType"]').inputValue(), type);
    assert.equal(await page.locator('[name="brief"]').inputValue(), 'Please keep this existing project description.');
  }
  await page.locator('[name="projectType"]').selectOption('UI / UX implementation');
  assert.equal(await page.locator('[name="selectedScope"]').inputValue(), '');
  assert.equal(await page.locator('[data-selected-scope]').isVisible(), false);
  assert.equal(await page.locator('.contact-form').evaluate(el => el.checkValidity()), false);
  await page.locator('[name="name"]').fill('QA fixture');
  await page.locator('[name="contact"]').fill('qa@example.invalid');
  assert.equal(await page.locator('.contact-form').evaluate(el => el.checkValidity()), true, 'Optional fields may be empty');
  await page.locator('[name="gameLink"]').fill('not-a-url');
  assert.equal(await page.locator('.contact-form').evaluate(el => el.checkValidity()), false);
  await page.locator('[name="gameLink"]').fill('');
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  assert.equal(await page.locator('.mobile-quote').isVisible(), false);
  await page.screenshot({ path: path.join(out, 'contact-mobile.png') });
  let submitted;
  await page.route('https://formsubmit.co/**', async route => {
    submitted = new URLSearchParams(route.request().postData());
    await route.fulfill({ contentType: 'text/html', body: '<h1>Intercepted QA submission — not sent</h1>' });
  });
  await page.locator('.contact-form button[type="submit"]').click();
  await page.waitForURL('https://formsubmit.co/**');
  assert.equal(submitted.get('name'), 'QA fixture');
  assert.equal(submitted.get('_next'), 'https://metaa0.github.io/MetaDevelopment/thanks.html');
  results.push({ check: 'scope / preserves brief / optional fields / validation / intercepted POST', passed: true });

  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('#pricing').scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  assert.equal(await page.locator('.mobile-quote').isVisible(), true);
  await page.locator('.mobile-quote').click();
  await page.waitForTimeout(700);
  assert.equal(await page.locator('.mobile-quote').isVisible(), false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  assert.equal(await page.locator('.ticker > div').evaluate(el => getComputedStyle(el).animationName), 'none');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/thanks.html`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('h1').textContent(), 'Brief received.');
  results.push({ check: 'sticky quote / live reduced-motion change / return page', passed: true });

  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 800 } });
  const nojsPage = await nojs.newPage();
  await nojsPage.goto(base);
  assert.equal(await nojsPage.locator('[data-nav]').isVisible(), true);
  assert.equal(await nojsPage.locator('[data-showcase-controls]').isVisible(), false);
  assert.equal(await nojsPage.locator('.contact-form button').isVisible(), true);
  assert.equal(await nojsPage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  results.push({ check: 'no-JavaScript navigation / default showcase / form / reflow', passed: true });
  await nojs.close();

  // Serve local files at the production URL entirely through interception.
  const publicContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  let counterMode = 'success';
  let counterCalls = 0;
  await publicContext.route('https://metaa0.github.io/MetaDevelopment/**', async route => {
    const rel = new URL(route.request().url()).pathname.replace('/MetaDevelopment/', '') || 'index.html';
    const filename = path.join(root, rel);
    const ext = path.extname(filename);
    const type = { '.html':'text/html', '.css':'text/css', '.js':'application/javascript', '.png':'image/png', '.svg':'image/svg+xml' }[ext];
    await route.fulfill({ path: filename, contentType: type });
  });
  await publicContext.route('https://hits.sh/**', async route => {
    counterCalls++;
    if (counterMode === 'failure') return route.abort();
    await route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="85" height="24"><text y="18">QA 42</text></svg>' });
  });
  await publicContext.route(/https:\/\/games\.(roblox|roproxy)\.com\//, route => route.fulfill({ status: 503, body: '{}' }));
  const publicPage = await publicContext.newPage();
  await publicPage.goto('https://metaa0.github.io/MetaDevelopment/', { waitUntil: 'networkidle' });
  assert.equal(counterCalls, 1);
  assert.equal(await publicPage.locator('[data-view-badge]').isVisible(), true);
  assert.equal(await publicPage.locator('[data-view-status]').isVisible(), false);
  assert.equal(await publicPage.locator('[data-roblox-stat="visits"]').textContent(), '—');
  assert.match(await publicPage.locator('[data-roblox-updated]').textContent(), /unavailable/);
  counterMode = 'failure';
  await publicPage.reload({ waitUntil: 'networkidle' });
  assert.equal(await publicPage.locator('[data-view-badge]').isVisible(), false);
  assert.equal(await publicPage.locator('[data-view-status]').textContent(), 'Count temporarily unavailable');
  results.push({ check: 'counter production gate / single request / mocked success and failure / unavailable Roblox stats', passed: true });
  assert.deepEqual(pageErrors, []);
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({ date: new Date().toISOString(), browser: await browser.version(), pageErrors, results, limitations: 'Chromium emulation. FormSubmit and production counter intercepted. No live enquiries or production view increments.' }, null, 2));
  console.log(JSON.stringify({ passed: results.length, pageErrors, report: path.join(out, 'report.json') }));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
