
/* =====================================================================
   Parte 2: estado, clases, combate, saqueo, movilidad, misiones y bots
   ===================================================================== */
const MAXLV=20,MAXINV=30,CELL=8,GW=Math.ceil(W/CELL),GH=Math.ceil(H/CELL);
const G={time:0,worldT:0,mobs:[],npcs:[],bots:[],nodes:[],projs:[],parts:[],floats:[],tels:[],fx:[],started:false,muted:false,zone:null,shopNpc:null,
  dlgNpc:null,dlgQuest:null,lootM:null,botChat:8,sfxOn:true,autoLoot:true,sprintToggle:false,shake:0,zoom:1,explored:new Uint8Array(GW*GH),keys:{},joy:null};
let P=null;
const xpNeed=l=>Math.round(50*l*(1+0.22*l));
const ZLV={meadow:3,forest:6,hills:8,cave:10,swamp:12,desert:15,snow:18,palace:20,town:1,cieno:12,oasis:15,cumbre:18};

/* ---------- Clases y habilidades ---------- */
const CLS={
  war:{key:'war',res:'rage',name:'Guerrero',role:'Cuerpo a cuerpo · Ira',color:'#c9482c',icon:'sword',resName:'Ira',resCol:'var(--rage)',melee:true,
    hp0:120,hpl:24,res0:100,resl:0,atk0:9,atkl:3.2,
    desc:'Acero y furia. Aguanta mucho castigo y genera ira al golpear y al recibir golpes.',
    ab:[
      {id:'strike',ul:1,name:'Tajo',ic:'strike',col:'#f0dcb0',cost:0,cd:0,range:58,tgt:true,coef:1.1,desc:'Golpea al objetivo cuerpo a cuerpo. Inflige {d} de daño y genera ira.',fn:t=>{hitMob(t,A()*1.1,{rage:12});swingFx(t,'#fff3d0')}},
      {id:'mortal',ul:1,name:'Golpe Mortal',ic:'sword',col:'#ff9a7a',cost:25,cd:6,range:58,tgt:true,coef:2.8,desc:'Un golpe devastador. Inflige {d} de daño.',fn:t=>{hitMob(t,A()*2.8,{rage:0});swingFx(t,'#ff8060');G.shake=Math.max(G.shake,3)}},
      {id:'charge',ul:3,name:'Carga',ic:'charge',col:'#ffd27a',cost:0,cd:14,range:320,minRange:90,tgt:true,desc:'Te lanzas contra el enemigo, lo aturdes 1,5 s y ganas 20 de ira.',fn:t=>doCharge(t)},
      {id:'whirl',ul:5,name:'Torbellino',ic:'whirl',col:'#b9d8ff',cost:35,cd:8,coef:1.5,desc:'Golpea a todos los enemigos cercanos por {d} de daño cada uno.',fn:()=>{aoe(P.x,P.y,92,e=>hitMob(e,A()*1.5,{rage:0}));ring(P.x,P.y,92,'#b9d8ff');G.fx.push({k:'spin',t:0,life:0.5,col:'#dfeeff'});sfx('whirl')}},
      {id:'shout',ul:7,name:'Grito de Guerra',ic:'shout',col:'#ff6a4a',cost:15,cd:45,desc:'Aumenta tu ataque un 25% durante 25 s.',fn:()=>{addBuff({id:'shout',name:'Grito de Guerra',ic:'shout',col:'#ff6a4a',dur:25,atk:0.25});ring(P.x,P.y,70,'#ff6a4a');sfx('buff')}},
      {id:'will',ul:9,name:'Voluntad de Hierro',ic:'heart',col:'#7fe07f',cost:0,cd:60,noGcd:true,desc:'Recuperas el 35% de tu vida máxima al instante.',fn:()=>healP(P.maxhp*0.35)},
      {id:'leap',ul:11,name:'Salto Heroico',ic:'charge',col:'#ff9a4a',cost:15,cd:16,range:280,tgt:true,coef:2.2,desc:'Saltas por los aires y caes aplastando la zona: {d} de daño y aturdimiento.',fn:t=>{P.x=t.x+(P.dir<0?16:-16);P.y=t.y;aoe(t.x,t.y,95,e=>{hitMob(e,A()*2.2,{rage:10});stunMob(e,1.5)});ring(t.x,t.y,95,'#ff9a4a');burst(t.x,t.y,'#ff9a4a',20,180);G.shake=Math.max(G.shake,6);sfx('boom')}},
      {id:'shieldwall',ul:13,name:'Muro de Escudo',ic:'barrier',col:'#e8c27a',cost:20,cd:35,noGcd:true,desc:'Alzas un baluarte invencible: reduces un 65% del daño recibido durante 8 s.',fn:()=>{addBuff({id:'shieldwall',name:'Muro de Escudo',ic:'barrier',col:'#e8c27a',dur:8,dr:0.65});ring(P.x,P.y,60,'#e8c27a');sfx('buff')}},
      {id:'tormenta',ul:15,name:'Filo de Tormenta',ic:'whirl',col:'#ff5533',cost:35,cd:22,coef:3.5,desc:'Un torbellino letal e imparable: {d} de daño masivo a los enemigos cercanos.',fn:()=>{aoe(P.x,P.y,110,e=>hitMob(e,A()*3.5,{rage:15}));ring(P.x,P.y,110,'#ff5533');G.fx.push({k:'spin',t:0,life:0.7,col:'#ff5533'});G.shake=Math.max(G.shake,6);sfx('whirl')}},
      {id:'colossus',ul:17,name:'Machaque Colosal',ic:'hammer',col:'#ff7744',cost:30,cd:18,range:60,tgt:true,coef:3.6,desc:'Un golpe titánico que ignora defensas: {d} de daño y aturde 2 s.',fn:t=>{hitMob(t,A()*3.6,{rage:15,color:'#ff7744'});stunMob(t,2);G.shake=Math.max(G.shake,7);burst(t.x,t.y-8,'#ff7744',22,180);sfx('boom')}},
      {id:'avatar',ul:19,name:'Avatar Titánico',ic:'shout',col:'#ffcc44',cost:40,cd:60,noGcd:true,desc:'Poder ancestral: te vuelves gigante con +40% daño y 30% reducción de daño durante 15 s.',fn:()=>{addBuff({id:'avatar',name:'Avatar',ic:'shout',col:'#ffcc44',dur:15,atk:0.4,dr:0.3});burst(P.x,P.y-10,'#ffcc44',30,220);ring(P.x,P.y,80,'#ffcc44');sfx('buff')}}
    ]},
  mage:{key:'mage',res:'mana',name:'Mago',role:'Distancia · Maná',color:'#6f7de8',icon:'bolt',resName:'Maná',resCol:'var(--mana)',melee:false,
    hp0:80,hpl:13,res0:90,resl:16,atk0:9,atkl:3.5,
    desc:'Daño explosivo a distancia. Frágil, pero ralentiza, se teletransporta y se protege.',
    ab:[
      {id:'arcane',ul:1,name:'Rayo Arcano',ic:'bolt',col:'#c7a0ff',cost:8,cd:0,cast:1.2,range:340,tgt:true,coef:1.3,desc:'Lanza un rayo arcano. Inflige {d} de daño.',fn:t=>shoot(t,{col:'#c7a0ff',dmg:A()*1.3})},
      {id:'fireball',ul:1,name:'Bola de Fuego',ic:'fire',col:'#ff8a3a',cost:20,cd:0,cast:2.0,range:340,tgt:true,coef:2.6,desc:'Inflige {d} de daño y prende al objetivo durante 6 s.',fn:t=>shoot(t,{col:'#ff8a3a',dmg:A()*2.6,big:true,fire:true,onHit:m=>addDot(m,'burn',A()*0.9,6,'#ff8a3a')})},
      {id:'nova',ul:3,name:'Nova de Escarcha',ic:'snow',col:'#9fe0ff',cost:18,cd:14,coef:1,desc:'Daña a los enemigos cercanos ({d}) y los ralentiza 4 s.',fn:()=>{aoe(P.x,P.y,115,e=>{hitMob(e,A()*1.0);slow(e,0.45,4)});ring(P.x,P.y,115,'#9fe0ff');G.fx.push({k:'frost',t:0,life:0.6,r:115});sfx('whirl')}},
      {id:'blink',ul:5,name:'Parpadeo',ic:'blink',col:'#e0b0ff',cost:10,cd:12,noGcd:true,desc:'Te teletransportas unos pasos hacia delante.',fn:()=>doBlink()},
      {id:'barrier',ul:7,name:'Barrera de Maná',ic:'barrier',col:'#7fb8ff',cost:25,cd:30,desc:'Absorbe hasta {a} de daño durante 12 s.',fn:()=>{addBuff({id:'barrier',name:'Barrera de Maná',ic:'barrier',col:'#7fb8ff',dur:12,absorb:40+A()*3.2,kindAbsorb:true});ring(P.x,P.y,50,'#7fb8ff');sfx('buff')}},
      {id:'meteor',ul:9,name:'Meteorito',ic:'meteor',col:'#ff5a2a',cost:40,cd:20,cast:2.6,range:340,tgt:true,coef:3.4,desc:'Un meteoro cae sobre el objetivo y daña a todos a su alrededor por {d}.',fn:t=>{const x=t.x,y=t.y;G.fx.push({k:'meteor',x:x,y:y,t:0,life:0.55,hit:()=>{ring(x,y,90,'#ff5a2a');burst(x,y,'#ff9a4a',30,240);aoe(x,y,90,e=>hitMob(e,A()*3.4));G.shake=Math.max(G.shake,6);sfx('boom')}});sfx('cast2')}},
      {id:'comet',ul:11,name:'Cometa Glacial',ic:'snow',col:'#7fd6ff',cost:28,cd:14,cast:1.4,range:350,tgt:true,coef:2.8,desc:'Un cometa de hielo congela a los enemigos en el área: {d} de daño y ralentización.',fn:t=>{const x=t.x,y=t.y;G.fx.push({k:'meteor',x:x,y:y,col:'#7fd6ff',t:0,life:0.5,hit:()=>{ring(x,y,100,'#7fd6ff');burst(x,y,'#bfe8ff',25,200);aoe(x,y,100,e=>{hitMob(e,A()*2.8);slow(e,0.7,3)});G.shake=Math.max(G.shake,5);sfx('boom')}});sfx('cast2')}},
      {id:'timewarp',ul:13,name:'Distorsión Temporal',ic:'run',col:'#c8a0ff',cost:25,cd:40,noGcd:true,desc:'Manipulas el tiempo: +45% de velocidad de movimiento durante 12 s.',fn:()=>{addBuff({id:'timewarp',name:'Distorsión Temporal',ic:'run',col:'#c8a0ff',dur:12,spd:0.45});ring(P.x,P.y,70,'#c8a0ff');sfx('buff')}},
      {id:'combust',ul:15,name:'Ignición Arcana',ic:'fire',col:'#ff4411',cost:35,cd:18,tgt:true,coef:3.8,desc:'Detona una explosión ígnea devastadora en el objetivo por {d} de daño.',fn:t=>{hitMob(t,A()*3.8,{color:'#ff4411'});burst(t.x,t.y-8,'#ff4411',26,220);ring(t.x,t.y,90,'#ff4411');G.shake=Math.max(G.shake,7);sfx('boom')}},
      {id:'pyroblast',ul:17,name:'Piroexplosión',ic:'fire',col:'#ff3300',cost:45,cd:14,cast:2.4,range:350,tgt:true,coef:4.2,desc:'Inmensa esfera de fuego puro que calcina al objetivo por {d} de daño.',fn:t=>shoot(t,{col:'#ff3300',dmg:A()*4.2,big:true,fire:true,onHit:m=>addDot(m,'burn',A()*1.5,8,'#ff3300')})},
      {id:'blizzard',ul:19,name:'Ventisca Ártica',ic:'snow',col:'#80d0ff',cost:45,cd:25,cast:1.8,range:350,tgt:true,coef:3.6,desc:'Convoca una tormenta de hielo: {d} de daño en área y congela 3 s.',fn:t=>{aoe(t.x,t.y,120,e=>{hitMob(e,A()*3.6,{color:'#80d0ff'});slow(e,0.7,5);stunMob(e,2)});ring(t.x,t.y,120,'#80d0ff');G.fx.push({k:'frost',t:0,life:0.9,r:120});sfx('boom')}}
    ]},
  priest:{key:'priest',res:'mana',name:'Sacerdote',role:'Distancia · Sanación',color:'#e8d27a',icon:'sun',resName:'Maná',resCol:'var(--mana)',melee:false,
    hp0:92,hpl:15,res0:100,resl:15,atk0:7,atkl:2.9,
    desc:'Luz que hiere y cura. Se mantiene en pie con sanaciones y escudos.',
    ab:[
      {id:'smite',ul:1,name:'Castigo',ic:'sun',col:'#fff2a8',cost:8,cd:0,cast:1.3,range:330,tgt:true,coef:1.3,desc:'Golpea con luz sagrada. Inflige {d} de daño.',fn:t=>shoot(t,{col:'#fff2a8',dmg:A()*1.3,holy:true})},
      {id:'heal',ul:1,name:'Sanación',ic:'plus',col:'#7fe07f',cost:18,cd:0,cast:1.8,coef:3.4,desc:'Te curas {d} de vida.',fn:()=>healP(A()*3.4)},
      {id:'renew',ul:3,name:'Renovar',ic:'renew',col:'#a8f0a8',cost:14,cd:6,desc:'Te curas {h} de vida cada 2 s durante 10 s.',fn:()=>{addBuff({id:'renew',name:'Renovar',ic:'renew',col:'#a8f0a8',dur:10,hot:{amt:A()*0.55,every:2,next:2}});ring(P.x,P.y,40,'#a8f0a8');sfx('buff')}},
      {id:'shield',ul:5,name:'Escudo de Luz',ic:'barrier',col:'#fff2a8',cost:20,cd:14,desc:'Absorbe hasta {a2} de daño durante 10 s.',fn:()=>{addBuff({id:'shield',name:'Escudo de Luz',ic:'barrier',col:'#fff2a8',dur:10,absorb:30+A()*3,kindAbsorb:true});ring(P.x,P.y,50,'#fff2a8');sfx('buff')}},
      {id:'pain',ul:7,name:'Dolor Sombrío',ic:'skull',col:'#b38cff',cost:12,cd:0,range:330,tgt:true,coef:1.8,desc:'Inflige {d} de daño durante 12 s.',fn:t=>{addDot(t,'pain',A()*1.8,12,'#b38cff');hitMob(t,A()*0.2,{color:'#b38cff'});sfx('cast2')}},
      {id:'hnova',ul:9,name:'Nova Sagrada',ic:'nova',col:'#ffe08a',cost:28,cd:10,coef:1.4,desc:'Daña a los enemigos cercanos ({d}) y te cura.',fn:()=>{aoe(P.x,P.y,120,e=>hitMob(e,A()*1.4));healP(A()*1.5);ring(P.x,P.y,120,'#ffe08a');G.fx.push({k:'frost',t:0,life:0.6,r:120,gold:true});sfx('whirl')}},
      {id:'holyfire',ul:11,name:'Fuego Sagrado',ic:'fire',col:'#ffe07a',cost:18,cd:9,range:330,tgt:true,coef:2.2,desc:'Llama sagrada: {d} de daño al instante y quema por daño continuado.',fn:t=>{hitMob(t,A()*2.2,{holy:true,color:'#ffe07a'});addDot(t,'hfire',A()*1.2,6,'#ffe07a');sfx('cast2')}},
      {id:'sanctuary',ul:13,name:'Santuario Divino',ic:'nova',col:'#ffd870',cost:30,cd:25,desc:'Suelo sagrado: sana {h} de vida cada 1,5 s a ti y aliados durante 9 s.',fn:()=>{addBuff({id:'sanctuary',name:'Santuario',ic:'nova',col:'#ffd870',dur:9,hot:{amt:A()*0.8,every:1.5,next:1.5}});ring(P.x,P.y,90,'#ffd870');G.fx.push({k:'frost',t:0,life:0.8,r:90,gold:true});sfx('buff')}},
      {id:'shadowform',ul:15,name:'Forma de Sombras',ic:'ghost',col:'#a870ff',cost:20,cd:45,noGcd:true,desc:'Poder del vacío: aumentas tu ataque un 30% y reduces daño recibido un 20% durante 15 s.',fn:()=>{addBuff({id:'shadowform',name:'Forma de Sombras',ic:'ghost',col:'#a870ff',dur:15,atk:0.3,dr:0.2});burst(P.x,P.y-10,'#a870ff',20,140);ring(P.x,P.y,60,'#a870ff');sfx('buff')}},
      {id:'divinestar',ul:17,name:'Estrella Divina',ic:'star',col:'#ffe880',cost:30,cd:12,coef:2.6,desc:'Una estrella de luz viaja hacia adelante dañando enemigos ({d}) y sanando aliados.',fn:()=>{aoe(P.x,P.y,130,e=>hitMob(e,A()*2.6,{holy:true,color:'#ffe880'}));healP(A()*2.2);ring(P.x,P.y,130,'#ffe880');burst(P.x,P.y-8,'#ffe880',24,190);sfx('cast2')}},
      {id:'apotheosis',ul:19,name:'Apoteosis',ic:'sun',col:'#fff8b0',cost:40,cd:60,noGcd:true,desc:'Trascendencia divina: reduce los costes un 50% y aumenta curaciones y daño un 40% durante 15 s.',fn:()=>{addBuff({id:'apotheosis',name:'Apoteosis',ic:'sun',col:'#fff8b0',dur:15,atk:0.4,healM:0.4});burst(P.x,P.y-10,'#fff8b0',30,220);ring(P.x,P.y,80,'#fff8b0');sfx('buff')}}
    ]}
};
function A(){let m=1;for(const b of P.buffs)if(b.atk)m+=b.atk;return P.atk*m}
function abDesc(ab){
  return ab.desc.replace('{d}',Math.round(A()*(ab.coef||0))).replace('{a}',Math.round(40+A()*3.2)).replace('{a2}',Math.round(30+A()*3)).replace('{h}',Math.round(A()*0.55));
}

