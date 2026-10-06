
/* =====================================================================
   Bucle de juego: entrada, movimiento, combate, cámara
   ===================================================================== */
let ZM=1;
function ell(x,y,rx,ry,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,6.283);ctx.fill()}
function label(txt,x,y,col,size){
  ctx.font='600 '+(size||12)+'px "Segoe UI",system-ui,sans-serif';ctx.textAlign='center';ctx.lineJoin='round';
  ctx.lineWidth=3.2;ctx.strokeStyle='rgba(0,0,0,0.8)';ctx.strokeText(txt,x,y);ctx.fillStyle=col||'#fff';ctx.fillText(txt,x,y);
}
function resize(){
  vw=window.innerWidth;vh=window.innerHeight;dpr=Math.min(2,window.devicePixelRatio||1);
  cv.width=Math.round(vw*dpr);cv.height=Math.round(vh*dpr);cv.style.width=vw+'px';cv.style.height=vh+'px';
  lightCv.width=Math.ceil(vw/2);lightCv.height=Math.ceil(vh/2);
  ZM=G.zoom*(Math.min(vw,vh)<560?0.8:1);
}
const lightCv=document.createElement('canvas'),lctx=lightCv.getContext('2d');
function nightAmt(){
  const h=((G.worldT/300+0.3)%1)*24,sun=Math.cos((h-12)/24*6.283);
  return clamp((0.15-sun)*2.2,0,1);
}
function clockText(){const h=((G.worldT/300+0.3)%1)*24;return String(Math.floor(h)).padStart(2,'0')+':'+String(Math.floor((h%1)*60)).padStart(2,'0')}
function screenToWorld(sx,sy){return {x:sx/ZM+camX,y:sy/ZM+camY}}

/* ---------- Mapa explorado ---------- */
const miniBase=document.createElement('canvas');miniBase.width=W;miniBase.height=H;
const mbx=miniBase.getContext('2d');
function paintCell(cx,cy){
  for(let y=cy*CELL;y<Math.min(H,cy*CELL+CELL);y++)for(let x=cx*CELL;x<Math.min(W,cx*CELL+CELL);x++){
    const i=idx(x,y),t=tiles[i];let col=TCOL[t]?TCOL[t][1]||TCOL[t][0]:'#222';
    if(block[i]&&!deco[i]&&t!==T.WALL&&t!==T.WATER&&t!==T.BOG)col='#6a5238';
    else if(deco[i]&&deco[i]<=9&&t!==T.WATER)col=tint(col,-0.28);
    mbx.fillStyle=col;mbx.fillRect(x,y,1,1);
  }
}
function revealAround(){
  const cx=Math.floor(P.x/TILE/CELL),cy=Math.floor(P.y/TILE/CELL);
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=GW||y>=GH)continue;
    const k=y*GW+x;if(!G.explored[k]){G.explored[k]=1;paintCell(x,y)}
  }
}
function rebuildExplored(){mbx.clearRect(0,0,W,H);for(let y=0;y<GH;y++)for(let x=0;x<GW;x++)if(G.explored[y*GW+x])paintCell(x,y)}

