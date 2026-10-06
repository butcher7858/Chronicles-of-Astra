
/* =====================================================================
   Capa de servidor: Supabase (Auth + PostgREST + Realtime) sin SDK,
   con respaldo local (localStorage + BroadcastChannel) para pruebas.
   Interfaz común:  BE.signUp/signIn/signOut/session, listChars, createChar,
   deleteChar, loadState, saveChar, top, residents, chatHistory, sendChat,
   y BE.rt (tiempo real): join/leave/pos/chat/track.
   ===================================================================== */
let ACFG=window.ASTRA_CONFIG||{};
if(!ACFG.SUPABASE_URL){
  try{
    const saved=JSON.parse(localStorage.getItem('astra_sb_config')||'{}');
    if(saved&&saved.SUPABASE_URL)ACFG=saved;
  }catch(e){}
}
if(!ACFG.SUPABASE_URL){
  ACFG={
    SUPABASE_URL:'https://yobntnymohcwjknubbbv.supabase.co',
    SUPABASE_ANON_KEY:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvYm50bnltb2hjd2prbnViYmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTkzMDEsImV4cCI6MjEwNjc5NTMwMX0.UGgeDLVfS8ux1rLfP5GhDr9FHBmSa30zoa5BHgsXUoQ'
  };
}
const FORCE_LOCAL=/[?&]local=1/.test(location.search)||localStorage.getItem('astra_force_local')==='1';
const USE_SB=!!(ACFG&&ACFG.SUPABASE_URL&&ACFG.SUPABASE_ANON_KEY)&&!FORCE_LOCAL;
const MAX_CHARS=6;

function errEs(m,code){
  m=String(m||'');
  if(/Invalid login/i.test(m))return 'Correo o contraseña incorrectos.';
  if(/already registered|already been registered/i.test(m))return 'Ese correo ya está registrado. Prueba a entrar.';
  if(/at least \d+ char/i.test(m))return 'La contraseña debe tener al menos 6 caracteres.';
  if(/not confirmed/i.test(m))return 'Debes confirmar tu correo antes de entrar (revisa tu bandeja).';
  if(/valid email|invalid.*email|email.*invalid/i.test(m))return 'Ese correo no parece válido.';
  if(/rate limit|too many|429/i.test(m))return 'Demasiados intentos. Espera un momento.';
  if(code==='23505'||/duplicate key/i.test(m))return 'Ese nombre ya está en uso. Elige otro.';
  if(code==='42501'||/row-level security/i.test(m))return 'No permitido (¿máximo '+MAX_CHARS+' personajes por cuenta?).';
  if(/Failed to fetch|NetworkError|Load failed/i.test(m))return 'No hay conexión con el servidor.';
  return m||'Error desconocido.';
}
function bitsPack(u8){ // Uint8Array de 0/1 -> base64
  const n=u8.length,out=new Uint8Array((n+7)>>3);
  for(let i=0;i<n;i++)if(u8[i])out[i>>3]|=1<<(i&7);
  let s='';for(let i=0;i<out.length;i+=4096)s+=String.fromCharCode.apply(null,out.subarray(i,i+4096));
  return btoa(s);
}
function bitsUnpack(b64,n){
  const u=new Uint8Array(n);try{const s=atob(b64);for(let i=0;i<n;i++){const c=s.charCodeAt(i>>3);if(c&&(c>>(i&7))&1)u[i]=1}}catch(e){}
  return u;
}
function uuid4(){
  if(window.crypto&&crypto.randomUUID)return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return (c==='x'?r:(r&3|8)).toString(16)});
}

/* ---------------------------------------------------------------------
   Respaldo LOCAL
   --------------------------------------------------------------------- */
