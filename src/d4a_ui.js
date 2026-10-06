
/* =====================================================================
   Interfaz: HUD, barra de acción, paneles, tooltips
   ===================================================================== */
let toastTm=0,banTm=0;
function toast(t){const e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(toastTm);toastTm=setTimeout(()=>e.classList.remove('on'),2200)}
function banner(h,p){const e=$('banner');$('banH').textContent=h;$('banP').textContent=p||'';e.classList.add('on');clearTimeout(banTm);banTm=setTimeout(()=>e.classList.remove('on'),3200)}
function log(html,cls){
  const box=$('chatLog'),d=document.createElement('div');d.className='m-'+(cls||'gen');d.innerHTML=html;box.appendChild(d);
  while(box.children.length>80)box.removeChild(box.firstChild);box.scrollTop=box.scrollHeight;
}
const PANELS=['pInv','pChar','pQuest','pDlg','pShop','pLoot','pMap','pOpts','pSpells','pCraft','pTalents','pMounts','pGuild','pTrade','pBank','pAchieve','pRankings','pBarber','pInspect'];
function showPanel(id){
  if(id==='pDlg'||id==='pShop'||id==='pLoot'||id==='pMap'||id==='pQuest'||id==='pBank'||id==='pAchieve'||id==='pRankings'||id==='pBarber'||id==='pInspect')for(const o of ['pDlg','pShop','pLoot','pMap','pQuest','pOpts'])if(o!==id&&!(id==='pShop'&&o==='pDlg'&&false))closePanel(o);
  $(id).hidden=false;refreshUI();
}
function closePanel(id){
  const el=$(id);if(!el||el.hidden)return;el.hidden=true;
  if(id==='pShop')G.shopNpc=null;
  if(id==='pDlg'){G.dlgNpc=null;dlgView=null}
  if(id==='pLoot')G.lootM=null;
  if(id==='pMap')G.mapSel=null;
  if(id==='pTrade'){if(typeof TRADE_SESSION!=='undefined')TRADE_SESSION=null}
  if(id==='pInspect')P.inspectTarget=null;
  hideTip();refreshUI();
}
function togglePanel(id){if($(id).hidden)showPanel(id);else closePanel(id)}

/* ---------- Objetos y tooltips ---------- */
function itemIcon(it){
  if(it.t==='gear')return svg(SLOT_IC[it.slot],RAR[it.rar].c);
  if(it.t==='bag')return svg(it.key&&ITEMS[it.key]?ITEMS[it.key].ic:'bag',RAR[it.rar||1].c);
  return svg(ITEMS[it.key].ic,ITEMS[it.key].col);
}
function itemBtn(it,tip,i){
  const r=it.t==='gear'||it.t==='bag'?(it.rar||0):0;
  return '<button class="it r'+r+'" draggable="true" data-tip="'+tip+'" data-i="'+i+'">'+itemIcon(it)+(it.n>1?'<span class="cnt">'+it.n+'</span>':'')+'</button>';
}
function itemLabel(it){
  if(it.t==='gear'||it.t==='bag')return '<span style="color:'+RAR[it.rar||0].c+'">'+esc(it.name)+'</span>';
  return esc(ITEMS[it.key].name)+(it.n>1?' x'+it.n:'');
}
function statLine(it){
  const p=[];if(it.atk)p.push('+'+it.atk+' ataque');if(it.armor)p.push('+'+it.armor+' armadura');if(it.hp)p.push('+'+it.hp+' vida');if(it.crit)p.push('+'+it.crit+'% crít.');
  return p.join(' · ');
}
function gearTip(it){
  let bindTxt=it.bind==='bound'?'<div style="color:#a8a8a8;font-size:11px">Ligado al alma</div>':it.bind==='boe'?'<div style="color:#7fb8ff;font-size:11px">Se liga al equipar</div>':it.bind==='bop'?'<div style="color:#ff8a3a;font-size:11px">Se liga al recoger</div>':'<div style="color:#7fe07f;font-size:11px">Comerciable</div>';
  let h='<h5 style="color:'+RAR[it.rar].c+'">'+esc(it.name)+'</h5><div class="t2">'+RAR[it.rar].n+' · '+SLOT_NAME[it.slot]+' · Nivel '+it.lvl+'</div>'+bindTxt;
  const cur=P.eq[it.slot];
  for(const [k,l,u] of [['atk','Ataque',''],['armor','Armadura',''],['hp','Vida',''],['crit','Crítico','%']]){
    if(!it[k]&&!(cur&&cur[k]))continue;
    const d=+(((it[k]||0)-(cur&&cur!==it?cur[k]||0:0)).toFixed(1));
    let cmp='';if(cur&&cur!==it&&d)cmp=' <span class="'+(d>0?'good':'bad')+'">('+(d>0?'+':'')+d+')</span>';
    if(it[k])h+='<div>+'+it[k]+u+' '+l+cmp+'</div>';
  }
  if(P.level<it.lvl-2)h+='<div class="bad">Requiere nivel '+(it.lvl-2)+'</div>';
  h+='<div class="t2">Vale '+sellValue(it)+' de oro</div>';
  return h;
}
function tipHTML(k){
  const [ty,a]=k.split(':');
  let it=null;
  if(ty==='item'){
    const d=ITEMS[a];
    if(!d)return '';
    return '<h5>'+esc(d.name)+'</h5><p>'+(d.desc||'Objeto diverso.')+'</p><div class="t2">'+(d.t==='cons'?'Consumible · Clic para usar':'Vale '+Math.max(1,Math.floor(d.price*0.4))+' de oro')+'</div>';
  }
  if(ty==='inv'||ty==='sell')it=P.inv[+a];
  else if(ty==='eq')it=P.eq[a];
  else if(ty==='inspeq')it=(P.inspectTarget&&P.inspectTarget.eq)?P.inspectTarget.eq[a]:(P.eq[a]);
  else if(ty==='bag')it=P.bags[+a];
  else if(ty==='bank')it=P.bank[+a];
  else if(ty==='gbank')it=GUILD_BANK.items[+a];
  else if(ty==='loot')it=G.lootM&&G.lootM.loot?G.lootM.loot.items[+a]:null;
  else if(ty==='buy'){const e=shopStock(G.shopNpc)[+a];it=e?(e.item||{t:'cons',key:e.key,n:1}):null}
  else if(ty==='ab'){
    const ab=CLS[P.cls].ab[+a];if(!ab)return '';
    return '<h5 style="color:'+ab.col+'">'+ab.name+'</h5><div class="t2">'+(ab.ul>P.level?'Nivel '+ab.ul:(ab.cost?ab.cost+' '+CLS[P.cls].resName.toLowerCase():'Sin coste')+(ab.cast?' · '+ab.cast+' s':' · Instantáneo')+(ab.cd?' · '+ab.cd+' s recarga':''))+'</div><p>'+abDesc(ab)+'</p>';
  }else if(ty==='pot'){
    const p=a==='hp'?'hp':'mp';let best=null;for(const kk of [p+'4',p+'3',p+'2',p+'1'])if(countItem(kk)>0){best=kk;break}
    return best?'<h5>'+ITEMS[best].name+'</h5><p>'+ITEMS[best].desc+'</p><div class="t2">Recarga compartida 30 s</div>':'<h5>Sin pociones</h5><div class="t2">Cómpralas a Mira la Alquimista</div>';
  }else if(ty==='herb'){return '<h5>Hierba curativa</h5><p>'+ITEMS.herb.desc+'</p><div class="t2">Recarga 10 s</div>'}
  if(!it)return '';
  if(it.t==='bag'){
    let h='<h5 style="color:'+RAR[it.rar||1].c+'">'+esc(it.name)+'</h5><div class="t2">Bolsa de Contenedor · +'+(it.slots||0)+' Casillas</div>';
    if(it.bind==='bound')h+='<div style="color:#a8a8a8;font-size:11px">Ligado al alma</div>';
    else if(it.bind==='boe')h+='<div style="color:#7fb8ff;font-size:11px">Se liga al equipar</div>';
    h+='<p>Aumenta la capacidad de carga de tu inventario al equiparla en una ranura de bolsa.</p>';
    h+='<div class="t2">Vale '+sellValue(it)+' de oro</div>';
    return h;
  }
  if(it.t==='gear')return gearTip(it);
  const d=ITEMS[it.key]||{name:it.key||'Objeto',desc:'Objeto diverso.',price:1};
  return '<h5>'+esc(d.name)+'</h5><p>'+esc(d.desc||'Objeto diverso.')+'</p><div class="t2">'+(d.quest?'Objeto de misión':'Vale '+Math.max(1,Math.floor(d.price*0.4))+' de oro')+'</div>';
}
let tipEl=null;
function hideTip(){if(tipEl)tipEl.style.display='none'}
function moveTip(e){
  if(!tipEl||tipEl.style.display==='none')return;
  const w=tipEl.offsetWidth,h=tipEl.offsetHeight;let x=e.clientX+16,y=e.clientY+14;
  if(x+w>window.innerWidth-6)x=e.clientX-w-12;if(y+h>window.innerHeight-6)y=window.innerHeight-h-6;
  tipEl.style.left=Math.max(4,x)+'px';tipEl.style.top=Math.max(4,y)+'px';
}
function initTips(){
  tipEl=$('tip');
  document.addEventListener('mouseover',e=>{
    const t=e.target.closest&&e.target.closest('[data-tip]');
    if(!t||!G.started){hideTip();return}
    const h=tipHTML(t.getAttribute('data-tip'));
    if(!h){hideTip();return}
    tipEl.innerHTML=h;tipEl.style.display='block';moveTip(e);
  });
  document.addEventListener('mousemove',moveTip);
  document.addEventListener('mouseout',e=>{if(!e.relatedTarget||!e.relatedTarget.closest||!e.relatedTarget.closest('[data-tip]'))hideTip()});
}

