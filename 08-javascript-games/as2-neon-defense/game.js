// Neon Defense - tower defense by Anthony Bayate
const cv = document.getElementById('board'), ctx = cv.getContext('2d');
const $ = id => document.getElementById(id);
const T = 60, COLS = 14, ROWS = 9, MAX_WAVE = 20;

// ---------- Path (tile coordinates) ----------
const WAYPOINTS = [[-1, 1], [11, 1], [11, 4], [2, 4], [2, 7], [14, 7]];
const pathPx = WAYPOINTS.map(([x, y]) => ({ x: x * T + T / 2, y: y * T + T / 2 }));
const pathTiles = new Set();
for (let i = 0; i < WAYPOINTS.length - 1; i++) {
  const [x1, y1] = WAYPOINTS[i], [x2, y2] = WAYPOINTS[i + 1];
  for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) pathTiles.add(x + ',' + y);
}

// ---------- Tower & enemy definitions ----------
const TOWERS = {
  pulse:  { name: 'Pulse',  cost: 50,  range: 125, dmg: 9,  rate: 24,  color: '#4dffea', desc: 'Fast, cheap' },
  cannon: { name: 'Cannon', cost: 110, range: 115, dmg: 34, rate: 85,  color: '#ff9f4d', splash: 62, desc: 'Area damage' },
  frost:  { name: 'Frost',  cost: 80,  range: 105, dmg: 2,  rate: 18,  color: '#7aa7ff', slow: .5, desc: 'Slows enemies' },
  sniper: { name: 'Sniper', cost: 160, range: 270, dmg: 95, rate: 120, color: '#ff4dd2', desc: 'Long range' }
};
const ORDER = ['pulse', 'cannon', 'frost', 'sniper'];
const ENEMIES = {
  grunt: { hp: 40,  speed: 1.0, reward: 7,  r: 12, color: '#ff5470' },
  fast:  { hp: 26,  speed: 1.9, reward: 6,  r: 10, color: '#ffd34d' },
  tank:  { hp: 160, speed: .6,  reward: 18, r: 17, color: '#b36bff' },
  boss:  { hp: 900, speed: .5,  reward: 150, r: 24, color: '#ff2e63' }
};

// ---------- State ----------
let gold, lives, wave, towers, enemies, bullets, fx, floaters, queue, spawnT, waveActive, selected, building, mouse, speed, paused, over, running, frame;
let best = +localStorage.getItem('neonDefenseBest') || 0;
$('best').textContent = best;

function reset() {
  gold = 175; lives = 20; wave = 0; towers = []; enemies = []; bullets = []; fx = []; floaters = [];
  queue = []; spawnT = 0; waveActive = false; selected = null; building = null; mouse = null; speed = 1; paused = false; over = false; frame = 0;
  $('speedBtn').textContent = 'Speed ×1'; log('Build some towers, then send the first wave.');
  refresh();
}
function log(t) { $('log').textContent = t; }

// ---------- Waves ----------
function sendWave() {
  if (waveActive || over || wave >= MAX_WAVE) return;
  wave++; waveActive = true; queue = [];
  const n = 6 + wave * 2, hpScale = Math.pow(1.14, wave - 1);
  for (let i = 0; i < n; i++) {
    let type = 'grunt';
    if (wave >= 3 && i % 4 === 3) type = 'fast';
    if (wave >= 5 && i % 6 === 5) type = 'tank';
    queue.push({ type, hpScale });
  }
  if (wave % 5 === 0) queue.push({ type: 'boss', hpScale: Math.pow(1.14, wave - 5) });
  spawnT = 0;
  log(wave % 5 === 0 ? `Wave ${wave}: BOSS incoming!` : `Wave ${wave} started.`);
  refresh();
}
function spawn(q) {
  const d = ENEMIES[q.type];
  enemies.push({ type: q.type, x: pathPx[0].x, y: pathPx[0].y, seg: 1, hp: d.hp * q.hpScale, maxHp: d.hp * q.hpScale, slowT: 0, d, progress: 0 });
}

// ---------- Helpers ----------
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const tileAt = (px, py) => ({ x: Math.floor(px / T), y: Math.floor(py / T) });
const canBuild = (tx, ty) => tx >= 0 && ty >= 0 && tx < COLS && ty < ROWS && !pathTiles.has(tx + ',' + ty) && !towers.some(t => t.tx === tx && t.ty === ty);
const stat = (t, k) => { const base = TOWERS[t.kind][k]; if (k === 'dmg') return base * (1 + .5 * (t.level - 1)); if (k === 'range') return base * (1 + .1 * (t.level - 1)); if (k === 'rate') return base * (1 - .12 * (t.level - 1)); return base; };
const upgradeCost = t => Math.round(TOWERS[t.kind].cost * .75 * t.level);
const sellValue = t => Math.round(t.invested * .6);

