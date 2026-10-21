/* global CainAbelStory, OfferingSound, Marpan25D, p5 */
'use strict';
const ui = selector => document.querySelector(selector);
const story = new CainAbelStory();
const audio = new OfferingSound(() => message('#notice', '音を開始できません。音なしでも体験できます。', 'Sound could not start. You can continue without sound.'));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sceneInfo = {
  offerings: ['1. 兄と弟の捧げ物', 'The two offerings'],
  regarded: ['2. 弟の捧げ物に光が注ぐ', 'Only Abel’s offering receives light'],
  anger: ['3. 兄が怒り始める', 'Cain’s anger begins'],
  excluding: ['4. 弟を排除する', 'The moment of exclusion'],
  alone: ['5. 兄だけが残る', 'Cain remains alone'],
  attending: ['6. 捧げ物に向き合う別の結末', 'An imagined alternative']
};
const RECORD_KEY = 'bible-sketch-002-scenes-v1';
let records = {}, cain, abel, canvas, exporting = false, imageURL, exportBlob;
try {
  const saved = JSON.parse(sessionStorage.getItem(RECORD_KEY));
  if (saved?.version === 1) {
    for (const key of Object.keys(sceneInfo)) {
      const frame = saved.records?.[key];
      if (frame && ['offerings', 'regarded', 'choice', 'excluding', 'alone', 'attending'].includes(frame.phase)
        && ['elapsed', 'clock', 'anger', 'care', 'blame', 'sinceAction'].every(n => Number.isFinite(frame[n]))) records[key] = frame;
    }
  }
} catch (_) { /* Session storage is optional. */ }
const clamp01 = n => Math.max(0, Math.min(1, n));
const ease = n => { const t = clamp01(n); return t * t * (3 - 2 * t); };

