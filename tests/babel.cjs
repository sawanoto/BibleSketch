require('./babel-model.cjs');
const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8000';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  for(const mobile of [false,true]){
   const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?3:1});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push(r.status()+' '+r.url())});
   await page.goto(base+'/');await page.getByRole('link',{name:/NO. 004/}).click();await page.waitForFunction(()=>typeof canvas!=='undefined'&&!!canvas&&story.clock>.1);
   const count=mobile?6:8;assert.equal(await page.locator('.bubble-hit').count(),count);assert.equal(await page.evaluate(()=>new Set(story.directions).size),4);
   const press=async i=>{const target=page.locator(`[data-member="${i}"]`);if(mobile)await target.tap();else await target.click()};
   const dirs=()=>page.evaluate(()=>story.turns.map(t=>t%4));
   const layouts=async()=>{
    const boxes=await page.locator('.bubble-hit').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}}));
    for(const b of boxes){assert.ok(b.w>=44&&b.h>=44);}
    for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];assert.equal(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y,false,'Bubble targets never overlap');}
   };
   await layouts();await page.screenshot({path:path.resolve(__dirname,`../docs/004-${mobile?'mobile':'desktop'}-initial.png`),fullPage:true});
   // The full cycle is exactly left -> down -> right -> up -> left.
   const left=(await dirs()).findIndex(t=>t===0);
   for(const direction of [1,2,3,0]){const before=await page.evaluate(()=>story.changes);await press(left);assert.equal((await dirs())[left],direction);assert.equal(await page.evaluate(()=>story.changes),before+1)}
   const up=(await dirs()).findIndex(t=>t===3);await press(up);assert.equal((await dirs())[up],0,'An upward bubble remains editable');
   const last=count-1;if((await dirs())[last]===3)await press(last);
   for(let i=0;i<count-1;i++)while((await dirs())[i]!==3)await press(i);
   assert.equal(await page.evaluate(()=>story.upCount),count-1);
   const turns=await page.evaluate(()=>[...story.turns]);
   // Rotation preserves the cohort and choices, including eight members on a phone width.
   await page.setViewportSize(mobile?{width:844,height:390}:{width:390,height:844});await page.waitForTimeout(150);await layouts();
   assert.equal(await page.evaluate(()=>story.count),count);assert.deepEqual(await page.evaluate(()=>story.turns),turns);
   await page.setViewportSize(mobile?{width:390,height:844}:{width:1440,height:1000});await page.waitForTimeout(150);
   await page.waitForTimeout(800);assert.equal(await page.evaluate(()=>story.progress),0);assert.equal(await page.evaluate(()=>story.phase),'planning');
   assert.equal(await page.evaluate(()=>!!records.partial),true);
   await page.screenshot({path:path.resolve(__dirname,`../docs/004-${mobile?'mobile':'desktop'}-partial.png`),fullPage:true});
   while((await dirs())[last]!==2)await press(last);
   await press(last);assert.equal(await page.evaluate(()=>story.phase),'building');assert.equal(await page.evaluate(()=>story.starts),1);
   assert.equal(await page.locator('.bubble-hit:enabled').count(),0);
   const changes=await page.evaluate(()=>story.changes);await page.evaluate(()=>document.querySelector('.bubble-hit').click());assert.equal(await page.evaluate(()=>story.changes),changes);
   await page.waitForFunction(()=>story.phase==='building'&&story.elapsed>3.25);
   assert.ok(await page.evaluate(()=>story.progress>0&&story.progress<1));assert.equal(await page.evaluate(()=>!!records.building),true);
   await page.screenshot({path:path.resolve(__dirname,`../docs/004-${mobile?'mobile':'desktop'}-building.png`),fullPage:true});
   await page.waitForFunction(()=>story.phase==='complete');await page.waitForTimeout(80);
   assert.equal(await page.evaluate(()=>story.upCount),count);assert.equal(await page.evaluate(()=>story.starts),1);
   assert.equal(await page.evaluate(()=>sound.context.state),'running');assert.equal(await page.evaluate(()=>[...sound.voices].every(v=>v.ambient===true)),true,'Construction sounds have stopped');
   assert.equal(await page.evaluate(()=>sound.voices.size),1,'Only the quiet wind remains');assert.equal(await page.locator('#hint').textContent(),'');
   assert.equal(await page.evaluate(()=>Object.keys(records).length),6);
   await page.screenshot({path:path.resolve(__dirname,`../docs/004-${mobile?'mobile':'desktop'}-complete.png`),fullPage:true});
   await page.locator('summary').click();await page.locator('#resolution').selectOption(mobile?'2560':'3840');
   for(const key of ['scattered','partial','united','building','clouds','gaze']){
    await page.locator('#scene').selectOption(key);const before=await page.evaluate(()=>({phase:story.phase,turns:story.turns,starts:story.starts,count:story.count}));const oldURL=await page.locator('#image').getAttribute('src');
    await page.locator('#export').click();await page.waitForFunction(old=>{const i=document.querySelector('#image');return i.getAttribute('src')!==old&&i.complete&&i.naturalWidth>0},oldURL);
    const size=mobile?2560:3840;assert.equal(await page.locator('#image').evaluate(i=>i.naturalWidth),size);assert.equal(await page.locator('#image').evaluate(i=>i.naturalHeight),size*.625);
    assert.deepEqual(await page.evaluate(()=>({phase:story.phase,turns:story.turns,starts:story.starts,count:story.count})),before);
    assert.equal(await page.locator('canvas').evaluate(c=>Math.abs(c.width/Math.min(devicePixelRatio,2)-c.clientWidth)<3),true);
    if(!mobile){const bytes=await page.evaluate(async()=>[...new Uint8Array(await exportBlob.arrayBuffer())]);fs.writeFileSync(path.resolve(__dirname,`../docs/004-scene-${key}.png`),Buffer.from(bytes));}
    await page.locator('#close').click();
   }
   if(mobile){await page.locator('#resolution').selectOption('3840');await page.locator('#export').click();await page.waitForFunction(()=>document.querySelector('#image').naturalWidth===3840);await page.locator('#close').click();}
   await page.locator('#sound').click();assert.equal(await page.evaluate(()=>sound.voices.size),0);assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'false');
   await page.locator('#sound').click();assert.equal(await page.evaluate(()=>[...sound.voices].every(v=>v.ambient)),true);
   await page.locator('#reset').click();assert.equal(await page.evaluate(()=>story.phase),'planning');assert.equal(await page.evaluate(()=>story.progress),0);assert.equal(await page.evaluate(()=>Object.keys(records).length),1);assert.equal(await page.evaluate(()=>new Set(story.directions).size),4);
   // Reset during construction must cancel the old build and its sound.
   for(let i=0;i<count;i++)while((await dirs())[i]!==3)await press(i);
   assert.equal(await page.evaluate(()=>story.phase),'building');await page.locator('#reset').click();await page.waitForTimeout(7200);assert.equal(await page.evaluate(()=>story.phase),'planning');assert.equal(await page.evaluate(()=>story.progress),0);
   assert.deepEqual(errors,[]);console.log(`${mobile?'Touch 390px DPR3 / 6':'Mouse 1440px / 8'}: cycle, strict unanimity, resize, 18-tier build, wind-only ending, six PNGs, reset PASS`);await context.close();
  }
  const context=await browser.newContext({viewport:{width:320,height:844},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.AudioContext=class{constructor(){throw new Error('Unavailable')}}});await page.goto(base+'/004-tower-of-babel/');await page.waitForFunction(()=>typeof canvas!=='undefined'&&!!canvas);
  for(let i=0;i<6;i++)while(await page.evaluate(i=>story.turns[i]%4!==3,i)){await page.locator(`[data-member="${i}"]`).focus();await page.keyboard.press(i%2?'Space':'Enter')}
  await page.waitForFunction(()=>story.phase==='complete');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);
  console.log('Keyboard 320px, reduced motion, unavailable audio: PASS');await context.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
