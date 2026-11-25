// Bistro Blitz entry point: wire input, world, shots, and the frame loop.
// One clear job: run the game. No rules live here — see world.js.

import { createWorld, interact, restartWorld, updateWorld } from './world.js';
import { bindInput, createInput, handleClick } from './input.js';
import { render } from './render.js';
import { setupShot } from './shots.js';
import { makeRng } from './random.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') || 0) || Math.floor(Math.random() * 2147483647);

const state = createWorld(makeRng(seed), shot);
if (shot) setupShot(state, shot);
const input = createInput();

// Debug handle for playtesting (also lets a test drive the real rules).
window.__bistro = { state, interact };

let audio = null;
function blip(freq, dur) {
  try {
    if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') void audio.resume();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.frequency.value = freq;
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.12, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + dur);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + dur);
  } catch (err) {
    void err;
  }
}

bindInput(input, canvas, {
  onClick(x, y) {
    if (state.mode === 'title') {
      state.mode = 'play';
      return;
    }
    if (state.mode === 'play') handleClick(state, x, y, interact);
  },
});

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (input.startPressed) {
    input.startPressed = false;
    if (state.mode === 'title') {
      state.mode = 'play';
      blip(660, 0.1);
    }
  }
  if (input.restartPressed) {
    input.restartPressed = false;
    if (state.mode === 'over') restartWorld(state);
  }
  if (input.interactPressed) {
    input.interactPressed = false;
    if (state.mode === 'play' && interact(state)) blip(520, 0.08);
  }
  updateWorld(state, dt, input);
  render(ctx, state, input);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
