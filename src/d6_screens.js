
/* =====================================================================
   Pantallas: acceso, selección de personaje, creación, confirmación,
   fondo de acercamiento al mundo y sesión de juego
   ===================================================================== */
const SCREENS=['sAuth','sChars','sCreate'];
const Sess={user:null,chars:[],sel:null,saving:false,saveErr:0,cur:null};
function showScreen(name){
  for(const id of SCREENS)$(id).hidden=id!==name;
  $('scr').hidden=false;$('hud').hidden=true;$('death').hidden=true;
  const sc=$('scr');sc.scrollTop=0;
}

/* ---------- Fondo: cámara que recorre la Villa ---------- */
function enterShowcase(){
  G.started=false;G.showcase=true;G.zoom=1.5;
  newGame('war','Observador');
  P.x=43*TILE+16;P.y=77*TILE+16;P.dead=false;
  for(const w of WAYPOINTS)P.disc[w.id]=1;
  zoneKey='';G.worldT=300*0.3; // media mañana
  resize();
}
function showcaseTick(dt){
  G.worldT+=dt*0.12*60/60; // día algo más vivo que en el juego
  update(dt);
  const t=G.time*0.05;
  const cx0=43*TILE+16+Math.sin(t)*TILE*9,cy0=72*TILE+Math.sin(t*1.7+1)*TILE*5;
  camX=clamp(cx0-vw/ZM/2,0,Math.max(0,W*TILE-vw/ZM));
  camY=clamp(cy0-vh/ZM/2,0,Math.max(0,H*TILE-vh/ZM));
  G.shake=0;
}

/* ---------- Confirmación ---------- */
function askConfirm(title,text,yes){
  return new Promise(res=>{
    $('cfT').textContent=title;$('cfP').textContent=text;$('cfYes').textContent=yes||'Aceptar';
    $('confirm').hidden=false;$('cfNo').focus();
    const done=v=>{$('confirm').hidden=true;$('cfYes').onclick=$('cfNo').onclick=null;document.removeEventListener('keydown',kd,true);res(v)};
    const kd=e=>{if(e.key==='Escape'){e.stopPropagation();done(false)}};
    document.addEventListener('keydown',kd,true);
    $('cfYes').onclick=()=>done(true);$('cfNo').onclick=()=>done(false);
  });
}

/* ---------- Acceso ---------- */
let authMode='in';
function setAuthMode(m){
  authMode=m;
  $('tabIn').setAttribute('aria-selected',m==='in');$('tabUp').setAttribute('aria-selected',m==='up');
  $('aPass2Row').hidden=m!=='up';$('aGo').textContent=m==='in'?'Entrar':'Crear cuenta';
  $('aPass').autocomplete=m==='in'?'current-password':'new-password';
  setMsg('aMsg','');
}
function setMsg(id,t,ok){const e=$(id);e.textContent=t||'';e.classList.toggle('ok',!!ok)}
function bindAuth(){
  $('tabIn').onclick=()=>setAuthMode('in');$('tabUp').onclick=()=>setAuthMode('up');
  const b=$('srvBadge');
  b.classList.toggle('local',BE.mode!=='supabase');
  b.querySelector('span').textContent=BE.mode==='supabase'?'Servidor Supabase conectado':'Modo local (sin servidor · datos en este navegador)';
  const tm=$('btnToggleMode');
  if(tm){
    tm.textContent=BE.mode==='supabase'?'Cambiar a Modo Local (offline)':'Conectar a Supabase (online)';
    tm.onclick=()=>{
      if(BE.mode==='supabase'){
        localStorage.setItem('astra_force_local','1');
      }else{
        localStorage.removeItem('astra_force_local');
      }
      location.reload();
    };
  }
  const cs=$('btnConfigSupabase');
  if(cs){
    cs.onclick=()=>{
      const u=prompt('URL de tu proyecto Supabase:\n(ej. https://xxxxxx.supabase.co)',ACFG.SUPABASE_URL||'');
      if(u===null)return;
      const k=prompt('Anon Public Key de Supabase:\n(ej. eyJhbGciOi...)',ACFG.SUPABASE_ANON_KEY||'');
      if(k===null)return;
      if(u.trim()&&k.trim()){
        localStorage.setItem('astra_sb_config',JSON.stringify({SUPABASE_URL:u.trim(),SUPABASE_ANON_KEY:k.trim()}));
        localStorage.removeItem('astra_force_local');
        location.reload();
      }else{
        localStorage.removeItem('astra_sb_config');
        location.reload();
      }
    };
  }
  if(b)b.onclick=()=>{if(tm)tm.click()};
  $('authForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const mail=$('aMail').value.trim(),pw=$('aPass').value;
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail))return setMsg('aMsg','Escribe un correo válido.');
    if(pw.length<6)return setMsg('aMsg','La contraseña debe tener al menos 6 caracteres.');
    if(authMode==='up'&&pw!==$('aPass2').value)return setMsg('aMsg','Las contraseñas no coinciden.');
    $('aGo').disabled=true;setMsg('aMsg','Conectando…',true);
    try{
      if(authMode==='up'){
        const r=await BE.signUp(mail,pw);
        if(r.needsConfirm){setMsg('aMsg','Cuenta creada. Confirma tu correo y luego entra.',true);setAuthMode('in');return}
      }else await BE.signIn(mail,pw);
      $('aPass').value='';$('aPass2').value='';
      await openChars();
    }catch(err){
      const isNet=/No hay conexión|NetworkError|Failed to fetch/i.test(err.message);
      if(isNet&&BE.mode==='supabase'){
        setMsg('aMsg',err.message+' — ¿Sin conexión? Haz clic abajo para entrar en Modo Local.');
      }else{
        setMsg('aMsg',err.message);
      }
    }
    finally{$('aGo').disabled=false}
  });
}

