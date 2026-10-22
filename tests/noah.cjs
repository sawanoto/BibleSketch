require('./noah-model.cjs');
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:8000';
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const outcomes = [];
    for (const test of [{x:.18,zone:'forest'}, {x:.51,zone:'sea'}, {x:.84,zone:'grassland'}, {x:.5,zone:'sea',mobile:true}]) {
      const mobile = !!test.mobile;
      const context = await browser.newContext({ viewport: mobile ? {width:390,height:844} : {width:1440,height:1000}, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 3 : 1 });
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) errors.push(`${r.status()} ${r.url()}`); });
      await page.goto(base + '/'); await page.getByRole('link', {name:/NO. 003/}).click();
      await page.waitForFunction(() => typeof canvas !== 'undefined' && !!canvas && world.clock > .1);
      const stage = await page.locator('#stage').boundingBox(), handle = await page.locator('#meteor').boundingBox();
      const start = {x:handle.x+handle.width/2,y:handle.y+handle.height/2};
      const end = {x:stage.x+stage.width*test.x,y:stage.y+stage.height*.51};
      if (!mobile && test.zone === 'forest') {
        // A click or a canceled drag must not consume the only meteor.
        await page.locator('#meteor').click(); assert.equal(await page.evaluate(()=>world.drops),0);
        await page.mouse.move(start.x,start.y); await page.mouse.down(); await page.mouse.move(stage.x-35,stage.y+60); await page.mouse.up();
        assert.equal(await page.evaluate(()=>world.phase),'before');
      }
      if (mobile) {
        const cdp = await context.newCDPSession(page);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
        assert.equal(await page.evaluate(()=>world.drops),0);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
        for(let i=1;i<=7;i++) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/7,y:start.y+(end.y-start.y)*i/7}]});
        assert.equal(await page.locator('#aim-label').isVisible(),true);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await cdp.detach();
      } else {
        await page.mouse.move(start.x,start.y); await page.mouse.down(); await page.mouse.move(end.x,end.y,{steps:8});
        assert.equal(await page.locator('#aim-label').isVisible(),true);
        await page.mouse.up();
      }
      await page.waitForFunction(()=>world.phase==='falling');
      assert.equal(await page.locator('#meteor').isDisabled(),true);
      assert.equal(await page.evaluate(()=>world.zone),test.zone);
      assert.ok(Math.abs(await page.evaluate(()=>world.impactX)-test.x)<.005);
      assert.equal(await page.evaluate(()=>world.drop(.1)),false);
      assert.equal(await page.evaluate(()=>world.drops),1);
      await page.waitForFunction(()=>world.phase==='impact');
      await page.waitForFunction(()=>world.phase==='winter');
      assert.equal(await page.evaluate(()=>sound.voices.size),0,'Winter is silent');
      assert.equal(await page.evaluate(()=>sound.context.state),'running');
      const silent = await page.evaluate(async()=>{const analyser=sound.context.createAnalyser();sound.master.connect(analyser);await new Promise(r=>setTimeout(r,90));const data=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(data);sound.master.disconnect(analyser);return data.every(n=>Math.abs(n)<.000001)});
      assert.equal(silent,true);
      if (!mobile && test.zone==='sea') await page.screenshot({path:path.resolve(__dirname,'../docs/003-winter.png'),fullPage:true});
      await page.waitForFunction(()=>world.phase==='survivors');
      assert.equal(await page.evaluate(()=>world.survivors.some(a=>a.type==='dinosaur')),false);
      await page.waitForFunction(()=>world.phase==='world');
      assert.equal(await page.evaluate(()=>world.descendants.every(a=>world.survivors.some(p=>p.id===a.parentId&&p.type===a.type))),true);
      const counts = await page.evaluate(()=>world.counts()); outcomes.push(JSON.stringify(counts));
      assert.equal(await page.evaluate(()=>Object.keys(records).length),6);
      await page.screenshot({path:path.resolve(__dirname,`../docs/003-${mobile?'mobile':test.zone}-world.png`),fullPage:true});
      await page.locator('summary').click();
      assert.equal(await page.locator('#results').isVisible(),true);
      assert.equal(await page.locator('#population tr').count(),8);
      // Export every reached scene, and verify that export cannot change a run.
      if (test.zone==='forest' || mobile) {
        const size = mobile ? 2560 : 3840;
        await page.locator('#resolution').selectOption(String(size));
        for (const key of ['before','falling','impact','winter','survivors','world']) {
          await page.locator('#scene').selectOption(key);
          const before = await page.evaluate(()=>({zone:world.zone,drops:world.drops,phase:world.phase,ids:world.survivors.map(a=>a.id)}));
          const oldURL = await page.locator('#image').getAttribute('src');
          await page.locator('#export').click();
          await page.waitForFunction(old=>{const i=document.querySelector('#image');return i.getAttribute('src')!==old&&i.complete&&i.naturalWidth>0},oldURL);
          assert.equal(await page.locator('#image').evaluate(i=>i.naturalWidth),size);
          assert.equal(await page.locator('#image').evaluate(i=>i.naturalHeight),size*.625);
          assert.deepEqual(await page.evaluate(()=>({zone:world.zone,drops:world.drops,phase:world.phase,ids:world.survivors.map(a=>a.id)})),before);
          assert.equal(await page.locator('canvas').evaluate(c=>Math.abs(c.width/Math.min(devicePixelRatio,2)-c.clientWidth)<3),true);
          if (!mobile) {
            const bytes=await page.evaluate(async()=>[...new Uint8Array(await exportBlob.arrayBuffer())]);
            fs.writeFileSync(path.resolve(__dirname,`../docs/003-scene-${key}.png`),Buffer.from(bytes));
          }
          await page.locator('#close').click();
        }
        if(mobile){await page.locator('#resolution').selectOption('3840');await page.locator('#export').click();await page.waitForFunction(()=>document.querySelector('#image').naturalWidth===3840);await page.locator('#close').click();}
      }
      await page.locator('#sound').click();
      assert.equal(await page.evaluate(()=>sound.voices.size),0); assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'false');
      await page.locator('#sound').click(); assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');
      await page.setViewportSize(mobile?{width:844,height:390}:{width:950,height:700});await page.waitForTimeout(100);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      await page.locator('#reset').click();
      assert.equal(await page.evaluate(()=>world.drops),0);assert.equal(await page.evaluate(()=>Object.keys(records).length),1);
      await page.locator('#meteor').focus();await page.keyboard.press('ArrowLeft');await page.keyboard.press('Enter');
      await page.locator('#reset').click();await page.waitForTimeout(1600);
      assert.equal(await page.evaluate(()=>world.phase),'before','Reset cancels the old fall');
      assert.deepEqual(errors,[]);
      console.log(`${mobile?'Touch 390px DPR3':'Mouse 1440px'} / ${test.zone}: one drag, silence, survival, lineage, automatic renewal, export/reset PASS`);
      await context.close();
    }
    assert.equal(new Set(outcomes.slice(0,3)).size,3);
    // Unsupported audio, reduced motion, and keyboard-only dropping still complete.
    const context = await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    const page = await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{window.AudioContext=class{constructor(){throw new Error('Unavailable')}}});
    await page.goto(base+'/003-noahs-ark/');await page.waitForFunction(()=>typeof canvas!=='undefined'&&!!canvas);
    assert.equal(await page.locator('#soften').isChecked(),true);
    await page.locator('#meteor').focus();for(let i=0;i<8;i++)await page.keyboard.press('ArrowLeft');await page.keyboard.press('Space');
    await page.waitForFunction(()=>world.phase==='world');assert.equal(await page.evaluate(()=>world.zone),'forest');assert.deepEqual(errors,[]);
    console.log('Keyboard, reduced motion, unavailable audio: PASS');await context.close();
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exit(1)});