/* ---------- Barra de acción ---------- */
let AB=[];
function sanitizeActionBars(){
  if(!P)return;
  const c=CLS[P.cls];
  const maxAb=c&&c.ab?c.ab.length:0;
  if(!P.actionBar||!Array.isArray(P.actionBar)||!P.actionBar.length){
    P.actionBar=[0,1,2,3,4,5,6,7,8,9,10,11].map(x=>x<maxAb?x:null);
  }
  if(!P.actionBar2||!Array.isArray(P.actionBar2)||!P.actionBar2.length){
    P.actionBar2=[12,13,14,15,null,null,null,null,null,null,null,null].map(x=>(typeof x==='number'&&x<maxAb)?x:null);
  }
  while(P.actionBar.length<12)P.actionBar.push(null);
  while(P.actionBar2.length<12)P.actionBar2.push(null);

  // Check for duplicates of spells:
  const seenSpells=new Set();
  for(let i=0;i<12;i++){
    const v=P.actionBar[i];
    if(typeof v==='number'){
      if(seenSpells.has(v)||v>=maxAb){P.actionBar[i]=null}
      else seenSpells.add(v);
    }
  }
  for(let i=0;i<12;i++){
    const v=P.actionBar2[i];
    if(typeof v==='number'){
      if(seenSpells.has(v)||v>=maxAb){P.actionBar2[i]=null}
      else seenSpells.add(v);
    }
  }
}

function buildActionBar(){
  const bar=$('actionbar');if(!bar)return;
  const bar2=$('actionbar2');
  bar.innerHTML='';
  if(bar2)bar2.innerHTML='';
  AB=[];
  sanitizeActionBars();
  const c=CLS[P.cls];
  const maxSlots=12;
  const keyLabels=['1','2','3','4','5','6','7','8','9','0','-','='];
  const keyLabels2=['S+1','S+2','S+3','S+4','S+5','S+6','S+7','S+8','S+9','S+0','S+-','S+='];

  function createSlot(i, parentBar, labels, arr){
    const raw=arr[i%12];
    const b=document.createElement('button');
    b.draggable=true;
    b.dataset.slotIdx=i;
    const keyBadge=(i<12&&(typeof KEYBINDS!=='undefined'&&KEYBINDS[String(i+1)]))?prettyCombo(KEYBINDS[String(i+1)]):labels[i%12];

    const isItem=(typeof raw==='object'&&raw&&raw.type==='item')||(typeof raw==='string'&&raw.startsWith('item:'));
    if(isItem){
      const itemKey=typeof raw==='object'?raw.key:raw.slice(5);
      const itemDef=ITEMS[itemKey];
      const count=countItem(itemKey);
      b.className='slot item-slot'+(count<1?' off':'');
      b.setAttribute('data-tip','item:'+itemKey);
      const icName=(itemDef&&itemDef.ic)?itemDef.ic:'potion';
      const icCol=(itemDef&&itemDef.col)?itemDef.col:'#e0554a';
      b.innerHTML=svg(icName,icCol)+'<span class="k">'+keyBadge+'</span><span class="cnt">'+(count>0?'x'+count:'0')+'</span><span class="cd"></span><span class="cdt"></span>';
      b.onclick=e=>{e.currentTarget.blur();tryUse(i)};
      b.oncontextmenu=e=>{e.preventDefault();if(i<12)P.actionBar[i]=null;else P.actionBar2[i-12]=null;buildActionBar();toast('Ranura '+(i+1)+' limpiada')};
      b.ondragstart=e=>{e.dataTransfer.setData('text/plain','slot:'+i)};
      AB[i]={el:b,cd:b.querySelector('.cd'),cdt:b.querySelector('.cdt'),itemKey:itemKey,cntEl:b.querySelector('.cnt'),ul:1};
    }else if(typeof raw==='number'||(raw&&(raw.id!==undefined||raw.ab!==undefined))){
      const abIdx=typeof raw==='number'?raw:(raw.id!==undefined?raw.id:raw.ab);
      const ab=c.ab[abIdx];
      if(ab){
        b.className='slot'+(ab.ul>P.level?' lock':'');
        b.dataset.ul=ab.ul;
        b.setAttribute('data-tip','ab:'+abIdx);
        b.innerHTML=svg(ab.ic,ab.col)+'<span class="k">'+keyBadge+'</span><span class="cd"></span><span class="cdt"></span>';
        b.onclick=e=>{e.currentTarget.blur();tryUse(i)};
        b.oncontextmenu=e=>{e.preventDefault();if(i<12)P.actionBar[i]=null;else P.actionBar2[i-12]=null;buildActionBar();toast('Ranura '+(i+1)+' limpiada')};
        b.ondragstart=e=>{e.dataTransfer.setData('text/plain','slot:'+i)};
        AB[i]={el:b,cd:b.querySelector('.cd'),cdt:b.querySelector('.cdt'),ab:ab,ul:ab.ul};
      }else{
        b.className='slot';
        b.innerHTML='<span class="k">'+keyBadge+'</span><span class="cd"></span><span class="cdt"></span>';
        b.onclick=e=>{e.currentTarget.blur();tryUse(i)};
        b.ondragstart=e=>e.preventDefault();
        AB[i]={el:b,cd:b.querySelector('.cd'),cdt:b.querySelector('.cdt'),ab:null,ul:99};
      }
    }else{
      b.className='slot';
      b.innerHTML='<span class="k">'+keyBadge+'</span><span class="cd"></span><span class="cdt"></span>';
      b.onclick=e=>{e.currentTarget.blur();tryUse(i)};
      b.ondragstart=e=>e.preventDefault();
      AB[i]={el:b,cd:b.querySelector('.cd'),cdt:b.querySelector('.cdt'),ab:null,ul:99};
    }

    b.ondragover=e=>e.preventDefault();
    b.ondrop=e=>{
      e.preventDefault();
      const data=e.dataTransfer.getData('text/plain');
      if(data&&data.startsWith('spell:')){
        const fromIdx=+data.split(':')[1];
        // Strip duplicate instance from any slot
        for(let s=0;s<12;s++){
          if(P.actionBar[s]===fromIdx)P.actionBar[s]=null;
          if(P.actionBar2[s]===fromIdx)P.actionBar2[s]=null;
        }
        if(i<12)P.actionBar[i]=fromIdx;
        else P.actionBar2[i-12]=fromIdx;
        buildActionBar();
        const ab=c.ab[fromIdx];
        toast((ab?ab.name:'Habilidad')+' asignada a la ranura '+(i+1));
      }else if(data&&data.startsWith('item:')){
        const itKey=data.split(':')[1];
        const val={type:'item',key:itKey};
        if(i<12)P.actionBar[i]=val;
        else P.actionBar2[i-12]=val;
        buildActionBar();
        const d=ITEMS[itKey];
        toast((d?d.name:'Objeto')+' asignado a la ranura '+(i+1));
      }else if(data&&data.startsWith('slot:')){
        const fromSlot=+data.split(':')[1];
        const getV=s=>(s<12?P.actionBar[s]:P.actionBar2[s-12]);
        const setV=(s,v)=>{if(s<12)P.actionBar[s]=v;else P.actionBar2[s-12]=v};
        const tmp=getV(i);
        setV(i,getV(fromSlot));
        setV(fromSlot,tmp);
        buildActionBar();
      }
    };
    parentBar.appendChild(b);
  }

  // Action Bar 2 (Top row: slots 12-23)
  if(bar2){
    for(let i=0;i<maxSlots;i++){
      createSlot(i+12, bar2, keyLabels2, P.actionBar2);
    }
  }
  // Action Bar 1 (Bottom row: slots 0-11)
  for(let i=0;i<maxSlots;i++){
    createSlot(i, bar, keyLabels, P.actionBar);
  }
}
function flashSlot(i){const s=AB[i];if(!s)return;s.el.classList.remove('flash');void s.el.offsetWidth;s.el.classList.add('flash')}
function potCount(p){let n=0;for(const k of [p+'1',p+'2',p+'3',p+'4',p+'5'])n+=countItem(k);return n}

