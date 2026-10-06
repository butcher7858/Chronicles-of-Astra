
/* =====================================================================
   Dibujo del mundo, efectos, noche, minimapa y mapa del mundo
   ===================================================================== */
const flakes=[];for(let i=0;i<70;i++)flakes.push({x:Math.random(),y:Math.random(),s:Math.random()*0.6+0.4,p:Math.random()*6});

function drawFx(t){
  for(const f of G.fx){
    const k=Math.min(1,f.t/f.life);
    if(f.k==='slash'){
      ctx.save();ctx.translate(f.x,f.y);ctx.scale(f.dir||1,1);
      ctx.strokeStyle=f.col;ctx.globalAlpha=1-k;ctx.lineWidth=5*(1-k)+1;ctx.lineCap='round';
      ctx.beginPath();ctx.arc(0,0,f.r*(0.7+k*0.4),-1.2+k*0.8,0.9+k*0.8);ctx.stroke();ctx.restore();
    }else if(f.k==='beam'){
      ctx.save();ctx.globalCompositeOperation='lighter';
      const h=110*(0.5+k),g=ctx.createLinearGradient(0,f.y,0,f.y-h);
      g.addColorStop(0,rgba(f.col,0.6*(1-k)));g.addColorStop(1,rgba(f.col,0));
      ctx.fillStyle=g;ctx.fillRect(f.x-14*(1-k*0.5),f.y-h,28*(1-k*0.5),h);ctx.restore();
    }else if(f.k==='spin'){
      ctx.save();ctx.translate(P.x,P.y-10);ctx.strokeStyle=f.col;ctx.globalAlpha=1-k;ctx.lineWidth=4;
      for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(0,0,60+i*10,k*12+i*2.1,k*12+i*2.1+1.2);ctx.stroke()}ctx.restore();
    }else if(f.k==='frost'){
      ctx.save();ctx.globalCompositeOperation='lighter';
      const r=f.r*Math.min(1,k*2.2),c=f.col||(f.gold?'255,224,138':'159,224,255'),FX=f.at?f.at.x:P.x,FY=f.at?f.at.y:P.y;
      const g=ctx.createRadialGradient(FX,FY,r*0.3,FX,FY,r);g.addColorStop(0,'rgba('+c+',0)');g.addColorStop(0.85,'rgba('+c+','+(0.45*(1-k)).toFixed(2)+')');g.addColorStop(1,'rgba('+c+',0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(FX,FY,r,r*0.7,0,0,6.283);ctx.fill();ctx.restore();
    }else if(f.k==='arrows'){
      ctx.save();ctx.strokeStyle=f.col||'#e8e0c8';ctx.lineWidth=2;
      for(let i=0;i<22;i++){const sd=i*7.31,ax=f.x+Math.sin(sd)*95,ph=((k*1.6+i*0.137)%1),ay=f.y+Math.cos(sd*1.7)*48,yy=ay-300*(1-ph);
        if(ph<1&&k<1.05){ctx.globalAlpha=0.9*(1-Math.max(0,k-0.8)*4);ctx.beginPath();ctx.moveTo(ax-3,yy-26);ctx.lineTo(ax,yy);ctx.stroke()}}
      ctx.globalAlpha=1;ctx.strokeStyle='rgba(232,224,200,'+(0.2+0.3*k).toFixed(2)+')';ctx.beginPath();ctx.ellipse(f.x,f.y,100*k,100*k*0.5,0,0,6.283);ctx.stroke();ctx.restore();
    }else if(f.k==='meteor'){
      const e=k*k,mx=f.x-160*(1-e),my=f.y-420*(1-e);
      ctx.save();ctx.globalCompositeOperation='lighter';
      const g=ctx.createRadialGradient(mx,my,2,mx,my,26);g.addColorStop(0,'rgba(255,240,200,1)');g.addColorStop(0.4,rgba(f.col||'#ff7a28',0.75));g.addColorStop(1,rgba(f.col||'#ff7a28',0));
      ctx.fillStyle=g;ctx.fillRect(mx-28,my-28,56,56);
      ctx.strokeStyle=rgba(f.col||'#ff8c32',0.5);ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(mx-160*0.25*(1-e)-30,my-420*0.25*(1-e)-30);ctx.stroke();ctx.restore();
      ctx.strokeStyle='rgba(255,100,40,'+(0.3+0.4*k).toFixed(2)+')';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(f.x,f.y,90*k,90*k*0.5,0,0,6.283);ctx.stroke();
    }else if(f.k==='ghost'){
      ctx.globalAlpha=0.5*(1-k);drawHuman(ctx,f.x,f.y,playerLook(),{dir:f.dir,t:0});ctx.globalAlpha=1;
    }
  }
}
function drawParts(){
  for(const p of G.parts){
    const k=p.t/p.life;
    if(p.ring){
      ctx.strokeStyle=p.col;ctx.globalAlpha=1-k;ctx.lineWidth=3*(1-k)+0.5;
      ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*Math.min(1,k*2.5),p.r*Math.min(1,k*2.5)*0.5,0,0,6.283);ctx.stroke();ctx.globalAlpha=1;
    }else{
      ctx.globalAlpha=1-k;ctx.fillStyle=p.col;const s=p.size*(p.fly?1:(1-k*0.5));ctx.fillRect(p.x-s/2,p.y-s/2,s,s);ctx.globalAlpha=1;
    }
  }
}
function drawProjs(t){
  for(const p of G.projs){
    if(p.enemy){
      if(p.arrow){const a=Math.atan2(p.vy,p.vx);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);ctx.strokeStyle='#d8d0b8';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(6,0);ctx.stroke();ctx.fillStyle='#bbb';ctx.beginPath();ctx.moveTo(6,-2);ctx.lineTo(10,0);ctx.lineTo(6,2);ctx.fill();ctx.restore()}
      else{ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(p.x,p.y,1,p.x,p.y,13);g.addColorStop(0,'#fff');g.addColorStop(0.4,rgba(p.col,0.8));g.addColorStop(1,rgba(p.col,0));ctx.fillStyle=g;ctx.fillRect(p.x-13,p.y-13,26,26);ctx.restore()}
    }else{
      ctx.save();ctx.globalCompositeOperation='lighter';
      for(let i=0;i<p.trail.length;i++){const q=p.trail[i],a=i/p.trail.length;ctx.fillStyle=rgba(p.col,0.5*a);ctx.beginPath();ctx.arc(q.x,q.y,(p.big?7:4.5)*a,0,6.283);ctx.fill()}
      const r=p.big?15:10,g=ctx.createRadialGradient(p.x,p.y,1,p.x,p.y,r);g.addColorStop(0,'#fff');g.addColorStop(0.35,rgba(p.col,0.9));g.addColorStop(1,rgba(p.col,0));
      ctx.fillStyle=g;ctx.fillRect(p.x-r,p.y-r,r*2,r*2);ctx.restore();
    }
  }
}
function drawTels(t){
  for(const tl of G.tels){
    if(tl.t<0)continue;
    const k=tl.t/tl.dur;
    ctx.save();ctx.fillStyle=rgba(tl.col,0.1+0.1*Math.sin(t*14));ctx.beginPath();ctx.ellipse(tl.x,tl.y,tl.r,tl.r*0.55,0,0,6.283);ctx.fill();
    ctx.strokeStyle=rgba(tl.col,0.9);ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=rgba(tl.col,0.32);ctx.beginPath();ctx.ellipse(tl.x,tl.y,tl.r*k,tl.r*k*0.55,0,0,6.283);ctx.fill();ctx.restore();
  }
}
function drawFloats(){
  for(const f of G.floats){
    const k=f.t/1.15,pop=k<0.12?1+(0.12-k)*5:1;
    ctx.save();ctx.globalAlpha=k>0.7?1-(k-0.7)/0.3:1;ctx.translate(f.x,f.y);ctx.scale(pop,pop);
    ctx.font='800 '+f.size+'px "Segoe UI",system-ui,sans-serif';ctx.textAlign='center';ctx.lineJoin='round';
    ctx.lineWidth=4;ctx.strokeStyle='rgba(0,0,0,0.85)';ctx.strokeText(f.txt,0,0);ctx.fillStyle=f.col;ctx.fillText(f.txt,0,0);ctx.restore();
  }
}
function drawCastGlyph(t){
  if(!P.cast||P.cast.gather||P.cast.travel)return;
  const c=P.cast.ab.col||'#fff',k=P.cast.time/P.cast.dur;
  ctx.save();ctx.translate(P.x,P.y+2);ctx.scale(1,0.45);ctx.rotate(t*2);
  ctx.strokeStyle=rgba(c,0.8);ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,22+k*8,0,6.283);ctx.stroke();
  ctx.setLineDash([5,7]);ctx.beginPath();ctx.arc(0,0,32+k*8,0,6.283);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();for(let i=0;i<5;i++){const a=i*2.513;ctx.lineTo(Math.cos(a)*20,Math.sin(a)*20)}ctx.closePath();ctx.stroke();ctx.restore();
}

