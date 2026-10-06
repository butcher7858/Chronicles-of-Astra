
/* =====================================================================
   Criaturas y entidades (mobs, PNJ, jugadores simulados, jugador)
   ===================================================================== */
function drawCreature(g,x,y,m,o){
  const d=m.def,L=d.look,kind=d.kind,t=o.t,mv=o.moving,sw=o.sw||0;
  const k=(d.scale||1)*(kind==='quad'||kind==='toad'||kind==='croc'||kind==='golem'||kind==='arach'?d.size/13:1);
  const dir=o.dir||1,ph=mv?t*10:0;
  g.save();g.translate(x,y);g.scale(k*dir,k);
  g.lineCap='round';g.lineJoin='round';
  if(kind==='quad'){
    const big=L.bear,boar=L.boar,bc=L.body,dc=L.dark;
    const lunge=sw?(1-Math.abs(sw*2-1))*5:0;
    g.translate(lunge,0);
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,1,big?20:16,4.6,0,0,6.283);g.fill();
    const leg=(lx,s,col)=>{const a=Math.sin(ph+s)*(mv?6:0),l=Math.max(0,Math.cos(ph+s))*(mv?3:0);lim(g,lx,-9,lx+a,-1.6-l,big?5.6:4.2,col)};
    leg(-10,0,dc);leg(9,Math.PI,dc);
    if(!boar){g.strokeStyle=OUT;g.lineWidth=big?4:5.4;g.beginPath();g.moveTo(-14,-14);g.quadraticCurveTo(-23,-18+Math.sin(t*5)*2,-22,-8-(big?0:3));g.stroke();g.strokeStyle=dc;g.lineWidth=big?2.4:3.6;g.stroke()}
    else{lim(g,-14,-13,-18,-17,2,dc)}
    g.fillStyle=bc;g.beginPath();g.ellipse(0,-13,big?17:15,big?10:7.6,0,0,6.283);g.fill();g.strokeStyle=OUT;g.lineWidth=1.1;g.stroke();
    g.fillStyle='rgba(0,0,0,0.16)';g.beginPath();g.ellipse(-2,-8,13,3,0,0,6.283);g.fill();
    g.fillStyle='rgba(255,255,255,0.13)';g.beginPath();g.ellipse(-2,-17,10,3,0,0,6.283);g.fill();
    if(boar){g.fillStyle=dc;for(let i=0;i<6;i++){g.beginPath();g.moveTo(-10+i*4,-19.5);g.lineTo(-8+i*4,-24);g.lineTo(-6+i*4,-19.5);g.fill()}}
    leg(-6,Math.PI,bc);leg(13,0,bc);
    // cabeza
    const hx=big?15:13,hy=big?-16:-14;
    g.fillStyle=bc;g.beginPath();g.ellipse(hx+2,hy,big?9:7.4,big?7.4:6,0,0,6.283);g.fill();g.strokeStyle=OUT;g.lineWidth=1.1;g.stroke();
    if(L.snout){poly(g,[hx+6,hy-3,hx+16,hy+1,hx+6,hy+4],bc);disc(g,hx+15.4,hy+0.4,1.3,'#1a1010',false)}
    if(boar){disc(g,hx+9,hy+2,3.4,tint(bc,0.2));disc(g,hx+10,hy+1.4,0.9,'#1a1010',false);poly(g,[hx+6,hy+3,hx+12,hy-3,hx+8,hy+5],'#f4f0e0')}
    if(big){disc(g,hx+10,hy+2,3.6,tint(bc,0.25));disc(g,hx+11.4,hy+1,1.2,'#1a1010',false)}
    if(L.ears){poly(g,[hx-3,hy-5,hx-1,hy-12,hx+3,hy-6],bc);if(!big)poly(g,[hx-0.5,hy-6,hx+0.5,hy-10,hx+2,hy-6.4],dc,false)}
    const e=L.eye||'#ffcc66';
    g.save();g.globalCompositeOperation='lighter';disc(g,hx+5,hy-2,3.2,rgba(e,0.4),false);g.restore();
    disc(g,hx+5,hy-2,1.3,e,false);
    if(sw>0){g.fillStyle='#f4f0e0';g.fillRect(hx+8,hy+3,1.6,2.6);g.fillRect(hx+12,hy+3,1.6,2.6)}
  }else if(kind==='arach'){
    const bc=L.body,dc=L.dark,scorp=L.scorp;
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,1,17,4.8,0,0,6.283);g.fill();
    const lg=scorp?3:4;
    for(let i=0;i<lg;i++)for(const sd of [-1,1]){
      const a=Math.sin(ph*1.3+i*1.7+(sd>0?0:Math.PI))*(mv?3:0.6),bx=-5+i*5.5;
      lim(g,bx,-8,bx+sd*2+a,-17-(scorp?-4:0),2,dc);
      lim(g,bx+sd*2+a,-17+(scorp?4:0),bx+sd*11+a,-1,1.9,dc);
    }
    if(scorp){
      const sg=Math.sin(t*3)*0.12;
      g.strokeStyle=OUT;g.lineWidth=6;g.beginPath();g.moveTo(-9,-9);g.bezierCurveTo(-22,-12,-24,-30+sg*8,-12,-34);g.stroke();
      g.strokeStyle=bc;g.lineWidth=4;g.stroke();
      poly(g,[-14,-33,-8,-37,-8,-31],'#d9482a');
      g.fillStyle=bc;g.beginPath();g.ellipse(0,-9,12,6.4,0,0,6.283);g.fill();g.strokeStyle=OUT;g.lineWidth=1.1;g.stroke();
      for(let i=0;i<3;i++){g.strokeStyle='rgba(0,0,0,0.25)';g.beginPath();g.moveTo(-6+i*5,-14);g.lineTo(-6+i*5,-3);g.stroke()}
      disc(g,11,-9,5,tint(bc,0.1));
      const cl=sw?0.5:0;
      for(const sd of [-1,1]){lim(g,14,-9+sd*2,20,-10+sd*6-cl*8,2.6,bc);poly(g,[19,-12+sd*6-cl*8,26,-9+sd*5,19,-6+sd*6-cl*8],bc)}
      disc(g,13,-11,1.1,L.eye,false);
    }else{
      g.fillStyle=bc;g.beginPath();g.ellipse(-6,-11,9,7.6,0,0,6.283);g.fill();g.strokeStyle=OUT;g.lineWidth=1.1;g.stroke();
      g.fillStyle='rgba(255,70,70,0.55)';g.fillRect(-9,-14,3,2);g.fillRect(-9,-11,3,2);
      g.fillStyle=bc;g.beginPath();g.ellipse(6,-10,6,5,0,0,6.283);g.fill();g.stroke();
      for(let i=0;i<4;i++)disc(g,8+(i%2)*2.4,-12+Math.floor(i/2)*2.6,1,L.eye,false);
      poly(g,[10,-6,12,-1,9,-5],'#e8e0c8');
    }
  }else if(kind==='bat'){
    g.fillStyle='rgba(0,0,0,0.2)';g.beginPath();g.ellipse(0,2,9,3,0,0,6.283);g.fill();
    const fy=-22+Math.sin(t*5)*3,fl=Math.sin(t*(mv?22:12)),wc=L.body,dc=L.dark;
    for(const sd of [-1,1]){
      g.fillStyle=dc;g.beginPath();g.moveTo(0,fy);g.quadraticCurveTo(sd*14,fy-12-fl*9,sd*26,fy-3-fl*5);
      g.lineTo(sd*21,fy+2-fl*2);g.lineTo(sd*15,fy+5-fl);g.lineTo(sd*9,fy+4);g.lineTo(sd*4,fy+6);g.closePath();g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    }
    g.fillStyle=wc;g.beginPath();g.ellipse(0,fy,5,6.4,0,0,6.283);g.fill();g.stroke();
    disc(g,0,fy-6,4.4,wc);poly(g,[-4,fy-8,-5,fy-14,-1,fy-9],wc);poly(g,[4,fy-8,5,fy-14,1,fy-9],wc);
    disc(g,-1.6,fy-6.4,1,L.eye,false);disc(g,1.6,fy-6.4,1,L.eye,false);
    if(sw){g.fillStyle='#fff';g.fillRect(-1.8,fy-3,1,2);g.fillRect(1,fy-3,1,2)}
  }else if(kind==='toad'){
    const bc=L.body,dc=L.dark,jump=mv?Math.abs(Math.sin(ph*0.5))*8:Math.sin(t*2)*0.8;
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,1,14-jump*0.3,4.4,0,0,6.283);g.fill();
    g.translate(0,-jump);
    lim(g,-9,-6,-14,-1,5,dc);lim(g,9,-6,14,-1,5,dc);
    g.fillStyle=bc;g.beginPath();g.ellipse(0,-9,13,9.4,0,0,6.283);g.fill();g.strokeStyle=OUT;g.lineWidth=1.1;g.stroke();
    g.fillStyle=L.belly;g.beginPath();g.ellipse(3,-5,8,4.4,0,0,6.283);g.fill();
    g.fillStyle=dc;for(const p of [[-6,-13],[-1,-16],[4,-12],[-9,-8]])disc(g,p[0],p[1],1.8,dc,false);
    for(const ex of [-1,6]){disc(g,ex+3,-18,4,bc);disc(g,ex+3.6,-18,2.4,L.eye);disc(g,ex+4,-18,1,'#111',false)}
    g.strokeStyle='#1a2a10';g.lineWidth=1.2;g.beginPath();g.moveTo(5,-9);g.quadraticCurveTo(11,-6,13,-9);g.stroke();
    if(sw){g.strokeStyle='#e86a8a';g.lineWidth=2.6;g.beginPath();g.moveTo(11,-8);g.lineTo(11+sw*22,-9);g.stroke()}
    if(L.crown){poly(g,[-4,-20,-4,-27,-1,-23,2,-29,5,-23,8,-27,8,-20],'#e8c23a');disc(g,2,-24,1.2,'#ff3a3a',false)}
  }else if(kind==='croc'){
    const bc=L.body,dc=L.dark,jaw=sw?Math.sin(sw*3.14)*9:Math.sin(t*2)*1.2;
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,1,24,5,0,0,6.283);g.fill();
    lim(g,-9,-6,-12,0,4.4,dc);lim(g,12,-6,16,0,4.4,dc);
    const sy=mv?Math.sin(ph)*3:0;
    g.strokeStyle=OUT;g.lineWidth=9;g.beginPath();g.moveTo(-8,-8);g.quadraticCurveTo(-24,-8+sy,-34,-3);g.stroke();g.strokeStyle=bc;g.lineWidth=7;g.stroke();
    g.fillStyle=bc;g.beginPath();g.ellipse(0,-9,18,7,0,0,6.283);g.fill();g.strokeStyle=OUT;g.lineWidth=1.1;g.stroke();
    g.fillStyle=dc;for(let i=0;i<7;i++){g.beginPath();g.moveTo(-14+i*5,-15);g.lineTo(-12+i*5,-19);g.lineTo(-10+i*5,-15);g.fill()}
    poly(g,[14,-12,34,-11-jaw*0.3,34,-8-jaw*0.3,14,-6],bc);
    poly(g,[14,-6,33,-8+jaw,33,-5+jaw,14,-3],tint(bc,-0.15));
    g.fillStyle='#f4f0e0';for(let i=0;i<5;i++){g.fillRect(17+i*3.4,-8-jaw*0.2,1,2);g.fillRect(18+i*3.4,-6+jaw*0.6,1,-2)}
    disc(g,15,-14,2.6,bc);disc(g,15.6,-14.4,1.2,L.eye,false);
  }else if(kind==='golem'){
    const bc=L.body,dc=L.dark,sy=mv?Math.sin(ph*0.6)*2:0;
    g.fillStyle='rgba(0,0,0,0.32)';g.beginPath();g.ellipse(0,1,17,5,0,0,6.283);g.fill();
    rr(g,-12,-12+sy,9,12-sy,2,dc);rr(g,3,-12-sy,9,12+sy,2,dc);
    const arm=sw?-1+sw*0.6:0;
    for(const sd of [-1,1]){
      g.save();g.translate(sd*14,-32);g.rotate(sd*0.2+(sd>0?arm*1.6:0));
      rr(g,-5,0,10,20,3,bc);rr(g,-6.5,17,13,10,3,dc);g.restore();
    }
    poly(g,[-13,-14,-15,-34,-6,-40,7,-40,15,-34,13,-14],bc);
    poly(g,[-6,-40,0,-46,6,-40],tint(bc,0.25));
    g.strokeStyle='rgba(255,255,255,0.4)';g.lineWidth=1;g.beginPath();g.moveTo(-8,-36);g.lineTo(-2,-26);g.lineTo(-6,-16);g.moveTo(4,-38);g.lineTo(8,-28);g.stroke();
    poly(g,[-6,-48,6,-48,7,-40,-7,-40],dc);
    g.save();g.globalCompositeOperation='lighter';disc(g,-2.4,-44,4.4,rgba(L.eye,0.5),false);disc(g,3.6,-44,4.4,rgba(L.eye,0.5),false);disc(g,0,-27,6,rgba(L.eye,0.35),false);g.restore();
    disc(g,-2.4,-44,1.8,L.eye,false);disc(g,3.6,-44,1.8,L.eye,false);
  }
  g.restore();
}