/* ---------- HUD por fotograma ---------- */
const HC={};
function setTxt(id,v){if(HC[id]!==v){HC[id]=v;$(id).textContent=v}}
function setW(id,p){const v=Math.round(clamp(p,0,1)*1000)/10;if(HC['w'+id]!==v){HC['w'+id]=v;$(id).style.width=v+'%'}}
let hudT=0,lastTarget=null;
function updateHUD(dt){
  setW('pHp',P.hp/P.maxhp);setTxt('pHpTxt',Math.ceil(P.hp)+' / '+P.maxhp);
  setW('pRes',P.res/P.maxres);setTxt('pResTxt',Math.floor(P.res)+' / '+P.maxres);
  setW('pSta',P.sta/100);
  const sta=$('pSta');const sc=P.exh?'#c9482c':'#e0b84a';if(HC.stac!==sc){HC.stac=sc;sta.style.background=sc}
  setW('xpFill',P.level>=MAXLV?1:P.xp/xpNeed(P.level));
  // objetivo
  const t=P.target&&(!P.target.dead)?P.target:null,tf=$('tframe');
  if(t){
    if(tf.hidden)tf.hidden=false;
    if(lastTarget!==t){
      lastTarget=t;$('tName').textContent=t.name;$('tLvl').textContent=t.level;
      $('tTag').textContent=t.boss?'Jefe':t.rare?'Élite · Raro':t.elite?'Élite':'';
      if(typeof updatePortraits==='function')updatePortraits();
    }
    setW('tHp',t.hp/t.maxhp);setTxt('tHpTxt',Math.ceil(t.hp)+' / '+t.maxhp);
  }else if(!tf.hidden){tf.hidden=true;lastTarget=null}
  // habilidades
  for(let i=0;i<AB.length;i++){
    const s=AB[i];if(!s)continue;let cd=0,tot=1,off=false;
    if(s.ab){
      cd=P.cds[s.ab.id]||0;tot=s.ab.cd||1;
      if(!cd&&P.gcd>0&&!s.ab.noGcd){cd=P.gcd;tot=1}
      off=P.level>=s.ul&&P.res<(s.ab.cost||0);
      if(P.level>=s.ul&&s.el.classList.contains('lock'))s.el.classList.remove('lock');
    }else if(s.itemKey){
      const n=countItem(s.itemKey);
      off=n<1;
      if(s.itemKey==='herb'){cd=P.cds.herb||0;tot=10}
      else{cd=P.cds.pot||0;tot=30}
      if(s.cntEl){const tx=n>0?'x'+n:'0';if(s.cntEl.textContent!==tx)s.cntEl.textContent=tx}
    }else if(s.kind==='herb'){cd=P.cds.herb||0;tot=10;const n=countItem('herb');off=n<1;if(HC.herbn!==n){HC.herbn=n;if(s.cnt)s.cnt.textContent=n||''}}
    else if(s.kind){cd=P.cds.pot||0;tot=30;const n=potCount(s.kind);off=n<1;const k='pn'+s.kind;if(HC[k]!==n){HC[k]=n;if(s.cnt)s.cnt.textContent=n||''}}
    const hh=cd>0?Math.min(100,cd/tot*100):0;
    if(s.cd)s.cd.style.height=hh+'%';
    const tx=cd>1?Math.ceil(cd)+'':cd>0.05&&tot>1.5?cd.toFixed(1):'';
    if(s.cdt&&s.cdt.textContent!==tx)s.cdt.textContent=tx;
    s.el.classList.toggle('off',off);
  }
  // lanzamiento
  const cb=$('castBar');
  if(P.cast&&!P.dead){cb.style.visibility='visible';$('castFill').style.width=Math.min(100,P.cast.time/P.cast.dur*100)+'%';setTxt('castTxt',P.cast.ab.name)}
  else if(cb.style.visibility!=='hidden')cb.style.visibility='hidden';
  hudT-=dt;
  if(hudT<=0){
    hudT=0.2;
    setTxt('clock',clockText());
    setTxt('goldTxt',P.gold+' oro');
    $('bMount').classList.toggle('on',P.mounted);
    $('tbRun').classList.toggle('on',!!G.sprintToggle);
    // beneficios
    const list=[];
    for(const b of P.buffs)list.push({ic:b.ic,col:b.col,t:Math.ceil(b.dur-b.t),nm:b.name});
    if(P.mounted)list.push({ic:'horse',col:'#d9b27a',t:'',nm:'Montura'});
    if(P.sprinting)list.push({ic:'run',col:'#ffe08a',t:'',nm:'Correr'});
    if(P.slowT>0)list.push({ic:'snow',col:'#9fe0ff',t:Math.ceil(P.slowT),nm:'Ralentizado'});
    if(P.dots.length)list.push({ic:'skull',col:'#9bd04a',t:'',nm:'Veneno'});
    const key=list.map(x=>x.ic+x.t).join('|');
    if(HC.buffs!==key){HC.buffs=key;$('pBuffs').innerHTML=list.map(x=>'<div class="buff" title="'+esc(x.nm)+'">'+svg(x.ic,x.col)+(x.t!==''?'<em>'+x.t+'</em>':'')+'</div>').join('')}
  }
}

