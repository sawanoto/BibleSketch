'use strict';
/* Fictional, deterministic scenarios: quotas are design choices, not forecasts. */
const ARK_HABITATS = ['forest', 'sea', 'grassland'];
const ARK_SPECIES = ['dinosaur', 'bird', 'mammal', 'reptile', 'insect', 'fish', 'shell', 'crab'];
const ARK_INITIAL = {
  forest: { dinosaur: 2, bird: 2, mammal: 4, reptile: 2, insect: 4 },
  sea: { fish: 10, shell: 8, crab: 4 },
  grassland: { dinosaur: 2, bird: 2, mammal: 4, reptile: 4, insect: 4 }
};
const ARK_SCENARIOS = {
  forest: {
    forest: { bird: 1, mammal: 1, reptile: 0, insect: 1 },
    sea: { fish: 6, shell: 5, crab: 2 },
    grassland: { bird: 2, mammal: 3, reptile: 3, insect: 3 }
  },
  sea: {
    forest: { bird: 1, mammal: 3, reptile: 1, insect: 2 },
    sea: { fish: 2, shell: 2, crab: 0 },
    grassland: { bird: 1, mammal: 3, reptile: 2, insect: 2 }
  },
  grassland: {
    forest: { bird: 2, mammal: 3, reptile: 1, insect: 3 },
    sea: { fish: 5, shell: 6, crab: 3 },
    grassland: { bird: 0, mammal: 1, reptile: 1, insect: 1 }
  }
};
const arkClamp = (value, low, high) => Math.max(low, Math.min(high, value));
function arkHabitat(x) { return x < .355 ? 'forest' : x < .665 ? 'sea' : 'grassland'; }
function arkRange(habitat) { return { forest: [.055, .315], sea: [.395, .625], grassland: [.705, .945] }[habitat]; }
function arkSurface(x) { return x < .355 ? 405 - 20 * Math.sin(x * 9) : x < .665 ? 405 : 406 - 11 * Math.sin((x - .665) * 11); }
function arkLife() {
  const life = [];
  for (const habitat of ARK_HABITATS) {
    for (const [type, count] of Object.entries(ARK_INITIAL[habitat])) {
      const range = arkRange(habitat);
      for (let i = 0; i < count; i++) {
        const seed = life.length * 1.731 + .7;
        const fraction = ((i + .45) / count + (ARK_SPECIES.indexOf(type) * .153)) % 1;
        const x = range[0] + fraction * (range[1] - range[0]);
        const protection = ['mammal', 'shell'].includes(type) ? .8 + (i % 2) * .12 : type === 'reptile' ? .55 + (i % 2) * .14 : type === 'fish' ? .3 + (i % 3) * .23 : type === 'insect' ? .65 : .25;
        const y = type === 'bird' ? 260 + i * 22 : type === 'insect' ? arkSurface(x) - 28 - i * 9 : type === 'fish' ? 449 + (i % 3) * 41 : ['shell', 'crab'].includes(type) ? 559 + (i % 2) * 12 : arkSurface(x);
        life.push({ id: `${habitat}-${type}-${i}`, habitat, type, x, y, protection, seed, descendant: false });
      }
    }
  }
  return life;
}
function arkSurvival(life, x) {
  const zone = arkHabitat(x), quotas = ARK_SCENARIOS[zone];
  const survivors = [];
  for (const habitat of ARK_HABITATS) {
    for (const type of ARK_SPECIES) {
      if (type === 'dinosaur') continue; // Non-avian dinosaurs always disappear, including far from the strike.
      const candidates = life.filter(a => a.type === type && a.habitat === habitat);
      const score = a => a.protection * .55 + Math.abs(a.x - x) * 1.5 - (zone === 'sea' && habitat !== 'sea' && Math.abs(a.x - .51) < .24 ? .3 : 0);
      candidates.sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id));
      survivors.push(...candidates.slice(0, quotas[habitat][type] || 0));
    }
  }
  return survivors;
}
function arkDescendants(survivors) {
  const offspring = [];
  for (const parent of survivors) {
    const multiplier = { bird: 1, mammal: 2, reptile: 1, insect: 2, fish: 2, shell: 1, crab: 1 }[parent.type];
    const [low, high] = arkRange(parent.habitat);
    for (let i = 0; i < multiplier && survivors.length + offspring.length < 128; i++) {
      const x = arkClamp(parent.x + Math.sin(parent.seed * 3 + i * 7) * .042, low, high);
      offspring.push({ ...parent, x, y: parent.habitat === 'sea' ? parent.y + Math.sin(i + parent.seed) * 8 : parent.type === 'bird' || parent.type === 'insect' ? parent.y : arkSurface(x),
        id: `${parent.id}-next-${i}`, parentId: parent.id, descendant: true, seed: parent.seed + (i + 1) * 4.7 });
    }
  }
  return offspring;
}
class ArkWorld {
  constructor() { this.onPhase = () => {}; this.reset(); }
  reset() {
    this.phase = 'before'; this.elapsed = 0; this.clock = 0; this.aimX = .5; this.aimY = .14;
    this.impactX = null; this.zone = null; this.drops = 0;
    this.life = arkLife(); this.survivors = []; this.descendants = [];
    this.onPhase('before');
  }
  drop(x) {
    if (this.phase !== 'before' || this.drops !== 0 || !Number.isFinite(x)) return false;
    this.impactX = arkClamp(x, .04, .96); this.zone = arkHabitat(this.impactX); this.drops = 1;
    this.survivors = arkSurvival(this.life, this.impactX); this.descendants = arkDescendants(this.survivors);
    this.transition('falling'); return true;
  }
  transition(phase) { this.phase = phase; this.elapsed = 0; this.onPhase(phase); }
  tick(dt) {
    if (!Number.isFinite(dt) || dt < 0) return;
    this.clock += dt; this.elapsed += dt;
    const durations = { falling: [1.3, 'impact'], impact: [2.6, 'winter'], winter: [3.2, 'survivors'], survivors: [4.5, 'renewal'], renewal: [8.5, 'world'] };
    // Consume time once so simulation and export do not rely on frame count.
    while (durations[this.phase] && this.elapsed >= durations[this.phase][0]) {
      const [duration, next] = durations[this.phase], remainder = this.elapsed - duration;
      this.transition(next); this.elapsed = remainder;
    }
  }
  frame() { return { phase: this.phase, elapsed: this.elapsed, clock: this.clock, aimX: this.aimX, aimY: this.aimY, impactX: this.impactX, zone: this.zone }; }
  counts(which = 'survivors') {
    const list = which === 'renewed' ? [...this.survivors, ...this.descendants] : this[which];
    return Object.fromEntries(ARK_HABITATS.map(h => [h, Object.fromEntries(ARK_SPECIES.map(s => [s, list.filter(a => a.habitat === h && a.type === s).length]))]));
  }
}
if (typeof module !== 'undefined') module.exports = { ArkWorld, arkLife, arkSurvival, arkDescendants, ARK_HABITATS, ARK_SPECIES, ARK_SCENARIOS, arkHabitat };
