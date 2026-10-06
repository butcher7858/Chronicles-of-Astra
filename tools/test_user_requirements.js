const fs = require('fs');
const vm = require('vm');

console.log('Testing User Requirements...');

const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  console.error("No <script> tag found in index.html");
  process.exit(1);
}

const mockCtx = {
  saveCount: 0,
  save() { this.saveCount++; },
  restore() { this.saveCount--; },
  translate() {},
  scale() {},
  rotate() {},
  beginPath() {},
  closePath() {},
  fill() {},
  stroke() {},
  fillRect() {},
  strokeRect() {},
  roundRect() {},
  clearRect() {},
  fillText() {},
  measureText() { return { width: 50 }; },
  arc() {},
  arcTo() {},
  ellipse() {},
  moveTo() {},
  lineTo() {},
  quadraticCurveTo() {},
  bezierCurveTo() {},
  createRadialGradient() { return { addColorStop() {} }; },
  createLinearGradient() { return { addColorStop() {} }; },
  setLineDash() {},
  clip() {},
  drawImage() {}
};

const domMock = {
  window: {
    addEventListener() {},
    innerWidth: 1024,
    innerHeight: 768,
    matchMedia() { return { matches: false }; },
    localStorage: {
      _data: {},
      getItem(k) { return this._data[k] || null; },
      setItem(k, v) { this._data[k] = String(v); },
      removeItem(k) { delete this._data[k]; }
    }
  },
  document: {
    getElementById(id) {
      return {
        id: id,
        hidden: true,
        getContext() { return mockCtx; },
        addEventListener() {},
        style: {},
        setAttribute() {},
        appendChild() {},
        removeChild() {},
        remove() {},
        classList: {
          _classes: new Set(),
          add(c) { this._classes.add(c); },
          remove(c) { this._classes.delete(c); },
          contains(c) { return this._classes.has(c); },
          toggle(c, force) {
            if (force === undefined) {
              if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c);
            } else if (force) {
              this._classes.add(c);
            } else {
              this._classes.delete(c);
            }
          }
        },
        children: [],
        querySelector() { return null; },
        querySelectorAll() { return []; }
      };
    },
    createElement(tag) {
      return {
        width: 100, height: 100,
        style: {},
        dataset: {},
        setAttribute() {},
        getAttribute() { return null; },
        appendChild() {},
        removeChild() {},
        remove() {},
        children: [],
        classList: {
          _classes: new Set(),
          add(c) { this._classes.add(c); },
          remove(c) { this._classes.delete(c); },
          contains(c) { return this._classes.has(c); },
          toggle(c) {}
        },
        querySelector() { return null; },
        querySelectorAll() { return []; },
        addEventListener() {},
        getContext() { return mockCtx; }
      };
    },
    addEventListener() {},
    querySelectorAll() { return []; }
  },
  localStorage: null
};
domMock.localStorage = domMock.window.localStorage;

const sandbox = {
  window: domMock.window,
  document: domMock.document,
  localStorage: domMock.localStorage,
  navigator: { userAgent: 'node' },
  location: { search: '' },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  Math: Math,
  Date: Date,
  JSON: JSON,
  Uint8Array: Uint8Array,
  Float32Array: Float32Array,
  requestAnimationFrame: (fn) => 1,
  cancelAnimationFrame: (id) => {},
  btoa: (str) => Buffer.from(str, 'binary').toString('base64'),
  atob: (b64) => Buffer.from(b64, 'base64').toString('binary')
};

const context = vm.createContext(sandbox);

