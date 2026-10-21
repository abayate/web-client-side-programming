// game.js - Fleet Command: the UI and rules. The AI opponent lives in ai.js.
const $ = id => document.getElementById(id);
const COLS = 'ABCDEFGHIJ';

let phase = 'setup';           // setup | battle | over
let player, enemy, ai;
let horizontal = true, placeIdx = 0, hoverCell = null;
let sonarLeft = 3, sonarMode = false, playerTurn = true, busy = false;
let lastAiShot = null, sonarMarks = [];
let playerView, enemyView;     // 10x10 of 0 unknown, 1 miss, 2 hit, 3 sunk (what each side has fired at)

// ---------- Build the grids ----------
function buildGrid(el, owner) {
  el.innerHTML = '<div class="hdr"></div>' + [...COLS].map(l => `<div class="hdr">${l}</div>`).join('');
  for (let r = 0; r < SIZE; r++) {
    el.insertAdjacentHTML('beforeend', `<div class="hdr">${r + 1}</div>`);
    for (let c = 0; c < SIZE; c++) {
      const d = document.createElement('div');
      d.className = 'cell'; d.dataset.r = r; d.dataset.c = c; d.dataset.owner = owner;
      el.appendChild(d);
    }
  }
}
const cellEl = (owner, r, c) => $(owner === 'player' ? 'playerGrid' : 'enemyGrid').querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);

// ---------- Setup phase ----------
function newPlacement() {
  player = { occupied: Array.from({ length: SIZE }, () => Array(SIZE).fill(-1)), ships: [] };
  placeIdx = 0; phase = 'setup'; hoverCell = null;
  $('startBtn').disabled = true; $('rotateBtn').disabled = false; $('randomBtn').disabled = false;
  $('setup').classList.remove('hidden');
  say('Place your fleet: click your grid to position the highlighted ship. Press R to rotate.');
  render();
}
function shipCellsAt(r, c, len) {
  const cells = [];
  for (let i = 0; i < len; i++) cells.push([r + (horizontal ? 0 : i), c + (horizontal ? i : 0)]);
  return cells;
}
const validPlacement = cells => cells.every(([r, c]) => r < SIZE && c < SIZE && player.occupied[r][c] === -1);

function placeShip(r, c) {
  const def = SHIP_DEFS[placeIdx], cells = shipCellsAt(r, c, def.len);
  if (!validPlacement(cells)) return say("That ship doesn't fit there.");
  cells.forEach(([rr, cc]) => player.occupied[rr][cc] = placeIdx);
  player.ships.push({ id: placeIdx, name: def.name, len: def.len, cells, hits: 0 });
  placeIdx++;
  if (placeIdx >= SHIP_DEFS.length) {
    $('startBtn').disabled = false; say('Fleet ready! Press "Start battle".');
  } else say(`Place your ${SHIP_DEFS[placeIdx].name} (${SHIP_DEFS[placeIdx].len} squares).`);
  render();
}

// ---------- Battle ----------
function startBattle() {
  if (placeIdx < SHIP_DEFS.length) return;
  phase = 'battle'; playerTurn = true; busy = false; sonarLeft = 3; sonarMode = false; sonarMarks = []; lastAiShot = null;
  enemy = randomFleet();
  ai = new AdmiralAI($('difficulty').value);
  playerView = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  enemyView = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  $('setup').classList.add('hidden');
  $('enemyGrid').classList.remove('disabled'); $('sonarBtn').disabled = false; $('sonarLeft').textContent = sonarLeft;
  log('sys', `Battle begins! Admiral Orca is playing on ${$('difficulty').selectedOptions[0].text.split(' –')[0]}.`);
  say('Your turn: click a square in Enemy Waters to fire.');
  render();
}

function fire(grid, view, r, c) {
  // returns { result: 'miss'|'hit'|'sunk', ship }
  const id = grid.occupied[r][c];
  if (id === -1) { view[r][c] = 1; return { result: 'miss' }; }
  const ship = grid.ships[id]; ship.hits++; view[r][c] = 2;
  if (ship.hits === ship.len) { ship.cells.forEach(([rr, cc]) => view[rr][cc] = 3); return { result: 'sunk', ship }; }
  return { result: 'hit', ship };
}
const coord = (r, c) => COLS[c] + (r + 1);
const allSunk = g => g.ships.every(s => s.hits === s.len);

