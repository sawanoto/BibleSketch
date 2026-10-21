/* global ArkWorld, ArkSound, ARK_HABITATS, ARK_SPECIES, arkSurface, arkRange, arkHabitat, Marpan25D */
'use strict';
const $ = selector => document.querySelector(selector);
const world = new ArkWorld();
const habitatNames = { forest: ['森林', 'Forest'], sea: ['海', 'Sea'], grassland: ['草原', 'Grassland'] };
const speciesNames = { dinosaur: ['非鳥類型恐竜', 'Non-avian dinosaurs'], bird: ['鳥類', 'Birds'], mammal: ['小型哺乳類', 'Small mammals'], reptile: ['爬虫類', 'Reptiles'], insect: ['昆虫', 'Insects'], fish: ['魚類', 'Fish'], shell: ['貝類', 'Shellfish'], crab: ['甲殻類', 'Crustaceans'] };
const scenes = { before: ['1. 生命に満ちた世界', 'A living world'], falling: ['2. 落下する隕石', 'The falling meteor'], impact: ['3. 衝突と衝撃波', 'Impact and shockwave'], winter: ['4. 失われた世界', 'The diminished world'], survivors: ['5. 小さな生存者', 'Small survivors'], world: ['6. 新しい生命の世界', 'The renewed world'] };
let canvas, motif, drag = null, records = {}, exporting = false, imageURL, exportBlob, soften = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sound = new ArkSound(() => message('#notice', '音を開始できません。音なしでも体験できます。', 'Sound could not start. You can continue without sound.'));
const clamp = n => Math.max(0, Math.min(1, n));
const ease = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
function message(selector, ja, en) {
  const span = document.createElement('span'); span.lang = 'en'; span.className = 'en'; span.textContent = en;
  $(selector).replaceChildren(document.createTextNode(ja), span);
}
function remember(key, overrides = {}) {
  records[key] = { ...world.frame(), ...overrides };
  $('#scene').replaceChildren(...Object.entries(scenes).map(([id, text]) => {
    const option = new Option(`${text[0]} / ${text[1]}`, id); option.disabled = !records[id]; return option;
  }));
  $('#scene').value = key;
}
function onPhase(phase) {
  sound.enter(phase);
  const chapter = { before: ['生命', 'Life'], falling: ['一度の落下', 'One fall'], impact: ['衝突', 'Impact'], winter: ['静寂', 'Silence'], survivors: ['生存', 'Survival'], renewal: ['幾世代もの時', 'Generations pass'], world: ['継承', 'Inheritance'] }[phase];
  $('#chapter').textContent = chapter.join(' / ');
  $('#stage').dataset.phase = phase;
  $('#meteor').disabled = phase !== 'before';
  $('#aim-label').hidden = true;
  const hints = {
    before: ['隕石を左右にドラッグして、落下地点を選ぶ。手を離すと、一度だけ落ちる。', 'Drag sideways to choose the impact point. Release to drop the meteor once.'],
    falling: ['落下地点は、もう変えられない。', 'The point of impact is now fixed.'],
    impact: ['…', '…'], winter: ['', ''],
    survivors: ['小さな営みが、残っている。', 'Small lives endure.'],
    renewal: ['長い時間が流れる。生き残った生命が、幾世代にもわたり増えていく。', 'A long span of time passes. Survivors multiply across many generations.'],
    world: ['', '']
  };
  message('#hint', ...hints[phase]);
  if (phase === 'before') remember('before', { clock: 2 });
  if (phase === 'falling') remember('falling', { elapsed: .75 });
  if (phase === 'impact') remember('impact', { elapsed: .42 });
  if (phase === 'winter') remember('winter', { elapsed: 1.8 });
  if (phase === 'survivors') { remember('survivors', { elapsed: 3.2 }); showResults(); }
  if (phase === 'world') { remember('world', { elapsed: 1.3 }); showResults(); }
  if (canvas) canvas.attribute('aria-label', phase === 'before' ? '森林、海、草原に恐竜と小さな生命が暮らす世界 / Dinosaurs and small life inhabit a forest, sea, and grassland' : `${habitatNames[world.zone][0]}への衝突後の世界 / After an impact in the ${world.zone}`);
}
function showResults() {
  const before = world.counts('life'), survivors = world.counts(), renewed = world.counts('renewed');
  $('#results').hidden = false;
  const refuge = {
    forest: ['深い水、草原の巣穴や岩陰に、生命が残った。', 'Life endured in deeper water and in burrows and rocks farther away.'],
    sea: ['海と沿岸は大きな被害を受けた。地中や岩陰の小さな生命が残った。', 'The sea and coasts suffered heavily. Small lives persisted in burrows and rock shelters.'],
    grassland: ['森の巣穴や倒木、海底に、生命が残った。', 'Life endured in forest burrows, fallen wood, and on the seabed.']
  };
  message('#shelters', ...refuge[world.zone]);
  $('#population').replaceChildren(...ARK_SPECIES.map(type => {
    const row = document.createElement('tr'), label = document.createElement('th'); label.scope = 'row'; label.textContent = speciesNames[type][0];
    const en = document.createElement('span'); en.lang = 'en'; en.textContent = speciesNames[type][1]; label.append(en); row.append(label);
    for (const habitat of ARK_HABITATS) { const cell = document.createElement('td'); cell.textContent = `${before[habitat][type]} → ${survivors[habitat][type]} → ${world.phase === 'world' ? renewed[habitat][type] : '…'}`; row.append(cell); }
    return row;
  }));
}
function setup() {
  const stage = $('#stage'); canvas = createCanvas(stage.clientWidth, stage.clientHeight); canvas.parent(stage);
  canvas.attribute('role', 'img'); pixelDensity(Math.min(devicePixelRatio, 2)); frameRate(30);
  motif = new Marpan25D({ autoBlink: false });
  $('#soften').checked = soften;
  world.onPhase = onPhase; onPhase('before');
  new ResizeObserver(() => { if (!exporting && (width !== stage.clientWidth || height !== stage.clientHeight)) resizeCanvas(stage.clientWidth, stage.clientHeight, true); }).observe(stage);
  syncMeteor();
}
function draw() {
  if (exporting || document.hidden || $('#preview').open) return;
  world.tick(Math.min(deltaTime / 1000, .06)); renderScene(world.frame()); sound.tick(world.frame(), world.survivors);
}
function syncSound() {
  const active = sound.enabled && sound.context?.state === 'running';
  message('#sound', active ? '音 ON' : '音 OFF', active ? 'Sound ON' : 'Sound OFF'); $('#sound').setAttribute('aria-pressed', String(active));
}
function unlock() { sound.unlock().then(syncSound); }
function eventPoint(event) {
  const rect = $('#stage').getBoundingClientRect();
  return { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
}
function syncMeteor() {
  $('#meteor').style.left = `${world.aimX * 100}%`; $('#meteor').style.top = `${world.aimY * 100}%`;
  if (drag || document.activeElement === $('#meteor')) {
    const name = habitatNames[arkHabitat(world.aimX)]; $('#aim-label').textContent = name.join(' / '); $('#aim-label').hidden = false;
  }
}
$('#meteor').addEventListener('pointerdown', event => {
  if (world.phase !== 'before' || drag) return;
  event.preventDefault(); unlock();
  drag = { pointerId: event.pointerId, start: eventPoint(event), originX: world.aimX, originY: world.aimY };
  $('#meteor').setPointerCapture(event.pointerId); syncMeteor();
});
$('#meteor').addEventListener('pointermove', event => {
  if (!drag || drag.pointerId !== event.pointerId || world.phase !== 'before') return;
  const p = eventPoint(event); world.aimX = Math.max(.04, Math.min(.96, p.x)); world.aimY = .14; syncMeteor();
});
function cancelDrag() {
  if (!drag) return;
  world.aimX = drag.originX; world.aimY = drag.originY; drag = null; $('#aim-label').hidden = true; syncMeteor();
}
$('#meteor').addEventListener('pointerup', event => {
  if (!drag || drag.pointerId !== event.pointerId) return;
  const p = eventPoint(event), start = drag.start;
  const valid = p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1 && Math.hypot(p.x - start.x, p.y - start.y) > .025;
  if (!valid) { cancelDrag(); return; }
  drag = null; if (world.drop(world.aimX)) unlock();
});
$('#meteor').addEventListener('pointercancel', cancelDrag);
$('#meteor').addEventListener('lostpointercapture', cancelDrag);
$('#meteor').addEventListener('keydown', event => {
  if (world.phase !== 'before' || event.repeat) return;
  if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault(); world.aimX = Math.max(.04, Math.min(.96, world.aimX + (event.key === 'ArrowLeft' ? -.04 : .04))); syncMeteor();
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault(); drag = null; if (world.drop(world.aimX)) unlock();
  }
});
$('#meteor').addEventListener('focus', syncMeteor);
$('#meteor').addEventListener('blur', () => { if (!drag) $('#aim-label').hidden = true; });
$('#reset').onclick = () => {
  sound.stop(); drag = null; records = {}; world.reset(); $('#results').hidden = true; $('#population').replaceChildren(); syncMeteor();
  message('#notice', 'このプレイで体験した6場面を保存できます。リセットすると今回の記録も初期化します。', 'Export the six scenes reached in this play. Start over clears this play’s records.');
};
$('#sound').onclick = async () => {
  if (!sound.context) sound.setEnabled(true); else sound.setEnabled(!sound.enabled);
  if (sound.enabled) await sound.unlock(); syncSound();
};
$('#soften').onchange = () => { soften = $('#soften').checked; };
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { sound.stop(); cancelDrag(); if (sound.context) sound.context.suspend().catch(() => {}); }
  else if (sound.enabled && sound.context) sound.unlock().then(syncSound);
});

