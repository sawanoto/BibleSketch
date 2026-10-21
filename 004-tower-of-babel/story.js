'use strict';
const BABEL_DIRECTIONS = ['left', 'down', 'right', 'up'];
const BABEL_BUILD_SECONDS = 6.8;
const babelClamp = value => Math.max(0, Math.min(1, value));
const babelEase = value => { const t = babelClamp(value); return t * t * (3 - 2 * t); };
class BabelStory {
  constructor(count = 8, random = Math.random) {
    this.random = random; this.onPhase = () => {}; this.onMilestone = () => {}; this.reset(count);
  }
  reset(count = this.count) {
    this.count = count === 6 ? 6 : 8;
    this.turns = this.count === 6 ? [0, 2, 1, 3, 0, 2] : [0, 2, 1, 3, 0, 2, 1, 3];
    for (let i = this.count - 1; i > 0; i--) { const j = Math.floor(this.random() * (i + 1)); [this.turns[i], this.turns[j]] = [this.turns[j], this.turns[i]]; }
    this.phase = 'planning'; this.elapsed = 0; this.clock = 0; this.changes = 0; this.starts = 0;
    this.tweenFrom = [...this.turns]; this.changedAt = this.turns.map(() => -10);
    this.initialUp = this.upCount; this.onPhase('planning');
  }
  get directions() { return this.turns.map(turn => BABEL_DIRECTIONS[turn % 4]); }
  get upCount() { return this.turns.filter(turn => turn % 4 === 3).length; }
  get progress() { return this.phase === 'complete' ? 1 : this.phase === 'building' ? babelEase(this.elapsed / BABEL_BUILD_SECONDS) : 0; }
  displayedTurn(index) { return this.tweenFrom[index] + (this.turns[index] - this.tweenFrom[index]) * babelEase((this.clock - this.changedAt[index]) / .18); }
  cycle(index) {
    if (this.phase !== 'planning' || !Number.isInteger(index) || index < 0 || index >= this.count) return false;
    this.tweenFrom[index] = this.displayedTurn(index); this.changedAt[index] = this.clock;
    this.turns[index]++; this.changes++;
    if (this.upCount === this.count) {
      this.phase = 'building'; this.elapsed = 0; this.starts++; this.onPhase('building');
    }
    return true;
  }
  tick(dt) {
    if (!Number.isFinite(dt) || dt < 0) return;
    const previous = this.elapsed; this.clock += dt; this.elapsed += dt;
    if (this.phase !== 'building') return;
    if (previous < 3.2 && this.elapsed >= 3.2) this.onMilestone('building');
    if (this.elapsed >= BABEL_BUILD_SECONDS) { this.phase = 'complete'; this.elapsed -= BABEL_BUILD_SECONDS; this.onPhase('complete'); }
  }
  frame() {
    return { count: this.count, turns: [...this.turns], tweenFrom: [...this.tweenFrom], changedAt: [...this.changedAt],
      phase: this.phase, elapsed: this.elapsed, clock: this.clock, changes: this.changes, freezeArrows: false, view: 'wide' };
  }
}
if (typeof module !== 'undefined') module.exports = { BabelStory, BABEL_DIRECTIONS, BABEL_BUILD_SECONDS };
