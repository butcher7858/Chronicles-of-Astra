const fs = require('fs');
const vm = require('vm');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

const mockCtx = {
  fillRect:()=>{}, strokeRect:()=>{}, clearRect:()=>{}, beginPath:()=>{}, closePath:()=>{},
  moveTo:()=>{}, lineTo:()=>{}, arc:()=>{}, arcTo:()=>{}, ellipse:()=>{}, clip:()=>{}, roundRect:()=>{},
  quadraticCurveTo:()=>{}, bezierCurveTo:()=>{},
  stroke:()=>{}, fill:()=>{}, save:()=>{}, restore:()=>{}, translate:()=>{},
  scale:()=>{}, rotate:()=>{}, setTransform:()=>{}, drawImage:()=>{},
  createLinearGradient:()=>({addColorStop:()=>{}}),
  createRadialGradient:()=>({addColorStop:()=>{}}),
  measureText:()=>({width:10}), strokeText:()=>{}, fillText:()=>{},
  setLineDash:()=>{}
};
const mockCv = { width: 400, height: 300, getContext: () => mockCtx, style: {}, addEventListener: ()=>{}, querySelector: ()=>mockCv, querySelectorAll: ()=>[mockCv], appendChild: ()=>{}, setAttribute: ()=>{}, classList: { toggle: ()=>{}, add: ()=>{}, remove: ()=>{} } };

const sandbox = {
  window: { matchMedia: () => ({ matches: false }) },
  document: {
    getElementById: (id) => mockCv,
    querySelector: (sel) => mockCv,
    querySelectorAll: (sel) => [mockCv],
    createElement: (tag) => mockCv,
    addEventListener: () => {},
    body: { classList: { add: ()=>{}, remove: ()=>{} } }
  },
  location: { search: '', href: '' },
  navigator: { userAgent: 'node' },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  Math, Date, parseInt, parseFloat,
  setTimeout: () => {}, clearTimeout: () => {}, setInterval: () => {}, clearInterval: () => {},
  requestAnimationFrame: () => {}, cancelAnimationFrame: () => {},
  console
};
sandbox.window = sandbox;
sandbox.document.defaultView = sandbox.window;

// Read files in build order
const files = [
  'b2_data.js', 'c2_logic.js', 'c2b_classes.js', 'd3a_sprites.js',
  'd3b_world.js', 'd3c_chars.js', 'd3c2_creat.js', 'd3d_update.js',
  'd3e_draw.js', 'd4a_ui.js', 'd4b_input.js', 'd5_backend.js',
  'd6_screens.js', 'd7_multiplayer.js', 'd9_extras.js'
];

let fullCode = '';
for (const f of files) {
  let content = fs.readFileSync(path.join(srcDir, f), 'utf8');
  content = content.replace(/<script(?:\s+[^>]*)?>/gi, '').replace(/<\/script>/gi, '');
  fullCode += content + '\n';
}

fullCode = fullCode.replace(/\(function\(\)\{\s*['"]use strict['"];?/, '');
fullCode = fullCode.replace(/\}\)\(\);?\s*$/, '');

const ctx = vm.createContext(sandbox);
vm.runInContext(fullCode, ctx);

console.log('--- Checking Game Data Integrity ---');

const [ITEMS, RECIPES, QUESTS, NPC_DEF, MOBS, SPAWN_PLAN, Z, ZLV, ACHIEVEMENTS, SLOTS, SLOT_IC, IC] =
  vm.runInContext('[ITEMS, RECIPES, QUESTS, NPC_DEF, MOBS, SPAWN_PLAN, Z, ZLV, ACHIEVEMENTS, SLOTS, SLOT_IC, IC]', ctx);

const issues = [];

// 1. Check recipes ingredients and outputs
console.log(`Checking ${Object.keys(RECIPES).length} recipes...`);
for (const [recId, rec] of Object.entries(RECIPES)) {
  for (const [ing, count] of Object.entries(rec.in || {})) {
    if (!ITEMS[ing]) {
      issues.push(`Recipe [${recId}] requires missing item [${ing}]`);
    }
  }
  if (rec.out && rec.out.key && !ITEMS[rec.out.key]) {
    issues.push(`Recipe [${recId}] produces missing item [${rec.out.key}]`);
  }
}

// 2. Check quests: giver, turnin, obj mobs, reward items
console.log(`Checking ${Object.keys(QUESTS).length} quests...`);
const npcIds = new Set(NPC_DEF.map(n => n.id));
for (const [qid, q] of Object.entries(QUESTS)) {
  if (q.giver && !npcIds.has(q.giver)) {
    issues.push(`Quest [${qid}] giver NPC [${q.giver}] not in NPC_DEF`);
  }
  if (q.turnin && !npcIds.has(q.turnin)) {
    issues.push(`Quest [${qid}] turnin NPC [${q.turnin}] not in NPC_DEF`);
  }
  if (q.obj) {
    if (q.obj.type === 'kill' && q.obj.mob) {
      if (!MOBS[q.obj.mob]) {
        issues.push(`Quest [${qid}] kill target [${q.obj.mob}] not in MOBS`);
      }
    }
    if (q.obj.type === 'item' && q.obj.key) {
      if (!ITEMS[q.obj.key]) {
        issues.push(`Quest [${qid}] requires missing item [${q.obj.key}]`);
      }
    }
  }
  if (q.reward && q.reward.item && !ITEMS[q.reward.item]) {
    issues.push(`Quest [${qid}] rewards missing item [${q.reward.item}]`);
  }
}

// 3. Check spawn plan mob IDs
console.log(`Checking ${SPAWN_PLAN.length} spawn packs...`);
for (const pack of SPAWN_PLAN) {
  const mobType = pack[0];
  if (!MOBS[mobType]) {
    issues.push(`Spawn plan has mob [${mobType}] which is not in MOBS`);
  }
}

// 4. Check zones and level table
console.log(`Checking ${Z.length} zones...`);
for (const z of Z) {
  if (!ZLV[z.id]) {
    issues.push(`Zone [${z.id}] is missing from ZLV level table`);
  }
}

// 5. Check slots and icons
console.log(`Checking ${SLOTS.length} equipment slots...`);
for (const s of SLOTS) {
  const icKey = SLOT_IC[s];
  if (!icKey || !IC[icKey]) {
    issues.push(`Slot [${s}] has invalid or missing icon [${icKey}]`);
  }
}

console.log('\n--- Integrity Test Results ---');
if (issues.length === 0) {
  console.log('✓ All data definitions are 100% valid and consistent!');
} else {
  console.log(`Found ${issues.length} issues:`);
  issues.forEach(i => console.log('  ✗', i));
}