/* ---------- Jugador ---------- */
function makePlayer(cls,name){
  return {isPlayer:true,cls:cls,name:name,x:SPAWN_P.x,y:SPAWN_P.y,dir:1,fa:0,level:1,xp:0,gold:5,inv:[],eq:{weapon:null,head:null,chest:null,boots:null},quests:{},
    hp:1,res:0,maxhp:1,maxres:1,atk:1,armor:0,crit:5,buffs:[],cast:null,gcd:0,cds:{},autoAtk:false,swing:0,swingA:0,target:null,dead:false,combatT:0,
    mounted:false,path:[],pathT:0,intent:null,dash:null,anim:0,moving:false,flash:0,size:10,stun:0,sta:100,staDelay:0,exh:0,sprinting:false,iframes:0,
    slowT:0,slowM:1,dots:[],disc:{town:1},rollP:0,gather:false,spd:0,castPose:0,dance:0,kills:0};
}
function recalc(){
  const c=CLS[P.cls],L=P.level;
  let atk=c.atk0+L*c.atkl,armor=0,hpb=0,crit=5;
  for(const s of SLOTS){const it=P.eq[s];if(it){atk+=it.atk||0;armor+=it.armor||0;hpb+=it.hp||0;crit+=it.crit||0}}
  P.atk=atk;P.armor=armor;P.crit=crit;
  P.maxhp=Math.round(c.hp0+L*c.hpl+hpb);
  P.maxres=c.res==='mana'?Math.round(c.res0+L*c.resl):100;
  P.hp=Math.min(P.hp,P.maxhp);P.res=Math.min(P.res,P.maxres);
}
function newGame(cls,name,app){
  P=makePlayer(cls,name);P.app=Object.assign(defaultApp(cls),app||{});
  recalc();
  P.eq.weapon=genItem(1,0,'weapon',cls);
  P.eq.weapon.name=({war:'Espada de Recluta',mage:'Bastón de Aprendiz',priest:'Maza de Novicio',paladin:'Martillo de Escudero',rogue:'Daga de Recluta',hunter:'Arco de Cazador',necro:'Bastón de Adepto',druid:'Cayado de Brote'})[cls];
  recalc();P.hp=P.maxhp;P.res=CLS[cls].res==='rage'?0:P.maxres;
  addStack('hp1',3);
  if(CLS[cls].res!=='rage')addStack('mp1',2);
  G.explored.fill(0);
  initWorldEntities();
}