const LocalBE=(function(){
  const K='astra_local_db_v1',KS='astra_local_sess_v1';
  const load=()=>{try{return JSON.parse(localStorage.getItem(K))||{users:{},chars:[],states:{},chat:[]}}catch(e){return {users:{},chars:[],states:{},chat:[]}}};
  const store=d=>{try{localStorage.setItem(K,JSON.stringify(d))}catch(e){}};
  async function hash(s){
    try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('astra:'+s));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')}
    catch(e){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return 'h'+h}
  }
  let sess=null;
  try{sess=JSON.parse(localStorage.getItem(KS))}catch(e){}
  const o={mode:'local',
    session:()=>sess&&{id:sess.id,email:sess.email},
    async signUp(email,pw){
      const d=load();email=email.toLowerCase();
      if(d.users[email])throw new Error('Ese correo ya está registrado. Prueba a entrar.');
      const u={id:uuid4(),pwh:await hash(pw)};d.users[email]=u;store(d);
      sess={id:u.id,email:email};localStorage.setItem(KS,JSON.stringify(sess));return {user:sess};
    },
    async signIn(email,pw){
      const d=load();email=email.toLowerCase();const u=d.users[email];
      if(!u||u.pwh!==await hash(pw))throw new Error('Correo o contraseña incorrectos.');
      sess={id:u.id,email:email};localStorage.setItem(KS,JSON.stringify(sess));return {user:sess};
    },
    async signOut(){sess=null;try{localStorage.removeItem(KS)}catch(e){}},
    async listChars(){return load().chars.filter(c=>c.user_id===sess.id).sort((a,b)=>a.created_at<b.created_at?-1:1)},
    async createChar(c){
      const d=load();
      if(d.chars.filter(x=>x.user_id===sess.id).length>=MAX_CHARS)throw new Error('Máximo '+MAX_CHARS+' personajes por cuenta.');
      if(d.chars.some(x=>x.name.toLowerCase()===c.name.toLowerCase()))throw new Error('Ese nombre ya está en uso. Elige otro.');
      const row={id:uuid4(),user_id:sess.id,name:c.name,class:c.cls,level:1,appearance:c.app,x:null,y:null,zone:'town',kills:0,created_at:new Date().toISOString(),last_seen:new Date().toISOString()};
      d.chars.push(row);store(d);return row;
    },
    async deleteChar(id){const d=load();d.chars=d.chars.filter(c=>!(c.id===id&&c.user_id===sess.id));delete d.states[id];store(d)},
    async loadState(id){return load().states[id]||null},
    async saveChar(ch,st){
      const d=load(),c=d.chars.find(x=>x.id===ch.id);if(!c)return;
      Object.assign(c,ch,{last_seen:new Date().toISOString()});d.states[ch.id]=Object.assign({character_id:ch.id,user_id:sess?sess.id:(c.user_id||'local')},st);store(d);
    },
    async top(n){return load().chars.slice().sort((a,b)=>b.level-a.level||b.kills-a.kills).slice(0,n)},
    async residents(exclude){
      const lim=Date.now()-7*864e5;
      return load().chars.filter(c=>c.x!=null&&new Date(c.last_seen).getTime()>lim).slice(0,40);
    },
    async chatHistory(n){return load().chat.slice(-n)},
    async sendChat(ch,body){const d=load();d.chat.push({name:ch.name,body:body,channel:'global',created_at:new Date().toISOString()});d.chat=d.chat.slice(-100);store(d)},
    saveBeacon(ch,st){try{o.saveChar(ch,st)}catch(e){}}
  };
  /* tiempo real local: BroadcastChannel entre pestañas */
  o.rt=(function(){
    let bc=null,me=null,h={},peers={},hb=null,gc=null;
    function post(m){try{bc.postMessage(Object.assign({from:me.id},m))}catch(e){}}
    function emitState(){h.onState&&h.onState(Object.keys(peers).map(k=>peers[k].meta))}
    return {
      connected:()=>!!bc,
      join(meta,handlers){
        me=meta;h=handlers||{};peers={};
        bc=new BroadcastChannel('astra-world');
        bc.onmessage=ev=>{
          const m=ev.data;if(!m||m.from===me.id)return;
          if(m.t==='hello'){const isNew=!peers[m.from];peers[m.from]={meta:m.meta,seen:Date.now()};if(isNew){h.onJoin&&h.onJoin(m.meta);post({t:'hello',meta:me})}}
          else if(m.t==='who'){post({t:'hello',meta:me})}
          else if(m.t==='bye'){if(peers[m.from]){delete peers[m.from];h.onLeave&&h.onLeave(m.from)}}
          else if(m.t==='pos'){h.onPos&&h.onPos(m.d)}
          else if(m.t==='chat'){h.onChat&&h.onChat(m.d)}
          else if(m.t==='ev'){h.onEvent&&h.onEvent(m.d)}
        };
        post({t:'hello',meta:me});post({t:'who'});
        hb=setInterval(()=>post({t:'hello',meta:me}),3000);
        gc=setInterval(()=>{const now=Date.now();for(const k of Object.keys(peers))if(now-peers[k].seen>10000){delete peers[k];h.onLeave&&h.onLeave(k)}},3000);
        setTimeout(()=>{emitState();h.onReady&&h.onReady()},300);
      },
      track(meta){me=meta;post({t:'hello',meta:me})},
      pos(d){if(bc)post({t:'pos',d:d})},
      chat(d){if(bc)post({t:'chat',d:d})},
      event(d){if(bc)post({t:'ev',d:d})},
      leave(){if(!bc)return;post({t:'bye'});clearInterval(hb);clearInterval(gc);bc.close();bc=null;peers={}}
    };
  })();
  return o;
})();

