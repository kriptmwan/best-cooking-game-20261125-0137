// Bistro Blitz renderer: every pixel of the kitchen, drawn on one canvas.
// One clear job: turn the world state into a readable bistro scene.

import { INGREDIENTS, PALETTE, STATIONS, VIEW_H, VIEW_W } from './config.js';
import { componentLabel, nearestStation, plateReadyTicket, stationPrompt } from './world.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawIngredient(ctx, kind, x, y, r, state) {
  const base = INGREDIENTS[kind].color;
  ctx.save();
  ctx.translate(x, y);
  if (state === 'burnt') {
    ctx.fillStyle = '#241a12';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (kind === 'tomato') {
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3f9e4d';
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(-r * 0.45, -r * 0.4);
    ctx.lineTo(r * 0.45, -r * 0.4);
    ctx.closePath();
    ctx.fill();
  } else if (kind === 'onion') {
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === 'potato') {
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.15, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a67c2e';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.2, r * 0.12, 0, Math.PI * 2);
    ctx.arc(r * 0.35, r * 0.25, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'steak') {
    ctx.fillStyle = base;
    rr(ctx, -r, -r * 0.7, r * 2, r * 1.4, r * 0.5);
    ctx.fill();
    ctx.strokeStyle = '#5e241a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.7);
    ctx.lineTo(r * 0.5, r * 0.7);
    ctx.moveTo(r * 0.5, -r * 0.7);
    ctx.lineTo(-r * 0.5, r * 0.7);
    ctx.stroke();
  } else if (kind === 'fish') {
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.1, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 1.05, 0);
    ctx.lineTo(-r * 1.6, -r * 0.6);
    ctx.lineTo(-r * 1.6, r * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1d2b33';
    ctx.beginPath();
    ctx.arc(r * 0.55, -r * 0.1, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'bread') {
    ctx.fillStyle = base;
    rr(ctx, -r * 1.1, -r * 0.65, r * 2.2, r * 1.3, r * 0.55);
    ctx.fill();
    ctx.strokeStyle = '#8a5a2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, -r * 0.4);
    ctx.lineTo(-r * 0.2, r * 0.4);
    ctx.moveTo(0, -r * 0.4);
    ctx.lineTo(r * 0.4, r * 0.4);
    ctx.stroke();
  }
  if (state === 'chopped') {
    ctx.strokeStyle = 'rgba(43,33,24,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, 0);
    ctx.lineTo(r * 0.7, 0);
    ctx.stroke();
  }
  if (state === 'cooked' || state === 'grilled') {
    ctx.strokeStyle = '#5e3a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, -r * 0.5);
    ctx.lineTo(r * 0.6, r * 0.5);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSteam(ctx, x, y, t) {
  ctx.strokeStyle = 'rgba(255,246,227,0.85)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i += 1) {
    const px = x - 14 + i * 14;
    const wob = Math.sin(t * 3 + i * 2) * 5;
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.quadraticCurveTo(px + wob, y - 12, px - wob, y - 24);
    ctx.stroke();
  }
}

function drawProgressRing(ctx, x, y, r, frac, color) {
  ctx.fillStyle = 'rgba(43,33,24,0.75)';
  ctx.beginPath();
  ctx.arc(x, y, r + 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff6e3';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
  ctx.stroke();
}

function drawStation(ctx, state, s) {
  const { x, y, w, h } = s;
  ctx.fillStyle = PALETTE.counter;
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.fillStyle = PALETTE.counterTop;
  rr(ctx, x + 4, y + 4, w - 8, 18, 6);
  ctx.fill();

  if (s.kind === 'crate') {
    ctx.fillStyle = PALETTE.cream;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    drawIngredient(ctx, s.item, x + w / 2, y + 36, 15, 'raw');
    ctx.fillStyle = PALETTE.ink;
    ctx.fillText(INGREDIENTS[s.item].label.toUpperCase(), x + w / 2, y + h - 6);
  }
  if (s.kind === 'board') {
    ctx.fillStyle = PALETTE.board;
    rr(ctx, x + 10, y + 22, w - 20, h - 30, 8);
    ctx.fill();
    ctx.strokeStyle = '#8a6a3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w - 34, y + 30);
    ctx.lineTo(x + w - 14, y + 46);
    ctx.stroke();
    if (state.board) {
      drawIngredient(ctx, state.board.item.kind, x + w / 2 - 12, y + 46, 14, state.board.item.state);
      if (!state.board.done) {
        drawProgressRing(ctx, x + w / 2 + 30, y + 46, 11, state.board.progress, PALETTE.green);
      }
    }
  }
  if (s.kind === 'pot' || s.kind === 'grill') {
    const slots = s.kind === 'pot' ? state.pots : state.grills;
    const slot = slots[s.slot];
    const cx = x + w / 2;
    const cy = y + 46;
    if (s.kind === 'pot') {
      ctx.fillStyle = PALETTE.darkSteel;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 6, 34, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.steel;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 34, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5a3a22';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 28, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#3a3a3a';
      rr(ctx, x + 12, y + 24, w - 24, h - 34, 6);
      ctx.fill();
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.moveTo(x + 18, y + 32 + i * 9);
        ctx.lineTo(x + w - 18, y + 32 + i * 9);
        ctx.stroke();
      }
    }
    if (slot.item) {
      drawIngredient(ctx, slot.item.kind, cx, cy - 4, 15, slot.item.state);
      if (!slot.item.done) {
        const total = s.kind === 'pot' ? 7 : 5;
        drawProgressRing(ctx, cx + 34, cy - 16, 10, Math.min(1, slot.item.cookT / total), '#e8b64c');
      } else if (slot.item.state === 'burnt') {
        ctx.fillStyle = '#d63c2f';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BURNT!', cx, y + 18);
      }
      if (slot.item.done && slot.item.state !== 'burnt') drawSteam(ctx, cx, cy - 22, state.animT);
    }
  }
  if (s.kind === 'plate') {
    ctx.fillStyle = '#fdfdf8';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2 + 4, 78, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9b896';
    ctx.lineWidth = 2;
    ctx.stroke();
    const items = state.plate.items;
    items.forEach((c, i) => {
      drawIngredient(ctx, c.kind, x + w / 2 - 34 + i * 68, y + h / 2 + 2, 16, c.state);
    });
    const ready = plateReadyTicket(state);
    if (ready) {
      ctx.fillStyle = PALETTE.green;
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('READY — SERVE!', x + w / 2, y + 16);
    } else if (items.length > 0) {
      ctx.fillStyle = PALETTE.ink;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PLATING...', x + w / 2, y + 16);
    }
  }
  if (s.kind === 'pass') {
    ctx.fillStyle = '#2b2118';
    rr(ctx, x + 8, y + 8, w - 16, 22, 6);
    ctx.fill();
    ctx.fillStyle = PALETTE.gold;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SERVICE PASS', x + w / 2, y + 24);
    if (state.servedFlash > 0) {
      ctx.fillStyle = '#fdfdf8';
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + 56, 52, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.green;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('SERVED!', x + w / 2, y + 60);
    }
  }
  if (s.kind === 'bin') {
    ctx.fillStyle = '#4a4a4a';
    rr(ctx, x + 26, y + 22, w - 52, h - 30, 6);
    ctx.fill();
    ctx.fillStyle = '#fff6e3';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BIN', x + w / 2, y + h - 6);
  }
}

function drawChef(ctx, state) {
  const c = state.chef;
  const bob = c.moving ? Math.sin(state.animT * 12) * 2 : 0;
  ctx.save();
  ctx.translate(c.x, c.y + bob);
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 20, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body: white jacket + apron.
  ctx.fillStyle = '#fdfdf8';
  rr(ctx, -15, -6, 30, 26, 10);
  ctx.fill();
  ctx.fillStyle = '#3d7ea6';
  rr(ctx, -11, 6, 22, 14, 5);
  ctx.fill();
  // Head + toque.
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(0, -16, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fdfdf8';
  ctx.beginPath();
  ctx.arc(-6, -26, 8, 0, Math.PI * 2);
  ctx.arc(6, -26, 8, 0, Math.PI * 2);
  ctx.arc(0, -29, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-12, -26, 24, 5);
  // Eyes face the walk direction.
  ctx.fillStyle = '#2b2118';
  ctx.beginPath();
  ctx.arc(c.face * 4 - 3, -17, 1.8, 0, Math.PI * 2);
  ctx.arc(c.face * 4 + 4, -17, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // Held item rides above the toque.
  if (c.holding) drawIngredient(ctx, c.holding.kind, 0, -44, 13, c.holding.state);
  ctx.restore();
}

function drawTicket(ctx, t, x, y, w, plateItems) {
  const urgent = t.patience < 12;
  ctx.fillStyle = urgent ? '#ffe1dc' : '#fff6e3';
  rr(ctx, x, y, w, 86, 10);
  ctx.fill();
  ctx.strokeStyle = urgent ? '#d63c2f' : '#c9b896';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = PALETTE.ink;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(t.recipe.name, x + 12, y + 24);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#5a4a33';
  ctx.fillText(`$${t.recipe.price}`, x + w - 44, y + 24);
  // Component dots: green once that piece sits on the plate.
  t.recipe.needs.forEach((need, i) => {
    const dx = x + 22 + i * 52;
    const dy = y + 46;
    const onPlate = plateItems.some((c) => c.kind === need.kind && c.state === need.state);
    ctx.fillStyle = onPlate ? '#3f9e4d' : '#e8ddc4';
    ctx.beginPath();
    ctx.arc(dx, dy, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = onPlate ? '#2c7a38' : '#b09a6a';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawIngredient(ctx, need.kind, dx, dy, 8, need.state);
    ctx.fillStyle = PALETTE.ink;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(need.state.toUpperCase(), dx, dy + 26);
  });
  // Patience bar.
  const frac = Math.max(0, t.patience / t.maxPatience);
  ctx.fillStyle = '#e0d3b8';
  rr(ctx, x + 12, y + 78, w - 24, 5, 2);
  ctx.fill();
  ctx.fillStyle = urgent ? '#d63c2f' : frac < 0.45 ? '#e8b64c' : '#3f9e4d';
  rr(ctx, x + 12, y + 78, (w - 24) * frac, 5, 2);
  ctx.fill();
}

function drawHud(ctx, state) {
  // Top bar.
  ctx.fillStyle = '#2b2118';
  ctx.fillRect(0, 0, VIEW_W, 92);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('BISTRO BLITZ', 16, 42);
  ctx.fillStyle = '#fff6e3';
  ctx.font = '14px sans-serif';
  ctx.fillText('Dinner service — chop, cook, plate, serve!', 16, 68);
  // Day timer.
  const mins = Math.floor(state.timeLeft / 60);
  const secs = Math.floor(state.timeLeft % 60);
  const clock = `${mins}:${String(secs).padStart(2, '0')}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = state.timeLeft < 30 ? '#ff6b5e' : '#fff6e3';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(clock, 640, 46);
  ctx.fillStyle = '#5a4a33';
  rr(ctx, 520, 58, 240, 10, 5);
  ctx.fill();
  ctx.fillStyle = state.timeLeft < 30 ? '#d63c2f' : '#e8b64c';
  rr(ctx, 520, 58, 240 * (state.timeLeft / 150), 10, 5);
  ctx.fill();
  // Coins / served / reputation.
  ctx.textAlign = 'right';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(`◉ ${state.coins}`, 1090, 44);
  ctx.fillStyle = '#fff6e3';
  ctx.font = '16px sans-serif';
  ctx.fillText(`Served ${state.served}  •  Lost ${state.lost}`, 1090, 70);
  let hx = 1120;
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < state.reputation ? '#ff5e7a' : '#4a3a2c';
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('♥', hx, 46);
    hx += 28;
  }
  // Order board (left column).
  ctx.fillStyle = 'rgba(43,33,24,0.55)';
  rr(ctx, 8, 100, 304, 612, 12);
  ctx.fill();
  ctx.fillStyle = '#fff6e3';
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ORDER BOARD', 22, 128);
  if (state.tickets.length === 0) {
    ctx.fillStyle = '#d9c8a8';
    ctx.font = '14px sans-serif';
    ctx.fillText('No orders yet —', 22, 160);
    ctx.fillText('the rush is coming.', 22, 180);
  }
  state.tickets.forEach((t, i) => {
    drawTicket(ctx, t, 20, 142 + i * 98, 280, state.plate.items);
  });
}

function drawPrompt(ctx, state) {
  const prompt = stationPrompt(state);
  if (!prompt || state.mode !== 'play') return;
  ctx.font = 'bold 17px sans-serif';
  const w = ctx.measureText(prompt).width + 96;
  const x = (VIEW_W - w) / 2;
  const y = VIEW_H - 44;
  ctx.fillStyle = 'rgba(43,33,24,0.85)';
  rr(ctx, x, y, w, 34, 17);
  ctx.fill();
  ctx.fillStyle = PALETTE.gold;
  ctx.textAlign = 'center';
  ctx.fillText(`[E]  ${prompt}`, VIEW_W / 2, y + 23);
}

function drawOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(20,14,8,0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = accent || PALETTE.gold;
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText(title, VIEW_W / 2, 300);
  ctx.fillStyle = '#fff6e3';
  ctx.font = '20px sans-serif';
  lines.forEach((ln, i) => {
    ctx.fillText(ln, VIEW_W / 2, 350 + i * 32);
  });
}

export function render(ctx, state, input) {
  // Floor: checker tiles.
  for (let ty = 0; ty < 9; ty += 1) {
    for (let tx = 0; tx < 16; tx += 1) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? PALETTE.floor : PALETTE.floorAlt;
      ctx.fillRect(tx * 80, 92 + ty * 70, 80, 70);
    }
  }
  // Wall strip behind the top crates.
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(320, 92, VIEW_W - 320, 12);
  // Stations.
  for (const s of STATIONS) drawStation(ctx, state, s);
  // Chef.
  drawChef(ctx, state);
  // Nearest-station highlight.
  const near = nearestStation(state);
  if (near && state.mode === 'play') {
    ctx.strokeStyle = 'rgba(232,182,76,0.9)';
    ctx.lineWidth = 3;
    rr(ctx, near.x - 3, near.y - 3, near.w + 6, near.h + 6, 12);
    ctx.stroke();
  }
  // Floaters.
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  for (const f of state.floaters) {
    ctx.globalAlpha = Math.min(1, f.life);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
  // HUD + prompt.
  drawHud(ctx, state);
  drawPrompt(ctx, state);
  // Held-item label.
  if (state.chef.holding) {
    ctx.fillStyle = 'rgba(43,33,24,0.85)';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    const label = `Holding: ${componentLabel(state.chef.holding)}`;
    const w = ctx.measureText(label).width + 28;
    rr(ctx, (VIEW_W - w) / 2, 100, w, 28, 14);
    ctx.fill();
    ctx.fillStyle = '#fff6e3';
    ctx.fillText(label, VIEW_W / 2, 119);
  }
  if (state.mode === 'title') {
    drawOverlay(ctx, 'BISTRO BLITZ', [
      'A French bistro dinner service. Chop, grill, simmer, plate —',
      'serve every ticket before its patience runs out.',
      '',
      'Move: WASD / Arrows / Click    •    Interact: E    •    Serve at the plating counter',
      '',
      'Press Enter or click to start',
    ]);
  }
  if (state.mode === 'over') {
    const stars = '★'.repeat(Math.max(0, Math.min(3, 1 + Math.floor(state.coins / 45)))) ;
    drawOverlay(
      ctx,
      state.timeLeft <= 0 ? 'SERVICE COMPLETE!' : 'SERVICE FAILED',
      [
        state.overReason || '',
        `Served ${state.served} dishes  •  Lost ${state.lost}  •  ${state.coins} coins`,
        stars,
        '',
        'Press R to run the service again',
      ],
      state.timeLeft <= 0 ? PALETTE.gold : '#ff6b5e',
    );
  }
  void input;
}