/* ---------- Paneles ---------- */
let dlgView=null;
function refreshUI(){
  if(!P||!G.started)return;
  $('pName').textContent=P.name;$('pLvl').textContent=P.level;
  const c=CLS[P.cls];
  $('pRes').style.background=c.resCol;
  if(typeof updatePortraits==='function')updatePortraits();
  renderTracker();
  if(!$('pInv').hidden)renderInv();
  if(!$('pChar').hidden)renderChar();
  if(!$('pQuest').hidden)renderQuests();
  if(!$('pDlg').hidden)renderDlg();
  if(!$('pShop').hidden)renderShop();
  if(!$('pLoot').hidden)renderLoot();
  if(!$('pMap').hidden)renderMapInfo();
  if(!$('pSpells').hidden)renderSpellsUI();
  if(!$('pCraft').hidden)renderCraftUI();
  if($('pBank')&&!$('pBank').hidden)renderBankUI();
  if($('pAchieve')&&!$('pAchieve').hidden)renderAchievementsUI();
  if($('pRankings')&&!$('pRankings').hidden)renderRankingsUI();
  if($('pBarber')&&!$('pBarber').hidden)renderBarberUI();
  for(const [btnId,pId] of [
    ['bInv','pInv'],['bChar','pChar'],['bQuest','pQuest'],['bMap','pMap'],['bOpts','pOpts'],
    ['bSpells','pSpells'],['bCraft','pCraft'],['bTal','pTalents'],['bMount','pMounts'],['bGuild','pGuild'],
    ['bAchieve','pAchieve'],['bRankings','pRankings'],['bBank','pBank']
  ]){
    if($(btnId)&&$(pId))$(btnId).classList.toggle('on',!$(pId).hidden);
  }
}
function renderTracker(){
  let h='';
  for(const id in P.quests){
    const s=P.quests[id];if(s.state!=='active')continue;
    const q=QUESTS[id],r=questReady(id);
    h+='<div class="q'+(r?' ready':'')+'"><b>'+esc(q.title)+'</b><span>'+(r?'Listo: vuelve con '+esc(npcName(q.giver)):esc(q.obj.label)+': '+questProg(id)+'/'+q.obj.n)+'</span></div>';
  }
  if(HC.trk!==h){HC.trk=h;$('tracker').innerHTML=h}
}
function renderInv(){
  const cap=maxInventorySlots();
  let h='';
  for(let i=0;i<cap;i++){const it=P.inv[i];h+=it?itemBtn(it,'inv:'+i,i):'<div class="it"></div>'}
  $('invGrid').innerHTML=h;$('invCount').textContent=P.inv.length+' / '+cap+' · '+P.gold+' oro';

  const bagRow=$('bagSlotsRow');
  if(bagRow){
    let bh='<div class="bag-slots-label">Bolsas:</div>';
    bh+='<div class="bag-slot-box" title="Mochila Principal (24 casillas)"><span class="bag-ic">'+svg('bag','#ffd700')+'</span><span class="bag-slots-tag">24</span></div>';
    for(let b=0;b<4;b++){
      const bag=P.bags[b];
      if(bag){
        bh+='<div class="bag-slot-box equipped r'+(bag.rar||1)+'" data-bag-idx="'+b+'" data-tip="bag:'+b+'">'+
          svg(bag.key&&ITEMS[bag.key]?ITEMS[bag.key].ic:'bag',RAR[bag.rar||1].c)+
          '<span class="bag-slots-tag">+'+(bag.slots||0)+'</span>'+
        '</div>';
      }else{
        bh+='<div class="bag-slot-box empty" data-bag-idx="'+b+'" title="Ranura de Bolsa vacía. Equipa una bolsa para ampliar espacio">'+
          svg('bag','#444')+
          '<span class="bag-slots-tag" style="color:#666">+0</span>'+
        '</div>';
      }
    }
    bagRow.innerHTML=bh;
  }
}
function renderCharPaperdoll(){
  const cv=$('pCharCv');if(!cv||!P)return;
  const ctx=cv.getContext('2d');
  ctx.clearRect(0,0,cv.width,cv.height);
  const grad=ctx.createRadialGradient(cv.width/2,cv.height-20,4,cv.width/2,cv.height-20,55);
  grad.addColorStop(0,'rgba(0,0,0,0.5)');
  grad.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=grad;
  ctx.beginPath();ctx.ellipse(cv.width/2,cv.height-20,50,14,0,0,Math.PI*2);ctx.fill();
  const L=lookFor(P);
  drawHuman(ctx, cv.width/2, cv.height-28, L, {scale:3.2, dir:P.paperDir||1, t:G.worldT||0, moving:false});
}
function renderChar(){
  if(!$('pChar')||$('pChar').hidden)return;
  const leftSlots=['head','necklace','shoulders','chest','cape','amulet','relic'];
  const rightSlots=['gloves','legs','boots','ring','trinket1','trinket2','weapon','shield'];
  const slotBtn=s=>{
    const it=P.eq[s];
    return it?itemBtn(it,'eq:'+s,s):'<div class="it" title="'+(SLOT_NAME[s]||s)+'">'+svg(SLOT_IC[s]||'shield','#5a4a30')+'</div>';
  };
  if($('eqLeft'))$('eqLeft').innerHTML=leftSlots.map(slotBtn).join('');
  if($('eqRight'))$('eqRight').innerHTML=rightSlots.map(slotBtn).join('');
  renderCharPaperdoll();
  if($('btnRotChar'))$('btnRotChar').onclick=()=>{P.paperDir=-(P.paperDir||1);renderCharPaperdoll()};

  const titleSel=$('pTitleSelect');
  if(titleSel){
    P.titles=P.titles||['novice'];
    titleSel.innerHTML='<option value="">Sin título</option>'+P.titles.map(t=>'<option value="'+t+'"'+(P.title===t?' selected':'')+'>'+(TITLES[t]?TITLES[t].name:t)+'</option>').join('');
    titleSel.onchange=()=>{setTitle(titleSel.value);renderChar()};
  }
  const titleDisp=$('pCharTitleDisplay');
  if(titleDisp){
    titleDisp.textContent=P.title&&TITLES[P.title]?'«'+TITLES[P.title].name+'»':'';
  }

  const c=CLS[P.cls],red=Math.round(P.armor/(P.armor+40+P.level*10)*100);
  const rows=[
    ['Clase',c.name],
    ['Nivel',P.level+(P.level<MAXLV?' ('+P.xp+'/'+xpNeed(P.level)+' XP)':' (máx.)')],
    ['Vida',P.maxhp],[c.resName,P.maxres],
    ['Ataque',Math.round(A())],
    ['Armadura',P.armor+' ('+red+'% menos daño)'],
    ['Crítico',P.crit.toFixed(1)+'%'],
    ['Velocidad',Math.round(P.mounted?mountSpeed():150)+(P.level>=4?' · montura '+mountSpeed():'')],
    ['Enemigos abatidos',P.kills],
    ['Oro',P.gold]
  ];
  $('stats').innerHTML=rows.map(r=>'<div class="stat"><span>'+r[0]+'</span><b>'+r[1]+'</b></div>').join('');
}
function renderSpellsUI(){
  const list=$('spellList');if(!list)return;
  const c=CLS[P.cls];if(!c)return;
  let h='';
  c.ab.forEach((ab,i)=>{
    const unlocked=P.level>=ab.ul;
    const costText=ab.cost?ab.cost+' '+c.resName:'Sin coste';
    const castText=ab.cast?ab.cast+' s':'Instantáneo';
    const cdText=ab.cd?ab.cd+' s recarga':'Sin recarga';
    
    let assignedSlot=-1;
    if(P.actionBar&&P.actionBar.indexOf(i)>=0){
      assignedSlot=P.actionBar.indexOf(i);
    }else if(P.actionBar2&&P.actionBar2.indexOf(i)>=0){
      assignedSlot=12+P.actionBar2.indexOf(i);
    }
    
    let selectOpts='<option value="-1">Asignar a barra...</option>';
    selectOpts+='<optgroup label="Barra 1">';
    for(let s=0;s<12;s++){
      selectOpts+='<option value="'+s+'"'+(assignedSlot===s?' selected':'')+'>Ranura '+(s+1)+'</option>';
    }
    selectOpts+='</optgroup><optgroup label="Barra 2 (Superior)">';
    for(let s=12;s<24;s++){
      selectOpts+='<option value="'+s+'"'+(assignedSlot===s?' selected':'')+'>Ranura '+(s+1)+'</option>';
    }
    selectOpts+='</optgroup>';

    h+='<div class="spell-card'+(unlocked?'':' locked')+'" draggable="'+unlocked+'" data-spell-idx="'+i+'">'+
      '<div class="spell-ic">'+svg(ab.ic,ab.col)+'</div>'+
      '<div class="spell-info">'+
        '<div class="spell-name"><span style="color:'+ab.col+'">'+esc(ab.name)+'</span>'+
          (unlocked?'<span class="spell-tag ok">Nv. '+ab.ul+'</span>':'<span class="spell-tag lock">Req. Nivel '+ab.ul+'</span>')+
          (assignedSlot>=0?'<span class="spell-tag slot-badge">Ranura '+(assignedSlot+1)+'</span>':'')+
        '</div>'+
        '<div class="spell-meta">'+costText+' · '+castText+' · '+cdText+'</div>'+
        '<div class="spell-desc">'+esc(abDesc(ab))+'</div>'+
      '</div>'+
      (unlocked?
        '<div class="spell-assign">'+
          '<select data-assign-spell="'+i+'">'+selectOpts+'</select>'+
        '</div>':
        '<div class="spell-assign"><span style="color:var(--muted);font-size:11px">Bloqueada</span></div>'
      )+
    '</div>';
  });
  list.innerHTML=h;

  list.querySelectorAll('.spell-card[draggable=true]').forEach(card=>{
    card.ondragstart=e=>{
      const idx=card.dataset.spellIdx;
      e.dataTransfer.setData('text/plain','spell:'+idx);
    };
  });

  list.querySelectorAll('select[data-assign-spell]').forEach(sel=>{
    sel.onchange=e=>{
      const abIdx=+sel.dataset.assignSpell;
      const targetSlot=+sel.value;
      if(targetSlot>=0&&targetSlot<12){
        P.actionBar[targetSlot]=abIdx;
        buildActionBar();
        renderSpellsUI();
        toast('Habilidad asignada a Ranura '+(targetSlot+1));
      }else if(targetSlot>=12&&targetSlot<24){
        P.actionBar2[targetSlot-12]=abIdx;
        buildActionBar();
        renderSpellsUI();
        toast('Habilidad asignada a Ranura '+(targetSlot+1));
      }
    };
  });
}
let craftCat='all';
function renderCraftUI(){
  const list=$('craftList');if(!list)return;
  const tabs=$('craftTabs');
  if(tabs){
    tabs.querySelectorAll('.craft-tab').forEach(b=>{
      b.classList.toggle('active',b.dataset.cat===craftCat);
      b.onclick=()=>{craftCat=b.dataset.cat;renderCraftUI()};
    });
  }
  let h='';
  for(const id in RECIPES){
    const r=RECIPES[id];
    if(craftCat!=='all'&&r.cat!==craftCat)continue;
    const known=hasRecipe(id);
    const lvlOk=P.level>=r.lvl;
    const craftable=canCraft(id);
    
    const outIc=r.out?(ITEMS[r.out.key]?ITEMS[r.out.key].ic:(r.out.t==='bag'?'bag':'potion')):(SLOT_IC[r.slot]||'sword');
    const outCol=r.out?(ITEMS[r.out.key]?ITEMS[r.out.key].col:'#f4cf5b'):RAR[r.rar||2].c;
    const outName=r.out?(ITEMS[r.out.key]?ITEMS[r.out.key].name:r.name):r.name;
    const outCnt=r.out&&r.out.n>1?' x'+r.out.n:'';

    let matsH='';
    for(const mKey in r.mat){
      const need=r.mat[mKey];
      const have=countItem(mKey);
      const mDef=ITEMS[mKey]||{name:mKey,ic:'gem',col:'#aaa'};
      const ok=have>=need;
      matsH+='<span class="craft-mat-tag '+(ok?'ok':'no')+'">'+
        svg(mDef.ic,mDef.col)+' '+esc(mDef.name)+': '+have+'/'+need+
      '</span>';
    }

    let btnH='';
    if(!known){
      btnH='<button class="btn sm sec" disabled title="Aprende la receta comprándola a mercaderes o en cofres">No aprendida</button>';
    }else if(!lvlOk){
      btnH='<button class="btn sm sec" disabled>Req. Nivel '+r.lvl+'</button>';
    }else if(!craftable){
      btnH='<button class="btn sm sec" disabled>Faltan materiales</button>';
    }else{
      btnH='<button class="btn sm" data-craft="'+id+'">Fabricar</button>';
    }

    h+='<div class="craft-card'+(known?'':' unlearned')+'">'+
      '<div class="craft-ic">'+svg(outIc,outCol)+'</div>'+
      '<div class="craft-info">'+
        '<div class="craft-title">'+
          '<span style="color:'+outCol+'">'+esc(outName)+outCnt+'</span>'+
          '<span class="reward" style="font-size:11px">Nv. '+r.lvl+' · '+(r.cat==='alch'?'Alquimia':r.cat==='blacksmith'?'Herrería':r.cat==='bags'?'Sastrería (Bolsas)':'Joyería')+'</span>'+
          (!known?'<span class="badge-lock" style="color:#ff8a7a;font-size:10px;font-weight:700">BLOQUEADA</span>':'<span style="color:#7fe07f;font-size:10px;font-weight:700">CONOCIDA</span>')+
        '</div>'+
        '<div class="reward" style="font-size:12px;margin:2px 0">'+esc(r.desc||'')+'</div>'+
        '<div class="craft-mats">'+matsH+'</div>'+
      '</div>'+
      '<div class="craft-action">'+btnH+'</div>'+
    '</div>';
  }
  list.innerHTML=h||'<p class="reward" style="padding:16px;text-align:center">No hay recetas en esta categoría.</p>';

  list.querySelectorAll('button[data-craft]').forEach(b=>{
    b.onclick=()=>{
      craftItem(b.dataset.craft);
      renderCraftUI();
    };
  });
}

