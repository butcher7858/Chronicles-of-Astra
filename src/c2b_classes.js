
/* =====================================================================
   Clases nuevas, iconos adicionales y aspecto base de cada clase
   ===================================================================== */
Object.assign(IC,{
  shield:'<path d="M12 3l7 3v6c0 4.500-3 7.500-7 9-4-1.500-7-4.500-7-9V6z"/><path d="M12 7v9M8.500 10.500h7"/>',
  hammer:'<path d="M13 4l7 7-3 3-7-7zM11 8L3 16l3 3 8-8"/>',
  dagger:'<path d="M19 3l2 2-9 9-3-3zM9 14l-5 5M5.500 17.500L3 20M10 12l2 2"/>',
  bow:'<path d="M6 3c9 4 9 14 0 18M6 3v18M6 12h14M16 8l4 4-4 4"/>',
  leaf:'<path d="M5 19c0-9 5-14 15-15 0 10-5 15-14 15zM5 19l8-8"/>',
  moon:'<path d="M20 14a8 8 0 11-10-10 6 6 0 0010 10z"/>',
  eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  drop:'<path d="M12 3s6 7 6 11a6 6 0 01-12 0c0-4 6-11 6-11z"/>',
  star:'<path d="M12 3l2.600 5.600 6 .8-4.400 4.200 1.100 6L12 16.800 6.700 19.600l1.100-6L3.400 9.400l6-.8z"/>',
  ghost:'<path d="M6 21V10a6 6 0 0112 0v11l-3-2-3 2-3-2z"/><path d="M10 11h.01M14 11h.01"/>',
  roots:'<path d="M12 3v9M12 12c-3 0-5 2-5 5v4M12 12c3 0 5 2 5 5v4M12 12v9"/>',
  arrows:'<path d="M5 3v8M5 11l-2-2M5 11l2-2M12 6v10M12 16l-2-2M12 16l2-2M19 3v8M19 11l-2-2M19 11l2-2M3 20h18"/>',
  cross:'<path d="M12 3v18M6 9h12"/>',
  flame:'<path d="M12 3c2 3 6 5 6 10a6 6 0 01-12 0c0-3 2-4 3-6 1 2 1 3 2 3 0-3-1-4 1-7z"/>'
});

/* ---------- Aspecto base y metadatos de las clases clásicas ---------- */
function setMeta(k,o){Object.assign(CLS[k],o)}
setMeta('war',{tag:'Cuerpo a cuerpo',orden:'Legión del Acero',
  lore:'Veteranos de las guerras de la Caída. Aprendieron que la furia, bien guiada, también es un escudo.',
  vis:{body:'#a8301f',trim:'#d9b44a',legs:'#3a2f26',weapon:'sword',blade:'#d8dce4',pads:'#8e98a8',shield:0,hat:'#8e98a8',hatType:'helm'},
  app:{skin:'#e8c09a',hair:'#4a3020',hairStyle:1,beard:0,beardColor:'#4a3020',eye:'#1c1410'}});
setMeta('mage',{tag:'Distancia',orden:'Círculo del Astrolabio',
  lore:'Eruditos que estudian el Telar roto y lo remiendan a golpes de arcano, fuego y escarcha.',
  vis:{body:'#4a58b8',trim:'#d9c8ff',legs:'#2a2a5a',weapon:'staff',orb:'#c7a0ff',hat:'#33408a',hatType:'pointy'},
  app:{skin:'#e8c09a',hair:'#c9a15a',hairStyle:2,beard:0,beardColor:'#c9a15a',eye:'#3a5fd0'}});
setMeta('priest',{tag:'Sanador',orden:'Hermanas del Amanecer',
  lore:'Cantan fragmentos de la melodía original para curar a los vivos y quemar lo corrupto.',
  vis:{body:'#e8e0c8',trim:'#e8c23a',legs:'#8a7a4a',weapon:'hammer',hat:'#e8e0c8',hatType:'hood'},
  app:{skin:'#e8c09a',hair:'#6b4a2a',hairStyle:5,beard:0,beardColor:'#6b4a2a',eye:'#1c1410'}});

