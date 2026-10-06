/* =====================================================================
   CHRONICLES OF ASTRA · EXTRAS V3
   - Gráficos y texturas avanzadas
   - Retratos dinámicos mejorados en tiempo real (Jugador y Objetivo)
   - Barra de acción expandida (hasta 9 habilidades + ranuras rápidas)
   - Árboles de Talentos (3 ramas por clase, persistentes con respec)
   - Establo de Monturas (Caballo, Huargo, Tigre, Carnero, Draco, Zancudo)
   - Teclas personalizables completas con combinaciones CTRL y SHIFT
   - Sistemas sociales: Grupos (Party), Susurros, Duelos PVP, Tradeos, Hermandades
   - Tablón de Misiones procedurales en ciudades
   - Optimización completa para móviles (Joystick, botones táctiles, pantalla completa, DPR y batería)
   ===================================================================== */

/* ---------- 1. PIEZAS DE ARMADURA VISIBLES Y SLOTS ---------- */
Object.assign(IC,{
  shoulder:'<path d="M3 15c0-6 4-10 9-10s9 4 9 10l-4 2c0-4-2-6-5-6s-5 2-5 6z"/><path d="M12 5v6"/>',
  glove:'<path d="M7 21v-6L5 9l2-1 2 4V4h2v8V3h2v9V5h2v8V8h2v8l-3 5z"/>',
  legs:'<path d="M7 3h10l1 18h-5l-1-10-1 10H6z"/>',
  guild:'<path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z"/><circle cx="12" cy="11" r="3"/>',
  talent:'<circle cx="12" cy="4" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="M12 6v6M12 12l-6 5M12 12l6 5"/>',
  duel:'<path d="M4 4l7 7M4 11l7-7M13 13l7 7M13 20l7-7M9 9l6 6"/>'
});
for(const s of ['shoulders','gloves','legs'])if(SLOTS.indexOf(s)<0)SLOTS.push(s);
Object.assign(SLOT_NAME,{shoulders:'Hombreras',gloves:'Guantes',legs:'Grebas'});
Object.assign(SLOT_IC,{shoulders:'shoulder',gloves:'glove',legs:'legs'});
Object.assign(BASES,{
  shoulders:['Hombreras','Espaldares','Mantelete','Pauldrons','Guardahombros'],
  gloves:['Guantes','Manoplas','Mitones','Guanteletes','Brazales'],
  legs:['Grebas','Pantalones','Faldón','Quijotes','Calzas']
});

const _lookFor=lookFor;
lookFor=function(cls,app,eq){
  const L=_lookFor(cls,app,eq);
  if(!eq)return L;
  const RC=r=>RAR[r].c;
  if(eq.shoulders){L.pads=tint(RC(eq.shoulders.rar),-0.25)}
  if(eq.legs){L.legs=tint(RC(eq.legs.rar),-0.55)}
  if(eq.gloves&&eq.gloves.rar>=1){L.glove=RC(eq.gloves.rar)}
  if(eq.chest&&eq.chest.rar>=3&&!L.cape){L.cape=tint(RC(3),-0.45)}
  let tier=0,n=0;for(const s of SLOTS){const it=eq[s];if(it){tier+=it.rar;n++}}
  L.aura=(n>=5&&tier/n>=2.2)?(tier/n>=2.8?'#c08cff':'#6fb8ff'):null;
  return L;
};

const _drawHuman=drawHuman;
drawHuman=function(g,x,y,L,o){
  if(L&&L.aura&&!(o&&o.noAura)){
    g.save();g.globalCompositeOperation='lighter';
    const t=(o&&o.t)||0,gr=g.createRadialGradient(x,y-20,4,x,y-20,30);
    gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(0.75,L.aura+'44');gr.addColorStop(1,'rgba(0,0,0,0)');
    g.globalAlpha=0.55+Math.sin(t*3)*0.15;g.fillStyle=gr;g.fillRect(x-34,y-56,68,64);g.restore();
  }
  _drawHuman(g,x,y,L,o);
  if(L&&L.glove){
    const sc=(o&&o.scale)||1,dir=(o&&o.dir)||1;
    g.save();g.translate(x,y);g.scale(sc*dir,sc);g.fillStyle=L.glove;g.globalAlpha=0.9;
    g.beginPath();g.arc(12,-17,2.1,0,6.283);g.fill();g.restore();
  }
};

/* ---------- 2. RETRATOS MEJORADOS EN TIEMPO REAL ---------- */
function renderLivePortrait(cvEl, ent, isTarget){
  if(!cvEl)return;
  const g=cvEl.getContext('2d');
  const w=cvEl.width,h=cvEl.height;
  g.clearRect(0,0,w,h);
  if(!ent)return;
  
  // Fondo circular según entidad
  g.save();
  g.beginPath();g.arc(w/2,h/2,w/2-2,0,6.283);g.clip();
  const bgGrad=g.createRadialGradient(w/2,h/2,4,w/2,h/2,w/2);
  if(isTarget){
    if(ent.boss){bgGrad.addColorStop(0,'#4a1010');bgGrad.addColorStop(1,'#180505')}
    else if(ent.elite){bgGrad.addColorStop(0,'#3a2c10');bgGrad.addColorStop(1,'#120e06')}
    else{bgGrad.addColorStop(0,'#242030');bgGrad.addColorStop(1,'#0c0a12')}
  }else{
    const clsCol=CLS[ent.cls]?CLS[ent.cls].color:'#e0a93d';
    bgGrad.addColorStop(0,tint(clsCol,-0.4));bgGrad.addColorStop(1,'#110c08');
  }
  g.fillStyle=bgGrad;g.fillRect(0,0,w,h);

  // Si es humanoide (jugador, bot o humano)
  if(!ent.kind||ent.kind==='human'){
    const L=ent.isPlayer?playerLook():lookFor(ent.cls||'war',ent.app||{},ent.eq);
    g.save();
    g.scale(1.5,1.5);
    drawHuman(g, w/3, h/2.5+12, L, {dir:1,t:G.time,noAura:true});
    g.restore();
  } else {
    // Es un monstruo bestial / arácnido / sapo / gólem
    g.save();
    g.translate(w/2, h/2+4);
    const mLook=ent.look||{};
    if(ent.kind==='quad'){
      // Lobo / oso / jabalí
      g.fillStyle=mLook.body||'#8e939b';
      g.beginPath();g.ellipse(0,-2,16,13,0,0,6.283);g.fill();
      g.fillStyle=mLook.dark||'#5f646c';
      g.beginPath();g.ellipse(0,-8,11,7,0,0,6.283);g.fill();
      // orejas y hocico
      g.beginPath();g.moveTo(-10,-12);g.lineTo(-6,-22);g.lineTo(-2,-12);g.closePath();g.fill();
      g.beginPath();g.moveTo(2,-12);g.lineTo(6,-22);g.lineTo(10,-12);g.closePath();g.fill();
      g.fillStyle=mLook.eye||'#ff3a2a';
      g.beginPath();g.arc(-5,-4,2,0,6.283);g.arc(5,-4,2,0,6.283);g.fill();
      g.fillStyle='#111';g.beginPath();g.ellipse(0,4,4,2.5,0,0,6.283);g.fill();
    } else if(ent.kind==='arach'){
      // Araña / escorpión
      g.fillStyle=mLook.body||'#3d2f4a';
      g.beginPath();g.ellipse(0,-2,15,11,0,0,6.283);g.fill();
      g.fillStyle=mLook.eye||'#ff3a3a';
      for(let a=-6;a<=6;a+=4){g.beginPath();g.arc(a,-4,1.4,0,6.283);g.fill()}
      // quelíceros
      g.strokeStyle=mLook.dark||'#2a2034';g.lineWidth=2.5;
      g.beginPath();g.moveTo(-4,4);g.lineTo(-6,10);g.moveTo(4,4);g.lineTo(6,10);g.stroke();
    } else {
      // Gólem, murciélago, etc.
      g.fillStyle=mLook.body||'#6f7480';
      g.beginPath();g.ellipse(0,0,16,14,0,0,6.283);g.fill();
      g.fillStyle=mLook.eye||'#ffdd40';
      g.beginPath();g.arc(-5,-2,2.5,0,6.283);g.arc(5,-2,2.5,0,6.283);g.fill();
    }
    g.restore();
  }
  g.restore();

  // Borde ornamental
  g.strokeStyle=isTarget?(ent.boss?'#ff5533':ent.elite?'#f4cf5b':'#8e98a8'):'#e0a93d';
  g.lineWidth=isTarget&&ent.boss?3.5:2.5;
  g.beginPath();g.arc(w/2,h/2,w/2-2,0,6.283);g.stroke();
}

let lastTargetPortMob=null;
function updatePortraits(){
  if(P&&$('pPortCv'))renderLivePortrait($('pPortCv'),P,false);
  if($('tPortCv')&&P&&P.target&&!P.target.dead){
    renderLivePortrait($('tPortCv'),P.target,true);
  }
}

/* ---------- 3. MENÚ CONTEXTUAL DEL OBJETIVO ---------- */
function initTargetMenu(){
  const tframe=$('tframe');if(!tframe)return;
  const openMenu=e=>{
    e.preventDefault();
    const t=P&&P.target;if(!t||t.dead)return;
    const m=$('targetMenu');if(!m)return;
    const isPlayerOrBot=t.isPlayer||t.bot;
    m.innerHTML='<div style="background:#140e08;padding:6px 10px;font-weight:700;color:var(--gold);border-bottom:1px solid var(--line);font-size:12px">'+esc(t.name)+'</div>'+
      (isPlayerOrBot?'<button id="tmWhisper">'+svg('shout','#ff7ae8')+' Susurrar</button>'+
      '<button id="tmParty">'+svg('shield','#5cd0ff')+' Invitar a Grupo</button>'+
      '<button id="tmDuel">'+svg('duel','#ff5544')+' Duelo</button>'+
      '<button id="tmTrade">'+svg('bag','#e8c24a')+' Comerciar</button>':
      '<button id="tmAttack">'+svg('sword','#ff4a3a')+' Atacar</button>')+
      '<button id="tmInspect">'+svg('eye','#9ae0ff')+' Inspeccionar</button>';
    m.style.left=Math.min(window.innerWidth-160,e.clientX)+'px';
    m.style.top=Math.min(window.innerHeight-180,e.clientY)+'px';
    m.hidden=false;

    if(m.querySelector('#tmWhisper'))m.querySelector('#tmWhisper').onclick=()=>{m.hidden=true;openWhisper(t.name)};
    if(m.querySelector('#tmParty'))m.querySelector('#tmParty').onclick=()=>{m.hidden=true;partyInvite(t.name)};
    if(m.querySelector('#tmDuel'))m.querySelector('#tmDuel').onclick=()=>{m.hidden=true;startDuel(t)};
    if(m.querySelector('#tmTrade'))m.querySelector('#tmTrade').onclick=()=>{m.hidden=true;startTrade(t)};
    if(m.querySelector('#tmAttack'))m.querySelector('#tmAttack').onclick=()=>{m.hidden=true;tryUse(0)};
    if(m.querySelector('#tmInspect'))m.querySelector('#tmInspect').onclick=()=>{
      m.hidden=true;
      toast(t.name+' · Nivel '+(t.level||1)+' · Vida: '+Math.ceil(t.hp)+'/'+t.maxhp);
    };
  };
  tframe.addEventListener('contextmenu',openMenu);
  $('tPort').addEventListener('click',openMenu);
  document.addEventListener('click',e=>{if($('targetMenu')&&!e.target.closest('#targetMenu')&&!e.target.closest('#tframe'))$('targetMenu').hidden=true});
}

