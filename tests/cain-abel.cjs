const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:8000';
const keys = ['offerings', 'regarded', 'anger', 'excluding', 'alone', 'attending'];

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    for (const mobile of [false, true]) {
      const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 3 : 1 });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) errors.push(`HTTP ${response.status()}: ${response.url()}`); });
      const press = async selector => mobile ? page.locator(selector).tap() : page.locator(selector).click();
      const phase = async name => page.waitForFunction(name => story.phase === name, name);
      const between = () => page.waitForFunction(() => story.clock - story.lastActionAt > .38);
      const state = () => page.evaluate(() => ({ phase: story.phase, care: story.care, blame: story.blame }));
      await page.goto(base + '/');
      await page.getByRole('link', { name: /NO. 002/ }).click();
      await page.waitForFunction(() => typeof story !== 'undefined' && typeof canvas !== 'undefined' && !!canvas);
      await page.waitForFunction(() => story.clock > .12);
      assert.equal(await page.locator('#care-target').isDisabled(), true);
      assert.equal(await page.locator('#abel-target').isDisabled(), true);
      assert.equal(await page.locator('#hint [lang=en]').isVisible(), true);
      const initialFloor = await page.evaluate(() => {
        const c = canvas.elt, ctx = c.getContext('2d');
        return [330, 670].map(x => [...ctx.getImageData(Math.floor(c.width * x / 1000), Math.floor(c.height * 510 / 625), 1, 1).data]);
      });
      await press('#offer');
      await phase('regarded');
      assert.equal(await page.locator('#abel-target').isDisabled(), true);
      await page.waitForFunction(() => story.elapsed > 1.3);
      const litFloor = await page.evaluate(() => {
        const c = canvas.elt, ctx = c.getContext('2d');
        return [330, 670].map(x => [...ctx.getImageData(Math.floor(c.width * x / 1000), Math.floor(c.height * 510 / 625), 1, 1).data]);
      });
      assert.deepEqual(litFloor[0], initialFloor[0], 'Cain’s offering is never illuminated');
      assert.notDeepEqual(litFloor[1], initialFloor[1], 'Only Abel’s offering is illuminated');
      await phase('choice');
      assert.equal(await page.locator('#abel-target').isEnabled(), true);
      assert.equal(await page.evaluate(() => audio.context.state), 'running');
      await press('#abel-target');
      assert.equal((await state()).blame, 1);
      await between();
      await press('#abel-target');
      assert.equal((await state()).blame, 2);
      // Accidental repeated input must not jump straight into exclusion.
      await press('#abel-target');
      assert.equal((await state()).blame, 2);
      await between();
      await press('#abel-target');
      await phase('excluding');
      assert.equal(await page.locator('#care-target').isDisabled(), true);
      await phase('alone');
      assert.equal(await page.evaluate(() => audio.voices.size), 0, 'After Abel disappears, no voice is running');
      assert.equal(await page.locator('.abel-name').evaluate(el => getComputedStyle(el).opacity), '0');
      assert.match(await page.locator('canvas').getAttribute('aria-label'), /empty/);
      await press('#sound'); await press('#sound');
      assert.equal(await page.evaluate(() => audio.voices.size), 0, 'Unmuting the ending does not start a sound');
      assert.equal(await page.locator('#hint').textContent(), '');
      const analyserSilent = await page.evaluate(async () => {
        const analyser = audio.context.createAnalyser(); audio.master.connect(analyser);
        await new Promise(resolve => setTimeout(resolve, 100));
        const samples = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(samples);
        audio.master.disconnect(analyser);
        return samples.every(sample => Math.abs(sample) < .000001);
      });
      assert.equal(analyserSilent, true);
      await page.screenshot({ path: path.resolve(__dirname, `../docs/002-${mobile ? 'mobile' : 'desktop'}-alone.png`), fullPage: true });
      await press('#reset');
      assert.deepEqual(await state(), { phase: 'offerings', care: 0, blame: 0 });
      assert.equal(await page.evaluate(() => !!records.alone), true, 'Reset preserves reached scenes');
      await press('#offer'); await phase('choice');
      // You can turn back to the offering before the third action toward Abel.
      for (let i = 0; i < 2; i++) { await between(); await press('#abel-target'); }
      for (let i = 1; i <= 4; i++) {
        await between(); await press('#care-target');
        assert.equal((await state()).care, i);
      }
      await phase('attending');
      await page.waitForFunction(() => story.anger < .01);
      assert.equal(await page.locator('#abel-target').isDisabled(), true);
      assert.equal(await page.locator('.abel-name').evaluate(el => getComputedStyle(el).opacity), '1');
      assert.equal(await page.evaluate(() => audio.voices.size), 0);
      assert.deepEqual(await page.evaluate(() => Object.keys(records).sort()), [...keys].sort());
      await page.screenshot({ path: path.resolve(__dirname, `../docs/002-${mobile ? 'mobile' : 'desktop'}-alternative.png`), fullPage: true });
      await page.locator('summary').click();
      await page.locator('#resolution').selectOption(mobile ? '2560' : '3840');
      const size = mobile ? 2560 : 3840;
      for (const key of keys) {
        await page.locator('#scene').selectOption(key);
        const before = await state();
        const oldURL = await page.locator('#image').getAttribute('src');
        await press('#export');
        await page.waitForFunction(old => {
          const img = document.querySelector('#image');
          return img.getAttribute('src') !== old && img.complete && img.naturalWidth > 0;
        }, oldURL);
        assert.equal(await page.locator('#image').evaluate(i => i.naturalWidth), size);
        assert.equal(await page.locator('#image').evaluate(i => i.naturalHeight), size * 625 / 1000);
        assert.deepEqual(await state(), before, 'Export does not change the chosen ending');
        assert.equal(await page.locator('canvas').evaluate(c => Math.abs(c.width / Math.min(devicePixelRatio, 2) - c.clientWidth) < 3), true);
        if (!mobile) {
          const bytes = await page.evaluate(async () => [...new Uint8Array(await exportBlob.arrayBuffer())]);
          fs.writeFileSync(path.resolve(__dirname, `../docs/002-scene-${key}.png`), Buffer.from(bytes));
        }
        await press('#close');
      }
      // The phone can also export the largest available size.
      if (mobile) {
        await page.locator('#resolution').selectOption('3840'); await press('#export');
        await page.waitForFunction(() => document.querySelector('#image').naturalWidth === 3840);
        await press('#close');
      }
      await page.reload();
      await page.waitForFunction(() => typeof story !== 'undefined' && typeof canvas !== 'undefined' && !!canvas);
      assert.equal(await page.evaluate(() => Object.keys(records).length), 6);
      await page.setViewportSize(mobile ? { width: 844, height: 390 } : { width: 950, height: 700 });
      await page.waitForTimeout(150);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      // No delayed offering or attack callback can restart after a reset.
      await press('#offer'); await press('#reset');
      await page.waitForTimeout(3200);
      assert.equal((await state()).phase, 'offerings');
      assert.equal(await page.evaluate(() => audio.voices.size), 0);
      assert.deepEqual(errors, []);
      console.log(`${mobile ? 'Touch 390px' : 'Mouse 1440px'}: both endings, redirection, six PNGs, silence, reset, resize PASS`);
      await context.close();
    }
    // Keyboard-only input and blocked audio/storage must not prevent either choice.
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.AudioContext = class { constructor() { throw new Error('Audio unavailable'); } };
      Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
    });
    await page.goto(base + '/002-cain-and-abel/');
    await page.waitForFunction(() => typeof canvas !== 'undefined' && !!canvas);
    await page.locator('#offer').focus(); await page.keyboard.press('Enter');
    await page.waitForFunction(() => story.phase === 'choice');
    await page.locator('#care-target').focus();
    for (let i = 0; i < 4; i++) {
      await page.waitForFunction(() => story.clock - story.lastActionAt > .38);
      await page.keyboard.press(i % 2 ? 'Space' : 'Enter');
    }
    await page.waitForFunction(() => story.phase === 'attending');
    await page.locator('summary').click();
    assert.equal(await page.locator('#notice [lang=en]').isVisible(), true);
    assert.deepEqual(errors, []);
    console.log('Keyboard, reduced motion, audio/storage unavailable: PASS');
    await context.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