// ---------- Update ----------
function step() {
  frame++;
  if (waveActive && queue.length && --spawnT <= 0) { spawn(queue.shift()); spawnT = 38; }

  // enemies move along the path
  for (const e of enemies) {
    const f = e.slowT > 0 ? ENEMIES[e.type].speed * .5 : e.d.speed;
    if (e.slowT > 0) e.slowT--;
    let move = f * 1.5;
    while (move > 0 && e.seg < pathPx.length) {
      const tgt = pathPx[e.seg], dx = tgt.x - e.x, dy = tgt.y - e.y, dd = Math.hypot(dx, dy);
      if (dd <= move) { e.x = tgt.x; e.y = tgt.y; e.seg++; move -= dd; } else { e.x += dx / dd * move; e.y += dy / dd * move; move = 0; }
    }
    e.progress = e.seg * 10000 - Math.hypot(pathPx[Math.min(e.seg, pathPx.length - 1)].x - e.x, pathPx[Math.min(e.seg, pathPx.length - 1)].y - e.y);
    if (e.seg >= pathPx.length) { e.escaped = true; lives -= e.type === 'boss' ? 10 : 1; floaters.push({ x: 800, y: 440, t: '-' + (e.type === 'boss' ? 10 : 1), c: '#ff6b8a', l: 40 }); }
  }
  enemies = enemies.filter(e => !e.escaped);

  // towers shoot (target = furthest along path inside range)
  for (const t of towers) {
    t.cd--;
    const rng = stat(t, 'range');
    let target = null;
    for (const e of enemies) if (dist(t, e) <= rng && (!target || e.progress > target.progress)) target = e;
    t.angle = target ? Math.atan2(target.y - t.y, target.x - t.x) : t.angle;
    if (target && t.cd <= 0) {
      t.cd = stat(t, 'rate');
      bullets.push({ x: t.x, y: t.y, target, kind: t.kind, dmg: stat(t, 'dmg'), color: TOWERS[t.kind].color, sp: t.kind === 'sniper' ? 22 : 9 });
    }
  }

  // bullets
  for (const b of bullets) {
    if (b.target.hp <= 0) { b.dead = true; continue; }
    const d = dist(b, b.target);
    if (d < b.sp + 4) { b.dead = true; impact(b); } else { b.x += (b.target.x - b.x) / d * b.sp; b.y += (b.target.y - b.y) / d * b.sp; }
  }
  bullets = bullets.filter(b => !b.dead);

  // deaths
  for (const e of enemies) if (e.hp <= 0 && !e.rewarded) {
    e.rewarded = true; gold += e.d.reward; floaters.push({ x: e.x, y: e.y, t: '+' + e.d.reward, c: '#ffd34d', l: 40 });
    for (let i = 0; i < 8; i++) fx.push({ x: e.x, y: e.y, vx: (Math.random() - .5) * 5, vy: (Math.random() - .5) * 5, l: 22, c: e.d.color });
  }
  enemies = enemies.filter(e => e.hp > 0);
  fx.forEach(p => { p.x += p.vx; p.y += p.vy; p.l--; }); fx = fx.filter(p => p.l > 0);
  floaters.forEach(f => { f.y -= .6; f.l--; }); floaters = floaters.filter(f => f.l > 0);

  if (waveActive && !queue.length && !enemies.length) {
    waveActive = false; const bonus = 20 + wave * 3; gold += bonus; log(`Wave ${wave} cleared! +${bonus} credits.`);
    if (wave > best) { best = wave; localStorage.setItem('neonDefenseBest', best); }
    if (wave >= MAX_WAVE) return finish(true);
  }
  if (lives <= 0) return finish(false);
  if (frame % 10 === 0) refresh();
}
function impact(b) {
  const def = TOWERS[b.kind];
  if (def.splash) {
    enemies.forEach(e => { if (dist(e, b.target) <= def.splash) e.hp -= b.dmg; });
    fx.push({ x: b.target.x, y: b.target.y, vx: 0, vy: 0, l: 14, c: def.color, ring: def.splash });
  } else b.target.hp -= b.dmg;
  if (def.slow) b.target.slowT = 90;
}
function finish(win) {
  over = true; $('overlay').classList.remove('hidden');
  $('overlay').querySelector('.card').innerHTML = `<h2>${win ? 'Victory!' : 'Core Destroyed'}</h2><p>${win ? 'You survived all 20 waves.' : `You reached wave ${wave}.`} Best wave: ${best}.</p><button id="startBtn">Play Again</button>`;
  $('startBtn').onclick = startGame;
}

