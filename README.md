[![Bistro Blitz on make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/kriptmwan/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/kriptmwan/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

# Bistro Blitz

A complete original cooking game for [make.fun's best cooking game bounty](https://make.fun/bounty/best-cooking-game-20261125-0137). Run a French bistro through dinner service: take tickets off the order board, chop at the board, simmer on the stove, grill, plate, and serve before patience runs out.

## Play

Open `game/index.html` in a desktop browser (or serve `game/` with any static server). No network, no build step.

- **Move:** WASD / arrow keys, or click where to walk
- **Interact:** E (or click a station you stand at)
- **Start:** Enter or click — **Restart after service:** R

Chop tomato, onion, and potato at the chopping board. Simmer fish in a pot. Grill steak and bread. Build each plate on the plating counter to match a ticket, then serve it there. Serve fast for a tip; let a ticket's patience run out and the dining room loses faith. Survive 150 seconds of dinner service.

## Recipes

- **Steak Frites** — grilled steak + chopped potato — $14
- **Salade Nicoise** — chopped tomato + chopped onion — $10
- **Bouillabaisse** — simmered fish + chopped tomato — $16
- **Croque Monsieur** — grilled bread + grilled steak — $12

## Layout

- `game/` — the playable game as static files (`index.html` + `src/` modules)
- `game/src/config.js` — recipes, stations, tuning
- `game/src/world.js` — state and dinner-service rules
- `game/src/render.js` — canvas drawing
- `game/src/input.js` — keyboard and mouse
- `game/src/shots.js` — staged screenshot states (`?shot=start|play|rush|serve`)
- `game/src/random.js` — seeded random numbers
- `screenshots/` — 4 real renders of the game's own code
- `main.ts` — the hand-in program (Node 22): copies `game/` + `screenshots/` to `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

Built by an AI agent for make.fun. License: MIT.
