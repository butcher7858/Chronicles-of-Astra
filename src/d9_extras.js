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

/* ---------- 4. ÁRBOLES DE TALENTOS ---------- */
const TALENTS_DATA={
  war:[
    {name:'Armas',desc:'Enfoque en golpes críticos, laceraciones y devastación.',tiers:[
      [{id:'crit1',name:'Filo Afilado',desc:'Aumenta el golpe crítico un +3% por rango.',max:3,stat:'crit',val:3}],
      [{id:'bleed1',name:'Heridas Profundas',desc:'Aumenta el daño de tus ataques un +5% por rango.',max:3,stat:'atkM',val:0.05}],
      [{id:'mas1',name:'Maestría en Armas',desc:'Tus ataques tienen un 15% de probabilidad de infligir daño adicional masivo.',max:1,stat:'procDmg',val:1}]
    ]},
    {name:'Furia',desc:'Fiebre berserker, velocidad vertiginosa y potencia.',tiers:[
      [{id:'atk1',name:'Furia Indómita',desc:'Aumenta tu poder de ataque un +4% por rango.',max:3,stat:'atkM',val:0.04}],
      [{id:'spd1',name:'Celeridad Sangrienta',desc:'Aumenta tu velocidad de movimiento un +5% por rango.',max:3,stat:'spdM',val:0.05}],
      [{id:'furyMaster',name:'Sed de Sangre',desc:'Asestar golpes críticos te cura un 4% de tu vida máxima.',max:1,stat:'critHeal',val:0.04}]
    ]},
    {name:'Protección',desc:'Escudo inquebrantable, armadura de placas y resistencia.',tiers:[
      [{id:'arm1',name:'Piel de Acero',desc:'Aumenta tu armadura un +10% por rango.',max:3,stat:'armM',val:0.10}],
      [{id:'hp1',name:'Vitalidad Titánica',desc:'Aumenta tu vida máxima un +6% por rango.',max:3,stat:'hpM',val:0.06}],
      [{id:'lastStand',name:'Muralla Inmóvil',desc:'Reduce todo el daño recibido un 15%.',max:1,stat:'dr',val:0.15}]
    ]}
  ],
  mage:[
    {name:'Fuego',desc:'Calor abrasador, llamaradas e ignición fulminante.',tiers:[
      [{id:'fCrit',name:'Piroclasto',desc:'+4% golpe crítico con hechizos de fuego.',max:3,stat:'crit',val:4}],
      [{id:'fDmg',name:'Combustión Ígnea',desc:'+6% de daño de fuego por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'fMaster',name:'Fénix Eterno',desc:'Al lanzar hechizos generas una explosión de ascuas automática.',max:1,stat:'procDmg',val:1}]
    ]},
    {name:'Escarcha',desc:'Control glacial, frío cortante y escudos de hielo.',tiers:[
      [{id:'frArm',name:'Armadura Helada',desc:'+8% armadura y ralentiza a los atacantes.',max:3,stat:'armM',val:0.08}],
      [{id:'frCd',name:'Frío Absoluto',desc:'Reduce el tiempo de recarga de tus habilidades un 6% por rango.',max:3,stat:'cdr',val:0.06}],
      [{id:'frMaster',name:'Cero Absoluto',desc:'Nova de Escarcha congela a los objetivos durante 2,5 s adicionales.',max:1,stat:'ccBuff',val:1}]
    ]},
    {name:'Arcano',desc:'Manipulación del Telar, maná abundante y ráfagas arcanas.',tiers:[
      [{id:'arMana',name:'Mente Brillante',desc:'+10% maná máximo y regeneración aumentada.',max:3,stat:'resM',val:0.10}],
      [{id:'arSpd',name:'Flujo Temporal',desc:'+5% velocidad de movimiento y lanzamiento.',max:3,stat:'spdM',val:0.05}],
      [{id:'arMaster',name:'Poder Arcano Puro',desc:'Tus ataques consumen 20% menos de maná y tienen +20% de daño.',max:1,stat:'atkM',val:0.20}]
    ]}
  ],
  priest:[
    {name:'Sagrado',desc:'Luz curativa radiante y renacimiento de la vida.',tiers:[
      [{id:'hHeal',name:'Gracia Sagrada',desc:'+8% a todas tus sanaciones por rango.',max:3,stat:'healM',val:0.08}],
      [{id:'hHp',name:'Don de Vida',desc:'+5% de vida máxima por rango.',max:3,stat:'hpM',val:0.05}],
      [{id:'hMaster',name:'Luz Perpetua',desc:'Tus curaciones aplican un escudo de absorción del 20% del monto.',max:1,stat:'healShield',val:0.20}]
    ]},
    {name:'Disciplina',desc:'Barreras de fe impenetrables y equilibrio sagrado.',tiers:[
      [{id:'dShield',name:'Escudo de Fe',desc:'+10% absorción de tus barreras por rango.',max:3,stat:'dr',val:0.05}],
      [{id:'dRes',name:'Comunión Divina',desc:'+8% de maná máximo y regeneración.',max:3,stat:'resM',val:0.08}],
      [{id:'dMaster',name:'Supresión del Dolor',desc:'Reduce todo el daño recibido un 15% de forma permanente.',max:1,stat:'dr',val:0.15}]
    ]},
    {name:'Sombras',desc:'Oscuridad marchitadora, vaciamiento y daño continuado.',tiers:[
      [{id:'sDot',name:'Oscuridad Pura',desc:'+6% daño de sombras por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'sCrit',name:'Pesadilla',desc:'+3% crítico con hechizos sombríos.',max:3,stat:'crit',val:3}],
      [{id:'sMaster',name:'Forma del Vacío',desc:'El daño de sombras te sana un 15% de todo lo infligido.',max:1,stat:'vamp',val:0.15}]
    ]}
  ],
  paladin:[
    {name:'Reprensión',desc:'Justicia férrea y daño fulgurante.',tiers:[
      [{id:'pAtk',name:'Espada de la Justicia',desc:'+5% de daño con armas y luz por rango.',max:3,stat:'atkM',val:0.05}],
      [{id:'pCrit',name:'Celo Sagrado',desc:'+3% golpe crítico por rango.',max:3,stat:'crit',val:3}],
      [{id:'pMaster',name:'Veredicto Final',desc:'Tus golpes críticos reinician el tiempo de reutilización de Juicio.',max:1,stat:'procDmg',val:1}]
    ]},
    {name:'Protección',desc:'Baluarte sagrado, armadura y resistencia divina.',tiers:[
      [{id:'pDef',name:'Escudo Sagrado',desc:'+10% de armadura por rango.',max:3,stat:'armM',val:0.10}],
      [{id:'pHp',name:'Robustez',desc:'+6% de vida máxima por rango.',max:3,stat:'hpM',val:0.06}],
      [{id:'pMaster2',name:'Defensa Inquebrantable',desc:'Reduce el daño recibido un 15% permanentemente.',max:1,stat:'dr',val:0.15}]
    ]},
    {name:'Luz',desc:'Auras benditas y sanación reactiva.',tiers:[
      [{id:'pHeal',name:'Toque de Gracia',desc:'+8% a las curaciones propias por rango.',max:3,stat:'healM',val:0.08}],
      [{id:'pSpd',name:'Persecución de la Fe',desc:'+5% velocidad de movimiento por rango.',max:3,stat:'spdM',val:0.05}],
      [{id:'pMaster3',name:'Aura de Devoción',desc:'Otorga regeneración de vida constante a ti y a tu grupo.',max:1,stat:'regen',val:1}]
    ]}
  ],
  rogue:[
    {name:'Asesinato',desc:'Hemorragias letales, veneno y ejecuciones.',tiers:[
      [{id:'rAtk',name:'Tajo Quirúrgico',desc:'+5% daño de armas por rango.',max:3,stat:'atkM',val:0.05}],
      [{id:'rCrit',name:'Letalidad',desc:'+4% golpe crítico por rango.',max:3,stat:'crit',val:4}],
      [{id:'rMaster',name:'Veneno Mortal',desc:'Tus ataques aplican veneno que devora al objetivo con el tiempo.',max:1,stat:'procDmg',val:1}]
    ]},
    {name:'Sutileza',desc:'Paso silencioso, sombras evasivas y presteza.',tiers:[
      [{id:'rSpd',name:'Velocidad Espectral',desc:'+6% de velocidad de movimiento por rango.',max:3,stat:'spdM',val:0.06}],
      [{id:'rEva',name:'Reflejos Relámpago',desc:'+4% probabilidad de esquiva total por rango.',max:3,stat:'crit',val:2}],
      [{id:'rMaster2',name:'Maestro de Sombras',desc:'Al usar habilidades de sigilo te vuelves inmune al daño 1 s.',max:1,stat:'dr',val:0.10}]
    ]},
    {name:'Combate',desc:'Duelo cuerpo a cuerpo, vigor y energía inagotable.',tiers:[
      [{id:'rEng',name:'Vigor Infatigable',desc:'+15% regeneración de energía por rango.',max:3,stat:'resM',val:0.15}],
      [{id:'rDef',name:'Curtido en Mil Batallas',desc:'+8% armadura y +5% vida.',max:3,stat:'hpM',val:0.05}],
      [{id:'rMaster3',name:'Aluvión de Acero',desc:'Tus ataques tienen un 25% de probabilidad de golpear dos veces.',max:1,stat:'atkM',val:0.18}]
    ]}
  ],
  hunter:[
    {name:'Puntería',desc:'Tiroteo preciso, flechas perforantes y daño a distancia.',tiers:[
      [{id:'hAtk',name:'Disparo Maestro',desc:'+5% daño a distancia por rango.',max:3,stat:'atkM',val:0.05}],
      [{id:'hCrit',name:'Ojo de Halcón',desc:'+4% crítico a distancia por rango.',max:3,stat:'crit',val:4}],
      [{id:'hMaster',name:'Tiro Mortal',desc:'Tus disparos perforan armaduras ignorando el 30% de la defensa.',max:1,stat:'procDmg',val:1}]
    ]},
    {name:'Bestias',desc:'Vínculo animal, ferocidad y compañía salvaje.',tiers:[
      [{id:'hPet',name:'Compañero Feroz',desc:'+8% daño de bestias invocadas por rango.',max:3,stat:'atkM',val:0.04}],
      [{id:'hSpd',name:'Paso de Guepardo',desc:'+6% velocidad de movimiento por rango.',max:3,stat:'spdM',val:0.06}],
      [{id:'hMaster2',name:'Ira Bestial',desc:'Tu bestia y tú os enfurecéis ganando +20% de daño permanente.',max:1,stat:'atkM',val:0.20}]
    ]},
    {name:'Supervivencia',desc:'Trampas astutas, resistencia y combate táctico.',tiers:[
      [{id:'hDef',name:'Piel de Cazador',desc:'+8% armadura y +5% vida máxima.',max:3,stat:'hpM',val:0.05}],
      [{id:'hTrap',name:'Trampero Experto',desc:'Reduce el tiempo de recarga de trampas un 10% por rango.',max:3,stat:'cdr',val:0.10}],
      [{id:'hMaster3',name:'Espíritu del Bosque',desc:'Recuperas un 2% de vida cada 3 segundos continuamente.',max:1,stat:'regen',val:1}]
    ]}
  ],
  necro:[
    {name:'Hueso',desc:'Armaduras óseas impenetrables y lanzas punzantes.',tiers:[
      [{id:'nArm',name:'Armadura de Hueso',desc:'+10% armadura por rango.',max:3,stat:'armM',val:0.10}],
      [{id:'nAtk',name:'Esquirlas Aguzadas',desc:'+5% daño perforante por rango.',max:3,stat:'atkM',val:0.05}],
      [{id:'nMaster',name:'Prisión Ósea',desc:'Al golpear tienes probabilidad de atrapar al enemigo en huesos.',max:1,stat:'procDmg',val:1}]
    ]},
    {name:'Sangre',desc:'Vampirismo, sacrificios vitales y robo de esencia.',tiers:[
      [{id:'nVamp',name:'Drenaje Sanguíneo',desc:'Recuperas un +4% del daño infligido como vida.',max:3,stat:'vamp',val:0.04}],
      [{id:'nHp',name:'Reserva Vital',desc:'+6% vida máxima por rango.',max:3,stat:'hpM',val:0.06}],
      [{id:'nMaster2',name:'Transfusión Oscura',desc:'Al recibir daño fatal sobrevives con 25% de vida (cd 90s).',max:1,stat:'dr',val:0.12}]
    ]},
    {name:'Peste',desc:'Maldiciones corrosivas, peste y descomposición.',tiers:[
      [{id:'nDot',name:'Peste Negra',desc:'+6% daño periódico por rango.',max:3,stat:'atkM',val:0.06}],
      [{id:'nSlow',name:'Putrefacción',desc:'Tus maldiciones ralentizan un +10% adicional.',max:3,stat:'spdM',val:0.03}],
      [{id:'nMaster3',name:'Apocalipsis',desc:'Los enemigos abatidos explotan dañando a todos a su alrededor.',max:1,stat:'procDmg',val:1}]
    ]}
  ],
  druid:[
    {name:'Equilibrio',desc:'Luz estelar, energía solar y poder cósmico.',tiers:[
      [{id:'dAtk',name:'Luz de las Estrellas',desc:'+5% daño mágico por rango.',max:3,stat:'atkM',val:0.05}],
      [{id:'dCrit',name:'Alineación Celeste',desc:'+3% crítico por rango.',max:3,stat:'crit',val:3}],
      [{id:'dMaster',name:'Eclipse Cósmico',desc:'Lluvia estelar continua cae sobre tus objetivos en combate.',max:1,stat:'procDmg',val:1}]
    ]},
    {name:'Feral',desc:'Zarpazos, ferocidad animal y velocidad felina.',tiers:[
      [{id:'dBleed',name:'Garras Lacerantes',desc:'+6% daño cuerpo a cuerpo y sangrados.',max:3,stat:'atkM',val:0.06}],
      [{id:'dSpd',name:'Presteza Felina',desc:'+6% velocidad de movimiento por rango.',max:3,stat:'spdM',val:0.06}],
      [{id:'dMaster2',name:'Instinto Depredador',desc:'Tus golpes críticos aumentan tu velocidad de ataque un 25%.',max:1,stat:'crit',val:5}]
    ]},
    {name:'Restauración',desc:'Raíces curativas, savia milenaria y renacimiento.',tiers:[
      [{id:'dHeal',name:'Savia Viva',desc:'+8% a todas tus curaciones por rango.',max:3,stat:'healM',val:0.08}],
      [{id:'dHp',name:'Raíces Profundas',desc:'+6% vida máxima por rango.',max:3,stat:'hpM',val:0.06}],
      [{id:'dMaster3',name:'Árbol de la Vida',desc:'Generas un aura sanadora permanente que restaura vida a ti y tus aliados.',max:1,stat:'regen',val:1}]
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

/* ---------- 5. ESTABLO DE MONTURAS ---------- */
const MOUNTS={
  horse:{id:'horse',name:'Caballo de Guerra',speed:270,ic:'horse',col:'#8a5a32',desc:'El leal caballo de la guardia de Villa Alba.'},
  wolf:{id:'wolf',name:'Lobo Huargo Sombrío',speed:295,ic:'ghost',col:'#6a748c',desc:'Depredador veloz de las nieves del norte.'},
  tiger:{id:'tiger',name:'Tigre Dientes de Sable',speed:315,ic:'strike',col:'#d98a2a',desc:'Feroz carnívoro de zancada letal.'},
  ram:{id:'ram',name:'Carnero de las Cumbres',speed:285,ic:'shield',col:'#d0dde8',desc:'Bestia montañesa de cuernos curvos.'},
  drake:{id:'drake',name:'Draco del Alba',speed:335,ic:'wing',col:'#ff6a3a',desc:'Draco alado que planea veloz por los cielos.',flying:true},
  mech:{id:'mech',name:'Zancudo de Vapor',speed:310,ic:'crown',col:'#c89838',desc:'Ingeniería enana impulsada por vapor y bronce.'}
};

function renderMountsUI(){
  const g=$('mountGrid');if(!g)return;
  g.innerHTML='';
  P.mounts=P.mounts||['horse'];
  P.mount=P.mount||'horse';

  for(const k in MOUNTS){
    const m=MOUNTS[k],owned=P.mounts.indexOf(k)>=0,active=P.mount===k;
    const card=document.createElement('div');
    card.className='mount-card'+(active?' active':'');
    card.innerHTML='<div class="mount-ic">'+svg(m.ic,m.col)+'</div>'+
      '<b>'+esc(m.name)+'</b>'+
      '<span>Velocidad: +'+Math.round((m.speed/150-1)*100)+'% ('+m.speed+')</span>'+
      '<div style="font-size:11px;color:var(--muted)">'+esc(m.desc)+'</div>'+
      (owned?(active?'<span style="color:#5cff8a;font-weight:700">✓ ACTIVA</span>':'<button class="btn sm" style="margin-top:4px">Seleccionar</button>'):
             '<button class="btn sm sec" style="margin-top:4px">Desbloquear (40 oro)</button>');
    card.onclick=()=>{
      if(owned){
        P.mount=k;toast('Montura activa: '+m.name);
        sfx('equip');renderMountsUI();
      }else if(P.gold>=40){
        P.gold-=40;P.mounts.push(k);P.mount=k;
        toast('¡Has desbloqueado el '+m.name+'!');
        sfx('coin');renderMountsUI();refreshUI();
      }else{
        toast('Necesitas 40 de oro para desbloquear');
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
  } else {
    // Caballo tradicional
    _drawHorse(g,t,mv,fast);
  }
};

/* ---------- 6. TECLAS PERSONALIZABLES CON CTRL Y SHIFT ---------- */
const DEFAULT_BINDS={
  '1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
  'q':'q','r':'r','t':'t','e':'e',
  'dodge':' ','target':'Tab','interact':'f','loot':'z','mount':'h',
  'map':'m','inv':'b','char':'c','talents':'n','quests':'l','guild':'g','opts':'o'
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
  {id:'q',label:'Ranura Rápida 1 (Q)'},{id:'r',label:'Ranura Rápida 2 (R)'},{id:'t',label:'Ranura Rápida 3 (T)'},
  {id:'dodge',label:'Esquivar (Espacio)'},{id:'target',label:'Cambiar Objetivo (Tab)'},
  {id:'interact',label:'Interactuar (F)'},{id:'loot',label:'Saquear botín (Z)'},
  {id:'mount',label:'Subir a Montura (H)'},{id:'talents',label:'Talentos (N)'},
  {id:'guild',label:'Hermandad (G)'},{id:'inv',label:'Mochila (B)'},
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
  $('btnTradeLock').onclick=()=>{
    if(!TRADE_SESSION)return;
    TRADE_SESSION.myGold=Math.min(P.gold,Math.max(0,+($('tradeMyGold').value||0)));
    TRADE_SESSION.myLocked=!TRADE_SESSION.myLocked;
    // Si comerciamos con un bot, el bot responde inteligentemente
    if(TRADE_SESSION.target.bot&&TRADE_SESSION.myLocked){
      TRADE_SESSION.otherGold=Math.min(30,Math.floor(Math.random()*20+5));
      $('tradeOtherGold').textContent=TRADE_SESSION.otherGold;
      TRADE_SESSION.otherLocked=true;
    }
    renderTradeUI();
  };
  $('btnTradeAccept').onclick=()=>{
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
  
  // Añadir todas las habilidades de clase (1 a 9)
  c.ab.forEach((ab,i)=>{
    const b=document.createElement('button');b.className='slot'+(ab.ul>P.level?' lock':'');b.dataset.ul=ab.ul;b.setAttribute('data-tip','ab:'+i);
    const bindKey=KEYBINDS[String(i+1)]||String(i+1);
    b.innerHTML=svg(ab.ic,ab.col)+'<span class="k">'+esc(prettyCombo(bindKey))+'</span><span class="cd"></span><span class="cdt"></span>';
    b.onclick=()=>tryUse(i);bar.appendChild(b);
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
    b.onclick=fn;bar.appendChild(b);
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

/* ---------- 19. DESPACHO DE TECLAS CON COMBINACIONES ---------- */
window.addEventListener('keydown',e=>{
  if(!G.started||document.activeElement===$('chatIn')||e.repeat)return;
  const combo=comboFromEvent(e);
  if(!combo)return;

  // Buscar acción ligada a este combo
  let boundAct=null;
  for(const act in KEYBINDS){
    if(KEYBINDS[act].toLowerCase()===combo.toLowerCase()){
      boundAct=act;break;
    }
  }
  if(!boundAct)return;

  if(boundAct>='1'&&boundAct<='9'){
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
  else if(boundAct==='inv')togglePanel('pInv');
  else if(boundAct==='char')togglePanel('pChar');
  else if(boundAct==='quests')togglePanel('pQuest');
  else if(boundAct==='map')openMap();
  else if(boundAct==='opts')togglePanel('pOpts');
});

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
