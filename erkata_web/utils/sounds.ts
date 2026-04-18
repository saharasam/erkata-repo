/**
 * Sound utilities using the Web Audio API.
 * No audio files required — all tones are synthesized in the browser.
 */

function getAudioContext(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
}

/**
 * Plays the incoming customer request alert:
 * Two rising tones — a clean double-beep (high → higher).
 */
export function playRequestSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const schedule = [
    { freq: 880, start: 0, duration: 0.12 },
    { freq: 1100, start: 0.16, duration: 0.15 },
  ];

  schedule.forEach(({ freq, start, duration }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    gain.gain.setValueAtTime(0, ctx.currentTime + start);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration + 0.05);
  });
}

/**
 * Plays the payout request alert:
 * A descending coin-drop tone — distinct from the request chime.
 * Three descending tones with a slight metallic quality.
 */
export function playPayoutSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const schedule = [
    { freq: 1400, start: 0,    duration: 0.08 },
    { freq: 1050, start: 0.1,  duration: 0.10 },
    { freq: 700,  start: 0.22, duration: 0.20 },
  ];

  schedule.forEach(({ freq, start, duration }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle'; // Slightly metallic vs sine used in request
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    gain.gain.setValueAtTime(0, ctx.currentTime + start);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration + 0.05);
  });
}
