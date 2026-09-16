import { Platform } from 'react-native';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system';

// ─── Types ────────────────────────────────────────────────────────────────────

type SoundEffect =
  | 'buttonPress'
  | 'gameStart'
  | 'countdownTick'
  | 'countdownGo'
  | 'pointScore'
  | 'combo'
  | 'bonus'
  | 'gameOver'
  | 'win'
  | 'levelUp'
  | 'achievementUnlock';

type WaveType = 'sine' | 'triangle' | 'sawtooth' | 'square';

interface ToneSegment {
  /** Start frequency (Hz). If freqEnd is set, linearly sweeps to it. */
  freq: number;
  freqEnd?: number;
  /** Offset within the sound (seconds) */
  startT: number;
  /** How long this segment lasts (seconds) */
  dur: number;
  /** Peak amplitude 0–1 */
  amp: number;
  type: WaveType;
}

interface SoundDef {
  tones: ToneSegment[];
  /** Total sound duration (seconds) */
  duration: number;
}

// ─── PCM WAV Generator ────────────────────────────────────────────────────────
// Generates a 16-bit mono PCM WAV as raw bytes.
// Used on native (Android/iOS) to synthesize tones without audio files.

const SAMPLE_RATE = 22050;

function generateWavBytes(tones: ToneSegment[], totalDur: number): Uint8Array {
  const numSamples = Math.ceil(SAMPLE_RATE * totalDur);
  const buf = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buf);

  const str = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };

  // WAV header
  str(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  view.setUint32(16, 16, true);     // subchunk size
  view.setUint16(20, 1, true);      // PCM format
  view.setUint16(22, 1, true);      // mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true); // byte rate
  view.setUint16(32, 2, true);      // block align
  view.setUint16(34, 16, true);     // bits per sample
  str(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // PCM samples
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    for (const tone of tones) {
      if (t < tone.startT || t >= tone.startT + tone.dur) continue;
      const localT = t - tone.startT;
      const progress = localT / tone.dur;

      // Linear frequency sweep
      const freq = tone.freqEnd
        ? tone.freq + (tone.freqEnd - tone.freq) * progress
        : tone.freq;

      // Exponential decay envelope
      const env = Math.exp(-4 * progress);
      const phase = 2 * Math.PI * freq * t;

      let wave = 0;
      switch (tone.type) {
        case 'sine':
          wave = Math.sin(phase);
          break;
        case 'triangle':
          wave = (2 / Math.PI) * Math.asin(Math.sin(phase));
          break;
        case 'sawtooth':
          wave = 2 * ((freq * t) % 1) - 1;
          break;
        case 'square':
          wave = Math.sin(phase) >= 0 ? 1 : -1;
          break;
      }

      s += wave * tone.amp * env;
    }

    view.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, s)) * 32767), true);
  }

  return new Uint8Array(buf);
}

// ─── Sound Definitions ────────────────────────────────────────────────────────
// Each entry mirrors the equivalent Web Audio API synthesis from the web path.

