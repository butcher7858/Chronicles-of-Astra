
/* =====================================================================
   d3c2_creat.js · Criaturas y entidades (mobs, PNJ, bots, jugador)
   - Renderizado detallado de criaturas y jefes
   - Tags flotantes de salud con imagen/retrato de apariencia
   - Mapeo completo de equipamiento visible a capas de modelo
   ===================================================================== */
function drawCreature(g,x,y,m,o){
  const d=m.def,L=d.look,kind=d.kind,t=o.t,mv=o.moving,sw=o.sw||0;
  const k=(d.scale||1)*(kind==='quad'||kind==='toad'||kind==='croc'||kind==='golem'||kind==='arach'?d.size/13:1);
  const dir=o.dir||1,ph=mv?t*10:0;
  g.save();g.translate(x,y);g.scale(k*dir,k);
  g.lineCap='round';g.lineJoin='round';

  if(kind==='quad'){
    const isDragon=m.def.id==='dragon_ignis'||(m.name&&m.name.includes('Dragón'))||L.dragon;
    if(isDragon){
      const lunge=sw?(1-Math.abs(sw*2-1))*8:0;
      g.translate(lunge,0);
      g.fillStyle='rgba(0,0,0,0.45)';g.beginPath();g.ellipse(0,2,26,7,0,0,6.283);g.fill();
      const leg=(lx,s,col)=>{
        const a=Math.sin(ph+s)*(mv?7:0),l=Math.max(0,Math.cos(ph+s))*(mv?3:0);
        lim(g,lx,-10,lx+a,-2-l,6.8,col);
        rr(g,lx+a-4,-3-l,8,4,1.5,'#1a0505');
      };
      leg(-14,0,'#4a0d0d');leg(12,Math.PI,'#4a0d0d');
      g.strokeStyle='#7f1d1d';g.lineWidth=7;g.beginPath();
      g.moveTo(-16,-12);g.quadraticCurveTo(-28,-18+Math.sin(t*4)*5,-36,-6+Math.sin(t*4)*7);g.stroke();
      poly(g,[-34,-10+Math.sin(t*4)*7,-42,-6+Math.sin(t*4)*7,-34,-2+Math.sin(t*4)*7],'#f59e0b');
      g.fillStyle='#991b1b';g.beginPath();g.ellipse(0,-16,22,12,0,0,6.283);g.fill();
      g.strokeStyle='#450a0a';g.lineWidth=1.5;g.stroke();
      g.strokeStyle='rgba(251,191,36,0.85)';g.lineWidth=1.5;
      g.beginPath();g.moveTo(-10,-18);g.lineTo(-2,-13);g.lineTo(8,-17);g.stroke();
      g.fillStyle='#78350f';
      for(let p=0;p<5;p++){
        poly(g,[-12+p*6,-24,-9+p*6,-30,-6+p*6,-24],'#f59e0b');
      }
      const wingFlap=Math.sin(t*5.5)*18;
      g.fillStyle='#7f1d1d';g.strokeStyle='#450a0a';g.lineWidth=1.5;
      poly(g,[-8,-20,-4,-42+wingFlap,18,-36+wingFlap*0.8,12,-20],'#b91c1c');
      poly(g,[12,-22,22,-36,32,-34,22,-16],'#991b1b');
      poly(g,[20,-36,36,-36,42,-26,38,-22,26,-26],'#991b1b');
      poly(g,[24,-36,16,-46,20,-38],'#d97706');
      poly(g,[28,-36,22,-48,26,-38],'#f59e0b');
      disc(g,36,-31,2.8,'#facc15',false);disc(g,36.5,-31,1.4,'#000',false);
      disc(g,41,-24,1.8,'#ea580c',false);
      const ember=Math.sin(t*12)*4;
      disc(g,44+ember,-24+Math.cos(t*10)*2,1.2,'#fbbf24',false);
      leg(-8,Math.PI,'#991b1b');leg(16,0,'#991b1b');
      g.restore();
      return;
    }

    const big=L.bear,boar=L.boar,bc=L.body||'#8e939b',dc=L.dark||'#5f646c';
    const lunge=sw?(1-Math.abs(sw*2-1))*5:0;
    g.translate(lunge,0);
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,1,big?20:16,4.6,0,0,6.283);g.fill();
    const leg=(lx,s,col)=>{const a=Math.sin(ph+s)*(mv?6:0),l=Math.max(0,Math.cos(ph+s))*(mv?3:0);lim(g,lx,-9,lx+a,-1.6-l,big?5.6:4.2,col)};
    leg(-10,0,dc);leg(9,Math.PI,dc);
    if(!boar){
      g.strokeStyle=OUT;g.lineWidth=big?4:5.4;g.beginPath();g.moveTo(-14,-14);g.quadraticCurveTo(-23,-18+Math.sin(t*5)*2,-22,-8-(big?0:3));g.stroke();
      g.strokeStyle=dc;g.lineWidth=big?2.4:3.6;g.stroke();
    }else{lim(g,-14,-13,-18,-17,2,dc)}
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
    const isVoid=m.def.id==='void_horror'||(m.name&&m.name.includes('Vacío'))||L.void;
    if(isVoid){
      g.fillStyle='rgba(15,3,30,0.5)';g.beginPath();g.ellipse(0,2,24,6,0,0,6.283);g.fill();
      for(let tn=0;tn<8;tn++){
        const baseA=(tn/8)*Math.PI*2;
        const wave=Math.sin(t*4+tn*1.2)*8;
        const tx=Math.cos(baseA)*20+wave,ty=-12+Math.sin(baseA)*14;
        g.strokeStyle=tn%2===0?'#a855f7':'#7e22ce';g.lineWidth=3.2;
        g.beginPath();g.moveTo(0,-14);
        g.quadraticCurveTo(tx*0.5,-14+wave,tx,ty);
        g.stroke();
        disc(g,tx,ty,1.6,'#ec4899',false);
      }
      g.fillStyle='#180e29';g.beginPath();g.ellipse(0,-14,14,12,0,0,6.283);g.fill();
      g.strokeStyle='#c084fc';g.lineWidth=1.5;g.stroke();
      g.save();g.globalCompositeOperation='lighter';
      const vortGr=g.createRadialGradient(0,-14,2,0,-14,16);
      vortGr.addColorStop(0,'#f472b6');vortGr.addColorStop(0.5,'#9333ea');vortGr.addColorStop(1,'rgba(0,0,0,0)');
      g.fillStyle=vortGr;g.fillRect(-16,-30,32,32);
      for(let s=0;s<4;s++){
        const sa=t*3+s*1.57;
        disc(g,Math.cos(sa)*7,-14+Math.sin(sa)*7,1.2,'#ffffff',false);
      }
      g.restore();
      disc(g,0,-14,3.2,'#05000a');disc(g,0,-14,1.4,'#f472b6',false);
      g.restore();
      return;
    }

    const bc=L.body||'#3d2f4a',dc=L.dark||'#2a2034',scorp=L.scorp;
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
      disc(g,11,-9,5,tint(bc,0.1));
      disc(g,13,-11,1.1,L.eye||'#ff3a3a',false);
    }else{
      g.fillStyle=bc;g.beginPath();g.ellipse(-6,-11,9,7.6,0,0,6.283);g.fill();g.strokeStyle=OUT;g.lineWidth=1.1;g.stroke();
      g.fillStyle=bc;g.beginPath();g.ellipse(6,-10,6,5,0,0,6.283);g.fill();g.stroke();
      for(let i=0;i<4;i++)disc(g,8+(i%2)*2.4,-12+Math.floor(i/2)*2.6,1.1,L.eye||'#ff3a3a',false);
    }
  }else if(kind==='bat'){
    g.fillStyle='rgba(0,0,0,0.2)';g.beginPath();g.ellipse(0,2,9,3,0,0,6.283);g.fill();
    const fy=-22+Math.sin(t*5)*3,fl=Math.sin(t*(mv?22:12)),wc=L.body||'#3a3440',dc=L.dark||'#201c24';
    for(const sd of [-1,1]){
      g.fillStyle=dc;g.beginPath();g.moveTo(0,fy);g.quadraticCurveTo(sd*14,fy-12-fl*9,sd*26,fy-3-fl*5);
      g.lineTo(sd*21,fy+2-fl*2);g.lineTo(sd*15,fy+5-fl);g.lineTo(sd*9,fy+4);g.lineTo(sd*4,fy+6);g.closePath();g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    }
    g.fillStyle=wc;g.beginPath();g.ellipse(0,fy,5,6.4,0,0,6.283);g.fill();g.stroke();
    disc(g,0,fy-6,4.4,wc);poly(g,[-4,fy-8,-5,fy-14,-1,fy-9],wc);poly(g,[4,fy-8,5,fy-14,1,fy-9],wc);
    disc(g,-1.6,fy-6.4,1,L.eye||'#ff3333',false);disc(g,1.6,fy-6.4,1,L.eye||'#ff3333',false);
  }else if(kind==='toad'){
    const bc=L.body||'#4a7c3a',dc=L.dark||'#2e5224',jump=mv?Math.abs(Math.sin(ph*0.5))*8:Math.sin(t*2)*0.8;
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,1,14-jump*0.3,4.4,0,0,6.283);g.fill();
    g.translate(0,-jump);
    lim(g,-9,-6,-14,-1,5,dc);lim(g,9,-6,14,-1,5,dc);
    g.fillStyle=bc;g.beginPath();g.ellipse(0,-9,13,9.4,0,0,6.283);g.fill();g.strokeStyle=OUT;g.lineWidth=1.1;g.stroke();
    g.fillStyle=L.belly||'#8eb868';g.beginPath();g.ellipse(3,-5,8,4.4,0,0,6.283);g.fill();
    for(const ex of [-1,6]){disc(g,ex+3,-18,4,bc);disc(g,ex+3.6,-18,2.4,L.eye||'#ffe840');disc(g,ex+4,-18,1,'#111',false)}
    if(L.crown){poly(g,[-4,-20,-4,-27,-1,-23,2,-29,5,-23,8,-27,8,-20],'#e8c23a');disc(g,2,-24,1.2,'#ff3a3a',false)}
  }else if(kind==='croc'){
    const bc=L.body||'#3a603a',dc=L.dark||'#244024',jaw=sw?Math.sin(sw*3.14)*9:Math.sin(t*2)*1.2;
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,1,24,5,0,0,6.283);g.fill();
    lim(g,-9,-6,-12,0,4.4,dc);lim(g,12,-6,16,0,4.4,dc);
    g.fillStyle=bc;g.beginPath();g.ellipse(0,-9,18,7,0,0,6.283);g.fill();g.strokeStyle=OUT;g.lineWidth=1.1;g.stroke();
    poly(g,[14,-12,34,-11-jaw*0.3,34,-8-jaw*0.3,14,-6],bc);
    poly(g,[14,-6,33,-8+jaw,33,-5+jaw,14,-3],tint(bc,-0.15));
    disc(g,15,-14,2.6,bc);disc(g,15.6,-14.4,1.2,L.eye||'#ffd700',false);
  }else if(kind==='golem'){
    const isTitan=m.def.id==='titan_colossus'||(m.name&&m.name.includes('Coloso'))||L.titan;
    if(isTitan){
      g.fillStyle='rgba(0,0,0,0.45)';g.beginPath();g.ellipse(0,2,22,6,0,0,6.283);g.fill();
      const sy=mv?Math.sin(ph*0.6)*2:0;
      rr(g,-14,-14+sy,11,14-sy,2,'#1e293b');rr(g,3,-14-sy,11,14+sy,2,'#1e293b');
      rr(g,-13,-12+sy,9,10-sy,2,'#d97706');rr(g,4,-12-sy,9,10+sy,2,'#d97706');
      const arm=sw?-1.4+sw*0.9:0;
      for(const sd of [-1,1]){
        g.save();g.translate(sd*18,-34);g.rotate(sd*0.25+(sd>0?arm*1.8:0));
        rr(g,-6,0,12,22,3,'#334155');
        rr(g,-8,20,16,14,3,'#d97706');
        disc(g,0,27,2.5,'#f59e0b',false);
        g.restore();
      }
      poly(g,[-16,-14,-18,-38,-8,-46,8,-46,18,-38,16,-14],'#334155');
      rr(g,-16,-46,5,10,1,'#0f172a');rr(g,11,-46,5,10,1,'#0f172a');
      const steam=Math.sin(t*8)*2;
      disc(g,-13.5,-49+steam,2,'rgba(255,255,255,0.45)',false);
      disc(g,13.5,-49-steam,2,'rgba(255,255,255,0.45)',false);
      g.save();g.globalCompositeOperation='lighter';
      const coreGr=g.createRadialGradient(0,-28,2,0,-28,14);
      coreGr.addColorStop(0,'#ffffff');coreGr.addColorStop(0.4,'#f59e0b');coreGr.addColorStop(1,'rgba(245,158,11,0)');
      g.fillStyle=coreGr;g.fillRect(-14,-42,28,28);
      g.restore();
      disc(g,0,-28,4,'#f59e0b');disc(g,0,-28,2,'#fff',false);
      poly(g,[-8,-46,0,-54,8,-46],'#d97706');
      rr(g,-6,-50,12,3.5,1,'#0f172a');
      disc(g,Math.sin(t*3)*3,-48,1.6,'#ef4444',false);
      g.restore();
      return;
    }

    const bc=L.body||'#5a606d',dc=L.dark||'#383d47',sy=mv?Math.sin(ph*0.6)*2:0;
    g.fillStyle='rgba(0,0,0,0.32)';g.beginPath();g.ellipse(0,1,17,5,0,0,6.283);g.fill();
    rr(g,-12,-12+sy,9,12-sy,2,dc);rr(g,3,-12-sy,9,12+sy,2,dc);
    const arm=sw?-1+sw*0.6:0;
    for(const sd of [-1,1]){
      g.save();g.translate(sd*14,-32);g.rotate(sd*0.2+(sd>0?arm*1.6:0));
      rr(g,-5,0,10,20,3,bc);rr(g,-6.5,17,13,10,3,dc);g.restore();
    }
    poly(g,[-13,-14,-15,-34,-6,-40,7,-40,15,-34,13,-14],bc);
    poly(g,[-6,-40,0,-46,6,-40],tint(bc,0.25));
    poly(g,[-6,-48,6,-48,7,-40,-7,-40],dc);
    const eyeC=L.eye||'#4ae0ff';
    g.save();g.globalCompositeOperation='lighter';
    disc(g,-2.4,-44,4.4,rgba(eyeC,0.55),false);disc(g,3.6,-44,4.4,rgba(eyeC,0.55),false);
    g.restore();
    disc(g,-2.4,-44,1.8,eyeC,false);disc(g,3.6,-44,1.8,eyeC,false);
  }
  g.restore();
}

