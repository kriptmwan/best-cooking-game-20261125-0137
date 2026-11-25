// Bistro Blitz world: state, rules, and the dinner-service update.
// One clear job: what the kitchen is, and how it changes over time.

import {
  CHEF_RADIUS, CHEF_SPEED, CHOP_SECONDS, POT_SECONDS, GRILL_SECONDS, BURN_AFTER,
  DAY_SECONDS, INGREDIENTS, MAX_TICKETS, ORDER_PATIENCE, RECIPES, SPAWN_END,
  SPAWN_START, START_REPUTATION, STATIONS,
} from './config.js';
import { pick } from './random.js';

let ticketSeq = 0;

export function createWorld(rng, shot) {
  return {
    mode: shot ? 'play' : 'title',
    shot: shot || null,
    rng,
    timeLeft: DAY_SECONDS,
    coins: 0,
    served: 0,
    lost: 0,
    reputation: START_REPUTATION,
    chef: { x: 640, y: 450, holding: null, face: 1, moving: false, target: null },
    tickets: [],
    board: null,
    pots: [{ item: null }, { item: null }],
    grills: [{ item: null }, { item: null }],
    plate: { items: [] },
    floaters: [],
    servedFlash: 0,
    spawnIn: 3,
    animT: 0,
    overReason: null,
  };
}

export function stationAt(x, y) {
  for (const s of STATIONS) {
    if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return s;
  }
  return null;
}

function stationCenter(s) {
  return { x: s.x + s.w / 2, y: s.y + s.h / 2 };
}

