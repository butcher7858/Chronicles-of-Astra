
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
const PANELS=['pInv','pChar','pQuest','pDlg','pShop','pLoot','pMap','pOpts','pSpells','pCraft','pTalents','pMounts','pGuild','pTrade'];
function showPanel(id){
  if(id==='pDlg'||id==='pShop'||id==='pLoot'||id==='pMap'||id==='pQuest')for(const o of ['pDlg','pShop','pLoot','pMap','pQuest','pOpts'])if(o!==id&&!(id==='pShop'&&o==='pDlg'&&false))closePanel(o);
  $(id).hidden=false;refreshUI();
}
function closePanel(id){
  const el=$(id);if(!el||el.hidden)return;el.hidden=true;
  if(id==='pShop')G.shopNpc=null;
  if(id==='pDlg'){G.dlgNpc=null;dlgView=null}
  if(id==='pLoot')G.lootM=null;
  if(id==='pMap')G.mapSel=null;
  hideTip();refreshUI();
}
function togglePanel(id){if($(id).hidden)showPanel(id);else closePanel(id)}

/* ---------- Objetos y tooltips ---------- */
function itemIcon(it){return it.t==='gear'?svg(SLOT_IC[it.slot],RAR[it.rar].c):svg(ITEMS[it.key].ic,ITEMS[it.key].col)}
function itemBtn(it,tip,i){
  const r=it.t==='gear'?it.rar:0;
  return '<button class="it r'+r+'" data-tip="'+tip+'" data-i="'+i+'">'+itemIcon(it)+(it.n>1?'<span class="cnt">'+it.n+'</span>':'')+'</button>';
}
function itemLabel(it){return it.t==='gear'?'<span style="color:'+RAR[it.rar].c+'">'+esc(it.name)+'</span>':esc(ITEMS[it.key].name)+(it.n>1?' x'+it.n:'')}
function statLine(it){
  const p=[];if(it.atk)p.push('+'+it.atk+' ataque');if(it.armor)p.push('+'+it.armor+' armadura');if(it.hp)p.push('+'+it.hp+' vida');if(it.crit)p.push('+'+it.crit+'% crít.');
  return p.join(' · ');
}
function gearTip(it){
  let h='<h5 style="color:'+RAR[it.rar].c+'">'+esc(it.name)+'</h5><div class="t2">'+RAR[it.rar].n+' · '+SLOT_NAME[it.slot]+' · Nivel '+it.lvl+'</div>';
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
  if(ty==='inv'||ty==='sell')it=P.inv[+a];
  else if(ty==='eq')it=P.eq[a];
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
  if(it.t==='gear')return gearTip(it);
  const d=ITEMS[it.key];
  return '<h5>'+d.name+'</h5><p>'+(d.desc||'Objeto diverso.')+'</p><div class="t2">'+(d.quest?'Objeto de misión':'Vale '+Math.max(1,Math.floor(d.price*0.4))+' de oro')+'</div>';
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
function buildActionBar(){
  const bar=$('actionbar');if(!bar)return;
  bar.innerHTML='';AB=[];
  const c=CLS[P.cls];
  if(!P.actionBar||!P.actionBar.length){
    P.actionBar=[0,1,2,3,4,5,6,7,8,9,10,11];
  }
  const maxSlots=12;
  const keyLabels=['1','2','3','4','5','6','7','8','9','0','-','='];
  for(let i=0;i<maxSlots;i++){
    const abIdx=P.actionBar[i]!==undefined?P.actionBar[i]:i;
    const ab=c.ab[abIdx];
    const b=document.createElement('button');
    b.className='slot'+(!ab||ab.ul>P.level?' lock':'');
    b.draggable=true;
    b.dataset.slotIdx=i;
    const keyBadge=(typeof KEYBINDS!=='undefined'&&KEYBINDS[String(i+1)])?prettyCombo(KEYBINDS[String(i+1)]):keyLabels[i];
    if(ab){
      b.dataset.ul=ab.ul;
      b.setAttribute('data-tip','ab:'+abIdx);
      b.innerHTML=svg(ab.ic,ab.col)+'<span class="k">'+keyBadge+'</span><span class="cd"></span><span class="cdt"></span>';
      b.onclick=e=>{e.currentTarget.blur();tryUse(i)};
      b.ondragstart=e=>{e.dataTransfer.setData('text/plain','slot:'+i)};
      AB.push({el:b,cd:b.querySelector('.cd'),cdt:b.querySelector('.cdt'),ab:ab,ul:ab.ul});
    }else{
      b.innerHTML='<span class="k">'+keyBadge+'</span><span class="cd"></span><span class="cdt"></span>';
      b.onclick=e=>{e.currentTarget.blur();tryUse(i)};
      AB.push({el:b,cd:b.querySelector('.cd'),cdt:b.querySelector('.cdt'),ab:null,ul:99});
    }
    b.ondragover=e=>e.preventDefault();
    b.ondrop=e=>{
      e.preventDefault();
      const data=e.dataTransfer.getData('text/plain');
      if(data&&data.startsWith('spell:')){
        const fromIdx=+data.split(':')[1];
        P.actionBar[i]=fromIdx;
        buildActionBar();
        toast('Habilidad asignada a la ranura '+(i+1));
      }else if(data&&data.startsWith('slot:')){
        const fromSlot=+data.split(':')[1];
        const tmp=P.actionBar[i];
        P.actionBar[i]=P.actionBar[fromSlot];
        P.actionBar[fromSlot]=tmp;
        buildActionBar();
      }
    };
    bar.appendChild(b);
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
    const s=AB[i];let cd=0,tot=1,off=false;
    if(s.ab){
      cd=P.cds[s.ab.id]||0;tot=s.ab.cd||1;
      if(!cd&&P.gcd>0&&!s.ab.noGcd){cd=P.gcd;tot=1}
      off=P.level>=s.ul&&P.res<(s.ab.cost||0);
      if(P.level>=s.ul&&s.el.classList.contains('lock'))s.el.classList.remove('lock');
    }else if(s.kind==='herb'){cd=P.cds.herb||0;tot=10;const n=countItem('herb');off=n<1;if(HC.herbn!==n){HC.herbn=n;s.cnt.textContent=n||''}}
    else{cd=P.cds.pot||0;tot=30;const n=potCount(s.kind);off=n<1;const k='pn'+s.kind;if(HC[k]!==n){HC[k]=n;s.cnt.textContent=n||''}}
    const hh=cd>0?Math.min(100,cd/tot*100):0;
    s.cd.style.height=hh+'%';
    const tx=cd>1?Math.ceil(cd)+'':cd>0.05&&tot>1.5?cd.toFixed(1):'';
    if(s.cdt.textContent!==tx)s.cdt.textContent=tx;
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
  for(const [btnId,pId] of [
    ['bInv','pInv'],['bChar','pChar'],['bQuest','pQuest'],['bMap','pMap'],['bOpts','pOpts'],
    ['bSpells','pSpells'],['bCraft','pCraft'],['bTal','pTalents'],['bMount','pMounts'],['bGuild','pGuild']
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
  let h='';
  for(let i=0;i<MAXINV;i++){const it=P.inv[i];h+=it?itemBtn(it,'inv:'+i,i):'<div class="it"></div>'}
  $('invGrid').innerHTML=h;$('invCount').textContent=P.inv.length+' / '+MAXINV+' · '+P.gold+' oro';
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
  if($('eqGrid'))$('eqGrid').innerHTML=SLOTS.map(slotBtn).join('');
  renderCharPaperdoll();
  if($('btnRotChar'))$('btnRotChar').onclick=()=>{P.paperDir=-(P.paperDir||1);renderCharPaperdoll()};
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
    if(P.actionBar){
      assignedSlot=P.actionBar.indexOf(i);
    }
    
    let selectOpts='<option value="-1">Asignar a barra...</option>';
    for(let s=0;s<12;s++){
      selectOpts+='<option value="'+s+'"'+(assignedSlot===s?' selected':'')+'>Ranura '+(s+1)+'</option>';
    }

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
    
    const outIc=r.out?(ITEMS[r.out.key]?ITEMS[r.out.key].ic:'potion'):(SLOT_IC[r.slot]||'sword');
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
          '<span class="reward" style="font-size:11px">Nv. '+r.lvl+' · '+(r.cat==='alch'?'Alquimia':r.cat==='blacksmith'?'Herrería':'Joyería')+'</span>'+
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