function renderScene(frame) {
  push(); scale(width / 1000, height / 625); noStroke();
  const ctx = drawingContext, p = frame.phase, age = frame.elapsed, t = soften ? 0 : frame.clock;
  const pre = ['before', 'falling'].includes(p), recovering = ['renewal', 'world'].includes(p);
  const growth = p === 'renewal' ? ease(age / 8.5) : p === 'world' ? 1 : 0;
  const dust = pre ? 0 : p === 'impact' ? ease(age / 2) * .92 : .92 * (1 - growth);
  if (p === 'impact' && !soften) translate(Math.sin(age * 71) * Math.exp(-age * 2) * 9, Math.cos(age * 53) * Math.exp(-age * 2) * 5);
  const sky = ctx.createLinearGradient(0, 0, 0, 430);
  sky.addColorStop(0, '#8fb8bd'); sky.addColorStop(.8, '#d3d1b3'); sky.addColorStop(1, '#dad0a9');
  ctx.fillStyle = sky; ctx.fillRect(-20, -20, 1040, 665);
  fill(248, 225, 163, 130 * (1 - dust)); circle(825, 90, 50);
  fill('#738c7d'); beginShape(); vertex(0, 348); bezierVertex(140, 275, 238, 295, 355, 402); vertex(510, 625); vertex(0, 625); endShape(CLOSE);
  fill('#8b9b75'); beginShape(); vertex(645, 410); bezierVertex(773, 330, 876, 319, 1000, 356); vertex(1000, 625); vertex(610, 625); endShape(CLOSE);
  // One continuous cross-section, with the sea nestled between connected coasts.
  fill('#3d7981'); beginShape(); vertex(340, 405); vertex(668, 405); vertex(690, 625); vertex(308, 625); endShape(CLOSE);
  fill('#325864'); beginShape(); vertex(355, 565); bezierVertex(430, 603, 562, 608, 651, 563); vertex(680, 625); vertex(320, 625); endShape(CLOSE);
  fill('#766e50'); beginShape(); vertex(0, 405); for (let x = 0; x <= 355; x += 5) vertex(x, arkSurface(x / 1000)); vertex(402, 625); vertex(0, 625); endShape(CLOSE);
  fill('#a09763'); beginShape(); vertex(645, 625); vertex(665, 405); for (let x = 665; x <= 1000; x += 5) vertex(x, arkSurface(x / 1000)); vertex(1000, 625); endShape(CLOSE);
  fill('#394c42'); ellipse(113, 451, 62, 25); fill('#182e2b'); ellipse(113, 449, 35, 14);
  fill('#756f58'); ellipse(837, 422, 66, 34); fill('#4c4e40'); ellipse(825, 427, 30, 17);
  stroke(206, 222, 192, 75); strokeWeight(1.2); noFill();
  for (let j = 0; j < 5; j++) { beginShape(); for (let x = 350; x <= 655; x += 10) vertex(x, 407 + j * 27 + Math.sin(x * .025 + t * .7 + j) * 2); endShape(); }
  noStroke();
  if (!pre && frame.zone !== 'sea') {
    fill(52, 49, 40, (1 - growth * .65) * 170); ellipse(frame.impactX * 1000, arkSurface(frame.impactX) + 7, 131, 29);
    fill(33, 39, 35, (1 - growth * .8) * 170); ellipse(frame.impactX * 1000, arkSurface(frame.impactX) + 2, 86, 17);
  }
  drawPlants(frame, dust, growth, t);
  const survivors = new Set(world.survivors.map(a => a.id));
  for (const animal of world.life) {
    let alpha = 1, emergence = 1;
    if (!pre) {
      if (!survivors.has(animal.id)) alpha = p === 'impact' ? 1 - ease((age - Math.abs(animal.x - frame.impactX) * .6) / (animal.type === 'dinosaur' ? 2 : 1.4)) : 0;
      else if (['impact', 'winter'].includes(p)) alpha = p === 'impact' ? 1 - ease(age / 1.5) * .92 : .08;
      else { emergence = p === 'survivors' ? ease((age - (animal.seed % 1) * 1.2) / 2) : 1; alpha = .08 + emergence * .92; }
    }
    if (alpha > .005) drawAnimal(animal, t, alpha, pre ? 1 : emergence, !pre && !recovering);
  }
  if (recovering) {
    const visible = Math.floor(world.descendants.length * growth);
    for (let i = 0; i < visible; i++) drawAnimal(world.descendants[i], t, Math.min(1, (world.descendants.length * growth - i) * .6), 1, false);
  }
  if (dust > 0) {
    fill(30, 36, 39, dust * 187); rect(-20, -20, 1040, 665);
    for (let i = 0; i < 14; i++) { const x = ((i * 107 + t * 5) % 1200) - 100; fill(51, 51, 48, dust * 22); ellipse(x, 120 + i % 3 * 85, 250, 77); }
  }
  if (p === 'impact') drawImpact(frame, t);
  if (p === 'before' || p === 'falling') {
    let mx = frame.aimX * 1000, my = frame.aimY * 625;
    if (p === 'falling') {
      const fall = ease(age / 1.3); mx += (frame.impactX * 1000 - mx) * fall; my += (arkSurface(frame.impactX) - my) * fall;
      stroke('#f5dd9d'); strokeWeight(4); line(mx - 25, my - 78, mx, my); noStroke();
      for (let i = 6; i > 0; i--) { fill(244, 193, 115, 11); ellipse(mx, my - i * 10, 25 + i * 6, 40 + i * 8); }
    }
    drawMeteor(mx, my);
  }
  if (p === 'before' && (drag || document.activeElement === $('#meteor'))) {
    const x = frame.aimX * 1000, y = arkSurface(frame.aimX);
    stroke('#fff0b1'); strokeWeight(1.5); drawingContext.setLineDash([5, 6]); line(x, frame.aimY * 625 + 39, x, y); drawingContext.setLineDash([]);
    noFill(); ellipse(x, y, 55, 15); line(x - 9, y, x + 9, y); line(x, y - 9, x, y + 9); noStroke();
  }
  if (p === 'world' && age < 3.2) drawArk(age);
  fill(249, 240, 208, 11); for (let i = 0; i < 140; i++) circle((i * 137.3) % 1000, (i * 79.7) % 625, 1);
  pop();
}
function drawPlants(frame, dust, growth, time) {
  const pre = ['before', 'falling'].includes(frame.phase), affected = frame.zone;
  for (let i = 0; i < 6; i++) {
    const x = 32 + i * 52, y = arkSurface(x / 1000), height = 110 + (i % 3) * 27;
    const local = (affected === 'forest' ? .10 : affected === 'sea' && i > 3 ? .18 : .36) + (pre ? 0 : Math.min(.13, Math.abs(x / 1000 - frame.impactX) * .38));
    const canopy = pre ? 1 : frame.phase === 'impact' ? 1 - ease(frame.elapsed / 2) * (1 - local) : local + growth * (affected === 'forest' ? .53 : .72);
    push(); translate(x, y); stroke('#635b3d'); strokeWeight(9); line(0, 0, Math.sin(time * .4 + i) * 1.3, -height); noStroke();
    fill(49, 89, 59, 255 * canopy); ellipse(0, -height, 66, 72); fill(75, 113, 67, 245 * canopy); ellipse(-17, -height + 20, 48, 60);
    if (!pre && growth > .1) { fill('#81a06a'); ellipse(16, -35 * growth, 22 * growth, 35 * growth); } pop();
  }
  for (let i = 0; i < 12; i++) {
    const x = 686 + i * 27, y = arkSurface(x / 1000), health = pre ? 1 : (affected === 'grassland' ? .12 + Math.abs(x / 1000 - frame.impactX) * .25 : .32) + growth * .7;
    stroke(104, 128, 65, 255 * Math.min(1, health)); strokeWeight(2);
    for (let j = -2; j <= 2; j++) line(x, y, x + j * 5 + Math.sin(time + i) * 2, y - (25 - Math.abs(j) * 5) * health);
    noStroke(); if (i % 4 === 1) { fill(91, 124, 64, health * 230); ellipse(x, y - 14 * health, 44, 30 * health); }
  }
  for (let i = 0; i < 6; i++) {
    const x = 414 + i * 36, health = pre ? 1 : (affected === 'sea' ? .09 : .3) + growth * .68;
    stroke(72, 123, 92, health * 230); strokeWeight(3); noFill();
    beginShape(); vertex(x, 581); bezierVertex(x - 12, 550, x + 20 + Math.sin(time + i) * 5, 544, x, 525 + (1 - health) * 45); endShape(); noStroke();
  }
}
function drawAnimal(a, time, alpha, emerged, quiet) {
  const ctx = drawingContext; ctx.save(); ctx.globalAlpha = clamp(alpha);
  const range = arkRange(a.habitat), drift = Math.sin(time * .45 + a.seed) * (a.type === 'bird' ? 22 : a.type === 'fish' ? 12 : 4);
  let x = Math.max(range[0] * 1000, Math.min(range[1] * 1000, a.x * 1000 + drift));
  let y = a.y;
  if (a.type === 'mammal' || a.type === 'reptile') y = arkSurface(x / 1000) + (1 - emerged) * 13;
  if (a.type === 'bird') y += Math.sin(time + a.seed) * 7 + (1 - emerged) * 90;
  if (a.type === 'fish' || a.type === 'insect') y += Math.sin(time * 1.5 + a.seed) * 3;
  if (quiet && ['mammal', 'reptile'].includes(a.type)) { ctx.beginPath(); ctx.rect(x - 48, arkSurface(x / 1000) - 180, 96, 181); ctx.clip(); }
  push(); translate(x, y); noStroke();
  const moving = quiet ? emerged * .5 : 1;
  if (a.type === 'dinosaur') {
    const forest = a.habitat === 'forest'; fill(forest ? '#506f62' : '#8e7954');
    ellipse(0, -31, 78, 42); stroke(forest ? '#506f62' : '#8e7954'); strokeWeight(12);
    line(-22, -20, -25 + Math.sin(time * 2 + a.seed) * 2, 0); line(20, -20, 21, 0);
    if (forest) { line(25, -37, 39, -91); noStroke(); ellipse(45, -94, 29, 17); triangle(-30, -36, -78, -16, -27, -20); }
    else { noStroke(); ellipse(43, -40, 35, 27); fill('#b7a175'); triangle(45, -53, 49, -68, 53, -49); triangle(35, -52, 35, -63, 42, -49); triangle(-30, -35, -66, -17, -24, -21); }
    noStroke(); fill('#223c38'); circle(forest ? 51 : 50, forest ? -96 : -43, 3);
  } else if (a.type === 'mammal') {
    fill('#9c8260'); ellipse(0, -8, 22, 13); ellipse(12, -12, 13, 11); circle(8, -19, 7); triangle(15, -14, 23, -9, 14, -7);
    stroke('#8d7655'); strokeWeight(2); noFill(); bezier(-10, -7, -22, -14, -18, 0, -29, -2); line(-4, -4, -5 + Math.sin(time * 4 + a.seed) * moving, 0); line(7, -4, 8, 0); noStroke(); fill('#273a36'); circle(15, -14, 2);
  } else if (a.type === 'reptile') {
    fill('#789063'); ellipse(0, -5, 25, 9); ellipse(15, -8, 12, 8); triangle(-9, -6, -32, -1, -8, -2); stroke('#789063'); strokeWeight(2); for (const dx of [-7, 7]) { line(dx, -4, dx - 4, 1); line(dx, -5, dx + 3, -11); } noStroke(); fill('#2a443b'); circle(18, -9, 1.5);
  } else if (a.type === 'bird') {
    stroke('#304d50'); strokeWeight(2.5); noFill(); const wing = Math.sin(time * 4 + a.seed) * 7;
    beginShape(); vertex(-12, wing); vertex(0, 3); vertex(12, wing); endShape(); noStroke(); fill('#304d50'); ellipse(0, 2, 10, 4);
  } else if (a.type === 'fish') {
    fill(a.protection > .6 ? '#c4c4a1' : '#99bfc0'); ellipse(0, 0, 22, 10); triangle(-9, 0, -17, -6, -17, 6); fill('#25464d'); circle(7, -1, 2);
  } else if (a.type === 'shell') {
    fill('#c0ae8a'); arc(0, 0, 18, 19, Math.PI, Math.PI * 2, CHORD); stroke('#8c8e76'); strokeWeight(1); line(0, 0, -4, -8); line(0, 0, 4, -8); line(0, 0, 0, -9); noStroke();
  } else if (a.type === 'crab') {
    fill('#b08e70'); ellipse(0, -3, 15, 9); stroke('#b08e70'); strokeWeight(1.5); for (const side of [-1, 1]) { line(side * 5, -1, side * 10, 1); line(side * 6, -4, side * 13, -10); } noStroke();
  } else {
    fill('#c8c197'); ellipse(-3, -3, 9, 4); ellipse(3, -3, 9, 4); fill('#3c5549'); ellipse(0, 0, 4, 8);
  }
  pop(); ctx.restore();
}
function drawMeteor(x, y) {
  push(); translate(x, y); noStroke(); fill('#7a7062'); beginShape(); for (let i = 0; i < 9; i++) { const angle = i * Math.PI * 2 / 9, radius = 32 + (i % 3) * 3; vertex(Math.cos(angle) * radius, Math.sin(angle) * radius); } endShape(CLOSE);
  fill('#a2957c'); ellipse(-12, -11, 20, 13); fill('#5d5a55'); circle(15, 17, 12);
  // The shared eyes are a graphic motif on a rock, not a prehistoric human.
  motif.drawEyes(0, 0, 77, 52.36, 0, 0, 10, { expression: 'pupil' }); pop();
}
function drawImpact(frame) {
  const age = frame.elapsed, x = frame.impactX * 1000, y = arkSurface(frame.impactX);
  noFill(); stroke(245, 224, 163, Math.max(0, 1 - age / 2.6) * 190); strokeWeight(3);
  ellipse(x, y, age * 820, age * 240); ellipse(x, y, age * 580, age * 480); noStroke();
  for (let i = 0; i < 12; i++) {
    const direction = (i - 5.5) / 5.5, distance = age * (100 + i % 3 * 26);
    fill(114, 99, 72, Math.max(0, 1 - age / 2.6) * 120); ellipse(x + direction * distance, y - Math.sin(clamp(age / 2.6) * Math.PI) * (70 + i % 4 * 22), 45 + age * 35, 26 + age * 22);
  }
  if (frame.zone === 'sea') {
    noFill(); stroke(190, 220, 203, Math.max(0, 1 - age / 2.6) * 200); strokeWeight(7);
    for (const side of [-1, 1]) { const wx = x + side * age * 135; beginShape(); vertex(wx - side * 42, 405); bezierVertex(wx, 395, wx - side * 35, 337 + age * 15, wx + side * 13, 405); endShape(); } noStroke();
  }
  const flash = Math.max(0, 1 - age / .52) * (soften ? .14 : .92);
  fill(255, 245, 214, flash * 255); rect(-20, -20, 1040, 665);
}
function drawArk(age) {
  const opacity = Math.sin(clamp(age / 3.2) * Math.PI) * 90;
  noFill(); stroke(248, 225, 165, opacity); strokeWeight(1.5);
  beginShape(); vertex(68, 391); bezierVertex(178, 612, 822, 612, 932, 391); endShape();
  stroke(248, 225, 165, opacity * .5); beginShape(); vertex(68, 391); bezierVertex(285, 299, 715, 299, 932, 391); endShape(); noStroke();
}