/* ---------- Efectos visuales y texto flotante ---------- */
function float(x,y,txt,col,size){G.floats.push({x:x+rand(-8,8),y:y,txt:String(txt),col:col||'#fff',size:size||16,t:0})}
function burst(x,y,col,n,spd){for(let i=0;i<n;i++){const a=rand(0,6.283),s=rand(0.3,1)*(spd||120);G.parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:0,life:rand(0.3,0.7),col:col,size:rand(1.5,3.2)})}}
function ring(x,y,r,col){G.parts.push({ring:true,x:x,y:y,r:r,t:0,life:0.45,col:col})}
function swingFx(t,col){burst(t.x,t.y-8,col,6,110);fxSlash(t.x,t.y-14,P.dir,col,30);sfx('swing')}
function fxSlash(x,y,dir,col,r){G.fx.push({k:'slash',x:x,y:y,dir:dir,col:col,r:r||36,t:0,life:0.22})}
function fxBeam(x,y,col,life){G.fx.push({k:'beam',x:x,y:y,col:col,t:0,life:life||0.6})}
function fly(x,y,col,n){for(let i=0;i<n;i++)G.parts.push({fly:true,x:x+rand(-8,8),y:y+rand(-8,4),vx:rand(-60,60),vy:rand(-120,-40),t:0,life:1.2,col:col,size:rand(2,3.4)})}

/* ---------- Audio mínimo ---------- */
let AC=null;
function tone(f,d,type,vol,slide,delay){
  if(G.muted||!G.sfxOn)return;
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state==='suspended')AC.resume();
    const t0=AC.currentTime+(delay||0),o=AC.createOscillator(),g=AC.createGain();
    o.type=type||'sine';o.frequency.setValueAtTime(f,t0);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,slide),t0+d);
    g.gain.setValueAtTime(vol||0.05,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+d);
    o.connect(g);g.connect(AC.destination);o.start(t0);o.stop(t0+d+0.02);
  }catch(e){}
}
function sfx(n){
  switch(n){
    case 'hit':tone(180,0.09,'square',0.04,70);break;
    case 'crit':tone(300,0.14,'sawtooth',0.05,90);break;
    case 'swing':tone(520,0.07,'triangle',0.025,260);break;
    case 'hurt':tone(120,0.18,'sawtooth',0.05,55);break;
    case 'cast':tone(300,0.25,'sine',0.03,620);break;
    case 'cast2':tone(620,0.16,'triangle',0.035,300);break;
    case 'buff':tone(420,0.3,'sine',0.04,840);break;
    case 'heal':tone(520,0.2,'sine',0.04,780);tone(780,0.25,'sine',0.03,1040,0.1);break;
    case 'whirl':tone(240,0.22,'sawtooth',0.03,520);break;
    case 'boom':tone(90,0.4,'sawtooth',0.07,30);break;
    case 'loot':tone(880,0.1,'square',0.03);tone(1320,0.14,'square',0.03,null,0.07);break;
    case 'coin':tone(1320,0.08,'square',0.025);tone(1760,0.1,'square',0.025,null,0.05);break;
    case 'equip':tone(330,0.1,'triangle',0.04,520);break;
    case 'level':[392,523,659,784].forEach((f,i)=>tone(f,0.3,'triangle',0.05,null,i*0.12));break;
    case 'die':tone(220,0.8,'sawtooth',0.06,40);break;
    case 'quest':[523,659,784].forEach((f,i)=>tone(f,0.22,'triangle',0.04,null,i*0.09));break;
    case 'dodge':tone(400,0.16,'sine',0.03,160);break;
    case 'open':tone(300,0.12,'triangle',0.04,600);tone(900,0.2,'triangle',0.03,null,0.1);break;
  }
}

/* ---------- Inventario ---------- */
function countItem(key){let c=0;for(const x of P.inv)if(x.key===key)c+=x.n;return c}
function addStack(key,n){
  const def=ITEMS[key];
  while(n>0){
    let st=P.inv.find(x=>x.key===key&&x.n<20);
    if(!st){if(P.inv.length>=MAXINV)return n;st={t:def.t,key:key,n:0};P.inv.push(st)}
    const add=Math.min(20-st.n,n);st.n+=add;n-=add;
  }
  return 0;
}
function removeItem(key,n){
  for(let i=P.inv.length-1;i>=0&&n>0;i--){
    const x=P.inv[i];if(x.key!==key)continue;
    const r=Math.min(x.n,n);x.n-=r;n-=r;if(x.n<=0)P.inv.splice(i,1);
  }
}
function addGear(it){if(P.inv.length>=MAXINV)return false;P.inv.push(it);return true}
function itemName(it){
  if(it.t==='gear')return '<span style="color:'+RAR[it.rar].c+'">['+esc(it.name)+']</span>';
  return '<span style="color:'+RAR[0].c+'">['+esc(ITEMS[it.key].name)+(it.n>1?' x'+it.n:'')+']</span>';
}
function equip(i){
  const it=P.inv[i];if(!it||it.t!=='gear')return;
  if(P.level<it.lvl-2){toast('Necesitas nivel '+(it.lvl-2)+' para equiparlo');return}
  const old=P.eq[it.slot];P.eq[it.slot]=it;P.inv.splice(i,1);if(old)P.inv.push(old);
  recalc();sfx('equip');refreshUI();
}
function unequip(slot){
  if(!P.eq[slot])return;
  if(P.inv.length>=MAXINV){toast('Mochila llena');return}
  P.inv.push(P.eq[slot]);P.eq[slot]=null;recalc();refreshUI();
}
function sortInv(){
  const order={gear:0,cons:1,misc:2};
  P.inv.sort((a,b)=>{
    if(order[a.t]!==order[b.t])return order[a.t]-order[b.t];
    if(a.t==='gear'){
      const sa=SLOTS.indexOf(a.slot),sb=SLOTS.indexOf(b.slot);
      return sa!==sb?sa-sb:(b.rar-a.rar)||(b.lvl-a.lvl);
    }
    return String(a.key).localeCompare(String(b.key));
  });
  refreshUI();
}
function usePotion(prefix){
  if(!G.started||P.dead)return;
  if((P.cds.pot||0)>0){toast('Aún no puedes usar otra poción');return}
  for(const k of [prefix+'4',prefix+'3',prefix+'2',prefix+'1']){
    if(countItem(k)>0){
      const d=ITEMS[k];removeItem(k,1);P.cds.pot=30;
      if(d.heal){healP(d.heal)}
      else{
        const v=CLS[P.cls].res==='mana'?d.mana:d.mana*0.5;
        P.res=Math.min(P.maxres,P.res+v);float(P.x,P.y-36,'+'+Math.round(v),'#6fb0ff',16);sfx('buff');
      }
      refreshUI();return;
    }
  }
  toast(prefix==='hp'?'No tienes pociones de vida':'No tienes pociones de maná');
}
function useHerb(){
  if((P.cds.herb||0)>0){toast('La hierba aún no está lista');return}
  if(countItem('herb')<1)return;
  removeItem('herb',1);P.cds.herb=10;healP(ITEMS.herb.heal);refreshUI();
}
function useInv(i){
  const it=P.inv[i];if(!it)return;
  if(G.shopNpc){sellInv(i);return}
  if(it.t==='gear'){equip(i);return}
  if(it.t==='cons'){
    const d=ITEMS[it.key];
    if(d.use==='herb')useHerb();else usePotion(d.heal?'hp':'mp');
  }
}
function sellValue(it){return it.t==='gear'?Math.max(1,Math.floor(it.price*0.4)):Math.max(1,Math.floor(ITEMS[it.key].price*0.4))*it.n}
function sellInv(i){
  const it=P.inv[i];if(!it)return;
  if(it.t!=='gear'&&ITEMS[it.key].quest){toast('No puedes vender objetos de misión');return}
  const val=sellValue(it);
  P.gold+=val;P.inv.splice(i,1);sfx('coin');log('Vendes '+itemName(it)+' por '+val+' de oro.','loot');refreshUI();
}
function sellJunk(){
  let total=0,n=0;
  for(let i=P.inv.length-1;i>=0;i--){
    const it=P.inv[i];
    if(it.t==='misc'&&!ITEMS[it.key].quest){total+=sellValue(it);n++;P.inv.splice(i,1)}
  }
  if(n){P.gold+=total;sfx('coin');log('Vendes '+n+' objeto(s) de basura por '+total+' de oro.','loot')}else toast('No tienes basura que vender');
  refreshUI();
}
function buyStock(entry){
  const price=entry.price;
  if(P.gold<price){toast('No tienes suficiente oro');return}
  if(entry.key){
    if(addStack(entry.key,1)>0){toast('Mochila llena');return}
  }else{
    const cp=Object.assign({},entry.item,{id:uid()});
    if(!addGear(cp)){toast('Mochila llena');return}
  }
  P.gold-=price;sfx('coin');refreshUI();
}
function shopStock(npc){
  if(npc.stock)return npc.stock;
  const out=[],sh=npc.def.shop;
  for(const kind of sh.kinds){
    if(kind==='potions'){
      for(const k of sh.pots)out.push({key:k,price:ITEMS[k].price*2});
    }else{
      for(const lv of sh.lv)for(const s of SLOTS){
        const it=genItem(lv,(lv>=10&&s==='weapon')?2:1,s,P.cls);
        out.push({item:it,price:it.price*2});
      }
    }
  }
  npc.stock=out;return out;
}

