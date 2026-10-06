<script>
(function(){'use strict';
/* =====================================================================
   CHRONICLES OF ASTRA · Parte 1: utilidades, datos y generación del mundo
   ===================================================================== */
const TILE=32,W=200,H=150,CHK=16;
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rand=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(rand(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const lerp=(a,b,t)=>a+(b-a)*t;
const uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function hash2(x,y){let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
function vnoise(x,y){
  const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
  const a=hash2(xi,yi),b=hash2(xi+1,yi),c=hash2(xi,yi+1),d=hash2(xi+1,yi+1);
  const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  return lerp(lerp(a,b,u),lerp(c,d,u),v);
}
function fbm(x,y){return vnoise(x,y)*0.6+vnoise(x*2.1+9,y*2.1+4)*0.3+vnoise(x*4.3+3,y*4.3+7)*0.1}

/* ---------- Iconos (trazos de 24x24) ---------- */
const IC={
  sword:'<path d="M14.5 4.5l5-1-1 5-9.5 9.5-3.5-3.5zM6 15l3 3M4.5 19.5l2-2"/>',
  strike:'<path d="M4 20L20 4M8 4l12 12M4 8l8 8"/>',
  charge:'<path d="M3 12h13M12 6l6 6-6 6M20 6v12"/>',
  whirl:'<path d="M12 4a8 8 0 108 8M12 8a4 4 0 104 4M20 4v5h-5"/>',
  shout:'<path d="M4 10v4h3l6 4V6L7 10zM16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/>',
  heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z"/>',
  bolt:'<path d="M13 3L5 14h6l-1 7 9-12h-6z"/>',
  fire:'<path d="M12 3c1 4 5 6 5 11a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z"/>',
  snow:'<path d="M12 3v18M4 7.5l16 9M20 7.5l-16 9M9 4l3 2 3-2M9 20l3-2 3 2"/>',
  blink:'<path d="M3 12h4M10 12h3M16 12h5M18 8l3 4-3 4"/>',
  barrier:'<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
  meteor:'<circle cx="16" cy="8" r="4"/><path d="M13 11L3 21M10 8L4 14M16 14l-6 6"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  plus:'<path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z"/>',
  renew:'<path d="M19 12a7 7 0 11-3-5.7M19 4v4h-4"/><path d="M12 9v6M9 12h6"/>',
  skull:'<path d="M12 3c5 0 8 4 8 8 0 3-2 5-4 6v3H8v-3c-2-1-4-3-4-6 0-4 3-8 8-8z"/><path d="M9 12h.01M15 12h.01M11 16h2"/>',
  nova:'<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/>',
  staff:'<path d="M5 21L16 10"/><circle cx="18" cy="8" r="3"/>',
  helm:'<path d="M5 16v-4a7 7 0 0114 0v4zM5 16h14M9 16v3M15 16v3"/>',
  chest:'<path d="M8 4L3 8l3 3 2-1v10h8V10l2 1 3-3-5-4-2 2h-4z"/>',
  boots:'<path d="M8 3h6v9l5 3v4H6v-4l2-1z"/>',
  potion:'<path d="M10 3h4M11 3v5l-5 9a3 3 0 003 4h6a3 3 0 003-4l-5-9V3"/><path d="M8.5 15h7"/>',
  tusk:'<path d="M6 4c8 0 12 6 12 16-5-2-9-6-12-16z"/>',
  silk:'<path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18"/>',
  pelt:'<path d="M4 8l4-4 4 2 4-2 4 4-2 6-3 6H9l-3-6z"/>',
  shard:'<path d="M12 3l6 9-6 9-6-9z"/>',
  horse:'<path d="M5 20v-6l3-2 1-5 4-3 3 3-1 3 3 3v7M9 12h4"/>',
  bag:'<path d="M6 8h12l1 12H5zM9 8a3 3 0 016 0"/>',
  herb:'<path d="M12 21V9M12 13c-4 0-6-3-6-7 4 0 6 3 6 7zM12 16c4 0 6-3 6-7-4 0-6 3-6 7z"/>',
  ore:'<path d="M4 15l4-8 6-2 6 6-3 8H8z"/><path d="M9 10l3 3 3-4"/>',
  box:'<path d="M4 10h16v10H4zM4 10l2-5h12l2 5M12 10v4"/>',
  map:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>',
  wing:'<path d="M3 8c5-4 9-4 9 0 0-4 4-4 9 0-2 1-3 2-3 5-2-2-4-2-6 0-2-2-4-2-6 0 0-3-1-4-3-5z"/>',
  run:'<circle cx="14" cy="5" r="2"/><path d="M6 20l4-6 3 2 2-6-4-2-3 3M13 16l2 4"/>',
  crown:'<path d="M4 18l-1-10 5 4 4-7 4 7 5-4-1 10z"/>'
};
function svg(name,color,sw){return '<svg viewBox="0 0 24 24" fill="none" stroke="'+(color||'currentColor')+'" stroke-width="'+(sw||1.8)+'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(IC[name]||'')+'</svg>'}

/* ---------- Objetos ---------- */
const RAR=[{n:'Común',c:'#d8d2c0'},{n:'Poco común',c:'#4fd04f'},{n:'Raro',c:'#4aa0ff'},{n:'Épico',c:'#b868ff'}];
const SLOTS=['weapon','head','chest','boots'];
const SLOT_NAME={weapon:'Arma',head:'Casco',chest:'Pechera',boots:'Botas'};
const SLOT_IC={weapon:'sword',head:'helm',chest:'chest',boots:'boots'};
const BASES={
  head:['Yelmo','Capucha','Casco','Capelo','Corona'],
  chest:['Coraza','Túnica','Jubón','Peto','Manto'],
  boots:['Botas','Grebas','Zapatos','Botines'],
  weapon:{war:['Espada','Hacha','Maza','Mandoble'],mage:['Bastón','Varita','Cetro'],priest:['Maza sagrada','Bastón','Cetro'],paladin:['Martillo','Maza sagrada','Martillo de guerra'],rogue:['Daga','Puñal','Estilete'],hunter:['Arco','Arco largo','Arco de caza'],necro:['Bastón negro','Cetro óseo','Vara'],druid:['Bastón de roble','Vara viva','Cayado']}
};
const SUFFIX=[
  ['de Recluta','de Entrenamiento','de Viajero','de Aldeano'],
  ['de Acero','del Vigía','de la Guardia','del Cazador'],
  ['de la Aurora','de Tormenta','del Roble Antiguo','de Cenizas'],
  ['del Rey Caído','de la Eternidad','del Alba Eterna']
];
const ITEMS={
  hp1:{t:'cons',name:'Poción de vida menor',ic:'potion',col:'#e0554a',heal:70,price:6,desc:'Restaura 70 de vida.'},
  hp2:{t:'cons',name:'Poción de vida',ic:'potion',col:'#e0554a',heal:180,price:22,desc:'Restaura 180 de vida.'},
  hp3:{t:'cons',name:'Poción de vida mayor',ic:'potion',col:'#e0554a',heal:380,price:60,desc:'Restaura 380 de vida.'},
  hp4:{t:'cons',name:'Poción de vida superior',ic:'potion',col:'#e0554a',heal:720,price:140,desc:'Restaura 720 de vida.'},
  mp1:{t:'cons',name:'Poción de maná menor',ic:'potion',col:'#4a8fe0',mana:60,price:6,desc:'Restaura 60 de maná o 30 de ira.'},
  mp2:{t:'cons',name:'Poción de maná',ic:'potion',col:'#4a8fe0',mana:140,price:22,desc:'Restaura 140 de maná o 50 de ira.'},
  mp3:{t:'cons',name:'Poción de maná mayor',ic:'potion',col:'#4a8fe0',mana:280,price:60,desc:'Restaura 280 de maná o 80 de ira.'},
  mp4:{t:'cons',name:'Poción de maná superior',ic:'potion',col:'#4a8fe0',mana:480,price:140,desc:'Restaura 480 de maná o 100 de ira.'},
  herb:{t:'cons',use:'herb',name:'Hierba curativa',ic:'herb',col:'#6fcf6f',heal:150,price:8,desc:'Restaura 150 de vida. Recarga propia de 10 s.'},
  tusk:{t:'misc',name:'Colmillo de jabalí',ic:'tusk',col:'#e8dcc0',price:2,quest:true,desc:'Objeto de misión.'},
  sting:{t:'misc',name:'Aguijón de escorpión',ic:'tusk',col:'#c9884a',price:5,quest:true,desc:'Objeto de misión.'},
  pelt:{t:'misc',name:'Piel de lobo',ic:'pelt',col:'#9aa0a8',price:3,desc:'Basura. Se puede vender.'},
  silk:{t:'misc',name:'Seda de araña',ic:'silk',col:'#dfe6f0',price:4,desc:'Basura. Se puede vender.'},
  shard:{t:'misc',name:'Esquirla de hueso',ic:'shard',col:'#d8d0b8',price:6,desc:'Basura. Se puede vender.'},
  wingb:{t:'misc',name:'Ala de murciélago',ic:'wing',col:'#8a7a9a',price:7,desc:'Basura. Se puede vender.'},
  hide:{t:'misc',name:'Cuero escamoso',ic:'pelt',col:'#5d8f55',price:10,desc:'Basura. Se puede vender.'},
  toadleg:{t:'misc',name:'Pata de sapo',ic:'tusk',col:'#7fae5a',price:9,desc:'Basura. Se puede vender.'},
  wrap:{t:'misc',name:'Vendaje antiguo',ic:'silk',col:'#d8c9a0',price:12,desc:'Basura. Se puede vender.'},
  fur:{t:'misc',name:'Piel nívea',ic:'pelt',col:'#e6eef7',price:16,desc:'Basura. Se puede vender.'},
  frost:{t:'misc',name:'Corazón helado',ic:'shard',col:'#8fd6ff',price:24,desc:'Basura. Se puede vender.'},
  ore:{t:'misc',name:'Mineral de hierro',ic:'ore',col:'#9aa6b8',price:14,desc:'Se puede vender.'}
};
function genItem(ilvl,rar,slot,cls){
  slot=slot||pick(SLOTS);
  const base=slot==='weapon'?pick(BASES.weapon[cls]||BASES.weapon.war):pick(BASES[slot]);
  const bud=ilvl*(1+rar*0.45)+2;
  const it={t:'gear',id:uid(),name:base+' '+pick(SUFFIX[rar]),slot:slot,rar:rar,lvl:Math.max(1,ilvl),atk:0,armor:0,hp:0,crit:0};
  if(slot==='weapon'){it.atk=Math.round(bud*1.15+2)}
  else{
    it.armor=Math.round(bud*(slot==='chest'?2.6:slot==='head'?2:1.5)+1);
    it.hp=Math.round(bud*rar*1.6);
    if(rar>=1)it.atk=Math.round(bud*0.18*rar);
  }
  if(rar>=2)it.crit=+(rar*0.8+Math.random()).toFixed(1);
  it.price=Math.round((it.atk*3+it.armor*1.5+it.hp*0.8+it.crit*10)*0.8+4);
  return it;
}
function namedGear(ilvl,rar,slot,cls,name,boost){
  const it=genItem(ilvl,rar,slot,cls);it.name=name;
  if(boost){it.atk=Math.round(it.atk*boost);it.armor=Math.round(it.armor*boost);it.hp=Math.round(it.hp*boost)}
  it.price=Math.round(it.price*1.4);return it;
}
function bossLoot(kind,cls){
  if(kind==='boss'){
    const wn={war:'Hoja Parte-Rocas',mage:'Bastón de la Brasa Eterna',priest:'Cetro del Amanecer',paladin:'Martillo de la Llama Primera',rogue:'Colmillo de Sombra',hunter:'Arco del Cazador de Estrellas',necro:'Vara de Huesos Cantores',druid:'Cayado de la Raíz Antigua'}[cls]||'Reliquia de Gorrak';
    return [namedGear(11,3,'weapon',cls,wn,1.1),namedGear(11,3,'chest',cls,'Coraza de Gorrak',1.1)];
  }
  const wn={war:'Filo de la Tormenta Blanca',mage:'Cetro de la Reina Escarcha',priest:'Vara del Invierno Eterno',paladin:'Martillo del Amanecer Gélido',rogue:'Daga del Último Aliento',hunter:'Arco del Viento Blanco',necro:'Cetro del Silencio',druid:'Cayado del Deshielo'}[cls]||'Reliquia de Escarcha';
  return [namedGear(21,3,'weapon',cls,wn,1.12),namedGear(21,3,'head',cls,'Corona de Escarcha',1.1),namedGear(21,3,'boots',cls,'Botas del Viento Glacial',1.1)];
}

/* ---------- Enemigos ---------- */
const MOBS={
  wolf:{name:'Lobo Gris',lv:[1,3],speed:88,aggro:150,size:12,hpM:1,dmgM:1,atkCd:1.8,kind:'quad',look:{body:'#8e939b',dark:'#5f646c',eye:'#ff3a2a',snout:1,ears:1},junk:'pelt'},
  boar:{name:'Jabalí Salvaje',lv:[2,4],speed:80,aggro:0,passive:true,size:13,hpM:1.15,dmgM:1,atkCd:2,kind:'quad',look:{body:'#7a5a3a',dark:'#4a3520',tusk:1,boar:1},drops:{tusk:0.6}},
  alpha:{name:'Colmillo, el Alfa',lv:[4,4],speed:98,aggro:210,size:17,hpM:3.2,dmgM:1.5,atkCd:1.6,kind:'quad',look:{body:'#dfe3ec',dark:'#8d93a6',eye:'#ffcf3a',snout:1,ears:1},elite:true,rare:true,junk:'pelt'},
  spider:{name:'Araña Tejebosque',lv:[4,6],speed:84,aggro:140,size:12,hpM:1,dmgM:1,atkCd:1.8,kind:'arach',look:{body:'#3d2f4a',dark:'#2a2034',eye:'#ff3a3a'},junk:'silk'},
  bandit:{name:'Bandido del Camino',lv:[5,7],speed:90,aggro:170,size:14,hpM:1.1,dmgM:1.05,atkCd:2,kind:'human',look:{body:'#8a3b2f',trim:'#c9a03a',legs:'#3a2f26',hat:'#3b2b22',hatType:'bandana',weapon:'sword',skin:'#d9b08c',hair:'#2a1c12',hairStyle:1}},
  archer:{name:'Arquero Bandido',lv:[5,7],speed:84,aggro:215,size:14,hpM:0.8,dmgM:0.85,atkCd:2.4,kind:'human',ranged:true,range:210,look:{body:'#5d6b2f',trim:'#8a8a3a',legs:'#3a3a22',hat:'#2f3a1a',hatType:'hood',weapon:'bow',skin:'#d9b08c',hair:'#4a3020',hairStyle:2}},
  bear:{name:'Oso Pardo',lv:[5,7],speed:76,aggro:130,size:18,hpM:1.5,dmgM:1.3,atkCd:2.2,kind:'quad',look:{body:'#6b4a2e',dark:'#43301e',eye:'#ffcc66',bear:1,ears:1},junk:'pelt'},
  chief:{name:'Capitán Cuervo',lv:[7,7],speed:92,aggro:200,size:15,hpM:3,dmgM:1.5,atkCd:1.9,kind:'human',scale:1.15,look:{body:'#3a2030',trim:'#d9a21a',legs:'#241820',hat:'#1c1018',hatType:'horns',weapon:'sword',blade:'#c8d0e0',skin:'#c9a07a',hair:'#111',hairStyle:1,pads:'#6a3a50',cape:'#5a1a2a'},elite:true,rare:true},
  goblin:{name:'Goblin Saqueador',lv:[7,9],speed:100,aggro:170,size:11,hpM:0.9,dmgM:1,atkCd:1.6,kind:'human',scale:0.8,look:{body:'#6b5a2a',trim:'#a08a3a',legs:'#44381e',hat:'#5a4a1a',hatType:'bandana',weapon:'dagger',skin:'#79a04e',hair:null,hairStyle:3,eye:'#a00',ears:1}},
  ogre:{name:'Ogro de las Colinas',lv:[7,9],speed:70,aggro:140,size:22,hpM:1.7,dmgM:1.4,atkCd:2.4,kind:'human',scale:1.75,look:{body:'#6a4a2a',trim:'#8a6a3a',legs:'#4a3520',weapon:'club',skin:'#79a04e',hair:null,hairStyle:3,eye:'#a00',belly:1}},
  grukk:{name:'Grukk el Triturador',lv:[9,9],speed:78,aggro:190,size:26,hpM:3.4,dmgM:1.7,atkCd:2.2,kind:'human',scale:2.1,look:{body:'#5a2f2a',trim:'#c9a03a',legs:'#3a2420',weapon:'club',skin:'#8aa058',hair:null,hairStyle:3,eye:'#ffcc00',belly:1,hat:'#4a4a4a',hatType:'horns'},elite:true,rare:true},
  skel:{name:'Esqueleto Guardián',lv:[8,10],speed:86,aggro:170,size:14,hpM:1.1,dmgM:1.1,atkCd:2,kind:'human',look:{body:'#cfc8b0',trim:'#9a8f78',legs:'#b9b29a',weapon:'sword',blade:'#9a8f78',skin:'#ece7d4',hair:null,hairStyle:3,eye:'#d33',skel:1},junk:'shard'},
  bat:{name:'Murciélago de Cueva',lv:[8,10],speed:120,aggro:190,size:9,hpM:0.7,dmgM:0.8,atkCd:1.4,kind:'bat',look:{body:'#4a3a58',dark:'#2c2236',eye:'#ff4a4a'},junk:'wingb'},
  boss:{name:'Gorrak, Guardián de la Cueva',lv:[11,11],speed:78,aggro:230,size:30,hpM:12,dmgM:2.2,atkCd:2.2,kind:'human',scale:2.4,look:{body:'#2c2430',trim:'#6a4a8a',legs:'#1c1720',weapon:'sword',blade:'#8a98a8',skin:'#8a6a5a',hat:'#3a3040',hatType:'horns',eye:'#f33',pads:'#4a3a58',cape:'#3a1a3a'},elite:true,boss:true},
  toad:{name:'Sapo del Cieno',lv:[10,12],speed:84,aggro:130,size:13,hpM:1.1,dmgM:1,atkCd:1.9,kind:'toad',look:{body:'#5f8f3a',dark:'#3a5f22',belly:'#b8c870',eye:'#ffd23a'},junk:'toadleg'},
  croc:{name:'Cocodrilo del Pantano',lv:[11,13],speed:78,aggro:150,size:18,hpM:1.5,dmgM:1.35,atkCd:2.2,kind:'croc',look:{body:'#46703a',dark:'#2b4a26',eye:'#ffe040'},junk:'hide'},
  witch:{name:'Bruja del Pantano',lv:[12,14],speed:80,aggro:220,size:13,hpM:0.85,dmgM:1.0,atkCd:2.6,kind:'human',ranged:true,range:230,bolt:'#9bff5a',look:{body:'#3b2a5a',trim:'#9bff5a',legs:'#241a3a',hat:'#2a1c48',hatType:'pointy',weapon:'staff',orb:'#9bff5a',skin:'#9bb88a',hair:'#d8d8c8',hairStyle:2}},
  bogking:{name:'Rey Cieno',lv:[13,13],speed:86,aggro:200,size:24,hpM:3.6,dmgM:1.7,atkCd:2.1,kind:'toad',scale:1.7,look:{body:'#7a6a2a',dark:'#4a3f18',belly:'#d8c870',eye:'#ff4a2a',crown:1},elite:true,rare:true,junk:'toadleg'},
  scorpion:{name:'Escorpión Gigante',lv:[13,15],speed:90,aggro:150,size:15,hpM:1.2,dmgM:1.15,atkCd:1.9,kind:'arach',look:{body:'#b0602a',dark:'#7a3d18',eye:'#222',scorp:1},drops:{sting:0.6}},
  raider:{name:'Saqueador de Dunas',lv:[14,16],speed:96,aggro:180,size:14,hpM:1.2,dmgM:1.25,atkCd:1.9,kind:'human',look:{body:'#c96a2a',trim:'#f0d070',legs:'#6a3a1a',hat:'#e8dcc0',hatType:'turban',weapon:'sword',blade:'#d8dce4',skin:'#c9966a',hair:'#111',hairStyle:3,shield:1}},
  mummy:{name:'Momia Ardiente',lv:[15,17],speed:66,aggro:150,size:15,hpM:1.8,dmgM:1.4,atkCd:2.4,kind:'human',look:{body:'#d8c9a0',trim:'#b8a070',legs:'#cbbd92',weapon:null,skin:'#cbbd92',hair:null,hairStyle:3,eye:'#ff7a1a',wrapped:1},junk:'wrap'},
  scorpk:{name:'Reina Aguijón',lv:[16,16],speed:98,aggro:210,size:24,hpM:3.6,dmgM:1.8,atkCd:1.9,kind:'arach',scale:1.6,look:{body:'#7a1f1a',dark:'#4a100e',eye:'#ffcc00',scorp:1},elite:true,rare:true,drops:{sting:0.5}},
  icewolf:{name:'Lobo Níveo',lv:[16,18],speed:104,aggro:190,size:13,hpM:1.2,dmgM:1.3,atkCd:1.7,kind:'quad',look:{body:'#dfeaf5',dark:'#9db6cc',eye:'#4ad0ff',snout:1,ears:1},junk:'fur'},
  yeti:{name:'Yeti de las Cumbres',lv:[17,19],speed:76,aggro:150,size:22,hpM:2,dmgM:1.6,atkCd:2.3,kind:'human',scale:1.8,look:{body:'#e8f0f8',trim:'#bcd0e0',legs:'#d0dde8',weapon:'club',skin:'#cfe0ee',hair:'#f4f9ff',hairStyle:2,eye:'#3ab0ff',fur:1},junk:'fur'},
  golem:{name:'Gólem de Escarcha',lv:[18,20],speed:62,aggro:140,size:24,hpM:2.6,dmgM:1.8,atkCd:2.8,kind:'golem',look:{body:'#8fc4e0',dark:'#4f86ac',eye:'#c8f4ff'},junk:'frost'},
  yetik:{name:'Brutus, Rey de las Nieves',lv:[19,19],speed:88,aggro:210,size:28,hpM:4,dmgM:1.9,atkCd:2.1,kind:'human',scale:2.2,look:{body:'#cde0f0',trim:'#8fb0d0',legs:'#b0c8dc',weapon:'club',skin:'#b0d0e8',hair:'#ffffff',hairStyle:2,eye:'#ff5a3a',fur:1},elite:true,rare:true,junk:'fur'},
  fskel:{name:'Guardián Helado',lv:[19,20],speed:88,aggro:180,size:14,hpM:1.3,dmgM:1.4,atkCd:2,kind:'human',look:{body:'#9ac8e8',trim:'#d8f2ff',legs:'#7fb0d0',weapon:'sword',blade:'#bfe8ff',skin:'#d8f2ff',hair:null,hairStyle:3,eye:'#3ae0ff',skel:1},junk:'frost'},
  queen:{name:'Reina Escarcha',lv:[20,20],speed:80,aggro:240,size:28,hpM:14,dmgM:2.4,atkCd:2.2,kind:'human',scale:2.3,ranged:false,look:{body:'#5a8fc8',trim:'#d8f2ff',legs:'#3a5f98',weapon:'staff',orb:'#9fe8ff',skin:'#cfe8f8',hair:'#f4fbff',hairStyle:2,hat:'#bfe8ff',hatType:'crown',eye:'#3ae0ff',cape:'#2f5a9a',pads:'#bfe8ff'},elite:true,boss:true},
  abyss_stalker:{name:'Acechador Abisal',lv:[12,14],speed:92,aggro:180,size:14,hpM:1.3,dmgM:1.2,atkCd:1.8,kind:'arach',look:{body:'#241830',dark:'#120a18',eye:'#a030ff'},junk:'shard'},
  abyss_gargoyle:{name:'Gárgola Pétrea',lv:[13,15],speed:85,aggro:190,size:17,hpM:1.6,dmgM:1.4,atkCd:2.0,kind:'quad',look:{body:'#55505c',dark:'#322e38',eye:'#ff5040'},junk:'ore'},
  abyss_boss:{name:'Malok, Tirano del Abismo',lv:[15,15],speed:82,aggro:240,size:32,hpM:13,dmgM:2.3,atkCd:2.1,kind:'human',scale:2.5,look:{body:'#1f152b',trim:'#a040ff',legs:'#120c1c',weapon:'sword',blade:'#c080ff',skin:'#705088',hat:'#2a183d',hatType:'horns',eye:'#c030ff',pads:'#603099',cape:'#3a1050'},elite:true,boss:true},
  mountain_drake:{name:'Draco de las Cumbres',lv:[16,18],speed:102,aggro:210,size:22,hpM:2.2,dmgM:1.6,atkCd:1.9,kind:'quad',look:{body:'#304a60',dark:'#1a2d3c',eye:'#ffaa20',ears:1},elite:true,junk:'shard'}
};

/* ---------- Misiones ---------- */
const QUESTS={
  q1:{title:'Lobos en los Prados',giver:'elara',lvl:1,pre:null,
    text:'Los lobos grises se acercan demasiado a la aldea y los granjeros ya no se atreven a salir. Abate a seis de ellos en los Prados de Alba, fuera de las murallas de la plaza.',
    done:'Buen trabajo. Los caminos vuelven a ser seguros. Toma esto, te será útil.',
    obj:{kill:['wolf'],n:6,label:'Lobos grises abatidos'},xp:110,gold:12,item:{slot:'weapon',rar:1,lvl:2}},
  q2:{title:'Colmillos de jabalí',giver:'elara',lvl:2,pre:'q1',
    text:'Doran necesita colmillos de jabalí para fabricar herramientas. Los jabalíes no atacan si no los molestas, pero tampoco te los entregarán por las buenas. Consigue cinco.',
    done:'Excelentes piezas. Doran estará encantado. Acepta esta pechera de la guardia.',
    obj:{collect:'tusk',from:['boar'],chance:0.6,n:5,label:'Colmillos de jabalí'},xp:190,gold:20,item:{slot:'chest',rar:1,lvl:3}},
  q3:{title:'Telarañas del Bosque Umbrío',giver:'teo',lvl:4,pre:null,
    text:'Siguiendo el camino al este, el bosque se oscurece y las arañas han tejido sobre los senderos. Mis cazadores no pasan. Elimina ocho arañas tejebosque.',
    done:'El camino respira otra vez. Te has ganado un buen par de botas.',
    obj:{kill:['spider'],n:8,label:'Arañas tejebosque abatidas'},xp:330,gold:34,item:{slot:'boots',rar:1,lvl:5}},
  q4:{title:'La banda del camino',giver:'teo',lvl:5,pre:'q3',
    text:'Una banda de bandidos asalta a las caravanas en el Bosque Umbrío. Hay espadachines y arqueros, y se cubren unos a otros. Acaba con ocho de ellos.',
    done:'Las caravanas pasarán de nuevo. Esto es de mi propio equipo, llévalo con orgullo.',
    obj:{kill:['bandit','archer'],n:8,label:'Bandidos abatidos'},xp:520,gold:50,item:{slot:'head',rar:2,lvl:7}},
  q5:{title:'Ogros en las colinas',giver:'valen',lvl:7,pre:null,
    text:'Más allá del bosque, al norte, las Colinas Rotas tiemblan bajo el paso de los ogros. Algo los empuja hacia abajo, hacia nuestras tierras. Derriba a seis ogros de las colinas.',
    done:'Entonces es cierto: algo los espanta desde la cueva. Toma esta recompensa, la vas a necesitar.',
    obj:{kill:['ogre'],n:6,label:'Ogros de las colinas abatidos'},xp:820,gold:80,item:{slot:'boots',rar:2,lvl:9}},
  q6:{title:'El Guardián de la Cueva',giver:'valen',lvl:8,pre:'q5',
    text:'Gorrak, un antiguo guardián, despertó en la cueva del noreste y arrastra a los muertos tras de sí. Hay que detenerlo antes de que baje a Villa Alba. Entra en su cueva y acaba con él.',
    done:'Villa Alba te debe su existencia. Más al sur, en el Pantano, Nyx pidió ayuda. Quizá puedas ir a verla.',
    obj:{kill:['boss'],n:1,label:'Gorrak, Guardián de la Cueva'},xp:1800,gold:200,item:{slot:'head',rar:3,lvl:11}},
  q7:{title:'Plaga de sapos',giver:'nyx',lvl:10,pre:null,
    text:'Los sapos del Cieno crecen más cada luna y se comen las barcas de la aldea. Acaba con ocho antes de que inunden el camino.',
    done:'Las barcas respiran. Toma, es lo menos que puedo ofrecerte.',
    obj:{kill:['toad'],n:8,label:'Sapos del Cieno abatidos'},xp:1500,gold:110,item:{slot:'weapon',rar:2,lvl:11}},
  q8:{title:'Rituales prohibidos',giver:'nyx',lvl:11,pre:'q7',
    text:'Hay brujas en lo profundo del Pantano que realizan rituales con los muertos. Sus hechizos arden verdes. Acaba con seis de ellas.',
    done:'La magia vuelve a ser limpia. Llévate esta capucha, me la dio mi maestra.',
    obj:{kill:['witch'],n:6,label:'Brujas del Pantano abatidas'},xp:1900,gold:140,item:{slot:'head',rar:2,lvl:13}},
  q9:{title:'Aguijones para el curtidor',giver:'zahir',lvl:13,pre:null,
    text:'Los escorpiones de las dunas tienen un veneno valioso para nuestros curanderos. Tráeme seis aguijones, yo no me atrevo a acercarme a ellos.',
    done:'Un veneno magnífico. Quédate con esta pechera, es de lo mejor que tengo.',
    obj:{collect:'sting',from:['scorpion'],chance:0.6,n:6,label:'Aguijones de escorpión'},xp:2400,gold:170,item:{slot:'chest',rar:2,lvl:15}},
  q10:{title:'Saqueadores de las Dunas',giver:'zahir',lvl:14,pre:'q9',
    text:'Una partida de saqueadores acecha las caravanas del Oasis. Ya no podemos comerciar. Elimina a ocho de ellos o a las momias que los acompañan.',
    done:'Las caravanas volverán. Gracias, viajero. Estas botas te llevarán lejos.',
    obj:{kill:['raider','mummy'],n:8,label:'Saqueadores y momias abatidos'},xp:2900,gold:210,item:{slot:'boots',rar:2,lvl:17}},
  q11:{title:'Aullidos en la nieve',giver:'bruna',lvl:16,pre:null,
    text:'Los lobos níveos cazan en manada y ya han acabado con dos patrullas. Reduce su número abatiendo a ocho de ellos.',
    done:'Esas manadas ya no son una amenaza. Aquí tienes tu parte.',
    obj:{kill:['icewolf'],n:8,label:'Lobos níveos abatidos'},xp:3400,gold:260,item:{slot:'weapon',rar:2,lvl:18}},
  q12:{title:'Pisadas gigantes',giver:'bruna',lvl:17,pre:'q11',
    text:'Los yetis han bajado de las cumbres. Dejan huellas del tamaño de un escudo. Derriba a cinco de ellos.',
    done:'Entonces la Reina los está empujando. Prepárate: queda la última prueba.',
    obj:{kill:['yeti'],n:5,label:'Yetis abatidos'},xp:4000,gold:300,item:{slot:'chest',rar:3,lvl:19}},
  q13:{title:'La Reina Escarcha',giver:'bruna',lvl:19,pre:'q12',
    text:'En el Palacio de Escarcha, al noreste, reina un invierno sin fin. Su señora congela todo lo que se acerca. Entra al palacio y acaba con la Reina Escarcha.',
    done:'El invierno retrocede. Astra te recordará, héroe.',
    obj:{kill:['queen'],n:1,label:'Reina Escarcha'},xp:7000,gold:700,item:{slot:'head',rar:3,lvl:21}}
};

/* ---------- Mundo ---------- */
const T={GRASS:0,FOREST:1,PATH:2,COBBLE:3,WATER:4,SAND:5,CAVE:6,HILL:7,WALL:8,SWAMP:9,DUNE:10,SNOW:11,ICE:12,BRIDGE:13,BOG:14};
const D={OAK:1,PINE:2,ROCK:3,DEAD:4,CACTUS:5,SNOWPINE:6,CRYSTAL:7,BOULDER:8,PALM:9,FLOWER:20,TUFT:21,STONES:22,MUSH:23,REEDS:24,BONES:25,SNOWMOUND:26,LILY:27,SWAMPGRASS:28,SHRUB:29,FERN:30};
const Z=[
  {id:'meadow',name:'Prados de Alba',lv:'Niveles 1 – 4',tile:T.GRASS},
  {id:'forest',name:'Bosque Umbrío',lv:'Niveles 4 – 7',tile:T.FOREST},
  {id:'hills',name:'Colinas Rotas',lv:'Niveles 7 – 10',tile:T.HILL},
  {id:'cave',name:'Cueva de Gorrak',lv:'Niveles 8 – 11'},
  {id:'swamp',name:'Pantano Sombrío',lv:'Niveles 10 – 14',tile:T.SWAMP},
  {id:'desert',name:'Dunas Ardientes',lv:'Niveles 13 – 17',tile:T.DUNE},
  {id:'snow',name:'Cumbres Heladas',lv:'Niveles 16 – 20',tile:T.SNOW},
  {id:'town',name:'Villa Alba',lv:'Zona segura',safe:true},
  {id:'bastion',name:'Bastión de Piedra',lv:'Zona segura',safe:true},
  {id:'cieno',name:'Aldea Cieno',lv:'Zona segura',safe:true},
  {id:'oasis',name:'Oasis Sol',lv:'Zona segura',safe:true},
  {id:'cumbre',name:'Campamento Cumbre',lv:'Zona segura',safe:true},
  {id:'abyss',name:'Cavernas del Abismo',lv:'Niveles 12 – 15'},
  {id:'palace',name:'Palacio de Escarcha',lv:'Niveles 19 – 20'}
];
const ZI={};Z.forEach((z,i)=>{ZI[z.id]=i});
const AREAS={
  town:{x:28,y:62,w:30,h:26},bastion:{x:78,y:18,w:22,h:18},cieno:{x:27,y:125,w:18,h:14},oasis:{x:151,y:119,w:18,h:14},cumbre:{x:147,y:34,w:18,h:14},
  cave:{x:106,y:4,w:24,h:22},abyss:{x:54,y:8,w:22,h:20},palace:{x:172,y:4,w:24,h:22}
};
const WAYPOINTS=[
  {id:'town',name:'Villa Alba',tx:40,ty:76,gx:40,gy:78},
  {id:'bastion',name:'Bastión de Piedra',tx:88,ty:26,gx:88,gy:28},
  {id:'cieno',name:'Aldea Cieno',tx:36,ty:131,gx:36,gy:133},
  {id:'oasis',name:'Oasis Sol',tx:160,ty:123,gx:160,gy:125},
  {id:'cumbre',name:'Campamento Cumbre',tx:156,ty:40,gx:156,gy:42}
];
const BOSS1={x:122*TILE+16,y:15*TILE+16},BOSS2={x:190*TILE+16,y:15*TILE+16},BOSS3={x:65*TILE+16,y:18*TILE+16};
const SPAWN_P={x:43*TILE+16,y:77*TILE+16};
const tiles=new Uint8Array(W*H),block=new Uint8Array(W*H),deco=new Uint8Array(W*H),shade=new Uint8Array(W*H),zmap=new Uint8Array(W*H);
const shore=new Uint8Array(W*H),wdepth=new Uint8Array(W*H),pathNear=new Uint8Array(W*H),keep=new Uint8Array(W*H);
const BUILD=[],PROPS=[],LAMPS=[],NODES=[],ZCENTER={};
const idx=(x,y)=>y*W+x;
const inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
const inRect=(r,x,y)=>x>=r.x&&y>=r.y&&x<r.x+r.w&&y<r.y+r.h;

function biomeBase(x,y){
  const wx=x+(fbm(x*0.045,y*0.045)-0.5)*16,wy=y+(fbm(x*0.045+40,y*0.045+40)-0.5)*16;
  if(wx>=138&&wy<84)return ZI.snow;
  if(wy>=98&&wx>=92)return ZI.desert;
  if(wy>=114&&wx<92)return ZI.swamp;
  if(wy<46)return ZI.hills;
  if(wx>=88)return ZI.forest;
  return ZI.meadow;
}
function lake(cx,cy,rx,ry,inner,rim){
  for(let y=Math.floor(cy-ry-3);y<=cy+ry+3;y++)for(let x=Math.floor(cx-rx-3);x<=cx+rx+3;x++){
    if(!inb(x,y))continue;
    const d=Math.pow((x-cx)/rx,2)+Math.pow((y-cy)/ry,2)+(fbm(x*0.22,y*0.22)-0.5)*0.55;
    const i=idx(x,y);
    if(d<1)tiles[i]=inner;
    else if(d<1.5&&tiles[i]!==inner&&rim!==null&&tiles[i]!==T.WATER&&tiles[i]!==T.ICE)tiles[i]=rim;
  }
}
function brushLine(pts,r,fn,wob){
  for(let s=0;s<pts.length-1;s++){
    const a=pts[s],b=pts[s+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(len*2));
    const px=-(b[1]-a[1])/len,py=(b[0]-a[0])/len;
    for(let k=0;k<=n;k++){
      const t=k/n;let x=lerp(a[0],b[0],t),y=lerp(a[1],b[1],t);
      const w=(fbm(x*0.12,y*0.12)-0.5)*(wob||3)*Math.sin(t*Math.PI);
      x+=px*w;y+=py*w;
      const cx=Math.round(x),cy=Math.round(y),R=Math.ceil(r);
      for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++){
        if(dx*dx+dy*dy>r*r)continue;
        const xx=cx+dx,yy=cy+dy;if(inb(xx,yy))fn(idx(xx,yy),xx,yy);
      }
    }
  }
}
function river(pts,r){
  const cells=[];
  brushLine(pts,r,(i)=>{tiles[i]=T.WATER;cells.push(i)},4);
  for(const i of cells){
    const x=i%W,y=(i/W)|0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      const xx=x+dx,yy=y+dy;if(!inb(xx,yy))continue;
      const j=idx(xx,yy);
      if(tiles[j]!==T.WATER&&tiles[j]!==T.ICE)tiles[j]=T.SAND;
    }
  }
}
function carve(pts,r){
  brushLine(pts,r||1.4,(i)=>{
    const t=tiles[i];
    if(t===T.WATER||t===T.BOG||t===T.ICE)tiles[i]=T.BRIDGE;
    else if(t!==T.COBBLE&&t!==T.WALL&&t!==T.CAVE&&t!==T.BRIDGE)tiles[i]=T.PATH;
  },3);
}
function dungeon(r,floor,z,cy){
  for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){
    const e=Math.min(x-r.x,r.x+r.w-1-x,y-r.y,r.y+r.h-1-y);
    const thick=2+(hash2(x,y)>0.62?1:0);
    const i=idx(x,y);
    tiles[i]=e<thick?T.WALL:floor;zmap[i]=z;
  }
  for(let x=r.x-4;x<=r.x+3;x++)for(let y=cy-1;y<=cy+1;y++){
    const i=idx(x,y);
    if(x<r.x){tiles[i]=T.PATH}else{tiles[i]=floor;zmap[i]=z}
  }
}
function addBuilding(b){
  BUILD.push(b);
  for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++){block[idx(x,y)]=1;deco[idx(x,y)]=0}
  for(let y=b.y-1;y<b.y+b.h+2;y++)for(let x=b.x-1;x<b.x+b.w+1;x++)if(inb(x,y))keep[idx(x,y)]=1;
}
function addProp(type,tx,ty,blocks,extra){
  const p=Object.assign({t:type,tx:tx,ty:ty,x:tx*TILE+16,y:ty*TILE+16},extra||{});
  PROPS.push(p);
  if(blocks!==false){block[idx(tx,ty)]=1;deco[idx(tx,ty)]=0}
  for(let y=ty-1;y<=ty+1;y++)for(let x=tx-1;x<=tx+1;x++)if(inb(x,y))keep[idx(x,y)]=1;
  return p;
}
function fillTiles(x0,y0,x1,y1,t){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(inb(x,y))tiles[idx(x,y)]=t}
function ellipseTiles(cx,cy,rx,ry,t){
  for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){
    if(!inb(x,y))continue;
    if(Math.pow((x-cx)/rx,2)+Math.pow((y-cy)/ry,2)<=1)tiles[idx(x,y)]=t;
  }
}
const blocksDeco={1:1,2:1,3:1,4:1,5:1,6:1,7:1,8:1,9:1};
function setDeco(i,c){deco[i]=c;if(blocksDeco[c])block[i]=1}

function genWorld(){
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const i=idx(x,y),z=biomeBase(x,y);
    zmap[i]=z;tiles[i]=Z[z].tile;shade[i]=Math.floor(hash2(x,y)*4);
  }
  for(const id of ['town','cieno','oasis','cumbre','bastion']){
    const r=AREAS[id];
    for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){
      const i=idx(x,y);zmap[i]=ZI[id];
      tiles[i]=id==='town'||id==='bastion'?T.GRASS:id==='cieno'?T.SWAMP:id==='oasis'?T.DUNE:T.SNOW;
    }
  }
  lake(62,104,12,6.5,T.WATER,T.SAND);lake(116,78,6,4.5,T.WATER,T.SAND);lake(20,24,5,3.5,T.WATER,T.SAND);
  lake(160,130,3.5,2.4,T.WATER,T.SAND);lake(170,54,10,6,T.ICE,null);
  river([[76,38],[82,50],[76,62],[80,76],[72,90],[64,100]],1.5);
  const cieno=AREAS.cieno;
  for(let y=114;y<H-2;y++)for(let x=2;x<92;x++){
    if(inRect({x:cieno.x-4,y:cieno.y-4,w:cieno.w+8,h:cieno.h+8},x,y))continue;
    if(tiles[idx(x,y)]!==T.SWAMP)continue;
    if(fbm(x*0.11+7,y*0.11+3)>0.655)tiles[idx(x,y)]=T.BOG;
  }
  dungeon(AREAS.cave,T.CAVE,ZI.cave,15);
  dungeon(AREAS.palace,T.ICE,ZI.palace,15);
  dungeon(AREAS.abyss,T.CAVE,ZI.abyss,18);
  carve([[43,74],[60,74],[76,73],[90,71],[100,70],[112,70],[126,67],[138,62]],1.7);
  carve([[100,70],[102,86],[112,98],[128,106],[144,116],[152,124],[160,126]],1.4);
  carve([[112,70],[112,52],[110,36],[106,24],[103,15],[107,15]],1.4);
  carve([[43,62],[44,50],[56,40],[72,34],[90,26],[103,15]],1.4);
  carve([[56,40],[70,30],[80,26],[88,26]],1.5);
  carve([[80,26],[68,20],[58,18],[54,18]],1.5);
  carve([[43,88],[44,100],[40,112],[38,122],[36,126]],1.4);
  carve([[28,74],[14,74],[6,70]],1.4);
  carve([[138,62],[146,54],[152,46],[156,41]],1.4);
  carve([[156,41],[160,30],[166,20],[170,15],[173,15]],1.4);
  fillTiles(37,68,49,80,T.COBBLE);fillTiles(42,62,44,87,T.COBBLE);fillTiles(28,73,57,75,T.COBBLE);
  const hs=[
    {x:30,y:63,w:6,h:4,roof:'#8a3a30',wall:'#b7a98c',name:'Cuartel'},
    {x:50,y:63,w:7,h:4,roof:'#3f5068',wall:'#a79d88',name:'Herrería'},
    {x:30,y:82,w:6,h:4,roof:'#3f6e4c',wall:'#b0a78e',name:'Alquimia'},
    {x:50,y:82,w:7,h:4,roof:'#7a5430',wall:'#b9a88a',name:'Posada'},
    {x:38,y:63,w:4,h:3,roof:'#6b3a5a',wall:'#c1b496'},{x:45,y:63,w:4,h:3,roof:'#8a5a2a',wall:'#b3a687'},
    {x:38,y:83,w:4,h:3,roof:'#4a6a8a',wall:'#c4b799'},{x:45,y:83,w:4,h:3,roof:'#7a3a30',wall:'#b7a98c'},
    {x:29,y:68,w:4,h:3,roof:'#5a7a3a',wall:'#bcae90'},{x:29,y:77,w:4,h:3,roof:'#8a4a3a',wall:'#b0a38a'},
    {x:53,y:68,w:4,h:3,roof:'#3f5a7a',wall:'#c1b496'},{x:53,y:77,w:4,h:3,roof:'#6a4a2a',wall:'#b7a98c'}
  ];
  for(const h of hs){h.type='house';addBuilding(h)}
  addProp('fountain',43,74,true);
  addProp('obelisk',40,76,true,{wp:'town'});
  addProp('noticeboard',45,76,true);
  addProp('anvil',49,70,true);addProp('stall',37,78,true,{col:'#3f8a5c'});
  addProp('stall',39,72,true,{col:'#a0452a'});addProp('stall',47,72,true,{col:'#2a5fa0'});
  for(const l of [[37,69],[49,69],[37,79],[49,79],[43,66],[43,83]])LAMPS.push({x:l[0],y:l[1]});
  for(const l of LAMPS)addProp('lamp',l.x,l.y,true);
  for(const t of [[28,70],[28,79],[57,70],[57,79],[35,87],[51,87]]){const i=idx(t[0],t[1]);if(!block[i]){deco[i]=D.OAK;block[i]=1}}
  /* Bastión de Piedra */
  fillTiles(82,20,95,31,T.COBBLE);
  addBuilding({x:84,y:21,w:8,h:5,roof:'#444e5a',wall:'#7a746e',type:'house',name:'Fortaleza'});
  addBuilding({x:93,y:22,w:5,h:4,roof:'#8a3a30',wall:'#8a847e',type:'house',name:'Herrería'});
  addProp('obelisk',88,26,true,{wp:'bastion'});
  addProp('noticeboard',90,26,true);
  addProp('anvil',94,27,true);
  addProp('campfire',86,28,true);
  addProp('lamp',84,27,true);LAMPS.push({x:84,y:27});
  ellipseTiles(36,132,7.5,5.5,T.PATH);
  for(const h of [{x:29,y:127,w:4,h:3},{x:39,y:127,w:4,h:3},{x:29,y:134,w:4,h:3},{x:40,y:134,w:4,h:3}])addBuilding(Object.assign(h,{type:'hut',roof:'#a8873a',wall:'#6a4a2a'}));
  addProp('obelisk',36,131,true,{wp:'cieno'});addProp('noticeboard',38,131,true);addProp('campfire',36,134,true);
  addProp('lamp',33,129,true);LAMPS.push({x:33,y:129});addProp('lamp',40,129,true);LAMPS.push({x:40,y:129});
  ellipseTiles(160,123,7.5,4.2,T.PATH);
  for(const h of [{x:153,y:120,w:4,h:3,roof:'#c0502e'},{x:164,y:120,w:4,h:3,roof:'#2e6fa0'},{x:152,y:125,w:3,h:3,roof:'#d8a82a'},{x:166,y:125,w:3,h:3,roof:'#7a3a8a'}])addBuilding(Object.assign(h,{type:'tent',wall:'#e8dcc0'}));
  addProp('obelisk',160,123,true,{wp:'oasis'});addProp('campfire',160,126,true);
  for(const p of [[156,128],[164,128],[157,133],[163,133],[154,122],[166,122]]){const i=idx(p[0],p[1]);if(tiles[i]!==T.WATER){deco[i]=D.PALM;block[i]=1}}
  ellipseTiles(156,41,7.5,5.2,T.PATH);
  for(const h of [{x:149,y:36,w:5,h:3},{x:159,y:36,w:5,h:3}])addBuilding(Object.assign(h,{type:'cabin',roof:'#6a4a3a',wall:'#8a6a4a'}));
  for(const h of [{x:150,y:43,w:4,h:3,roof:'#3a6a9a'},{x:160,y:43,w:4,h:3,roof:'#9a3a3a'}])addBuilding(Object.assign(h,{type:'tent',wall:'#d8e4ee'}));
  addProp('obelisk',156,40,true,{wp:'cumbre'});addProp('campfire',156,43,true);
  addProp('lamp',152,39,true);LAMPS.push({x:152,y:39});addProp('lamp',160,39,true);LAMPS.push({x:160,y:39});
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const i=idx(x,y),t=tiles[i];
    if(t===T.WATER||t===T.BOG||t===T.WALL)block[i]=1;
    if(t===T.PATH||t===T.COBBLE||t===T.BRIDGE){
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(inb(x+dx,y+dy))pathNear[idx(x+dx,y+dy)]=1;
    }
  }
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const i=idx(x,y),t=tiles[i];
    if(t===T.BRIDGE)block[i]=0;
    if(t!==T.WATER&&t!==T.BOG)continue;
    let d=4;
    for(let r=1;r<=3&&d===4;r++)for(let dy=-r;dy<=r&&d===4;dy++)for(let dx=-r;dx<=r;dx++){
      if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
      const nt=inb(x+dx,y+dy)?tiles[idx(x+dx,y+dy)]:T.WATER;
      if(nt!==T.WATER&&nt!==T.BOG&&nt!==T.BRIDGE){d=r;break}
    }
    wdepth[i]=d;
    let m=0;
    const land=(xx,yy)=>{if(!inb(xx,yy))return false;const q=tiles[idx(xx,yy)];return q!==T.WATER&&q!==T.BOG&&q!==T.BRIDGE};
    if(land(x,y-1))m|=1;if(land(x+1,y))m|=2;if(land(x,y+1))m|=4;if(land(x-1,y))m|=8;
    shore[i]=m;
  }
  const lair1={x:122,y:15},lair2={x:190,y:15};
  for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){
    const i=idx(x,y),t=tiles[i],z=zmap[i],zid=Z[z].id;
    if(block[i]||keep[i])continue;
    const r=hash2(x+500,y+900),r2=hash2(x+77,y+11),c=fbm(x*0.07+11,y*0.07+5),np=pathNear[i];
    const nearWater=()=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const q=tiles[idx(x+dx,y+dy)];if(q===T.WATER||q===T.BOG)return true}return false};
    if(t===T.GRASS){
      if(zid==='town'){if(r2<0.08)deco[i]=D.FLOWER;else if(r2<0.2)deco[i]=D.TUFT;continue}
      if(!np){if(c>0.56&&r<0.09)setDeco(i,D.OAK);else if(r<0.007)setDeco(i,D.OAK);else if(r>0.993)setDeco(i,D.ROCK)}
      if(!block[i]){if(r2<0.05)deco[i]=D.FLOWER;else if(r2<0.2)deco[i]=D.TUFT;else if(r2<0.22)deco[i]=D.STONES}
    }else if(t===T.FOREST){
      if(!np&&((c>0.38&&r<0.24)||r<0.04))setDeco(i,r2<0.72?D.PINE:D.OAK);
      if(!block[i]){if(r2<0.05)deco[i]=D.MUSH;else if(r2<0.13)deco[i]=D.FERN;else if(r2<0.3)deco[i]=D.TUFT}
    }else if(t===T.HILL){
      if(!np){if(r<0.028)setDeco(i,D.ROCK);else if(r<0.034)setDeco(i,D.BOULDER);else if(r<0.04)setDeco(i,D.DEAD);else if(c>0.6&&r<0.09)setDeco(i,D.PINE)}
      if(!block[i]){if(r2<0.1)deco[i]=D.STONES;else if(r2<0.25)deco[i]=D.TUFT}
    }else if(t===T.SWAMP){
      if(zid==='cieno'){if(r2<0.1)deco[i]=D.SWAMPGRASS;continue}
      if(!np){if((c>0.42&&r<0.10)||r<0.012)setDeco(i,D.DEAD)}
      if(!block[i]){if(nearWater()&&r2<0.4)deco[i]=D.REEDS;else if(r2<0.1)deco[i]=D.SWAMPGRASS;else if(r2<0.14)deco[i]=D.MUSH}
    }else if(t===T.DUNE){
      if(zid==='oasis'){if(r2<0.06)deco[i]=D.SHRUB;continue}
      if(!np){if(r<0.011)setDeco(i,D.CACTUS);else if(r<0.017)setDeco(i,D.ROCK)}
      if(!block[i]){if(r2<0.02)deco[i]=D.BONES;else if(r2<0.07)deco[i]=D.SHRUB}
    }else if(t===T.SNOW){
      if(zid==='cumbre'){if(r2<0.08)deco[i]=D.SNOWMOUND;continue}
      if(!np){if(c>0.42&&r<0.11)setDeco(i,D.SNOWPINE);else if(r<0.013)setDeco(i,D.ROCK);else if(r>0.996)setDeco(i,D.CRYSTAL)}
      if(!block[i]){if(r2<0.06)deco[i]=D.SNOWMOUND;else if(r2<0.09)deco[i]=D.STONES}
    }else if(t===T.SAND){
      if(nearWater()&&r2<0.3)deco[i]=D.REEDS;else if(r2<0.03)deco[i]=D.STONES;
    }else if(t===T.CAVE){
      if(zid!=='cave')continue;
      const corridor=Math.abs(y-15)<=2&&x<113,lair=Math.hypot(x-lair1.x,y-lair1.y)<6;
      if(!corridor&&!lair){if(r<0.055)setDeco(i,D.ROCK);else if(r>0.99)deco[i]=D.BONES}
    }else if(t===T.ICE&&zid==='palace'){
      const corridor=Math.abs(y-15)<=2&&x<180,lair=Math.hypot(x-lair2.x,y-lair2.y)<7;
      if(!corridor&&!lair&&r<0.025)setDeco(i,D.CRYSTAL);
    }
  }
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=idx(x,y);if(tiles[i]===T.WATER&&wdepth[i]>=2&&hash2(x+3,y+8)<0.05&&zmap[i]!==ZI.snow)deco[i]=D.LILY}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const e=Math.min(x,y,W-1-x,H-1-y);
    if(e>2)continue;
    const i=idx(x,y);
    if(e<=1)block[i]=1;
    if(tiles[i]===T.WATER||tiles[i]===T.BOG||tiles[i]===T.BRIDGE)continue;
    if(e<=1||hash2(x+9,y+4)<0.7){
      const zid=Z[zmap[i]].id;
      const code=zid==='snow'?D.SNOWPINE:zid==='swamp'?D.DEAD:(zid==='desert'||zid==='hills')?D.ROCK:hash2(x,y)<0.6?D.PINE:D.OAK;
      deco[i]=code;block[i]=1;
    }
  }
  const acc={};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const z=Z[zmap[idx(x,y)]].id;
    if(!acc[z])acc[z]={x:0,y:0,n:0};
    acc[z].x+=x;acc[z].y+=y;acc[z].n++;
  }
  for(const k in acc)ZCENTER[k]={x:acc[k].x/acc[k].n,y:acc[k].y/acc[k].n};
  const goodTile=t=>t===T.GRASS||t===T.FOREST||t===T.HILL||t===T.SWAMP||t===T.DUNE||t===T.SNOW||t===T.CAVE||t===T.ICE;
  function nodeSpot(zid){
    for(let k=0;k<400;k++){
      const x=ri(4,W-5),y=ri(4,H-5),i=idx(x,y);
      if(zmap[i]!==ZI[zid]||block[i]||!goodTile(tiles[i])||pathNear[i])continue;
      let ok=true;
      for(let dy=-1;dy<=1&&ok;dy++)for(let dx=-1;dx<=1;dx++)if(block[idx(x+dx,y+dy)]){ok=false;break}
      if(!ok)continue;
      if(zid==='cave'&&Math.hypot(x-lair1.x,y-lair1.y)<7)continue;
      if(zid==='palace'&&Math.hypot(x-lair2.x,y-lair2.y)<8)continue;
      return {x:x*TILE+16,y:y*TILE+16};
    }
    return null;
  }
  const plan=[['meadow','chest',3],['meadow','herb',6],['forest','chest',3],['forest','herb',5],['hills','chest',3],['hills','ore',6],['cave','chest',2],['cave','ore',4],
    ['swamp','chest',3],['swamp','herb',5],['desert','chest',3],['desert','ore',5],['snow','chest',3],['snow','ore',5],['palace','chest',2]];
  for(const p of plan)for(let k=0;k<p[2];k++){const s=nodeSpot(p[0]);if(s)NODES.push({id:uid(),type:p[1],z:p[0],x:s.x,y:s.y})}
}
genWorld();