$('#export').onclick = () => {
  const key = $('#scene').value, frame = records[key]; if (!frame || exporting) return;
  exporting = true; $('#export').disabled = true;
  const w = width, h = height, density = pixelDensity();
  try {
    pixelDensity(1); const size = Number($('#resolution').value); resizeCanvas(size, size * .625, true); renderScene(frame);
    canvas.elt.toBlob(blob => {
      if (!blob) { message('#notice', '保存できませんでした。低い解像度をお試しください。', 'Could not export. Try a lower resolution.'); return; }
      if (imageURL) URL.revokeObjectURL(imageURL); imageURL = URL.createObjectURL(blob); exportBlob = blob;
      $('#image').src = imageURL; $('#download').href = imageURL; $('#download').download = `bible-sketch-003-${world.zone || 'before'}-${key}.png`;
      $('#export-notice').replaceChildren(); sound.stop(); if (!$('#preview').open) $('#preview').showModal();
    }, 'image/png');
  } catch (_) { message('#notice', '書き出しに失敗しました。低い解像度をお試しください。', 'Export failed. Try a lower resolution.'); }
  finally { pixelDensity(density); resizeCanvas(w, h, true); renderScene(world.frame()); exporting = false; $('#export').disabled = false; }
};
$('#share').onclick = async () => {
  if (!exportBlob) return; const file = new File([exportBlob], $('#download').download, { type: 'image/png' });
  try { if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'ノアの方舟 / Noah’s Ark' }); else message('#export-notice', 'PNGを保存、または画像を長押ししてください。', 'Use Save PNG, or touch and hold the image.'); }
  catch (error) { if (error.name !== 'AbortError') message('#export-notice', '共有できませんでした。画像の長押し保存をお試しください。', 'Could not share. Touch and hold the image to save it.'); }
};
$('#close').onclick = () => $('#preview').close();