/* ---------- Saqueo ---------- */
function lootFeedAdd(it){
  const box=$('lootFeed');if(!box)return;
  const d=document.createElement('div');d.className='lf';
  let h;
  if(it.gold){h='<span class="lfi">'+svg('bag','#f4cf5b')+'</span><span style="color:#f4cf5b">+'+it.gold+' oro</span>'}
  else if(it.t==='gear'){h='<span class="lfi r'+it.rar+'">'+svg(SLOT_IC[it.slot],RAR[it.rar].c)+'</span><span style="color:'+RAR[it.rar].c+'">'+esc(it.name)+'</span>'}
  else{const df=ITEMS[it.key];h='<span class="lfi">'+svg(df.ic,df.col)+'</span><span>'+esc(df.name)+(it.n>1?' x'+it.n:'')+'</span>'}
  d.innerHTML=h;box.appendChild(d);
  while(box.children.length>6)box.removeChild(box.firstChild);
  setTimeout(()=>{d.classList.add('out');setTimeout(()=>{if(d.parentNode)d.parentNode.removeChild(d)},500)},4200);
}
function giveItem(it){
  if(it.t==='gear')return addGear(it)?0:1;
  return addStack(it.key,it.n);
}
function lootBestRar(m){
  let r=-1;
  if(m.loot)for(const it of m.loot.items)if(it.t==='gear')r=Math.max(r,it.rar);
  return r;
}
function lootAll(m){
  if(!m||!m.lootable||!m.loot)return false;
  const L=m.loot,left=[];
  if(L.gold>0){P.gold+=L.gold;lootFeedAdd({gold:L.gold});float(m.x,m.y-22,'+'+L.gold+' oro','#f4cf5b',15);fly(m.x,m.y-10,'#f4cf5b',6);sfx('coin');L.gold=0}
  for(const it of L.items){
    const rem=giveItem(it);
    if(rem===0){lootFeedAdd(it);log('Botín: '+itemName(it),'loot');if(it.t==='gear'&&it.rar>=2)sfx('loot');fly(m.x,m.y-10,it.t==='gear'?RAR[it.rar].c:'#e8dcc0',4)}
    else{if(it.t!=='gear')it.n=rem;left.push(it)}
  }
  if(left.length){L.items=left;toast('Mochila llena: parte del botín queda en el cuerpo')}
  else{m.lootable=false;m.loot=null;if(P.target===m)P.target=null;if(G.lootM===m)closePanel('pLoot')}
  sfx('loot');refreshUI();
  return !left.length;
}
function openLoot(m){
  if(!m||!m.lootable)return;
  if(G.autoLoot){lootAll(m);return}
  G.lootM=m;showPanel('pLoot');renderLoot();sfx('open');
}
function takeLootItem(m,i){
  if(!m||!m.loot)return;
  const it=m.loot.items[i];if(!it)return;
  const rem=giveItem(it);
  if(rem===0){m.loot.items.splice(i,1);lootFeedAdd(it);log('Botín: '+itemName(it),'loot');sfx('loot')}
  else{if(it.t!=='gear')it.n=rem;toast('Mochila llena')}
  if(!m.loot.items.length&&m.loot.gold<=0){m.lootable=false;m.loot=null;closePanel('pLoot')}
  refreshUI();
}
function takeLootGold(m){
  if(!m||!m.loot||m.loot.gold<=0)return;
  P.gold+=m.loot.gold;lootFeedAdd({gold:m.loot.gold});sfx('coin');m.loot.gold=0;
  if(!m.loot.items.length){m.lootable=false;m.loot=null;closePanel('pLoot')}
  refreshUI();
}
function lootNearby(){
  let got=0;
  for(const m of G.mobs)if(m.dead&&m.lootable&&dist(m,P)<150){lootAll(m);got++}
  return got;
}

/* ---------- Recolección: cofres, hierbas y minerales ---------- */
function startGather(n){
  if(n.open||P.dead)return;
  if(P.cast&&P.cast.gather)return;
  const nm=n.type==='chest'?'Abriendo cofre':n.type==='herb'?'Recolectando hierba':'Extrayendo mineral';
  P.cast={ab:{name:nm},t:null,time:0,dur:n.type==='chest'?1.4:1.8,fn:()=>openNode(n),gather:true};
  P.mounted=false;P.autoAtk=false;P.intent=null;
}
function openNode(n){
  if(n.open)return;
  const lv=ZLV[n.z]||5;
  if(n.type==='chest'){
    if(P.inv.length>=MAXINV-1){toast('Libera espacio en la mochila');return}
    n.open=true;n.t=0;
    const gold=Math.round(lv*ri(4,8));P.gold+=gold;lootFeedAdd({gold:gold});log('Cofre: '+gold+' de oro.','loot');
    const r=Math.random(),rar=r<0.5?0:r<0.84?1:r<0.985?2:3;
    if(Math.random()<0.75){const it=genItem(lv+ri(0,2),rar,null,P.cls);addGear(it);lootFeedAdd(it);log('Cofre: '+itemName(it),'loot')}
    const tier=lv>=16?'4':lv>=11?'3':lv>=6?'2':'1';
    if(Math.random()<0.6){addStack('hp'+tier,ri(1,2));lootFeedAdd({t:'cons',key:'hp'+tier,n:1})}
    if(CLS[P.cls].res!=='rage'&&Math.random()<0.4){addStack('mp'+tier,1);lootFeedAdd({t:'cons',key:'mp'+tier,n:1})}
    burst(n.x,n.y-14,'#ffe08a',24,200);fxBeam(n.x,n.y,'#ffe08a',0.8);sfx('open');
  }else if(n.type==='herb'){
    const c=ri(1,2);if(addStack('herb',c)>0){toast('Mochila llena');return}
    n.open=true;n.t=0;lootFeedAdd({t:'cons',key:'herb',n:c});burst(n.x,n.y-8,'#7fe07f',12,100);sfx('loot');
  }else{
    const c=ri(1,2);if(addStack('ore',c)>0){toast('Mochila llena');return}
    n.open=true;n.t=0;lootFeedAdd({t:'misc',key:'ore',n:c});burst(n.x,n.y-8,'#c8d2e8',12,120);sfx('loot');
  }
  refreshUI();
}

/* ---------- Daño, curación y efectos ---------- */
function addRage(n){if(P&&CLS[P.cls].res==='rage')P.res=Math.min(P.maxres,P.res+n)}
function addBuff(b){P.buffs=P.buffs.filter(x=>x.id!==b.id);b.t=0;P.buffs.push(b)}
function addDot(m,id,total,dur,col){
  m.dots=m.dots.filter(d=>d.id!==id);
  m.dots.push({id:id,t:0,dur:dur,tick:total/dur,next:1,col:col});
  aggroMob(m);
}
function slow(m,mult,dur){m.slowM=mult;m.slowT=dur}
function stunMob(m,s){m.stun=Math.max(m.stun,s)}
function healP(n){
  n=Math.round(n);const before=P.hp;P.hp=Math.min(P.maxhp,P.hp+n);
  const got=Math.round(P.hp-before);
  float(P.x,P.y-36,'+'+got,'#7fe07f',18);burst(P.x,P.y-10,'#7fe07f',8,60);fxBeam(P.x,P.y,'#8cff9a',0.7);sfx('heal');
}
function enemiesIn(x,y,r){const out=[];for(const m of G.mobs)if(!m.dead&&dist(m,{x:x,y:y})<=r+m.size)out.push(m);return out}
function aoe(x,y,r,fn){for(const m of enemiesIn(x,y,r))fn(m)}
function hitMob(m,amount,opt){
  opt=opt||{};
  if(m.dead)return;
  const crit=!opt.noCrit&&Math.random()<P.crit/100;
  let d=amount*rand(0.92,1.08);if(crit)d*=1.8;d=Math.max(1,Math.round(d));
  m.hp-=d;m.flash=0.12;
  float(m.x,m.y-m.size*1.8,crit?d+'!':d,crit?'#ffd34d':(opt.color||'#ffffff'),crit?26:16);
  if(crit&&!opt.dot)G.shake=Math.max(G.shake,2.5);
  if(CLS[P.cls].res==='rage'&&!opt.dot)addRage(opt.rage!==undefined?opt.rage:6);
  if(!opt.dot||m.state==='idle')aggroMob(m);
  P.combatT=6;
  if(!opt.dot)sfx(crit?'crit':'hit');
  if(m.hp<=0)killMob(m);
}
function aggroMob(m){
  if(m.dead)return;
  if(m.state!=='chase'){
    m.state='chase';
    for(const o of G.mobs){
      if(o===m||o.dead||o.state!=='idle'||o.def.passive)continue;
      if(dist(o,m)<110)o.state='chase';
    }
  }
}
function hurtPlayer(dmg,src,opt){
  if(P.dead)return;
  opt=opt||{};
  if(P.iframes>0){float(P.x,P.y-36,'Esquiva','#cfe8ff',15);return}
  const red=opt.raw?0:P.armor/(P.armor+40+(src.level||P.level)*10);
  let d=Math.max(1,Math.round(dmg*rand(0.9,1.1)*(1-red)));
  let dr=0;for(const b of P.buffs)if(b.dr)dr+=b.dr;if(dr)d=Math.max(1,Math.round(d*(1-Math.min(0.8,dr))));
  for(const b of P.buffs){
    if(b.absorb>0&&d>0){const a=Math.min(b.absorb,d);b.absorb-=a;d-=a;float(P.x,P.y-30,'('+Math.round(a)+')','#9cc6ff',14)}
  }
  P.buffs=P.buffs.filter(b=>!(b.kindAbsorb&&b.absorb<=0));
  if(d>0){
    P.hp-=d;P.flash=0.15;float(P.x,P.y-32,'-'+d,opt.col||'#ff6a5a',19);sfx('hurt');
    if(d>P.maxhp*0.15)G.shake=Math.max(G.shake,4);
    if(CLS[P.cls].res==='rage')addRage(6+d*0.04);
  }
  if(opt.slow){P.slowT=opt.slow[1];P.slowM=opt.slow[0]}
  if(opt.poison){P.dots=P.dots.filter(x=>x.id!=='poison');P.dots.push({id:'poison',t:0,dur:6,tick:Math.max(1,Math.round(src.dmg*0.18)),next:1})}
  if(P.mounted)P.mounted=false;
  if(P.cast&&(P.cast.gather||P.cast.travel)){P.cast=null;toast('Interrumpido')}
  P.combatT=6;
  if(P.hp<=0)playerDie();
}
function playerDie(){
  P.hp=0;P.dead=true;P.autoAtk=false;P.cast=null;P.buffs=[];P.path=[];P.intent=null;P.mounted=false;P.target=null;P.dash=null;P.dots=[];P.slowT=0;
  G.deathPos={x:P.x,y:P.y};
  for(const m of G.mobs)if(!m.dead&&m.state==='chase')m.state='return';
  sfx('die');log('Has muerto.','sys');
  closePanel('pLoot');
  const wp=nearestWP(P.x,P.y);
  $('deathBtnTxt').textContent='Revivir en '+wp.name;
  $('death').hidden=false;
}
function nearestWP(x,y){
  let best=WAYPOINTS[0],bd=1e12;
  for(const w of WAYPOINTS){
    if(!P.disc[w.id])continue;
    const d=Math.hypot(w.tx*TILE-x,w.ty*TILE-y);
    if(d<bd){bd=d;best=w}
  }
  return best;
}
function teleportTo(tx,ty){
  burst(P.x,P.y-10,'#bfe0ff',20,180);
  P.x=tx*TILE+16;P.y=ty*TILE+16;P.path=[];P.intent=null;P.dash=null;P.moving=false;
  burst(P.x,P.y-10,'#bfe0ff',24,200);fxBeam(P.x,P.y,'#bfe0ff',0.9);
  for(const m of G.mobs)if(!m.dead&&m.state==='chase')m.state='return';
  G.snapCam=true;
}
function revive(){
  const wp=nearestWP(G.deathPos?G.deathPos.x:P.x,G.deathPos?G.deathPos.y:P.y);
  P.dead=false;teleportTo(wp.gx,wp.gy);
  P.hp=Math.round(P.maxhp*0.5);P.res=CLS[P.cls].res==='rage'?0:Math.round(P.maxres*0.5);P.combatT=0;
  $('death').hidden=true;log('Despiertas en '+wp.name+'.','sys');
}

