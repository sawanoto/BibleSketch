'use strict';
/* Narrative state and time are independent of drawing, audio, and export. */
class CainAbelStory {
  constructor(onChange = () => {}) {
    this.onChange = onChange;
    this.reset();
  }
  reset() {
    this.phase = 'offerings';
    this.elapsed = 0;
    this.clock = 0;
    this.care = 0;
    this.blame = 0;
    this.anger = 0;
    this.lastAction = '';
    this.lastActionAt = -10;
    this.onChange(this.phase);
  }
  transition(phase) {
    this.phase = phase;
    this.elapsed = 0;
    this.onChange(phase);
  }
  offer() {
    if (this.phase !== 'offerings') return false;
    this.transition('lifting');
    return true;
  }
  choose(action) {
    if (this.phase !== 'choice' || !['care', 'blame'].includes(action) || this.clock - this.lastActionAt < .35) return false;
    this.lastAction = action;
    this.lastActionAt = this.clock;
    if (action === 'care') {
      this.care++;
      if (this.care === 4) this.transition('settling');
    } else {
      this.blame++;
      if (this.blame === 3) this.transition('excluding');
    }
    return true;
  }
  tick(dt) {
    if (!Number.isFinite(dt) || dt < 0) return;
    this.elapsed += dt;
    this.clock += dt;
    const target = this.phase === 'choice' ? Math.min(.98, .55 * (1 - this.care / 4) + this.blame * .16)
      : this.phase === 'excluding' ? Math.max(0, 1 - this.elapsed / 1.5) : 0;
    this.anger += (target - this.anger) * (1 - Math.exp(-dt * 4));
    const transitions = { lifting: [1.2, 'regarded'], regarded: [1.8, 'choice'], settling: [1.8, 'attending'], excluding: [1.6, 'alone'] };
    const next = transitions[this.phase];
    if (next && this.elapsed >= next[0]) this.transition(next[1]);
  }
  frame() {
    return { phase: this.phase, elapsed: this.elapsed, clock: this.clock, care: this.care, blame: this.blame,
      anger: this.anger, lastAction: this.lastAction, sinceAction: this.clock - this.lastActionAt };
  }
}
