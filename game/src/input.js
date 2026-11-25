// Bistro Blitz input: keyboard and mouse, one clear job.
// Arrow keys / WASD move the chef, E interacts, click walks (and uses a
// station when already standing at it), Enter starts, R restarts.

import { stationAt } from './world.js';

export function createInput() {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    interactPressed: false,
    startPressed: false,
    restartPressed: false,
    click: null,
  };
}

const KEYMAP = {
  arrowup: 'up',
  w: 'up',
  arrowdown: 'down',
  s: 'down',
  arrowleft: 'left',
  a: 'left',
  arrowright: 'right',
  d: 'right',
};

export function bindInput(input, canvas, hooks) {
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (KEYMAP[key]) {
      input[KEYMAP[key]] = true;
      e.preventDefault();
    }
    if (key === 'e' || key === ' ') {
      input.interactPressed = true;
      e.preventDefault();
    }
    if (key === 'enter') input.startPressed = true;
    if (key === 'r') input.restartPressed = true;
  });
  window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (KEYMAP[key]) input[KEYMAP[key]] = false;
  });
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    input.click = { x, y };
    if (hooks && hooks.onClick) hooks.onClick(x, y);
  });
  window.addEventListener('blur', () => {
    input.up = input.down = input.left = input.right = false;
  });
}

// A click on a station the chef already stands at uses it at once;
// any other click becomes a walk target. Returns true if it interacted.
export function handleClick(state, x, y, interactFn) {
  const s = stationAt(x, y);
  if (s) {
    const cx = s.x + s.w / 2;
    const cy = s.y + s.h / 2;
    const d = Math.hypot(cx - state.chef.x, cy - state.chef.y);
    if (d < 110) return interactFn(state);
    state.chef.target = { x: cx, y: cy + s.h / 2 + 34 };
    return false;
  }
  state.chef.target = { x, y };
  return false;
}