function message(selector, ja, en) {
  const target = ui(selector);
  const english = document.createElement('span');
  english.className = 'en'; english.lang = 'en'; english.textContent = en;
  target.replaceChildren(document.createTextNode(ja), english);
}
function remember(key, overrides = {}) {
  records[key] = { ...story.frame(), ...overrides };
  try { sessionStorage.setItem(RECORD_KEY, JSON.stringify({ version: 1, records })); }
  catch (_) { message('#notice', 'このタブで記録を保持します。閉じる前にPNGを保存してください。', 'Scenes will remain available on this page. Export your PNGs before closing it.'); }
  const select = ui('#scene');
  select.replaceChildren(...Object.entries(sceneInfo).map(([id, text]) => {
    const option = new Option(`${text[0]} / ${text[1]}`, id);
    option.disabled = !records[id];
    return option;
  }));
  select.value = key;
}
function onPhase(phase) {
  const labels = {
    offerings: ['捧げ物', 'Offerings'], lifting: ['捧げる', 'Offering'], regarded: ['光', 'Light'],
    choice: ['怒り', 'Anger'], settling: ['向き合う', 'Turning inward'], excluding: ['暗転', 'Darkness'],
    alone: ['その後', 'Afterward'], attending: ['その後', 'Afterward']
  };
  if (canvas) canvas.attribute('aria-label', phase === 'alone' ? '左に兄カインと光の当たらない籠。右は空白。 / Cain and his unlit basket remain on the left. The right side is empty.' : '左にカインと農作物の籠、右にアベルと羊の捧げ物。 / Cain and a basket of crops on the left; Abel and a sheep offering on the right.');
  ui('#chapter').textContent = `${labels[phase][0]} / ${labels[phase][1]}`;
  ui('#stage').dataset.phase = phase;
  ui('#stage').dataset.ending = String(['alone', 'attending'].includes(phase));
  const choosing = phase === 'choice';
  ui('#care-target').disabled = !choosing;
  ui('#abel-target').disabled = !choosing;
  ui('#gesture-guide').hidden = !choosing;
  ui('#offer').hidden = phase !== 'offerings';
  const hints = {
    offerings: ['二つの捧げ物を、差し出す。', 'Present both offerings.'],
    lifting: ['二人は、捧げる。', 'The two brothers offer their gifts.'],
    regarded: ['弟の捧げ物に、光が注ぐ。', 'Light falls on Abel’s offering.'],
    choice: ['兄の目に、怒りが宿る。', 'Anger gathers in Cain’s eyes.'],
    settling: ['兄は、籠の前にとどまる。', 'Cain stays with his basket.'],
    excluding: ['…', '…'], alone: ['', ''], attending: ['', '']
  };
  message('#hint', ...hints[phase]);
  if (phase === 'offerings') remember('offerings');
  if (phase === 'regarded') {
    remember('regarded', { elapsed: 1.2 });
    audio.play('regarded');
  }
  if (phase === 'choice') {
    remember('anger', { anger: .55, elapsed: 1 });
    audio.play('anger');
  }
  if (phase === 'excluding') {
    audio.silence(); audio.play('exclude');
    remember('excluding', { elapsed: .54, anger: .86 });
  }
  if (phase === 'alone') {
    audio.silence();
    remember('alone', { elapsed: 12, anger: 0 });
  }
  if (phase === 'attending') {
    audio.silence();
    remember('attending', { elapsed: 3, anger: 0 });
  }
}
function setup() {
  const stage = ui('#stage');
  canvas = createCanvas(stage.clientWidth, stage.clientHeight);
  canvas.parent(stage);
  canvas.attribute('role', 'img');
  canvas.attribute('aria-label', '左にカインと農作物の籠、右にアベルと羊の捧げ物。 / Cain and a basket of crops on the left; Abel and a sheep offering on the right.');
  pixelDensity(Math.min(devicePixelRatio, 2));
  frameRate(30);
  // The same renderer, body size, eye geometry, and body color for both brothers.
  cain = new Marpan25D({ autoBlink: false, bodyColor: '#f4f0e4' });
  abel = new Marpan25D({ autoBlink: false, bodyColor: '#f4f0e4' });
  story.onChange = onPhase;
  onPhase(story.phase);
  new ResizeObserver(() => {
    if (!exporting && (width !== stage.clientWidth || height !== stage.clientHeight)) resizeCanvas(stage.clientWidth, stage.clientHeight, true);
  }).observe(stage);
}
function draw() {
  if (exporting || document.hidden) return;
  story.tick(Math.min(deltaTime / 1000, .06));
  renderScene(story.frame());
}
function choose(action) {
  if (!story.choose(action)) return;
  const sound = story.phase === 'excluding' ? null : action === 'care' ? 'care' : 'blame';
  audio.gesture(sound);
  syncSoundButton();
  if (story.phase !== 'choice') return;
  if (action === 'care') message('#hint', '籠の中を、もう一度。', 'Return to what is in the basket.');
  else if (story.blame === 1) message('#hint', '兄の視線は、弟へ。', 'Cain turns his gaze toward Abel.');
  else message('#hint', '弟が、身をこわばらせる。', 'Abel grows uneasy.');
}
function syncSoundButton() {
  const enabled = audio.enabled && audio.context?.state === 'running';
  message('#sound', enabled ? '音 ON' : '音 OFF', enabled ? 'Sound ON' : 'Sound OFF');
  ui('#sound').setAttribute('aria-pressed', String(enabled));
}
ui('#offer').onclick = () => {
  if (!story.offer()) return;
  audio.gesture('offer').then(syncSoundButton);
};
ui('#care-target').onclick = () => choose('care');
ui('#abel-target').onclick = () => choose('blame');
ui('#reset').onclick = () => {
  audio.silence(); story.reset();
  // Starting over changes the narrative, but keeps reached scenes for the book.
};
ui('#sound').onclick = async () => {
  if (!audio.context) { audio.setEnabled(true); await audio.gesture(null); }
  else { audio.setEnabled(!audio.enabled); if (audio.enabled) await audio.gesture(null); }
  syncSoundButton();
};
document.addEventListener('visibilitychange', () => {
  audio.silence();
  if (audio.context) {
    if (document.hidden) audio.context.suspend().catch(() => {});
    else if (audio.enabled) audio.context.resume().catch(() => {});
  }
});