/* ---------- Habilidades ---------- */
function shoot(t,o){
  const dmg=o.dmg;
  G.projs.push({x:P.x+P.dir*8,y:P.y-22,t:t,speed:o.speed||580,col:o.col,big:o.big,fire:o.fire,holy:o.holy,life:3,trail:[],
    hit:()=>{if(t.dead)return;hitMob(t,dmg,{color:o.dcol});if(o.onHit)o.onHit(t);burst(t.x,t.y-8,o.col,o.big?18:8,160);if(o.big)ring(t.x,t.y,36,o.col);if(o.holy)fxBeam(t.x,t.y,o.col,0.45)}});
  sfx('cast2');
}
function doCharge(t){
  const a=Math.atan2(t.y-P.y,t.x-P.x),stop=t.size+20,d=Math.max(0,dist(P,t)-stop);
  let tx=P.x+Math.cos(a)*d,ty=P.y+Math.sin(a)*d;
  if(hitsWall(tx,ty,9)){tx=P.x;ty=P.y}
  P.dash={sx:P.x,sy:P.y,tx:tx,ty:ty,t:0,dur:0.22,end:()=>{if(t.dead)return;stunMob(t,1.5);addRage(20);hitMob(t,A()*0.6,{rage:0});burst(t.x,t.y,'#ffd27a',12,170);ring(t.x,t.y,40,'#ffd27a')},trail:'#ffd27a'};
  sfx('whirl');
}
function doBlink(){
  const a=P.moving?P.fa:(P.dir>0?0:Math.PI);
  let x=P.x,y=P.y;
  for(let s=8;s<=190;s+=8){
    const nx=P.x+Math.cos(a)*s,ny=P.y+Math.sin(a)*s;
    if(hitsWall(nx,ny,9))break;x=nx;y=ny;
  }
  G.fx.push({k:'ghost',x:P.x,y:P.y,dir:P.dir,t:0,life:0.4,col:'#e0b0ff'});
  burst(P.x,P.y-10,'#e0b0ff',16,120);P.x=x;P.y=y;burst(P.x,P.y-10,'#e0b0ff',16,120);sfx('cast');
}
function tryUse(i){
  if(!G.started||!P||P.dead||P.stun>0||(P.cast&&!P.cast.gather&&!P.cast.travel))return;
  const ab=CLS[P.cls].ab[i];if(!ab)return;
  if(ab.ul>P.level){toast(ab.name+' se desbloquea en el nivel '+ab.ul);return}
  if((P.cds[ab.id]||0)>0){if(ab.cd>=6)toast(ab.name+' no está listo');return}
  if(!ab.noGcd&&P.gcd>0)return;
  if(P.res<(ab.cost||0)){toast('No tienes suficiente '+CLS[P.cls].resName.toLowerCase());return}
  let t=null;
  if(ab.tgt){
    t=P.target;
    if(!t||t.dead||!t.hostile){toast('Necesitas un objetivo enemigo');return}
    const d=dist(P,t)-t.size;
    if(d>ab.range){toast('Objetivo fuera de alcance');return}
    if(ab.minRange&&d<ab.minRange){toast('Estás demasiado cerca');return}
    P.autoAtk=true;
  }
  if(P.cast){P.cast=null}
  if(P.mounted)P.mounted=false;
  flashSlot(i);
  if(ab.cast){P.cast={ab:ab,t:t,time:0,dur:ab.cast};P.gcd=1;sfx('cast');return}
  fire(ab,t);
}
function fire(ab,t){
  P.res-=ab.cost||0;
  if(ab.cd)P.cds[ab.id]=ab.cd;
  if(!ab.noGcd)P.gcd=Math.max(P.gcd,1);
  P.swingA=0.28;
  ab.fn(t);
}
function mountSpeed(){return P.level>=12?330:270}
function toggleMount(){
  if(!G.started||P.dead)return;
  if(P.level<4){toast('La montura se desbloquea en el nivel 4');return}
  if(P.combatT>0&&!P.mounted){toast('No puedes montar en combate');return}
  P.cast=null;P.mounted=!P.mounted;
  if(P.mounted){burst(P.x,P.y-8,'#d9b27a',10,90);sfx('buff')}
}
function dodge(){
  if(!G.started||P.dead||P.stun>0||P.dash)return;
  if((P.cds.dodge||0)>0)return;
  if(P.sta<20){toast('Sin aliento');return}
  let dx=(G.keys['d']||G.keys['ArrowRight']?1:0)-(G.keys['a']||G.keys['ArrowLeft']?1:0),dy=(G.keys['s']||G.keys['ArrowDown']?1:0)-(G.keys['w']||G.keys['ArrowUp']?1:0);
  if(G.joy&&G.joy.on){dx=G.joy.x;dy=G.joy.y}
  if(!dx&&!dy){if(P.moving){dx=Math.cos(P.fa);dy=Math.sin(P.fa)}else{dx=P.dir;dy=0}}
  const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
  let x=P.x,y=P.y;
  for(let s=8;s<=150;s+=8){const nx=P.x+dx*s,ny=P.y+dy*s;if(hitsWall(nx,ny,9))break;x=nx;y=ny}
  P.cds.dodge=2.5;P.sta-=20;P.staDelay=1;P.iframes=0.38;P.cast=null;P.mounted=false;P.path=[];P.intent=null;
  P.dash={sx:P.x,sy:P.y,tx:x,ty:y,t:0,dur:0.3,end:null,roll:true};
  if(dx>0.2)P.dir=1;else if(dx<-0.2)P.dir=-1;
  burst(P.x,P.y,'#d8d0c0',8,70);sfx('dodge');
}