function playerFire(r, c) {
  if (phase !== 'battle' || !playerTurn || busy) return;
  if (sonarMode) return useSonar(r, c);
  if (playerView[r][c] !== 0) return say('You already fired there.');
  const res = fire(enemy, playerView, r, c);
  const text = res.result === 'miss' ? 'a miss.' : res.result === 'hit' ? 'a HIT!' : `a HIT — you sank the enemy ${res.ship.name}!`;
  log('you', `You fire at ${coord(r, c)}: ${text}`);
  render();
  if (allSunk(enemy)) return endGame(true);
  playerTurn = false; busy = true;
  say('Admiral Orca is calculating…');
  setTimeout(aiTurn, 800 + Math.random() * 500);
}

function aiTurn() {
  const [r, c] = ai.chooseShot();
  const res = fire(player, enemyView, r, c);
  ai.report(r, c, res.result, res.ship && res.ship.len);
  lastAiShot = [r, c];
  const text = res.result === 'miss' ? 'a miss.' : res.result === 'hit' ? `HIT on your ${res.ship.name}!` : `HIT — your ${res.ship.name} is sunk!`;
  log('ai', `Orca fires at ${coord(r, c)}: ${text}`);
  render();
  if (allSunk(player)) return endGame(false);
  busy = false; playerTurn = true;
  say('Your turn: click a square in Enemy Waters to fire.');
}

// ---------- Sonar (player power-up): counts enemy ship squares in a 3x3 area, costs your turn ----------
function toggleSonar() {
  if (phase !== 'battle' || !playerTurn || busy || sonarLeft <= 0) return;
  sonarMode = !sonarMode;
  $('sonarBtn').textContent = sonarMode ? '📡 Click a square to ping (cancel)' : `📡 Sonar ping (${sonarLeft} left)`;
  say(sonarMode ? 'Sonar armed: click the centre of a 3×3 area.' : 'Your turn: click a square in Enemy Waters to fire.');
}
function useSonar(r, c) {
  let count = 0;
  const area = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const rr = r + dr, cc = c + dc; if (rr < 0 || cc < 0 || rr >= SIZE || cc >= SIZE) continue;
    area.push([rr, cc]); if (enemy.occupied[rr][cc] !== -1) count++;
  }
  sonarMarks = area; sonarLeft--; sonarMode = false;
  $('sonarLeft').textContent = sonarLeft;
  $('sonarBtn').textContent = `📡 Sonar ping (${sonarLeft} left)`; $('sonarBtn').disabled = sonarLeft === 0;
  log('you', `Sonar at ${coord(r, c)}: ${count} ship square${count === 1 ? '' : 's'} detected in the 3×3 area.`);
  render();
  playerTurn = false; busy = true; say('Admiral Orca is calculating…');
  setTimeout(aiTurn, 800);
}

// ---------- End ----------
function endGame(won) {
  phase = 'over'; busy = false;
  $('enemyGrid').classList.add('disabled'); $('sonarBtn').disabled = true;
  const rec = loadRecord(), key = ai.level;
  rec[key] = rec[key] || { w: 0, l: 0 }; won ? rec[key].w++ : rec[key].l++;
  localStorage.setItem('fleetCommandRecord', JSON.stringify(rec));
  $('status').className = 'status ' + (won ? 'win' : 'lose');
  say(won ? '🎉 Victory! You sank the entire enemy fleet.' : '💀 Defeat. Admiral Orca sank your fleet.');
  log('sys', won ? 'You win!' : 'Admiral Orca wins.');
  // reveal remaining enemy ships
  enemy.ships.forEach(s => s.cells.forEach(([r, c]) => { if (enemyReveal(r, c)) cellEl('enemy', r, c).classList.add('ship'); }));
  $('setup').classList.remove('hidden'); $('startBtn').disabled = false; $('rotateBtn').disabled = true; $('randomBtn').disabled = true;
  $('startBtn').textContent = 'Rematch (same fleet)';
  renderRecord();
}
const enemyReveal = (r, c) => playerView[r][c] === 0;
function loadRecord() { try { return JSON.parse(localStorage.getItem('fleetCommandRecord')) || {}; } catch { return {}; } }
function renderRecord() {
  const rec = loadRecord();
  $('record').innerHTML = ['easy', 'medium', 'hard'].map(k => `<b>${k[0].toUpperCase() + k.slice(1)}</b>: ${rec[k] ? rec[k].w : 0} W / ${rec[k] ? rec[k].l : 0} L`).join('<br>');
}