/* ---------- Entidades y Barras con Retrato Flotante ---------- */
function hpBar(x,y,w,frac,col){
  ctx.fillStyle='rgba(0,0,0,0.8)';ctx.fillRect(x-w/2-1,y-1,w+2,6);
  ctx.fillStyle='#2a1010';ctx.fillRect(x-w/2,y,w,4);
  ctx.fillStyle=col;ctx.fillRect(x-w/2,y,w*clamp(frac,0,1),4);
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.fillRect(x-w/2,y,w*clamp(frac,0,1),1.3);
}

/* Dibuja una mini placa/medallón con la imagen del enemigo al lado de su barra de vida */
function drawTagPortrait(x,y,m){
  const r=7;
  ctx.save();
  ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.clip();
  ctx.fillStyle=m.boss?'#5c1414':m.elite?'#4a3410':'#1c1a24';
  ctx.fillRect(x-r,y-r,r*2,r*2);
  
  const d=m.def;
  if(d.kind==='human'){
    ctx.scale(0.35,0.35);
    drawHuman(ctx,(x)/0.35,(y+10)/0.35,d.look,{dir:1,t:0,noAura:true});
  }else{
    ctx.scale(0.38,0.38);
    drawCreature(ctx,(x)/0.38,(y+5)/0.38,m,{dir:1,t:0});
  }
  ctx.restore();

  // Borde dorado o rojo del medallón
  ctx.strokeStyle=m.boss?'#ff4433':m.elite?'#ffcc00':'#7a8292';
  ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.stroke();
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

  if(m.def.id==='lich_malakor'||(m.name&&m.name.includes('Malakor'))){
    ctx.save();
    for(let cr=0;cr<4;cr++){
      const ca=t*2.2+cr*1.57;
      const rx=m.x+Math.cos(ca)*34,ry=m.y-35+Math.sin(ca)*12;
      ctx.fillStyle='#38bdf8';ctx.strokeStyle='#e0f2fe';ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(rx,ry-6);ctx.lineTo(rx+4,ry);ctx.lineTo(rx,ry+6);ctx.lineTo(rx-4,ry);ctx.closePath();
      ctx.fill();ctx.stroke();
    }
    ctx.fillStyle='rgba(56,189,248,0.22)';
    ctx.beginPath();ctx.ellipse(m.x,m.y,30,10,0,0,6.283);ctx.fill();
    ctx.restore();
  }

  // Nombre, vida e ICONO DE APARIENCIA en las tags flotantes
  const top=m.y-mobHeight(m)-14;
  const near=dist(m,P)<340;
  if(sel||m.state==='chase'||m.boss||m.rare||near){
    const w=m.boss?74:m.elite?48:36;
    hpBar(m.x+6,top,w,m.hp/m.maxhp,m.boss?'#c92a2a':m.elite?'#e0902a':'#c93c3c');
    // Mini imagen de apariencia a la izquierda de la barra
    drawTagPortrait(m.x-w/2-3,top+2,m);

    const lc=m.level>P.level+4?'#ff4a3a':m.level>P.level+1?'#ff9a3a':m.level>=P.level-2?'#ffe066':'#8fd48f';
    label((m.boss||m.rare?m.name:m.name.split(' ')[0])+' '+m.level,m.x+6,top-4,m.elite?'#ffcf6a':lc,m.boss?14:12);
    if(m.elite){ctx.fillStyle='#ffcf6a';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText('★',m.x+w/2+14,top+5)}
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
    const b=Math.sin(t*4)*3;
    const col=mk==='ready'?'#4ade80':mk==='avail'?'#facc15':'#94a3b8';
    const haloCol=mk==='ready'?'rgba(74,222,128,0.35)':mk==='avail'?'rgba(250,204,21,0.35)':'rgba(148,163,184,0.15)';
    const posY=n.y-(n.def.shop?84:74)+b;
    ctx.save();
    ctx.fillStyle=haloCol;
    ctx.beginPath();ctx.arc(n.x,posY-7,16,0,6.283);ctx.fill();
    ctx.font='900 26px serif';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='rgba(15,10,5,0.9)';
    const ch=mk==='active'?'?':mk==='ready'?'?':'!';
    ctx.strokeText(ch,n.x,posY);ctx.fillStyle=col;ctx.fillText(ch,n.x,posY);
    if(mk==='ready'||mk==='avail'){
      const spAng=t*3;
      ctx.fillStyle='#fff';
      ctx.beginPath();ctx.arc(n.x+Math.cos(spAng)*12,posY-7+Math.sin(spAng)*12,1.5,0,6.283);ctx.fill();
    }
    ctx.restore();
  }
}