/* ---------- Enemigos ---------- */
function makeMob(type,x,y,opts){
  opts=opts||{};
  const d=MOBS[type],lv=opts.level||ri(d.lv[0],d.lv[1]);
  const m={hostile:true,type:type,def:d,name:d.name,level:lv,x:x,y:y,home:{x:x,y:y},size:d.size,elite:!!d.elite,rare:!!d.rare,boss:!!d.boss,
    maxhp:Math.round((30+lv*26)*d.hpM),hp:0,dmg:(3+lv*2.1)*d.dmgM,speed:d.speed,state:'idle',dir:Math.random()<0.5?1:-1,
    wander:rand(1,4),wx:x,wy:y,atkT:rand(0.5,1.5),dead:false,deadT:0,flash:0,dots:[],stun:0,slowT:0,slowM:1,loot:null,lootable:false,autoT:-1,
    anim:rand(0,6),temp:!!opts.temp,respawnAt:d.boss?240:d.rare?300:44,swingA:0,quakeT:rand(6,9),phase:0,moving:false,zig:rand(0,6),sx:0};
  m.hp=m.maxhp;return m;
}
function respawnMob(m){
  const d=m.def;m.level=ri(d.lv[0],d.lv[1]);
  m.maxhp=Math.round((30+m.level*26)*d.hpM);m.hp=m.maxhp;m.dmg=(3+m.level*2.1)*d.dmgM;
  m.x=m.home.x;m.y=m.home.y;m.dead=false;m.deadT=0;m.loot=null;m.lootable=false;m.state='idle';m.dots=[];m.stun=0;m.slowT=0;m.phase=0;m.quakeT=rand(6,9);
}
const SPAWN_PLAN=[
  ['wolf','meadow',9,3,70],['boar','meadow',13,1,0],
  ['spider','forest',8,3,60],['bandit','forest',6,2,60],['archer','forest',5,1,0],['bear','forest',7,1,0],
  ['goblin','hills',9,3,60],['ogre','hills',9,1,0],
  ['skel','cave',10,1,0],['bat','cave',9,1,0],
  ['toad','swamp',10,2,60],['croc','swamp',8,1,0],['witch','swamp',6,1,0],
  ['scorpion','desert',10,2,60],['raider','desert',8,2,60],['mummy','desert',7,1,0],
  ['icewolf','snow',9,3,70],['yeti','snow',8,1,0],['golem','snow',7,1,0],
  ['fskel','palace',10,1,0],
  ['skel','deepcave',6,1,0],['crystal_spider','deepcave',8,2,50],
  ['ogre','peaks',6,1,0],['golem','peaks',6,1,0],['wyvern','peaks',8,1,0],
  ['magma_golem','volcano',8,1,0],['fire_elemental','volcano',10,2,50],
  ['shadow_stalker','abyss',8,1,0]
];
const RARE_PLAN=[['alpha','meadow'],['chief','forest'],['grukk','hills'],['bogking','swamp'],['scorpk','desert'],['yetik','snow'],['bandit_warlord','forest']];
function nearArea(id,tx,ty,m){const r=AREAS[id];return tx>=r.x-m&&ty>=r.y-m&&tx<r.x+r.w+m&&ty<r.y+r.h+m}
function avoidFor(zone){
  return (tx,ty)=>{
    for(const id of ['town','capital','cieno','oasis','cumbre'])if(nearArea(id,tx,ty,6))return true;
    if(zone==='cave'&&Math.hypot(tx-122,ty-15)<7)return true;
    if(zone==='cave'&&Math.abs(ty-15)<=2&&tx<111)return true;
    if(zone==='palace'&&Math.hypot(tx-190,ty-15)<8)return true;
    if(zone==='palace'&&Math.abs(ty-15)<=2&&tx<180)return true;
    if(zone==='volcano'&&Math.hypot(tx-179,ty-94)<8)return true;
    return false;
  };
}
function initWorldEntities(){
  G.mobs=[];G.npcs=[];G.bots=[];G.projs=[];G.parts=[];G.floats=[];G.tels=[];G.fx=[];
  for(const pl of SPAWN_PLAN){
    const type=pl[0],zone=pl[1],packs=pl[2],size=pl[3],spread=pl[4],avoid=avoidFor(zone);
    for(let k=0;k<packs;k++){
      const c=spotIn(zone,avoid);if(!c)continue;
      for(let j=0;j<size;j++){
        let x=c.x,y=c.y;
        if(j>0){
          for(let t=0;t<12;t++){const a=rand(0,6.283),r=rand(20,spread);const nx=c.x+Math.cos(a)*r,ny=c.y+Math.sin(a)*r;if(!hitsWall(nx,ny,12)){x=nx;y=ny;break}}
        }
        G.mobs.push(makeMob(type,x,y));
      }
    }
  }
  for(const rp of RARE_PLAN){const c=spotIn(rp[1],avoidFor(rp[1]));if(c)G.mobs.push(makeMob(rp[0],c.x,c.y))}
  G.mobs.push(makeMob('boss',BOSS1.x,BOSS1.y));
  G.mobs.push(makeMob('queen',BOSS2.x,BOSS2.y));
  G.mobs.push(makeMob('dragon_ignis',BOSS_DRAGON.x,BOSS_DRAGON.y));
  for(const n of NPC_DEF)G.npcs.push({id:n.id,name:n.name,title:n.title,x:n.tx*TILE+16,y:n.ty*TILE+16,def:n,npc:true,size:12,dir:n.dir||1,anim:rand(0,6)});
  G.nodes=NODES.map(n=>Object.assign({node:true,open:false,t:0,size:12},n));
  makeBots();
}
const NPC_DEF=[
  {id:'elara',name:'Capitana Elara',title:'Capitana de la Guardia',tx:38,ty:70,dir:1,greet:'La Guardia de Alba vela por los caminos. ¿Necesitas algo, viajero?',
    look:{skin:'#e0b890',hair:'#d9b44a',hairStyle:2,body:'#3a5f9a',trim:'#d4dcec',legs:'#2a3a5a',hat:'#aab4c4',hatType:'helm',weapon:'sword',blade:'#d8dce4',shield:1,cape:'#8a2a2a',pads:'#aab4c4'}},
  {id:'doran',name:'Doran el Herrero',title:'Herrero',tx:48,ty:70,dir:-1,shop:{kinds:['gear'],lv:[2,5,8]},greet:'Acero bueno, precio justo. Mira lo que tengo.',
    look:{skin:'#d6a67a',hair:'#3a2a1a',hairStyle:3,beard:'#3a2a1a',body:'#6b4a2a',trim:'#8a8a8a',legs:'#3a2a1c',weapon:'hammer',apron:1}},
  {id:'mira',name:'Mira la Alquimista',title:'Alquimista',tx:38,ty:79,dir:1,shop:{kinds:['potions'],pots:['hp1','hp2','hp3','mp1','mp2','mp3']},greet:'Pociones frescas de esta mañana. Una gota y vuelves a la pelea.',
    look:{skin:'#e6bd98',hair:'#b04a3a',hairStyle:5,body:'#3f7a5c',trim:'#e8d9a0',legs:'#2a4a3a',hat:'#2f5a44',hatType:'hood',weapon:null}},
  {id:'teo',name:'Teo el Guardabosques',title:'Guardabosques',tx:48,ty:78,dir:-1,greet:'El bosque cambia cuando cae la noche. Ve con ojo.',
    look:{skin:'#d9b08c',hair:'#6b4a2a',hairStyle:1,body:'#58682f',trim:'#8a8a3a',legs:'#3a3a22',hat:'#3a4420',hatType:'hood',weapon:'bow',cape:'#3a4420'}},
  {id:'valen',name:'Anciano Valen',title:'Sabio de Alba',tx:43,ty:68,dir:1,greet:'He visto cuatro generaciones de Alba. Esta quizá sea la que lo cambie todo.',
    look:{skin:'#e0b890',hair:'#eaeaea',hairStyle:2,beard:'#eaeaea',body:'#5a3f8a',trim:'#d9b44a',legs:'#3a2a5a',hat:'#3a2a5a',hatType:'pointy',weapon:'staff',orb:'#c9a6ff'}},
  {id:'aurelius',name:'Comandante Aurelius',title:'Comandante de Astra',tx:107,ty:59,dir:1,greet:'Bienvenido a la Gran Ciudad de Astra. Aquí se forjan las leyendas del imperio.',
    look:{skin:'#e0b890',hair:'#eaeaea',hairStyle:3,beard:'#eaeaea',body:'#243f70',trim:'#ffd700',legs:'#1c2b4d',hat:'#e0d0a0',hatType:'crown',weapon:'sword',blade:'#ffd700',shield:1,cape:'#7a1a1a',pads:'#ffd700'}},
  {id:'seraphina',name:'Archimaga Seraphina',title:'Gran Maestra Arcana',tx:116,ty:75,dir:-1,shop:{kinds:['potions'],pots:['hp3','hp4','hp5','mp3','mp4','mp5']},greet:'El Telar resuena con un poder antiguo. ¿Deseas elixires de la más alta pureza?',
    look:{skin:'#ebd0b5',hair:'#c7a0ff',hairStyle:2,body:'#5c2850',trim:'#ffd700',legs:'#381830',hat:'#5c2850',hatType:'horns',weapon:'staff',orb:'#c7a0ff',cape:'#24183a'}},
  {id:'valerius',name:'Maestro Valerius',title:'Maestro de Hermandades',tx:90,ty:75,dir:1,greet:'Aquí se fundan y gestionan las hermandades de Astra. ¡Únete a otros campeones!',
    look:{skin:'#d6a67a',hair:'#6a4a2a',hairStyle:1,beard:'#6a4a2a',body:'#1e4a30',trim:'#d9b44a',legs:'#183824',hat:'#b8905a',hatType:'beret',weapon:'sword',blade:'#d8dce4',shield:1}},
  {id:'kaelen',name:'Maestro Kaelen',title:'Armero Imperial',tx:119,ty:56,dir:-1,shop:{kinds:['gear'],lv:[12,16,20]},greet:'Las mejores aleaciones de mithril y obsidiana para los héroes del reino.',
    look:{skin:'#cfa075',hair:'#333',hairStyle:3,beard:'#333',body:'#482e22',trim:'#ffd700',legs:'#2c1d16',weapon:'hammer',apron:1}},
  {id:'nyx',name:'Hechicera Nyx',title:'Guardiana del Cieno',tx:33,ty:130,dir:1,greet:'El pantano susurra por las noches. No todo lo que se mueve entre la niebla es amigo.',
    look:{skin:'#c8d8c0',hair:'#7a3a8a',hairStyle:2,body:'#3b5a4a',trim:'#9bff5a',legs:'#243a30',hat:'#2a4a3a',hatType:'pointy',weapon:'staff',orb:'#9bff5a'}},
  {id:'bram',name:'Bram el Mercader',title:'Mercader del Cieno',tx:39,ty:133,dir:-1,shop:{kinds:['potions','gear'],pots:['hp2','hp3','hp4','mp2','mp3','mp4'],lv:[10,12,14]},greet:'Llevo mercancía de todas partes. Tú pones el oro, yo el resto.',
    look:{skin:'#d6a67a',hair:'#4a3a2a',hairStyle:1,beard:'#4a3a2a',body:'#7a5a2a',trim:'#d9b44a',legs:'#3a2a1a',hat:'#6a4a1a',hatType:'bandana',weapon:null}},
  {id:'zahir',name:'Capitán Zahir',title:'Capitán de caravanas',tx:157,ty:124,dir:1,greet:'El sol en estas dunas no perdona. Bebe, y mantén la espada a mano.',
    look:{skin:'#b98a5a',hair:'#111',hairStyle:3,beard:'#111',body:'#2e6fa0',trim:'#f0d070',legs:'#1c3a58',hat:'#e8dcc0',hatType:'turban',weapon:'sword',blade:'#d8dce4',shield:1,cape:'#c0502e'}},
  {id:'safiya',name:'Safiya la Mercadora',title:'Mercadora del Oasis',tx:163,ty:124,dir:-1,shop:{kinds:['potions','gear'],pots:['hp3','hp4','mp3','mp4'],lv:[14,16,18]},greet:'Seda, especias y acero. ¿Qué te hace falta, viajero?',
    look:{skin:'#c9966a',hair:'#2a1c12',hairStyle:5,body:'#7a3a8a',trim:'#f0d070',legs:'#4a2458',hat:'#e8dcc0',hatType:'hood',weapon:null}},
  {id:'bruna',name:'Mariscal Bruna',title:'Mariscal de las Cumbres',tx:153,ty:41,dir:1,greet:'Aquí el invierno no es una estación: es un enemigo. Pelea o vete.',
    look:{skin:'#e0b8a0',hair:'#c8d4e0',hairStyle:5,body:'#4a6a8a',trim:'#e8f2fc',legs:'#2a3f58',hat:'#bfc8d4',hatType:'helm',weapon:'axe',blade:'#cfd8e4',shield:1,cape:'#2f5a9a',pads:'#bfc8d4'}},
  {id:'ulf',name:'Ulf el Peletero',title:'Mercader de las Cumbres',tx:159,ty:41,dir:-1,shop:{kinds:['potions','gear'],pots:['hp3','hp4','mp3','mp4'],lv:[17,19,21]},greet:'Abrígate. Y compra algo, que el frío da hambre.',
    look:{skin:'#d9b08c',hair:'#8a5a2a',hairStyle:1,beard:'#8a5a2a',body:'#8a5a3a',trim:'#f0f4f8',legs:'#4a3020',hat:'#e8eef4',hatType:'hood',weapon:null,fur:1}}
];
function inSafe(e){const z=zoneAt(Math.floor(e.x/TILE),Math.floor(e.y/TILE));return !!z.safe}
function moveEnt(e,dx,dy,r){
  const nx=e.x+dx;if(!hitsWall(nx,e.y,r))e.x=nx;
  const ny=e.y+dy;if(!hitsWall(e.x,ny,r))e.y=ny;
}
function updateMob(m,dt){
  if(m.dead){
    m.deadT+=dt;
    if(m.autoT>0){
      m.autoT-=dt;
      if(m.autoT<=0&&m.lootable&&G.autoLoot&&!P.dead&&dist(m,P)<380){lootAll(m)}
    }
    if(m.deadT>=m.respawnAt){if(m.temp){m.remove=true;return}respawnMob(m)}
    else if(m.deadT>75&&m.lootable&&!m.boss&&!m.rare){m.lootable=false}
    return;
  }
  m.anim+=dt;m.flash=Math.max(0,m.flash-dt);m.swingA=Math.max(0,m.swingA-dt);
  for(let i=m.dots.length-1;i>=0;i--){
    const d=m.dots[i];d.t+=dt;d.next-=dt;
    if(d.next<=0){d.next+=1;hitMob(m,d.tick,{dot:true,noCrit:true,color:d.col});if(m.dead)return}
    if(d.t>=d.dur)m.dots.splice(i,1);
  }
  if(m.slowT>0){m.slowT-=dt;if(m.slowT<=0)m.slowM=1}
  m.moving=false;
  if(m.stun>0){m.stun-=dt;return}
  const sp=m.speed*(m.slowT>0?m.slowM:1),dP=dist(m,P);
  if(m.state==='idle'){
    m.wander-=dt;
    if(m.wander<=0){
      m.wander=rand(2,5);
      if(Math.random()<0.6){const a=rand(0,6.283),r=rand(20,70);m.wx=m.home.x+Math.cos(a)*r;m.wy=m.home.y+Math.sin(a)*r}else{m.wx=m.x;m.wy=m.y}
    }
    const dx=m.wx-m.x,dy=m.wy-m.y,d=Math.hypot(dx,dy);
    if(d>4){const s=sp*0.45*dt;moveEnt(m,dx/d*s,dy/d*s,m.size*0.6);m.moving=true;if(Math.abs(dx)>1)m.dir=dx>0?1:-1}
    if(!P.dead&&!m.def.passive&&!inSafe(P)){
      let ar=m.def.aggro;if(P.level-m.level>=5)ar*=0.5;if(P.mounted)ar*=0.8;
      if(dP<ar)aggroMob(m);
    }
  }else if(m.state==='chase'){
    const leash=m.boss?900:560;
    if(P.dead||inSafe(P)||dist(m,m.home)>leash){m.state='return';return}
    const range=m.def.ranged?m.def.range:m.size+20+P.size;
    const dx=P.x-m.x,dy=P.y-m.y;
    if(Math.abs(dx)>2)m.dir=dx>0?1:-1;
    if(dP>range*0.9){
      let mx=dx/dP*sp*dt,my=dy/dP*sp*dt;
      if(m.def.kind==='bat'){m.zig+=dt*6;const w=Math.sin(m.zig)*sp*dt*0.9;mx+=-dy/dP*w;my+=dx/dP*w}
      moveEnt(m,mx,my,m.size*0.6);m.moving=true;
    }else if(m.def.ranged&&dP<range*0.45){const s=sp*0.7*dt;moveEnt(m,-dx/dP*s,-dy/dP*s,m.size*0.6);m.moving=true}
    if(dP<=range){
      m.atkT-=dt*(m.phase>=3?1.4:1);
      if(m.atkT<=0){
        m.atkT=m.def.atkCd*rand(0.95,1.05);m.swingA=0.25;
        if(m.def.ranged){
          const a=Math.atan2(P.y-m.y,P.x-m.x),bolt=m.def.bolt;
          G.projs.push({x:m.x,y:m.y-12,vx:Math.cos(a)*(bolt?300:380),vy:Math.sin(a)*(bolt?300:380),col:bolt||'#e8e0c8',life:1.4,enemy:true,src:m,arrow:!bolt,bolt:!!bolt});
        }else{
          const opt={};
          if(m.type==='golem')opt.slow=[0.55,2.5];
          if(m.type==='scorpion'||m.type==='scorpk')opt.poison=1;
          if(m.type==='icewolf'||m.type==='yeti'||m.type==='yetik')opt.slow=[0.8,1.5];
          hurtPlayer(m.dmg,m,opt);
        }
      }
    }
    if(m.boss)bossLogic(m,dt);
    for(const o of G.mobs){
      if(o===m||o.dead||o.state!=='chase')continue;
      const ox=m.x-o.x,oy=m.y-o.y,od=Math.hypot(ox,oy),min=(m.size+o.size)*0.8;
      if(od>0&&od<min){const push=(min-od)*0.5;moveEnt(m,ox/od*push,oy/od*push,m.size*0.6)}
    }
  }else if(m.state==='return'){
    const dx=m.home.x-m.x,dy=m.home.y-m.y,d=Math.hypot(dx,dy);
    m.hp=Math.min(m.maxhp,m.hp+m.maxhp*0.15*dt);
    if(d<8){m.state='idle';m.hp=m.maxhp;m.phase=0}
    else{const s=sp*1.15*dt;moveEnt(m,dx/d*s,dy/d*s,m.size*0.6);m.moving=true;if(Math.abs(dx)>1)m.dir=dx>0?1:-1}
  }
}
function summonAdds(m,type,n,lv){
  for(let k=0;k<n;k++){
    const a=(k/n)*6.283+rand(0,1),nx=m.x+Math.cos(a)*90,ny=m.y+Math.sin(a)*90;
    const s=makeMob(type,hitsWall(nx,ny,12)?m.x:nx,hitsWall(nx,ny,12)?m.y:ny,{level:lv,temp:true});
    s.state='chase';s.respawnAt=12;G.mobs.push(s);burst(s.x,s.y-8,'#aab8ff',10,120);
  }
}
function bossLogic(m,dt){
  if(m.type==='boss'){
    m.quakeT-=dt;
    if(m.quakeT<=0){
      m.quakeT=rand(6,8)*(m.hp<m.maxhp*0.5?0.7:1);
      G.tels.push({x:P.x,y:P.y,r:92,t:0,dur:1.8,dmg:m.dmg*1.6,src:m,col:'#ff3b2a'});
      float(m.x,m.y-m.size*2.4,'¡Golpe sísmico!','#ff7a5a',18);
    }
    if(m.phase<1&&m.hp<m.maxhp*0.5){m.phase=1;summonAdds(m,'skel',2,10);banner('Gorrak invoca refuerzos','Los muertos responden a su llamada')}
  }else if(m.type==='queen'){
    m.quakeT-=dt;
    if(m.quakeT<=0){
      m.quakeT=rand(5,7)*(m.phase>=3?0.7:1);
      const n=m.phase>=2?4:3;
      for(let k=0;k<n;k++){
        G.tels.push({x:P.x+(k?rand(-120,120):0),y:P.y+(k?rand(-100,100):0),r:62,t:-k*0.35,dur:1.5,dmg:m.dmg*1.2,src:m,col:'#7fd8ff'});
      }
      float(m.x,m.y-m.size*2.4,'¡Ventisca!','#9fe8ff',18);
    }
    m.novaT=(m.novaT===undefined?8:m.novaT)-dt;
    if(m.novaT<=0){
      m.novaT=12;
      G.tels.push({x:m.x,y:m.y,r:170,t:0,dur:2.2,dmg:m.dmg*1.8,src:m,col:'#7fd8ff',slow:[0.5,4]});
      float(m.x,m.y-m.size*2.4,'¡Nova helada!','#cfeeff',20);
    }
    if(m.phase<1&&m.hp<m.maxhp*0.66){m.phase=1;summonAdds(m,'fskel',2,20);banner('La Reina Escarcha','Sus guardianes despiertan')}
    if(m.phase<2&&m.hp<m.maxhp*0.33){m.phase=2;summonAdds(m,'fskel',3,20);banner('La Reina Escarcha','El invierno se endurece')}
    if(m.phase<3&&m.hp<m.maxhp*0.15){m.phase=3;banner('¡Furia helada!','La Reina ataca sin descanso')}
  }
}
function killMob(m){
  m.dead=true;m.deadT=0;m.state='idle';m.dots=[];
  if(P.target===m)P.autoAtk=false;
  const diff=m.level-P.level;
  let xp=m.level*20+16;
  if(diff<=-6)xp=0;else if(diff<0)xp*=Math.max(0.25,1+diff*0.15);
  if(m.elite)xp*=3;
  xp=Math.round(xp);
  if(xp>0)gainXP(xp);
  m.loot=rollLoot(m);m.lootable=true;m.autoT=G.autoLoot?0.55:-1;
  P.kills++;
  killQuest(m);
  burst(m.x,m.y-8,'#d8c8a0',10,100);
  if(m.boss)banner(m.name.split(',')[0]+' ha caído','Jefe derrotado');
  else if(m.rare)banner('¡'+m.name+' ha caído!','Enemigo raro derrotado');
  refreshUI();
}
function rollLoot(m){
  const lv=m.level,L={gold:0,items:[]};
  L.gold=Math.max(1,Math.round((lv*2+ri(0,3))*(m.boss?8:m.elite?5:1)));
  if(m.def.junk&&Math.random()<0.45)L.items.push({t:'misc',key:m.def.junk,n:1});
  if(m.def.drops)for(const k in m.def.drops){
    let need=false;
    for(const id in P.quests){
      const s=P.quests[id],q=QUESTS[id];
      if(s.state==='active'&&q.obj.collect===k&&countItem(k)<q.obj.n)need=true;
    }
    if(need&&Math.random()<m.def.drops[k])L.items.push({t:'misc',key:k,n:1});
  }
  if(m.boss){for(const it of bossLoot(m.type,P.cls))L.items.push(it)}
  else if(m.rare){L.items.push(genItem(lv+2,Math.random()<0.2?3:2,null,P.cls))}
  else if(Math.random()<0.12){
    const r=Math.random(),rar=r<0.6?0:r<0.91?1:r<0.994?2:3;
    L.items.push(genItem(lv,rar,null,P.cls));
  }
  if(Math.random()<0.08){
    const tier=lv>=16?'4':lv>=11?'3':lv>=6?'2':'1';
    L.items.push({t:'cons',key:pick(['hp','mp'])+tier,n:1});
  }
  return L;
}
function lootMob(m){
  if(!m.lootable||!m.loot)return;
  if(G.autoLoot){lootAll(m);return}
  openLoot(m);
}

