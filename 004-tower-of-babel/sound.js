'use strict';
class BabelSound {
  constructor(onError) {
    this.context = null; this.enabled = true; this.phase = 'planning'; this.voices = new Set();
    this.epoch = 0; this.pendingChord = false; this.wind = null; this.lastSpeech = -10; this.speaker = 0; this.lastBrick = -10; this.onError = onError;
  }
  async unlock() {
    if (!this.enabled) return false;
    const epoch = this.epoch;
    try {
      if (!this.context) {
        this.context = new (window.AudioContext || window.webkitAudioContext)(); this.master = this.context.createGain(); this.master.gain.value = .2;
        const compressor = this.context.createDynamicsCompressor(); this.master.connect(compressor); compressor.connect(this.context.destination);
      }
      await this.context.resume();
      if (epoch !== this.epoch || !this.enabled) return false;
      if (this.pendingChord && this.phase === 'building') { this.chord(); this.pendingChord = false; }
      this.startWind(); return true;
    } catch (_) { this.onError(); return false; }
  }
  async changed(up) {
    const epoch = this.epoch;
    if (await this.unlock()) {
      if (epoch === this.epoch && this.phase === 'planning') this.tone(up ? 660 : 170, up ? 660 : 125, up ? .19 : .07, up ? .14 : .08);
    }
  }
  tone(from, to, duration, volume) {
    if (!this.enabled || this.context?.state !== 'running') return;
    const source = this.context.createOscillator(), gain = this.context.createGain(), at = this.context.currentTime;
    source.type = 'sine'; source.frequency.setValueAtTime(from, at); source.frequency.exponentialRampToValueAtTime(to, at + duration);
    gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(volume, at + .008); gain.gain.exponentialRampToValueAtTime(.00001, at + duration);
    source.connect(gain); gain.connect(this.master); source.start(); source.stop(at + duration + .02);
    const voice = { source, gain }; this.voices.add(voice);
    source.onended = () => { source.disconnect(); gain.disconnect(); this.voices.delete(voice); };
  }
  chord() { for (const pitch of [196, 246.94, 293.66, 392]) this.tone(pitch, pitch, 1.15, .09); }
  stop() {
    this.epoch++; this.pendingChord = false;
    for (const voice of this.voices) { try { voice.source.stop(); } catch (_) {} voice.source.disconnect(); voice.gain.disconnect(); if (voice.filter) voice.filter.disconnect(); }
    this.voices.clear(); this.wind = null;
  }
  enter(phase) {
    this.stop(); this.phase = phase; this.lastSpeech = -10; this.lastBrick = -10;
    if (phase === 'building' && this.enabled) {
      if (this.context?.state === 'running') this.chord(); else this.pendingChord = true;
    }
    this.startWind();
  }
  startWind() {
    if (this.phase !== 'complete' || this.wind || !this.enabled || this.context?.state !== 'running') return;
    const length = this.context.sampleRate * 3, buffer = this.context.createBuffer(1, length, this.context.sampleRate), data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * .18;
    const source = this.context.createBufferSource(), filter = this.context.createBiquadFilter(), gain = this.context.createGain();
    source.buffer = buffer; source.loop = true; filter.type = 'lowpass'; filter.frequency.value = 500; gain.gain.value = .055;
    source.connect(filter); filter.connect(gain); gain.connect(this.master); source.start();
    this.wind = { source, filter, gain, ambient: true }; this.voices.add(this.wind);
  }
  tick(frame) {
    if (!this.enabled || this.context?.state !== 'running' || document.hidden) return;
    this.startWind();
    if (frame.phase === 'planning' && frame.clock - this.lastSpeech > 1.8) {
      this.lastSpeech = frame.clock; const pitches = [165, 233, 277, 311, 370, 415, 466, 523];
      this.tone(pitches[this.speaker % frame.count], pitches[this.speaker % frame.count] * .96, .13, .045); this.speaker++;
    }
    if (frame.phase === 'building' && frame.clock - this.lastBrick > .34) {
      this.lastBrick = frame.clock; this.tone(118 + Math.floor(frame.elapsed * 4) % 3 * 25, 75, .095, .11);
    }
  }
  setEnabled(enabled) { this.enabled = enabled; if (!enabled) this.stop(); if (this.master) this.master.gain.setValueAtTime(enabled ? .2 : 0, this.context.currentTime); }
}
