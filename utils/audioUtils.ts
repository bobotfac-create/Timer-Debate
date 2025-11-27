import { SoundType } from '../types';

export const initAudioContext = (): AudioContext => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioContextClass();
};

const createOscillator = (ctx: AudioContext, freq: number, type: OscillatorType, startTime: number, duration: number, gainVal: number) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  
  gain.gain.setValueAtTime(gainVal, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(startTime);
  osc.stop(startTime + duration);
};

export const playSynthesizedSound = (ctx: AudioContext, type: SoundType) => {
  const now = ctx.currentTime;

  if (type === 'real-bell') {
    // Simulate a bell with multiple metallic partials
    const baseFreq = 500;
    const duration = 2.5;
    // Fundamental
    createOscillator(ctx, baseFreq, 'sine', now, duration, 0.5);
    // Overtones for metallic timbre
    createOscillator(ctx, baseFreq * 2.1, 'sine', now, duration * 0.8, 0.3);
    createOscillator(ctx, baseFreq * 3.5, 'triangle', now, duration * 0.6, 0.1);
    createOscillator(ctx, baseFreq * 4.8, 'sine', now, duration * 0.5, 0.05);
  } else if (type === 'digital') {
    // High pitched beep
    createOscillator(ctx, 880, 'square', now, 0.3, 0.1);
    createOscillator(ctx, 1760, 'sine', now, 0.3, 0.1);
  } else if (type === 'grave') {
    // Low thud/buzz
    createOscillator(ctx, 150, 'sawtooth', now, 0.5, 0.3);
    createOscillator(ctx, 100, 'sine', now, 0.6, 0.5);
  }
};

export const playAudioBuffer = (ctx: AudioContext, buffer: AudioBuffer) => {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
};