function zoneAt(tx,ty){
  if(!inb(tx,ty))return Z[0];
  return Z[zmap[idx(tx,ty)]];
}
function zoneIdAt(tx,ty){return inb(tx,ty)?Z[zmap[idx(tx,ty)]].id:'meadow'}
function solidAt(px,py){
  const tx=Math.floor(px/TILE),ty=Math.floor(py/TILE);
  if(tx<0||ty<0||tx>=W||ty>=H)return true;
  return block[ty*W+tx]===1;
}
function hitsWall(x,y,r){return solidAt(x-r,y-r*0.5)||solidAt(x+r,y-r*0.5)||solidAt(x-r,y+r*0.6)||solidAt(x+r,y+r*0.6)}
function onRoad(px,py){
  const tx=Math.floor(px/TILE),ty=Math.floor(py/TILE);
  if(!inb(tx,ty))return false;
  const t=tiles[idx(tx,ty)];
  return t===T.PATH||t===T.COBBLE||t===T.BRIDGE;
}
function lineClear(ax,ay,bx,by,r){
  const d=Math.hypot(bx-ax,by-ay),n=Math.max(1,Math.ceil(d/10));
  for(let k=1;k<=n;k++){const t=k/n;if(hitsWall(lerp(ax,bx,t),lerp(ay,by,t),r||9))return false}
  return true;
}
function spotIn(zid,avoid,tries){
  const zi=ZI[zid];
  for(let k=0;k<(tries||500);k++){
    const tx=ri(3,W-4),ty=ri(3,H-4),i=idx(tx,ty);
    if(zmap[i]!==zi||block[i])continue;
    const t=tiles[i];
    if(t===T.PATH||t===T.COBBLE||t===T.BRIDGE||t===T.SAND)continue;
    if(pathNear[i]&&Math.random()<0.7)continue;
    if(avoid&&avoid(tx,ty))continue;
    return {x:tx*TILE+16,y:ty*TILE+16};
  }
  return null;
}