// ---------- Draw ----------
function draw() {
  ctx.fillStyle = '#07071a'; ctx.fillRect(0, 0, cv.width, cv.height);
  // grid
  ctx.strokeStyle = 'rgba(80,120,255,.08)';
  for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * T, 0); ctx.lineTo(x * T, ROWS * T); ctx.stroke(); }
  for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * T); ctx.lineTo(COLS * T, y * T); ctx.stroke(); }
  // path
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#141a50'; ctx.lineWidth = 40; strokePath();
  ctx.strokeStyle = '#2b3da0'; ctx.lineWidth = 3; ctx.setLineDash([10, 14]); ctx.lineDashOffset = -frame / 2; strokePath(); ctx.setLineDash([]);
  // core
  ctx.fillStyle = '#00ffd5'; ctx.shadowColor = '#00ffd5'; ctx.shadowBlur = 24; ctx.fillRect(COLS * T - 18, 7 * T + 12, 18, 36); ctx.shadowBlur = 0;

  // build preview
  if (building && mouse) {
    const { x, y } = tileAt(mouse.x, mouse.y), ok = canBuild(x, y) && gold >= TOWERS[building].cost;
    ctx.fillStyle = ok ? 'rgba(77,255,234,.18)' : 'rgba(255,60,90,.22)'; ctx.fillRect(x * T, y * T, T, T);
    ctx.strokeStyle = ok ? 'rgba(77,255,234,.6)' : 'rgba(255,60,90,.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x * T + T / 2, y * T + T / 2, TOWERS[building].range, 0, 7); ctx.stroke();
  }
  // towers
  for (const t of towers) {
    const def = TOWERS[t.kind];
    if (t === selected) { ctx.strokeStyle = 'rgba(255,211,77,.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(t.x, t.y, stat(t, 'range'), 0, 7); ctx.stroke(); ctx.fillStyle = 'rgba(255,211,77,.07)'; ctx.fill(); }
    ctx.fillStyle = '#0d1030'; ctx.fillRect(t.tx * T + 6, t.ty * T + 6, T - 12, T - 12);
    ctx.strokeStyle = def.color; ctx.lineWidth = 2; ctx.strokeRect(t.tx * T + 6, t.ty * T + 6, T - 12, T - 12);
    ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(t.angle || 0); ctx.fillStyle = def.color; ctx.shadowColor = def.color; ctx.shadowBlur = 10;
    ctx.fillRect(0, -3, 20, 6); ctx.beginPath(); ctx.arc(0, 0, 8, 0, 7); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('★'.repeat(t.level), t.tx * T + 9, t.ty * T + 18);
  }
  // enemies
  for (const e of enemies) {
    ctx.fillStyle = e.slowT > 0 ? '#7aa7ff' : e.d.color; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(e.x, e.y, e.d.r, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#300'; ctx.fillRect(e.x - 14, e.y - e.d.r - 9, 28, 4); ctx.fillStyle = '#3dff8b'; ctx.fillRect(e.x - 14, e.y - e.d.r - 9, 28 * Math.max(0, e.hp / e.maxHp), 4);
  }
  for (const b of bullets) { ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(b.x, b.y, b.kind === 'cannon' ? 5 : 3, 0, 7); ctx.fill(); ctx.shadowBlur = 0; }
  for (const p of fx) {
    ctx.globalAlpha = p.l / 22;
    if (p.ring) { ctx.strokeStyle = p.c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, p.ring * (1 - p.l / 14), 0, 7); ctx.stroke(); }
    else { ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 3, 3); }
  }
  ctx.globalAlpha = 1;
  ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
  for (const f of floaters) { ctx.globalAlpha = f.l / 40; ctx.fillStyle = f.c; ctx.fillText(f.t, f.x, f.y); } ctx.globalAlpha = 1;
  if (paused) { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.fillStyle = '#ffd34d'; ctx.font = 'bold 48px sans-serif'; ctx.fillText('PAUSED', cv.width / 2, cv.height / 2); }
}
function strokePath() { ctx.beginPath(); pathPx.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke(); }