/* ---------- Tablas de Personalización Ampliada ---------- */
const SKINT=['#f8dcc2','#f0c8a6','#e2b48e','#c9966a','#b07c52','#8a5a3a','#5e3a24','#faebd7','#c8d0c0','#b8c8e0','#5a6a50'];
const HAIRC=['#181820','#2e1c12','#543820','#8b5a2b','#b8863b','#e6c875','#9e2a1b','#d8d8ce','#5b358a','#2b5cb8','#2e7d32','#e0508a','#f0f0f5','#40e0d0'];
const EYEC=['#1c1410','#4a2e18','#2563eb','#16a34a','#9333ea','#dc2626','#f59e0b','#06b6d4','#ec4899','#e2e8f0','#84cc16'];
const OUTC=[null,'#a8301f','#2a5fa8','#2f7a4a','#6a3a8a','#c9a03a','#2c2f3a','#e8e0c8','#d85a8a','#1e293b','#f59e0b'];
const HAIRN=['Calvo','Corto Lacio','Melena Larga','Tupé Noble','Cresta Gladiador','Coleta Samurái','Puntas Manga','Coletas Gemelas','Trenzas Nórdicas','Ondulado Salvaje','Rizo Noble'];
const BEARDN=['Sin barba','Corta','Media','Larga','Perilla'];
const MARKN=['Ninguna','Cicatriz','Runa Dorada','Pintura Guerra','Lágrima Sombría'];