/* ---------- Selección de personaje ---------- */
function ago(iso){
  if(!iso)return '';const s=(Date.now()-new Date(iso).getTime())/1000;
  if(s<90)return 'ahora mismo';if(s<3600)return 'hace '+Math.round(s/60)+' min';
  if(s<86400)return 'hace '+Math.round(s/3600)+' h';return 'hace '+Math.round(s/86400)+' d';
}
function portrait(cv_,row){
  const g=cv_.getContext('2d');cv_.width=208;cv_.height=240;g.clearRect(0,0,208,240);
  g.save();g.scale(2,2);
  const cls=CLS[row.class]?row.class:'war',L=lookFor(cls,row.appearance,null);
  drawHuman(g,52,112,L,{dir:1,t:0,scale:2.3});g.restore();
}
async function openChars(){
  Sess.user=BE.session();
  $('cMail').textContent=(Sess.user&&Sess.user.email)||'';
  showScreen('sChars');
  $('cGrid').innerHTML='<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:30px">Cargando personajes…</div>';
  try{Sess.chars=await BE.listChars()}catch(e){Sess.chars=[];$('cGrid').innerHTML='<div style="grid-column:1/-1;color:#ff9a86">'+esc(e.message)+'</div>';return}
  if(!Sess.sel||!Sess.chars.some(c=>c.id===Sess.sel))Sess.sel=Sess.chars[0]?Sess.chars[0].id:null;
  renderChars();
  BE.top(5).then(t=>{
    $('cTop').innerHTML='<h4>MÁS PODEROSOS DE ASTRA</h4>'+(t||[]).map((r,i)=>'<div><span>'+(i+1)+'. '+esc(r.name)+'</span><span>Nv '+r.level+' · '+esc((CLS[r.class]||{name:r.class}).name)+'</span></div>').join('');
  }).catch(()=>{});
}
function renderChars(){
  const grid=$('cGrid');grid.innerHTML='';
  for(const row of Sess.chars){
    const c=CLS[row.class]||CLS.war,d=document.createElement('div');
    d.className='cc'+(row.id===Sess.sel?' sel':'');d.tabIndex=0;d.setAttribute('role','button');d.setAttribute('aria-label','Personaje '+row.name);
    const zn=(Z.find(z=>z.id===row.zone)||{}).name||'Villa Alba';
    d.innerHTML='<canvas></canvas><b></b><span class="m1"></span><span class="m2"></span><button class="del" title="Eliminar personaje" aria-label="Eliminar '+esc(row.name)+'">'+svg('skull','currentColor')+'</button>';
    d.querySelector('b').textContent=row.name;
    d.querySelector('.m1').textContent='Nv '+row.level+' · '+c.name;
    d.querySelector('.m2').textContent=zn+(row.last_seen?' · '+ago(row.last_seen):'');
    portrait(d.querySelector('canvas'),row);
    const pickIt=()=>{Sess.sel=row.id;renderChars()};
    d.onclick=e=>{if(e.target.closest('.del'))return;pickIt()};
    d.ondblclick=e=>{if(!e.target.closest('.del')){Sess.sel=row.id;$('cPlay').click()}};
    d.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();pickIt()}};
    d.querySelector('.del').onclick=async e=>{
      e.stopPropagation();
      const ok=await askConfirm('¿Eliminar a '+row.name+'?','Se borrará para siempre el personaje, su equipo y su progreso. Esta acción no se puede deshacer.','Eliminar');
      if(!ok)return;
      try{await BE.deleteChar(row.id);if(Sess.sel===row.id)Sess.sel=null;await openChars()}catch(err){alert(err.message)}
    };
    grid.appendChild(d);
  }
  if(Sess.chars.length<MAX_CHARS){
    const n=document.createElement('button');n.className='cc new';
    n.innerHTML='<span class="plus">+</span>Crear personaje<span>'+Sess.chars.length+' / '+MAX_CHARS+'</span>';
    n.onclick=openCreate;grid.appendChild(n);
  }
  const s=Sess.chars.find(c=>c.id===Sess.sel);
  $('cPlay').disabled=!s;$('cHint').textContent=s?s.name+' · '+(CLS[s.class]||CLS.war).name:(Sess.chars.length?'Elige un personaje':'Crea tu primer personaje');
}