let scriptCode = scriptMatch[1].trim();
scriptCode = scriptCode.replace(/^\(function\(\)\{\s*['"]use strict['"];?/, '');
scriptCode = scriptCode.replace(/\}\)\(\);?\s*$/, '');

try {
  vm.runInContext(scriptCode, context);
} catch (e) {
  console.error("Evaluation error:", e);
  process.exit(1);
}

// 1. Test Bag expansion logic
vm.runInContext(`
  P = {
    cls: 'war',
    level: 10,
    inv: [],
    eq: {},
    bags: [
      { t: 'bag', key: 'bag_linen', slots: 6, extraSlots: 6 },
      { t: 'bag', key: 'bag_silk', slots: 14, extraSlots: 14 },
      null,
      null
    ]
  };
  const baseSlots = maxInventorySlots();
  if (baseSlots !== 24 + 6 + 14) {
    throw new Error('Bag capacity failed: expected 44, got ' + baseSlots);
  }
`, context);
console.log('✓ PASS: Bag inventory expansion works (+20 slots from linen and silk bags)');

// 2. Test Action Bar deduplication and item support
vm.runInContext(`(() => {
  P = {
    cls: 'paladin',
    level: 20,
    inv: [{ t: 'cons', key: 'hp1', n: 5 }],
    actionBar: [0, 1, 2, 0, 1, null, null, null, null, null, null, null],
    actionBar2: [2, 3, 4, 1, 0, null, null, null, null, null, null, null]
  };
  sanitizeActionBars();
  const seen = new Set();
  for (let i = 0; i < 12; i++) {
    const v1 = P.actionBar[i];
    if (typeof v1 === 'number') {
      if (seen.has(v1)) throw new Error('Duplicate found in bar 1: ' + v1);
      seen.add(v1);
    }
  }
  for (let i = 0; i < 12; i++) {
    const v2 = P.actionBar2[i];
    if (typeof v2 === 'number') {
      if (seen.has(v2)) throw new Error('Duplicate found in bar 2: ' + v2);
      seen.add(v2);
    }
  }
})()`, context);
console.log('✓ PASS: sanitizeActionBars cleanly eliminates duplicate powers across both bars');

// 3. Test World Boundaries and Safe Hubs
vm.runInContext(`(() => {
  genWorld();
  // Check perimeter is not blocked
  if (block[idx(0, 50)] === 1 && block[idx(1, 50)] === 1 && block[idx(2, 50)] === 1) {
    throw new Error('Perimeter boundary still completely blocked');
  }
  // Check coordinate wrapping
  const zLeft = zoneAt(-5, 50);
  const zRight = zoneAt(W + 5, 50);
  if (!zLeft || !zRight) {
    throw new Error('Coordinate wrapping failed');
  }
})()`, context);
console.log('✓ PASS: World boundaries are open and coordinate wrapping is seamless');

// 4. Test Player targeting in clickWorld
vm.runInContext(`(() => {
  G.started = true;
  P.dead = false;
  G.mobs = [];
  G.npcs = [];
  G.nodes = [];
  G.bots = [{ x: 500, y: 500, size: 14, name: 'Aventurero_Test', bot: true, hp: 100, maxhp: 100 }];
  P.target = null;
  clickWorld(500, 500, false);
  if (!P.target || P.target.name !== 'Aventurero_Test') {
    throw new Error('Targeting bot/player failed in clickWorld');
  }
})()`, context);
console.log('✓ PASS: clickWorld successfully targets other players and bots');

// 5. Test Achievements and Title claim
vm.runInContext(`(() => {
  P.achievements = {};
  P.titles = ['novice'];
  P.title = 'novice';
  P.level = 25;
  P.gold = 15000;
  P.bags = [null, null, null, null];
  P.inv = [];
  P.eq = {};
  P.buffs = [];
  P.quests = {};
  P.atk = 20;
  P.armor = 10;
  P.crit = 5;
  checkAchievements();
  if (!P.achievements['lvl5'] || !P.achievements['lvl20'] || !P.achievements['gold1k']) {
    throw new Error('Achievements check failed to award achievements');
  }
  claimAllEligibleTitles();
  if (!P.titles.includes('champion_alba') || !P.titles.includes('tycoon')) {
    throw new Error('claimAllEligibleTitles failed to unlock titles');
  }
})()`, context);
console.log('✓ PASS: Achievements and Title claiming work seamlessly');

console.log('\n========================================');
console.log('ALL USER REQUIREMENTS VERIFIED SUCCESSFULLY!');
console.log('========================================');
process.exit(0);