/* ---------- Interacción ---------- */
function nearestInteract(){
  let best=null,bd=1e9;
  for(const n of G.npcs){const d=dist(n,P);if(d<78&&d<bd){bd=d;best={k:'npc',e:n,txt:'Hablar con '+n.name}}}
  for(const n of G.nodes){if(n.open)continue;const d=dist(n,P);if(d<62&&d<bd){bd=d;best={k:'node',e:n,txt:n.type==='chest'?'Abrir cofre':n.type==='herb'?'Recoger hierba':'Extraer mineral'}}}
  for(const m of G.mobs){if(!m.dead||!m.lootable)continue;const d=dist(m,P);if(d<110&&d<bd){bd=d;best={k:'loot',e:m,txt:'Saquear '+m.name}}}
  for(const p of PROPS){if(p.t!=='obelisk')continue;const d=dist(p,P);if(d<90&&d<bd){bd=d;best={k:'wp',e:p,txt:'Obelisco · Viaje rápido'}}}
  return best;
}
function interact(){
  if(!G.started||P.dead)return;
  const it=nearestInteract();if(!it)return;
  doInteract(it.k,it.e);
}
function doInteract(k,e){
  if(k==='npc'){P.dir=e.x>=P.x?1:-1;talkNpc(e)}
  else if(k==='node')startGather(e);
  else if(k==='loot')lootMob(e);
  else if(k==='wp'){openMap()}
}
function cycleTarget(){
  const c=G.mobs.filter(m=>!m.dead&&dist(m,P)<400).sort((a,b)=>dist(a,P)-dist(b,P));
  if(!c.length){P.target=null;return}
  const i=c.indexOf(P.target);P.target=c[(i+1)%c.length];sfx('swing');
}
function clickWorld(wx,wy,onlyEnt){
  if(!G.started||P.dead)return;
  let best=null,bd=1e9;
  const cons=(k,e,d,rad)=>{if(d<rad&&d<bd){bd=d;best={k:k,e:e}}};
  for(const m of G.mobs){
    if(m.dead){if(m.lootable)cons('loot',m,Math.hypot(m.x-wx,m.y-wy),30);continue}
    cons('mob',m,Math.hypot(m.x-wx,m.y-m.size*0.8-wy),m.size+14);
  }
  for(const n of G.npcs)cons('npc',n,Math.hypot(n.x-wx,n.y-22-wy),30);
  for(const n of G.nodes)if(!n.open)cons('node',n,Math.hypot(n.x-wx,n.y-wy),28);
  for(const p of PROPS)if(p.t==='obelisk')cons('wp',p,Math.hypot(p.x-wx,p.y-30-wy),38);
  if(G.bots){
    for(const b of G.bots){
      if(!b||b.dead)continue;
      cons('player',b,Math.hypot(b.x-wx,b.y-22-wy),28);
    }
  }
  if(best){
    P.cast=P.cast&&(P.cast.gather)?null:P.cast;
    if(best.k==='mob'){P.target=best.e;P.autoAtk=true}
    else if(best.k==='player'){P.target=best.e;P.autoAtk=false;ring(best.e.x,best.e.y,24,'#50e3c2')}
    P.intent={k:best.k,e:best.e,rep:0};P.path=[];
    if(best.k!=='mob'&&best.k!=='player')ring(best.e.x,best.e.y,22,'#ffe08a');
    return;
  }
  if(onlyEnt)return;
  P.intent=null;P.target=P.target&&P.target.dead?null:P.target;
  const p=findPath(P.x,P.y,wx,wy);
  P.path=p||[];if(P.cast&&P.cast.gather)P.cast=null;
  P.mounted=P.mounted;
  ring(wx,wy,14,'#ffffff');
}