// ---------- UI ----------
function buildShop() {
  $('shop').innerHTML = '';
  ORDER.forEach((k, i) => {
    const d = TOWERS[k], b = document.createElement('button');
    b.className = 'tower-btn'; b.dataset.kind = k;
    b.innerHTML = `<b style="color:${d.color}">${i + 1}. ${d.name}</b>${d.desc}<br><small>${d.cost} credits</small>`;
    b.onclick = () => chooseBuild(k); $('shop').appendChild(b);
  });
}
function chooseBuild(k) { building = building === k ? null : k; selected = null; refresh(); }
function refresh() {
  $('gold').textContent = Math.floor(gold); $('lives').textContent = Math.max(0, lives); $('wave').textContent = wave; $('best').textContent = best;
  document.querySelectorAll('.tower-btn').forEach(b => { b.disabled = gold < TOWERS[b.dataset.kind].cost; b.classList.toggle('sel', b.dataset.kind === building); });
  $('waveBtn').disabled = waveActive || over || wave >= MAX_WAVE;
  $('waveBtn').textContent = waveActive ? `Wave ${wave} in progress…` : wave >= MAX_WAVE ? 'All waves done' : `Send Wave ${wave + 1}`;
  if (selected) {
    const t = selected, d = TOWERS[t.kind];
    $('info').innerHTML = `<b style="color:${d.color}">${d.name}</b> · Level ${t.level}/3<br>Damage ${Math.round(stat(t, 'dmg'))} · Range ${Math.round(stat(t, 'range'))}<br>Fire delay ${Math.round(stat(t, 'rate'))} ticks · Sell value ${sellValue(t)}`;
    $('upgradeBtn').disabled = t.level >= 3 || gold < upgradeCost(t);
    $('upgradeBtn').textContent = t.level >= 3 ? 'Max level' : `Upgrade (${upgradeCost(t)})`;
    $('sellBtn').disabled = false; $('sellBtn').textContent = `Sell (${sellValue(t)})`;
  } else {
    $('info').textContent = building ? `Placing ${TOWERS[building].name}. Click a free tile (not on the path).` : 'Click a tower on the map.';
    $('upgradeBtn').disabled = $('sellBtn').disabled = true; $('upgradeBtn').textContent = 'Upgrade'; $('sellBtn').textContent = 'Sell';
  }
}

cv.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); mouse = { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; });
cv.addEventListener('mouseleave', () => mouse = null);
cv.addEventListener('click', e => {
  if (!running || over) return;
  const r = cv.getBoundingClientRect(), px = (e.clientX - r.left) * cv.width / r.width, py = (e.clientY - r.top) * cv.height / r.height;
  const { x, y } = tileAt(px, py);
  if (building) {
    const def = TOWERS[building];
    if (canBuild(x, y) && gold >= def.cost) {
      gold -= def.cost;
      towers.push({ kind: building, tx: x, ty: y, x: x * T + T / 2, y: y * T + T / 2, level: 1, cd: 0, invested: def.cost, angle: 0 });
      if (gold < def.cost) building = null;
    } else log(!canBuild(x, y) ? "Can't build there." : 'Not enough credits.');
  } else selected = towers.find(t => t.tx === x && t.ty === y) || null;
  refresh();
});
$('upgradeBtn').onclick = () => { const t = selected; if (t && t.level < 3 && gold >= upgradeCost(t)) { gold -= upgradeCost(t); t.invested += upgradeCost(t); t.level++; refresh(); } };
$('sellBtn').onclick = () => { if (selected) { gold += sellValue(selected); towers = towers.filter(t => t !== selected); selected = null; refresh(); } };
$('waveBtn').onclick = sendWave;
$('speedBtn').onclick = () => { speed = speed === 1 ? 2 : speed === 2 ? 3 : 1; $('speedBtn').textContent = `Speed ×${speed}`; };
$('pauseBtn').onclick = () => paused = !paused;
addEventListener('keydown', e => {
  if (e.key >= '1' && e.key <= '4') chooseBuild(ORDER[e.key - 1]);
  else if (e.key === ' ') { e.preventDefault(); if (running) sendWave(); }
  else if (e.key === 'Escape') { building = null; selected = null; refresh(); }
  else if (e.key === 'p' || e.key === 'P') paused = !paused;
});

function startGame() { reset(); running = true; $('overlay').classList.add('hidden'); }
$('startBtn').onclick = startGame;
buildShop(); reset(); running = false;

function loop() {
  if (running && !paused && !over) for (let i = 0; i < speed; i++) if (!over) step();
  draw(); requestAnimationFrame(loop);
}
loop();