function draw(dt){
  const t=G.time;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if(!P||(!G.started&&!G.showcase)){
    const g=ctx.createLinearGradient(0,0,0,vh);g.addColorStop(0,'#16223a');g.addColorStop(1,'#0a1018');ctx.fillStyle=g;ctx.fillRect(0,0,vw,vh);return;
  }
  ctx.fillStyle='#0b0f0a';ctx.fillRect(0,0,vw,vh);
  const sh=G.shakeOff?0:G.shake;
  const cx=camX+(sh?rand(-sh,sh)/ZM:0),cy=camY+(sh?rand(-sh,sh)/ZM:0);
  const s=dpr*ZM;
  ctx.setTransform(s,0,0,s,-cx*s,-cy*s);
  ctx.lineJoin='round';
  const x0=Math.max(0,Math.floor(cx/TILE)-1),y0=Math.max(0,Math.floor(cy/TILE)-1),
        x1=Math.min(W-1,Math.ceil((cx+vw/ZM)/TILE)+1),y1=Math.min(H-1,Math.ceil((cy+vh/ZM)/TILE)+1);
  // terreno
  const a0=Math.floor(x0/CK),a1=Math.floor(x1/CK),b0=Math.floor(y0/CK),b1=Math.floor(y1/CK);
  for(let b=b0;b<=b1;b++)for(let a=a0;a<=a1;a++)ctx.drawImage(getChunk(a,b),a*CPX,b*CPX,CPX+0.7,CPX+0.7);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const tt=tiles[idx(x,y)];if(tt===T.WATER||tt===T.BOG)waterFx(x*TILE,y*TILE,x,y,t)}
  // sombra de zona / día
  const night=nightAmt();
  // objetos ordenados por Y
  const R=[];
  for(let y=y0;y<=y1+2&&y<H;y++)for(let x=x0;x<=x1;x++){
    const c=deco[idx(x,y)];if(!c||c>9)continue;
    const sp=decoSprite(c,x,y,Z[zmap[idx(x,y)]].id);if(sp)R.push({y:y*TILE+27,k:0,sp:sp,x:x*TILE+16,yy:y*TILE+27});
  }
  for(const b of BUILD){
    const bx=b.x*TILE,by=(b.y+b.h)*TILE;
    if(bx>cx+vw/ZM+60||bx+b.w*TILE<cx-60||by<cy-20||by-b.h*TILE-60>cy+vh/ZM)continue;
    R.push({y:by-2,k:1,b:b});
  }
  for(const p of PROPS){if(p.x<cx-90||p.x>cx+vw/ZM+90||p.y<cy-40||p.y>cy+vh/ZM+120)continue;R.push({y:p.y+10,k:2,p:p})}
  for(const n of G.nodes){if(n.x<cx-40||n.x>cx+vw/ZM+40||n.y<cy-30||n.y>cy+vh/ZM+60)continue;R.push({y:n.y+8,k:3,n:n})}
  for(const m of G.mobs){
    if(m.x<cx-120||m.x>cx+vw/ZM+120||m.y<cy-60||m.y>cy+vh/ZM+160)continue;
    R.push({y:m.dead?m.y-2000:m.y,k:4,m:m});
  }
  for(const n of G.npcs){if(n.x<cx-60||n.x>cx+vw/ZM+60||n.y<cy-40||n.y>cy+vh/ZM+140)continue;R.push({y:n.y,k:5,n:n})}
  for(const b of G.bots){if(b.x<cx-60||b.x>cx+vw/ZM+60||b.y<cy-40||b.y>cy+vh/ZM+140)continue;R.push({y:b.y,k:6,b:b})}
  R.push({y:P.y+0.1,k:7});
  R.sort((a,b)=>a.y-b.y);
  const near=nearestInteract();
  for(const r of R){
    switch(r.k){
      case 0:putSprite(r.sp,r.x,r.yy);break;
      case 1:drawBuilding(r.b,night);break;
      case 2:drawProp(r.p,t,night);break;
      case 3:drawNode(r.n,t,near&&near.e===r.n);break;
      case 4:drawMobEntity(r.m,t,P.target===r.m);break;
      case 5:drawNpcEntity(r.n,t,near&&near.e===r.n);break;
      case 6:drawBotEntity(r.b,t);break;
      case 7:drawCastGlyph(t);drawPlayerEntity(t);break;
    }
  }
  drawTels(t);drawFx(t);drawProjs(t);drawParts();drawFloats();
  // destino de ruta
  if(P.path.length&&!P.intent){const e=P.path[P.path.length-1];ctx.strokeStyle='rgba(255,255,255,'+(0.5+0.3*Math.sin(t*6)).toFixed(2)+')';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(e.x,e.y+4,9,4,0,0,6.283);ctx.stroke()}
  // noche y cuevas
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const zid=G.zone?G.zone.id:'meadow';
  const zdark=zid==='cave'?0.5:zid==='palace'?0.42:0;
  const dark=Math.max(night,zdark);
  if(dark>0.04){
    const lw=lightCv.width,lh=lightCv.height,q=0.5*ZM;
    lctx.globalCompositeOperation='source-over';lctx.clearRect(0,0,lw,lh);
    lctx.fillStyle='rgba(6,10,34,'+(dark*0.78).toFixed(3)+')';lctx.fillRect(0,0,lw,lh);
    lctx.globalCompositeOperation='destination-out';
    const light=(wx,wy,r,a)=>{
      const sx=(wx-cx)*q,sy=(wy-cy)*q,rr=r*q;
      if(sx<-rr||sy<-rr||sx>lw+rr||sy>lh+rr)return;
      const g=lctx.createRadialGradient(sx,sy,rr*0.1,sx,sy,rr);g.addColorStop(0,'rgba(0,0,0,'+a+')');g.addColorStop(1,'rgba(0,0,0,0)');
      lctx.fillStyle=g;lctx.fillRect(sx-rr,sy-rr,rr*2,rr*2);
    };
    light(P.x,P.y-16,zdark?190:140,0.85);
    for(const p of PROPS){
      if(p.t==='lamp')light(p.x,p.y-28,120,0.9);
      else if(p.t==='campfire')light(p.x,p.y-8,150,0.95);
      else if(p.t==='obelisk'&&P.disc[p.wp])light(p.x,p.y-40,100,0.6);
    }
    for(const m of G.mobs)if(!m.dead&&(m.boss||m.rare))light(m.x,m.y-20,90,0.5);
    ctx.drawImage(lightCv,0,0,vw,vh);
    for(const p of PROPS)propGlow(p,t,Math.max(night,zdark*0.8));
  }
  // clima
  if(zid==='snow'||zid==='cumbre'||zid==='palace'||zid==='desert'){
    const snow=zid!=='desert';
    if(snow){ctx.fillStyle='rgba(255,255,255,0.8)';for(const f of flakes){const x=((f.x+Math.sin(t*0.6+f.p)*0.03+t*0.01*f.s)%1)*vw,y=((f.y+t*0.07*f.s)%1)*vh;ctx.fillRect(x,y,f.s*2.4,f.s*2.4)}}
    else{ctx.fillStyle='rgba(235,200,120,0.045)';ctx.fillRect(0,0,vw,vh)}
  }
  // viñeta y vida baja
  const vg=ctx.createRadialGradient(vw/2,vh/2,Math.min(vw,vh)*0.45,vw/2,vh/2,Math.max(vw,vh)*0.78);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,0.38)');ctx.fillStyle=vg;ctx.fillRect(0,0,vw,vh);
  if(!P.dead&&P.hp<P.maxhp*0.3){
    const a=(0.12+0.08*Math.sin(t*5))*(1-P.hp/(P.maxhp*0.3));
    const rg=ctx.createRadialGradient(vw/2,vh/2,Math.min(vw,vh)*0.3,vw/2,vh/2,Math.max(vw,vh)*0.7);rg.addColorStop(0,'rgba(180,0,0,0)');rg.addColorStop(1,'rgba(200,0,0,'+(a*3).toFixed(3)+')');
    ctx.fillStyle=rg;ctx.fillRect(0,0,vw,vh);
  }
  if(P.dead){ctx.fillStyle='rgba(20,0,0,0.35)';ctx.fillRect(0,0,vw,vh)}
  drawMinimap(t);
}

