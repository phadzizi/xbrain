import { Howl } from 'howler';

export type SoundType = 'correct' | 'wrong' | 'flip' | 'complete' | 'tick';

const SOUNDS: Partial<Record<SoundType, Howl>> = {};

const SOUND_SRCS: Record<SoundType, string[]> = {
  correct: ['/sounds/correct.mp3'],
  wrong: ['/sounds/wrong.mp3'],
  flip: ['/sounds/flip.mp3'],
  complete: ['/sounds/complete.mp3'],
  tick: ['/sounds/tick.mp3'],
};

let muted = false;

function getHowl(type: SoundType): Howl {
  if (!SOUNDS[type]) {
    SOUNDS[type] = new Howl({ src: SOUND_SRCS[type], volume: 0.6, preload: true });
  }
  return SOUNDS[type]!;
}

export function play(type: SoundType): void {
  if (muted) return;
  try {
    getHowl(type).play();
  } catch {
    // audio blocked or files missing — silent fail
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