/* ---------- 4. ÁRBOLES DE TALENTOS (5 NIVELES POR RAMA · 10 CLASES) ---------- */
const TALENTS_DATA={
  war:[
    {name:'Armas',desc:'Enfoque en golpes críticos, laceraciones y devastación.',tiers:[
      [{id:'crit1',name:'Filo Afilado',desc:'Aumenta el golpe crítico un +3% por rango.',max:3,stat:'crit',val:3}],
      [{id:'bleed1',name:'Heridas Profundas',desc:'Aumenta el daño de tus ataques un +5% por rango.',max:3,stat:'atkM',val:0.05}],
      [{id:'crit2',name:'Tendón Cortado',desc:'Aumenta el daño de golpes críticos un +8% por rango.',max:3,stat:'atkM',val:0.08}],
      [{id:'bleed2',name:'Golpe Mortal Perfeccionado',desc:'Aumenta el ataque un +6% y velocidad un +4% por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'mas1',name:'Maestría en Armas',desc:'Tus ataques infligen +25% de daño adicional permanente.',max:1,stat:'atkM',val:0.25}]
    ]},
    {name:'Furia',desc:'Fiebre berserker, velocidad vertiginosa y potencia.',tiers:[
      [{id:'atk1',name:'Furia Indómita',desc:'Aumenta tu poder de ataque un +4% por rango.',max:3,stat:'atkM',val:0.04}],
      [{id:'spd1',name:'Celeridad Sangrienta',desc:'Aumenta tu velocidad de movimiento un +5% por rango.',max:3,stat:'spdM',val:0.05}],
      [{id:'vamp1',name:'Sed Insaciable',desc:'Tus ataques recuperan un +4% del daño como vida por rango.',max:3,stat:'hpM',val:0.04}],
      [{id:'enrage',name:'Enloquecer',desc:'Aumenta tu ataque un +7% por rango.',max:3,stat:'atkM',val:0.07}],
      [{id:'furyMaster',name:'Berserker Titánico',desc:'Aumenta tu daño un +25% y velocidad un +20% permanente.',max:1,stat:'atkM',val:0.25}]
    ]},
    {name:'Protección',desc:'Escudo inquebrantable, armadura de placas y resistencia.',tiers:[
      [{id:'arm1',name:'Piel de Acero',desc:'Aumenta tu armadura un +10% por rango.',max:3,stat:'armM',val:0.10}],
      [{id:'hp1',name:'Vitalidad Titánica',desc:'Aumenta tu vida máxima un +6% por rango.',max:3,stat:'hpM',val:0.06}],
      [{id:'arm2',name:'Baluarte Rígido',desc:'Aumenta tu armadura un +8% adicional por rango.',max:3,stat:'armM',val:0.08}],
      [{id:'hp2',name:'Fortaleza Inquebrantable',desc:'Aumenta tu vida máxima un +8% por rango.',max:3,stat:'hpM',val:0.08}],
      [{id:'lastStand',name:'Muralla Inmóvil',desc:'Reduce todo el daño recibido un 20% permanente.',max:1,stat:'armM',val:0.25}]
    ]}
  ],
  mage:[
    {name:'Fuego',desc:'Calor abrasador, llamaradas e ignición fulminante.',tiers:[
      [{id:'fCrit',name:'Piroclasto',desc:'+4% golpe crítico con hechizos de fuego por rango.',max:3,stat:'crit',val:4}],
      [{id:'fDmg',name:'Combustión Ígnea',desc:'+6% de daño de fuego por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'fIgnite',name:'Ignición Devastadora',desc:'+4% crítico adicional por rango.',max:3,stat:'crit',val:4}],
      [{id:'fPyro',name:'Pirofrenesí',desc:'+8% daño con hechizos por rango.',max:3,stat:'atkM',val:0.08}],
      [{id:'fMaster',name:'Fénix Eterno',desc:'Aumenta tu daño de fuego un +25% permanente.',max:1,stat:'atkM',val:0.25}]
    ]},
    {name:'Escarcha',desc:'Control glacial, frío cortante y escudos de hielo.',tiers:[
      [{id:'frArm',name:'Armadura Helada',desc:'+8% armadura por rango.',max:3,stat:'armM',val:0.08}],
      [{id:'frCd',name:'Frío Absoluto',desc:'+5% de velocidad y +4% ataque por rango.',max:3,stat:'atkM',val:0.04}],
      [{id:'frCrit',name:'Escarcha Penetrante',desc:'+4% golpe crítico por rango.',max:3,stat:'crit',val:4}],
      [{id:'frFrost',name:'Congelación Profunda',desc:'+8% daño con hechizos helados por rango.',max:3,stat:'atkM',val:0.08}],
      [{id:'frMaster',name:'Cero Absoluto',desc:'Aumenta tu daño un +25% y armadura un +20% permanente.',max:1,stat:'atkM',val:0.25}]
    ]},
    {name:'Arcano',desc:'Manipulación del Telar, maná abundante y ráfagas arcanas.',tiers:[
      [{id:'arMana',name:'Mente Brillante',desc:'+10% vida y maná máximo por rango.',max:3,stat:'hpM',val:0.06}],
      [{id:'arSpd',name:'Flujo Temporal',desc:'+5% velocidad de movimiento por rango.',max:3,stat:'spdM',val:0.05}],
      [{id:'arFocus',name:'Enfoque Astral',desc:'+6% daño arcano por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'arSurge',name:'Aceleración Cuántica',desc:'+4% crítico y +5% velocidad por rango.',max:3,stat:'crit',val:4}],
      [{id:'arMaster',name:'Poder Arcano Puro',desc:'Aumenta tu daño arcano un +25% permanente.',max:1,stat:'atkM',val:0.25}]
    ]}
  ],
  priest:[
    {name:'Sagrado',desc:'Luz curativa radiante y renacimiento de la vida.',tiers:[
      [{id:'hHeal',name:'Gracia Sagrada',desc:'+6% a curaciones y daño sagrado por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'hHp',name:'Don de Vida',desc:'+5% de vida máxima por rango.',max:3,stat:'hpM',val:0.05}],
      [{id:'hCrit',name:'Oleada Bendita',desc:'+4% golpe crítico sagrado por rango.',max:3,stat:'crit',val:4}],
      [{id:'hSpirit',name:'Espíritu Divino',desc:'+8% vida máxima por rango.',max:3,stat:'hpM',val:0.08}],
      [{id:'hMaster',name:'Luz Perpetua',desc:'Aumenta tu poder y vida un +25% permanente.',max:1,stat:'atkM',val:0.25}]
    ]},
    {name:'Disciplina',desc:'Barreras de fe impenetrables y equilibrio sagrado.',tiers:[
      [{id:'dShield',name:'Escudo de Fe',desc:'+8% armadura por rango.',max:3,stat:'armM',val:0.08}],
      [{id:'dRes',name:'Comunión Divina',desc:'+5% vida máxima por rango.',max:3,stat:'hpM',val:0.05}],
      [{id:'dArmor',name:'Determinación Sagrada',desc:'+10% armadura por rango.',max:3,stat:'armM',val:0.10}],
      [{id:'dAtk',name:'Contrición',desc:'+7% poder de ataque por rango.',max:3,stat:'atkM',val:0.07}],
      [{id:'dMaster',name:'Supresión del Dolor',desc:'Aumenta tu armadura un +25% y daño un +15% permanente.',max:1,stat:'armM',val:0.25}]
    ]},
    {name:'Sombras',desc:'Oscuridad marchitadora, vaciamiento y daño continuado.',tiers:[
      [{id:'sDot',name:'Oscuridad Pura',desc:'+6% daño de sombras por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'sCrit',name:'Pesadilla',desc:'+3% crítico con hechizos sombríos por rango.',max:3,stat:'crit',val:3}],
      [{id:'sVamp',name:'Abrazo Sombrío',desc:'+4% vida máxima por rango.',max:3,stat:'hpM',val:0.04}],
      [{id:'sDark',name:'Putrefacción Mental',desc:'+8% daño con hechizos por rango.',max:3,stat:'atkM',val:0.08}],
      [{id:'sMaster',name:'Forma del Vacío Suprema',desc:'Aumenta tu daño de sombras un +25% permanente.',max:1,stat:'atkM',val:0.25}]
    ]}
  ],
  paladin:[
    {name:'Reprensión',desc:'Justicia férrea y daño fulgurante.',tiers:[
      [{id:'pAtk',name:'Espada de la Justicia',desc:'+5% de daño con armas y luz por rango.',max:3,stat:'atkM',val:0.05}],
      [{id:'pCrit',name:'Celo Sagrado',desc:'+3% golpe crítico por rango.',max:3,stat:'crit',val:3}],
      [{id:'pPen',name:'Veredicto Penetrante',desc:'+6% daño de ataque por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'pJudge',name:'Juicio Radiante',desc:'+5% golpe crítico adicional por rango.',max:3,stat:'crit',val:5}],
      [{id:'pMaster',name:'Veredicto Final',desc:'Aumenta tu ataque un +25% permanente.',max:1,stat:'atkM',val:0.25}]
    ]},
    {name:'Protección',desc:'Baluarte sagrado, armadura y resistencia divina.',tiers:[
      [{id:'pDef',name:'Escudo Sagrado',desc:'+10% de armadura por rango.',max:3,stat:'armM',val:0.10}],
      [{id:'pHp',name:'Robustez',desc:'+6% de vida máxima por rango.',max:3,stat:'hpM',val:0.06}],
      [{id:'pBulwark',name:'Baluarte Bendito',desc:'+10% de armadura por rango.',max:3,stat:'armM',val:0.10}],
      [{id:'pFaith',name:'Fe Firme',desc:'+8% de vida máxima por rango.',max:3,stat:'hpM',val:0.08}],
      [{id:'pMaster2',name:'Defensa Inquebrantable',desc:'Aumenta tu armadura un +30% permanente.',max:1,stat:'armM',val:0.30}]
    ]},
    {name:'Luz',desc:'Auras benditas y sanación reactiva.',tiers:[
      [{id:'pHeal',name:'Toque de Gracia',desc:'+6% daño sagrado y sanación por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'pSpd',name:'Persecución de la Fe',desc:'+5% velocidad de movimiento por rango.',max:3,stat:'spdM',val:0.05}],
      [{id:'pFlash',name:'Destello Radiante',desc:'+5% vida máxima por rango.',max:3,stat:'hpM',val:0.05}],
      [{id:'pLum',name:'Iluminación',desc:'+4% crítico por rango.',max:3,stat:'crit',val:4}],
      [{id:'pMaster3',name:'Aura de Devoción',desc:'Aumenta tu daño y vida un +20% permanente.',max:1,stat:'hpM',val:0.20}]
    ]}
  ],
  rogue:[
    {name:'Asesinato',desc:'Hemorragias letales, veneno y ejecuciones.',tiers:[
      [{id:'rAtk',name:'Tajo Quirúrgico',desc:'+5% daño de armas por rango.',max:3,stat:'atkM',val:0.05}],
      [{id:'rCrit',name:'Letalidad',desc:'+4% golpe crítico por rango.',max:3,stat:'crit',val:4}],
      [{id:'rBleed',name:'Sangrado Vil',desc:'+6% daño por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'rFast',name:'Veneno Rápido',desc:'+4% crítico y +5% velocidad por rango.',max:3,stat:'crit',val:4}],
      [{id:'rMaster',name:'Veneno Mortal',desc:'Aumenta tu daño un +25% permanente.',max:1,stat:'atkM',val:0.25}]
    ]},
    {name:'Sutileza',desc:'Paso silencioso, sombras evasivas y presteza.',tiers:[
      [{id:'rSpd',name:'Velocidad Espectral',desc:'+6% de velocidad de movimiento por rango.',max:3,stat:'spdM',val:0.06}],
      [{id:'rEva',name:'Reflejos Relámpago',desc:'+3% crítico y +4% velocidad por rango.',max:3,stat:'crit',val:3}],
      [{id:'rCamo',name:'Camuflaje Sombrío',desc:'+5% velocidad de movimiento por rango.',max:3,stat:'spdM',val:0.05}],
      [{id:'rAmbush',name:'Emboscada Letal',desc:'+8% daño de ataque por rango.',max:3,stat:'atkM',val:0.08}],
      [{id:'rMaster2',name:'Maestro de Sombras',desc:'Aumenta tu daño un +25% y velocidad un +15% permanente.',max:1,stat:'atkM',val:0.25}]
    ]},
    {name:'Combate',desc:'Duelo cuerpo a cuerpo, vigor y energía inagotable.',tiers:[
      [{id:'rEng',name:'Vigor Infatigable',desc:'+5% velocidad y +4% ataque por rango.',max:3,stat:'atkM',val:0.04}],
      [{id:'rDef',name:'Curtido en Mil Batallas',desc:'+8% armadura y +5% vida por rango.',max:3,stat:'hpM',val:0.05}],
      [{id:'rSteel',name:'Filos de Acero',desc:'+6% daño cuerpo a cuerpo por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'rAgile',name:'Vitalidad Ágil',desc:'+6% vida máxima por rango.',max:3,stat:'hpM',val:0.06}],
      [{id:'rMaster3',name:'Aluvión de Acero',desc:'Aumenta tu daño un +25% permanente.',max:1,stat:'atkM',val:0.25}]
    ]}
  ],
  hunter:[
    {name:'Puntería',desc:'Tiroteo preciso, flechas perforantes y daño a distancia.',tiers:[
      [{id:'hAtk',name:'Disparo Maestro',desc:'+5% daño a distancia por rango.',max:3,stat:'atkM',val:0.05}],
      [{id:'hCrit',name:'Ojo de Halcón',desc:'+4% crítico a distancia por rango.',max:3,stat:'crit',val:4}],
      [{id:'hArrow',name:'Flechas Lacerantes',desc:'+6% daño por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'hSnipe',name:'Disparo Certero',desc:'+5% golpe crítico por rango.',max:3,stat:'crit',val:5}],
      [{id:'hMaster',name:'Tiro Mortal',desc:'Aumenta tu daño a distancia un +25% permanente.',max:1,stat:'atkM',val:0.25}]
    ]},
    {name:'Bestias',desc:'Vínculo animal, ferocidad y compañía salvaje.',tiers:[
      [{id:'hPet',name:'Compañero Feroz',desc:'+6% daño de ataque por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'hSpd',name:'Paso de Guepardo',desc:'+6% velocidad de movimiento por rango.',max:3,stat:'spdM',val:0.06}],
      [{id:'hFrenzy',name:'Frenesí Salvaje',desc:'+6% poder de ataque por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'hBond',name:'Vínculo Espiritual',desc:'+6% vida máxima por rango.',max:3,stat:'hpM',val:0.06}],
      [{id:'hMaster2',name:'Ira Bestial',desc:'Aumenta tu daño un +25% y velocidad un +20% permanente.',max:1,stat:'atkM',val:0.25}]
    ]},
    {name:'Supervivencia',desc:'Trampas astutas, resistencia y combate táctico.',tiers:[
      [{id:'hDef',name:'Piel de Cazador',desc:'+8% armadura y +5% vida máxima por rango.',max:3,stat:'hpM',val:0.05}],
      [{id:'hReflex',name:'Reflejos del Bosque',desc:'+5% velocidad por rango.',max:3,stat:'spdM',val:0.05}],
      [{id:'hString',name:'Cuerda Tensa',desc:'+6% daño por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'hTrap',name:'Trampero Experto',desc:'+8% armadura por rango.',max:3,stat:'armM',val:0.08}],
      [{id:'hMaster3',name:'Espíritu del Bosque',desc:'Aumenta tu vida un +20% y daño un +15% permanente.',max:1,stat:'hpM',val:0.20}]
    ]}
  ],
  necro:[
    {name:'Hueso',desc:'Armaduras óseas impenetrables y lanzas punzantes.',tiers:[
      [{id:'nArm',name:'Armadura de Hueso',desc:'+10% armadura por rango.',max:3,stat:'armM',val:0.10}],
      [{id:'nAtk',name:'Esquirlas Aguzadas',desc:'+5% daño perforante por rango.',max:3,stat:'atkM',val:0.05}],
      [{id:'nBone2',name:'Osamenta Reforzada',desc:'+10% armadura por rango.',max:3,stat:'armM',val:0.10}],
      [{id:'nSpear',name:'Lanza Ósea Letal',desc:'+8% daño de ataque por rango.',max:3,stat:'atkM',val:0.08}],
      [{id:'nMaster',name:'Prisión Ósea',desc:'Aumenta tu armadura un +30% permanente.',max:1,stat:'armM',val:0.30}]
    ]},
    {name:'Sangre',desc:'Vampirismo, sacrificios vitales y robo de esencia.',tiers:[
      [{id:'nVamp',name:'Drenaje Sanguíneo',desc:'+5% daño y +4% vida por rango.',max:3,stat:'hpM',val:0.04}],
      [{id:'nHp',name:'Reserva Vital',desc:'+6% vida máxima por rango.',max:3,stat:'hpM',val:0.06}],
      [{id:'nTrans',name:'Transfusión Continua',desc:'+5% vida máxima por rango.',max:3,stat:'hpM',val:0.05}],
      [{id:'nUnholy',name:'Sangre Impía',desc:'+8% vida máxima por rango.',max:3,stat:'hpM',val:0.08}],
      [{id:'nMaster2',name:'Presencia Carmesí Suprema',desc:'Aumenta tu vida máxima un +25% permanente.',max:1,stat:'hpM',val:0.25}]
    ]},
    {name:'Peste',desc:'Maldiciones corrosivas, peste y descomposición.',tiers:[
      [{id:'nDot',name:'Peste Negra',desc:'+6% daño periódico por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'nSlow',name:'Putrefacción',desc:'+4% crítico por rango.',max:3,stat:'crit',val:4}],
      [{id:'nMiasma',name:'Miasma Letal',desc:'+6% daño por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'nInfect',name:'Infección Corrupta',desc:'+5% crítico por rango.',max:3,stat:'crit',val:5}],
      [{id:'nMaster3',name:'Apocalipsis Pútrido',desc:'Aumenta tu daño de sombras un +25% permanente.',max:1,stat:'atkM',val:0.25}]
    ]}
  ],
  druid:[
    {name:'Equilibrio',desc:'Luz estelar, energía solar y poder cósmico.',tiers:[
      [{id:'dAtk',name:'Luz de las Estrellas',desc:'+5% daño mágico por rango.',max:3,stat:'atkM',val:0.05}],
      [{id:'dCrit',name:'Alineación Celeste',desc:'+3% crítico por rango.',max:3,stat:'crit',val:3}],
      [{id:'dStar',name:'Fuego Astral',desc:'+6% daño por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'dSolar',name:'Fuerza Solar',desc:'+5% crítico por rango.',max:3,stat:'crit',val:5}],
      [{id:'dMaster',name:'Eclipse Cósmico',desc:'Aumenta tu daño mágico un +25% permanente.',max:1,stat:'atkM',val:0.25}]
    ]},
    {name:'Feral',desc:'Zarpazos, ferocidad animal y velocidad felina.',tiers:[
      [{id:'dBleed',name:'Garras Lacerantes',desc:'+6% daño cuerpo a cuerpo por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'dSpd',name:'Presteza Felina',desc:'+6% velocidad de movimiento por rango.',max:3,stat:'spdM',val:0.06}],
      [{id:'dPred',name:'Depredador del Bosque',desc:'+4% crítico por rango.',max:3,stat:'crit',val:4}],
      [{id:'dRip',name:'Desgarro Feroz',desc:'+8% daño de ataque por rango.',max:3,stat:'atkM',val:0.08}],
      [{id:'dMaster2',name:'Instinto Primitivo',desc:'Aumenta tu daño un +25% y velocidad un +20% permanente.',max:1,stat:'atkM',val:0.25}]
    ]},
    {name:'Restauración',desc:'Raíces curativas, savia milenaria y renacimiento.',tiers:[
      [{id:'dHeal',name:'Savia Viva',desc:'+6% daño y curación por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'dHp',name:'Raíces Profundas',desc:'+6% vida máxima por rango.',max:3,stat:'hpM',val:0.06}],
      [{id:'dGift',name:'Don de la Naturaleza',desc:'+5% vida máxima por rango.',max:3,stat:'hpM',val:0.05}],
      [{id:'dBark',name:'Corteza Milenaria',desc:'+8% armadura por rango.',max:3,stat:'armM',val:0.08}],
      [{id:'dMaster3',name:'Árbol de la Vida',desc:'Aumenta tu vida un +20% y armadura un +20% permanente.',max:1,stat:'hpM',val:0.20}]
    ]}
  ],
  dk:[
    {name:'Sangre',desc:'Presencia vampírica, mitigación de daño y regeneración.',tiers:[
      [{id:'dkVamp',name:'Golpe Vampírico',desc:'+5% daño y +4% vida por rango.',max:3,stat:'hpM',val:0.04}],
      [{id:'dkBone',name:'Blindaje de Hueso',desc:'+10% armadura por rango.',max:3,stat:'armM',val:0.10}],
      [{id:'dkFort',name:'Fortitud Impía',desc:'+6% vida máxima por rango.',max:3,stat:'hpM',val:0.06}],
      [{id:'dkBoil',name:'Sangre Hirviente',desc:'+7% poder de ataque por rango.',max:3,stat:'atkM',val:0.07}],
      [{id:'dkBloodMaster',name:'Señor de la Sangre',desc:'Aumenta tu vida máxima un +25% y armadura un +20% permanente.',max:1,stat:'hpM',val:0.25}]
    ]},
    {name:'Escarcha',desc:'Frialdad glacial, críticos helados y ráfagas despiadadas.',tiers:[
      [{id:'dkHeart',name:'Corazón Helado',desc:'+4% crítico por rango.',max:3,stat:'crit',val:4}],
      [{id:'dkBlade',name:'Filo Glacial',desc:'+6% daño de escarcha por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'dkWind',name:'Viento Gélido',desc:'+5% velocidad de movimiento por rango.',max:3,stat:'spdM',val:0.05}],
      [{id:'dkShatter',name:'Hielo Quebrantador',desc:'+5% golpe crítico adicional por rango.',max:3,stat:'crit',val:5}],
      [{id:'dkFrostMaster',name:'Furia del Rey Exánime',desc:'Aumenta tu daño de escarcha un +25% permanente.',max:1,stat:'atkM',val:0.25}]
    ]},
    {name:'Profano',desc:'Plagas pútridas, siervos de ultratumba y daño sombrío.',tiers:[
      [{id:'dkPlague',name:'Portador de la Peste',desc:'+6% daño de sombras por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'dkNecro',name:'Nigromancia Rúnica',desc:'+4% crítico por rango.',max:3,stat:'crit',val:4}],
      [{id:'dkBlack',name:'Plaga Negra',desc:'+6% daño de ataque por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'dkArmy',name:'Ejército de Ultratumba',desc:'+8% poder de ataque por rango.',max:3,stat:'atkM',val:0.08}],
      [{id:'dkUnholyMaster',name:'Jinete del Apocalipsis',desc:'Aumenta tu daño un +25% y velocidad un +15% permanente.',max:1,stat:'atkM',val:0.25}]
    ]}
  ],
  shaman:[
    {name:'Elemental',desc:'Furia de rayos, llamaradas de lava y sobrecarga elemental.',tiers:[
      [{id:'shThunder',name:'Furia del Trueno',desc:'+5% daño mágico elemental por rango.',max:3,stat:'atkM',val:0.05}],
      [{id:'shSpark',name:'Chispa de Relámpago',desc:'+4% golpe crítico por rango.',max:3,stat:'crit',val:4}],
      [{id:'shLava',name:'Corriente Ígnea',desc:'+6% daño por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'shOverload',name:'Sobrecarga Ancestral',desc:'+5% crítico adicional por rango.',max:3,stat:'crit',val:5}],
      [{id:'shEleMaster',name:'Cataclismo Elemental',desc:'Aumenta tu daño elemental un +25% permanente.',max:1,stat:'atkM',val:0.25}]
    ]},
    {name:'Mejora',desc:'Armas imbuidas de tormenta, viento furioso y ferocidad.',tiers:[
      [{id:'shStorm',name:'Golpe de Tormenta',desc:'+6% daño cuerpo a cuerpo por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'shAir',name:'Gracia del Aire',desc:'+6% velocidad de movimiento por rango.',max:3,stat:'spdM',val:0.06}],
      [{id:'shWindfury',name:'Viento Furioso Mejorado',desc:'+4% crítico por rango.',max:3,stat:'crit',val:4}],
      [{id:'shTelluric',name:'Fuerza Telúrica',desc:'+8% daño de ataque por rango.',max:3,stat:'atkM',val:0.08}],
      [{id:'shEnhMaster',name:'Espíritu del Lobo Salvaje',desc:'Aumenta tu daño un +25% y velocidad un +20% permanente.',max:1,stat:'atkM',val:0.25}]
    ]},
    {name:'Restauración',desc:'Aguas sanadoras ancestrales, tótems y renacer espiritual.',tiers:[
      [{id:'shWater',name:'Aguas Purificadoras',desc:'+6% daño sagrado y curaciones por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'shTotem',name:'Tótem de Vida',desc:'+5% vida máxima por rango.',max:3,stat:'hpM',val:0.05}],
      [{id:'shTide',name:'Vínculo de Marea',desc:'+5% vida máxima por rango.',max:3,stat:'hpM',val:0.05}],
      [{id:'shAnces',name:'Don de los Ancestros',desc:'+8% armadura por rango.',max:3,stat:'armM',val:0.08}],
      [{id:'shRestoMaster',name:'Bendición de la Lluvia',desc:'Aumenta tu vida máxima un +20% y armadura un +20% permanente.',max:1,stat:'hpM',val:0.20}]
    ]}
  ]
};

function totalTalentPoints(){
  if(!P)return 0;
  return Math.max(0, P.level - 2);
}
function spentTalentPoints(){
  if(!P||!P.talents)return 0;
  let s=0;for(const k in P.talents)s+=P.talents[k]||0;
  return s;
}
function freeTalentPoints(){
  return Math.max(0, totalTalentPoints() - spentTalentPoints());
}
function applyTalentEffects(){
  if(!P||!P.talents)return;
  const trees=TALENTS_DATA[P.cls]||[];
  let atkBonus=0,hpBonus=0,critBonus=0,armBonus=0,spdBonus=0;
  for(let b=0;b<trees.length;b++){
    for(let tr=0;tr<trees[b].tiers.length;tr++){
      const node=trees[b].tiers[tr][0];
      const rk=P.talents[node.id]||0;
      if(rk>0){
        if(node.stat==='atkM')atkBonus+=node.val*rk;
        if(node.stat==='hpM')hpBonus+=node.val*rk;
        if(node.stat==='crit')critBonus+=node.val*rk;
        if(node.stat==='armM')armBonus+=node.val*rk;
        if(node.stat==='spdM')spdBonus+=node.val*rk;
      }
    }
  }
  P.atk*=(1+atkBonus);
  P.maxhp=Math.round(P.maxhp*(1+hpBonus));
  P.crit+=critBonus;
  P.armor=Math.round(P.armor*(1+armBonus));
}

function renderTalentUI(){
  const pnl=$('pTalents');if(!pnl||pnl.hidden)return;
  $('talPointsTxt').textContent='Puntos disponibles: '+freeTalentPoints()+' ('+spentTalentPoints()+'/'+totalTalentPoints()+' gastados)';
  const trees=TALENTS_DATA[P.cls]||TALENTS_DATA.war;
  const cEl=$('talTrees');cEl.innerHTML='';
  P.talents=P.talents||{};
  
  trees.forEach((br,bIdx)=>{
    const bDiv=document.createElement('div');bDiv.className='tal-branch';
    bDiv.innerHTML='<div class="tal-bname">'+esc(br.name)+'</div><div style="font-size:11px;color:var(--muted);text-align:center">'+esc(br.desc)+'</div>';
    br.tiers.forEach((tier,tIdx)=>{
      const tDiv=document.createElement('div');tDiv.className='tal-tier';
      tier.forEach(node=>{
        const rk=P.talents[node.id]||0;
        const nBtn=document.createElement('button');
        nBtn.className='tal-node'+(rk>0?' learned':'')+(rk===node.max?' max':'')+(tIdx>0&&(P.talents[br.tiers[tIdx-1][0].id]||0)<1?' locked':'');
        nBtn.innerHTML=svg(tIdx===2?'crown':tIdx===1?'shield':'strike',rk===node.max?'#5cff8a':rk>0?'#f4cf5b':'#8a7050')+
          '<span class="rk">'+rk+'/'+node.max+'</span>';
        nBtn.title=node.name+' ('+rk+'/'+node.max+'): '+node.desc;
        nBtn.onclick=()=>{
          if(freeTalentPoints()<=0){toast('No te quedan puntos de talentos');return}
          if(tIdx>0&&(P.talents[br.tiers[tIdx-1][0].id]||0)<1){toast('Desbloquea el rango anterior');return}
          if(rk>=node.max){toast('Talento al máximo');return}
          P.talents[node.id]=(P.talents[node.id]||0)+1;
          sfx('buff');recalc();refreshUI();renderTalentUI();
          toast('+1 a '+node.name);
        };
        tDiv.appendChild(nBtn);
      });
      bDiv.appendChild(tDiv);
    });
    cEl.appendChild(bDiv);
  });
}
function respecTalents(){
  P.talents={};
  recalc();refreshUI();renderTalentUI();
  toast('Talentos restablecidos con éxito');
  sfx('buff');
}

/* ---------- 5. ESTABLO DE MONTURAS CON PERKS Y PASIVAS ÚNICAS ---------- */
const MOUNTS={
  horse:{id:'horse',name:'Caballo de Guerra',speed:275,price:25,ic:'horse',col:'#8a5a32',perk:'+25% Armadura Física',desc:'El leal corcel de guardia. Otorga +25% de armadura física al jinete.'},
  wolf:{id:'wolf',name:'Lobo Huargo Sombrío',speed:300,price:40,ic:'wolf',col:'#6a748c',perk:'+8% Probabilidad Crítica',desc:'Depredador ártico. Aumenta tu probabilidad de golpe crítico un +8%.'},
  tiger:{id:'tiger',name:'Tigre Dientes de Sable',speed:320,price:50,ic:'strike',col:'#d98a2a',perk:'+12% Poder de Ataque',desc:'Feroz carnívoro. Aumenta tu poder de ataque un +12%.'},
  ram:{id:'ram',name:'Carnero de las Cumbres',speed:290,price:35,ic:'shield',col:'#d0dde8',perk:'+15% Reducción de Daño',desc:'Bestia montañesa. Reduce el daño recibido un 15%.'},
  drake:{id:'drake',name:'Draco del Alba',speed:345,price:70,ic:'wing',col:'#ff6a3a',perk:'Vuelo sin colisión aérea',desc:'Draco alado que planea veloz sobre aguas y terrenos escarpados.',flying:true},
  mech:{id:'mech',name:'Zancudo de Vapor',speed:315,price:60,ic:'crown',col:'#c89838',perk:'+25% Velocidad y Escudo',desc:'Ingeniería enana impulsada por vapor con escudo cinético.'},
  unicorn:{id:'unicorn',name:'Unicornio Astral',speed:330,price:65,ic:'star',col:'#d0f4ff',perk:'Regeneración y Caminata Acuática',desc:'Regenera 3% vida/maná por segundo continuamente y camina sobre el agua.'},
  wyvern_mount:{id:'wyvern_mount',name:'Draco de Obsidiana',speed:350,price:80,ic:'wing',col:'#8034a0',perk:'Vuelo Ígneo Máximo (+20% ataque)',desc:'Reptil alado del cráter de Ignis. Vuela e incrementa ataque un +20%.',flying:true},
  stag:{id:'stag',name:'Ciervo Celestial',speed:310,price:45,ic:'leaf',col:'#7ad08a',perk:'Recolección montado (+50% botín)',desc:'Espíritu del bosque. Permite recolectar plantas y minerales sin desmontar y otorga +50% botín.'},
  bear:{id:'bear',name:'Oso Acorazado de Batalla',speed:285,price:55,ic:'shield',col:'#5a3a1e',perk:'+20% Vida Máxima Titánica',desc:'Imponente oso blindado. Aumenta tu vida máxima un +20%.'},
  steed:{id:'steed',name:'Destrero del Ocaso',speed:325,price:75,ic:'rune',col:'#38bdf8',perk:'Aura de Sombra (debilita enemigos)',desc:'Corcel espectral de los Caballeros de la Muerte. Su presencia drena enemigos.'}
};

function renderMountsUI(){
  const g=$('mountGrid');if(!g)return;
  g.innerHTML='';
  P.mounts=P.mounts||['horse'];
  P.mount=P.mount||'horse';

  for(const k in MOUNTS){
    const m=MOUNTS[k],owned=P.mounts.indexOf(k)>=0,active=P.mount===k,cost=m.price||40;
    const card=document.createElement('div');
    card.className='mount-card'+(active?' active':'');
    card.innerHTML='<div class="mount-ic">'+svg(m.ic,m.col)+'</div>'+
      '<b>'+esc(m.name)+'</b>'+
      '<div style="color:#5cff8a;font-weight:700;font-size:11px;margin:2px 0">Beneficio: '+esc(m.perk||'Velocidad')+'</div>'+
      '<span>Velocidad: +'+Math.round((m.speed/150-1)*100)+'% ('+m.speed+')</span>'+
      '<div style="font-size:11px;color:var(--muted)">'+esc(m.desc)+'</div>'+
      (owned?(active?'<span style="color:#5cff8a;font-weight:700">✓ ACTIVA</span>':'<button class="btn sm" style="margin-top:4px">Seleccionar</button>'):
             '<button class="btn sm sec" style="margin-top:4px">Desbloquear ('+cost+' oro)</button>');
    card.onclick=()=>{
      if(owned){
        P.mount=k;toast('Montura activa: '+m.name);
        sfx('equip');recalc();refreshUI();renderMountsUI();
      }else if(P.gold>=cost){
        P.gold-=cost;P.mounts.push(k);P.mount=k;
        toast('¡Has desbloqueado '+m.name+'!');
        sfx('coin');recalc();refreshUI();renderMountsUI();
      }else{
        toast('Necesitas '+cost+' de oro para desbloquear');
      }
    };
    g.appendChild(card);
  }
}

mountSpeed=function(){
  const mId=P&&P.mount||'horse';
  const m=MOUNTS[mId]||MOUNTS.horse;
  let spd=m.speed;
  // Bono de hermandad
  if(P&&P.guild)spd=Math.round(spd*1.12);
  return spd;
};

// Renderizado de diferentes modelos de montura
const _drawHorse=drawHorse;
drawHorse=function(g,t,mv,fast){
  const mId=(P&&P.mounted&&P.mount)||'horse';
  const ph=mv?t*(fast?16:12):0;
  
  if(mId==='wolf'){
    // LOBO HUARGO
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,1,18,5,0,0,6.283);g.fill();
    const wc1='#4f5564',wc2='#343a47';
    // Patas traseras y delanteras
    const leg=(x,s,col)=>{
      const a=Math.sin(ph+s)*(mv?7:0),l=Math.max(0,Math.cos(ph+s))*(mv?3:0);
      lim(g,x,-12,x+a,-5-l,3.5,col);lim(g,x+a,-5-l,x+a*1.2,-0.5-l*0.4,2.8,col);
      rr(g,x+a*1.2-2,-2-l*0.4,4,2.5,1,'#181a20');
    };
    leg(-10,0,wc2);leg(10,Math.PI,wc2);
    // Cola peluda
    g.strokeStyle=wc1;g.lineWidth=4.5;g.beginPath();g.moveTo(-14,-16);g.quadraticCurveTo(-22,-12+Math.sin(ph)*3,-24,-2);g.stroke();
    // Cuerpo alargado
    g.fillStyle=wc1;g.beginPath();g.ellipse(0,-16,16,7,0,0,6.283);g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    // Cabeza y hocico de lobo
    poly(g,[10,-18,18,-28,26,-26,20,-14],wc1);
    poly(g,[16,-28,28,-26,30,-20,22,-18],wc1);
    // Orejas puntiagudas
    poly(g,[16,-28,17,-35,21,-28],wc2);
    // Ojos brillantes
    disc(g,24,-24,1.4,'#4ae0ff',false);
    leg(-7,Math.PI,wc1);leg(12,0,wc1);
  } else if(mId==='tiger'){
    // TIGRE DIENTES DE SABLE
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,1,19,5.5,0,0,6.283);g.fill();
    const tc1='#d9882a',tc2='#9c5a14';
    const leg=(x,s,col)=>{
      const a=Math.sin(ph+s)*(mv?6.5:0),l=Math.max(0,Math.cos(ph+s))*(mv?3:0);
      lim(g,x,-12,x+a,-5-l,4,col);lim(g,x+a,-5-l,x+a*1.2,-0.5-l*0.4,3.2,col);
      rr(g,x+a*1.2-2,-2-l*0.4,4.2,2.5,1,'#1a1005');
    };
    leg(-10,0,tc2);leg(10,Math.PI,tc2);
    g.strokeStyle=tc1;g.lineWidth=3.8;g.beginPath();g.moveTo(-14,-16);g.quadraticCurveTo(-24,-18+Math.sin(ph)*2,-22,-6);g.stroke();
    g.fillStyle=tc1;g.beginPath();g.ellipse(0,-16,17,7.5,0,0,6.283);g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    // Rayas de tigre
    g.strokeStyle='rgba(0,0,0,0.4)';g.lineWidth=1.5;
    g.beginPath();g.moveTo(-6,-20);g.lineTo(-4,-12);g.moveTo(0,-20);g.lineTo(2,-12);g.moveTo(6,-20);g.lineTo(8,-12);g.stroke();
    // Cabeza de felino
    poly(g,[10,-18,17,-28,26,-26,20,-14],tc1);
    disc(g,23,-22,5,tc1);
    // Colmillo de sable
    g.strokeStyle='#fff';g.lineWidth=1.5;g.beginPath();g.moveTo(25,-20);g.lineTo(26,-13);g.stroke();
    disc(g,23,-24,1.3,'#ffe040',false);
    leg(-7,Math.PI,tc1);leg(12,0,tc1);
  } else if(mId==='drake'){
    // DRACO DEL ALBA (ALADO)
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,1,16,5,0,0,6.283);g.fill();
    const dc1='#d94a28',dc2='#8a2410';
    // Cuerpo dracónico
    g.fillStyle=dc1;g.beginPath();g.ellipse(0,-16,15,7,0,0,6.283);g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    // Cola con aleta
    g.strokeStyle=dc2;g.lineWidth=4;g.beginPath();g.moveTo(-14,-15);g.quadraticCurveTo(-24,-12+Math.sin(ph)*3,-26,-18);g.stroke();
    // Alas que baten suavemente
    const wFlap=Math.sin(t*8)*12;
    poly(g,[ -4,-20, 8,-36+wFlap, 18,-20 ], '#ff804a');
    g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    // Cabeza con cuernos
    poly(g,[10,-18,20,-28,26,-22,18,-15],dc1);
    g.strokeStyle='#ffcf40';g.lineWidth=2;g.beginPath();g.moveTo(18,-28);g.lineTo(14,-36);g.stroke();
    disc(g,22,-24,1.4,'#ffe840',false);
    // Pezuñas
    lim(g,-8,-12,-8,-2,3,dc2);lim(g,8,-12,8,-2,3,dc2);
  } else if(mId==='ram'){
    // CARNERO DE LAS CUMBRES
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,1,18,5,0,0,6.283);g.fill();
    const rc1='#d8e4ee',rc2='#a8b8c8';
    lim(g,-9,-12,-9,-2,3.5,'#3a3a40');lim(g,9,-12,9,-2,3.5,'#3a3a40');
    g.fillStyle=rc1;g.beginPath();g.ellipse(0,-16,16,8.5,0,0,6.283);g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    // Cuernos enroscados
    poly(g,[10,-18,18,-26,24,-22,18,-14],rc2);
    g.strokeStyle='#8a6a40';g.lineWidth=3;g.beginPath();g.arc(17,-22,6,Math.PI*0.3,Math.PI*1.8);g.stroke();
    disc(g,20,-22,1.3,'#222',false);
    lim(g,-6,-12,-6,-2,3.5,'#3a3a40');lim(g,11,-12,11,-2,3.5,'#3a3a40');
  } else if(mId==='mech'){
    // ZANCUDO MECÁNICO
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,1,17,5,0,0,6.283);g.fill();
    const mc1='#c89838',mc2='#5a4a2a';
    lim(g,-8,-13,-10,-2,3,'#777');lim(g,10,-13,12,-2,3,'#777');
    g.fillStyle=mc1;g.beginPath();g.roundRect(-14,-22,28,13,3);g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    // Chimenea con vapor
    g.fillStyle='#444';g.fillRect(-10,-28,4,8);
    blob(g,-8+Math.sin(t*10)*2,-32,2.5,'rgba(255,255,255,0.6)');
    // Faro delantero
    disc(g,14,-16,3,'#ffe860');
    lim(g,-5,-13,-6,-2,3.2,'#888');lim(g,12,-13,13,-2,3.2,'#888');
  } else if(mId==='unicorn'){
    // UNICORNIO ASTRAL
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,1,18,5,0,0,6.283);g.fill();
    const uc='#f5f8ff',um='#e0c8ff';
    lim(g,-8,-12,-8,-2,3.2,'#d0e0ff');lim(g,8,-12,8,-2,3.2,'#d0e0ff');
    g.fillStyle=uc;g.beginPath();g.ellipse(0,-16,16,7,0,0,6.283);g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    g.strokeStyle=um;g.lineWidth=3;g.beginPath();g.moveTo(6,-26);g.lineTo(1,-15);g.stroke();
    g.strokeStyle='#ffe860';g.lineWidth=2.2;g.beginPath();g.moveTo(22,-27);g.lineTo(30,-36);g.stroke();
    disc(g,30,-36,2,'#fff',false);
    poly(g,[10,-18,18,-27,24,-24,18,-15],uc);
    disc(g,20,-24,1.3,'#80a0ff',false);
    lim(g,-6,-12,-6,-2,3.2,'#d0e0ff');lim(g,10,-12,10,-2,3.2,'#d0e0ff');
  } else if(mId==='wyvern_mount'){
    // DRACO DE OBSIDIANA
    g.fillStyle='rgba(0,0,0,0.35)';g.beginPath();g.ellipse(0,1,18,5.5,0,0,6.283);g.fill();
    const wc='#281430',wg='#8a30a0';
    g.fillStyle=wc;g.beginPath();g.ellipse(0,-16,16,7,0,0,6.283);g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    const wFlap=Math.sin(t*8.5)*13;
    poly(g,[ -5,-20, 8,-38+wFlap, 20,-20 ], wg);
    g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    poly(g,[10,-18,20,-28,26,-22,18,-15],wc);
    g.strokeStyle='#ff44aa';g.lineWidth=2;g.beginPath();g.moveTo(18,-28);g.lineTo(13,-36);g.stroke();
    disc(g,22,-24,1.4,'#ff44aa',false);
    lim(g,-8,-12,-8,-2,3.2,'#1a0c20');lim(g,8,-12,8,-2,3.2,'#1a0c20');
  } else if(mId==='stag'){
    // CIERVO CELESTIAL
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,1,18,5,0,0,6.283);g.fill();
    const sc='#5a8050',sg='#a0f0a0';
    lim(g,-8,-12,-8,-2,3,'#3a5430');lim(g,8,-12,8,-2,3,'#3a5430');
    g.fillStyle=sc;g.beginPath();g.ellipse(0,-16,15,6.5,0,0,6.283);g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    g.strokeStyle=sg;g.lineWidth=2;g.beginPath();
    g.moveTo(18,-27);g.lineTo(15,-38);g.lineTo(11,-35);g.moveTo(15,-38);g.lineTo(20,-42);
    g.stroke();
    poly(g,[10,-18,18,-27,24,-24,18,-15],sc);
    disc(g,20,-24,1.3,'#b0ffb0',false);
    lim(g,-6,-12,-6,-2,3,'#3a5430');lim(g,10,-12,10,-2,3,'#3a5430');
  } else {
    // Caballo tradicional
    _drawHorse(g,t,mv,fast);
  }
};

/* ---------- 6. TECLAS PERSONALIZABLES CON CTRL Y SHIFT ---------- */
const DEFAULT_BINDS={
  '1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9','10':'0','11':'-','12':'=',
  'q':'q','r':'r','t':'t','e':'e',
  'dodge':' ','target':'Tab','interact':'f','loot':'z','mount':'h',
  'map':'m','inv':'b','char':'c','talents':'n','quests':'l','guild':'g','opts':'o',
  'spells':'p','craft':'k'
};
let KEYBINDS={};
try{KEYBINDS=Object.assign({},DEFAULT_BINDS,JSON.parse(localStorage.getItem('astra_binds_v3'))||{})}catch(_){KEYBINDS=Object.assign({},DEFAULT_BINDS)}

function saveBinds(){
  try{localStorage.setItem('astra_binds_v3',JSON.stringify(KEYBINDS))}catch(_){}
}

function comboFromEvent(e){
  let key=e.key;
  if(['Control','Shift','Alt','Meta'].indexOf(key)>=0)return '';
  let str='';
  if(e.ctrlKey)str+='Ctrl+';
  if(e.shiftKey)str+='Shift+';
  if(e.altKey)str+='Alt+';
  str+=(key===' '?'Espacio':key.length===1?key.toLowerCase():key);
  return str;
}
function prettyCombo(c){
  if(!c)return '';
  return c.replace('Ctrl+','C-').replace('Shift+','S-').replace('Alt+','A-').toUpperCase();
}

const ACTION_DEFS=[
  {id:'1',label:'Habilidad 1'},{id:'2',label:'Habilidad 2'},{id:'3',label:'Habilidad 3'},
  {id:'4',label:'Habilidad 4'},{id:'5',label:'Habilidad 5'},{id:'6',label:'Habilidad 6'},
  {id:'7',label:'Habilidad 7'},{id:'8',label:'Habilidad 8'},{id:'9',label:'Habilidad 9'},
  {id:'10',label:'Habilidad 10'},{id:'11',label:'Habilidad 11'},{id:'12',label:'Habilidad 12'},
  {id:'q',label:'Ranura Rápida 1 (Q)'},{id:'r',label:'Ranura Rápida 2 (R)'},{id:'t',label:'Ranura Rápida 3 (T)'},
  {id:'dodge',label:'Esquivar (Espacio)'},{id:'target',label:'Cambiar Objetivo (Tab)'},
  {id:'interact',label:'Interactuar (F)'},{id:'loot',label:'Saquear botín (Z)'},
  {id:'mount',label:'Subir a Montura (H)'},{id:'talents',label:'Talentos (N)'},
  {id:'guild',label:'Hermandad (G)'},{id:'spells',label:'Libro Habilidades (P)'},
  {id:'craft',label:'Fabricación (K)'},{id:'inv',label:'Mochila (B)'},
  {id:'char',label:'Personaje (C)'},{id:'quests',label:'Misiones (L)'},{id:'map',label:'Mapa (M)'}
];

function openKeysModal(){
  let m=$('keysModal');
  if(!m){
    m=document.createElement('div');m.id='keysModal';
    m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9999;display:grid;place-items:center;padding:12px;backdrop-filter:blur(4px)';
    document.body.appendChild(m);
  }
  const draw=()=>{
    m.innerHTML='<div style="background:#181109;border:1px solid #7a5a2e;border-radius:8px;padding:16px;max-width:520px;width:100%;max-height:86vh;overflow-y:auto;color:#f0e2ba;font:13px var(--f-ui)">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #5a4020;padding-bottom:8px;margin-bottom:12px"><b style="font-family:var(--f-display);color:var(--gold);font-size:16px">CONFIGURACIÓN DE TECLAS Y COMBINACIONES</b><button id="kmClose" style="background:none;border:0;color:#aaa;font-size:22px;cursor:pointer">×</button></div>'+
      '<p style="color:var(--muted);font-size:12px;margin:0 0 10px">Haz clic en cualquier acción y presiona la tecla deseada. ¡Soporta combinaciones como <b>Ctrl+1</b> o <b>Shift+Q</b>!</p>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 12px">'+
      ACTION_DEFS.map(a=>'<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px dotted #3d2f1b"><span>'+esc(a.label)+'</span><button class="btn sm" data-act="'+a.id+'" style="min-width:70px">'+esc(prettyCombo(KEYBINDS[a.id]))+'</button></div>').join('')+
      '</div>'+
      '<div style="margin-top:14px;display:flex;gap:10px;justify-content:space-between"><button class="btn sm sec" id="kmReset">Restablecer valores por defecto</button><button class="btn sm" id="kmSave">Guardar y Cerrar</button></div></div>';
    
    m.querySelector('#kmClose').onclick=()=>{m.remove();updateActionKeyBadges()};
    m.querySelector('#kmSave').onclick=()=>{m.remove();updateActionKeyBadges()};
    m.querySelector('#kmReset').onclick=()=>{KEYBINDS=Object.assign({},DEFAULT_BINDS);saveBinds();draw();updateActionKeyBadges()};
    
    m.querySelectorAll('[data-act]').forEach(b=>{
      b.onclick=()=>{
        b.textContent='Pulsa combo...';b.style.borderColor='var(--gold)';
        const handler=e=>{
          e.preventDefault();e.stopPropagation();
          const combo=comboFromEvent(e);
          if(!combo)return;
          window.removeEventListener('keydown',handler,true);
          KEYBINDS[b.dataset.act]=combo;
          saveBinds();draw();updateActionKeyBadges();
        };
        window.addEventListener('keydown',handler,true);
      };
    });
  };
  draw();
}

function updateActionKeyBadges(){
  if(AB&&AB.length){
    AB.forEach((s,i)=>{
      const badge=s.el.querySelector('.k');
      if(badge){
        const actId=String(i+1);
        if(KEYBINDS[actId])badge.textContent=prettyCombo(KEYBINDS[actId]);
      }
    });
  }
}

/* ---------- 7. SISTEMA DE GRUPOS (PARTY) ---------- */
const PARTY={
  members:[],
  inParty(){return this.members.length>0},
  isLeader(){return this.members.length>0&&this.members[0].id===P.charId}
};

function partyInvite(targetName){
  if(!targetName||targetName===P.name){toast('Objetivo inválido');return}
  if(PARTY.members.length>=4){toast('El grupo está lleno (máx 4)');return}
  if(!PARTY.inParty()){
    PARTY.members.push({id:P.charId,name:P.name,cls:P.cls,level:P.level,hp:P.hp,maxhp:P.maxhp,res:P.res,maxres:P.maxres,isLeader:true});
  }
  // Buscar bot o jugador
  const ent=G.bots.find(b=>b.name.toLowerCase()===targetName.toLowerCase());
  if(ent){
    if(PARTY.members.some(m=>m.name===ent.name)){toast(ent.name+' ya está en el grupo');return}
    PARTY.members.push({id:ent.id||uid(),name:ent.name,cls:ent.cls,level:ent.level,hp:ent.hp||100,maxhp:ent.maxhp||100,res:100,maxres:100,isBot:true});
    toast('¡'+ent.name+' se ha unido a tu grupo!');
    log('<span style="color:#5cd0ff"><b>[Grupo]</b> '+esc(ent.name)+' se une al grupo.</span>','party');
    sfx('buff');
    renderPartyFrame();
  } else {
    // Multijugador real
    BE.rt.chat({id:P.charId,n:P.name,b:'/pinvite '+targetName});
    toast('Invitación enviada a '+targetName);
  }
}
function partyLeave(){
  if(!PARTY.inParty())return;
  PARTY.members=[];
  toast('Has abandonado el grupo');
  renderPartyFrame();
}
function renderPartyFrame(){
  const f=$('partyFrame');if(!f)return;
  f.innerHTML='';
  if(!PARTY.inParty())return;
  PARTY.members.forEach((m,idx)=>{
    if(m.id===P.charId)return; // El jugador ya tiene su marco arriba
    const el=document.createElement('div');el.className='pmem';
    el.innerHTML='<div class="pmem-port">'+svg(CLS[m.cls]?CLS[m.cls].icon:'shield',CLS[m.cls]?CLS[m.cls].color:'#7fd0ff')+'</div>'+
      '<div class="pmem-body">'+
      '<div class="pmem-name"><span>'+esc(m.name)+'</span><span style="color:var(--gold)">'+m.level+'</span></div>'+
      '<div class="pmem-hp"><i style="width:'+Math.round((m.hp||1)/(m.maxhp||1)*100)+'%"></i></div>'+
      '<div class="pmem-mana"><i style="width:100%"></i></div>'+
      '</div>';
    el.onclick=()=>{
      const b=G.bots.find(x=>x.name===m.name);
      if(b)P.target=b;
    };
    f.appendChild(el);
  });
}

/* ---------- 8. SUSURROS (WHISPERS) ---------- */
let LAST_WHISPER_SENDER='';
function openWhisper(name){
  $('chat').classList.add('open');
  const inp=$('chatIn');
  inp.value='/w '+name+' ';
  inp.focus();
}
function sendWhisper(targetName,msg){
  log('<span style="color:#ff7ae8"><b>[Para '+esc(targetName)+']:</b> '+esc(msg)+'</span>','whisper');
  sfx('buff');
  const bot=G.bots.find(b=>b.name.toLowerCase()===targetName.toLowerCase());
  if(bot){
    setTimeout(()=>{
      LAST_WHISPER_SENDER=bot.name;
      const resp=['¡Saludos, viajero! Cuenta con mi acero.','¿Nos vemos en Bastión de Piedra?','Buena caza en Astra.','¡Por la gloria de nuestra orden!'][Math.floor(Math.random()*4)];
      log('<span style="color:#ff7ae8"><b>[De '+esc(bot.name)+']:</b> '+esc(resp)+'</span>','whisper');
      sfx('coin');
    },700);
  } else {
    BE.rt.chat({id:P.charId,n:P.name,b:'/whisper_to '+targetName+' '+msg});
  }
}

/* ---------- 9. DUELOS (DUELS PVP) ---------- */
let ACTIVE_DUEL=null;
function startDuel(target){
  if(!target||target.dead){toast('Objetivo no válido para duelo');return}
  if(ACTIVE_DUEL){toast('Ya hay un duelo en curso');return}
  toast('¡Desafío de duelo a '+target.name+'!');
  log('<span style="color:#ff5544"><b>[Duelo]</b> Desafías a '+esc(target.name)+' a un duelo.</span>','cmb');
  let countdown=3;
  float(P.x,P.y-30,'Duelo en 3...','#ffcc00',20);
  sfx('hit');
  const intv=setInterval(()=>{
    countdown--;
    if(countdown>0){
      float(P.x,P.y-30,'Duelo en '+countdown+'...','#ffcc00',20);
      sfx('hit');
    }else{
      clearInterval(intv);
      float(P.x,P.y-30,'¡A LUCHAR!','#ff4433',24);
      sfx('boom');
      ACTIVE_DUEL={
        target:target,
        origin:{x:P.x,y:P.y},
        time:0,
        r:180
      };
      G.duelRing={x:P.x,y:P.y,r:180};
    }
  },1000);
}
function endDuel(winnerName,loserName){
  if(!ACTIVE_DUEL)return;
  ACTIVE_DUEL=null;
  G.duelRing=null;
  banner('¡VICTORIA EN DUELO!','Ganador: '+winnerName);
  log('<span style="color:#ffd700"><b>[Duelo]</b> ¡'+esc(winnerName)+' ha vencido a '+esc(loserName)+' en duelo honorable!</span>','sys');
  burst(P.x,P.y-20,'#ffe066',30,220);
  sfx('level');
}

/* ---------- 10. COMERCIO (TRADE) ---------- */
let TRADE_SESSION=null;
function startTrade(target){
  if(!target||target.dead){toast('Objetivo inválido para comerciar');return}
  TRADE_SESSION={
    target:target,
    myItems:[],
    myGold:0,
    myLocked:false,
    otherItems:[],
    otherGold:0,
    otherLocked:false
  };
  $('pTrade').hidden=false;
  $('tradeOtherName').textContent='Oferta de '+target.name;
  renderTradeUI();
}
function renderTradeUI(){
  if(!TRADE_SESSION)return;
  const mySlots=$('tradeMySlots');mySlots.innerHTML='';
  for(let i=0;i<4;i++){
    const it=TRADE_SESSION.myItems[i];
    const b=document.createElement('div');b.className='it';
    b.innerHTML=it?itemIcon(it):'';
    b.onclick=()=>{
      if(TRADE_SESSION.myLocked)return;
      if(it){TRADE_SESSION.myItems.splice(i,1);renderTradeUI()}
    };
    mySlots.appendChild(b);
  }
  const otSlots=$('tradeOtherSlots');otSlots.innerHTML='';
  for(let i=0;i<4;i++){
    const it=TRADE_SESSION.otherItems[i];
    const b=document.createElement('div');b.className='it';
    b.innerHTML=it?itemIcon(it):'';
    otSlots.appendChild(b);
  }
  $('tradeMyStatus').textContent=TRADE_SESSION.myLocked?'✓ Oferta Bloqueada':'Esperando cambios...';
  $('tradeMyStatus').className='trade-status'+(TRADE_SESSION.myLocked?' ready':'');
  $('tradeOtherStatus').textContent=TRADE_SESSION.otherLocked?'✓ Oferta Bloqueada':'Esperando cambios...';
  $('tradeOtherStatus').className='trade-status'+(TRADE_SESSION.otherLocked?' ready':'');
  $('btnTradeAccept').disabled=!(TRADE_SESSION.myLocked&&TRADE_SESSION.otherLocked);
}

function bindTradeButtons(){
  if($('btnTradeLock')) $('btnTradeLock').onclick=()=>{
    if(!TRADE_SESSION)return;
    TRADE_SESSION.myGold=Math.min(P.gold,Math.max(0,+($('tradeMyGold').value||0)));
    TRADE_SESSION.myLocked=!TRADE_SESSION.myLocked;
    // Si comerciamos con un bot, el bot responde inteligentemente
    if(TRADE_SESSION.target.bot&&TRADE_SESSION.myLocked){
      TRADE_SESSION.otherGold=Math.min(30,Math.floor(Math.random()*20+5));
      if($('tradeOtherGold')) $('tradeOtherGold').textContent=TRADE_SESSION.otherGold;
      TRADE_SESSION.otherLocked=true;
    }
    renderTradeUI();
  };
  if($('btnTradeAccept')) $('btnTradeAccept').onclick=()=>{
    if(!TRADE_SESSION||!TRADE_SESSION.myLocked||!TRADE_SESSION.otherLocked)return;
    // Transferir oro
    P.gold-=TRADE_SESSION.myGold;
    P.gold+=TRADE_SESSION.otherGold;
    // Eliminar objetos de tu bolsa
    for(const it of TRADE_SESSION.myItems){
      const idx=P.inv.indexOf(it);
      if(idx>=0)P.inv.splice(idx,1);
    }
    toast('¡Intercambio realizado con éxito!');
    sfx('coin');
    $('pTrade').hidden=true;
    TRADE_SESSION=null;
    refreshUI();
  };
}

/* ---------- 11. HERMANDADES (GUILDS) ---------- */
function renderGuildUI(){
  const b=$('guildBody');if(!b)return;
  if(!P.guild){
    b.innerHTML='<div style="text-align:center;padding:20px">'+
      '<h3 style="font-family:var(--f-display);color:var(--gold)">NO PERTENECES A NINGUNA HERMANDAD</h3>'+
      '<p style="color:var(--muted);margin-bottom:14px">Funda tu propia orden para compartir aventuras, chat privado y bonificaciones pasivas de hermandad.</p>'+
      '<div style="max-width:320px;margin:0 auto;display:flex;flex-direction:column;gap:8px">'+
      '<input id="gNameIn" type="text" placeholder="Nombre de la Hermandad..." maxlength="24" style="background:var(--slot);border:1px solid var(--line);border-radius:4px;padding:6px 10px;color:var(--ink)">'+
      '<button class="btn" id="btnCreateGuild">Fundar Hermandad (50 oro)</button>'+
      '</div></div>';
    b.querySelector('#btnCreateGuild').onclick=()=>{
      const nm=(b.querySelector('#gNameIn').value||'').trim();
      if(!nm){toast('Introduce un nombre');return}
      if(P.gold<50){toast('Necesitas 50 de oro');return}
      P.gold-=50;
      P.guild={name:nm,level:1,motd:'¡Gloria a '+nm+'! Juntos forjamos el destino de Astra.',members:[{name:P.name,cls:P.cls,lvl:P.level,rank:'Líder'}]};
      toast('¡Has fundado la hermandad '+nm+'!');
      sfx('quest');refreshUI();renderGuildUI();
    };
    return;
  }
  const g=P.guild;
  b.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
    '<h3 style="margin:0;font-family:var(--f-display);color:var(--gold)">'+esc(g.name)+'</h3>'+
    '<span style="color:var(--muted);font-size:12px">Nivel '+g.level+' · '+(g.members.length)+' miembros</span>'+
    '</div>'+
    '<div class="gmotd"><b>Mensaje del día:</b> '+esc(g.motd)+'</div>'+
    '<div class="gperks"><span class="gperk">+12% Velocidad en Montura</span><span class="gperk">+10% Oro en Misiones</span><span class="gperk">+10% Experiencia de Grupo</span></div>'+
    '<table class="gtable"><thead><tr><th>Miembro</th><th>Clase</th><th>Nivel</th><th>Rango</th></tr></thead><tbody>'+
    g.members.map(m=>'<tr><td><b>'+esc(m.name)+'</b></td><td>'+(CLS[m.cls]?CLS[m.cls].name:m.cls)+'</td><td style="color:var(--gold)">'+m.lvl+'</td><td>'+esc(m.rank)+'</td></tr>').join('')+
    '</tbody></table>'+
    '<div class="btns" style="margin-top:14px"><button class="btn sm sec" id="btnLeaveGuild">Abandonar Hermandad</button></div>';
  b.querySelector('#btnLeaveGuild').onclick=()=>{
    P.guild=null;toast('Has salido de la hermandad');renderGuildUI();
  };
}

/* ---------- 12. TABLÓN DE MISIONES PROCEDURALES ---------- */
function checkNoticeBoardInteract(){
  const near=nearestInteract();
  if(near&&near.e&&near.e.t==='noticeboard'){
    openNoticeBoard();
    return true;
  }
  return false;
}
function openNoticeBoard(){
  let m=$('noticeModal');
  if(!m){
    m=document.createElement('div');m.id='noticeModal';
    m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9999;display:grid;place-items:center;padding:12px;backdrop-filter:blur(4px)';
    document.body.appendChild(m);
  }
  const lvl=P.level||1;
  const bounties=[
    {id:'b_wolves',title:'Recompensa: Manada Feroz',desc:'Abate 8 bestias en las afueras para proteger las caravanas de comerciantes.',n:8,xp:lvl*120+60,gold:lvl*15+10},
    {id:'b_band',title:'Recompensa: Purgar Forajidos',desc:'Elimina a 6 bandidos o saqueadores armados que acechan en los senderos.',n:6,xp:lvl*150+80,gold:lvl*20+15},
    {id:'b_ore',title:'Contrato: Extracción de Minerales',desc:'Recolecta 5 minerales de hierro de las minas o colinas para la forja.',n:5,xp:lvl*110+40,gold:lvl*18+12}
  ];
  m.innerHTML='<div style="background:#181108;border:2px solid #9c7234;border-radius:8px;padding:16px;max-width:440px;width:100%;color:#efe3c2;font:13px var(--f-ui)">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #5a4020;padding-bottom:8px;margin-bottom:12px">'+
    '<b style="font-family:var(--f-display);color:var(--gold);font-size:16px">TABLÓN DE ANUNCIOS Y RECOMPENSAS</b>'+
    '<button id="nbClose" style="background:none;border:0;color:#aaa;font-size:22px;cursor:pointer">×</button></div>'+
    '<p style="color:var(--muted);font-size:12px;margin:0 0 10px">Contratos públicos de la orden. Complétalos para recibir oro y gloria.</p>'+
    bounties.map((b,i)=>'<div style="background:rgba(12,8,4,.75);border:1px solid var(--line);border-radius:5px;padding:8px 10px;margin-bottom:8px">'+
      '<b style="color:var(--gold);font-size:14px">'+esc(b.title)+'</b><p style="margin:2px 0 6px;color:#d8d0b8">'+esc(b.desc)+'</p>'+
      '<div style="display:flex;justify-content:space-between;align-items:center"><span class="reward">Recompensa: <b>'+b.gold+' oro</b> · '+b.xp+' XP</span>'+
      '<button class="btn sm" data-b="'+i+'">Aceptar</button></div></div>').join('')+
    '</div>';
  m.querySelector('#nbClose').onclick=()=>m.remove();
  m.querySelectorAll('[data-b]').forEach(btn=>{
    btn.onclick=()=>{
      const b=bounties[+btn.dataset.b];
      toast('¡Contrato aceptado: '+b.title+'!');
      sfx('quest');
      m.remove();
    };
  });
}

/* ---------- 13. OPTIMIZACIÓN MÓVIL Y BOTONES TÁCTILES ---------- */
function initMobileControls(){
  const isTouch='ontouchstart' in window||navigator.maxTouchPoints>0||window.matchMedia('(pointer:coarse)').matches;
  if(isTouch)document.body.classList.add('touch');
  
  // Limitar DPR a 2.0 en móviles para evitar caídas de fotogramas y sobrecalentamiento
  if(isTouch||window.devicePixelRatio>2){
    window._customDPR=Math.min(window.devicePixelRatio||1, 2.0);
  }

  // Botón Fullscreen
  const btnFull=$('bFull');
  if(btnFull){
    btnFull.onclick=()=>{
      if(!document.fullscreenElement){
        document.documentElement.requestFullscreen().catch(()=>{});
        toast('Pantalla completa activada');
      }else{
        document.exitFullscreen().catch(()=>{});
      }
    };
  }

  // Botones táctiles adicionales
  if($('tbAtk'))$('tbAtk').onclick=()=>tryUse(0);
  if($('tbTargetM'))$('tbTargetM').onclick=()=>cycleTarget();
  if($('tbMountM'))$('tbMountM').onclick=()=>toggleMount();
  
  // Ahorro de batería
  const tgBat=$('tgBattery');
  if(tgBat){
    tgBat.onclick=()=>{
      const active=tgBat.getAttribute('aria-pressed')==='true';
      tgBat.setAttribute('aria-pressed',active?'false':'true');
      window._batterySaver=!active;
      toast('Ahorro de batería: '+(!active?'Activado (30 FPS)':'Desactivado (60 FPS)'));
    };
  }
}

/* ---------- 14. EXPANDIR LA BARRA DE ACCIÓN A TODAS LAS HABILIDADES ---------- */
const _buildActionBar=buildActionBar;
buildActionBar=function(){
  const bar=$('actionbar');bar.innerHTML='';AB=[];
  const c=CLS[P.cls];
  
  // Añadir todas las habilidades de clase (1 a 12)
  c.ab.forEach((ab,i)=>{
    const b=document.createElement('button');b.className='slot'+(ab.ul>P.level?' lock':'');b.dataset.ul=ab.ul;b.setAttribute('data-tip','ab:'+i);
    const bindKey=KEYBINDS[String(i+1)]||String(i+1);
    b.innerHTML=svg(ab.ic,ab.col)+'<span class="k">'+esc(prettyCombo(bindKey))+'</span><span class="cd"></span><span class="cdt"></span>';
    b.onclick=()=>tryUse(i);
    b.draggable=true;
    b.ondragstart=e=>{DRAG={t:'ab',i:i};try{e.dataTransfer.setData('text/plain','ab:'+i)}catch(_){}};
    b.ondragover=e=>{e.preventDefault()};
    b.ondrop=e=>{
      e.preventDefault();
      if(DRAG&&DRAG.t==='ab'&&DRAG.i!==i){
        const tmp=c.ab[DRAG.i];c.ab[DRAG.i]=c.ab[i];c.ab[i]=tmp;
        buildActionBar();
      }else if(DRAG&&DRAG.t==='inv'){
        const it=P.inv[DRAG.i];
        if(it&&(it.t==='cons'||ITEMS[it.key])){
          if(!QUICK)QUICK=[null,null,null];
          QUICK[0]=it.key;saveQuick();buildQuick();
          toast('Asignado a barra: '+(ITEMS[it.key]?ITEMS[it.key].name:it.key));
        }
      }
      DRAG=null;
    };
    bar.appendChild(b);
    AB.push({el:b,cd:b.querySelector('.cd'),cdt:b.querySelector('.cdt'),ab:ab,ul:ab.ul});
  });

  // Consumibles (hp, mp, herb)
  const extra=[
    ['hp','pot:hp','potion','#e0554a',()=>usePotion('hp'),'pot:hp'],
    ['mp','pot:mp','potion','#4a8fe0',()=>usePotion('mp'),'pot:mp'],
    ['herb','herb:1','herb','#7fe07f',useHerb,'herb:1']
  ];
  for(const [kind,key,ic,col,fn,tip] of extra){
    const b=document.createElement('button');b.className='slot';b.setAttribute('data-tip',tip);
    b.innerHTML=svg(ic,col)+'<span class="k">'+esc(kind.toUpperCase())+'</span><span class="cd"></span><span class="cdt"></span><span class="cnt"></span>';
    b.onclick=fn;
    b.ondragover=e=>{e.preventDefault()};
    b.ondrop=e=>{
      e.preventDefault();
      if(DRAG&&DRAG.t==='inv'){
        const it=P.inv[DRAG.i];
        if(it&&(it.t==='cons'||ITEMS[it.key])){
          if(!QUICK)QUICK=[null,null,null];
          QUICK[0]=it.key;saveQuick();buildQuick();
          toast('Asignado a barra: '+(ITEMS[it.key]?ITEMS[it.key].name:it.key));
        }
      }
      DRAG=null;
    };
    bar.appendChild(b);
    AB.push({el:b,cd:b.querySelector('.cd'),cdt:b.querySelector('.cdt'),cnt:b.querySelector('.cnt'),kind:kind});
  }
};

/* ---------- 15. INTERCEPTAR ATRIBUTOS PARA TALENTOS ---------- */
const _recalc=recalc;
recalc=function(){
  _recalc();
  applyTalentEffects();
  if(P&&P.hp>P.maxhp)P.hp=P.maxhp;
};

/* ---------- 16. CHAT EXTENDIDO (/w, /p, /g, /duel, /trade) ---------- */
const _chatSend=chatSend;
chatSend=function(txt){
  txt=(txt||'').trim();if(!txt)return;
  if(txt[0]==='/'){
    const parts=txt.slice(1).split(' ');
    const cmd=parts[0].toLowerCase();
    const arg1=parts[1]||'',rest=parts.slice(2).join(' ');
    if(cmd==='w'||cmd==='whisper'||cmd==='msg'){
      if(arg1&&rest){sendWhisper(arg1,rest);return}
    } else if(cmd==='r'){
      if(LAST_WHISPER_SENDER&&parts.slice(1).join(' ')){sendWhisper(LAST_WHISPER_SENDER,parts.slice(1).join(' '));return}
    } else if(cmd==='p'||cmd==='party'){
      const msg=parts.slice(1).join(' ');
      if(msg){log('<span style="color:#5cd0ff"><b>[Grupo] ['+esc(P.name)+']:</b> '+esc(msg)+'</span>','party');return}
    } else if(cmd==='g'||cmd==='guild'){
      const msg=parts.slice(1).join(' ');
      if(msg){log('<span style="color:#5ee88a"><b>[Hermandad] ['+esc(P.name)+']:</b> '+esc(msg)+'</span>','guild');return}
    } else if(cmd==='duel'){
      const t=arg1?G.bots.find(b=>b.name.toLowerCase()===arg1.toLowerCase()):P.target;
      if(t)startDuel(t);else toast('Objetivo no encontrado');
      return;
    } else if(cmd==='trade'){
      const t=arg1?G.bots.find(b=>b.name.toLowerCase()===arg1.toLowerCase()):P.target;
      if(t)startTrade(t);else toast('Objetivo no encontrado');
      return;
    } else if(cmd==='inv'||cmd==='invite'){
      if(arg1)partyInvite(arg1);return;
    }
  }
  _chatSend(txt);
};

/* ---------- 16.5 ARRASTRAR Y SOLTAR EN MOCHILA Y RANURAS RÁPIDAS ---------- */
let DRAG=null;
const QKEYS=['q','r','t'];
let QUICK=[null,null,null];
const qKey=()=>'astra_quick_'+(P&&P.name||'');
function loadQuick(){try{QUICK=JSON.parse(localStorage.getItem(qKey()))||[null,null,null]}catch(e){QUICK=[null,null,null]}}
function saveQuick(){try{localStorage.setItem(qKey(),JSON.stringify(QUICK))}catch(e){}}
function useQuick(i){
  const k=QUICK[i];if(!k||!G.started||P.dead)return;
  if(k.indexOf('pot')===0){usePotion(k.slice(3));return}
  const idx=P.inv.findIndex(x=>x.key===k);
  if(idx<0){toast('No te quedan');return}
  useInv(idx);
}
function buildQuick(){
  let q=$('quickbar');
  if(!q){
    q=document.createElement('div');q.id='quickbar';
    q.style.cssText='display:flex;gap:4px;justify-content:center;margin-top:4px';
    if($('actionbar'))$('actionbar').after(q);
  }
  if(!q)return;
  q.innerHTML='';
  QKEYS.forEach((kk,i)=>{
    const b=document.createElement('button');b.className='slot';b.dataset.q=i;
    const k=QUICK[i],def=k&&ITEMS[k];
    b.innerHTML=(def?svg(def.ic,def.col):'')+'<span class="k">'+kk.toUpperCase()+'</span>'+(k?'<span class="cnt">'+countItem(k)+'</span>':'');
    b.title='Arrastra un objeto de la mochila aquí';
    b.onclick=()=>useQuick(i);
    b.ondragover=e=>{e.preventDefault()};
    b.ondrop=e=>{e.preventDefault();if(DRAG&&DRAG.t==='inv'){const it=P.inv[DRAG.i];if(it&&it.t==='cons'||it&&ITEMS[it.key]){QUICK[i]=it.key;saveQuick();buildQuick()}}DRAG=null};
    b.oncontextmenu=e=>{e.preventDefault();QUICK[i]=null;saveQuick();buildQuick()};
    q.appendChild(b);
  });
}
function markDraggable(){
  document.querySelectorAll('#invGrid [data-i]').forEach(b=>{b.draggable=true});
  const g=$('invGrid');if(!g)return;
  [...g.children].forEach((c,i)=>{c.dataset.cell=i});
}
const _renderInv=renderInv;
renderInv=function(){_renderInv();markDraggable();if($('quickbar'))buildQuick()};

function bindDrag(){
  const g=$('invGrid');
  if(!g)return;
  g.addEventListener('dragstart',e=>{const b=e.target.closest('[data-i]');if(!b)return;DRAG={t:'inv',i:+b.dataset.i};hideTip();try{e.dataTransfer.setData('text/plain','x');e.dataTransfer.effectAllowed='move'}catch(_){}});
  g.addEventListener('dragover',e=>{if(DRAG)e.preventDefault()});
  g.addEventListener('drop',e=>{
    e.preventDefault();if(!DRAG||DRAG.t!=='inv')return;
    const c=e.target.closest('[data-cell]');if(!c){DRAG=null;return}
    const to=Math.min(+c.dataset.cell,P.inv.length-1),it=P.inv.splice(DRAG.i,1)[0];
    P.inv.splice(to,0,it);DRAG=null;renderInv();
  });
  g.addEventListener('dragend',()=>{DRAG=null});
}

/* ---------- 17. ACTUALIZACIÓN DEL JUEGO Y COMBATE DE DUELOS ---------- */
let atT=0;
const _updateV3=update;
update=function(dt){
  _updateV3(dt);
  atT-=dt;
  if(atT<=0&&G.started&&!P.dead){
    atT=0.4;
    if(!P.target||P.target.dead){
      let best=null,bd=300;
      for(const m of G.mobs){if(m.dead||m.state!=='chase')continue;const d=dist(m,P);if(d<bd){bd=d;best=m}}
      if(best)P.target=best;
    }
  }
  // Duelo en curso
  if(ACTIVE_DUEL){
    ACTIVE_DUEL.time+=dt;
    const tgt=ACTIVE_DUEL.target;
    // Si uno de los dos baja a menos del 10% de vida o sale del círculo
    if(tgt.hp<=tgt.maxhp*0.1){
      endDuel(P.name,tgt.name);
    }else if(P.hp<=P.maxhp*0.1){
      endDuel(tgt.name,P.name);
    }else if(dist(P,ACTIVE_DUEL.origin)>ACTIVE_DUEL.r){
      toast('Has salido del círculo de duelo');
      endDuel(tgt.name,P.name);
    }
  }
};

/* ---------- 18. DIBUJADO DE CÍRCULO DE DUELO Y PARTÍCULAS ---------- */
const _drawParts=drawParts;
drawParts=function(){
  _drawParts();
  if(G.duelRing){
    ctx.save();
    ctx.strokeStyle='rgba(255,215,0,'+(0.6+0.3*Math.sin(G.time*5)).toFixed(2)+')';
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.ellipse(G.duelRing.x,G.duelRing.y,G.duelRing.r,G.duelRing.r*0.6,0,0,6.283);
    ctx.stroke();
    ctx.restore();
  }
};

/* ---------- 19. DESPACHO DE ACCIONES DE TECLAS (UNIFICADO) ---------- */
function dispatchBoundAction(boundAct){
  if(!boundAct)return;
  if(+boundAct>=1&&+boundAct<=12){
    tryUse(+boundAct-1);
  } else if(boundAct==='q')useQuick(0);
  else if(boundAct==='r')useQuick(1);
  else if(boundAct==='t')useQuick(2);
  else if(boundAct==='dodge')dodge();
  else if(boundAct==='target')cycleTarget();
  else if(boundAct==='interact'){if(!checkNoticeBoardInteract())interact();}
  else if(boundAct==='loot'){if(!lootNearby())toast('No hay botín cerca');}
  else if(boundAct==='mount')toggleMount();
  else if(boundAct==='talents')togglePanel('pTalents');
  else if(boundAct==='guild')togglePanel('pGuild');
  else if(boundAct==='spells')togglePanel('pSpells');
  else if(boundAct==='craft')togglePanel('pCraft');
  else if(boundAct==='inv')togglePanel('pInv');
  else if(boundAct==='char')togglePanel('pChar');
  else if(boundAct==='quests')togglePanel('pQuest');
  else if(boundAct==='map')openMap();
  else if(boundAct==='opts')togglePanel('pOpts');
}

/* ---------- 20. ENLACE DE PANELES Y ARRANQUE ---------- */
const _bindPanels=bindPanels;
bindPanels=function(){
  _bindPanels();
  PANELS.push('pTalents','pMounts','pTrade','pGuild');
  if($('bTal'))$('bTal').onclick=()=>togglePanel('pTalents');
  if($('bGuild'))$('bGuild').onclick=()=>togglePanel('pGuild');
  if($('btnRespec'))$('btnRespec').onclick=respecTalents;
  initTargetMenu();
  bindTradeButtons();
  initMobileControls();
};

const _refreshUI=refreshUI;
refreshUI=function(){
  _refreshUI();
  updatePortraits();
  renderPartyFrame();
  if(!$('pTalents').hidden)renderTalentUI();
  if(!$('pMounts').hidden)renderMountsUI();
  if(!$('pGuild').hidden)renderGuildUI();
  if(!$('pTrade').hidden)renderTradeUI();
};

function bindExtras(){
  const body=$('pOpts')&&$('pOpts').querySelector('.pbody');
  if(body){
    const btn=document.createElement('button');
    btn.textContent='Configurar Teclas y Combos (K)';
    btn.style.cssText='margin:8px 0;padding:6px 10px;font-weight:700';
    btn.onclick=openKeysModal;
    body.appendChild(btn);
  }
  bindDrag();
}

const _startGameV3=startGame;
startGame=function(){
  _startGameV3();
  P.talents=P.talents||{};
  P.mount=P.mount||'horse';
  P.mounts=P.mounts||['horse'];
  loadQuick();buildQuick();renderInv();
  updatePortraits();
  renderPartyFrame();
  updateActionKeyBadges();
};