/* ---------- Experiencia y niveles ---------- */
function gainXP(n){
  if(P.level>=MAXLV)return;
  P.xp+=n;float(P.x,P.y-52,'+'+n+' XP','#c490ff',14);log('Ganas '+n+' puntos de experiencia.','xp');
  while(P.level<MAXLV&&P.xp>=xpNeed(P.level)){P.xp-=xpNeed(P.level);P.level++;levelUp()}
  if(P.level>=MAXLV)P.xp=0;
}
function levelUp(){
  recalc();P.hp=P.maxhp;P.res=CLS[P.cls].res==='rage'?0:P.maxres;
  const un=CLS[P.cls].ab.filter(a=>a.ul===P.level).map(a=>a.name);
  banner('¡NIVEL '+P.level+'!',un.length?'Nueva habilidad: '+un[0]:P.level===4?'Has desbloqueado tu montura (H)':P.level===12?'Tu montura ahora es más veloz':'Tu poder crece');
  ring(P.x,P.y,90,'#ffe08a');burst(P.x,P.y-10,'#ffe08a',30,200);fxBeam(P.x,P.y,'#ffe08a',1.2);sfx('level');
  log('¡Has subido al nivel '+P.level+'!','sys');
  buildActionBarSafe();
}
function buildActionBarSafe(){try{buildActionBar()}catch(e){}}