function renderScene(frame) {
  const ctx = drawingContext;
  push(); scale(width / 1000, height / 625); noStroke();
  const t = reducedMotion ? 0 : frame.clock;
  const phase = frame.phase, age = frame.elapsed;
  const fade = phase === 'alone' ? 0 : phase === 'excluding' ? 1 - ease((age - .18) / .88) : 1;
  const seen = !['offerings', 'lifting'].includes(phase);
  const beam = seen ? (phase === 'regarded' ? ease(age / .8) : 1) * fade : 0;
  const heat = Math.max(0, Math.min(1, frame.anger));
  const sky = ctx.createLinearGradient(0, 0, 0, 625);
  sky.addColorStop(0, '#152630'); sky.addColorStop(.7, '#3b494b'); sky.addColorStop(1, '#555750');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 1000, 625);
  // A horizon and continuous ground, rather than separate scenes.
  fill('#324146'); beginShape(); vertex(0, 385); bezierVertex(190, 352, 300, 389, 510, 370); bezierVertex(710, 354, 860, 380, 1000, 365); vertex(1000, 625); vertex(0, 625); endShape(CLOSE);
  fill('#656554'); beginShape(); vertex(0, 447); bezierVertex(235, 432, 345, 452, 530, 443); bezierVertex(760, 432, 895, 453, 1000, 440); vertex(1000, 625); vertex(0, 625); endShape(CLOSE);
  fill('#555749'); beginShape(); vertex(0, 508); bezierVertex(275, 486, 570, 531, 1000, 496); vertex(1000, 625); vertex(0, 625); endShape(CLOSE);
  stroke('#96927a33'); strokeWeight(1);
  for (let i = 0; i < 38; i++) {
    const x = (i * 127.7) % 1000, y = 514 + (i * 43.9) % 108;
    line(x, y, x + 9 + Math.sin(i) * 6, y - 1);
  }
  noStroke();
  // The light is a symbol only. No figure of God is drawn.
  const halo = ctx.createRadialGradient(500, 50, 0, 500, 50, 175);
  halo.addColorStop(0, '#eee5bf50'); halo.addColorStop(.5, '#eee5bf12'); halo.addColorStop(1, '#eee5bf00');
  ctx.fillStyle = halo; ctx.fillRect(320, 0, 360, 230);
  fill(236, 227, 191, 45); ellipse(500, 53, 135, 4);
  if (beam > 0) drawLight(beam, t);
  const lift = phase === 'lifting' ? ease(age / 1.2) * 48 : phase === 'regarded' ? (1 - ease(age / 1.2)) * 48 : 0;
  const lunge = phase === 'excluding' && !reducedMotion ? Math.sin(clamp01(age / .9) * Math.PI) * 58 : 0;
  const shake = reducedMotion ? 0 : Math.sin(t * 39) * heat * 2.2;
  const cx = 270 + shake + lunge, cy = 380 + (reducedMotion ? 0 : Math.sin(t * 1.3) * .9) - lift * .13;
  drawAnger(270, 380, heat, t);
  let lookX = 330, lookY = 475;
  if (phase === 'offerings' || phase === 'lifting' || phase === 'regarded') { lookX = 500; lookY = 50; }
  else if (phase === 'choice') {
    lookX = frame.lastAction === 'blame' ? 730 : 330;
    lookY = frame.lastAction === 'blame' ? 375 : 475;
  } else if (phase === 'excluding') { lookX = 730; lookY = 380; }
  else if (phase === 'alone' && age < 10) {
    lookX = Math.floor(age / 2.5) % 2 ? 730 : 330;
    lookY = lookX === 730 ? 380 : 475;
  }
  drawBrother(cain, cx, cy, heat, lookX, lookY, 'pupil');
  if (fade > .001) {
    ctx.save(); ctx.globalAlpha = fade;
    const fear = frame.blame >= 2 && ['choice', 'excluding'].includes(phase);
    const flinch = fear && !reducedMotion ? Math.sin(t * 17) * .85 : 0;
    drawBrother(abel, 730 + flinch, 380 + (reducedMotion ? 0 : Math.sin(t * 1.3 + 1) * .9) - lift * .13, 0,
      fear ? 270 : 500, fear ? 380 : 50, fear ? 'worried' : 'pupil');
    drawSheep(670, 483 - lift, t);
    ctx.restore();
  }
  drawBasket(330, 483 - lift, frame.care, frame.sinceAction, t);
  // The empty right side contains no name, offering, ghost, or replacement light.
  if (phase === 'excluding') {
    const darkness = Math.sin(clamp01(age / .9) * Math.PI) * .94;
    fill(4, 10, 16, darkness * 255); rect(0, 0, 1000, 625);
  }
  fill(238, 232, 206, 9);
  for (let i = 0; i < 160; i++) circle((i * 137.3) % 1000, (i * 79.7) % 625, 1);
  pop();
}
function drawLight(amount, time) {
  const ctx = drawingContext;
  ctx.save(); ctx.globalAlpha = amount;
  const light = ctx.createLinearGradient(500, 55, 670, 505);
  light.addColorStop(0, '#f3e8bd00'); light.addColorStop(.3, '#f3e8bd13'); light.addColorStop(1, '#f3e8bd57');
  ctx.fillStyle = light; ctx.beginPath(); ctx.moveTo(494, 58); ctx.lineTo(744, 498); ctx.quadraticCurveTo(670, 531, 591, 498); ctx.lineTo(506, 58); ctx.closePath(); ctx.fill();
  noStroke(); fill(243, 225, 172, 38); ellipse(670, 502, 170, 25);
  for (let i = 0; i < 9; i++) {
    const progress = ((time * .045 + i / 9) % 1 + 1) % 1;
    const x = 500 + 170 * progress + Math.sin(i * 7.3) * 34 * progress;
    fill(249, 235, 191, Math.sin(progress * Math.PI) * 70);
    circle(x, 60 + progress * 427, 1.6);
  }
  ctx.restore();
}
function drawBrother(character, x, y, heat, lookX, lookY, expression) {
  noStroke(); fill(17, 28, 30, 50); ellipse(x, 450, 183, 17);
  character.drawAt(x, y, { bodyWidth: 195, bodyHeight: 132.6, lookX, lookY, expression });
  // Same crossfade of the built-in eyes as LifeSketch 013; no new facial marks.
  if (heat > .01) {
    push(); translate(x, y); drawingContext.save(); drawingContext.globalAlpha *= Math.min(1, heat * 1.7);
    character.drawEyes(0, 0, 195, 132.6, 0, lookX - x, lookY - y, { expression: 'angry' });
    drawingContext.restore(); pop();
  }
}
function drawAnger(x, y, heat, time) {
  if (heat < .005) return;
  const ctx = drawingContext;
  const aura = ctx.createRadialGradient(x, y, 60, x, y, 140 + heat * 45);
  aura.addColorStop(0, '#b4543a00'); aura.addColorStop(.65, `rgba(185,71,47,${heat * .12})`); aura.addColorStop(1, '#b4543a00');
  ctx.fillStyle = aura; ctx.fillRect(x - 200, y - 220, 400, 380);
  noFill(); strokeWeight(1.5);
  for (let i = 0; i < 6; i++) {
    const side = i < 3 ? -1 : 1;
    const reach = 99 + (i % 3) * 13 + heat * 16;
    stroke(193, 86, 61, (40 + heat * 65) * heat);
    beginShape();
    for (let j = 0; j <= 12; j++) {
      const py = y + 47 - j * (8 + heat * 2);
      const px = x + side * (reach + Math.sin(time * 3 + j * .7 + i) * heat * 7);
      vertex(px, py);
    }
    endShape();
  }
  noStroke();
}
function drawBasket(x, y, care, sinceAction, time) {
  const bob = reducedMotion ? 0 : Math.sin(clamp01(sinceAction / .5) * Math.PI) * -5;
  push(); translate(x, y + bob); noStroke();
  fill(25, 32, 30, 45); ellipse(0, 12, 112, 19);
  const sorted = care / 4;
  for (let i = 0; i < 5; i++) {
    const angle = -.45 + i * .2;
    stroke('#c5b17d'); strokeWeight(2); line((i - 2) * 10, -10, (i - 2) * (10 - sorted * 2), -48 + Math.abs(i - 2) * 3);
    for (let j = 0; j < 3; j++) {
      const gx = (i - 2) * (10 - sorted * 2), gy = -42 + j * 7 + Math.abs(i - 2) * 3;
      noStroke(); fill('#b9a36c'); ellipse(gx - 3, gy, 4, 8); ellipse(gx + 3, gy + 2, 4, 8);
    }
  }
  for (let i = 0; i < 5; i++) {
    const px = (i - 2) * 17 + Math.sin(i * 7 + care) * (6 - sorted * 4);
    const py = -9 - (i % 2) * (9 + sorted * 3);
    fill(i % 2 ? '#ad8053' : '#a3a16c'); ellipse(px, py, 22, 21);
    stroke('#4b5840'); strokeWeight(2); line(px, py - 8, px + 2, py - 15); noStroke();
  }
  fill('#8c7351'); beginShape(); vertex(-57, -3); vertex(57, -3); vertex(45, 27); vertex(-45, 27); endShape(CLOSE);
  stroke('#b79a68'); strokeWeight(2);
  for (let i = -4; i <= 4; i++) line(i * 11, -1, i * 9, 24);
  line(-52, 8, 52, 8); line(-48, 18, 48, 18);
  stroke('#d2b584'); strokeWeight(3); line(-59, -4, 59, -4); noStroke(); pop();
}
function drawSheep(x, y) {
  push(); translate(x, y); noStroke();
  // An inert wool-and-lamb symbol on a platter, without a sacrifice depiction.
  fill(31, 38, 34, 45); ellipse(0, 11, 108, 18);
  fill('#a2a18d'); ellipse(0, 5, 112, 21);
  fill('#c4bfa3'); ellipse(0, 0, 103, 18);
  fill('#ddd9c4'); ellipse(-4, -19, 62, 36);
  for (let i = 0; i < 8; i++) circle(-29 + (i % 4) * 16, -23 + Math.floor(i / 4) * 12, 23);
  fill('#b4ad92'); ellipse(33, -24, 23, 29); ellipse(24, -38, 8, 17); ellipse(40, -38, 8, 17);
  fill('#3c4846'); circle(36, -27, 3);
  stroke('#b4ad92'); strokeWeight(5); line(-20, -9, -21, 0); line(13, -9, 13, 0);
  noStroke(); pop();
}

