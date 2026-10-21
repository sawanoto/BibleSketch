/* global BabelStory, BabelSound, Marpan25D, BABEL_BUILD_SECONDS */
'use strict';
const $ = selector => document.querySelector(selector);
const story = new BabelStory(8);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sound = new BabelSound(() => message('#notice', '音を開始できません。音なしでも体験できます。', 'Sound could not start. You can continue without sound.'));
const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const directionText = [['左', 'left'], ['下', 'down'], ['右', 'right'], ['上', 'up']];
const sceneInfo = { scattered: ['1. バラバラな意思', 'Different intentions'], partial: ['2. 上向きが増えていく', 'Coming together'], united: ['3. 全員が上を向く瞬間', 'Every arrow points up'], building: ['4. 階層を積み重ねる', 'Building layer by layer'], clouds: ['5. 雲に届いた塔', 'The tower reaches the clouds'], gaze: ['6. 塔を見上げる', 'Looking up together'] };
const LEVELS = 18, LEVEL_HEIGHT = 52, BASE_HEIGHT = 64, TOTAL_HEIGHT = BASE_HEIGHT + LEVELS * LEVEL_HEIGHT;
let canvas, marpan, records = {}, maxPartial = 0, exporting = false, imageURL, exportBlob;
const clamp = n => Math.max(0, Math.min(1, n));
const smooth = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
function message(selector, ja, en) {
  const span = document.createElement('span'); span.lang = 'en'; span.className = 'en'; span.textContent = en;
  $(selector).replaceChildren(document.createTextNode(ja), span);
}
function remember(key, overrides = {}) {
  records[key] = { ...story.frame(), freezeArrows: true, ...overrides };
  $('#scene').replaceChildren(...Object.entries(sceneInfo).map(([id, text]) => {
    const option = new Option(`${text[0]} / ${text[1]}`, id); option.disabled = !records[id]; return option;
  }));
  $('#scene').value = key;
}
function syncSound() {
  const active = sound.enabled && sound.context?.state === 'running';
  message('#sound', active ? '音 ON' : '音 OFF', active ? 'Sound ON' : 'Sound OFF'); $('#sound').setAttribute('aria-pressed', String(active));
}
function onPhase(phase) {
  sound.enter(phase); $('#stage').dataset.phase = phase;
  for (const button of $('#bubbles').children) button.disabled = phase !== 'planning';
  if (phase === 'planning') { maxPartial = story.upCount; remember('scattered'); message('#hint', '吹き出しをタップして、みんなの矢印を上にそろえよう。', 'Tap the bubbles to turn every arrow upward.'); }
  if (phase === 'building') { remember('united', { elapsed: 0 }); message('#hint', '一段、また一段。', 'Layer by layer.'); }
  if (phase === 'complete') {
    remember('clouds', { elapsed: 1.2 }); remember('gaze', { elapsed: 2.5, view: 'people' });
    message('#hint', '', '');
  }
  syncUI();
}
function syncUI() {
  $('#chapter').textContent = story.phase === 'planning' ? `上向き ${story.upCount} / ${story.count} · Upward` : story.phase === 'building' ? '建設 / Building' : '空へ / Into the sky';
  [...$('#bubbles').children].forEach((button, index) => {
    const direction = directionText[story.turns[index] % 4];
    button.setAttribute('aria-label', `マーパン${names[index]}、${direction[0]}向き。次の向きへ / Marpan ${names[index]}, pointing ${direction[1]}. Change direction`);
    button.dataset.direction = direction[1]; button.disabled = story.phase !== 'planning';
  });
  if (canvas) canvas.attribute('aria-label', story.phase === 'planning' ? `土台の塔と${story.count}体のマーパン。上向き${story.upCount}体。 / A tower foundation and ${story.count} Marpans; ${story.upCount} point upward.` : story.phase === 'building' ? '全員が協力し、塔が階層を重ねて伸びる。 / All Marpans cooperate as the tower grows layer by layer.' : '雲に届く塔を、全員が見上げている。 / Everyone looks up at a tower reaching the clouds.');
}
function createButtons() {
  $('#bubbles').replaceChildren(...story.turns.map((_, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'bubble-hit'; button.dataset.member = String(index);
    button.onclick = () => {
      if (!story.cycle(index)) return;
      if (story.phase === 'planning' && story.upCount > maxPartial) { maxPartial = story.upCount; remember('partial'); }
      sound.changed(story.turns[index] % 4 === 3).then(syncSound); syncUI();
    };
    return button;
  }));
  syncUI(); placeButtons();
}
function setup() {
  const stage = $('#stage'); canvas = createCanvas(stage.clientWidth, stage.clientHeight); canvas.parent(stage); canvas.attribute('role', 'img');
  pixelDensity(Math.min(devicePixelRatio, 2)); frameRate(30); marpan = new Marpan25D({ autoBlink: false, bodyColor: '#f4f0e4' });
  story.onPhase = onPhase; story.onMilestone = () => remember('building', { phase: 'building', elapsed: 3.2 });
  story.reset(stage.clientWidth < 640 ? 6 : 8); createButtons();
  new ResizeObserver(() => {
    if (exporting) return;
    if (width !== stage.clientWidth || height !== stage.clientHeight) resizeCanvas(stage.clientWidth, stage.clientHeight, true);
    placeButtons();
  }).observe(stage);
}
function geometry(count, cssWidth = $('#stage').clientWidth) {
  const h = 1000 * height / width, ground = h * .975;
  const bodyW = count === 6 ? 96 : 92, bodyH = bodyW * .68;
  const bubbleSize = Math.max(50, 44 * 1000 / cssWidth);
  const offset = bubbleSize * .6 + bodyH / 2 + 10;
  const positions = count === 6 ? [
    {x:220,y:h*.286},{x:220,y:h*.607},{x:220,y:h*.928},
    {x:780,y:h*.286},{x:780,y:h*.607},{x:780,y:h*.928}
  ] : [120,290,710,880].flatMap(x => [{x,y:h*.56},{x,y:h*.91}]);
  return { h, ground, bodyW, bodyH, bubbleSize, positions: positions.map(p => ({...p,bubbleY:p.y-offset})) };
}
function placeButtons() {
  if (!canvas) return;
  const g = geometry(story.count);
  [...$('#bubbles').children].forEach((button, i) => {
    const p = g.positions[i]; button.style.left = `${p.x / 10}%`; button.style.top = `${p.bubbleY / g.h * 100}%`;
    const px = g.bubbleSize * $('#stage').clientWidth / 1000; button.style.width = `${px}px`; button.style.height = `${px}px`;
  });
}
function draw() {
  if (exporting || document.hidden || $('#preview').open) return;
  story.tick(Math.min(deltaTime / 1000, .06)); renderScene(story.frame()); sound.tick(story.frame());
}
$('#reset').onclick = () => {
  records = {}; story.reset($('#stage').clientWidth < 640 ? 6 : 8); createButtons();
  message('#notice', '今回の6場面を個別に保存できます。リセットすると記録も初期化します。', 'Save the six scenes reached in this play. Start over also clears these records.');
};
$('#sound').onclick = async () => {
  if (!sound.context) sound.setEnabled(true); else sound.setEnabled(!sound.enabled);
  if (sound.enabled) await sound.unlock(); syncSound();
};
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { sound.stop(); if (sound.context) sound.context.suspend().catch(() => {}); }
  else if (sound.enabled && sound.context) sound.unlock().then(syncSound);
});