/* ---------- Banco y Banco de Hermandad ---------- */
let bankTab='personal';
function renderBankUI(){
  if(window._bankActiveTab){bankTab=window._bankActiveTab;delete window._bankActiveTab}
  const p=$('pBank');if(!p||p.hidden)return;

  const tabBtns=document.querySelectorAll('#bankTabs button[data-banktab]');
  tabBtns.forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.banktab===bankTab);
    btn.onclick=()=>{bankTab=btn.dataset.banktab;renderBankUI()};
  });

  const goldTxt=$('bankGoldTxt');
  if(goldTxt){
    if(bankTab==='personal'){
      goldTxt.textContent='Oro en Bóveda: '+(P.bankGold||0)+' | Tu oro: '+P.gold;
    }else{
      goldTxt.textContent='Oro de Hermandad: '+(GUILD_BANK.gold||0)+' | Tu oro: '+P.gold;
    }
  }

  const titleEl=$('bankTitle');
  if(titleEl)titleEl.textContent=bankTab==='personal'?'BANCO PERSONAL DE ASTRA':'BANCO DE HERMANDAD';
  const subEl=$('bankStorageSub');
  if(subEl)subEl.textContent=bankTab==='personal'?'Depósito Personal (clic para retirar)':'Cofre de Hermandad (clic para retirar)';

  // Bank Storage Grid
  const bGrid=$('bankGrid');
  if(bGrid){
    let h='';
    const items=bankTab==='personal'?P.bank:GUILD_BANK.items;
    const maxSlots=Math.max(40, items.length);
    for(let i=0;i<maxSlots;i++){
      const it=items[i];
      h+=it?itemBtn(it,(bankTab==='personal'?'bank:':'gbank:')+i,i):'<div class="it"></div>';
    }
    bGrid.innerHTML=h;
    bGrid.onclick=e=>{
      const b=e.target.closest('[data-i]');
      if(!b)return;
      const idx=+b.dataset.i;
      if(bankTab==='personal')bankWithdrawItem(idx);
      else guildBankWithdrawItem(idx);
      hideTip();
    };
  }

  // Backpack Grid inside Bank Modal ("Tu mochila (clic para guardar)")
  const invGrid=$('bankInvGrid');
  if(invGrid){
    let h='';
    const maxSlots=maxInventorySlots();
    for(let i=0;i<maxSlots;i++){
      const it=P.inv[i];
      h+=it?itemBtn(it,'inv:'+i,i):'<div class="it"></div>';
    }
    invGrid.innerHTML=h;
    invGrid.onclick=e=>{
      const b=e.target.closest('[data-i]');
      if(!b)return;
      const idx=+b.dataset.i;
      if(bankTab==='personal')bankDepositItem(idx);
      else guildBankDepositItem(idx);
      hideTip();
    };
  }

  // Guild Bank Logs
  const logEl=$('guildBankLogs');
  if(logEl){
    if(bankTab==='guild'){
      logEl.hidden=false;
      logEl.innerHTML=(GUILD_BANK.logs&&GUILD_BANK.logs.length)?
        GUILD_BANK.logs.map(l=>'<div style="margin-bottom:2px"><b style="color:var(--gold)">'+esc(l.who)+'</b>: '+esc(l.text)+'</div>').join(''):
        '<div style="color:var(--muted)">Sin movimientos recientes en el banco de hermandad.</div>';
    }else{
      logEl.hidden=true;
    }
  }

  // Buttons for gold deposit and withdraw
  const btnDep=$('btnBankDepGold');
  if(btnDep){
    btnDep.onclick=()=>{
      const max=P.gold;
      const amt=prompt('¿Cuánto oro deseas depositar en '+(bankTab==='personal'?'tu banco':'la hermandad')+'?',String(max));
      if(amt){
        if(bankTab==='personal')bankDepositGold(+amt);
        else guildBankDepositGold(+amt);
      }
    };
  }
  const btnWith=$('btnBankWithGold')||$('btnBankWdGold');
  if(btnWith){
    btnWith.onclick=()=>{
      const curBank=bankTab==='personal'?(P.bankGold||0):(GUILD_BANK.gold||0);
      const amt=prompt('¿Cuánto oro deseas retirar de '+(bankTab==='personal'?'tu banco':'la hermandad')+'?',String(curBank));
      if(amt){
        if(bankTab==='personal')bankWithdrawGold(+amt);
        else guildBankWithdrawGold(+amt);
      }
    };
  }
}

