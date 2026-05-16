import { type DroneOptions, type ActiveNote, midiToName } from '@/types/drone';

type VoiceKey = 'root' | 'fifth' | 'octave';

interface Voice {
  oscs: OscillatorNode[];
  gain: GainNode;
}

const VOICE_GAINS: Record<VoiceKey, number> = {
  root:   0.45,
  fifth:  0.38,
  octave: 0.28,
};

export class DroneEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private voices = new Map<VoiceKey, Voice>();

  private _isPlaying = false;
  private _activeNotes: ActiveNote[] = [];
  private _volume = 0.8;
  private _rootMidi = 48; // C3 default
  private _options: DroneOptions = { fifth: true, octave: false, detune: 0 };

  get isPlaying() { return this._isPlaying; }
  get activeNotes(): ActiveNote[] { return [...this._activeNotes]; }

  // ── Audio graph setup ────────────────────────────────────────────────────────

  private ensureContext(): AudioContext {
    if (this.ctx) return this.ctx;

    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;

    this.limiter = this.ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -3;
    this.limiter.knee.value = 3;
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.001;
    this.limiter.release.value = 0.1;

    this.masterGain.connect(this.limiter);
    this.limiter.connect(this.ctx.destination);

    return this.ctx;
  }

  private midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Shimmer only applies when extra voices are active
  private effectiveDetune(): number {
    return (this._options.fifth || this._options.octave) ? this._options.detune : 0;
  }

  private applyDetuneToVoice(key: VoiceKey, cents: number): void {
    const voice = this.voices.get(key);
    if (!voice) return;
    const half = cents / 2;
    if (voice.oscs[0]) voice.oscs[0].detune.value = -half;
    if (voice.oscs[1]) voice.oscs[1].detune.value =  half;
  }

  // ── Voice management ─────────────────────────────────────────────────────────

  private createVoice(key: VoiceKey, midi: number, detuneCents: number): Voice {
    const ctx = this.ctx!;
    const freq = this.midiToFreq(midi);
    const half = detuneCents / 2;

    const gain = ctx.createGain();
    gain.gain.value = VOICE_GAINS[key];
    gain.connect(this.masterGain!);

    const oscs: OscillatorNode[] = [-half, half].map(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = d;
      osc.connect(gain);
      osc.start();
      return osc;
    });

    return { oscs, gain };
  }

  private destroyVoice(key: VoiceKey): void {
    const voice = this.voices.get(key);
    if (!voice) return;
    voice.oscs.forEach(o => { try { o.stop(); } catch { /* already stopped */ } });
    voice.gain.disconnect();
    this.voices.delete(key);
  }

  private rebuildActiveNotes(): void {
    const notes: ActiveNote[] = [];
    const add = (key: VoiceKey, midi: number) => {
      if (this.voices.has(key)) notes.push({ midi, name: midiToName(midi), role: key });
    };
    add('root', this._rootMidi);
    add('fifth', this._rootMidi + 7);
    add('octave', this._rootMidi + 12);
    this._activeNotes = notes;
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  async start(rootMidi: number, options: DroneOptions): Promise<void> {
    const ctx = this.ensureContext();
    if (ctx.state === 'suspended') await ctx.resume();

    this._rootMidi = rootMidi;
    this._options = { ...options };

    // Tear down any running voices
    (['root', 'fifth', 'octave'] as VoiceKey[]).forEach(k => this.destroyVoice(k));

    // Build voices — root shimmer only when extra voices are present
    const rootDetune = (options.fifth || options.octave) ? options.detune : 0;
    this.voices.set('root', this.createVoice('root', rootMidi, rootDetune));
    if (options.fifth)  this.voices.set('fifth',  this.createVoice('fifth',  rootMidi + 7,  options.detune));
    if (options.octave) this.voices.set('octave', this.createVoice('octave', rootMidi + 12, options.detune));

    this.rebuildActiveNotes();

    // 150 ms attack
    const gain = this.masterGain!.gain;
    const now = ctx.currentTime;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(0, now);
    gain.linearRampToValueAtTime(this._volume, now + 0.15);

    this._isPlaying = true;
  }

  async stop(): Promise<void> {
    if (!this.ctx || !this.masterGain || !this._isPlaying) return;

    const ctx = this.ctx;
    const gain = this.masterGain.gain;
    const now = ctx.currentTime;

    // 150 ms release
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(0, now + 0.15);

    this._isPlaying = false;
    this._activeNotes = [];

    setTimeout(() => {
      (['root', 'fifth', 'octave'] as VoiceKey[]).forEach(k => this.destroyVoice(k));
    }, 250);
  }

  setVolume(v: number): void {
    this._volume = v;
    if (this.masterGain && this._isPlaying) {
      this.masterGain.gain.value = v;
    }
  }

  setFifth(enabled: boolean): void {
    this._options.fifth = enabled;
    if (!this._isPlaying) return;
    if (enabled) {
      this.voices.set('fifth', this.createVoice('fifth', this._rootMidi + 7, this._options.detune));
    } else {
      this.destroyVoice('fifth');
    }
    // Update root shimmer based on whether any extra voice is now active
    this.applyDetuneToVoice('root', this.effectiveDetune());
    this.rebuildActiveNotes();
  }

  setOctaveDouble(enabled: boolean): void {
    this._options.octave = enabled;
    if (!this._isPlaying) return;
    if (enabled) {
      this.voices.set('octave', this.createVoice('octave', this._rootMidi + 12, this._options.detune));
    } else {
      this.destroyVoice('octave');
    }
    // Update root shimmer based on whether any extra voice is now active
    this.applyDetuneToVoice('root', this.effectiveDetune());
    this.rebuildActiveNotes();
  }

  setDetune(cents: number): void {
    this._options.detune = cents;
    if (!this._isPlaying) return;
    this.applyDetuneToVoice('root', this.effectiveDetune());
    this.applyDetuneToVoice('fifth', cents);
    this.applyDetuneToVoice('octave', cents);
  }

  dispose(): void {
    (['root', 'fifth', 'octave'] as VoiceKey[]).forEach(k => this.destroyVoice(k));
    this.ctx?.close();
    this.ctx = null;
    this.masterGain = null;
    this.limiter = null;
    this._isPlaying = false;
    this._activeNotes = [];
  }
}