function renderScene(frame) {
  const g = geometry(frame.count, exporting ? width : $('#stage').clientWidth), ctx = drawingContext;
  const progress = frame.phase === 'complete' ? 1 : frame.phase === 'building' ? smooth(frame.elapsed / BABEL_BUILD_SECONDS) : 0;
  const finalZoom = (g.ground - g.h * .15) / TOTAL_HEIGHT;
  const zoom = frame.view === 'people' ? .84 : 1 + (finalZoom - 1) * progress;
  const time = reducedMotion ? 0 : frame.clock;
  push(); scale(width / 1000); noStroke();
  const sky = ctx.createLinearGradient(0, 0, 0, g.h);
  sky.addColorStop(0,'#8daeb8'); sky.addColorStop(.65,'#d2d3be'); sky.addColorStop(1,'#e0c79d');
  ctx.fillStyle = sky; ctx.fillRect(0,0,1000,g.h);
  fill(249,230,183,125); circle(820,78,46);
  push(); translate(500,g.ground); scale(zoom); translate(-500,-g.ground);
  drawLandscape(g,time);
  drawPlaza(g);
  drawTower(g,progress,time);
  for (let i=0;i<g.positions.length;i++) drawMember(g,g.positions[i],i,frame,progress,time);
  drawClouds(g,time);
  pop();
  fill(255,246,213,11); for(let i=0;i<140;i++) circle((i*137.3)%1000,(i*79.7)%g.h,1);
  pop();
}
function drawLandscape(g,time) {
  noStroke(); fill('#a8b0a0'); beginShape(); vertex(-1000,g.ground-100); bezierVertex(-300,g.ground-340,150,g.ground-180,500,g.ground-155); bezierVertex(900,g.ground-230,1400,g.ground-380,2000,g.ground-150); vertex(2000,g.ground+1200);vertex(-1000,g.ground+1200);endShape(CLOSE);
  fill('#c0ac87'); beginShape();vertex(-1000,g.ground-40);bezierVertex(-200,g.ground-160,140,g.ground-100,500,g.ground-85);bezierVertex(900,g.ground-140,1500,g.ground-160,2000,g.ground-30);vertex(2000,g.ground+1200);vertex(-1000,g.ground+1200);endShape(CLOSE);
  fill('#b49a76'); rect(-1500,g.ground,4000,1400);
  stroke('#ead6af55');strokeWeight(1);for(let i=0;i<35;i++){const x=-800+i*83;line(x,g.ground+28+(i%3)*24,x+28,g.ground+27+(i%3)*24)}noStroke();
}
function drawPlaza(g) {
  const levels = [...new Set(g.positions.map(p=>p.y+g.bodyH/2+5))].sort((a,b)=>a-b);
  levels.forEach((y,i)=>{
    for(const side of [-1,1]) {
      const x=side<0?-350:650;
      fill(i%2?'#b69c78':'#c5ad87'); rect(x,y,700,g.ground-y+100);
      fill('#ddc59c'); rect(x,y-4,700,8);
      stroke('#8c775a55');strokeWeight(1);line(x,y+18,x+700,y+18);
      for(let k=0;k<12;k++) line(x+k*62,y+1,x+k*62,y+18);
      noStroke();
    }
  });
}
function drawTower(g,progress,time) {
  noStroke(); fill(65,62,48,40); ellipse(500,g.ground+5,310,35);
  fill('#a1835d'); rect(370,g.ground-BASE_HEIGHT,260,BASE_HEIGHT);
  fill('#dcc39b'); quad(370,g.ground-BASE_HEIGHT,630,g.ground-BASE_HEIGHT,645,g.ground-BASE_HEIGHT-12,355,g.ground-BASE_HEIGHT-12);
  stroke('#786548');strokeWeight(2);line(370,g.ground-30,630,g.ground-30);for(let i=0;i<8;i++)line(375+i*33,g.ground-30,375+i*33,g.ground);noStroke();
  for(let i=0;i<LEVELS;i++) {
    const fraction=clamp(progress*LEVELS-i);if(fraction<=0)continue;
    const h=LEVEL_HEIGHT*smooth(fraction), half=125-i*4.25, bottom=g.ground-BASE_HEIGHT-i*LEVEL_HEIGHT, top=bottom-h;
    fill(i%2?'#b79668':'#b08c60'); quad(500-half-4,bottom,500+half+4,bottom,500+half,top,500-half,top);
    fill('#c5a875'); rect(500+half*.55,top,half*.45,h);
    fill('#e3c99a'); ellipse(500,top,half*2,Math.min(15,h*.35));
    stroke('#7f69494a');strokeWeight(1);
    for(let row=1;row<4;row++) {
      const y=bottom-row*13;if(y<=top+5)continue;line(500-half,y,500+half,y);
      for(let col=-8;col<9;col++){const x=500+col*25+(row%2)*12;if(x>500-half+2&&x<500+half-2)line(x,y,x,Math.max(top+5,y-13))}
    }
    noStroke();
    if(h>24) {
      const arches=Math.max(2,Math.floor(half/23));
      for(let a=0;a<arches;a++) {
        const x=500-half*.78+(a+.5)/arches*half*1.56, aw=Math.min(17,half/arches*.55), ah=Math.min(24,h-15);
        fill('#74664d'); rect(x-aw/2,bottom-ah,aw,ah-3); arc(x,bottom-ah,aw,aw,Math.PI,Math.PI*2,CHORD);
        fill('#97825b'); rect(x+aw*.1,bottom-ah,aw*.4,ah-3);
      }
    }
    fill('#806b48');rect(500-half-4,bottom-3,half*2+8,3);
  }
  if(progress>0&&progress<1) {
    const top=g.ground-BASE_HEIGHT-LEVELS*LEVEL_HEIGHT*progress;
    fill('#e6d4ac'); rect(500-25,top-8,50,7);
  }
}
function drawMember(g,p,index,frame,progress,time) {
  const building=frame.phase==='building', active=frame.phase!=='planning';
  const direction=frame.turns[index]%4;
  let lookX=p.x,lookY=p.y;
  if(active){lookX=500;lookY=g.ground-BASE_HEIGHT-LEVELS*LEVEL_HEIGHT*progress-30;}
  else{lookX+=direction===0?-180:direction===2?180:0;lookY+=direction===1?180:direction===3?-180:0;}
  const work=building&&!reducedMotion?Math.sin(time*7+index*1.2)*1.8:0;
  noStroke();fill(77,67,49,45);ellipse(p.x,p.y+g.bodyH/2+5,g.bodyW*.9,9);
  marpan.drawAt(p.x,p.y-work,{bodyWidth:g.bodyW,bodyHeight:g.bodyH,lookX,lookY,yaw:0,expression:'pupil'});
  if(building){
    const phase=(frame.elapsed*.62+index*.117)%1, targetX=p.x<500?380:620;
    const x=p.x+(targetX-p.x)*phase, y=p.y+g.bodyH/2-8-Math.sin(phase*Math.PI)*22;
    fill('#9d7950');rect(x-5,y-4,10,6,1);
  }
  const pulse=building&&frame.elapsed<.85?Math.sin(clamp(frame.elapsed/.85)*Math.PI):0;
  drawBubble(p.x,p.bubbleY,g.bubbleSize,direction,frame,index,pulse);
}
function drawBubble(x,y,size,direction,frame,index,pulse) {
  push();translate(x,y);noStroke();
  if(direction===3){fill(247,222,158,23+pulse*75);ellipse(0,0,size*(1.15+pulse*.18),size*(1.08+pulse*.14));}
  fill(80,70,53,25);rect(-size/2+2,-size*.42+3,size,size*.84,size*.2);
  stroke(direction===3?'#bea268':'#b0ad96');strokeWeight(Math.max(1,size*.018));fill(direction===3?'#f6e8bd':'#e4e5d4');
  rect(-size/2,-size*.42,size,size*.84,size*.2);
  beginShape();vertex(-size*.12,size*.40);vertex(0,size*.58);vertex(size*.15,size*.40);endShape();
  noStroke();fill(direction===3?'#f6e8bd':'#e4e5d4');triangle(-size*.13,size*.38,0,size*.55,size*.15,size*.38);
  let turns=frame.turns[index];
  if(!frame.freezeArrows&&!reducedMotion)turns=frame.tweenFrom[index]+(turns-frame.tweenFrom[index])*smooth((frame.clock-frame.changedAt[index])/.18);
  rotate(Math.PI-turns*Math.PI/2);stroke(direction===3?'#6a603f':'#64766b');strokeWeight(size*.075);strokeCap(ROUND);strokeJoin(ROUND);noFill();
  line(-size*.22,0,size*.22,0);beginShape();vertex(size*.07,-size*.16);vertex(size*.23,0);vertex(size*.07,size*.16);endShape();pop();
}
function drawClouds(g,time) {
  noStroke();
  const ys=[g.ground-220,g.ground-460,g.ground-760,g.ground-970,g.ground-1110];
  for(let i=0;i<ys.length;i++){
    const drift=reducedMotion?0:Math.sin(time*.045+i)*42;
    for(const side of [-1,1]){
      const x=500+side*(i>2?100:285)+drift;
      fill(246,244,224,i>2?130:70);ellipse(x,ys[i],i>2?185:220,29);ellipse(x+36,ys[i]-12,95,42);ellipse(x-32,ys[i]-7,113,35);
    }
  }
}