/* ---------------------------------------------------------------------
   Supabase
   --------------------------------------------------------------------- */
const SupaBE=USE_SB?(function(){
  const URL_=String(ACFG.SUPABASE_URL||'').replace(/\/+$/,''),KEY=ACFG.SUPABASE_ANON_KEY||'',KS='astra_sb_sess_v1';
  let S=null;try{S=JSON.parse(localStorage.getItem(KS))}catch(e){}
  const saveS=()=>{try{if(S)localStorage.setItem(KS,JSON.stringify(S));else localStorage.removeItem(KS)}catch(e){}};
  let onToken=null;
  function toSess(j){
    return {access_token:j.access_token,refresh_token:j.refresh_token,expires_at:j.expires_at||(Math.floor(Date.now()/1000)+(j.expires_in||3600)),user:{id:j.user.id,email:j.user.email}};
  }
  async function raw(path,opt){
    opt=opt||{};
    const h=Object.assign({apikey:KEY,'Content-Type':'application/json'},opt.headers||{});
    if(!h.Authorization)h.Authorization='Bearer '+(opt.anon||!S?KEY:S.access_token);
    let r;
    try{r=await fetch(URL_+path,{method:opt.method||'GET',headers:h,body:opt.body===undefined?undefined:JSON.stringify(opt.body),keepalive:!!opt.keepalive})}
    catch(e){throw new Error(errEs(e.message))}
    let j=null;const tx=await r.text();if(tx){try{j=JSON.parse(tx)}catch(e){j=tx}}
    if(!r.ok){
      const m=j&&(j.msg||j.message||j.error_description||j.error)||('HTTP '+r.status);
      const e=new Error(errEs(m,j&&j.code));e.status=r.status;throw e;
    }
    return j;
  }
  async function fresh(){
    if(!S)throw new Error('Sesión no iniciada.');
    if(S.expires_at-60>Date.now()/1000)return;
    try{
      const j=await raw('/auth/v1/token?grant_type=refresh_token',{method:'POST',anon:true,body:{refresh_token:S.refresh_token}});
      S=toSess(j);saveS();onToken&&onToken(S.access_token);
    }catch(e){S=null;saveS();throw new Error('Tu sesión expiró. Vuelve a entrar.')}
  }
  async function api(path,opt){await fresh();return raw(path,opt)}
  const q=encodeURIComponent;
  const o={mode:'supabase',
    session:()=>S&&S.user,
    token:()=>S&&S.access_token,
    async restore(){ // valida/renueva la sesión guardada
      if(!S)return null;
      try{await fresh();return S.user}catch(e){return null}
    },
    async signUp(email,pw){
      const j=await raw('/auth/v1/signup',{method:'POST',anon:true,body:{email:email,password:pw}});
      if(j&&j.access_token){S=toSess(j);saveS();return {user:S.user}}
      return {needsConfirm:true};
    },
    async signIn(email,pw){
      const j=await raw('/auth/v1/token?grant_type=password',{method:'POST',anon:true,body:{email:email,password:pw}});
      S=toSess(j);saveS();return {user:S.user};
    },
    async signOut(){
      try{if(S)await raw('/auth/v1/logout',{method:'POST'})}catch(e){}
      S=null;saveS();
    },
    listChars:()=>api('/rest/v1/characters?select=*&user_id=eq.'+q(S.user.id)+'&order=created_at.asc'),
    async createChar(c){
      const rows=await api('/rest/v1/characters',{method:'POST',headers:{Prefer:'return=representation'},
        body:{user_id:S.user.id,name:c.name,class:c.cls,level:1,appearance:c.app,zone:'town'}});
      return Array.isArray(rows)?rows[0]:rows;
    },
    async deleteChar(id){await api('/rest/v1/characters?id=eq.'+q(id)+'&user_id=eq.'+q(S.user.id),{method:'DELETE'})},
    async loadState(id){
      const r=await api('/rest/v1/character_state?select=*&character_id=eq.'+q(id));
      return r&&r[0]||null;
    },
    async saveChar(ch,st,beacon){
      if(!beacon)await fresh();
      const now=new Date().toISOString();
      const a=raw('/rest/v1/characters?id=eq.'+q(ch.id)+'&user_id=eq.'+q(S.user.id),{method:'PATCH',keepalive:!!beacon,headers:{Prefer:'return=minimal'},
        body:{level:ch.level,x:ch.x,y:ch.y,zone:ch.zone,kills:ch.kills,appearance:ch.appearance,last_seen:now}});
      let b;
      try{
        b=await raw('/rest/v1/character_state?on_conflict=character_id',{method:'POST',keepalive:!!beacon,headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
          body:Object.assign({character_id:ch.id,user_id:S.user.id,updated_at:now},st)});
      }catch(err){
        if(err&&/column.*does not exist|Could not find.*column/i.test(err.message)){
          const baseCols=['character_id','user_id','xp','gold','inv','eq','quests','disc','explored','world_time','options','updated_at','talents','mount','mounts','guild'];
          const fallbackSt={character_id:ch.id,user_id:S.user.id,updated_at:now};
          for(const k of baseCols)if(st[k]!==undefined)fallbackSt[k]=st[k];
          try{
            b=await raw('/rest/v1/character_state?on_conflict=character_id',{method:'POST',keepalive:!!beacon,headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:fallbackSt});
          }catch(err2){
            if(err2&&/column.*does not exist|Could not find.*column/i.test(err2.message)){
              delete fallbackSt.talents;delete fallbackSt.mount;delete fallbackSt.mounts;delete fallbackSt.guild;
              b=await raw('/rest/v1/character_state?on_conflict=character_id',{method:'POST',keepalive:!!beacon,headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:fallbackSt});
            }else throw err2;
          }
        }else{
          throw err;
        }
      }
      await a;
    },
    top:n=>api('/rest/v1/characters?select=name,class,level,kills&order=level.desc,kills.desc&limit='+n),
    residents(){
      const since=new Date(Date.now()-7*864e5).toISOString();
      return api('/rest/v1/characters?select=id,user_id,name,class,level,appearance,x,y,zone&x=not.is.null&last_seen=gte.'+q(since)+'&order=last_seen.desc&limit=40');
    },
    async chatHistory(n){const r=await api('/rest/v1/chat_messages?select=name,body,created_at&order=created_at.desc&limit='+n);return (r||[]).reverse()},
    async sendChat(ch,body){await api('/rest/v1/chat_messages',{method:'POST',headers:{Prefer:'return=minimal'},body:{character_id:ch.id,name:ch.name,channel:'global',body:body}})}
  };
  /* Realtime por WebSocket (protocolo Phoenix v1) */
  o.rt=(function(){
    const TOPIC='realtime:astra-world';
    let ws=null,hb=null,ref=0,me=null,h={},closed=true,retry=0,joined=false,rtimer=null,players={};
    function send(ev,payload,tp){
      if(ws&&ws.readyState===1)ws.send(JSON.stringify({topic:tp||TOPIC,event:ev,payload:payload,ref:String(++ref),join_ref:'1'}));
    }
    function metasOf(st){const out=[];for(const k of Object.keys(st||{})){const ms=st[k].metas||st[k];const m=Array.isArray(ms)?ms[ms.length-1]:ms;if(m)out.push(m)}return out}
    function connect(){
      if(closed)return;
      joined=false;
      if(ws){try{ws.onclose=null;ws.close()}catch(e){}}
      try{ws=new WebSocket(URL_.replace(/^http/,'ws')+'/realtime/v1/websocket?apikey='+encodeURIComponent(KEY)+'&vsn=1.0.0')}catch(e){return sched()}
      ws.onopen=()=>{
        send('phx_join',{config:{broadcast:{self:false,ack:false},presence:{key:me.id},postgres_changes:[],private:false},access_token:S?S.access_token:KEY});
        clearInterval(hb);hb=setInterval(()=>send('heartbeat',{},'phoenix'),25000);
      };
      ws.onmessage=ev=>{
        let m;try{m=JSON.parse(ev.data)}catch(e){return}
        if(m.topic!==TOPIC)return;
        const p=m.payload||{};
        switch(m.event){
          case 'phx_reply':
            if(!joined&&p.status==='ok'){joined=true;retry=0;send('presence',{type:'presence',event:'track',payload:me});h.onReady&&h.onReady()}
            else if(p.status==='error'){h.onError&&h.onError(JSON.stringify(p.response||p))}
            break;
          case 'presence_state':
            players={};for(const x of metasOf(p))players[x.id]=x;h.onState&&h.onState(Object.keys(players).map(k=>players[k]));break;
          case 'presence_diff':{
            for(const x of metasOf(p.leaves)){if(players[x.id]&&!(p.joins&&p.joins[x.id])){delete players[x.id];h.onLeave&&h.onLeave(x.id)}}
            for(const x of metasOf(p.joins)){if(x.id===me.id)continue;const nw=!players[x.id];players[x.id]=x;if(nw)h.onJoin&&h.onJoin(x);else h.onMeta&&h.onMeta(x)}
            break}
          case 'broadcast':{
            const e=p.event,d=p.payload;
            if(e==='pos')h.onPos&&h.onPos(d);else if(e==='chat')h.onChat&&h.onChat(d);else if(e==='ev')h.onEvent&&h.onEvent(d);
            break}
          case 'phx_close':case 'phx_error':try{ws.close()}catch(e){}break;
        }
      };
      ws.onclose=()=>{clearInterval(hb);joined=false;if(!closed){h.onDown&&h.onDown();sched()}};
      ws.onerror=()=>{};
    }
    function sched(){clearTimeout(rtimer);const d=Math.min(15000,1500*Math.pow(2,retry++));rtimer=setTimeout(connect,d)}
    onToken=t=>send('access_token',{access_token:t});
    return {
      connected:()=>joined,
      join(meta,handlers){me=meta;h=handlers||{};closed=false;retry=0;players={};connect()},
      track(meta){me=meta;if(joined)send('presence',{type:'presence',event:'track',payload:me})},
      pos(d){if(joined)send('broadcast',{type:'broadcast',event:'pos',payload:d})},
      chat(d){if(joined)send('broadcast',{type:'broadcast',event:'chat',payload:d})},
      event(d){if(joined)send('broadcast',{type:'broadcast',event:'ev',payload:d})},
      leave(){closed=true;clearTimeout(rtimer);clearInterval(hb);try{if(ws){ws.onclose=null;ws.close()}}catch(e){}ws=null;joined=false;players={}}
    };
  })();
  o.saveBeacon=function(ch,st){try{o.saveChar(ch,st,true)}catch(e){}};
  return o;
})():null;

const BE=(USE_SB&&SupaBE)?SupaBE:LocalBE;
