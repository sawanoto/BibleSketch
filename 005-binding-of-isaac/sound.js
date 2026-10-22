'use strict';
class IsaacSound {
  constructor(onError) {
    this.context = null; this.enabled = true; this.phase = 'initial'; this.voices = new Set();
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

      this.startWind(); return true;
    } catch (_) { this.onError(); return false; }
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
  stop() {
    this.epoch++; this.pendingChord = false;
    for (const voice of this.voices) { try { voice.source.stop(); } catch (_) {} voice.source.disconnect(); voice.gain.disconnect(); if (voice.filter) voice.filter.disconnect(); }
    this.voices.clear(); this.wind = null;
  }
  startWind() {
    if (this.phase !== 'initial' || this.wind || !this.enabled || this.context?.state !== 'running') return;
    const length = this.context.sampleRate * 3, buffer = this.context.createBuffer(1, length, this.context.sampleRate), data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * .18;
    const source = this.context.createBufferSource(), filter = this.context.createBiquadFilter(), gain = this.context.createGain();
    source.buffer = buffer; source.loop = true; filter.type = 'lowpass'; filter.frequency.value = 500; gain.gain.value = .055;
    source.connect(filter); filter.connect(gain); gain.connect(this.master); source.start();
    this.wind = { source, filter, gain, ambient: true }; this.voices.add(this.wind);
  }
  tick() { this.startWind(); }
  setEnabled(enabled) { this.enabled = enabled; if (!enabled) this.stop(); if (this.master) this.master.gain.setValueAtTime(enabled ? .2 : 0, this.context.currentTime); }
}