/* ---------- Creación ---------- */
const K={cls:'paladin',app:null,touched:false,raf:0};
function openCreate(){
  if(!K.app)K.app=defaultApp(K.cls);
  K.touched=false;K.cls=K.cls||'paladin';K.app=defaultApp(K.cls);
  $('kName').value=pick(BOT_NAMES);setMsg('kMsg','');
  buildCreate();showScreen('sCreate');
  cancelAnimationFrame(K.raf);const loop=ts=>{if($('sCreate').hidden)return;drawPreview(ts/1000);K.raf=requestAnimationFrame(loop)};K.raf=requestAnimationFrame(loop);
}
function setCls(k){
  K.cls=k;if(!K.touched)K.app=defaultApp(k);
  buildCreate();
}
function buildCreate(){
  const row=$('kCls');row.innerHTML='';
  for(const k of CLASS_ORDER){
    const c=CLS[k],d=document.createElement('div');d.className='cls';d.setAttribute('role','radio');d.tabIndex=0;d.setAttribute('aria-checked',k===K.cls?'true':'false');
    d.innerHTML='<div class="portrait">'+svg(c.icon,c.color)+'</div><h3>'+c.name+'</h3>';
    d.onclick=()=>setCls(k);d.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setCls(k)}};
    row.appendChild(d);
  }
  const c=CLS[K.cls];
  $('kDesc').innerHTML='<b style="color:'+c.color+'">'+c.name+'</b> · '+esc(c.tag||'')+' — '+esc(c.desc);
  $('kOrder').innerHTML='<b>'+esc(c.orden||'')+'</b>'+esc(c.lore||'');
  const A=K.app,box=$('kApp');box.innerHTML='';
  const touch=()=>{K.touched=true};
  const sw=(label,list,key,none)=>{
    const r=document.createElement('div');r.className='arow';r.innerHTML='<label>'+label+'</label><div class="sw"></div>';
    const s=r.querySelector('.sw');
    list.forEach(v=>{
      const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',label+' '+(v||'original'));
      if(v)b.style.background=v;else b.className='none';
      b.setAttribute('aria-pressed',A[key]===v?'true':'false');
      b.onclick=()=>{touch();A[key]=v;if(key==='hair'&&A.beard)A.beardColor=v;for(const o of s.children)o.setAttribute('aria-pressed','false');b.setAttribute('aria-pressed','true')};
      s.appendChild(b);
    });box.appendChild(r);
  };
  const st=(label,names,get,set)=>{
    const r=document.createElement('div');r.className='arow';r.innerHTML='<label>'+label+'</label><div class="stp"><button type="button" aria-label="Anterior">‹</button><span></span><button type="button" aria-label="Siguiente">›</button></div>';
    const sp=r.querySelector('span'),bs=r.querySelectorAll('button');
    const upd=()=>{sp.textContent=names[get()]};upd();
    bs[0].onclick=()=>{touch();set((get()+names.length-1)%names.length);upd()};
    bs[1].onclick=()=>{touch();set((get()+1)%names.length);upd()};
    box.appendChild(r);
  };
  sw('Piel',SKINT,'skin');
  st('Peinado',HAIRN,()=>A.hairStyle,v=>{A.hairStyle=v});
  sw('Pelo',HAIRC,'hair');
  st('Barba',BEARDN,()=>A.beard||0,v=>{A.beard=v;A.beardColor=A.hair});
  sw('Ojos',EYEC,'eye');
  st('Marcas',MARKN,()=>A.mark||0,v=>{A.mark=v});
  sw('Atuendo',OUTC,'outfit');
  const hn=['Automático','Mostrar','Ocultar'];
  st('Casco',hn,()=>A.showHat===null||A.showHat===undefined?0:(A.showHat?1:2),v=>{A.showHat=v===0?null:v===1});
}
function drawPreview(t){
  const cvp=$('kPrev'),g=cvp.getContext('2d');
  g.clearRect(0,0,cvp.width,cvp.height);
  const L=lookFor(K.cls,K.app,null);
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(130,268,64,14,0,0,6.283);g.fill();
  drawHuman(g,130,268,L,{dir:K.dir||1,t:t,scale:5.2});
}
function validName(n){return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{2,13}$/.test(n)}
function bindScreens(){
  bindAuth();
  if($('kPrev')){
    $('kPrev').style.cursor='pointer';
    $('kPrev').title='Haz clic para rotar el personaje';
    $('kPrev').onclick=()=>{K.dir=-(K.dir||1)};
  }
  $('cOut').onclick=()=>doLogout();
  $('cPlay').onclick=()=>{const r=Sess.chars.find(c=>c.id===Sess.sel);if(r)enterWorld(r)};
  $('kBack').onclick=()=>{cancelAnimationFrame(K.raf);openChars()};
  $('kRnd').onclick=()=>{$('kName').value=pick(BOT_NAMES);K.app=randomApp(K.cls);K.touched=true;buildCreate()};
  $('kMake').onclick=async()=>{
    const name=$('kName').value.trim().replace(/\s+/g,' ');
    if(!validName(name))return setMsg('kMsg','El nombre debe tener 3–14 letras (se permiten espacios, guion y apóstrofe).');
    $('kMake').disabled=true;setMsg('kMsg','Creando…',true);
    try{
      const row=await BE.createChar({name:name,cls:K.cls,app:K.app});
      Sess.sel=row.id;cancelAnimationFrame(K.raf);await openChars();
    }catch(e){setMsg('kMsg',e.message)}
    finally{$('kMake').disabled=false}
  };
}

