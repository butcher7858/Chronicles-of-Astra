
/* =====================================================================
   Entrada, guardado, pantalla de inicio y arranque
   ===================================================================== */
function syncToggles(){
  const set=(id,v)=>$(id).setAttribute('aria-pressed',v?'true':'false');
  set('tgLoot',G.autoLoot);set('tgSound',G.sfxOn);set('tgRun',G.sprintToggle);set('tgShake',!G.shakeOff);
}

/* ---------- Eventos de paneles ---------- */
function bindPanels(){
  document.addEventListener('click',e=>{
    const c=e.target.closest('[data-close]');if(c){closePanel(c.getAttribute('data-close'))}
  });
  if($('invGrid'))$('invGrid').addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(b){useInv(+b.dataset.i);hideTip()}});
  const onEqClick=e=>{const b=e.target.closest('[data-i]');if(b){unequip(b.dataset.i);hideTip()}};
  if($('eqGrid'))$('eqGrid').addEventListener('click',onEqClick);
  if($('eqLeft'))$('eqLeft').addEventListener('click',onEqClick);
  if($('eqRight'))$('eqRight').addEventListener('click',onEqClick);
  if($('btnSort'))$('btnSort').onclick=sortInv;
  if($('btnJunk'))$('btnJunk').onclick=sellJunk;
  if($('dlgBody'))$('dlgBody').addEventListener('click',e=>{
    const n=G.dlgNpc;if(!n)return;
    const qid=e.target.closest('[data-qid]'),act=e.target.closest('[data-q]'),sh=e.target.closest('[data-shop]');
    if(sh){openShop(n);return}
    if(qid){dlgView={id:qid.dataset.qid};renderDlg();return}
    if(act){
      const a=act.dataset.q;
      if(a==='close')closePanel('pDlg');
      else if(a==='back'){dlgView=null;renderDlg()}
      else if(a==='accept'){acceptQuest(dlgView.id);dlgView=null;renderDlg()}
      else if(a==='complete'){const id=dlgView.id;completeQuest(id);dlgView={id:id,done:true};renderDlg()}
    }
  });
  if($('shopStock'))$('shopStock').addEventListener('click',e=>{const b=e.target.closest('[data-buy]');if(b){buyStock(shopStock(G.shopNpc)[+b.dataset.buy])}});
  if($('shopBag'))$('shopBag').addEventListener('click',e=>{const b=e.target.closest('[data-sell]');if(b){sellInv(+b.dataset.sell);hideTip()}});
  if($('lootBody'))$('lootBody').addEventListener('click',e=>{
    const m=G.lootM;if(!m)return;
    const g=e.target.closest('[data-lg]'),i=e.target.closest('[data-li]');
    if(g)takeLootGold(m);else if(i){takeLootItem(m,+i.dataset.li);hideTip()}
  });
  if($('btnLootAll'))$('btnLootAll').onclick=()=>{if(G.lootM)lootAll(G.lootM)};
  if($('mapCv'))$('mapCv').addEventListener('click',mapClick);
  if($('miniWrap'))$('miniWrap').onclick=openMap;
  if($('btnRevive'))$('btnRevive').onclick=revive;
  const tg=(id,fn)=>{const el=$(id);if(el)el.addEventListener('click',()=>{const v=el.getAttribute('aria-pressed')!=='true';el.setAttribute('aria-pressed',v?'true':'false');fn(v)})};
  tg('tgLoot',v=>{G.autoLoot=v});tg('tgSound',v=>{G.sfxOn=v});tg('tgRun',v=>{G.sprintToggle=v});tg('tgShake',v=>{G.shakeOff=!v});
  if($('btnSave'))$('btnSave').onclick=()=>save(true);
  if($('btnSwitch'))$('btnSwitch').onclick=()=>switchChar();
  if($('btnLogout'))$('btnLogout').onclick=()=>doLogout();
  if($('bInv'))$('bInv').onclick=()=>togglePanel('pInv');
  if($('bChar'))$('bChar').onclick=()=>togglePanel('pChar');
  if($('bQuest'))$('bQuest').onclick=()=>togglePanel('pQuest');
  if($('bMap'))$('bMap').onclick=openMap;
  if($('bOpts'))$('bOpts').onclick=()=>togglePanel('pOpts');
  if($('bMount'))$('bMount').onclick=toggleMount;
  if($('bChat'))$('bChat').onclick=()=>{if($('chat'))$('chat').classList.toggle('open')};
}

