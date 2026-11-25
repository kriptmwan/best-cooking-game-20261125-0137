// Bistro Blitz screenshot staging: frozen scenes of the game's own code.
// One clear job: set up a readable kitchen state for each ?shot= name.
// The game loop holds timers and cooking still while a shot is staged,
// so the captured frame is exactly the scene described here.

import { RECIPES } from './config.js';

function ticketFor(state, recipeId, patience) {
  const recipe = RECIPES.find((r) => r.id === recipeId);
  return { id: 100 + Math.floor(state.rng() * 900), recipe, patience, maxPatience: 50 };
}

export function setupShot(state, name) {
  const chef = state.chef;
  if (name === 'start') {
    state.mode = 'title';
    state.tickets = [ticketFor(state, 'steak-frites', 50), ticketFor(state, 'salade-nicoise', 44)];
    chef.x = 640;
    chef.y = 450;
    chef.holding = null;
    state.timeLeft = 150;
    state.coins = 0;
    state.served = 0;
    return;
  }
  state.mode = 'play';
  if (name === 'play') {
    state.tickets = [ticketFor(state, 'steak-frites', 38), ticketFor(state, 'bouillabaisse', 29)];
    state.plate.items = [{ kind: 'steak', state: 'grilled' }];
    state.board = { item: { kind: 'tomato', state: 'raw' }, progress: 0.6, done: false };
    state.pots[0].item = { kind: 'fish', state: 'raw', cookT: 3.5, done: false };
    state.grills[0].item = { kind: 'steak', state: 'raw', cookT: 2.5, done: false };
    chef.x = 395;
    chef.y = 430;
    chef.holding = null;
    state.timeLeft = 142;
    state.coins = 24;
    state.served = 2;
    return;
  }
  if (name === 'rush') {
    state.tickets = [
      ticketFor(state, 'croque', 8),
      ticketFor(state, 'steak-frites', 20),
      ticketFor(state, 'bouillabaisse', 41),
    ];
    state.plate.items = [{ kind: 'bread', state: 'grilled' }];
    state.pots[0].item = { kind: 'fish', state: 'raw', cookT: 5.5, done: false };
    state.pots[1].item = { kind: 'fish', state: 'cooked', cookT: 7, done: true };
    state.grills[0].item = { kind: 'steak', state: 'raw', cookT: 4.2, done: false };
    state.grills[1].item = { kind: 'bread', state: 'grilled', cookT: 5, done: true };
    chef.x = 880;
    chef.y = 430;
    chef.holding = { kind: 'tomato', state: 'chopped' };
    state.timeLeft = 58;
    state.coins = 61;
    state.served = 5;
    state.reputation = 2;
    return;
  }
  if (name === 'serve') {
    state.tickets = [ticketFor(state, 'steak-frites', 33), ticketFor(state, 'salade-nicoise', 26)];
    state.plate.items = [
      { kind: 'steak', state: 'grilled' },
      { kind: 'potato', state: 'chopped' },
    ];
    state.pots[0].item = { kind: 'fish', state: 'raw', cookT: 2, done: false };
    state.grills[0].item = { kind: 'steak', state: 'grilled', cookT: 5, done: true };
    chef.x = 660;
    chef.y = 640;
    chef.holding = null;
    state.servedFlash = 1.0;
    state.floaters = [{ x: 660, y: 500, text: '+20 coins', color: '#3f9e4d', life: 1.4 }];
    state.timeLeft = 96;
    state.coins = 48;
    state.served = 4;
  }
}
