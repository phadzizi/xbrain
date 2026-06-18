export type SoundType =
  | 'correct'
  | 'wrong'
  | 'flip'
  | 'complete'
  | 'tick'
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow';

let audioCtx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (muted) return null;
  try {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function tone(
  ctx: AudioContext,
  freq: number,
  durationMs: number,
  startOffset = 0,
  oscType: OscillatorType = 'sine'
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = oscType;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);

  const start = ctx.currentTime + startOffset;
  const end = start + durationMs / 1000;

  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(0.4, start + 0.005);
  gain.gain.setValueAtTime(0.4, end - 0.01);
  gain.gain.linearRampToValueAtTime(0, end);

  osc.start(start);
  osc.stop(end + 0.01);
}

function sweep(
  ctx: AudioContext,
  freqStart: number,
  freqEnd: number,
  durationMs: number,
  startOffset = 0,
  oscType: OscillatorType = 'sawtooth'
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = oscType;
  const start = ctx.currentTime + startOffset;
  const end = start + durationMs / 1000;

  osc.frequency.setValueAtTime(freqStart, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), end);

  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(0.35, start + 0.005);
  gain.gain.setValueAtTime(0.35, end - 0.01);
  gain.gain.linearRampToValueAtTime(0, end);

  osc.start(start);
  osc.stop(end + 0.01);
}

export function play(type: SoundType): void {
  const ctx = getCtx();
  if (!ctx) return;

  try {
    switch (type) {
      case 'red':
        tone(ctx, 196, 300);
        break;
      case 'blue':
        tone(ctx, 264, 300);
        break;
      case 'green':
        tone(ctx, 330, 300);
        break;
      case 'yellow':
        tone(ctx, 440, 300);
        break;
      case 'flip':
      case 'tick':
        tone(ctx, 600, 80);
        break;
      case 'correct':
        tone(ctx, 440, 100, 0);
        tone(ctx, 880, 100, 0.11);
        break;
      case 'wrong':
        sweep(ctx, 200, 100, 300);
        break;
      case 'complete':
        tone(ctx, 523, 120, 0);
        tone(ctx, 659, 120, 0.13);
        tone(ctx, 784, 180, 0.26);
        break;
    }
  } catch {
    // Web Audio API unavailable or blocked — silent fail
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem('xbrain:muted', String(value));
  } catch {
    // ignore
  }
}

export function loadMutedPreference(): void {
  try {
    muted = localStorage.getItem('xbrain:muted') === 'true';
  } catch {
    // ignore
  }
}
