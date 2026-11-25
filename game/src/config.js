// Bistro Blitz configuration: recipes, stations, tuning, palette.
// One clear job: every number the kitchen runs on lives here.

export const VIEW_W = 1280;
export const VIEW_H = 720;

export const DAY_SECONDS = 150;
export const START_REPUTATION = 3;
export const MAX_TICKETS = 3;
export const ORDER_PATIENCE = 50;
export const SPAWN_START = 16;
export const SPAWN_END = 9;

// Ingredient kinds: label, colour, where it comes from, what it can become.
export const INGREDIENTS = {
  tomato: { label: 'Tomato', color: '#e2483d', chop: true, cook: false, grill: false },
  onion: { label: 'Onion', color: '#f2e3c6', chop: true, cook: false, grill: false },
  potato: { label: 'Potato', color: '#e8b64c', chop: true, cook: false, grill: false },
  steak: { label: 'Steak', color: '#8a3b2e', chop: false, cook: false, grill: true },
  fish: { label: 'Fish', color: '#7fb3d5', chop: false, cook: true, grill: false },
  bread: { label: 'Bread', color: '#d9a066', chop: false, cook: false, grill: true },
};

// A component is { kind, state }: raw -> chopped | cooked | grilled.
export const RECIPES = [
  {
    id: 'steak-frites',
    name: 'Steak Frites',
    price: 14,
    needs: [
      { kind: 'steak', state: 'grilled' },
      { kind: 'potato', state: 'chopped' },
    ],
  },
  {
    id: 'salade-nicoise',
    name: 'Salade Nicoise',
    price: 10,
    needs: [
      { kind: 'tomato', state: 'chopped' },
      { kind: 'onion', state: 'chopped' },
    ],
  },
  {
    id: 'bouillabaisse',
    name: 'Bouillabaisse',
    price: 16,
    needs: [
      { kind: 'fish', state: 'cooked' },
      { kind: 'tomato', state: 'chopped' },
    ],
  },
  {
    id: 'croque',
    name: 'Croque Monsieur',
    price: 12,
    needs: [
      { kind: 'bread', state: 'grilled' },
      { kind: 'steak', state: 'grilled' },
    ],
  },
];

export const CHOP_SECONDS = 1.5;
export const POT_SECONDS = 7;
export const GRILL_SECONDS = 5;
export const BURN_AFTER = 8;

export const CHEF_SPEED = 265;
export const CHEF_RADIUS = 20;

// Station rectangles in world space (canvas 1280x720; HUD occupies the top 92px).
// Counters ring the room; the floor in the middle is where the chef runs.
export const STATIONS = [
  { id: 'crate-tomato', kind: 'crate', item: 'tomato', x: 330, y: 108, w: 96, h: 64 },
  { id: 'crate-onion', kind: 'crate', item: 'onion', x: 434, y: 108, w: 96, h: 64 },
  { id: 'crate-potato', kind: 'crate', item: 'potato', x: 538, y: 108, w: 96, h: 64 },
  { id: 'crate-steak', kind: 'crate', item: 'steak', x: 642, y: 108, w: 96, h: 64 },
  { id: 'crate-fish', kind: 'crate', item: 'fish', x: 746, y: 108, w: 96, h: 64 },
  { id: 'crate-bread', kind: 'crate', item: 'bread', x: 850, y: 108, w: 96, h: 64 },
  { id: 'board', kind: 'board', x: 330, y: 300, w: 130, h: 84 },
  { id: 'pot-1', kind: 'pot', slot: 0, x: 520, y: 300, w: 110, h: 84 },
  { id: 'pot-2', kind: 'pot', slot: 1, x: 650, y: 300, w: 110, h: 84 },
  { id: 'grill-1', kind: 'grill', slot: 0, x: 820, y: 300, w: 110, h: 84 },
  { id: 'grill-2', kind: 'grill', slot: 1, x: 950, y: 300, w: 110, h: 84 },
  { id: 'plate', kind: 'plate', x: 560, y: 520, w: 200, h: 84 },
  { id: 'pass', kind: 'pass', x: 820, y: 520, w: 240, h: 84 },
  { id: 'bin', kind: 'bin', x: 330, y: 520, w: 110, h: 84 },
];

export const PALETTE = {
  wall: '#f3e3c2',
  floor: '#c98f5f',
  floorAlt: '#bd8252',
  counter: '#8a5a33',
  counterTop: '#a9713f',
  board: '#e8c890',
  steel: '#b9c0c7',
  darkSteel: '#7d838a',
  ink: '#2b2118',
  cream: '#fff6e3',
  red: '#d63c2f',
  green: '#3f9e4d',
  gold: '#e8b64c',
  blue: '#3d7ea6',
};