/* ---------- Chat ---------- */
function chatSend(txt){
  txt=txt.trim();if(!txt)return;
  if(txt[0]==='/'){
    const c=txt.slice(1).toLowerCase().split(' ')[0];
    if(c==='ayuda'||c==='help')log('Comandos: /ayuda · /hora · /pos · /guardar · /bailar · /quien','sys');
    else if(c==='hora')log('Son las '+clockText()+' en Astra.','sys');
    else if(c==='pos')log('Estás en '+(G.zone?G.zone.name:'?')+' ('+Math.floor(P.x/TILE)+', '+Math.floor(P.y/TILE)+')','sys');
    else if(c==='guardar')save(true);
    else if(c==='quien'||c==='who'){const n=Object.values(MP.remote).map(e=>e.name);log('En línea: '+esc([P.name].concat(n).join(', ')),'sys')}
    else if(c==='bailar'){P.dance=3;burst(P.x,P.y-30,'#ffe08a',10,80);log(esc(P.name)+' baila alegremente.','sys')}
    else log('Comando desconocido. Prueba /ayuda','sys');
    return;
  }
  MP.chat(txt.slice(0,200));
}

/* ---------- Teclado y ratón ---------- */
function keyName(e){return e.key.length===1?e.key.toLowerCase():e.key}
function bindInput(){
  const chatIn=$('chatIn');
  window.addEventListener('keydown',e=>{
    if(!G.started)return;
    if(document.activeElement===chatIn){
      if(e.key==='Enter'){chatSend(chatIn.value);chatIn.value='';chatIn.blur()}
      else if(e.key==='Escape'){chatIn.value='';chatIn.blur()}
      return;
    }
    const k=keyName(e);
    if(e.repeat&&k!=='Tab'){G.keys[k]=true;return}
    G.keys[k]=true;
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].indexOf(e.key)>=0)e.preventDefault();
    if(P.dead)return;
    if(k>='1'&&k<='6')tryUse(+k-1);
    else if(k==='7')usePotion('hp');else if(k==='8')usePotion('mp');else if(k==='9')useHerb();
    else if(k===' ')dodge();
    else if(k==='Tab')cycleTarget();
    else if(k==='f'||k==='e')interact();
    else if(k==='z'){if(!lootNearby())toast('No hay botín cerca')}
    else if(k==='h')toggleMount();
    else if(k==='m')openMap();
    else if(k==='b')togglePanel('pInv');else if(k==='c')togglePanel('pChar');else if(k==='l')togglePanel('pQuest');else if(k==='o')togglePanel('pOpts');
    else if(k==='Escape'){let any=false;for(const id of PANELS)if(!$(id).hidden){closePanel(id);any=true}if(!any){P.target=null;P.autoAtk=false}}
    else if(k==='Enter'){$('chat').classList.add('open');chatIn.focus();e.preventDefault()}
  });
  window.addEventListener('keyup',e=>{G.keys[keyName(e)]=false;if(e.key==='Shift')G.keys.Shift=false});
  window.addEventListener('blur',()=>{G.keys={}});
  cv.addEventListener('contextmenu',e=>e.preventDefault());
  cv.addEventListener('pointerdown',e=>{
    if(!G.started||P.dead)return;
    if(e.pointerType==='touch')document.body.classList.add('touch');
    const w=screenToWorld(e.clientX,e.clientY);
    clickWorld(w.x,w.y,e.button===2);
    hideTip();
  });
  cv.addEventListener('wheel',e=>{
    if(!G.started)return;e.preventDefault();
    G.zoom=clamp(G.zoom*(e.deltaY<0?1.08:0.926),0.7,1.5);ZM=G.zoom*(Math.min(vw,vh)<560?0.8:1);
  },{passive:false});
  // joystick táctil
  const joy=$('joy'),knob=$('joyKnob');let jid=null;
  const jmove=e=>{
    const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,R=r.width/2;
    let dx=(e.clientX-cx)/R,dy=(e.clientY-cy)/R;const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l}
    G.joy={on:l>0.18,x:dx,y:dy};knob.style.transform='translate('+dx*R*0.55+'px,'+dy*R*0.55+'px)';
  };
  joy.addEventListener('pointerdown',e=>{jid=e.pointerId;joy.setPointerCapture(jid);document.body.classList.add('touch');jmove(e);e.preventDefault()});
  joy.addEventListener('pointermove',e=>{if(e.pointerId===jid)jmove(e)});
  const jend=e=>{if(e.pointerId===jid){jid=null;G.joy=null;knob.style.transform=''}};
  joy.addEventListener('pointerup',jend);joy.addEventListener('pointercancel',jend);
  $('tbAct').onclick=interact;$('tbDodge').onclick=dodge;$('tbRun').onclick=()=>{G.sprintToggle=!G.sprintToggle;syncToggles()};
  try{if(window.matchMedia('(pointer:coarse)').matches)document.body.classList.add('touch')}catch(e){}
  window.addEventListener('resize',resize);
  window.addEventListener('beforeunload',saveOnExit);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)saveOnExit()});
  setInterval(()=>{if(G.started)save(false)},20000);
}