/* ---------- Logros ---------- */
let achieveCat='all';
function renderAchievementsUI(){
  const p=$('pAchieve');if(!p||p.hidden)return;
  if(typeof ACHIEVEMENTS==='undefined')return;
  P.achievements=P.achievements||{};
  
  let totalPts=0, earnedPts=0, completedCount=0;
  ACHIEVEMENTS.forEach(a=>{
    const pts=a.pts||a.points||0;
    totalPts+=pts;
    if(P.achievements[a.id]){earnedPts+=pts;completedCount++}
  });

  const ptsTxt=$('achPointsTxt');
  if(ptsTxt)ptsTxt.textContent='Puntos de Logro: '+earnedPts+' / '+totalPts;
  const progTxt=$('achProgTxt');
  if(progTxt)progTxt.textContent=completedCount+' / '+ACHIEVEMENTS.length+' Completados ('+Math.round(completedCount/Math.max(1,ACHIEVEMENTS.length)*100)+'%)';

  const claimBtn=$('btnClaimTitles');
  if(claimBtn){
    claimBtn.onclick=()=>{
      claimAllEligibleTitles();
      renderAchievementsUI();
      refreshUI();
    };
  }

  const tabBtns=document.querySelectorAll('#achTabs button[data-acat]');
  tabBtns.forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.acat===achieveCat);
    btn.onclick=()=>{achieveCat=btn.dataset.acat;renderAchievementsUI()};
  });

  const list=$('achieveList');
  if(!list)return;
  let h='';
  ACHIEVEMENTS.forEach(a=>{
    if(achieveCat!=='all'&&a.cat!==achieveCat)return;
    const done=!!P.achievements[a.id];
    let cur=0,max=a.max||1;
    if(a.cur)cur=a.cur(P);
    else cur=done?max:0;
    cur=Math.min(max,Math.max(0,cur));
    const pct=done?100:Math.min(100,Math.round(cur/Math.max(1,max)*100));
    const titleKey=a.title||a.reward;
    const titleReward=titleKey?'<span style="color:var(--gold);font-size:11px;font-style:italic">Título: «'+getTitleName(titleKey)+'»</span>':'';

    h+='<div class="ach-card'+(done?' done':'')+'">'+
      '<div class="ach-ic">'+svg(a.ic||'star',done?'#ffd700':'#777')+'</div>'+
      '<div class="ach-info" style="flex:1">'+
        '<div style="display:flex;justify-content:space-between;align-items:center">'+
          '<b style="color:'+(done?'#ffe08a':'var(--ink)')+'">'+esc(a.name)+'</b>'+
          '<span style="color:var(--gold);font-weight:700;font-size:12px">+'+(a.pts||a.points||0)+' pts</span>'+
        '</div>'+
        '<div style="font-size:12px;color:var(--muted);margin:2px 0 4px">'+esc(a.desc)+'</div>'+
        '<div style="background:rgba(0,0,0,0.4);border:1px solid var(--line);border-radius:4px;height:12px;overflow:hidden;position:relative">'+
          '<div style="background:'+(done?'#5ce88a':'#e0a93d')+';height:100%;width:'+pct+'%"></div>'+
          '<span style="position:absolute;inset:0;font-size:10px;line-height:12px;text-align:center;color:#fff;font-weight:600">'+(done?'¡Completado!':cur+' / '+max)+'</span>'+
        '</div>'+
        (titleReward?'<div style="margin-top:4px">'+titleReward+'</div>':'')+
      '</div>'+
    '</div>';
  });
  list.innerHTML=h;
}

/* ---------- Clasificaciones (Rankings) ---------- */
let rankTab='players';
function renderRankingsUI(){
  const p=$('pRankings');if(!p||p.hidden)return;
  const tabBtns=document.querySelectorAll('#rankTabs button[data-rtab]');
  tabBtns.forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.rtab===rankTab);
    btn.onclick=()=>{rankTab=btn.dataset.rtab;renderRankingsUI()};
  });

  const content=$('rankingsContent');if(!content)return;
  let h='';
  if(rankTab==='players'){
    const achCount=Object.keys(P.achievements||{}).length;
    const topP=[
      {name:P.name,cls:P.cls,lvl:P.level,kills:P.kills||0,duels:P.duelsWon||0,pts:achCount*15,title:P.title,isSelf:true},
      {name:'Aldrik el Temerario',cls:'war',lvl:60,kills:1240,duels:42,pts:450,title:'immortal'},
      {name:'Lyra Sombraluna',cls:'mage',lvl:58,kills:980,duels:29,pts:390,title:'void_walker'},
      {name:'Thorvan Escudoacerado',cls:'paladin',lvl:57,kills:890,duels:31,pts:360,title:'champion_alba'},
      {name:'Brunhild la Feroz',cls:'dk',lvl:55,kills:810,duels:22,pts:330,title:'frost_walker'},
      {name:'Kaelis Vientorápido',cls:'hunter',lvl:53,kills:750,duels:18,pts:300,title:'explorer'},
      {name:'Mirelle de la Luz',cls:'priest',lvl:52,kills:620,duels:15,pts:270,title:'novice'},
      {name:'Zephyr Sombrío',cls:'rogue',lvl:50,kills:590,duels:25,pts:250,title:'gladiator'},
      {name:'Sylas el Telúrico',cls:'shaman',lvl:48,kills:520,duels:19,pts:230,title:'novice'},
      {name:'Rowan el Silvano',cls:'druid',lvl:47,kills:480,duels:14,pts:210,title:'novice'}
    ];
    topP.sort((a,b)=>(b.lvl-a.lvl)||(b.pts-a.pts)||(b.kills-a.kills));

    h='<table class="rank-table"><thead><tr><th>#</th><th>Aventurero</th><th>Clase</th><th>Nivel</th><th>Bajas</th><th>Duelos</th><th>Puntos</th></tr></thead><tbody>';
    topP.forEach((x,idx)=>{
      const c=CLS[x.cls];
      const medalCls=idx===0?'m1':idx===1?'m2':idx===2?'m3':'';
      const medalIco=idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':(idx+1);
      const titleTxt=x.title?' <small style="color:var(--gold);font-style:italic">«'+getTitleName(x.title)+'»</small>':'';
      h+='<tr class="'+(x.isSelf?'self':'')+'">'+
        '<td class="rank-medal '+medalCls+'">'+medalIco+'</td>'+
        '<td><b>'+esc(x.name)+'</b>'+titleTxt+'</td>'+
        '<td style="color:'+(c?c.color:'#fff')+'">'+(c?c.name:x.cls)+'</td>'+
        '<td style="color:var(--gold);font-weight:700">'+x.lvl+'</td>'+
        '<td>'+x.kills+'</td>'+
        '<td>'+x.duels+'</td>'+
        '<td style="color:#f4cf5b">'+x.pts+'</td>'+
      '</tr>';
    });
    h+='</tbody></table>';
  }else{
    const topG=[
      {name:'Los Cruzados de Astra',lvl:10,members:48,gold:125000,leader:'Aldrik'},
      {name:'Orden del Fénix Eterno',lvl:9,members:42,gold:98000,leader:'Thorvan'},
      {name:'Vanguardia Imperial',lvl:8,members:36,gold:85000,leader:'Brunhild'},
      {name:'Hermandad de las Sombras',lvl:7,members:29,gold:62000,leader:'Zephyr'},
      {name:'Guardianes del Bosque',lvl:6,members:24,gold:43000,leader:'Teo'}
    ];
    if(P.guild&&P.guild.name){
      topG.unshift({name:P.guild.name,lvl:P.guild.level||1,members:(P.guild.members||[]).length||1,gold:GUILD_BANK.gold||0,leader:(P.guild.members&&P.guild.members[0]?P.guild.members[0].name:P.name),isSelf:true});
    }
    h='<table class="rank-table"><thead><tr><th>#</th><th>Hermandad</th><th>Líder</th><th>Nivel</th><th>Miembros</th><th>Tesorería</th></tr></thead><tbody>';
    topG.forEach((g,idx)=>{
      const medalCls=idx===0?'m1':idx===1?'m2':idx===2?'m3':'';
      const medalIco=idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':(idx+1);
      h+='<tr class="'+(g.isSelf?'self':'')+'">'+
        '<td class="rank-medal '+medalCls+'">'+medalIco+'</td>'+
        '<td style="color:var(--gold);font-weight:700">'+esc(g.name)+'</td>'+
        '<td>'+esc(g.leader)+'</td>'+
        '<td>Nv '+g.lvl+'</td>'+
        '<td>'+g.members+'</td>'+
        '<td style="color:#f4cf5b">'+g.gold+' oro</td>'+
      '</tr>';
    });
    h+='</tbody></table>';
  }
  content.innerHTML=h;
}