const SOUND_DEFS: Record<SoundEffect, SoundDef> = {
  buttonPress: {
    duration: 0.08,
    tones: [
      { freq: 600, freqEnd: 300, startT: 0, dur: 0.08, amp: 0.22, type: 'sine' },
    ],
  },
  gameStart: {
    duration: 0.55,
    tones: [
      { freq: 392,    startT: 0,    dur: 0.22, amp: 0.25, type: 'triangle' },
      { freq: 523.25, startT: 0.08, dur: 0.22, amp: 0.25, type: 'triangle' },
      { freq: 659.25, startT: 0.16, dur: 0.28, amp: 0.25, type: 'triangle' },
    ],
  },
  countdownTick: {
    duration: 0.08,
    tones: [
      { freq: 800, startT: 0, dur: 0.08, amp: 0.22, type: 'square' },
    ],
  },
  countdownGo: {
    duration: 0.4,
    tones: [
      { freq: 523.25, freqEnd: 1046.5, startT: 0, dur: 0.4, amp: 0.35, type: 'triangle' },
    ],
  },
  pointScore: {
    duration: 0.18,
    tones: [
      { freq: 987.77,  startT: 0,    dur: 0.1,  amp: 0.25, type: 'triangle' },
      { freq: 1318.51, startT: 0.06, dur: 0.12, amp: 0.25, type: 'triangle' },
    ],
  },
  combo: {
    duration: 0.15,
    tones: [
      { freq: 440, freqEnd: 880, startT: 0, dur: 0.15, amp: 0.22, type: 'sawtooth' },
    ],
  },
  bonus: {
    duration: 0.5,
    tones: [
      { freq: 523.25, startT: 0,    dur: 0.18, amp: 0.2, type: 'triangle' },
      { freq: 659.25, startT: 0.05, dur: 0.18, amp: 0.2, type: 'triangle' },
      { freq: 783.99, startT: 0.1,  dur: 0.18, amp: 0.2, type: 'triangle' },
      { freq: 1046.5, startT: 0.15, dur: 0.22, amp: 0.2, type: 'triangle' },
    ],
  },
  gameOver: {
    duration: 0.5,
    tones: [
      { freq: 320, freqEnd: 60, startT: 0, dur: 0.5, amp: 0.3, type: 'sawtooth' },
    ],
  },
  win: {
    duration: 0.9,
    tones: [
      { freq: 523.25,  startT: 0,    dur: 0.32, amp: 0.28, type: 'sine' },
      { freq: 659.25,  startT: 0.09, dur: 0.32, amp: 0.28, type: 'sine' },
      { freq: 783.99,  startT: 0.18, dur: 0.32, amp: 0.28, type: 'sine' },
      { freq: 1046.5,  startT: 0.27, dur: 0.32, amp: 0.28, type: 'sine' },
      { freq: 1318.51, startT: 0.36, dur: 0.38, amp: 0.28, type: 'sine' },
    ],
  },
  levelUp: {
    duration: 1.0,
    tones: [
      { freq: 440,     startT: 0,   dur: 0.38, amp: 0.32, type: 'triangle' },
      { freq: 554.37,  startT: 0.1, dur: 0.38, amp: 0.32, type: 'triangle' },
      { freq: 659.25,  startT: 0.2, dur: 0.38, amp: 0.32, type: 'triangle' },
      { freq: 880,     startT: 0.3, dur: 0.38, amp: 0.32, type: 'triangle' },
      { freq: 1108.73, startT: 0.4, dur: 0.44, amp: 0.32, type: 'triangle' },
    ],
  },
  achievementUnlock: {
    duration: 0.68,
    tones: [
      { freq: 587.33,  startT: 0,    dur: 0.3,  amp: 0.28, type: 'sine' },
      { freq: 739.99,  startT: 0.08, dur: 0.3,  amp: 0.28, type: 'sine' },
      { freq: 880,     startT: 0.16, dur: 0.3,  amp: 0.28, type: 'sine' },
      { freq: 1174.66, startT: 0.24, dur: 0.34, amp: 0.28, type: 'sine' },
    ],
  },
};

// ─── AudioService ─────────────────────────────────────────────────────────────

class AudioService {
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = false;

  // Web Audio API (browser only)
  private audioContext: any = null;
  private musicOscillator: any = null;
  private musicGain: any = null;

  // expo-audio player cache (native only)
  private soundCache: Partial<Record<SoundEffect, AudioPlayer>> = {};
  private nativeReady: boolean = false;

  constructor() {
    if (Platform.OS === 'web') {
      try {
        this.initWebAudio();
      } catch {
        // AudioContext may require a user gesture — safe to ignore
      }
    } else {
      // Fire-and-forget: preload all native sounds in the background
      this.initNativeAudio();
    }
  }

  // ── Native init ─────────────────────────────────────────────────────────────

  private async initNativeAudio(): Promise<void> {
    try {
      // expo-audio uses different option names vs expo-av
      await setAudioModeAsync({
        playsInSilentMode: true,
      });
      await this.preloadNativeSounds();
      this.nativeReady = true;
    } catch (e) {
      console.warn('[AudioService] Native audio init failed', e);
    }
  }

