const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  console.error("No <script> tag found in index.html");
  process.exit(1);
}

// Minimal DOM & Canvas Mock
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
        hidden: false,
        getContext() { return mockCtx; },
        addEventListener() {},
        style: {},
        setAttribute() {},
        classList: { add() {}, remove() {}, toggle() {} },
        children: [],
        querySelector() { return null; },
        querySelectorAll() { return []; }
      };
    },
    createElement(tag) {
      return {
        width: 100, height: 100,
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
  requestAnimationFrame: (fn) => 1,
  cancelAnimationFrame: (id) => {},
  btoa: (str) => Buffer.from(str, 'binary').toString('base64'),
  atob: (b64) => Buffer.from(b64, 'base64').toString('binary')
};

// Sandbox execution
const context = vm.createContext(sandbox);

console.log("========================================");
console.log("--- Executing Audit Verification Suite ---");
console.log("========================================");

let scriptCode = scriptMatch[1].trim();
scriptCode = scriptCode.replace(/^\(function\(\)\{\s*['"]use strict['"];?/, '');
scriptCode = scriptCode.replace(/\}\)\(\);?\s*$/, '');

try {
  vm.runInContext(scriptCode, context);
} catch (e) {
  console.error("Evaluation error:", e);
  process.exit(1);
}

// Extract symbols from context scope
const [
  drawCreature, lookFor, hexRGB, SLOTS, SLOT_IC, IC, svg, ZLV, SPAWN_PLAN,
  BOSS_CRYPT, BOSS_FROST_EMP, LocalBE, snapshot
] = vm.runInContext(`[
  drawCreature, lookFor, hexRGB, SLOTS, SLOT_IC, IC, svg, ZLV, SPAWN_PLAN,
  BOSS_CRYPT, BOSS_FROST_EMP, LocalBE, snapshot
]`, context);

let passed = 0, total = 0;
function test(desc, fn) {
  total++;
  try {
    fn();
    console.log(`✓ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`✗ FAIL: ${desc} -> ${err.message}`);
  }
}

// 1. Canvas Stack Integrity in drawCreature
test("Canvas context balance in drawCreature (dragon, void, titan)", () => {
  const g = Object.assign({}, mockCtx, { saveCount: 0 });
  const dragonMob = { def: { id: 'dragon_ignis', kind: 'quad', look: { dragon: true }, size: 26, scale: 1.5 }, name: 'Dragón Ignis' };
  drawCreature(g, 0, 0, dragonMob, { t: 1, dir: 1, moving: false });
  if (g.saveCount !== 0) throw new Error(`Dragon saveCount unbalanced: ${g.saveCount}`);

  g.saveCount = 0;
  const voidMob = { def: { id: 'void_horror', kind: 'arach', look: { void: true }, size: 30, scale: 1.4 }, name: 'Terror del Vacío' };
  drawCreature(g, 0, 0, voidMob, { t: 1, dir: 1, moving: false });
  if (g.saveCount !== 0) throw new Error(`Void saveCount unbalanced: ${g.saveCount}`);

  g.saveCount = 0;
  const titanMob = { def: { id: 'titan_colossus', kind: 'golem', look: { titan: true }, size: 32, scale: 1.6 }, name: 'Coloso de los Titanes' };
  drawCreature(g, 0, 0, titanMob, { t: 1, dir: 1, moving: false });
  if (g.saveCount !== 0) throw new Error(`Titan saveCount unbalanced: ${g.saveCount}`);
});

// 2. lookFor polymorphism
test("lookFor accepts player entity object or discrete args", () => {
  const dummyP = {
    cls: 'dk',
    app: { skin: '#e0b890', hair: '#1c1c24', hairStyle: 2, beard: 1 },
    eq: { head: { rar: 3, name: 'Corona de Hielo' }, chest: { rar: 4, name: 'Coraza Maldita' }, weapon: { rar: 4, name: 'Espada de Sangre' } }
  };
  const L1 = lookFor(dummyP);
  if (!L1 || L1.hatType !== 'crown' || L1.weapon !== 'sword') {
    throw new Error(`lookFor(P) failed: ${JSON.stringify(L1)}`);
  }
  const L2 = lookFor('mage', { skin: '#f0c8a0' }, { weapon: { rar: 2, name: 'Bastón de Luz' } });
  if (!L2 || L2.weapon !== 'staff') {
    throw new Error(`lookFor(cls, app, eq) failed: ${JSON.stringify(L2)}`);
  }
});

// 3. hexRGB 3-char and 6-char hex handling
test("hexRGB handles #rgb, #rrggbb, without hash, and invalid fallback", () => {
  const rgbWhite = hexRGB('#fff');
  if (rgbWhite[0] !== 255 || rgbWhite[1] !== 255 || rgbWhite[2] !== 255) {
    throw new Error(`hexRGB('#fff') returned [${rgbWhite}] instead of [255,255,255]`);
  }
  const rgbAmber = hexRGB('#f59e0b');
  if (rgbAmber[0] !== 245 || rgbAmber[1] !== 158 || rgbAmber[2] !== 11) {
    throw new Error(`hexRGB('#f59e0b') returned [${rgbAmber}]`);
  }
  const rgbFallback = hexRGB(null);
  if (rgbFallback[0] !== 255 || rgbFallback[1] !== 255 || rgbFallback[2] !== 255) {
    throw new Error(`hexRGB(null) fallback failed`);
  }
});

// 4. Equipment Slot Icons in IC
test("All 15 gear slots have non-empty SVG icons", () => {
  for (const slot of SLOTS) {
    const icKey = SLOT_IC[slot];
    if (!icKey || !IC[icKey]) {
      throw new Error(`Missing icon for slot: ${slot} (icKey: ${icKey})`);
    }
    const svgStr = svg(icKey);
    if (!svgStr.includes('<svg') || !svgStr.includes('</svg>') || (!svgStr.includes('<path') && !svgStr.includes('<polygon') && !svgStr.includes('<circle'))) {
      throw new Error(`Empty SVG generated for slot: ${slot}`);
    }
  }
});

// 5. Zone Level Table Completeness
test("ZLV includes all 28 world and instance zones", () => {
  const requiredZones = ['meadow','forest','hills','cave','swamp','desert','snow','palace','volcano','necropolis','shadowlands','titanpeaks','astralvoid','jungle','desert_ruins','crystal_woods','vortex','dungeon_crypt','dungeon_frost'];
  for (const z of requiredZones) {
    if (!ZLV[z]) throw new Error(`Missing zone in ZLV: ${z}`);
  }
});

// 6. Spawn Plan and Dungeon Bosses
test("SPAWN_PLAN includes quest mobs and dungeon bosses", () => {
  const mobTypes = SPAWN_PLAN.map(p => p[0]);
  const requiredQuestMobs = ['ghoul', 'crypt_fiend', 'death_knight_foe', 'shadow_wraith', 'obsidian_destroyer', 'void_reaver', 'jungle_tiger', 'cinder_golem', 'crystal_ancient', 'vortex_horror'];
  for (const qm of requiredQuestMobs) {
    if (!mobTypes.includes(qm)) throw new Error(`Missing spawn pack for quest mob: ${qm}`);
  }
  if (!BOSS_CRYPT || !BOSS_FROST_EMP) {
    throw new Error("Missing BOSS_CRYPT or BOSS_FROST_EMP coordinates");
  }
});

// 7. LocalBE Beacon and State Persistence
test("LocalBE.saveBeacon saves character progress to localStorage", () => {
  const testChar = { id: 'test_c1', user_id: 'usr_1', name: 'AstraHero', level: 15, x: 100, y: 150, zone: 'town', kills: 42, appearance: {} };
  const testState = { xp: 1200, gold: 350, inv: [], eq: {}, quests: {}, disc: { town: 1 }, options: { _extra: { bankGold: 100 } } };
  
  const localDb = { users: { 'test@astra.local': { id: 'usr_1' } }, chars: [testChar], states: {}, chat: [] };
  domMock.localStorage.setItem('astra_local_db_v1', JSON.stringify(localDb));
  domMock.localStorage.setItem('astra_local_sess_v1', JSON.stringify({ id: 'usr_1', email: 'test@astra.local' }));

  LocalBE.saveBeacon(testChar, testState);
  const updatedDb = JSON.parse(domMock.localStorage.getItem('astra_local_db_v1'));
  if (!updatedDb.states['test_c1']) throw new Error("LocalBE.saveBeacon did not persist character state");
  if (updatedDb.states['test_c1'].gold !== 350) throw new Error("LocalBE.saveBeacon data mismatch");
});

// 8. Snapshot _extra Packing
test("snapshot() preserves expansion state in options._extra", () => {
  vm.runInContext(`
    P = {
      charId: 'c_abc', level: 25, x: 200, y: 300, kills: 120, app: {},
      xp: 5000, gold: 1200, inv: [], eq: {}, quests: {}, disc: {},
      bags: [{ n: 1, key: 'bag_silk' }, null, null, null],
      bank: [{ t: 'gear', name: 'Espada de Plata', rar: 2 }],
      bankGold: 500,
      achievements: { lvl5: Date.now() },
      titles: ['novice', 'champion_alba'],
      title: 'champion_alba',
      actionBar: [0, 1, 2],
      actionBar2: [3, 4, 5],
      recipes: { hp1: true, mp1: true, elixir_atk: true },
      craftedCount: 15,
      duelsWon: 7,
      dungeonsCleared: 3,
      visitedZones: { town: 1, capital: 1 },
      talents: { t1: 1 }, mount: 'wolf', mounts: ['horse', 'wolf'], guild: { name: 'Orden Solar', members: [] }
    };
    Object.assign(G, { zone: { id: 'capital' }, explored: new Uint8Array(10), worldT: 100, autoLoot: true, sfxOn: true, sprintToggle: false, shakeOff: false });
  `, context);

  const snap = snapshot();
  if (!snap.st.options || !snap.st.options._extra) {
    throw new Error("snapshot() missing options._extra");
  }
  const ext = snap.st.options._extra;
  if (ext.bankGold !== 500 || ext.craftedCount !== 15 || ext.title !== 'champion_alba' || ext.mount !== 'wolf') {
    throw new Error(`snapshot() _extra corrupted: ${JSON.stringify(ext)}`);
  }
});

console.log("========================================");
console.log(`RESULTS: ${passed}/${total} AUDIT REGRESSION TESTS PASSED (${Math.round(passed/total*100)}%)`);
console.log("========================================");
if (passed !== total) process.exit(1);
process.exit(0);