/* ---------- Guardado ---------- */
function snapshot(){
  const ch={id:P.charId,level:P.level,x:Math.round(P.x),y:Math.round(P.y),zone:(G.zone&&G.zone.id)||'town',kills:P.kills|0,appearance:P.app};
  const st={xp:P.xp|0,gold:P.gold|0,inv:P.inv,eq:P.eq,quests:P.quests,disc:P.disc,explored:bitsPack(G.explored),world_time:Math.round(G.worldT),
    talents:P.talents||{},mount:P.mount||'horse',mounts:P.mounts||['horse'],guild:P.guild||null,
    bags:P.bags||[null,null,null,null],bank:P.bank||[],bankGold:P.bankGold||0,
    achievements:P.achievements||{},titles:P.titles||['novice'],title:P.title||'',
    actionBar:P.actionBar||[],actionBar2:P.actionBar2||[],recipes:P.recipes||{},
    craftedCount:P.craftedCount||0,duelsWon:P.duelsWon||0,dungeonsCleared:P.dungeonsCleared||0,visitedZones:P.visitedZones||{},
    options:{autoLoot:G.autoLoot,sfx:G.sfxOn,run:G.sprintToggle,shake:!G.shakeOff}};
  return {ch:ch,st:st};
}
async function save(manual){
  if(!P||!G.started||!P.charId||Sess.saving)return;
  Sess.saving=true;
  try{
    const s=snapshot();await BE.saveChar(s.ch,s.st);Sess.saveErr=0;
    if(manual)toast('Partida guardada');
  }catch(e){
    Sess.saveErr++;
    if(manual||Sess.saveErr===3)toast('No se pudo guardar: '+e.message);
  }finally{Sess.saving=false}
}
function saveOnExit(){
  if(!P||!G.started||!P.charId)return;
  const s=snapshot();BE.saveBeacon(s.ch,s.st);
}

