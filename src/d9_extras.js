/* =====================================================================
   Extras v2: más piezas de armadura visibles, arrastrar y soltar,
   ranuras rápidas (Q/R/T), teclas personalizables y auto-fijado
   ===================================================================== */
/* ---------- Nuevas piezas de armadura ---------- */
Object.assign(IC,{
  shoulder:'<path d="M3 15c0-6 4-10 9-10s9 4 9 10l-4 2c0-4-2-6-5-6s-5 2-5 6z"/><path d="M12 5v6"/>',
  glove:'<path d="M7 21v-6L5 9l2-1 2 4V4h2v8V3h2v9V5h2v8V8h2v8l-3 5z"/>',
  legs:'<path d="M7 3h10l1 18h-5l-1-10-1 10H6z"/>'
});
for(const s of ['shoulders','gloves','legs'])if(SLOTS.indexOf(s)<0)SLOTS.push(s);
Object.assign(SLOT_NAME,{shoulders:'Hombreras',gloves:'Guantes',legs:'Grebas'});
Object.assign(SLOT_IC,{shoulders:'shoulder',gloves:'glove',legs:'legs'});
Object.assign(BASES,{
  shoulders:['Hombreras','Espaldares','Mantelete','Pauldrons','Guardahombros'],
  gloves:['Guantes','Manoplas','Mitones','Guanteletes','Brazales'],
  legs:['Grebas','Pantalones','Faldón','Quijotes','Calzas']
});
/* ---------- El equipo cambia el aspecto del personaje ---------- */
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
  if(L&&L.glove){ // brillo de guantes sobre la mano delantera
    const sc=(o&&o.scale)||1,dir=(o&&o.dir)||1;
    g.save();g.translate(x,y);g.scale(sc*dir,sc);g.fillStyle=L.glove;g.globalAlpha=0.9;
    g.beginPath();g.arc(12,-17,2.1,0,6.283);g.fill();g.restore();
  }
};
/* ---------- Arrastrar y soltar en mochila y barra ---------- */
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
  if(!q){q=document.createElement('div');q.id='quickbar';q.style.cssText='display:flex;gap:4px;justify-content:center;margin-top:4px';$('actionbar').after(q)}
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
/* ---------- Teclas personalizables ---------- */
const ACTS=[['Habilidad 1','1'],['Habilidad 2','2'],['Habilidad 3','3'],['Habilidad 4','4'],['Habilidad 5','5'],['Habilidad 6','6'],
 ['Poción de vida','7'],['Poción de maná/recurso','8'],['Hierba','9'],['Esquivar',' '],['Fijar objetivo','Tab'],['Interactuar','f'],
 ['Saquear','z'],['Montura','h'],['Mapa','m'],['Mochila','b'],['Personaje','c'],['Misiones','l'],['Opciones','o']];
let BINDS={};
try{BINDS=JSON.parse(localStorage.getItem('astra_keys'))||{}}catch(e){BINDS={}}
const _keyName=keyName;
keyName=function(e){
  const raw=_keyName(e);
  for(const a of ACTS)if(BINDS[a[1]]&&BINDS[a[1]]===raw)return a[1];
  if(BINDS[raw]!==undefined&&BINDS[raw]!==raw&&ACTS.some(a=>a[1]===raw))return '\u0000';
  return raw;
};
function keyLabel(k){return k===' '?'Espacio':k.length===1?k.toUpperCase():k}
function openKeys(){
  let m=$('keysPanel');
  if(!m){
    m=document.createElement('div');m.id='keysPanel';
    m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99;display:grid;place-items:center;padding:8px';
    document.body.appendChild(m);
  }
  const draw=()=>{
    m.innerHTML='<div style="background:#1a130a;border:1px solid #6b5230;border-radius:8px;padding:14px;max-width:420px;width:100%;max-height:88vh;overflow:auto;color:#e8d9a0;font:13px sans-serif"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><b>TECLAS</b><button id="kClose">×</button></div>'+
    ACTS.map(a=>'<div style="display:flex;justify-content:space-between;padding:3px 0"><span>'+a[0]+'</span><button data-a="'+esc(a[1])+'" style="min-width:76px">'+esc(keyLabel(BINDS[a[1]]||a[1]))+'</button></div>').join('')+
    '<div style="margin-top:8px;display:flex;gap:6px"><button id="kReset">Restablecer</button></div><small>Q, R y T usan las ranuras rápidas.</small></div>';
    m.querySelector('#kClose').onclick=()=>{m.remove()};
    m.querySelector('#kReset').onclick=()=>{BINDS={};localStorage.removeItem('astra_keys');draw()};
    m.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{
      b.textContent='Pulsa una tecla…';
      const h=e=>{e.preventDefault();e.stopPropagation();window.removeEventListener('keydown',h,true);
        const k=_keyName(e);if(k!=='Escape'&&['q','r','t','w','a','s','d','k','Enter'].indexOf(k)<0){
          for(const x in BINDS)if(BINDS[x]===k)delete BINDS[x];
          BINDS[b.dataset.a]=k;try{localStorage.setItem('astra_keys',JSON.stringify(BINDS))}catch(_){}}
        draw()};
      window.addEventListener('keydown',h,true);
    });
  };
  draw();
}
/* ---------- Auto-fijado en combate y atajos nuevos ---------- */
let atT=0;
const _update=update;
update=function(dt){
  _update(dt);
  atT-=dt;if(atT>0||!G.started||P.dead)return;atT=0.4;
  if(!P.target||P.target.dead){
    let best=null,bd=300;
    for(const m of G.mobs){if(m.dead||m.state!=='chase')continue;const d=dist(m,P);if(d<bd){bd=d;best=m}}
    if(best)P.target=best;
  }
};
function bindExtras(){
  window.addEventListener('keydown',e=>{
    if(!G.started||document.activeElement===$('chatIn')||e.repeat)return;
    const i=QKEYS.indexOf(e.key.toLowerCase());
    if(i>=0&&!e.ctrlKey&&!e.metaKey)useQuick(i);
    else if(e.key==='k'||e.key==='K')openKeys();
  });
  const body=$('pOpts').querySelector('.pbody'),btn=document.createElement('button');
  btn.textContent='Personalizar teclas (K)';btn.style.cssText='margin:8px 0;padding:6px 10px';btn.onclick=openKeys;body.appendChild(btn);
  bindDrag();
}
const _startGame=startGame;
startGame=function(){_startGame();loadQuick();buildQuick();renderInv()};
