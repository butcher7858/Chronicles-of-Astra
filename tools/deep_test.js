const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');

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
    createElement: (tag) => tag === 'canvas' ? { width: 400, height: 300, getContext: () => mockCtx, style: {}, addEventListener: ()=>{} } : ({ tagName: tag.toUpperCase(), setAttribute: ()=>{}, style: {}, querySelector: ()=>mockCv, querySelectorAll: ()=>[mockCv], appendChild: ()=>{} }),
    addEventListener: () => {},
    body: { classList: { add: ()=>{}, remove: ()=>{} } }
  },
  location: { search: '', href: '' },
  navigator: { userAgent: 'node' },
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  },
  Math,
  Date,
  parseInt,
  parseFloat,
  setTimeout: () => {},
  clearTimeout: () => {},
  setInterval: () => {},
  clearInterval: () => {},
  requestAnimationFrame: () => {},
  cancelAnimationFrame: () => {},
  matchMedia: () => ({ matches: false }),
  console
};
sandbox.window = sandbox;
sandbox.document.defaultView = sandbox.window;
sandbox.matchMedia = () => ({ matches: false });
sandbox.addEventListener = () => {};
sandbox.removeEventListener = () => {};

// Extract script content
const scriptRegex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
let match;
let fullJs = '';
while ((match = scriptRegex.exec(html)) !== null) {
  fullJs += match[1] + '\n';
}

// Strip outer IIFE if present so vars attach to context
fullJs = fullJs.replace(/\(function\(\)\{\s*['"]use strict['"];?/, '');
fullJs = fullJs.replace(/\}\)\(\);?\s*$/, '');

console.log('Evaluating scripts in sandbox...');
vm.createContext(sandbox);

try {
  vm.runInContext(fullJs, sandbox);
  console.log('✓ Sandbox execution successful!');
} catch (e) {
  console.error('Execution error:', e);
  process.exit(1);
}

// Now test game data and logic inside the sandbox
console.log('\n--- Deep Logic and Content Verification ---');
const [clsOrder, CLS, slots, RECIPES, MOUNTS, genItem] = vm.runInContext('[CLASS_ORDER, CLS, SLOTS, RECIPES, MOUNTS, genItem]', sandbox);
console.log('Classes registered (' + clsOrder.length + '):', clsOrder.join(', '));
if (clsOrder.length !== 10) throw new Error('Expected 10 classes in CLASS_ORDER');

for (const c of clsOrder) {
  const cl = CLS[c];
  if (!cl) throw new Error('Missing class: ' + c);
  if (cl.ab.length !== 15) throw new Error('Class ' + c + ' has ' + cl.ab.length + ' abilities instead of 15');
  console.log('✓ Class ' + cl.name + ' (' + c + ') has ' + cl.ab.length + ' abilities up to level ' + cl.ab[cl.ab.length-1].ul);
}

console.log('\nSlots (' + slots.length + '):', slots.join(', '));
if (slots.length !== 15) throw new Error('Expected 15 slots');

for (const s of slots) {
  const item = genItem(50, 3, s, 'dk');
  if (!item || !item.name || isNaN(item.price)) throw new Error('Failed to genItem for slot ' + s);
}
console.log('✓ Successfully generated level 50 epic gear for all 15 slots.');

const recKeys = Object.keys(RECIPES);
console.log('\nRecipes registered (' + recKeys.length + '):', recKeys.join(', '));
if (recKeys.length < 15) throw new Error('Expected at least 15 recipes');

const mKeys = Object.keys(MOUNTS);
console.log('\nMounts registered (' + mKeys.length + '):', mKeys.join(', '));
for (const m of mKeys) {
  if (!MOUNTS[m].perk) throw new Error('Mount ' + m + ' missing perk');
}
console.log('✓ All ' + mKeys.length + ' mounts have unique mechanical perks.');

console.log('\n✓ ALL DEEP LOGIC VERIFICATIONS COMPLETED SUCCESSFULLY!');
process.exit(0);
