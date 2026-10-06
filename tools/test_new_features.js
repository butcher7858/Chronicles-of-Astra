const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');

function createMockEl(tag = 'div') {
  const el = {
    tagName: tag.toUpperCase(),
    width: 400,
    height: 300,
    getContext: () => mockCtx,
    style: {},
    dataset: {},
    children: [],
    classList: {
      add: () => {},
      remove: () => {},
      toggle: () => {},
      contains: () => false
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    setAttribute: () => {},
    getAttribute: () => '',
    removeAttribute: () => {},
    querySelector: (sel) => createMockEl(),
    querySelectorAll: (sel) => [createMockEl()],
    appendChild: (ch) => { el.children.push(ch); return ch; },
    removeChild: (ch) => {
      const idx = el.children.indexOf(ch);
      if (idx >= 0) el.children.splice(idx, 1);
      return ch;
    },
    closest: (sel) => null,
    focus: () => {},
    blur: () => {},
    remove: () => {},
    innerHTML: '',
    textContent: '',
    value: ''
  };
  return el;
}

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

const sandbox = {
  window: { matchMedia: () => ({ matches: false }) },
  document: {
    getElementById: (id) => createMockEl(),
    querySelector: (sel) => createMockEl(),
    querySelectorAll: (sel) => [createMockEl()],
    createElement: (tag) => createMockEl(tag),
    addEventListener: () => {},
    body: createMockEl('body')
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

const scriptRegex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
let match;
let fullJs = '';
while ((match = scriptRegex.exec(html)) !== null) {
  fullJs += match[1] + '\n';
}

fullJs = fullJs.replace(/\(function\(\)\{\s*['"]use strict['"];?/, '');
fullJs = fullJs.replace(/\}\)\(\);?\s*$/, '');

vm.createContext(sandbox);
vm.runInContext(fullJs, sandbox);

console.log('\n========================================');
console.log('--- Testing Chronicles of Astra Expansion Features ---');
console.log('========================================');

const tests = [
  {
    name: 'Bags System (5 bags, 24 base + 4 equipable up to 120 slots)',
    run: () => {
      vm.runInContext(`
        P = makePlayer('war', 'TestHero');
        if (maxInventorySlots() !== 24) throw new Error('Expected default slots = 24, got ' + maxInventorySlots());

        const bag1 = { t: 'bag', key: 'bag_linen', name: 'Bolsa de Lino', slots: 10, bind: 'boe', rar: 1 };
        const bag2 = { t: 'bag', key: 'bag_astral', name: 'Mochila Astral', slots: 24, bind: 'bop', rar: 4 };

        equipBag(bag1, 0);
        if (maxInventorySlots() !== 34) throw new Error('Expected 34 slots after bag1, got ' + maxInventorySlots());
        if (bag1.bind !== 'bound') throw new Error('Equipping boe bag should bind it');

        equipBag(bag2, 1);
        if (maxInventorySlots() !== 58) throw new Error('Expected 58 slots after bag2, got ' + maxInventorySlots());

        unequipBag(1);
        if (maxInventorySlots() !== 34) throw new Error('Expected 34 slots after unequipping bag2');
      `, sandbox);
      return true;
    }
  },
  {
    name: 'Personal Bank and Guild Bank Storage & Gold',
    run: () => {
      vm.runInContext(`
        P = makePlayer('war', 'TestHero');
        P.gold = 500;
        P.bankGold = 0;
        bankDepositGold(200);
        if (P.gold !== 300 || P.bankGold !== 200) throw new Error('Bank deposit gold failed: P.gold=' + P.gold + ', bankGold=' + P.bankGold);

        bankWithdrawGold(100);
        if (P.gold !== 400 || P.bankGold !== 100) throw new Error('Bank withdraw gold failed: P.gold=' + P.gold + ', bankGold=' + P.bankGold);

        const unboundItem = { t: 'gear', name: 'Espada Comerciable', bind: 'unbound', id: '111', rar: 1, slot: 'weapon' };
        const boundItem = { t: 'gear', name: 'Reliquia Ligada', bind: 'bound', id: '222', rar: 3, slot: 'relic' };
        P.inv = [unboundItem, boundItem];

        bankDepositItem(1); // Bound item CAN be stored in personal bank
        if (P.bank.length !== 1 || P.bank[0].id !== '222') throw new Error('Personal bank deposit item failed');

        guildBankDepositItem(0); // Unbound item into guild bank
        if (GUILD_BANK.items.length !== 1 || GUILD_BANK.items[0].id !== '111') throw new Error('Guild bank deposit item failed');

        // Attempt depositing bound item to guild bank should be blocked
        P.inv = [boundItem];
        guildBankDepositItem(0);
        if (GUILD_BANK.items.length !== 1) throw new Error('Guild bank should reject soulbound items');

        guildBankDepositGold(150);
        if (GUILD_BANK.gold !== 150 || P.gold !== 250) throw new Error('Guild bank gold deposit failed');
      `, sandbox);
      return true;
    }
  },
  {
    name: 'Soulbound Item System (boe, bop, bound, unbound)',
    run: () => {
      vm.runInContext(`
        P = makePlayer('war', 'TestHero');
        P.level = 60;
        recalc();
        const boeItem = genItem(20, 2, 'chest', 'war');
        if (boeItem.bind !== 'boe') throw new Error('Rare gear should have bind = boe');

        P.inv = [boeItem];
        equip(0);
        if (!P.eq.chest || P.eq.chest.bind !== 'bound') throw new Error('Equipping boe gear must bind it to player');

        const epicItem = genItem(45, 4, 'weapon', 'war');
        if (epicItem.bind !== 'bop') throw new Error('Epic gear should be bop (bind on pickup)');
      `, sandbox);
      return true;
    }
  },
  {
    name: 'Expanded Zones & Instances (Caves, Mountains, Dungeons)',
    run: () => {
      vm.runInContext(`
        const requiredZones = ['jungle', 'desert_ruins', 'crystal_woods', 'vortex', 'dungeon_crypt', 'dungeon_frost'];
        for (const zid of requiredZones) {
          if (!Z.some(z => z.id === zid)) throw new Error('Missing zone: ' + zid);
          if (!AREAS[zid]) throw new Error('Missing AREA config for: ' + zid);
          if (!WAYPOINTS.some(w => w.id === zid)) throw new Error('Missing WAYPOINT for: ' + zid);
        }
        const requiredMobs = ['crypt_lord_boss', 'frost_emperor_boss', 'jungle_tiger', 'vortex_horror'];
        for (const mid of requiredMobs) {
          if (!MOBS[mid]) throw new Error('Missing mob definition: ' + mid);
        }
      `, sandbox);
      return true;
    }
  },
  {
    name: 'Missing NPCs & Quest Progression Fix (vane, lyra, arnold, barber, board_rank, q14)',
    run: () => {
      vm.runInContext(`
        P = makePlayer('war', 'TestHero');
        P.level = 60;
        const reqNpcs = ['vane', 'lyra', 'arnold', 'barber', 'board_rank'];
        for (const nid of reqNpcs) {
          if (!NPC_DEF.some(n => n.id === nid)) throw new Error('Missing NPC definition in NPC_DEF: ' + nid);
        }

        // Check quest q14 (visit capital)
        P.quests = {};
        acceptQuest('q14');
        if (!P.quests['q14'] || P.quests['q14'].prog !== 0) throw new Error('q14 should be accepted with prog 0');

        checkVisitQuests('capital');
        if (P.quests['q14'].prog !== 1) throw new Error('checkVisitQuests did not progress q14');
      `, sandbox);
      return true;
    }
  },
  {
    name: 'Titles & Achievements System (25+ achievements and equipable titles)',
    run: () => {
      vm.runInContext(`
        P = makePlayer('war', 'TestHero');
        if (ACHIEVEMENTS.length < 25) throw new Error('Expected at least 25 achievements, found ' + ACHIEVEMENTS.length);
        if (Object.keys(TITLES).length < 10) throw new Error('Expected at least 10 titles');

        P.level = 10;
        P.gold = 5000;
        P.duelsWon = 2;
        checkAchievements();

        if (!P.achievements['lvl5']) throw new Error('lvl5 achievement check failed');
        if (!P.achievements['gold1k']) throw new Error('gold1k achievement check failed');
        if (!P.achievements['pvp1']) throw new Error('pvp1 achievement check failed');

        P.titles.push('explorer');
        setTitle('explorer');
        if (P.title !== 'explorer') throw new Error('setTitle failed');
      `, sandbox);
      return true;
    }
  },
  {
    name: 'Dual Action Bars (Bar 1: 0-11, Bar 2: 12-23)',
    run: () => {
      vm.runInContext(`
        P = makePlayer('war', 'TestHero');
        P.level = 60;
        P.actionBar = [0,1,2,3,4,5,6,7,8,9,10,11];
        P.actionBar2 = [12,13,14,0,1,2,3,4,5,6,7,8];
        buildActionBar();
        if (AB.length < 24) throw new Error('Expected at least 24 action bar slots, got ' + AB.length);
      `, sandbox);
      return true;
    }
  },
  {
    name: 'Guild Rank Promotion, Demotion, and Kick',
    run: () => {
      vm.runInContext(`
        P = makePlayer('war', 'TestHero');
        P.level = 60;
        P.guild = {
          name: 'Orden Celestial',
          level: 1,
          motd: 'Por Astra',
          members: [
            { name: P.name, cls: 'war', lvl: 60, rank: 'Líder' },
            { name: 'Kael', cls: 'mage', lvl: 40, rank: 'Recluta' }
          ]
        };
        promoteGuildMember(1);
        if (P.guild.members[1].rank !== 'Miembro') throw new Error('Expected rank Miembro, got ' + P.guild.members[1].rank);

        promoteGuildMember(1);
        if (P.guild.members[1].rank !== 'Oficial') throw new Error('Expected rank Oficial, got ' + P.guild.members[1].rank);

        demoteGuildMember(1);
        if (P.guild.members[1].rank !== 'Miembro') throw new Error('Expected rank Miembro after demote, got ' + P.guild.members[1].rank);

        kickGuildMember(1);
        if (P.guild.members.length !== 1) throw new Error('Kick failed, expected 1 member remaining');
      `, sandbox);
      return true;
    }
  },
  {
    name: 'Trade System with Soulbound Protection',
    run: () => {
      vm.runInContext(`
        P = makePlayer('war', 'TestHero');
        P.level = 60;
        startTrade({ name: 'BotHero', bot: true });
        const boundIt = { t: 'gear', name: 'Arma Ligada', bind: 'bound', rar: 3, slot: 'weapon' };
        const unboundIt = { t: 'gear', name: 'Arma Libre', bind: 'unbound', rar: 1, slot: 'weapon' };

        tradeAddItem(boundIt);
        if (TRADE_SESSION.myItems.length !== 0) throw new Error('Trade should reject soulbound items');

        tradeAddItem(unboundIt);
        if (TRADE_SESSION.myItems.length !== 1) throw new Error('Trade should accept unbound items');
      `, sandbox);
      return true;
    }
  }
];

let allPassed = true;
for (const t of tests) {
  try {
    t.run();
    console.log('✓ PASS: ' + t.name);
  } catch (err) {
    console.error('✗ FAIL: ' + t.name, err);
    allPassed = false;
  }
}

if (allPassed) {
  console.log('\n========================================');
  console.log('ALL EXPANSION FEATURE TESTS PASSED (100%)');
  console.log('========================================');
  process.exit(0);
} else {
  console.error('\nSOME TESTS FAILED');
  process.exit(1);
}