export function nearestStation(state) {
  const c = state.chef;
  let best = null;
  let bestD = 92;
  for (const s of STATIONS) {
    const ctr = stationCenter(s);
    const dx = ctr.x - c.x;
    const dy = ctr.y - c.y;
    const d = Math.hypot(dx, dy);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

export function componentLabel(c) {
  const base = INGREDIENTS[c.kind].label;
  if (c.state === 'raw') return base;
  if (c.state === 'chopped') return `Chopped ${base.toLowerCase()}`;
  if (c.state === 'cooked') return `Simmered ${base.toLowerCase()}`;
  if (c.state === 'grilled') return `Grilled ${base.toLowerCase()}`;
  return `Burnt ${base.toLowerCase()}`;
}

export function spawnOrder(state) {
  const recipe = pick(state.rng, RECIPES);
  ticketSeq += 1;
  state.tickets.push({
    id: ticketSeq,
    recipe,
    patience: ORDER_PATIENCE,
    maxPatience: ORDER_PATIENCE,
  });
}

function plateNeeds(state) {
  for (const t of state.tickets) {
    if (plateMatchesTicket(state.plate.items, t.recipe)) return t;
  }
  return null;
}

export function plateMatchesTicket(items, recipe) {
  if (items.length !== recipe.needs.length) return false;
  const have = items.map((c) => `${c.kind}:${c.state}`).sort().join('|');
  const want = recipe.needs.map((c) => `${c.kind}:${c.state}`).sort().join('|');
  return have === want;
}

export function plateReadyTicket(state) {
  if (state.plate.items.length === 0) return null;
  return plateNeeds(state);
}

export function stationPrompt(state) {
  const s = nearestStation(state);
  if (!s) return null;
  const chef = state.chef;
  const holding = chef.holding;
  if (s.kind === 'crate') {
    if (!holding) return `Take ${INGREDIENTS[s.item].label}`;
    return null;
  }
  if (s.kind === 'board') {
    if (state.board) {
      return state.board.done ? `Take ${componentLabel(state.board.item).toLowerCase()}` : 'Chopping...';
    }
    if (holding && INGREDIENTS[holding.kind].chop && holding.state === 'raw') {
      return `Chop ${INGREDIENTS[holding.kind].label}`;
    }
    return null;
  }
  if (s.kind === 'pot' || s.kind === 'grill') {
    const slots = s.kind === 'pot' ? state.pots : state.grills;
    const slot = slots[s.slot];
    if (!slot.item) {
      if (!holding) return null;
      const ok = s.kind === 'pot' ? INGREDIENTS[holding.kind].cook : INGREDIENTS[holding.kind].grill;
      if (ok && holding.state === 'raw') return s.kind === 'pot' ? 'Simmer it' : 'Grill it';
      return null;
    }
    if (slot.item.state === 'burnt') return 'Burnt! Take it out';
    if (slot.item.done) return `Take ${componentLabel(slot.item).toLowerCase()}`;
    return 'Cooking...';
  }
  if (s.kind === 'plate') {
    const ready = plateReadyTicket(state);
    if (ready) return `Serve ${ready.recipe.name}!`;
    if (holding) return `Plate ${componentLabel(holding).toLowerCase()}`;
    if (state.plate.items.length > 0) return 'Take it back';
    return null;
  }
  if (s.kind === 'pass') return null;
  if (s.kind === 'bin') {
    if (holding) return 'Throw it away';
    if (state.plate.items.length > 0) return 'Clear the plate';
    return null;
  }
  return null;
}

export function interact(state) {
  const s = nearestStation(state);
  if (!s) return false;
  const chef = state.chef;
  const holding = chef.holding;

  if (s.kind === 'crate') {
    if (holding) return false;
    chef.holding = { kind: s.item, state: 'raw' };
    return true;
  }
  if (s.kind === 'board') {
    if (state.board && state.board.done && !holding) {
      chef.holding = state.board.item;
      state.board = null;
      return true;
    }
    if (state.board) return false;
    if (holding && INGREDIENTS[holding.kind].chop && holding.state === 'raw') {
      state.board = { item: holding, progress: 0 };
      chef.holding = null;
      return true;
    }
    return false;
  }
  if (s.kind === 'pot' || s.kind === 'grill') {
    const slots = s.kind === 'pot' ? state.pots : state.grills;
    const slot = slots[s.slot];
    if (!slot.item) {
      if (!holding || holding.state !== 'raw') return false;
      const ok = s.kind === 'pot' ? INGREDIENTS[holding.kind].cook : INGREDIENTS[holding.kind].grill;
      if (!ok) return false;
      slot.item = { kind: holding.kind, state: 'raw', cookT: 0, done: false };
      chef.holding = null;
      return true;
    }
    if (!holding && (slot.item.done || slot.item.state === 'burnt')) {
      chef.holding = { kind: slot.item.kind, state: slot.item.state };
      slot.item = null;
      return true;
    }
    return false;
  }
  if (s.kind === 'plate') {
    const ready = plateReadyTicket(state);
    if (ready && !holding) {
      serveTicket(state, ready);
      return true;
    }
    if (holding && state.plate.items.length < 2) {
      state.plate.items.push(holding);
      chef.holding = null;
      return true;
    }
    if (!holding && state.plate.items.length > 0 && !ready) {
      chef.holding = state.plate.items.pop();
      return true;
    }
    return false;
  }
  if (s.kind === 'bin') {
    if (holding) {
      chef.holding = null;
      return true;
    }
    if (state.plate.items.length > 0) {
      state.plate.items = [];
      return true;
    }
    return false;
  }
  return false;
}

function serveTicket(state, ticket) {
  const tip = Math.round((ticket.patience / ticket.maxPatience) * 6);
  const earned = ticket.recipe.price + tip;
  state.coins += earned;
  state.served += 1;
  state.tickets = state.tickets.filter((t) => t.id !== ticket.id);
  state.plate.items = [];
  state.servedFlash = 1.2;
  addFloater(state, 660, 520, `+${earned} coins`, '#3f9e4d');
}

export function addFloater(state, x, y, text, color) {
  state.floaters.push({ x, y, text, color: color || '#fff6e3', life: 1.4 });
}

function moveChef(state, dt, vx, vy) {
  const c = state.chef;
  const len = Math.hypot(vx, vy);
  if (len < 0.01) {
    c.moving = false;
    return;
  }
  c.moving = true;
  const nx = vx / len;
  const ny = vy / len;
  if (nx !== 0) c.face = nx > 0 ? 1 : -1;
  const step = CHEF_SPEED * dt;
  const tryX = c.x + nx * step;
  const tryY = c.y + ny * step;
  if (!hitsCounter(tryX, c.y)) c.x = tryX;
  if (!hitsCounter(c.x, tryY)) c.y = tryY;
  c.x = Math.max(330, Math.min(1268, c.x));
  c.y = Math.max(186, Math.min(706, c.y));
}

function hitsCounter(x, y) {
  for (const s of STATIONS) {
    const ex = s.x - CHEF_RADIUS + 4;
    const ey = s.y - CHEF_RADIUS + 4;
    const ew = s.w + CHEF_RADIUS * 2 - 8;
    const eh = s.h + CHEF_RADIUS * 2 - 8;
    if (x > ex && x < ex + ew && y > ey && y < ey + eh) return true;
  }
  return false;
}

function cookSlot(slot, dt, seconds, doneState) {
  if (!slot.item || slot.item.done) return;
  slot.item.cookT += dt;
  if (slot.item.cookT >= seconds + BURN_AFTER) {
    slot.item.state = 'burnt';
    slot.item.done = true;
  } else if (slot.item.cookT >= seconds) {
    slot.item.state = doneState;
    slot.item.done = true;
  }
}

export function updateWorld(state, dt, input) {
  state.animT += dt;
  if (state.servedFlash > 0) state.servedFlash -= dt;
  for (const f of state.floaters) {
    f.life -= dt;
    f.y -= 26 * dt;
  }
  state.floaters = state.floaters.filter((f) => f.life > 0);

  if (state.mode !== 'play') return;

  // Mouse: walk to the clicked point.
  const c = state.chef;
  let vx = 0;
  let vy = 0;
  if (input.up) vy -= 1;
  if (input.down) vy += 1;
  if (input.left) vx -= 1;
  if (input.right) vx += 1;
  if (vx === 0 && vy === 0 && c.target) {
    const dx = c.target.x - c.x;
    const dy = c.target.y - c.y;
    const d = Math.hypot(dx, dy);
    if (d > 8) {
      vx = dx / d;
      vy = dy / d;
    } else {
      c.target = null;
    }
  }
  moveChef(state, dt, vx, vy);

  // Frozen scene for screenshots: timers and cooking hold still.
  if (state.shot) return;

  // Chopping finishes on the board.
  if (state.board) {
    state.board.progress += dt / CHOP_SECONDS;
    if (state.board.progress >= 1) {
      state.board.item.state = 'chopped';
      state.board = { item: state.board.item, progress: 1, done: true };
    }
  }
  for (const slot of state.pots) cookSlot(slot, dt, POT_SECONDS, 'cooked');
  for (const slot of state.grills) cookSlot(slot, dt, GRILL_SECONDS, 'grilled');

  // Orders: patience drains, new ones arrive, the day ends.
  for (const t of state.tickets) t.patience -= dt;
  const expired = state.tickets.filter((t) => t.patience <= 0);
  for (const t of expired) {
    state.tickets = state.tickets.filter((x) => x.id !== t.id);
    state.lost += 1;
    state.reputation -= 1;
    addFloater(state, 180, 200, 'Order lost!', '#d63c2f');
    if (state.reputation <= 0) {
      state.mode = 'over';
      state.overReason = 'The dining room walked out.';
      return;
    }
  }
  const progress = 1 - state.timeLeft / DAY_SECONDS;
  const spawnEvery = SPAWN_START + (SPAWN_END - SPAWN_START) * progress;
  state.spawnIn -= dt;
  if (state.spawnIn <= 0 && state.tickets.length < MAX_TICKETS) {
    spawnOrder(state);
    state.spawnIn = spawnEvery;
  }
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.mode = 'over';
    state.overReason = 'Dinner service complete.';
  }
}

export function starsFor(coins) {
  if (coins >= 90) return 3;
  if (coins >= 55) return 2;
  if (coins >= 25) return 1;
  return 0;
}

export function restartWorld(state) {
  const fresh = createWorld(state.rng, state.shot);
  Object.keys(fresh).forEach((k) => {
    state[k] = fresh[k];
  });
  state.mode = 'play';
}