$('#export').onclick=()=>{
  const key=$('#scene').value,frame=records[key];if(!frame||exporting)return;
  exporting=true;$('#export').disabled=true;const w=width,h=height,density=pixelDensity();
  try{
    pixelDensity(1);const size=Number($('#resolution').value);resizeCanvas(size,size*.625,true);renderScene(frame);
    canvas.elt.toBlob(blob=>{
      if(!blob){message('#notice','書き出せませんでした。低い解像度をお試しください。','Could not export. Try a lower resolution.');return;}
      if(imageURL)URL.revokeObjectURL(imageURL);imageURL=URL.createObjectURL(blob);exportBlob=blob;
      $('#image').src=imageURL;$('#download').href=imageURL;$('#download').download=`bible-sketch-004-${key}.png`;$('#export-notice').replaceChildren();
      sound.stop();if(!$('#preview').open)$('#preview').showModal();
    },'image/png');
  }catch(_){message('#notice','書き出しに失敗しました。低い解像度をお試しください。','Export failed. Try a lower resolution.');}
  finally{pixelDensity(density);resizeCanvas(w,h,true);exporting=false;renderScene(story.frame());$('#export').disabled=false;placeButtons();}
};
$('#share').onclick=async()=>{
  if(!exportBlob)return;const file=new File([exportBlob],$('#download').download,{type:'image/png'});
  try{if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:'バベルの塔 / Tower of Babel'});else message('#export-notice','PNGを保存、または画像を長押ししてください。','Use Save PNG, or touch and hold the image.');}
  catch(error){if(error.name!=='AbortError')message('#export-notice','共有できませんでした。画像の長押し保存をお試しください。','Could not share. Touch and hold the image to save it.');}
};
$('#close').onclick=()=>$('#preview').close();