/* ---------- Minimapa y mapa del mundo ---------- */
function drawMinimap(t){
  const S=mini.width,tiles_=64,sc=S/tiles_,px=P.x/TILE,py=P.y/TILE;
  mctx.setTransform(1,0,0,1,0,0);mctx.fillStyle='#070a0d';mctx.fillRect(0,0,S,S);
  mctx.imageSmoothingEnabled=false;
  mctx.save();mctx.translate(S/2-px*sc,S/2-py*sc);mctx.scale(sc,sc);
  mctx.drawImage(miniBase,0,0);
  mctx.restore();
  const X=wx=>S/2+(wx/TILE-px)*sc,Y=wy=>S/2+(wy/TILE-py)*sc;
  const exp=(wx,wy)=>G.explored[Math.floor(wy/TILE/CELL)*GW+Math.floor(wx/TILE/CELL)];
  for(const w of WAYPOINTS){
    if(!P.disc[w.id])continue;const x=X(w.tx*TILE),y=Y(w.ty*TILE);
    mctx.fillStyle='#6fe8dc';mctx.beginPath();mctx.moveTo(x,y-4);mctx.lineTo(x+3.5,y);mctx.lineTo(x,y+4);mctx.lineTo(x-3.5,y);mctx.fill();
  }
  for(const n of G.npcs){const mk=npcMark(n.id);mctx.fillStyle=mk==='avail'||mk==='ready'?'#ffe066':'#c8b068';mctx.fillRect(X(n.x)-1.5,Y(n.y)-1.5,3,3)}
  for(const m of G.mobs){
    if(m.dead||dist(m,P)>TILE*30||!exp(m.x,m.y))continue;
    mctx.fillStyle=m.boss?'#ff2a2a':m.rare?'#ff9a2a':'#d84a3a';const r=m.boss?3.2:m.rare?2.4:1.4;mctx.fillRect(X(m.x)-r,Y(m.y)-r,r*2,r*2);
  }
  for(const b of G.bots){if(dist(b,P)<TILE*26){mctx.fillStyle='#6fa8ff';mctx.fillRect(X(b.x)-1,Y(b.y)-1,2,2)}}
  mctx.save();mctx.translate(S/2,S/2);mctx.rotate(P.moving?P.fa+Math.PI/2:(P.dir>0?Math.PI/2:-Math.PI/2));
  mctx.fillStyle='#fff';mctx.strokeStyle='#000';mctx.lineWidth=1;mctx.beginPath();mctx.moveTo(0,-5);mctx.lineTo(4,4);mctx.lineTo(0,2);mctx.lineTo(-4,4);mctx.closePath();mctx.fill();mctx.stroke();mctx.restore();
}
function renderMap(){
  const c=$('mapCv'),g=c.getContext('2d'),w=c.width,h=c.height,sx=w/W,sy=h/H,t=G.time;
  g.imageSmoothingEnabled=false;g.fillStyle='#090d11';g.fillRect(0,0,w,h);
  g.drawImage(miniBase,0,0,w,h);
  g.textAlign='center';g.font='600 10px sans-serif';g.lineJoin='round';
  for(const z of Z){
    const zc=ZCENTER[z.id];if(!zc)continue;
    if(!G.explored[Math.floor(zc.y/CELL)*GW+Math.floor(zc.x/CELL)])continue;
    g.lineWidth=3;g.strokeStyle='rgba(0,0,0,0.85)';g.strokeText(z.name,zc.x*sx,zc.y*sy);g.fillStyle=z.safe?'#9fe8ff':'#f1dfae';g.fillText(z.name,zc.x*sx,zc.y*sy);
  }
  for(const wp of WAYPOINTS){
    const x=wp.tx*sx,y=wp.ty*sy,on=P.disc[wp.id],sel=G.mapSel===wp.id;
    g.fillStyle=on?(sel?'#fff':'#6fe8dc'):'#555';g.strokeStyle='#000';g.lineWidth=1.4;
    g.beginPath();g.moveTo(x,y-7);g.lineTo(x+6,y);g.lineTo(x,y+7);g.lineTo(x-6,y);g.closePath();g.fill();g.stroke();
    if(sel){g.strokeStyle='#fff';g.beginPath();g.arc(x,y,10+Math.sin(t*6)*1.5,0,6.283);g.stroke()}
  }
  for(const m of G.mobs)if(m.boss&&G.explored[Math.floor(m.y/TILE/CELL)*GW+Math.floor(m.x/TILE/CELL)]){g.fillStyle='#ff3a2a';g.strokeStyle='#000';g.beginPath();g.arc(m.x/TILE*sx,m.y/TILE*sy,4,0,6.283);g.fill();g.stroke()}
  const px=P.x/TILE*sx,py=P.y/TILE*sy;
  g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=1.4;g.beginPath();g.arc(px,py,4+Math.sin(t*5)*1,0,6.283);g.fill();g.stroke();
}

/* ---------- Bucle principal ---------- */
let lastTs=0;
function frame(ts){
  requestAnimationFrame(frame);
  const dt=Math.min(0.05,((ts-lastTs)/1000)||0.016);lastTs=ts;
  try{
    if(G.started&&P){update(dt);MP.tick(dt)}else if(G.showcase&&P)showcaseTick(dt);
    draw(dt);
    if(G.started&&!$('pMap').hidden)renderMap();
  }catch(e){if(!frame.err){frame.err=1;console.error(e)}}
}
