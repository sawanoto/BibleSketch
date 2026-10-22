'use strict';
/* Every sound has a finite envelope. No drone or automatic ambient loop. */
class OfferingSound {
  constructor(onError) {
    this.context = null;
    this.enabled = true;
    this.voices = new Set();
    this.epoch = 0;
    this.onError = onError;
  }
  async unlock() {
    if (!this.enabled) return false;
    try {
      if (!this.context) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        this.context = new Audio();
        this.master = this.context.createGain();
        this.master.gain.value = .28;
        const limiter = this.context.createDynamicsCompressor();
        this.master.connect(limiter);
        limiter.connect(this.context.destination);
      }
      await this.context.resume();
      return this.enabled && this.context.state === 'running';
    } catch (_) { this.onError(); return false; }
  }
  async gesture(kind) {
    const epoch = this.epoch;
    if (await this.unlock()) {
      if (epoch === this.epoch && kind) this.play(kind);
    }
  }
  play(kind) {
    if (!this.enabled || this.context?.state !== 'running') return;
    const sounds = {
      offer: [[294, 220, .6, .16], [440, 330, .7, .07]],
      regarded: [[880, 880, .95, .13], [1320, 1320, .75, .035]],
      anger: [[92, 68, .65, .13], [97, 72, .7, .09]],
      blame: [[77, 49, .7, .18], [82, 52, .73, .10]],
      care: [[180, 150, .2, .035]],
      exclude: [[74, 32, .24, .36], [48, 27, .25, .13]]
    };
    for (const [from, to, duration, volume] of sounds[kind] || []) this.tone(from, to, duration, volume);
  }
  tone(from, to, duration, volume) {
    const context = this.context, at = context.currentTime;
    const oscillator = context.createOscillator(), gain = context.createGain();
    const voice = { oscillator, gain };
    this.voices.add(voice);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(from, at);
    oscillator.frequency.exponentialRampToValueAtTime(to, at + duration);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + .012);
    gain.gain.exponentialRampToValueAtTime(.00001, at + duration);
    oscillator.connect(gain); gain.connect(this.master);
    oscillator.start(at); oscillator.stop(at + duration + .02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); this.voices.delete(voice); };
  }
  silence() {
    this.epoch++;
    for (const voice of this.voices) {
      try { voice.oscillator.stop(); } catch (_) { /* already stopped */ }
      voice.oscillator.disconnect(); voice.gain.disconnect();
    }
    this.voices.clear();
  }
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.silence();
    if (this.master) this.master.gain.setValueAtTime(enabled ? .28 : 0, this.context.currentTime);
  }
}
