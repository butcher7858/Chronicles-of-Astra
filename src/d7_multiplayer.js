
/* =====================================================================
   Multijugador: presencia, posiciones interpoladas, chat global y
   residentes (personajes guardados que "viven" en el mundo)
   ===================================================================== */
const MP={
  on:false,remote:{},res:{},meta:null,acc:0,hbT:0,last:null,down:false,
  metaOf(){
    return {id:P.charId,name:P.name,cls:P.cls,level:P.level,app:P.app,x:Math.round(P.x),y:Math.round(P.y),uid:(BE.session()||{}).id};
  },
  mkEnt(m,resident){
    const ang=rand(0,6.283);
    return {id:m.id,name:m.name,cls:CLS[m.cls]?m.cls:'war',level:m.level||1,app:Object.assign(defaultApp(CLS[m.cls]?m.cls:'war'),m.app||{}),
      x:m.x==null?SPAWN_P.x:m.x,y:m.y==null?SPAWN_P.y:m.y,tx:m.x==null?SPAWN_P.x:m.x,ty:m.y==null?SPAWN_P.y:m.y,
      dir:1,anim:rand(0,6),size:10,bot:true,moving:false,hop:0,mounted:false,remote:!resident,resident:!!resident,wait:rand(0,4),speed:rand(55,90),
      home:{x:m.x==null?SPAWN_P.x:m.x,y:m.y==null?SPAWN_P.y:m.y},lastPos:Date.now()};
  },
  count(){return Object.keys(MP.remote).length+1},
  refreshCount(){const e=$('onl');if(e)e.textContent=MP.on?(MP.count()+(MP.count()===1?' aventurero en línea':' aventureros en línea')):'Sin conexión en tiempo real'},
  addRemote(m){
    if(!m||m.id===P.charId)return;
    if(MP.res[m.id]){G.bots=G.bots.filter(b=>b!==MP.res[m.id]);delete MP.res[m.id]}
    let e=MP.remote[m.id];
    if(!e){e=MP.mkEnt(m,false);MP.remote[m.id]=e;G.bots.push(e);log('<span style="color:#7fd0ff">'+esc(m.name)+' ha entrado en Astra.</span>','sys')}
    else{e.level=m.level||e.level;e.app=Object.assign(e.app,m.app||{});e.cls=CLS[m.cls]?m.cls:e.cls}
    MP.refreshCount();
  },
  delRemote(id){
    const e=MP.remote[id];if(!e)return;
    G.bots=G.bots.filter(b=>b!==e);delete MP.remote[id];
    log('<span style="color:#7fd0ff">'+esc(e.name)+' ha salido de Astra.</span>','sys');
    MP.refreshCount();
  },
  async loadResidents(){
    try{
      const rows=await BE.residents();
      for(const r of rows||[]){
        if(r.id===P.charId||MP.remote[r.id]||MP.res[r.id]||!CLS[r.class])continue;
        if(r.x==null||hitsWall(r.x,r.y,9))continue;
        const e=MP.mkEnt({id:r.id,name:r.name,cls:r.class,level:r.level,app:r.appearance,x:r.x,y:r.y},true);
        MP.res[r.id]=e;G.bots.push(e);
      }
    }catch(e){}
  },
  async loadChat(){
    try{
      const rows=await BE.chatHistory(18);
      for(const m of rows||[])log('<span style="opacity:.55"><b>['+esc(m.name)+']</b> '+esc(m.body)+'</span>','gen');
    }catch(e){}
  },
  start(){
    MP.on=false;MP.remote={};MP.res={};MP.down=false;
    G.bots=[];  // fuera los viajeros simulados: solo gente real y residentes
    const meta=MP.metaOf();MP.meta=meta;
    BE.rt.join(meta,{
      onReady(){MP.on=true;MP.down=false;MP.refreshCount()},
      onState(list){for(const m of list)MP.addRemote(m);MP.refreshCount()},
      onJoin(m){MP.addRemote(m)},
      onMeta(m){MP.addRemote(m)},
      onLeave(id){MP.delRemote(id)},
      onPos(d){
        const e=MP.remote[d.id];if(!e)return;
        e.tx=d.x;e.ty=d.y;e.dir=d.d>=0?1:-1;e.mounted=!!d.mo;e.lastPos=Date.now();
        if(d.l)e.level=d.l;
      },
      onChat(d){log('<b style="color:#7fd0ff">['+esc(d.n)+']</b> '+esc(d.b),'gen')},
      onDown(){MP.on=false;MP.down=true;MP.refreshCount()},
      onError(e){console.warn('realtime',e)}
    });
    MP.refreshCount();
    MP.loadResidents();MP.loadChat();
  },
  stop(){
    try{BE.rt.leave()}catch(e){}
    MP.on=false;MP.remote={};MP.res={};
    G.bots=G.bots.filter(b=>!b.remote&&!b.resident);
  },
  chat(txt){
    log('<b style="color:#9dffb0">['+esc(P.name)+']</b> '+esc(txt),'gen');
    BE.rt.chat({id:P.charId,n:P.name,b:txt});
    BE.sendChat({id:P.charId,name:P.name},txt).catch(()=>{});
  },
  tick(dt){
    if(!MP.on)return;
    MP.acc+=dt;MP.hbT+=dt;
    if(MP.acc>=0.2){
      MP.acc=0;
      const s=Math.round(P.x)+','+Math.round(P.y)+','+P.dir+','+(P.mounted?1:0);
      if(s!==MP.last||MP.hbT>2){
        MP.last=s;MP.hbT=0;
        BE.rt.pos({id:P.charId,x:Math.round(P.x),y:Math.round(P.y),d:P.dir,mo:P.mounted?1:0,l:P.level});
      }
    }
    if(MP.meta&&MP.meta.level!==P.level){MP.meta=MP.metaOf();BE.rt.track(MP.meta)}
  }
};