ui('#export').onclick = () => {
  const key = ui('#scene').value, frame = records[key];
  if (!frame || exporting) return;
  exporting = true; ui('#export').disabled = true;
  const w = width, h = height, density = pixelDensity();
  try {
    pixelDensity(1);
    const size = Number(ui('#resolution').value);
    resizeCanvas(size, size * 625 / 1000, true);
    renderScene(frame);
    // toBlob captures this frame before the interactive canvas is restored.
    canvas.elt.toBlob(blob => {
      if (!blob) { message('#notice', '書き出せませんでした。低い解像度でお試しください。', 'Could not export. Try a lower resolution.'); return; }
      if (imageURL) URL.revokeObjectURL(imageURL);
      exportBlob = blob;
      imageURL = URL.createObjectURL(blob);
      ui('#image').src = imageURL;
      ui('#download').href = imageURL;
      ui('#download').download = `bible-sketch-002-${key}.png`;
      ui('#export-notice').replaceChildren();
      if (!ui('#preview').open) ui('#preview').showModal();
    }, 'image/png');
  } catch (_) {
    message('#notice', '書き出しに失敗しました。低い解像度でお試しください。', 'Export failed. Try a lower resolution.');
  } finally {
    pixelDensity(density); resizeCanvas(w, h, true);
    renderScene(story.frame());
    exporting = false; ui('#export').disabled = false;
  }
};
ui('#share').onclick = async () => {
  if (!exportBlob) return;
  const file = new File([exportBlob], ui('#download').download, { type: 'image/png' });
  try {
    if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'カインとアベル / Cain and Abel' });
    else message('#export-notice', 'PNGを保存、または画像を長押ししてください。', 'Use Save PNG, or touch and hold the image.');
  } catch (error) {
    if (error.name !== 'AbortError') message('#export-notice', '共有できませんでした。画像の長押し保存をお試しください。', 'Could not share. Try touching and holding the image to save it.');
  }
};
ui('#close').onclick = () => ui('#preview').close();
