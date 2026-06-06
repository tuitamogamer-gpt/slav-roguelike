// Procedural audio via Web Audio API — no external assets.
// SFX are synthesized; music is a slow minor-key loop with a drone,
// evoking Slavic folk modality (Aeolian / Phrygian colourings).

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicTimer: number | null = null;
let started = false;

const settings = { music: 0.4, sfx: 0.6, muted: false };

function ac(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = settings.muted ? 0 : 1;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = settings.music;
    musicGain.connect(master);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = settings.sfx;
    sfxGain.connect(master);
  }
  return ctx;
}

export function initAudio() {
  ac();
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

export function setVolumes(music: number, sfx: number, muted: boolean) {
  settings.music = music;
  settings.sfx = sfx;
  settings.muted = muted;
  if (musicGain) musicGain.gain.value = music;
  if (sfxGain) sfxGain.gain.value = sfx;
  if (master) master.gain.value = muted ? 0 : 1;
}

function env(node: AudioNode, gain: number, attack: number, decay: number, dest?: AudioNode) {
  const c = ac();
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + attack + decay);
  node.connect(g);
  g.connect(dest ?? sfxGain ?? c.destination);
  return g;
}

function noiseBuffer(c: AudioContext, dur: number) {
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

type Sfx =
  | 'hit'
  | 'heavy'
  | 'block'
  | 'heal'
  | 'magic'
  | 'card'
  | 'button'
  | 'death'
  | 'bjes'
  | 'poison'
  | 'victory'
  | 'defeat'
  | 'coin';

export function sfx(kind: Sfx) {
  if (settings.muted) return;
  const c = ac();
  if (c.state === 'suspended') c.resume();
  const t = c.currentTime;
  switch (kind) {
    case 'hit': {
      const src = c.createBufferSource();
      src.buffer = noiseBuffer(c, 0.18);
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1400;
      src.connect(bp);
      env(bp, 0.5, 0.005, 0.14);
      src.start(t);
      src.stop(t + 0.2);
      break;
    }
    case 'heavy': {
      const src = c.createBufferSource();
      src.buffer = noiseBuffer(c, 0.35);
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 600;
      src.connect(lp);
      env(lp, 0.8, 0.005, 0.3);
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(120, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.25);
      env(o, 0.6, 0.005, 0.28);
      src.start(t);
      o.start(t);
      src.stop(t + 0.36);
      o.stop(t + 0.3);
      break;
    }
    case 'block': {
      const o = c.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(320, t);
      o.frequency.exponentialRampToValueAtTime(180, t + 0.12);
      env(o, 0.4, 0.005, 0.12);
      o.start(t);
      o.stop(t + 0.16);
      break;
    }
    case 'heal': {
      [523, 659, 784].forEach((f, i) => {
        const o = c.createOscillator();
        o.type = 'sine';
        o.frequency.value = f;
        const g = env(o, 0.25, 0.02, 0.4);
        void g;
        o.start(t + i * 0.06);
        o.stop(t + 0.5 + i * 0.06);
      });
      break;
    }
    case 'magic': {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(880, t);
      o.frequency.exponentialRampToValueAtTime(220, t + 0.25);
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2000;
      o.connect(lp);
      env(lp, 0.35, 0.01, 0.3);
      o.start(t);
      o.stop(t + 0.32);
      break;
    }
    case 'card': {
      const src = c.createBufferSource();
      src.buffer = noiseBuffer(c, 0.08);
      const hp = c.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 3000;
      src.connect(hp);
      env(hp, 0.25, 0.002, 0.06);
      src.start(t);
      src.stop(t + 0.09);
      break;
    }
    case 'button': {
      const o = c.createOscillator();
      o.type = 'square';
      o.frequency.value = 440;
      env(o, 0.12, 0.005, 0.07);
      o.start(t);
      o.stop(t + 0.09);
      break;
    }
    case 'bjes': {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(80, t);
      o.frequency.linearRampToValueAtTime(160, t + 0.3);
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 800;
      o.connect(lp);
      env(lp, 0.4, 0.02, 0.35);
      o.start(t);
      o.stop(t + 0.4);
      break;
    }
    case 'poison': {
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(300, t);
      o.frequency.exponentialRampToValueAtTime(150, t + 0.3);
      env(o, 0.2, 0.02, 0.3);
      o.start(t);
      o.stop(t + 0.34);
      break;
    }
    case 'coin': {
      [1200, 1600].forEach((f, i) => {
        const o = c.createOscillator();
        o.type = 'square';
        o.frequency.value = f;
        env(o, 0.12, 0.005, 0.1);
        o.start(t + i * 0.05);
        o.stop(t + 0.16 + i * 0.05);
      });
      break;
    }
    case 'death': {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(220, t);
      o.frequency.exponentialRampToValueAtTime(55, t + 0.5);
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 900;
      o.connect(lp);
      env(lp, 0.4, 0.01, 0.5);
      o.start(t);
      o.stop(t + 0.55);
      break;
    }
    case 'victory':
      [523, 659, 784, 1047].forEach((f, i) => {
        const o = c.createOscillator();
        o.type = 'triangle';
        o.frequency.value = f;
        env(o, 0.3, 0.02, 0.5);
        o.start(t + i * 0.12);
        o.stop(t + 0.6 + i * 0.12);
      });
      break;
    case 'defeat':
      [440, 415, 392, 311].forEach((f, i) => {
        const o = c.createOscillator();
        o.type = 'sine';
        o.frequency.value = f;
        env(o, 0.3, 0.03, 0.6);
        o.start(t + i * 0.18);
        o.stop(t + 0.7 + i * 0.18);
      });
      break;
  }
}

// ---- procedural music ----
// Aeolian scale on A: A B C D E F G. Slow, brooding.
const SCALE = [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392.0];
let step = 0;

function playNote(freq: number, dur: number, gain: number, type: OscillatorType) {
  const c = ac();
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.08);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(musicGain ?? c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

let droneOsc: OscillatorNode | null = null;
function startDrone() {
  const c = ac();
  if (droneOsc) return;
  droneOsc = c.createOscillator();
  droneOsc.type = 'sawtooth';
  droneOsc.frequency.value = 110;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 280;
  const g = c.createGain();
  g.gain.value = 0.12;
  droneOsc.connect(lp);
  lp.connect(g);
  g.connect(musicGain ?? c.destination);
  droneOsc.start();
}

const MELODY = [0, 2, 4, 3, 2, 0, 5, 4, 2, 1, 0, 4, 2, 0, -1, 0];

export function startMusic() {
  if (started) return;
  started = true;
  initAudio();
  startDrone();
  const tick = () => {
    if (settings.muted || !started) return;
    const note = MELODY[step % MELODY.length];
    const octave = step % 32 < 16 ? 1 : 0.5;
    const idx = ((note % 7) + 7) % 7;
    playNote(SCALE[idx] * octave, 1.4, 0.18, 'triangle');
    if (step % 4 === 0) playNote(SCALE[0] * 0.5, 1.8, 0.1, 'sine');
    step++;
  };
  tick();
  musicTimer = window.setInterval(tick, 620);
}

export function stopMusic() {
  started = false;
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
  if (droneOsc) {
    try {
      droneOsc.stop();
    } catch {
      // ignore
    }
    droneOsc = null;
  }
}