/* ---------- Misiones ---------- */
function qState(id){return P.quests[id]?P.quests[id].state:null}
function questAvail(id){
  const q=QUESTS[id];if(P.quests[id])return false;
  if(P.level<q.lvl)return false;
  if(q.pre&&qState(q.pre)!=='done')return false;
  return true;
}
function questProg(id){
  const q=QUESTS[id],s=P.quests[id];
  if(q.obj.collect)return Math.min(q.obj.n,countItem(q.obj.collect));
  return Math.min(q.obj.n,s?s.prog||0:0);
}
function questReady(id){return qState(id)==='active'&&questProg(id)>=QUESTS[id].obj.n}
function acceptQuest(id){
  P.quests[id]={state:'active',prog:0};
  log('Misión aceptada: '+QUESTS[id].title,'q');toast('Misión aceptada: '+QUESTS[id].title);sfx('quest');refreshUI();
}
function completeQuest(id){
  if(!questReady(id))return;
  const q=QUESTS[id];
  if(q.obj.collect)removeItem(q.obj.collect,q.obj.n);
  P.quests[id].state='done';
  gainXP(q.xp);P.gold+=q.gold;
  log('Misión completada: '+q.title+' (+'+q.gold+' de oro)','q');
  if(q.item){const it=genItem(q.item.lvl,q.item.rar,q.item.slot,P.cls);if(addGear(it)){log('Recompensa: '+itemName(it),'loot');lootFeedAdd(it)}else toast('Mochila llena: sin recompensa de objeto')}
  banner('Misión completada',q.title);sfx('quest');refreshUI();
}
function killQuest(m){
  for(const id in P.quests){
    const s=P.quests[id],q=QUESTS[id];
    if(s.state!=='active'||!q.obj.kill||q.obj.kill.indexOf(m.type)<0)continue;
    if(s.prog<q.obj.n){
      s.prog++;
      const msg=q.obj.label+': '+s.prog+'/'+q.obj.n;
      log(msg,'q');toast(msg);
      if(s.prog>=q.obj.n){log('Objetivo completado. Vuelve con '+npcName(q.giver)+'.','q');sfx('quest')}
    }
  }
}
function npcName(id){const n=NPC_DEF.find(x=>x.id===id);return n?n.name:id}
function npcMark(id){
  let mark=null;
  for(const qid in QUESTS){
    const q=QUESTS[qid];if(q.giver!==id)continue;
    if(questReady(qid))return 'ready';
    if(questAvail(qid))mark='avail';
    else if(qState(qid)==='active'&&!mark)mark='active';
  }
  return mark;
}

/* ---------- Compañeros del reino (jugadores simulados) ---------- */
const BOT_NAMES=['Aldrik','Mirelle','Thorvan','Kaelis','Brunhild','Sorren','Ylva','Dagomar','Nerea','Quillan','Iskra','Torsten','Lyra','Matheo','Bellamy','Rhosyn','Cael','Odalys','Zephyr','Katla','Rowan','Illyana','Gorm','Selene','Draven','Mabel','Corvin','Tamsin'];
const BOT_LINES=[
  '¿Alguien para la cueva de Gorrak? Busco sanador.','Vendo Espada de Acero, susurra si te interesa','Cuidado con los lobos al sur del lago',
  'Ese jabalí me ha quitado media vida…','LFG Bosque Umbrío, nivel 5+','¿Dónde está el herrero?','Gorrak cae con tres jugadores bien coordinados',
  'Las arañas del bosque sueltan mucha seda','Los precios de Doran están por las nubes','¿Alguien tiene una poción de maná de sobra?',
  'Qué noche más bonita en Alba','gg','jajaja','Ya casi llego al nivel máximo','Se necesita tanque para Gorrak','Los ogros de las colinas pegan fuerte',
  'La Reina Escarcha congela todo, llevad armadura','Encontré un cofre en las dunas, ¡era épico!','Cuidado con el Rey Cieno en el pantano',
  'Montura a nivel 4, merece la pena','El viaje rápido sale barato, usad el mapa (M)','Brutus ha vuelto a aparecer en las cumbres'
];
const BOT_REPLY=['¡Hola!','Bienvenido a Astra','Suerte en tu aventura','jaja, yo también','Buenas, ¿qué clase eres?','Ánimo con las misiones','Si necesitas ayuda, avisa'];
const SKINS=['#f0c8a0','#e0b890','#c9966a','#a8744a','#7a4e30'];
const HAIRS=['#2a1c12','#4a3020','#8a5a2a','#d9b44a','#b04a3a','#c8c8c8','#6a3a8a','#1c1c24'];
function makeBots(){
  const keys=Object.keys(CLS);
  const plan=[['town',9],['meadow',4],['forest',3],['hills',2],['swamp',2],['desert',3],['snow',3],['cieno',1],['oasis',1],['cumbre',1]];
  let n=0;
  for(const pl of plan)for(let i=0;i<pl[1];i++){
    const zid=pl[0],c=pick(keys);
    const r=AREAS[zid];
    let home=null;
    if(r){for(let t=0;t<30;t++){const tx=ri(r.x+2,r.x+r.w-3),ty=ri(r.y+2,r.y+r.h-3);if(!block[idx(tx,ty)]){home={x:tx*TILE+16,y:ty*TILE+16};break}}}
    else home=spotIn(zid,avoidFor(zid));
    if(!home)continue;
    const lv=Math.min(MAXLV,Math.max(1,(ZLV[zid]||5)+ri(-2,3)));
    G.bots.push({name:BOT_NAMES[n++%BOT_NAMES.length],cls:c,level:zid==='town'?ri(1,MAXLV):lv,x:home.x,y:home.y,home:{x:home.x,y:home.y,z:zid},tx:home.x,ty:home.y,wait:rand(0,4),speed:rand(70,120),
      dir:1,anim:rand(0,6),size:10,bot:true,moving:false,hop:0,app:randomApp(c),mounted:Math.random()<0.15});
  }
}
function updateBots(dt){
  for(const b of G.bots){
    b.anim+=dt;b.hop=Math.max(0,b.hop-dt);b.moving=false;
    if(b.remote){
      const dx=b.tx-b.x,dy=b.ty-b.y,d=Math.hypot(dx,dy);
      if(d>500){b.x=b.tx;b.y=b.ty}else{const k=Math.min(1,dt*9);b.x+=dx*k;b.y+=dy*k}
      b.moving=d>3&&(Date.now()-b.lastPos<1200);if(Math.abs(dx)>1.5)b.dir=dx>0?1:-1;
      continue;
    }
    if(b.wait>0){b.wait-=dt;continue}
    const dx=b.tx-b.x,dy=b.ty-b.y,d=Math.hypot(dx,dy);
    if(d<6){
      b.wait=rand(1.5,7);
      if(Math.random()<0.1)b.hop=0.8;
      for(let k=0;k<8;k++){
        const a=rand(0,6.283),r=rand(40,260),nx=b.home.x+Math.cos(a)*r,ny=b.home.y+Math.sin(a)*r;
        if(!hitsWall(nx,ny,10)){b.tx=nx;b.ty=ny;break}
      }
    }else{
      const s=b.speed*dt*(b.mounted?2:1);moveEnt(b,dx/d*s,dy/d*s,9);b.moving=true;if(Math.abs(dx)>1)b.dir=dx>0?1:-1;
    }
  }
  G.botChat-=dt;
  if(G.botChat<=0){
    G.botChat=rand(8,18);
    const amb=G.bots.filter(x=>!x.remote&&!x.resident),b=amb.length?pick(amb):null;
    if(b&&G.started&&!MP.on)log('<b style="color:#8fc0ff">['+esc(b.name)+']</b> '+esc(pick(BOT_LINES)),'gen');
  }
}
