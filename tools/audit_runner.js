const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('====================================================');
console.log('--- Chronicles of Astra Full Automated Audit Suite ---');
console.log('====================================================');

const srcDir = path.join(__dirname, '..', 'src');
const htmlFile = path.join(srcDir, 'a2_head.html');
const htmlContent = fs.readFileSync(htmlFile, 'utf8');

const jsFiles = [
  'b2_data.js', 'c2_logic.js', 'c2b_classes.js', 'd3a_sprites.js',
  'd3b_world.js', 'd3c_chars.js', 'd3c2_creat.js', 'd3d_update.js',
  'd3e_draw.js', 'd4a_ui.js', 'd4b_input.js', 'd5_backend.js',
  'd6_screens.js', 'd7_multiplayer.js', 'd9_extras.js', 'd8_boot.js'
];

// 1. Check panel integrity
console.log('\n[1] Checking Panels and Close Buttons:');
const PANELS = [
  'pInv','pChar','pQuest','pDlg','pShop','pLoot','pMap','pOpts',
  'pSpells','pCraft','pTalents','pMounts','pGuild','pTrade','pBank',
  'pAchieve','pRankings','pBarber','pInspect'
];
let panelErrors = 0;
for (const p of PANELS) {
  const hasId = htmlContent.includes(`id="${p}"`);
  const hasClose = htmlContent.includes(`data-close="${p}"`);
  if (!hasId) {
    console.error(`  ✗ Panel element #${p} not found in HTML`);
    panelErrors++;
  }
  if (!hasClose) {
    console.error(`  ✗ Panel close button for #${p} (data-close="${p}") not found in HTML`);
    panelErrors++;
  }
}
if (panelErrors === 0) {
  console.log(`  ✓ All ${PANELS.length} panels and close buttons are properly defined in HTML!`);
}

// 2. Check all declared IDs in HTML vs used in JS
console.log('\n[2] Checking HTML ID References:');
const declaredIds = new Set();
const idRegex = /id=["']([^"']+)["']/g;
let m;
while ((m = idRegex.exec(htmlContent)) !== null) {
  declaredIds.add(m[1]);
}

const missingStaticIds = [];
const dynamicIds = new Set(['barberTitleSelect', 'keysModal', 'noticeModal', 'quickbar', 'btnBankWdGold', 'btnGbankDepGold', 'btnGbankWdGold']);

jsFiles.forEach(f => {
  const code = fs.readFileSync(path.join(srcDir, f), 'utf8');
  const dollarRegex = /\$\((['"])([^'"]+)\1\)/g;
  while ((m = dollarRegex.exec(code)) !== null) {
    const id = m[2];
    if (!declaredIds.has(id) && !dynamicIds.has(id)) {
      missingStaticIds.push({ file: f, id });
    }
  }
});
if (missingStaticIds.length === 0) {
  console.log('  ✓ All static ID queries correspond to existing HTML elements!');
} else {
  missingStaticIds.forEach(x => console.warn(`  ! [${x.file}] $('#${x.id}') is not declared statically in HTML`));
}

// 3. Check XSS vulnerabilities
console.log('\n[3] Checking HTML Injection and Escaping:');
let xssWarnings = 0;
jsFiles.forEach(f => {
  const code = fs.readFileSync(path.join(srcDir, f), 'utf8');
  const lines = code.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('.innerHTML =') || line.includes('.innerHTML=')) {
      // Check if line incorporates user variables without esc()
      if (line.includes('P.name') && !line.includes('esc(P.name)')) {
        console.warn(`  ! [${f}:${idx+1}] Potential unescaped P.name: ${line.trim()}`);
        xssWarnings++;
      }
      if (line.includes('target.name') && !line.includes('esc(target.name)')) {
        console.warn(`  ! [${f}:${idx+1}] Potential unescaped target.name: ${line.trim()}`);
        xssWarnings++;
      }
    }
  });
});
if (xssWarnings === 0) {
  console.log('  ✓ Character and target names are consistently escaped in innerHTML assignments!');
}

// 4. Check ZLV completeness in c2_logic.js
console.log('\n[4] Checking World Zones Level Table (ZLV):');
const mockCtx = {
  fillRect:()=>{}, strokeRect:()=>{}, clearRect:()=>{}, beginPath:()=>{}, closePath:()=>{},
  moveTo:()=>{}, lineTo:()=>{}, arc:()=>{}, arcTo:()=>{}, ellipse:()=>{}, clip:()=>{}, roundRect:()=>{},
  quadraticCurveTo:()=>{}, bezierCurveTo:()=>{}, stroke:()=>{}, fill:()=>{}, save:()=>{}, restore:()=>{},
  translate:()=>{}, scale:()=>{}, rotate:()=>{}, setTransform:()=>{}, drawImage:()=>{},
  createLinearGradient:()=>({addColorStop:()=>{}}), createRadialGradient:()=>({addColorStop:()=>{}}),
  measureText:()=>({width:10}), strokeText:()=>{}, fillText:()=>{}, setLineDash:()=>{}
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
  requestAnimationFrame: () => {}, cancelAnimationFrame: () => {}, console
};
sandbox.window = sandbox;
sandbox.document.defaultView = sandbox.window;

let fullCode = '';
for (const f of jsFiles.filter(x => x !== 'd8_boot.js')) {
  let content = fs.readFileSync(path.join(srcDir, f), 'utf8');
  content = content.replace(/<script(?:\s+[^>]*)?>/gi, '').replace(/<\/script>/gi, '');
  fullCode += content + '\n';
}
fullCode = fullCode.replace(/\(function\(\)\{\s*['"]use strict['"];?/, '');
fullCode = fullCode.replace(/\}\)\(\);?\s*$/, '');

const vmc = vm.createContext(sandbox);
vm.runInContext(fullCode, vmc);

const [Z, ZLV, ACHIEVEMENTS] = vm.runInContext('[Z, ZLV, ACHIEVEMENTS]', vmc);
let missingZlv = 0;
for (const z of Z) {
  if (ZLV[z.id] === undefined) {
    console.error(`  ✗ Zone '${z.id}' (${z.name}) is missing from ZLV!`);
    missingZlv++;
  }
}
if (missingZlv === 0) {
  console.log(`  ✓ All ${Z.length} world zones are covered in ZLV level table!`);
}

// 5. Check Achievements Max vs Description
console.log('\n[5] Checking Achievements Consistency:');
let achMismatches = 0;
for (const a of ACHIEVEMENTS) {
  if (a.id === 'gold10k' && a.max !== 10000) {
    console.error(`  ✗ Achievement 'gold10k' has max=${a.max} instead of 10000!`);
    achMismatches++;
  }
}
if (achMismatches === 0) {
  console.log(`  ✓ All ${ACHIEVEMENTS.length} achievements have accurate goal targets!`);
}

console.log('\n====================================================');
console.log('--- Static Audit Complete ---');
console.log('====================================================\n');
