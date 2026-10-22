'use strict';
class ArkSound {
  constructor(onError) {
    this.context = null; this.enabled = true; this.phase = 'before'; this.voices = new Set(); this.beds = [];
    this.epoch = 0; this.lastCall = -10; this.pending = null; this.onError = onError;
  }
  async unlock() {
    if (!this.enabled) return;
    const epoch = this.epoch;
    try {
      if (!this.context) {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.context.createGain(); this.master.gain.value = .23;
        const compressor = this.context.createDynamicsCompressor(); this.master.connect(compressor); compressor.connect(this.context.destination);
        const length = this.context.sampleRate * 3;
        this.noise = this.context.createBuffer(1, length, this.context.sampleRate);
        const data = this.noise.getChannelData(0);
        for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * .3;
      }
      await this.context.resume();
      if (!this.enabled || epoch !== this.epoch) return;
      if (this.pending === this.phase) { this.clip(this.phase); this.pending = null; }
      this.ambience();
    } catch (_) { this.onError(); }
  }
  stop() {
    this.epoch++;
    for (const voice of this.voices) {
      try { voice.source.stop(); } catch (_) { /* already ended */ }
      voice.source.disconnect(); voice.gain.disconnect(); if (voice.filter) voice.filter.disconnect();
    }
    this.voices.clear(); this.beds = []; this.pending = null;
  }
  enter(phase) {
    this.stop(); this.phase = phase; this.lastCall = -10;
    if (['falling', 'impact'].includes(phase)) {
      if (this.enabled && this.context?.state === 'running') this.clip(phase);
      else this.pending = phase;
    }
    this.ambience();
  }
  ambience() {
    if (!this.enabled || this.context?.state !== 'running' || this.beds.length || !['before', 'renewal', 'world'].includes(this.phase)) return;
    for (const frequency of [320, 950]) {
      const source = this.context.createBufferSource(); source.buffer = this.noise; source.loop = true;
      const filter = this.context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = frequency;
      const gain = this.context.createGain(); gain.gain.value = 0;
      source.connect(filter); filter.connect(gain); gain.connect(this.master);
      const voice = { source, gain, filter }; this.voices.add(voice); this.beds.push(voice); source.start();
    }
  }
  tone(from, to, duration, volume) {
    if (!this.enabled || this.context?.state !== 'running') return;
    const at = this.context.currentTime, source = this.context.createOscillator(), gain = this.context.createGain();
    const voice = { source, gain }; this.voices.add(voice); source.type = 'sine';
    source.frequency.setValueAtTime(from, at); source.frequency.exponentialRampToValueAtTime(to, at + duration);
    gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(volume, at + .015); gain.gain.exponentialRampToValueAtTime(.00001, at + duration);
    source.connect(gain); gain.connect(this.master); source.start(at); source.stop(at + duration + .03);
    source.onended = () => { source.disconnect(); gain.disconnect(); this.voices.delete(voice); };
  }
  hiss(duration, volume) {
    if (!this.enabled || this.context?.state !== 'running') return;
    const at = this.context.currentTime, source = this.context.createBufferSource(), gain = this.context.createGain(), filter = this.context.createBiquadFilter();
    source.buffer = this.noise; filter.type = 'lowpass'; filter.frequency.value = 600;
    gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(volume, at + .03); gain.gain.exponentialRampToValueAtTime(.00001, at + duration);
    source.connect(filter); filter.connect(gain); gain.connect(this.master); source.start(); source.stop(at + duration + .04);
    const voice = { source, gain, filter }; this.voices.add(voice);
    source.onended = () => { source.disconnect(); gain.disconnect(); filter.disconnect(); this.voices.delete(voice); };
  }
  clip(phase) {
    if (phase === 'falling') { this.tone(105, 39, 1.2, .35); this.tone(112, 42, 1.15, .12); }
    if (phase === 'impact') { this.tone(85, 25, .75, .65); this.tone(47, 22, 1.1, .3); this.hiss(1.8, .65); }
  }
  tick(frame, survivors) {
    if (!this.enabled || this.context?.state !== 'running' || document.hidden) return;
    this.ambience();
    const fade = frame.phase === 'renewal' ? Math.min(1, frame.elapsed / 8.5) : 1;
    for (let i = 0; i < this.beds.length; i++) this.beds[i].gain.gain.setTargetAtTime((i ? .055 : .045) * fade, this.context.currentTime, .6);
    if (!['before', 'survivors', 'renewal', 'world'].includes(frame.phase) || frame.elapsed < 1.4 || frame.clock - this.lastCall < 5.8) return;
    this.lastCall = frame.clock;
    const birds = frame.phase === 'before' || survivors.some(a => a.type === 'bird');
    this.tone(birds ? 1050 : 210, birds ? 1480 : 165, frame.phase === 'survivors' ? .13 : .22, frame.phase === 'survivors' ? .03 : .06);
    if (birds && frame.phase !== 'survivors') this.tone(1540, 1230, .32, .025);
  }
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.stop();
    if (this.master) this.master.gain.setValueAtTime(enabled ? .23 : 0, this.context.currentTime);
  }
}