/* ---------- Entrar / salir del mundo ---------- */
async function enterWorld(row){
  $('cPlay').disabled=true;$('cHint').textContent='Entrando a Astra…';
  let st=null;
  try{st=await BE.loadState(row.id)}catch(e){$('cHint').textContent='Error: '+e.message;$('cPlay').disabled=false;return}
  newGame(CLS[row.class]?row.class:'war',row.name,row.appearance);
  P.charId=row.id;P.level=Math.max(1,Math.min(MAXLV,row.level||1));P.kills=row.kills||0;
  if(st){
    P.xp=st.xp|0;P.gold=st.gold|0;P.inv=st.inv||[];
    P.eq=Object.assign({weapon:null,head:null,chest:null,boots:null},st.eq||{});
    P.quests=st.quests||{};P.disc=st.disc||{town:1};
    if(st.explored)G.explored.set(bitsUnpack(st.explored,G.explored.length));
    G.worldT=st.world_time||0;
    P.talents=st.talents||{};
    P.mount=st.mount||'horse';
    P.mounts=st.mounts||['horse'];
    P.guild=st.guild||null;
    P.bags=st.bags||[null,null,null,null];
    P.bank=st.bank||[];
    P.bankGold=st.bankGold||0;
    P.achievements=st.achievements||{};
    P.titles=st.titles||['novice'];
    P.title=st.title||'';
    P.actionBar=st.actionBar||[0,1,2,3,4,5,6,7,8,9,10,11];
    P.actionBar2=st.actionBar2||[12,13,14,0,1,2,3,4,5,6,7,8];
    P.recipes=st.recipes||{hp1:true,mp1:true};
    P.craftedCount=st.craftedCount||0;
    P.duelsWon=st.duelsWon||0;
    P.dungeonsCleared=st.dungeonsCleared||0;
    P.visitedZones=st.visitedZones||{town:1};
    const o=st.options||{};
    G.autoLoot=o.autoLoot!==false;G.sfxOn=o.sfx!==false;G.sprintToggle=!!o.run;G.shakeOff=o.shake===false;
  }
  if(row.x!=null&&!hitsWall(row.x,row.y,9)){P.x=row.x;P.y=row.y}
  recalc();P.hp=P.maxhp;P.res=CLS[P.cls].res==='rage'?0:P.maxres;
  Sess.cur=row;
  startGame();
  MP.start();
  save(false);
}
function startGame(){
  G.started=true;G.showcase=false;G.zoom=1;zoneKey='';
  $('scr').hidden=true;$('hud').hidden=false;$('chatLog').innerHTML='';
  syncToggles();rebuildExplored();revealAround();
  resize();buildActionBar();refreshUI();
  G.snapCam=true;update(0.016);
  log('Bienvenido a Astra, '+esc(P.name)+'.','sys');
  log('Habla con la Capitana Elara (señalada con <b>!</b>) para empezar.','sys');
  banner('Chronicles of Astra',P.level>1?'Tu aventura continúa':'Habla con la Capitana Elara');
}
async function leaveWorld(){
  if(!G.started)return;
  for(const id of PANELS)closePanel(id);
  try{await save(false)}catch(e){}
  MP.stop();G.started=false;P.charId=null;
  enterShowcase();
}
async function switchChar(){await leaveWorld();await openChars()}
async function doLogout(){
  if(G.started)await leaveWorld();
  try{await BE.signOut()}catch(e){}
  Sess.user=null;Sess.chars=[];Sess.sel=null;
  setAuthMode('in');showScreen('sAuth');
}
async function bootScreens(){
  bindScreens();enterShowcase();setAuthMode('in');
  showScreen('sAuth');
  let u=null;
  try{u=BE.restore?await BE.restore():BE.session()}catch(e){}
  if(u){try{await openChars()}catch(e){showScreen('sAuth')}}
}