function defaultApp(cls){const c=CLS[cls]||CLS.war;return Object.assign({outfit:null,mark:0,showHat:null},c.app)}
function randomApp(cls){
  const a=defaultApp(cls);
  a.skin=pick(SKINT);a.hair=pick(HAIRC);a.hairStyle=ri(0,10);a.eye=pick(EYEC);a.beard=Math.random()<0.3?ri(1,4):0;a.beardColor=a.hair;a.mark=Math.random()<0.25?ri(1,4):0;
  a.outfit=Math.random()<0.5?pick(OUTC):null;return a;
}

/* Conexión directa del equipamiento y customización al aspect model L */
function lookFor(cls,app,eq){
  if(cls&&typeof cls==='object'&&cls.cls){eq=cls.eq;app=cls.app;cls=cls.cls}
  const c=CLS[cls]||CLS.war;app=Object.assign(defaultApp(cls),app||{});
  const L=Object.assign({},c.vis);
  L.skin=app.skin;L.hair=app.hair;L.hairStyle=app.hairStyle;L.eye=app.eye;L.mark=app.mark||0;
  if(app.beard){L.beard=app.beardColor||app.hair;L.beardLen=app.beard}
  if(app.outfit){L.body=app.outfit;if(L.cape)L.cape=tint(app.outfit,-0.35);if(L.hat&&L.hatType!=='helm')L.hat=tint(app.outfit,-0.2)}
  
  if(eq){
    const RC=r=>(RAR[r]?RAR[r].c:'#ffd700');
    // 1. Casco / Cabeza
    if(eq.head){
      const hn=(eq.head.name||'').toLowerCase();
      if(hn.includes('corona')||hn.includes('diadema'))L.hatType='crown';
      else if(hn.includes('capucha')||hn.includes('manto'))L.hatType='hood';
      else if(hn.includes('sombrero')||hn.includes('gorro'))L.hatType='pointy';
      else if(hn.includes('cuerno')||hn.includes('máscara'))L.hatType='horns';
      else L.hatType='helm';
      L.hat=L.hatType==='crown'?'#ffd700':tint(RC(eq.head.rar),-0.12);
      L.trim=RC(eq.head.rar);
    }else if(app.showHat===false||(L.hatType==='helm'&&app.showHat!==true)){
      L.hat=null;L.hatType=null;
    }

    // 2. Hombreras
    if(eq.shoulders){L.pads=RC(eq.shoulders.rar)}

    // 3. Pechera / Armadura
    if(eq.chest){
      L.body=tint(RC(eq.chest.rar),-0.2);
      L.trim=RC(eq.chest.rar);
      if(eq.chest.rar>=2&&!L.cape)L.cape=tint(RC(eq.chest.rar),-0.45);
    }

    // 4. Capa dedicada
    if(eq.cape){L.cape=RC(eq.cape.rar)}

    // 5. Guantes
    if(eq.gloves){L.glove=RC(eq.gloves.rar)}

    // 6. Grebas / Piernas
    if(eq.legs){L.legs=tint(RC(eq.legs.rar),-0.35)}

    // 7. Botas
    if(eq.boots){L.bootColor=tint(RC(eq.boots.rar),-0.48)}

    // 8. Arma visible
    if(eq.weapon){
      const wn=(eq.weapon.name||'').toLowerCase();
      if(wn.includes('daga'))L.weapon='dagger';
      else if(wn.includes('bastón')||wn.includes('báculo'))L.weapon='staff';
      else if(wn.includes('arco'))L.weapon='bow';
      else if(wn.includes('hacha'))L.weapon='axe';
      else if(wn.includes('martillo')||wn.includes('maza'))L.weapon='hammer';
      else if(wn.includes('lanza'))L.weapon='spear';
      else L.weapon='sword';
      L.blade=eq.weapon.rar>=1?RC(eq.weapon.rar):'#e2e8f0';
      L.orb=RC(eq.weapon.rar);
      L.rarity=eq.weapon.rar;
    }

    // 9. Escudo
    if(eq.shield||(c.vis&&c.vis.shield)){L.shield=1}

    // Aura por conjunto de alto nivel
    let tier=0,n=0;for(const s of ['weapon','head','shoulders','chest','gloves','legs','boots']){const it=eq[s];if(it){tier+=it.rar;n++}}
    if(n>=4&&tier/n>=1.8){
      L.aura=tier/n>=2.8?'#ffd700':tier/n>=2.2?'#c08cff':'#6fb8ff';
    }
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
  if(P.buffs.some(b=>b.kindAbsorb)){
    ctx.save();ctx.globalCompositeOperation='lighter';
    const gr=ctx.createRadialGradient(P.x,P.y-20,6,P.x,P.y-20,34);gr.addColorStop(0,'rgba(140,190,255,0)');gr.addColorStop(0.8,'rgba(140,190,255,0.28)');gr.addColorStop(1,'rgba(140,190,255,0)');
    ctx.fillStyle=gr;ctx.fillRect(P.x-36,P.y-56,72,72);ctx.restore();
  }
  if(P.flash>0){ctx.save();ctx.filter='brightness(1.9) saturate(1.4) hue-rotate(-20deg)'}
  drawHuman(ctx,P.x,P.y,L,{dir:P.dir,t:P.anim,moving:P.moving,mounted:P.mounted,fast:P.sprinting||P.mounted,sw:sw,cast:!!(P.cast&&!P.cast.gather&&!P.cast.travel),rollA:roll});
  if(P.flash>0)ctx.restore();
  ctx.globalAlpha=1;
  label(P.name,P.x,P.y-(P.mounted?64:56),'#9dffb0',12);
}
