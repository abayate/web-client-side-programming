// ai.js - "Admiral Orca", the computer opponent.
// Three levels of intelligence:
//   easy   : fires at random unexplored squares
//   medium : classic hunt/target (random search, then chases hits in a line)
//   hard   : probability-density AI. For every unexplored square it counts how many
//            placements of the still-afloat enemy ships could cover it, then fires at
//            the most likely square (with a checkerboard parity bonus while hunting
//            and a big weight for squares adjacent to unresolved hits).
const SIZE = 10;
const SHIP_DEFS = [
  { name: 'Carrier', len: 5 },
  { name: 'Battleship', len: 4 },
  { name: 'Cruiser', len: 3 },
  { name: 'Submarine', len: 3 },
  { name: 'Destroyer', len: 2 }
];

class AdmiralAI {
  constructor(level) {
    this.level = level;
    this.tried = Array.from({ length: SIZE }, () => Array(SIZE).fill(0)); // 0 unknown, 1 miss, 2 hit, 3 sunk
    this.remaining = SHIP_DEFS.map(s => s.len);   // lengths of the player's ships still afloat
    this.opened = [];                              // hits not yet part of a sunk ship
  }

  // The game tells the AI what happened after each of its shots.
  report(r, c, result, sunkLen) {
    if (result === 'miss') this.tried[r][c] = 1;
    else {
      this.tried[r][c] = 2; this.opened.push([r, c]);
      if (result === 'sunk') {
        this.remaining.splice(this.remaining.indexOf(sunkLen), 1);
        this.resolveSunk(sunkLen);
      }
    }
  }
  // Mark the cells of the just-sunk ship as resolved. A sunk ship is a straight line of
  // `len` open hits that includes the last shot; pick the line that fits.
  resolveSunk(len) {
    const [lr, lc] = this.opened[this.opened.length - 1];
    for (const [dr, dc] of [[0, 1], [1, 0]]) {
      for (let off = 0; off < len; off++) {
        const cells = [];
        for (let i = 0; i < len; i++) cells.push([lr - dr * (off) + dr * i, lc - dc * (off) + dc * i]);
        if (cells.every(([r, c]) => this.isOpenHit(r, c))) {
          cells.forEach(([r, c]) => { this.tried[r][c] = 3; });
          this.opened = this.opened.filter(([r, c]) => this.tried[r][c] === 2);
          return;
        }
      }
    }
    // fallback: just resolve the last hit
    const [r, c] = this.opened.pop(); this.tried[r][c] = 3;
  }
  isOpenHit(r, c) { return r >= 0 && c >= 0 && r < SIZE && c < SIZE && this.tried[r][c] === 2; }
  isFree(r, c) { return r >= 0 && c >= 0 && r < SIZE && c < SIZE && this.tried[r][c] === 0; }

  chooseShot() {
    if (this.level === 'easy') return this.randomShot();
    if (this.level === 'medium') return this.huntTarget();
    return this.densityShot();
  }

  randomShot() {
    const free = [];
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (this.tried[r][c] === 0) free.push([r, c]);
    return free[Math.floor(Math.random() * free.length)];
  }

  huntTarget() {
    if (this.opened.length) {
      // two or more hits in line -> extend the line, otherwise probe neighbours
      const cand = [];
      for (const [r, c] of this.opened) for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nr = r + dr, nc = c + dc;
        if (!this.isFree(nr, nc)) continue;
        const aligned = this.isOpenHit(r - dr, c - dc);
        cand.push({ cell: [nr, nc], w: aligned ? 5 : 1 });
      }
      if (cand.length) return this.pickWeighted(cand);
    }
    // hunt on a checkerboard so we never waste shots between small ships
    const parity = [];
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (this.tried[r][c] === 0 && (r + c) % 2 === 0) parity.push([r, c]);
    return parity.length ? parity[Math.floor(Math.random() * parity.length)] : this.randomShot();
  }

  pickWeighted(items) {
    const total = items.reduce((s, i) => s + i.w, 0); let x = Math.random() * total;
    for (const i of items) { x -= i.w; if (x <= 0) return i.cell; }
    return items[items.length - 1].cell;
  }

  // ---- Hard: probability density ----
  densityMap() {
    const map = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    const hasOpen = this.opened.length > 0;
    for (const len of this.remaining) {
      for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const cells = []; let ok = true, openCovered = 0;
        for (let i = 0; i < len; i++) {
          const rr = r + dr * i, cc = c + dc * i;
          if (rr >= SIZE || cc >= SIZE) { ok = false; break; }
          const t = this.tried[rr][cc];
          if (t === 1 || t === 3) { ok = false; break; }   // cannot overlap a miss or a sunk ship
          if (t === 2) openCovered++;
          cells.push([rr, cc]);
        }
        if (!ok) continue;
        // when there are unresolved hits, placements that explain them are far more likely
        const w = hasOpen ? (openCovered ? 1 + openCovered * 25 : 0.15) : 1;
        for (const [rr, cc] of cells) if (this.tried[rr][cc] === 0) map[rr][cc] += w;
      }
    }
    return map;
  }
  densityShot() {
    const map = this.densityMap(); let best = -1, picks = [];
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      if (this.tried[r][c] !== 0) continue;
      let v = map[r][c];
      if (!this.opened.length && (r + c) % 2 === 0) v *= 1.15;   // mild parity bonus while hunting
      if (v > best + 1e-9) { best = v; picks = [[r, c]]; } else if (Math.abs(v - best) < 1e-9) picks.push([r, c]);
    }
    return picks[Math.floor(Math.random() * picks.length)];
  }
}

// Random ship placement shared by the player's "randomize" button and the AI's fleet.
function randomFleet() {
  const occupied = Array.from({ length: SIZE }, () => Array(SIZE).fill(-1));
  const ships = [];
  SHIP_DEFS.forEach((def, id) => {
    for (;;) {
      const horiz = Math.random() < .5, r = Math.floor(Math.random() * SIZE), c = Math.floor(Math.random() * SIZE);
      const cells = [];
      for (let i = 0; i < def.len; i++) cells.push([r + (horiz ? 0 : i), c + (horiz ? i : 0)]);
      if (cells.every(([rr, cc]) => rr < SIZE && cc < SIZE && occupied[rr][cc] === -1)) {
        cells.forEach(([rr, cc]) => occupied[rr][cc] = id);
        ships.push({ id, name: def.name, len: def.len, cells, hits: 0 });
        break;
      }
    }
  });
  return { occupied, ships };
}