/* ---------- Salón de belleza y estilo (Barbería) ---------- */
let barberRotDir=1;
function renderBarberUI(){
  const p=$('pBarber');if(!p||p.hidden)return;
  P.app=P.app||{};
  P.titles=P.titles||['novice'];

  // Preview canvas
  const cv=$('barberPrevCv');
  if(cv){
    const ctx=cv.getContext('2d');
    ctx.clearRect(0,0,cv.width,cv.height);
    const grad=ctx.createRadialGradient(cv.width/2,cv.height-20,4,cv.width/2,cv.height-20,55);
    grad.addColorStop(0,'rgba(0,0,0,0.6)');grad.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(cv.width/2,cv.height-20,45,12,0,0,Math.PI*2);ctx.fill();
    const L=lookFor(P);
    drawHuman(ctx, cv.width/2, cv.height-26, L, {scale:3.4, dir:barberRotDir, t:G.worldT||0, moving:false});
  }

  const rotBtn=$('btnRotBarber');
  if(rotBtn){
    rotBtn.onclick=()=>{
      barberRotDir=barberRotDir===1?-1:1;
      renderBarberUI();
    };
  }

  const form=$('barberForm');
  if(form){
    let h='<div style="display:flex;flex-direction:column;gap:10px">';

    // Título
    h+='<div><label style="font-size:12px;color:var(--gold);font-weight:700">Título Honorífico</label>'+
      '<select id="barberTitleSelect" style="width:100%;margin-top:4px;background:var(--slot);border:1px solid var(--line);border-radius:4px;padding:6px;color:var(--ink)">'+
      '<option value="">Sin título</option>'+
      P.titles.map(t=>'<option value="'+t+'"'+(P.title===t?' selected':'')+'>'+getTitleName(t)+'</option>').join('')+
      '</select></div>';

    // Peinado
    h+='<div><label style="font-size:12px;color:var(--muted)">Estilo de Cabello</label><div id="barberHairStyles" style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap">';
    for(let i=1;i<=6;i++){
      h+='<button class="btn xs '+(P.app.hairStyle===i?'':'sec')+'" data-bstyle="'+i+'">Estilo '+i+'</button>';
    }
    h+='</div></div>';

    // Color de cabello
    h+='<div><label style="font-size:12px;color:var(--muted)">Color de Cabello</label><div id="barberHairColors" style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">';
    HAIRS.forEach(c=>{
      h+='<div class="barber-swatch'+(P.app.hair===c?' active':'')+'" style="background:'+c+'" data-bhair="'+c+'"></div>';
    });
    h+='</div></div>';

    // Tono de piel
    h+='<div><label style="font-size:12px;color:var(--muted)">Tono de Piel</label><div id="barberSkinColors" style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">';
    SKINS.forEach(c=>{
      h+='<div class="barber-swatch'+(P.app.skin===c?' active':'')+'" style="background:'+c+'" data-bskin="'+c+'"></div>';
    });
    h+='</div></div>';

    // Barba
    h+='<div><label style="font-size:12px;color:var(--muted)">Vello Facial / Barba</label><div id="barberBeardStyles" style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap">';
    const beards=[[0,'Sin barba'],[1,'Perilla'],[2,'Barba corta'],[3,'Barba completa']];
    beards.forEach(([id,lbl])=>{
      h+='<button class="btn xs '+((P.app.beard||0)===id?'':'sec')+'" data-bbeard="'+id+'">'+lbl+'</button>';
    });
    h+='</div></div>';

    h+='</div>';
    form.innerHTML=h;

    // Listeners
    const tSel=$('barberTitleSelect');
    if(tSel){
      tSel.onchange=()=>{
        setTitle(tSel.value);
        renderBarberUI();
        refreshUI();
      };
    }
    form.querySelectorAll('[data-bstyle]').forEach(b=>{
      b.onclick=()=>{P.app.hairStyle=+b.dataset.bstyle;renderBarberUI();sfx('equip')};
    });
    form.querySelectorAll('[data-bhair]').forEach(b=>{
      b.onclick=()=>{P.app.hair=b.dataset.bhair;renderBarberUI();sfx('equip')};
    });
    form.querySelectorAll('[data-bskin]').forEach(b=>{
      b.onclick=()=>{P.app.skin=b.dataset.bskin;renderBarberUI();sfx('equip')};
    });
    form.querySelectorAll('[data-bbeard]').forEach(b=>{
      b.onclick=()=>{P.app.beard=+b.dataset.bbeard;renderBarberUI();sfx('equip')};
    });
  }

  const btnSave=$('btnSaveBarber');
  if(btnSave){
    btnSave.onclick=()=>{
      save(true);
      burst(P.x,P.y-10,'#f4cf5b',20,150);
      sfx('level');
      toast('¡Aspecto y título guardados con éxito!');
      closePanel('pBarber');
      refreshUI();
    };
  }
}