/* ---------- Búsqueda de rutas (A*) ---------- */
const gS=new Float32Array(W*H),came=new Int32Array(W*H),seen=new Uint32Array(W*H),done=new Uint8Array(W*H);
let searchId=0;
function nearestFree(tx,ty){
  if(inb(tx,ty)&&!block[idx(tx,ty)])return {x:tx,y:ty};
  for(let r=1;r<=8;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
    const x=tx+dx,y=ty+dy;if(inb(x,y)&&!block[idx(x,y)])return {x:x,y:y};
  }
  return null;
}
function findPath(sx,sy,gx,gy){
  let s=nearestFree(clamp(Math.floor(sx/TILE),0,W-1),clamp(Math.floor(sy/TILE),0,H-1));
  let g=nearestFree(clamp(Math.floor(gx/TILE),0,W-1),clamp(Math.floor(gy/TILE),0,H-1));
  if(!s||!g)return null;
  const si=idx(s.x,s.y),gi=idx(g.x,g.y);
  if(si===gi)return [{x:gx,y:gy}];
  searchId++;
  const heap=[],hf=[];
  function push(i,f){heap.push(i);hf.push(f);let c=heap.length-1;while(c>0){const p=(c-1)>>1;if(hf[p]<=hf[c])break;[heap[p],heap[c]]=[heap[c],heap[p]];[hf[p],hf[c]]=[hf[c],hf[p]];c=p}}
  function pop(){
    const top=heap[0],last=heap.pop(),lf=hf.pop();
    if(heap.length){heap[0]=last;hf[0]=lf;let c=0;for(;;){let l=c*2+1,r=l+1,m=c;if(l<heap.length&&hf[l]<hf[m])m=l;if(r<heap.length&&hf[r]<hf[m])m=r;if(m===c)break;[heap[m],heap[c]]=[heap[c],heap[m]];[hf[m],hf[c]]=[hf[c],hf[m]];c=m}}
    return top;
  }
  const h=(x,y)=>{const dx=Math.abs(x-g.x),dy=Math.abs(y-g.y);return (Math.max(dx,dy)+0.414*Math.min(dx,dy))*0.7};
  seen[si]=searchId;gS[si]=0;came[si]=-1;done[si]=0;
  push(si,h(s.x,s.y));
  let expanded=0,found=false;
  while(heap.length&&expanded<30000){
    const cur=pop();
    if(done[cur]&&seen[cur]===searchId)continue;
    done[cur]=1;expanded++;
    if(cur===gi){found=true;break}
    const cx=cur%W,cy=(cur/W)|0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(!dx&&!dy)continue;
      const nx=cx+dx,ny=cy+dy;if(!inb(nx,ny))continue;
      const ni=idx(nx,ny);if(block[ni])continue;
      if(dx&&dy&&(block[idx(cx+dx,cy)]||block[idx(cx,cy+dy)]))continue;
      const t=tiles[ni],mult=(t===T.PATH||t===T.COBBLE||t===T.BRIDGE)?0.75:1;
      const ng=gS[cur]+(dx&&dy?1.414:1)*mult;
      if(seen[ni]!==searchId){seen[ni]=searchId;done[ni]=0;gS[ni]=1e9}
      if(ng<gS[ni]){gS[ni]=ng;came[ni]=cur;push(ni,ng+h(nx,ny))}
    }
  }
  if(!found)return null;
  const raw=[];
  for(let c=gi;c!==-1;c=came[c])raw.push({x:(c%W)*TILE+16,y:((c/W)|0)*TILE+16});
  raw.reverse();
  const out=[];let a={x:sx,y:sy},k=0;
  while(k<raw.length){
    let far=k;
    for(let j=raw.length-1;j>k;j--)if(lineClear(a.x,a.y,raw[j].x,raw[j].y,9)){far=j;break}
    out.push(raw[far]);a=raw[far];k=far+1;
  }
  if(out.length&&g.x===clamp(Math.floor(gx/TILE),0,W-1)&&g.y===clamp(Math.floor(gy/TILE),0,H-1))out[out.length-1]={x:gx,y:gy};
  return out;
}
