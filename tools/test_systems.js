const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

console.log('--- Testing Key Systems in index.html ---');
const checks = [
  { name: 'Max Level 60', test: /MAXLV=60/ },
  { name: '15 Slots', test: /SLOTS=\['head','necklace','shoulders','chest','cape','amulet','relic','gloves','legs','boots','ring','trinket1','trinket2','weapon','shield'\]/ },
  { name: 'Death Knight Class', test: /dk:\{key:'dk'/ },
  { name: 'Shaman Class', test: /shaman:\{key:'shaman'/ },
  { name: '10 Classes in Order', test: /CLASS_ORDER=\['paladin','war','dk','mage','priest','shaman','rogue','hunter','necro','druid'\]/ },
  { name: 'ActionBar 12 Slots', test: /maxSlots=12/ },
  { name: 'Spellbook Panel (pSpells)', test: /id="pSpells"/ },
  { name: 'Crafting Panel (pCraft)', test: /id="pCraft"/ },
  { name: 'Spellbook Button (bSpells)', test: /id="bSpells"/ },
  { name: 'Crafting Button (bCraft)', test: /id="bCraft"/ },
  { name: 'Talents 5 Tiers', test: /max:1,stat:'hpM',val:0.20/ },
  { name: 'Mount Perks in MOUNTS', test: /perk:'\+25% Armadura Física'/ },
  { name: 'Dragon Ignis Custom Model', test: /isDragon=m\.def\.id==='dragon_ignis'/ },
  { name: 'Void Horror Custom Model', test: /isVoid=m\.def\.id==='void_horror'/ },
  { name: 'Titan Colossus Custom Model', test: /isTitan=m\.def\.id==='titan_colossus'/ },
  { name: 'Lich Malakor Custom Visuals', test: /m\.def\.id==='lich_malakor'/ },
  { name: 'Unified Keydown Dispatcher', test: /dispatchBoundAction\(boundAct\)/ }
];

let allPassed = true;
checks.forEach(c => {
  const ok = c.test.test(html);
  console.log((ok ? '✓ PASS: ' : '✗ FAIL: ') + c.name);
  if (!ok) allPassed = false;
});

if (allPassed) {
  console.log('\nALL 17 SYSTEM CHECKS PASSED PERFECTLY!');
  process.exit(0);
} else {
  console.error('\nSOME CHECKS FAILED');
  process.exit(1);
}