// ---------- Rendering ----------
function render() {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    const pe = cellEl('player', r, c), ee = cellEl('enemy', r, c);
    pe.className = 'cell'; ee.className = 'cell';
    if (player.occupied[r][c] !== -1) pe.classList.add('ship');
    if (phase !== 'setup') {
      applyState(pe, enemyView[r][c]); applyState(ee, playerView[r][c]);
      if (lastAiShot && lastAiShot[0] === r && lastAiShot[1] === c) pe.classList.add('last');
      if (sonarMarks.some(([a, b]) => a === r && b === c)) ee.classList.add('sonar');
    }
  }
  // placement preview
  if (phase === 'setup' && hoverCell && placeIdx < SHIP_DEFS.length) {
    const cells = shipCellsAt(hoverCell[0], hoverCell[1], SHIP_DEFS[placeIdx].len), ok = validPlacement(cells);
    cells.forEach(([r, c]) => { if (r < SIZE && c < SIZE) cellEl('player', r, c).classList.add(ok ? 'preview-ok' : 'preview-bad'); });
  }
  // ship chips
  $('playerShips').innerHTML = SHIP_DEFS.map((d, i) => {
    const s = player.ships[i], sunk = s && s.hits === s.len;
    const cls = sunk ? 'sunk' : (phase === 'setup' && i === placeIdx ? 'active' : '');
    return `<span class="chip ${cls}">${d.name} (${d.len})</span>`;
  }).join('');
  $('enemyShips').innerHTML = phase === 'setup' ? '' : SHIP_DEFS.map((d, i) => {
    const s = enemy.ships[i];
    return `<span class="chip ${s.hits === s.len ? 'sunk' : ''}">${d.name} (${d.len})</span>`;
  }).join('');
}
function applyState(el, v) { if (v === 1) el.classList.add('miss'); else if (v === 2) el.classList.add('hit'); else if (v === 3) el.classList.add('hit', 'sunk'); }
function say(t) { $('status').textContent = t; }
function log(kind, t) { const p = document.createElement('p'); p.className = kind; p.textContent = t; $('log').appendChild(p); $('log').scrollTop = 1e6; }

// ---------- Events ----------
$('playerGrid').addEventListener('mouseover', e => { if (phase === 'setup' && e.target.dataset.r !== undefined) { hoverCell = [+e.target.dataset.r, +e.target.dataset.c]; render(); } });
$('playerGrid').addEventListener('mouseleave', () => { hoverCell = null; if (phase === 'setup') render(); });
$('playerGrid').addEventListener('click', e => { if (phase === 'setup' && placeIdx < SHIP_DEFS.length && e.target.dataset.r !== undefined) placeShip(+e.target.dataset.r, +e.target.dataset.c); });
$('enemyGrid').addEventListener('click', e => { if (e.target.dataset.r !== undefined) playerFire(+e.target.dataset.r, +e.target.dataset.c); });
$('rotateBtn').onclick = () => { horizontal = !horizontal; render(); };
$('randomBtn').onclick = () => {
  const f = randomFleet(); player = { occupied: f.occupied, ships: f.ships }; placeIdx = SHIP_DEFS.length;
  $('startBtn').disabled = false; say('Fleet placed randomly. Press "Start battle" (or randomize again).'); render();
};
$('startBtn').onclick = () => {
  if (phase === 'over') { // rematch: keep the fleet layout, reset damage
    player.ships.forEach(s => s.hits = 0); $('status').className = 'status'; $('log').innerHTML = ''; $('startBtn').textContent = 'Start battle';
  }
  startBattle();
};
$('resetBtn').onclick = () => { $('status').className = 'status'; $('log').innerHTML = ''; $('startBtn').textContent = 'Start battle'; $('enemyGrid').classList.add('disabled'); $('sonarBtn').disabled = true; sonarMarks = []; newPlacement(); };
$('sonarBtn').onclick = toggleSonar;
addEventListener('keydown', e => { if (e.key === 'r' || e.key === 'R') { horizontal = !horizontal; render(); } if (e.key === 'Escape' && sonarMode) toggleSonar(); });

// ---------- Boot ----------
buildGrid($('playerGrid'), 'player'); buildGrid($('enemyGrid'), 'enemy');
playerView = Array.from({ length: SIZE }, () => Array(SIZE).fill(0)); enemyView = playerView.map(r => r.slice());
enemy = { ships: [], occupied: [] };
newPlacement(); renderRecord();