/* ---------- Entidades ---------- */
function hpBar(x,y,w,frac,col){
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(x-w/2-1,y-1,w+2,6);
  ctx.fillStyle='#3a1414';ctx.fillRect(x-w/2,y,w,4);
  ctx.fillStyle=col;ctx.fillRect(x-w/2,y,w*clamp(frac,0,1),4);
  ctx.fillStyle='rgba(255,255,255,0.28)';ctx.fillRect(x-w/2,y,w*clamp(frac,0,1),1.4);
}
function targetRing(x,y,rx,col,t){
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=2.2;ctx.globalAlpha=0.75+0.25*Math.sin(t*6);
  ctx.beginPath();ctx.ellipse(x,y+2,rx,rx*0.38,0,0,6.283);ctx.stroke();
  ctx.setLineDash([6,8]);ctx.lineDashOffset=-t*20;ctx.beginPath();ctx.ellipse(x,y+2,rx+5,(rx+5)*0.38,0,0,6.283);ctx.stroke();
  ctx.restore();
}
function mobHeight(m){
  const d=m.def,k=d.scale||1;
  if(d.kind==='human')return 46*k;
  if(d.kind==='golem')return 50*(d.size/13)*0.9;
  if(d.kind==='bat')return 34;
  return 30*(d.size/13)*(d.scale||1);
}
function drawMobEntity(m,t,sel){
  const d=m.def;
  if(m.dead){
    ctx.save();
    const fade=m.lootable?1:Math.max(0,1-(m.deadT-20)/25);
    if(fade<=0){ctx.restore();return}
    ctx.globalAlpha=Math.min(1,fade);
    ctx.translate(m.x,m.y);ctx.scale(m.dir>0?1:-1,1);
    ctx.fillStyle='rgba(0,0,0,0.28)';ctx.beginPath();ctx.ellipse(0,2,m.size*1.1,m.size*0.4,0,0,6.283);ctx.fill();
    ctx.rotate(1.45);ctx.translate(0,-2);
    if(d.kind==='human')drawHuman(ctx,0,0,d.look,{dir:1,t:0,scale:d.scale||1});
    else drawCreature(ctx,0,0,m,{dir:1,t:0});
    ctx.restore();
    if(m.lootable){
      const p=0.6+0.4*Math.sin(t*5),r=m.loot?lootBestRar(m):0;
      const col=r>=3?'#ff9a2a':r===2?'#b070ff':r===1?'#5aa8ff':'#ffe08a';
      ctx.save();ctx.globalCompositeOperation='lighter';
      const gr=ctx.createRadialGradient(m.x,m.y-4,2,m.x,m.y-4,26);gr.addColorStop(0,rgba(col,0.55*p));gr.addColorStop(1,rgba(col,0));
      ctx.fillStyle=gr;ctx.fillRect(m.x-26,m.y-30,52,52);ctx.restore();
      for(let k=0;k<3;k++){const a=t*2+k*2.1;ctx.fillStyle=rgba(col,0.9);ctx.fillRect(m.x+Math.cos(a)*10-1,m.y-8-((t*18+k*9)%22),2,2)}
      label('Saquear',m.x,m.y-26,col,11);
    }
    return;
  }
  const flash=m.flash>0;
  const o={dir:m.dir,t:m.anim,moving:m.moving,sw:m.swingA>0?m.swingA/0.25:0,scale:d.scale};
  if(sel||m.state==='chase')targetRing(m.x,m.y,m.size+8,sel?'#ffd34d':'rgba(255,90,70,0.8)',t);
  if(m.slowT>0){ctx.fillStyle='rgba(120,200,255,0.18)';ctx.beginPath();ctx.ellipse(m.x,m.y,m.size+4,(m.size+4)*0.4,0,0,6.283);ctx.fill()}
  if(m.stun>0){for(let k=0;k<3;k++){const a=t*5+k*2.1;ctx.fillStyle='#ffe066';ctx.fillRect(m.x+Math.cos(a)*10,m.y-mobHeight(m)-4+Math.sin(a)*3,3,3)}}
  if(flash){ctx.save();ctx.filter='brightness(2.3) saturate(0.4)'}
  if(d.kind==='human')drawHuman(ctx,m.x,m.y,d.look,o);
  else drawCreature(ctx,m.x,m.y,m,o);
  if(flash)ctx.restore();
  if(m.dots.length){ctx.fillStyle=m.dots[0].col;for(let k=0;k<2;k++)ctx.fillRect(m.x+Math.sin(t*6+k*3)*6,m.y-10-((t*30+k*14)%mobHeight(m)),2,2)}
  const top=m.y-mobHeight(m)-14;
  const near=dist(m,P)<340;
  if(sel||m.state==='chase'||m.boss||m.rare||near){
    const w=m.boss?72:m.elite?46:34;
    hpBar(m.x,top,w,m.hp/m.maxhp,m.boss?'#c92a2a':m.elite?'#e0902a':'#c93c3c');
    const lc=m.level>P.level+4?'#ff4a3a':m.level>P.level+1?'#ff9a3a':m.level>=P.level-2?'#ffe066':'#8fd48f';
    label((m.boss||m.rare?m.name:m.name.split(' ')[0])+' '+m.level,m.x,top-3,m.elite?'#ffcf6a':lc,m.boss?14:12);
    if(m.elite){ctx.fillStyle='#ffcf6a';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText('★',m.x+w/2+8,top+5)}
  }
}
function drawNpcEntity(n,t,sel){
  const mk=npcMark(n.id);
  const near=dist(n,P)<60;
  if(near||sel)targetRing(n.x,n.y,18,'#7fe0ff',t);
  drawHuman(ctx,n.x,n.y,n.def.look,{dir:n.dir,t:t+n.anim,moving:false});
  label(n.name,n.x,n.y-58,'#8fe0ff',12);
  if(n.def.shop)label('Tienda',n.x,n.y-70,'#e8d9a0',10);
  if(mk){
    const b=Math.sin(t*4)*3,col=mk==='ready'?'#ffe066':mk==='avail'?'#ffe066':'#9aa0a8';
    ctx.save();ctx.font='bold 26px serif';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='rgba(0,0,0,0.8)';
    const ch=mk==='active'?'?':mk==='ready'?'?':'!';
    ctx.strokeText(ch,n.x,n.y-(n.def.shop?84:74)+b);ctx.fillStyle=col;ctx.fillText(ch,n.x,n.y-(n.def.shop?84:74)+b);ctx.restore();
  }
}
/* ---------- Apariencia ---------- */
const SKINT=['#f6d7b8','#e8c09a','#d9b08c','#c9966a','#a8744a','#8a5a3a','#5e3a24','#c8d0c0','#b8c8e0'];
const HAIRC=['#1c1c24','#3a2418','#6b4a2a','#a8742a','#c9a15a','#e8d890','#a8301f','#d8d8c8','#5a3a8a','#2f6fb8','#3a8a4a','#e8609a'];
const EYEC=['#1c1410','#5a3a1e','#3a5fd0','#2a7a3a','#8a5aa8','#c0402a','#e8c23a','#7fe0ff'];
const OUTC=[null,'#a8301f','#2a5fa8','#2f7a4a','#6a3a8a','#c9a03a','#2c2f3a','#e8e0c8','#d85a8a'];
const HAIRN=['Calvo','Corto','Largo','Rapado','Cresta','Coleta','Puntas'];
const BEARDN=['Sin barba','Corta','Media','Larga'];
const MARKN=['Ninguna','Cicatriz','Pintura'];
function defaultApp(cls){const c=CLS[cls]||CLS.war;return Object.assign({outfit:null,mark:0,showHat:null},c.app)}
function randomApp(cls){
  const a=defaultApp(cls);
  a.skin=pick(SKINT);a.hair=pick(HAIRC);a.hairStyle=ri(0,6);a.eye=pick(EYEC);a.beard=Math.random()<0.3?ri(1,3):0;a.beardColor=a.hair;a.mark=Math.random()<0.2?ri(1,2):0;
  a.outfit=Math.random()<0.5?pick(OUTC):null;return a;
}
function lookFor(cls,app,eq){
  const c=CLS[cls]||CLS.war;app=Object.assign(defaultApp(cls),app||{});
  const L=Object.assign({},c.vis);
  L.skin=app.skin;L.hair=app.hair;L.hairStyle=app.hairStyle;L.eye=app.eye;L.mark=app.mark||0;
  if(app.beard){L.beard=app.beardColor||app.hair;L.beardLen=app.beard}
  if(app.outfit){L.body=app.outfit;if(L.cape)L.cape=tint(app.outfit,-0.35);if(L.hat&&L.hatType!=='helm')L.hat=tint(app.outfit,-0.2)}
  const hasHead=!!(eq&&eq.head);
  if(L.hatType==='helm'&&!hasHead&&app.showHat!==true){L.hat=null;L.hatType=null}
  if(app.showHat===false){L.hat=null;L.hatType=null}
  if(eq){
    if(eq.chest){const k=RAR[eq.chest.rar].c;L.trim=k;if(eq.chest.rar>=2)L.body=tint(L.body,0.1)}
    if(eq.head){const k=RAR[eq.head.rar].c;if(L.hatType==='helm'){L.hat=tint(k,-0.15)}else if(eq.head.rar>=2)L.trim=k}
    const w=eq.weapon;
    if(w){const k=RAR[w.rar].c;if(L.weapon==='sword'||L.weapon==='dagger')L.blade=w.rar>=1?tint(k,0.55):L.blade;if(L.weapon==='staff'&&w.rar>=1)L.orb=k}
    if(eq.boots)L.legs=tint(L.legs,-0.1);
  }
  return L;
}
function drawBotEntity(b,t){
  const L=lookFor(b.cls,b.app||{skin:b.skin,hair:b.hair,hairStyle:b.hairStyle},null);
  const hop=b.hop>0?Math.abs(Math.sin(b.hop*7))*10:0;
  drawHuman(ctx,b.x,b.y-hop,L,{dir:b.dir,t:b.anim,moving:b.moving,mounted:b.mounted&&b.moving,fast:true});
  label(b.name+(b.level&&(b.remote||b.resident)?' · '+b.level:''),b.x,b.y-(b.mounted&&b.moving?64:56)-hop,b.remote?'#7fd0ff':b.resident?'#b9b09a':'#8fc0ff',11);
}
function playerLook(){return lookFor(P.cls,P.app,P.eq)}
function drawPlayerEntity(t){
  if(G.showcase)return;
  if(P.dead){
    ctx.save();ctx.translate(P.x,P.y);ctx.globalAlpha=0.55;
    ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.ellipse(0,2,14,5,0,0,6.283);ctx.fill();
    ctx.rotate(1.5);drawHuman(ctx,0,-4,playerLook(),{dir:1,t:0});ctx.restore();return;
  }
  const L=playerLook(),sw=P.swingA>0?P.swingA/0.28:0;
  if(P.iframes>0){ctx.globalAlpha=0.55}
  const roll=P.dash&&P.dash.roll?P.dash.t/P.dash.dur*6.283*P.dir:0;
  if(P.buffs.some(b=>b.kindAbsorb)){ctx.save();ctx.globalCompositeOperation='lighter';const gr=ctx.createRadialGradient(P.x,P.y-20,6,P.x,P.y-20,34);gr.addColorStop(0,'rgba(140,190,255,0)');gr.addColorStop(0.8,'rgba(140,190,255,0.28)');gr.addColorStop(1,'rgba(140,190,255,0)');ctx.fillStyle=gr;ctx.fillRect(P.x-36,P.y-56,72,72);ctx.restore()}
  if(P.flash>0){ctx.save();ctx.filter='brightness(1.9) saturate(1.4) hue-rotate(-20deg)'}
  drawHuman(ctx,P.x,P.y,L,{dir:P.dir,t:P.anim,moving:P.moving,mounted:P.mounted,fast:P.sprinting||P.mounted,sw:sw,cast:!!(P.cast&&!P.cast.gather&&!P.cast.travel),rollA:roll});
  if(P.flash>0)ctx.restore();
  ctx.globalAlpha=1;
  if(P.cast&&P.cast.gather){ctx.fillStyle='rgba(255,226,140,'+(0.4+0.3*Math.sin(t*10)).toFixed(2)+')';ctx.fillRect(P.x-1,P.y-60,2,2)}
  label(P.name,P.x,P.y-(P.mounted?64:56),'#9dffb0',12);
}