/* ---------- Clases nuevas ---------- */
Object.assign(CLS,{
  paladin:{key:'paladin',res:'rage',name:'Paladín',role:'Cuerpo a cuerpo · Fe',tag:'Tanque sagrado',orden:'Orden de la Llama Eterna',
    color:'#f2d26b',icon:'shield',resName:'Fe',resCol:'#e8c23a',melee:true,
    hp0:135,hpl:26,res0:100,resl:0,atk0:8,atkl:3.0,
    desc:'Caballero de la Llama Eterna. Resiste el castigo, castiga con luz y se cura a sí mismo. Su Fe crece al golpear y al ser golpeado.',
    lore:'Juraron mantener encendida la Llama Primera. No temen a la oscuridad: la iluminan.',
    vis:{body:'#d8d4c6',trim:'#e8c23a',legs:'#6a6a78',weapon:'hammer',pads:'#b8b4a4',shield:1,hat:'#d8d4c6',hatType:'helm',cape:'#a8301f'},
    app:{skin:'#e8c09a',hair:'#d9b44a',hairStyle:1,beard:0,beardColor:'#d9b44a',eye:'#3a8fd0'},
    ab:[
      {id:'psmite',ul:1,name:'Golpe Sagrado',ic:'hammer',col:'#fff0b0',cost:0,cd:0,range:58,tgt:true,coef:1.05,desc:'Golpea con el martillo bendecido. Inflige {d} de daño y genera Fe.',fn:t=>{hitMob(t,A()*1.05,{rage:11,color:'#fff0b0'});swingFx(t,'#ffe9a0')}},
      {id:'judge',ul:1,name:'Juicio',ic:'sun',col:'#ffe08a',cost:20,cd:7,range:70,tgt:true,coef:2.2,desc:'Un haz de luz juzga al objetivo: {d} de daño y aturdimiento de 1 s.',fn:t=>{hitMob(t,A()*2.2,{rage:0,color:'#ffe08a'});stunMob(t,1);fxBeam(t.x,t.y,'#ffe08a',0.7);swingFx(t,'#ffe08a');G.shake=Math.max(G.shake,3)}},
      {id:'consec',ul:3,name:'Consagración',ic:'nova',col:'#ffd870',cost:25,cd:10,coef:0.9,desc:'Santifica el suelo: daña a los enemigos cercanos ({d}) y te cura un poco.',fn:()=>{aoe(P.x,P.y,100,e=>hitMob(e,A()*0.9,{rage:3,color:'#ffe08a'}));healP(A()*0.8);ring(P.x,P.y,100,'#ffd870');G.fx.push({k:'frost',t:0,life:0.6,r:100,gold:true});sfx('whirl')}},
      {id:'laylight',ul:5,name:'Luz Sanadora',ic:'plus',col:'#7fe07f',cost:30,cd:25,desc:'Imposición de manos: recuperas el 30% de tu vida máxima.',fn:()=>healP(P.maxhp*0.3)},
      {id:'divine',ul:7,name:'Escudo Divino',ic:'barrier',col:'#ffe9a0',cost:35,cd:45,desc:'La Llama te envuelve: recibes un 55% menos de daño durante 8 s.',fn:()=>{addBuff({id:'divine',name:'Escudo Divino',ic:'barrier',col:'#ffe9a0',dur:8,dr:0.55});ring(P.x,P.y,60,'#ffe9a0');fxBeam(P.x,P.y,'#ffe9a0',1);sfx('buff')}},
      {id:'wrath',ul:9,name:'Martillo de Ira',ic:'shield',col:'#ffb060',cost:40,cd:16,range:70,tgt:true,coef:3.4,desc:'Descargas el martillo: {d} de daño al objetivo y la mitad a los cercanos.',fn:t=>{hitMob(t,A()*3.4,{rage:0,color:'#ffcf80'});aoe(t.x,t.y,85,e=>{if(e!==t)hitMob(e,A()*1.6,{rage:0})});ring(t.x,t.y,85,'#ffb060');fxBeam(t.x,t.y,'#ffcf80',0.9);G.shake=Math.max(G.shake,6);sfx('boom')}}
    ]},
  rogue:{key:'rogue',res:'energy',regen:15,name:'Pícaro',role:'Cuerpo a cuerpo · Energía',tag:'Daño letal',orden:'Mano Velada',
    color:'#9aa0b4',icon:'dagger',resName:'Energía',resCol:'#e0c040',melee:true,
    hp0:96,hpl:16,res0:100,resl:0,atk0:9,atkl:3.4,
    desc:'Sombra y acero. Frágil, pero letal: sangrados, aturdimientos y un remate que ejecuta a los heridos.',
    lore:'Gremio sin sede ni bandera. Dicen que roban solo lo que el mundo ya perdió.',
    vis:{body:'#2c2f3a',trim:'#9a2a3a',legs:'#1c1e26',weapon:'dagger',blade:'#c8d0e0',hat:'#23252e',hatType:'hood',cape:'#1a1b22'},
    app:{skin:'#d9b08c',hair:'#1c1c24',hairStyle:6,beard:0,beardColor:'#1c1c24',eye:'#c0402a'},
    ab:[
      {id:'stab',ul:1,name:'Puñalada',ic:'dagger',col:'#e0e6f0',cost:10,cd:0,range:58,tgt:true,coef:1.0,desc:'Un tajo rápido. Inflige {d} de daño.',fn:t=>{hitMob(t,A()*1.0,{rage:0});swingFx(t,'#e8eef8')}},
      {id:'bleed',ul:1,name:'Hemorragia',ic:'drop',col:'#e0554a',cost:25,cd:8,range:58,tgt:true,coef:1.6,desc:'Abre una herida que sangra {d} de daño durante 8 s.',fn:t=>{hitMob(t,A()*0.5,{rage:0});addDot(t,'bleed',A()*1.6,8,'#e0554a');swingFx(t,'#e0554a')}},
      {id:'kidney',ul:3,name:'Golpe Bajo',ic:'skull',col:'#c0b0ff',cost:30,cd:15,range:58,tgt:true,coef:0.8,desc:'Aturde al objetivo durante 2,5 s y le inflige {d} de daño.',fn:t=>{hitMob(t,A()*0.8,{rage:0});stunMob(t,2.5);swingFx(t,'#c0b0ff')}},
      {id:'evade',ul:5,name:'Evasión',ic:'ghost',col:'#b8c4dc',cost:20,cd:30,noGcd:true,desc:'Eres inmune a todo daño durante 2 s.',fn:()=>{P.iframes=2.2;addBuff({id:'evade',name:'Evasión',ic:'ghost',col:'#b8c4dc',dur:2.2});ring(P.x,P.y,50,'#b8c4dc');float(P.x,P.y-40,'Evasión','#cfe8ff',16);sfx('dodge')}},
      {id:'blades',ul:7,name:'Torbellino de Hojas',ic:'whirl',col:'#d0e0ff',cost:35,cd:9,coef:1.4,desc:'Giras entre tus enemigos: {d} de daño a todos los cercanos.',fn:()=>{aoe(P.x,P.y,88,e=>hitMob(e,A()*1.4,{rage:0}));ring(P.x,P.y,88,'#d0e0ff');G.fx.push({k:'spin',t:0,life:0.5,col:'#e8f0ff'});sfx('whirl')}},
      {id:'exec',ul:9,name:'Ejecutar',ic:'skull',col:'#ff6a6a',cost:40,cd:12,range:58,tgt:true,coef:2.4,desc:'Remate: {d} de daño, y más del doble si el objetivo tiene menos del 35% de vida.',fn:t=>{const low=t.hp<t.maxhp*0.35;hitMob(t,A()*(low?5.6:2.4),{rage:0,color:low?'#ff6a6a':null});swingFx(t,'#ff6a6a');if(low)G.shake=Math.max(G.shake,5)}}
    ]},
  hunter:{key:'hunter',res:'energy',regen:11,name:'Cazador',role:'Distancia · Foco',tag:'Arquero',orden:'Montaraces de la Aguja',
    color:'#86c05a',icon:'bow',resName:'Foco',resCol:'#7fbf5a',melee:false,
    hp0:88,hpl:14,res0:100,resl:0,atk0:9,atkl:3.3,
    desc:'Arquero implacable. Dispara desde lejos, ralentiza con trampas, marca a sus presas y llueve flechas sobre ellas.',
    lore:'Siguen el rumbo de las estrellas fugaces y no fallan un tiro cuando creen en el viento.',
    vis:{body:'#4f6a34',trim:'#c9a860',legs:'#3a3a22',weapon:'bow',hat:'#3a4420',hatType:'hood',cape:'#3a4420'},
    app:{skin:'#d9b08c',hair:'#6b4a2a',hairStyle:5,beard:0,beardColor:'#6b4a2a',eye:'#2a7a3a'},
    ab:[
      {id:'aimed',ul:1,name:'Disparo Certero',ic:'arrow',col:'#e8e0c8',cost:8,cd:0,cast:0.9,range:380,tgt:true,coef:1.2,desc:'Un disparo preciso. Inflige {d} de daño.',fn:t=>shoot(t,{col:'#e8e0c8',dmg:A()*1.2,speed:700})},
      {id:'multi',ul:1,name:'Disparo Múltiple',ic:'arrows',col:'#ffd27a',cost:25,cd:8,range:350,tgt:true,coef:1.0,desc:'La flecha se divide: {d} de daño al objetivo y a los enemigos junto a él.',fn:t=>shoot(t,{col:'#ffd27a',dmg:A()*1.0,speed:700,onHit:m=>aoe(m.x,m.y,80,e=>{if(e!==m)hitMob(e,A()*0.9)})})},
      {id:'trap',ul:3,name:'Trampa Congelante',ic:'snow',col:'#9fe0ff',cost:20,cd:14,range:350,tgt:true,coef:0.6,desc:'Una trampa bajo el objetivo: {d} de daño y ralentiza a los cercanos 4 s.',fn:t=>{aoe(t.x,t.y,95,e=>{hitMob(e,A()*0.6);slow(e,0.4,4)});ring(t.x,t.y,95,'#9fe0ff');G.fx.push({k:'frost',t:0,life:0.6,r:95,at:{x:t.x,y:t.y}});sfx('whirl')}},
      {id:'retreat',ul:5,name:'Retirada',ic:'wing',col:'#c8e8a8',cost:10,cd:12,noGcd:true,desc:'Saltas hacia atrás para ganar distancia.',fn:()=>{let dx=P.dir>0?-1:1,dy=0;if(P.target&&!P.target.dead){const l=dist(P,P.target)||1;dx=(P.x-P.target.x)/l;dy=(P.y-P.target.y)/l}let x=P.x,y=P.y;for(let s=8;s<=150;s+=8){const nx=P.x+dx*s,ny=P.y+dy*s;if(hitsWall(nx,ny,9))break;x=nx;y=ny}P.dash={sx:P.x,sy:P.y,tx:x,ty:y,t:0,dur:0.26,end:null,trail:'#c8e8a8'};sfx('dodge')}},
      {id:'mark',ul:7,name:'Marca de Presa',ic:'eye',col:'#ff9a5a',cost:15,cd:20,range:380,tgt:true,coef:2.6,desc:'Marcas al objetivo: sufre {d} de daño durante 10 s.',fn:t=>{addDot(t,'mark',A()*2.6,10,'#ff9a5a');ring(t.x,t.y,36,'#ff9a5a');sfx('cast2')}},
      {id:'rain',ul:9,name:'Lluvia de Flechas',ic:'arrows',col:'#e8e0c8',cost:40,cd:18,cast:1.4,range:380,tgt:true,coef:3.0,desc:'Una nube de flechas cae sobre el objetivo: {d} de daño a todos en la zona.',fn:t=>{const x=t.x,y=t.y;G.fx.push({k:'arrows',x:x,y:y,t:0,life:0.9,hit:()=>{ring(x,y,100,'#e8e0c8');burst(x,y,'#e8e0c8',24,200);aoe(x,y,100,e=>hitMob(e,A()*3.0));G.shake=Math.max(G.shake,4);sfx('boom')}});sfx('cast2')}}
    ]},
  necro:{key:'necro',res:'mana',name:'Nigromante',role:'Distancia · Maná',tag:'Maldiciones',orden:'Cónclave de las Cenizas',
    color:'#a870e0',icon:'skull',resName:'Maná',resCol:'var(--mana)',melee:false,
    hp0:78,hpl:12,res0:95,resl:16,atk0:9,atkl:3.6,
    desc:'Maestro del Hueso y la Umbra. Marchita a distancia, roba vida y devasta grupos, a costa de su propia sangre.',
    lore:'Sostienen que la muerte también forma parte del Telar y que no hay mal en hilar con ella.',
    vis:{body:'#3a2a52',trim:'#9bff5a',legs:'#1c1228',weapon:'staff',orb:'#9bff5a',hat:'#24183a',hatType:'horns',cape:'#24183a'},
    app:{skin:'#c8d0c0',hair:'#d8d8c8',hairStyle:2,beard:0,beardColor:'#d8d8c8',eye:'#8aff4a'},
    ab:[
      {id:'shadowbolt',ul:1,name:'Saeta Sombría',ic:'bolt',col:'#b38cff',cost:8,cd:0,cast:1.1,range:340,tgt:true,coef:1.25,desc:'Un proyectil de sombra. Inflige {d} de daño.',fn:t=>shoot(t,{col:'#b38cff',dmg:A()*1.25})},
      {id:'wither',ul:1,name:'Marchitar',ic:'moon',col:'#7a4aa8',cost:14,cd:4,range:330,tgt:true,coef:2.0,desc:'La vida se seca: {d} de daño durante 12 s.',fn:t=>{addDot(t,'wither',A()*2.0,12,'#a870e0');hitMob(t,A()*0.2,{color:'#a870e0'});sfx('cast2')}},
      {id:'drain',ul:3,name:'Drenar Vida',ic:'drop',col:'#b0ff7a',cost:18,cd:9,range:300,tgt:true,coef:1.6,desc:'Roba {d} de vida al objetivo y te la devuelve en parte.',fn:t=>{hitMob(t,A()*1.6,{color:'#b0ff7a'});healP(A()*0.9);fxBeam(t.x,t.y,'#b0ff7a',0.5)}},
      {id:'curse',ul:5,name:'Maldición del Vacío',ic:'eye',col:'#9a6ad0',cost:22,cd:16,range:330,tgt:true,coef:1.2,desc:'Ralentiza al objetivo un 50% durante 6 s y le inflige {d} de daño con el tiempo.',fn:t=>{slow(t,0.5,6);addDot(t,'curse',A()*1.2,8,'#9a6ad0');ring(t.x,t.y,40,'#9a6ad0');sfx('cast2')}},
      {id:'pact',ul:7,name:'Pacto Oscuro',ic:'heart',col:'#ff6a8a',cost:0,cd:40,noGcd:true,desc:'Sacrificas el 12% de tu vida: recuperas maná y ganas +20% de ataque durante 15 s.',fn:()=>{P.hp=Math.max(1,P.hp-P.maxhp*0.12);P.res=Math.min(P.maxres,P.res+P.maxres*0.5);addBuff({id:'pact',name:'Pacto Oscuro',ic:'heart',col:'#ff6a8a',dur:15,atk:0.2});burst(P.x,P.y-10,'#ff6a8a',14,120);ring(P.x,P.y,50,'#ff6a8a');sfx('buff')}},
      {id:'harvest',ul:9,name:'Cosecha de Almas',ic:'nova',col:'#9bff5a',cost:40,cd:15,coef:2.0,desc:'Arrancas almas a tu alrededor: {d} de daño a cada enemigo cercano y te curas por cada uno.',fn:()=>{let n=0;aoe(P.x,P.y,115,e=>{hitMob(e,A()*2.0,{color:'#9bff5a'});n++});if(n)healP(A()*0.7*Math.min(n,4));ring(P.x,P.y,115,'#9bff5a');G.fx.push({k:'frost',t:0,life:0.6,r:115,col:'155,255,90'});sfx('whirl')}}
    ]},
  druid:{key:'druid',res:'mana',name:'Druida',role:'Distancia · Maná',tag:'Híbrido natural',orden:'Raíz Antigua',
    color:'#5fc88a',icon:'leaf',resName:'Maná',resCol:'var(--mana)',melee:false,
    hp0:90,hpl:15,res0:100,resl:15,atk0:8,atkl:3.2,
    desc:'Voz de la naturaleza. Hiere con luz lunar, sana con raíces y se protege con piel de corteza.',
    lore:'Guardianes de la voz más vieja de Astra, la que aún se oye en los bosques y en el golpe de la lluvia.',
    vis:{body:'#5a4a2a',trim:'#6ad08a',legs:'#3a3020',weapon:'staff',orb:'#bfe8ff',hat:'#8a7a5a',hatType:'horns',cape:'#2f5a3a'},
    app:{skin:'#c9966a',hair:'#3a5f2a',hairStyle:4,beard:0,beardColor:'#3a5f2a',eye:'#7fe0a0'},
    ab:[
      {id:'moonfire',ul:1,name:'Furia Lunar',ic:'moon',col:'#bfe8ff',cost:8,cd:0,cast:1.2,range:330,tgt:true,coef:1.25,desc:'Una descarga de luz lunar. Inflige {d} de daño.',fn:t=>shoot(t,{col:'#bfe8ff',dmg:A()*1.25,holy:true})},
      {id:'swarm',ul:1,name:'Enjambre',ic:'drop',col:'#e0c04a',cost:14,cd:3,range:330,tgt:true,coef:1.8,desc:'Un enjambre de insectos infligen {d} de daño durante 10 s.',fn:t=>{addDot(t,'swarm',A()*1.8,10,'#e0c04a');hitMob(t,A()*0.15,{color:'#e0c04a'});sfx('cast2')}},
      {id:'rebirth',ul:3,name:'Renacer',ic:'renew',col:'#a8f0a8',cost:16,cd:6,desc:'Te curas {h} de vida cada 2 s durante 12 s.',fn:()=>{addBuff({id:'rebirth',name:'Renacer',ic:'renew',col:'#a8f0a8',dur:12,hot:{amt:A()*0.55,every:2,next:2}});ring(P.x,P.y,40,'#a8f0a8');sfx('buff')}},
      {id:'entangle',ul:5,name:'Raíces',ic:'roots',col:'#6ad08a',cost:20,cd:16,range:330,tgt:true,coef:0.5,desc:'Raíces atrapan al objetivo 2,5 s y le infligen {d} de daño.',fn:t=>{hitMob(t,A()*0.5,{color:'#6ad08a'});stunMob(t,2.5);ring(t.x,t.y,44,'#6ad08a');burst(t.x,t.y,'#6ad08a',14,100);sfx('cast2')}},
      {id:'bark',ul:7,name:'Piel de Corteza',ic:'barrier',col:'#b8905a',cost:22,cd:30,desc:'Tu piel se endurece: 35% menos de daño durante 12 s.',fn:()=>{addBuff({id:'bark',name:'Piel de Corteza',ic:'barrier',col:'#b8905a',dur:12,dr:0.35});ring(P.x,P.y,50,'#b8905a');sfx('buff')}},
      {id:'starfall',ul:9,name:'Estrella Fugaz',ic:'star',col:'#dff4ff',cost:38,cd:18,cast:2.2,range:340,tgt:true,coef:3.2,desc:'Una estrella cae del cielo: {d} de daño en la zona.',fn:t=>{const x=t.x,y=t.y;G.fx.push({k:'meteor',x:x,y:y,col:'#bfe8ff',t:0,life:0.55,hit:()=>{ring(x,y,95,'#bfe8ff');burst(x,y,'#dff4ff',30,240);aoe(x,y,95,e=>hitMob(e,A()*3.2));G.shake=Math.max(G.shake,6);sfx('boom')}});sfx('cast2')}}
    ]}
});
const CLASS_ORDER=['paladin','war','mage','priest','rogue','hunter','necro','druid'];