  /**
   * Generates a WAV from each SoundDef, writes it to the app's cache directory,
   * and pre-loads it into an expo-av Sound object so playback is instant.
   */
  private async preloadNativeSounds(): Promise<void> {
    // expo-file-system v57: Paths.cache is a Directory object, not a string.
    // File constructor accepts (Directory, filename) directly.
    const cacheDir = FileSystem.Paths.cache;

    for (const key of Object.keys(SOUND_DEFS) as SoundEffect[]) {
      try {
        const def = SOUND_DEFS[key];
        const wavBytes = generateWavBytes(def.tones, def.duration);

        // Build the File reference using the Directory + filename pattern
        const file = new FileSystem.File(cacheDir, `sfx_${key}.wav`);
        file.write(wavBytes);

        // expo-audio: createAudioPlayer replaces Audio.Sound.createAsync
        const player = createAudioPlayer({ uri: file.uri });
        player.volume = 1.0;
        this.soundCache[key] = player;
      } catch (e) {
        console.warn(`[AudioService] Could not preload sfx: ${key}`, e);
      }
    }
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startAmbientMusic();
    } else {
      this.stopAmbientMusic();
    }
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  /** Play a sound effect. Routes to Web Audio API on web, expo-av on native. */
  play(sfx: SoundEffect): void {
    if (!this.soundEnabled) return;

    if (Platform.OS === 'web') {
      this.playWeb(sfx);
    } else {
      this.playNative(sfx);
    }
  }

  // ── Native playback ─────────────────────────────────────────────────────────

  private playNative(sfx: SoundEffect): void {
    const player = this.soundCache[sfx];
    if (!player) return;
    // Rewind to start and play — works even if the sound is currently playing
    player.seekTo(0);
    player.play();
  }

  // ── Web Audio API (browser) ─────────────────────────────────────────────────

  private initWebAudio(): void {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.audioContext = new AudioCtx();
        } catch {
          // AudioContext might require user gesture
        }
      }
    }
  }

  private ensureContext(): any {
    if (!this.audioContext && Platform.OS === 'web' && typeof window !== 'undefined') {
      this.initWebAudio();
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    return this.audioContext;
  }

  private playWeb(sfx: SoundEffect): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      switch (sfx) {
        case 'buttonPress': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }

        case 'pointScore': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(987.77, now); // B5
          osc.frequency.setValueAtTime(1318.51, now + 0.06); // E6
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        case 'bonus': {
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.05);
            gain.gain.setValueAtTime(0.2, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.15);
          });
          break;
        }

        case 'combo': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        case 'countdownTick': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(800, now);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }

        case 'countdownGo': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.25);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }

        case 'gameStart': {
          [392, 523.25, 659.25].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.25, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.2);
          });
          break;
        }

        case 'gameOver': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(60, now + 0.45);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.45);
          break;
        }

        case 'win': {
          [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.09);
            gain.gain.setValueAtTime(0.3, now + idx * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.09 + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.09);
            osc.stop(now + idx * 0.09 + 0.3);
          });
          break;
        }

        case 'levelUp': {
          [440, 554.37, 659.25, 880, 1108.73].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.1);
            gain.gain.setValueAtTime(0.35, now + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.1);
            osc.stop(now + idx * 0.1 + 0.4);
          });
          break;
        }

        case 'achievementUnlock': {
          [587.33, 739.99, 880, 1174.66].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.3, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.35);
          });
          break;
        }
      }
    } catch {
      // Ignore synthesis errors
    }
  }

  // ── Ambient music (web only) ────────────────────────────────────────────────

  private startAmbientMusic(): void {
    // Ambient music synthesis uses Web Audio API — web only
    if (Platform.OS !== 'web') return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      this.stopAmbientMusic();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      this.musicOscillator = osc;
      this.musicGain = gain;
    } catch {
      // Ignore
    }
  }

  private stopAmbientMusic(): void {
    if (this.musicOscillator) {
      try {
        this.musicOscillator.stop();
        this.musicOscillator.disconnect();
      } catch {
        // Ignore
      }
      this.musicOscillator = null;
    }
  }
}

export const audioService = new AudioService();