/* ---------- Inspección de Personajes ---------- */
function openInspector(ent){
  ent=ent||P.target||P;
  if(!ent)return;
  P.inspectTarget=ent;
  const p=$('pInspect');if(!p)return;

  const tTitle=$('inspectTitle');
  if(tTitle)tTitle.textContent='INSPECCIÓN: '+ent.name;
  const nEl=$('inspectName');
  if(nEl)nEl.textContent=ent.name;
  const titEl=$('inspectTitleTxt');
  if(titEl)titEl.textContent=ent.title?'«'+getTitleName(ent.title)+'»':'';
  const gEl=$('inspectGuildTxt');
  if(gEl){
    const gName=ent.guild?(typeof ent.guild==='string'?ent.guild:ent.guild.name):(ent.bot?'Aventureros de Astra':'');
    gEl.textContent=gName?'<'+gName+'>':'';
  }
  const clsDef=CLS[ent.cls]||CLS.war;
  const cEl=$('inspectClassTxt');
  if(cEl)cEl.textContent='Nivel '+(ent.level||1)+' · '+(clsDef?clsDef.name:'Aventurero');

  // Stats
  if($('inspectHp'))$('inspectHp').textContent=Math.ceil(ent.hp||ent.maxhp||100)+' / '+(ent.maxhp||100);
  if($('inspectRes'))$('inspectRes').textContent=Math.floor(ent.res||100)+' / '+(ent.maxres||100);
  if($('inspectAtk'))$('inspectAtk').textContent=Math.round(ent.atk||(ent.dmg||25));
  if($('inspectArm'))$('inspectArm').textContent=Math.round(ent.armor||20);
  if($('inspectCrit'))$('inspectCrit').textContent=(ent.crit||5).toFixed(1)+'%';
  if($('inspectSpd'))$('inspectSpd').textContent='100%';

  // Canvas
  const cv=$('inspectCv');
  if(cv){
    const ctx=cv.getContext('2d');
    ctx.clearRect(0,0,cv.width,cv.height);
    const grad=ctx.createRadialGradient(cv.width/2,cv.height-20,4,cv.width/2,cv.height-20,55);
    grad.addColorStop(0,'rgba(0,0,0,0.6)');grad.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(cv.width/2,cv.height-20,45,12,0,0,Math.PI*2);ctx.fill();
    const L=lookFor(ent);
    drawHuman(ctx, cv.width/2, cv.height-26, L, {scale:3.4, dir:1, t:G.worldT||0, moving:false});
  }

  // Gear Grid
  const gearGrid=$('inspectGearGrid');
  if(gearGrid){
    let h='';
    const eq=ent.eq||(ent===P?P.eq:{});
    SLOTS.forEach(slot=>{
      const it=eq[slot];
      if(it){
        h+=itemBtn(it,'inspeq:'+slot,slot);
      }else{
        h+='<div class="it" style="opacity:0.35">'+svg(SLOT_IC[slot]||'chest','#888')+'</div>';
      }
    });
    gearGrid.innerHTML=h;
  }

  // Buttons
  const btnWh=$('btnInspectWhisper');
  if(btnWh)btnWh.onclick=()=>{closePanel('pInspect');openWhisper(ent.name)};
  const btnPt=$('btnInspectParty');
  if(btnPt)btnPt.onclick=()=>{closePanel('pInspect');partyInvite(ent.name)};
  const btnTr=$('btnInspectTrade');
  if(btnTr)btnTr.onclick=()=>{closePanel('pInspect');startTrade(ent)};

  showPanel('pInspect');
}
function rewardText(q){return '<span class="reward">Recompensa: <b>'+q.gold+' oro</b> · '+q.xp+' XP'+(q.item?' · objeto '+RAR[q.item.rar].n.toLowerCase():'')+'</span>'}
function renderQuests(){
  let h='';
  for(const id in P.quests){
    const s=P.quests[id],q=QUESTS[id];if(s.state==='done')continue;
    const r=questReady(id);
    h+='<div class="qrow'+(r?' ready':'')+'"><h4>'+esc(q.title)+'</h4><p>'+esc(q.text)+'</p><div class="obj">'+esc(q.obj.label)+': '+questProg(id)+'/'+q.obj.n+(r?' · ¡Completada! Vuelve con '+esc(npcName(q.giver)):'')+'</div>'+rewardText(q)+'</div>';
  }
  const done=Object.keys(P.quests).filter(k=>P.quests[k].state==='done').length;
  $('questList').innerHTML=(h||'<p class="reward">No tienes misiones activas. Habla con los habitantes que tengan un <b>!</b> sobre la cabeza.</p>')+(done?'<p class="reward" style="margin-top:8px">Misiones completadas: '+done+'</p>':'');
}
function talkNpc(n){
  if(n.id==='arnold'){closePanel('pDlg');showPanel('pBank');return}
  if(n.id==='barber'){closePanel('pDlg');showPanel('pBarber');return}
  if(n.id==='board_rank'){closePanel('pDlg');showPanel('pRankings');return}
  G.dlgNpc=n;dlgView=null;closePanel('pShop');closePanel('pLoot');closePanel('pMap');
  $('dlgName').textContent=n.name;showPanel('pDlg');sfx('open');
}
function renderDlg(){
  const n=G.dlgNpc;if(!n){closePanel('pDlg');return}
  let h='';
  if(dlgView){
    const q=QUESTS[dlgView.id],st=qState(dlgView.id),r=questReady(dlgView.id);
    h+='<h3 class="dlgtitle">'+esc(q.title)+'</h3>';
    if(dlgView.done)h+='<p class="dlgtext">'+esc(q.done)+'</p>';
    else if(r)h+='<p class="dlgtext">'+esc(q.done)+'</p>';
    else h+='<p class="dlgtext">'+esc(q.text)+'</p>';
    h+='<div class="obj reward">'+esc(q.obj.label)+': '+questProg(dlgView.id)+'/'+q.obj.n+'</div>'+rewardText(q)+'<div class="btns">';
    if(!st&&!dlgView.done)h+='<button class="btn" data-q="accept">Aceptar misión</button>';
    if(r)h+='<button class="btn" data-q="complete">Completar misión</button>';
    h+='<button class="btn sec" data-q="back">Volver</button></div>';
  }else{
    h+='<p class="dlgtext">'+esc(n.def.greet)+'</p>';
    for(const id in QUESTS){
      const q=QUESTS[id];if(q.giver!==n.id)continue;
      const r=questReady(id),av=questAvail(id),ac=qState(id)==='active';
      if(!r&&!av&&!ac)continue;
      h+='<button class="qlink" data-qid="'+id+'"><span class="mark'+(ac&&!r?' grey':'')+'">'+(av?'!':'?')+'</span><span>'+esc(q.title)+(q.lvl>P.level?'':'')+'</span></button>';
    }
    if(n.id==='arnold')h+='<button class="qlink" data-bank="1"><span class="mark">'+svg('bag','#ffd700')+'</span><span>Acceder a la Bóveda Bancaria</span></button>';
    if(n.id==='barber')h+='<button class="qlink" data-barber="1"><span class="mark">'+svg('star','#ff70d6')+'</span><span>Salón de Belleza y Títulos</span></button>';
    if(n.id==='board_rank')h+='<button class="qlink" data-rank="1"><span class="mark">'+svg('star','#ffd700')+'</span><span>Ver Clasificaciones</span></button>';
    if(n.id==='valerius')h+='<button class="qlink" data-guild="1"><span class="mark">'+svg('shield','#50e3c2')+'</span><span>Gestionar Hermandad</span></button>';
    if(n.def.shop)h+='<button class="qlink" data-shop="1"><span class="mark">'+svg('bag','#f4cf5b')+'</span><span>Comerciar</span></button>';
    h+='<div class="btns"><button class="btn sec" data-q="close">Despedirse</button></div>';
  }
  $('dlgBody').innerHTML=h;
}
function renderShop(){
  const n=G.shopNpc;if(!n){closePanel('pShop');return}
  const st=shopStock(n);$('shopName').textContent=n.name;
  let h='';
  st.forEach((e,i)=>{
    const it=e.item||{t:'cons',key:e.key,n:1},ok=P.gold>=e.price;
    h+='<button class="shoprow" data-buy="'+i+'" data-tip="buy:'+i+'">'+'<span class="it r'+(it.t==='gear'?it.rar:0)+'">'+itemIcon(it)+'</span><span>'+itemLabel(it)+'<br><span class="reward">'+(it.t==='gear'?'Nv '+it.lvl+' · '+statLine(it):'')+'</span></span><span class="price'+(ok?'':' no')+'">'+e.price+'</span></button>';
  });
  $('shopStock').innerHTML=h;
  let b='';
  P.inv.forEach((it,i)=>{b+='<button class="shoprow" data-sell="'+i+'" data-tip="sell:'+i+'"><span class="it r'+(it.t==='gear'?it.rar:0)+'">'+itemIcon(it)+'</span><span>'+itemLabel(it)+'</span><span class="price">'+(it.t!=='gear'&&ITEMS[it.key].quest?'—':sellValue(it))+'</span></button>'});
  $('shopBag').innerHTML=b||'<p class="reward">Mochila vacía</p>';
  $('shopGold').textContent='Tu oro: '+P.gold;
}
function openShop(n){G.shopNpc=n;closePanel('pDlg');showPanel('pShop');showPanel('pInv');sfx('open')}
function renderLoot(){
  const m=G.lootM;
  if(!m||!m.loot||(!m.loot.items.length&&m.loot.gold<=0)){closePanel('pLoot');return}
  $('lootName').textContent=m.name.toUpperCase();
  let h='';
  if(m.loot.gold>0)h+='<button class="lootrow" data-lg="1"><span class="it">'+svg('bag','#f4cf5b')+'</span><span class="price">'+m.loot.gold+' de oro</span></button>';
  m.loot.items.forEach((it,i)=>{h+='<button class="lootrow" data-li="'+i+'" data-tip="loot:'+i+'"><span class="it r'+(it.t==='gear'?it.rar:0)+'">'+itemIcon(it)+'</span><span>'+itemLabel(it)+'</span></button>'});
  $('lootBody').innerHTML=h;
}

/* ---------- Mapa y viaje rápido ---------- */
function travelCost(w){return Math.round(4+Math.hypot(w.tx*TILE-P.x,w.ty*TILE-P.y)/TILE*0.35)}
function openMap(){if($('pMap').hidden)showPanel('pMap');else closePanel('pMap')}
function renderMapInfo(){
  const w=WAYPOINTS.find(x=>x.id===G.mapSel);
  $('mapSel').textContent=w?w.name+' · '+travelCost(w)+' de oro':'';
  $('mapInfo').textContent=w?'Pulsa de nuevo el obelisco para viajar (3 s de canalización).':'Clic en un obelisco descubierto para viajar. Cuesta oro.';
}
function mapClick(e){
  const c=$('mapCv'),r=c.getBoundingClientRect(),mx=(e.clientX-r.left)/r.width*W,my=(e.clientY-r.top)/r.height*H;
  let best=null,bd=999;
  for(const w of WAYPOINTS){const d=Math.hypot(w.tx-mx,w.ty-my);if(d<bd){bd=d;best=w}}
  if(!best||bd>7){G.mapSel=null;renderMapInfo();return}
  if(!P.disc[best.id]){toast('Aún no has descubierto ese obelisco');return}
  if(G.mapSel===best.id){startTravel(best)}else{G.mapSel=best.id;renderMapInfo()}
}
function startTravel(w){
  if(P.combatT>0){toast('No puedes viajar en combate');return}
  const cost=travelCost(w);if(P.gold<cost){toast('Necesitas '+cost+' de oro');return}
  closePanel('pMap');P.mounted=false;P.path=[];P.intent=null;
  P.cast={ab:{name:'Viajando a '+w.name,col:'#bfe0ff'},t:null,time:0,dur:3,travel:true,fn:()=>{P.gold-=cost;teleportTo(w.gx,w.gy);banner(w.name,'Viaje rápido · -'+cost+' oro');refreshUI()}};
  fxBeam(P.x,P.y,'#bfe0ff',3);sfx('cast');
}