/* ---------- Actualización ---------- */
let hintT=0,zoneKey='';
function inputVec(){
  let dx=(G.keys.d||G.keys.ArrowRight?1:0)-(G.keys.a||G.keys.ArrowLeft?1:0),dy=(G.keys.s||G.keys.ArrowDown?1:0)-(G.keys.w||G.keys.ArrowUp?1:0);
  if(G.joy&&G.joy.on){dx=G.joy.x;dy=G.joy.y}
  return [dx,dy];
}
function updatePlayer(dt){
  P.anim+=dt;
  P.flash=Math.max(0,P.flash-dt);P.swingA=Math.max(0,P.swingA-dt);P.iframes=Math.max(0,P.iframes-dt);
  P.gcd=Math.max(0,P.gcd-dt);P.combatT=Math.max(0,P.combatT-dt);
  for(const k in P.cds)if(P.cds[k]>0)P.cds[k]=Math.max(0,P.cds[k]-dt);
  if(P.stun>0)P.stun-=dt;
  if(P.slowT>0){P.slowT-=dt;if(P.slowT<=0)P.slowM=1}
  // buffs y daños continuos
  for(let i=P.buffs.length-1;i>=0;i--){
    const b=P.buffs[i];b.t+=dt;
    if(b.hot){b.hot.next-=dt;if(b.hot.next<=0){b.hot.next+=b.hot.every;healP(b.hot.amt)}}
    if(b.t>=b.dur)P.buffs.splice(i,1);
  }
  for(let i=P.dots.length-1;i>=0;i--){
    const d=P.dots[i];d.t+=dt;d.next-=dt;
    if(d.next<=0){d.next+=1;hurtPlayer(d.tick,{level:P.level},{raw:true,col:'#9bd04a'});if(P.dead)return}
    if(d.t>=d.dur)P.dots.splice(i,1);
  }
  // regeneración
  const safe=inSafe(P),mult=safe?3:1;
  if(P.combatT<=0&&P.hp<P.maxhp)P.hp=Math.min(P.maxhp,P.hp+P.maxhp*0.018*mult*dt);
  const rm=CLS[P.cls].res;
  if(rm==='rage'){if(P.combatT<=0&&P.res>0)P.res=Math.max(0,P.res-4*dt)}
  else if(rm==='energy')P.res=Math.min(P.maxres,P.res+(CLS[P.cls].regen||14)*dt);
  else P.res=Math.min(P.maxres,P.res+P.maxres*(P.combatT>0?0.012:0.035)*mult*dt);
  // movimiento
  let [ix,iy]=inputVec();
  const manual=!!(ix||iy);
  let vx=0,vy=0;
  P.moving=false;
  const stunned=P.stun>0;
  if(P.dash){
    const d=P.dash;d.t+=dt;const k=Math.min(1,d.t/d.dur),e=1-Math.pow(1-k,2);
    const nx=d.sx+(d.tx-d.sx)*e,ny=d.sy+(d.ty-d.sy)*e;
    if(d.trail||d.roll){G.parts.push({x:P.x,y:P.y-10,vx:0,vy:0,t:0,life:0.25,col:d.trail||'#d8d0c0',size:3})}
    P.x=nx;P.y=ny;P.moving=true;
    if(k>=1){P.dash=null;if(d.end)d.end()}
    updateCamAndRest(dt);return;
  }
  if(!stunned){
    if(manual){
      P.intent=null;P.path=[];
      if(P.cast){P.cast=null;toast('Interrumpido')}
      const l=Math.hypot(ix,iy);if(l>1){ix/=l;iy/=l}
      vx=ix;vy=iy;
    }else{
      if(P.intent)procIntent(dt);
      if(P.path.length){
        const p=P.path[0],dx=p.x-P.x,dy=p.y-P.y,d=Math.hypot(dx,dy);
        if(d<7)P.path.shift();else{vx=dx/d;vy=dy/d}
      }
    }
  }
  const want=Math.hypot(vx,vy)>0.05;
  // aguante y velocidad
  const runKey=G.keys.Shift||G.sprintToggle;
  let spd=150;
  P.sprinting=false;
  if(P.mounted)spd=mountSpeed();
  else if(want&&runKey&&P.sta>0&&!P.exh&&!P.cast){spd=215;P.sprinting=true;P.sta=Math.max(0,P.sta-16*dt);P.staDelay=0.8;if(P.sta<=0)P.exh=true}
  P.staDelay-=dt;
  if(!P.sprinting&&P.staDelay<=0){P.sta=Math.min(100,P.sta+(want?10:22)*dt);if(P.exh&&P.sta>25)P.exh=false}
  if(P.exh&&P.sta<=0)spd*=0.9;
  if(P.slowT>0)spd*=P.slowM;
  if(P.cast&&!P.cast.travel&&want){/* movimiento interrumpe (solo manual ya cancela) */}
  P.spd=want?spd:0;
  if(want){
    if(P.cast&&!P.cast.gather&&!P.cast.travel){P.cast=null}
    moveEnt(P,vx*spd*dt,vy*spd*dt,9);
    P.moving=true;P.fa=Math.atan2(vy,vx);
    if(Math.abs(vx)>0.15)P.dir=vx>0?1:-1;
    if(P.cast&&P.cast.gather&&!manual&&false)P.cast=null;
    if(P.cast&&P.cast.gather){P.cast=null;toast('Interrumpido')}
  }
  // pisadas
  if(P.moving&&((P.anim*(P.sprinting||P.mounted?13:9))%3.14<0.2)){
    const t0=tiles[idx(clamp(Math.floor(P.x/TILE),0,W-1),clamp(Math.floor(P.y/TILE),0,H-1))];
    const col=t0===T.SAND||t0===T.DUNE?'#d8c08a':t0===T.SNOW||t0===T.ICE?'#ffffff':t0===T.SWAMP||t0===T.BOG?'#5a6a3a':'#b8a888';
    if(P.sprinting||P.mounted)G.parts.push({x:P.x,y:P.y,vx:rand(-20,20),vy:rand(-25,-5),t:0,life:0.4,col:col,size:2.2});
  }
  updateCamAndRest(dt);
}
function procIntent(dt){
  const it=P.intent,e=it.e;
  if(!e||(it.k==='mob'&&e.dead)){P.intent=null;return}
  if(it.k==='loot'&&(!e.lootable)){P.intent=null;return}
  if(it.k==='node'&&e.open){P.intent=null;return}
  const d=Math.hypot(e.x-P.x,e.y-P.y);
  let reach=it.k==='npc'?66:it.k==='node'?46:it.k==='loot'?54:it.k==='wp'?80:0;
  if(it.k==='mob'){
    const melee=CLS[P.cls].melee;
    reach=melee?48+e.size*0.6:Math.min(280,CLS[P.cls].ab[0].range-20);
    if(d<=reach&&lineClear(P.x,P.y,e.x,e.y,4)){P.path=[];P.dir=e.x>=P.x?1:-1;return}
  }else if(d<=reach){P.path=[];P.intent=null;doInteract(it.k,e);return}
  it.rep-=dt;
  if(it.rep<=0||!P.path.length){
    it.rep=it.k==='mob'?0.4:2;
    const p=findPath(P.x,P.y,e.x,e.y);
    if(p&&p.length){if(it.k==='mob'&&p.length>1)p.pop();P.path=p}else{P.intent=null;toast('No hay camino')}
  }
}
function updateCamAndRest(dt){
  // lanzamiento
  if(P.cast){
    const c=P.cast;c.time+=dt;
    if(c.t&&(c.t.dead||(c.ab&&c.ab.tgt&&dist(P,c.t)-c.t.size>(c.ab.range||999)+30))&&!c.gather){P.cast=null;toast('Objetivo perdido')}
    else if(c.time>=c.dur){
      P.cast=null;
      if(c.fn)c.fn();else if(c.ab){
        if(P.res<(c.ab.cost||0))toast('Sin recursos');else fire(c.ab,c.t);
      }
    }
  }
  // ataque automático
  if(P.autoAtk&&!P.dead&&!P.cast&&!P.stun&&P.gcd<=0&&!P.dash){
    const t=P.target;
    if(!t||t.dead){P.autoAtk=false}
    else{
      const ab=CLS[P.cls].ab[0],d=dist(P,t)-t.size;
      if(d<=ab.range&&P.res>=(ab.cost||0)&&!P.moving){P.dir=t.x>=P.x?1:-1;tryUse(0)}
    }
  }
  // enemigos con foco en objetivo caído o fijado automático en combate
  if(P.target&&P.target.dead&&!P.target.lootable)P.target=null;
  if(P.combatT>0&&!P.dead){
    if(!P.target||P.target.dead||dist(P,P.target)>360){
      let best=null,minD=360;
      for(const m of G.mobs){
        if(m.dead||!m.hostile)continue;
        const d=dist(P,m);
        if(d<minD&&(m.state==='chase'||d<240)){minD=d;best=m}
      }
      if(best)P.target=best;
    }
  }
}
function updateWorld(dt){
  for(let i=G.mobs.length-1;i>=0;i--){const m=G.mobs[i];updateMob(m,dt);if(m.remove)G.mobs.splice(i,1)}
  updateBots(dt);
  for(const n of G.nodes){if(n.open){n.t+=dt;if(n.t>(n.type==='chest'?120:70)){n.open=false;n.t=0}}}
  // proyectiles
  for(let i=G.projs.length-1;i>=0;i--){
    const p=G.projs[i];p.life-=dt;let rm=p.life<=0;
    if(p.enemy){
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(!P.dead&&Math.hypot(p.x-P.x,p.y-(P.y-14))<14){hurtPlayer(p.src.dmg*(p.bolt?1:0.9),p.src,{col:p.bolt?'#9bff5a':null});burst(p.x,p.y,p.col,6,90);rm=true}
      if(solidAt(p.x,p.y+10))rm=true;
    }else{
      const t=p.t;
      if(!t||t.dead){rm=true}
      else{
        const tx=t.x,ty=t.y-t.size*0.8,dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy),s=p.speed*dt;
        p.trail.push({x:p.x,y:p.y});if(p.trail.length>9)p.trail.shift();
        if(d<=s+8){p.hit();rm=true}else{p.x+=dx/d*s;p.y+=dy/d*s}
      }
    }
    if(rm)G.projs.splice(i,1);
  }
  for(let i=G.tels.length-1;i>=0;i--){
    const tl=G.tels[i];tl.t+=dt;
    if(tl.t>=tl.dur){
      if(!P.dead&&Math.hypot(P.x-tl.x,P.y-tl.y)<tl.r)hurtPlayer(tl.dmg,tl.src,{slow:tl.slow,col:'#ff9a5a'});
      burst(tl.x,tl.y,tl.col,16,200);ring(tl.x,tl.y,tl.r,tl.col);G.shake=Math.max(G.shake,tl.r>100?7:4);sfx('boom');
      G.tels.splice(i,1);
    }
  }
  for(let i=G.fx.length-1;i>=0;i--){
    const f=G.fx[i];f.t+=dt;
    if((f.k==='meteor'||f.k==='arrows')&&!f.done&&f.t>=f.life){f.done=true;f.hit()}
    if(f.t>=f.life+((f.k==='meteor'||f.k==='arrows')?0.15:0))G.fx.splice(i,1);
  }
  const fr=Math.pow(0.04,dt);
  for(let i=G.parts.length-1;i>=0;i--){
    const p=G.parts[i];p.t+=dt;
    if(!p.ring){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.fly){p.vy+=40*dt}else{p.vx*=fr;p.vy*=fr}}
    if(p.t>=p.life)G.parts.splice(i,1);
  }
  if(G.parts.length>500)G.parts.splice(0,G.parts.length-500);
  for(let i=G.floats.length-1;i>=0;i--){const f=G.floats[i];f.t+=dt;f.y-=36*dt;if(f.t>1.15)G.floats.splice(i,1)}
}
function update(dt){
  G.time+=dt;G.worldT+=dt;
  if(!P.dead)updatePlayer(dt);
  else{P.anim+=dt;G.fx.length;}
  updateWorld(dt);
  // zona, descubrimientos
  revealAround();
  const z=zoneAt(Math.floor(P.x/TILE),Math.floor(P.y/TILE));
  if(z.id!==zoneKey){
    const first=zoneKey==='';zoneKey=z.id;G.zone=z;
    $('zoneName').textContent=z.name;
    if(!first)banner(z.name,z.lv);
    if(typeof checkVisitQuests==='function')checkVisitQuests(z.id);
    if(typeof checkAchievements==='function')checkAchievements();
  }
  for(const w of WAYPOINTS){
    if(!P.disc[w.id]&&Math.hypot(w.tx*TILE+16-P.x,w.ty*TILE+16-P.y)<150){
      P.disc[w.id]=1;banner('Obelisco descubierto',w.name);sfx('quest');log('Punto de viaje descubierto: '+w.name,'sys');
    }
  }
  // sugerencia de interacción
  hintT-=dt;
  if(hintT<=0){
    hintT=0.12;const it=P.dead?null:nearestInteract(),h=$('hint');
    if(h){if(it){h.textContent=(document.body.classList.contains('touch')?'':'[F] ')+it.txt;h.classList.add('on')}else h.classList.remove('on')}
  }
  // cámara
  let tx=P.x-vw/ZM/2,ty=P.y-vh/ZM/2-14;
  const mxx=Math.max(0,W*TILE-vw/ZM),myy=Math.max(0,H*TILE-vh/ZM);
  tx=clamp(tx,0,mxx);ty=clamp(ty,0,myy);
  if(G.snapCam){camX=tx;camY=ty;G.snapCam=false}
  else{const k=1-Math.pow(0.0008,dt);camX+=(tx-camX)*k;camY+=(ty-camY)*k}
  G.shake=Math.max(0,G.shake-dt*18);
  updateHUD(dt);
}
