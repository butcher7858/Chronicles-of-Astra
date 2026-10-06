
/* =====================================================================
   Parte 3b: edificios, objetos del mundo (props) y recursos
   ===================================================================== */
function drawHouse(g,b,x0,y0,w,h,bot,wins,cabin){
  const wallH=Math.min(h-6,TILE*1.5),top=bot-wallH;
  // muros
  const wg=g.createLinearGradient(0,top,0,bot);wg.addColorStop(0,tint(b.wall,0.08));wg.addColorStop(1,tint(b.wall,-0.12));
  g.fillStyle=wg;g.fillRect(x0,top,w,wallH);
  g.strokeStyle=OUT;g.lineWidth=1.2;g.strokeRect(x0,top,w,wallH);
  if(cabin){
    g.strokeStyle='rgba(0,0,0,0.3)';g.lineWidth=1;
    for(let y=top+6;y<bot-6;y+=6){g.beginPath();g.moveTo(x0,y);g.lineTo(x0+w,y);g.stroke()}
    g.fillStyle=tint(b.wall,-0.25);for(let y=top+3;y<bot-3;y+=6){blob(g,x0+2,y,2.4,tint(b.wall,-0.18));blob(g,x0+w-2,y,2.4,tint(b.wall,-0.18))}
  }else{
    g.fillStyle='#5a3e24';g.fillRect(x0,top,w,4);g.fillRect(x0,top+Math.round(wallH*0.5),w,3);
    for(let x=x0;x<=x0+w;x+=Math.round(w/Math.max(2,Math.round(w/44)))){g.fillRect(x-1.5,top,3,wallH)}
    g.fillStyle='rgba(0,0,0,0.06)';for(let x=x0+4;x<x0+w-4;x+=9)g.fillRect(x,top+5,1,wallH-8);
  }
  // zócalo de piedra
  g.fillStyle='#7d7970';g.fillRect(x0-1,bot-7,w+2,7);g.strokeStyle=OUT;g.lineWidth=1;g.strokeRect(x0-1,bot-7,w+2,7);
  g.strokeStyle='rgba(0,0,0,0.3)';for(let x=x0+6;x<x0+w;x+=10){g.beginPath();g.moveTo(x,bot-7);g.lineTo(x,bot);g.stroke()}
  // tejado
  const eave=top+7,ridge=8,xl=x0-10,xr=x0+w+10,rl=x0+w*0.2,rr=x0+w*0.8;
  const rg=g.createLinearGradient(0,ridge,0,eave);rg.addColorStop(0,tint(b.roof,0.18));rg.addColorStop(1,tint(b.roof,-0.18));
  g.fillStyle=rg;g.beginPath();g.moveTo(xl,eave);g.lineTo(rl,ridge);g.lineTo(rr,ridge);g.lineTo(xr,eave);g.closePath();g.fill();
  g.save();g.clip();
  g.strokeStyle='rgba(0,0,0,0.2)';g.lineWidth=1;
  for(let y=ridge+7,k=0;y<eave;y+=7,k++){
    g.beginPath();g.moveTo(xl,y);g.lineTo(xr,y);g.stroke();
    for(let x=xl+(k%2)*6;x<xr;x+=12){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+7);g.stroke()}
  }
  g.fillStyle='rgba(0,0,0,0.16)';g.beginPath();g.moveTo(xl,eave);g.lineTo(rl,ridge);g.lineTo(rl+14,ridge);g.lineTo(xl+18,eave);g.closePath();g.fill();
  g.beginPath();g.moveTo(xr,eave);g.lineTo(rr,ridge);g.lineTo(rr-14,ridge);g.lineTo(xr-18,eave);g.closePath();g.fill();
  if(cabin){
    g.fillStyle='#f4f9ff';g.beginPath();g.moveTo(xl,eave);g.lineTo(rl,ridge);g.lineTo(rr,ridge);g.lineTo(xr,eave);
    for(let x=xr;x>=xl;x-=10)g.lineTo(x,eave-9+((x/10|0)%2)*4);g.closePath();g.fill();
  }
  g.restore();
  g.strokeStyle=OUT;g.lineWidth=1.4;g.beginPath();g.moveTo(xl,eave);g.lineTo(rl,ridge);g.lineTo(rr,ridge);g.lineTo(xr,eave);g.closePath();g.stroke();
  g.fillStyle=tint(b.roof,-0.4);g.fillRect(rl,ridge-2,rr-rl,3);
  g.fillStyle='rgba(0,0,0,0.3)';g.fillRect(xl+2,eave,xr-xl-4,4);
  // chimenea
  const cx=x0+w*0.72;
  g.fillStyle='#6d665e';g.fillRect(cx,ridge-8,12,22);g.strokeStyle=OUT;g.lineWidth=1;g.strokeRect(cx,ridge-8,12,22);
  g.fillStyle='#3a3530';g.fillRect(cx-2,ridge-10,16,4);
  // puerta
  const dx=x0+w/2-10,dh=28;
  g.fillStyle='#3a2616';g.beginPath();g.moveTo(dx,bot);g.lineTo(dx,bot-dh+10);g.quadraticCurveTo(dx+10,bot-dh-4,dx+20,bot-dh+10);g.lineTo(dx+20,bot);g.closePath();g.fill();
  g.strokeStyle='#6a4a2a';g.lineWidth=2;g.stroke();
  g.strokeStyle='rgba(0,0,0,0.4)';g.lineWidth=1;g.beginPath();g.moveTo(dx+10,bot-dh+2);g.lineTo(dx+10,bot);g.stroke();
  blob(g,dx+16,bot-12,1.6,'#d9b44a');
  g.fillStyle='#8a867d';g.fillRect(dx-3,bot,26,3);
  // ventanas
  if(w>=96){
    for(const wx of [x0+16,x0+w-32]){
      const wy=top+12;
      g.fillStyle='#5a3e24';g.fillRect(wx-5,wy-1,6,16);g.fillRect(wx+15,wy-1,6,16);
      g.fillStyle='#7aa0b8';g.fillRect(wx,wy,16,14);
      g.fillStyle='rgba(255,255,255,0.25)';g.fillRect(wx+1,wy+1,6,4);
      g.strokeStyle='#4a3420';g.lineWidth=1.4;g.strokeRect(wx,wy,16,14);g.beginPath();g.moveTo(wx+8,wy);g.lineTo(wx+8,wy+14);g.moveTo(wx,wy+7);g.lineTo(wx+16,wy+7);g.stroke();
      g.fillStyle='#5a3e24';g.fillRect(wx-2,wy+14,20,3);
      wins.push({x:wx,y:wy,w:16,h:14});
    }
  }
}
function drawHut(g,b,x0,y0,w,h,bot,wins){
  const wallH=TILE*1.1,top=bot-wallH;
  g.fillStyle=b.wall;g.fillRect(x0+4,top,w-8,wallH);
  g.strokeStyle=OUT;g.lineWidth=1.2;g.strokeRect(x0+4,top,w-8,wallH);
  g.fillStyle='rgba(0,0,0,0.12)';for(let x=x0+10;x<x0+w-8;x+=8)g.fillRect(x,top+2,2,wallH-4);
  const apex=10,eave=top+8,xl=x0-8,xr=x0+w+8;
  const rg=g.createLinearGradient(0,apex,0,eave);rg.addColorStop(0,tint(b.roof,0.2));rg.addColorStop(1,tint(b.roof,-0.2));
  g.fillStyle=rg;g.beginPath();g.moveTo(xl,eave);g.quadraticCurveTo(x0+w*0.2,apex+10,x0+w/2,apex);g.quadraticCurveTo(x0+w*0.8,apex+10,xr,eave);
  for(let x=xr;x>=xl;x-=7)g.lineTo(x,eave+3+((x/7|0)%2)*3);g.closePath();g.fill();
  g.strokeStyle=OUT;g.lineWidth=1.2;g.stroke();
  g.strokeStyle='rgba(0,0,0,0.25)';g.lineWidth=1;
  for(let k=0;k<14;k++){const t=k/13,sx=lerp(xl+6,xr-6,t);g.beginPath();g.moveTo(sx,eave);g.lineTo(lerp(x0+w/2,sx,0.18),apex+4);g.stroke()}
  const dx=x0+w/2-8;
  g.fillStyle='#2f2014';g.beginPath();g.roundRect(dx,bot-24,16,24,[8,8,0,0]);g.fill();g.strokeStyle='#6a4a2a';g.lineWidth=1.5;g.stroke();
  const wx=x0+w-26,wy=top+12;g.fillStyle='#7aa0b8';g.fillRect(wx,wy,11,10);g.strokeStyle='#4a3420';g.lineWidth=1.2;g.strokeRect(wx,wy,11,10);
  wins.push({x:wx,y:wy,w:11,h:10});
}
function drawTent(g,b,x0,y0,w,h,bot){
  const apex=8,base=bot-3,xl=x0-8,xr=x0+w+8;
  g.fillStyle=b.wall;g.beginPath();g.moveTo(x0+w/2,apex);g.lineTo(xr,base);g.lineTo(xl,base);g.closePath();g.fill();
  g.save();g.clip();
  const n=8;
  for(let k=0;k<n;k+=2){
    const a=lerp(xl,xr,k/n),c=lerp(xl,xr,(k+1)/n);
    g.fillStyle=b.roof;g.beginPath();g.moveTo(x0+w/2,apex);g.lineTo(c,base);g.lineTo(a,base);g.closePath();g.fill();
  }
  g.fillStyle='rgba(0,0,0,0.14)';g.beginPath();g.moveTo(x0+w/2,apex);g.lineTo(xr,base);g.lineTo(x0+w/2+4,base);g.closePath();g.fill();
  g.restore();
  g.strokeStyle=OUT;g.lineWidth=1.4;g.beginPath();g.moveTo(x0+w/2,apex);g.lineTo(xr,base);g.lineTo(xl,base);g.closePath();g.stroke();
  const mx=x0+w/2;
  g.fillStyle='#2a1e16';g.beginPath();g.moveTo(mx,base-34);g.lineTo(mx+13,base);g.lineTo(mx-13,base);g.closePath();g.fill();
  g.fillStyle=b.wall;g.beginPath();g.moveTo(mx,base-34);g.lineTo(mx-14,base);g.lineTo(mx-5,base);g.closePath();g.fill();g.beginPath();g.moveTo(mx,base-34);g.lineTo(mx+14,base);g.lineTo(mx+5,base);g.closePath();g.fill();
  g.strokeStyle='#4a3a2a';g.lineWidth=2;g.beginPath();g.moveTo(mx,apex);g.lineTo(mx,apex-8);g.stroke();
  g.fillStyle=b.roof;g.beginPath();g.moveTo(mx,apex-8);g.lineTo(mx+11,apex-5);g.lineTo(mx,apex-2);g.closePath();g.fill();
}
const bSprites=new Map();
function buildingSprite(b){
  let s=bSprites.get(b);if(s)return s;
  const w=b.w*TILE,h=b.h*TILE,m=16,rh=44,type=b.type||'house',wins=[];
  s=mkSprite(w+m*2,h+rh+12,m,rh,g=>{
    const x0=m,y0=rh,bot=rh+h;
    shadowE(g,x0+w/2+8,bot-1,w/2+14,9,0.3);
    if(type==='tent')drawTent(g,b,x0,y0,w,h,bot);
    else if(type==='hut')drawHut(g,b,x0,y0,w,h,bot,wins);
    else drawHouse(g,b,x0,y0,w,h,bot,wins,type==='cabin');
  });
  s.wins=wins;bSprites.set(b,s);return s;
}
function drawBuilding(b,night){
  const s=buildingSprite(b),bx=b.x*TILE,by=b.y*TILE;
  putSprite(s,bx,by);
  if(night>0.15){
    ctx.fillStyle='rgba(255,205,110,'+Math.min(1,night*1.4).toFixed(2)+')';
    for(const w of s.wins)ctx.fillRect(bx-s.ax+w.x,by-s.ay+w.y,w.w,w.h);
  }
  if(b.name)label(b.name,bx+b.w*TILE/2,by-s.ay+14,'#f1dfae',13);
}

/* ---------- Props ---------- */
function drawProp(p,t,night){
  const x=p.x,y=p.y;
  switch(p.t){
    case 'fountain':{
      ell(x,y+10,38,16,'rgba(0,0,0,0.3)');
      ell(x,y+4,34,15,'#7d786e');ell(x,y+2,34,14,'#a39e92');ell(x,y+4,28,11,'#6a665d');
      ell(x,y+3,26,10,'#3f7ea8');
      ctx.strokeStyle='rgba(255,255,255,0.35)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y+3,16+Math.sin(t*2)*3,6+Math.sin(t*2)*1.2,0,0,6.283);ctx.stroke();
      ctx.beginPath();ctx.ellipse(x,y+3,8+Math.sin(t*2+1.5)*3,3.4,0,0,6.283);ctx.stroke();
      ctx.fillStyle='#8f8a7e';ctx.fillRect(x-5,y-26,10,28);ctx.strokeStyle=OUT;ctx.lineWidth=1;ctx.strokeRect(x-5,y-26,10,28);
      ell(x,y-27,9,4,'#a39e92');ell(x,y-26,7,2.8,'#3f7ea8');
      ctx.strokeStyle='rgba(190,230,255,0.85)';ctx.lineWidth=2;
      for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(x,y-28);ctx.quadraticCurveTo(x+i*9,y-46+Math.sin(t*4+i)*2,x+i*14,y-6);ctx.stroke()}
      break}
    case 'obelisk':{
      const on=P&&P.disc[p.wp],pulse=0.6+0.4*Math.sin(t*2.4);
      ell(x,y+14,22,8,'rgba(0,0,0,0.32)');
      ctx.fillStyle='#6f6a62';ctx.fillRect(x-17,y+4,34,10);ctx.fillStyle='#857f75';ctx.fillRect(x-13,y-4,26,9);
      ctx.strokeStyle=OUT;ctx.lineWidth=1;ctx.strokeRect(x-17,y+4,34,10);ctx.strokeRect(x-13,y-4,26,9);
      const gr=ctx.createLinearGradient(x-9,0,x+9,0);gr.addColorStop(0,'#9a958a');gr.addColorStop(1,'#5c5850');
      ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(x-9,y-4);ctx.lineTo(x-6,y-58);ctx.lineTo(x,y-68);ctx.lineTo(x+6,y-58);ctx.lineTo(x+9,y-4);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.strokeStyle=on?'rgba(110,235,220,'+pulse.toFixed(2)+')':'rgba(120,120,120,0.6)';ctx.lineWidth=1.6;
      ctx.beginPath();ctx.moveTo(x,y-14);ctx.lineTo(x,y-52);ctx.moveTo(x-4,y-22);ctx.lineTo(x+4,y-22);ctx.moveTo(x-4,y-34);ctx.lineTo(x+4,y-30);ctx.moveTo(x-3,y-44);ctx.lineTo(x+3,y-44);ctx.stroke();
      if(on){
        ctx.save();ctx.globalCompositeOperation='lighter';
        const g2=ctx.createRadialGradient(x,y-40,2,x,y-40,46);g2.addColorStop(0,'rgba(90,230,210,'+(0.45*pulse).toFixed(2)+')');g2.addColorStop(1,'rgba(90,230,210,0)');
        ctx.fillStyle=g2;ctx.fillRect(x-48,y-88,96,96);ctx.restore();
        for(let k=0;k<3;k++){const a=t*1.4+k*2.09;blob(ctx,x+Math.cos(a)*14,y-60+Math.sin(a*1.3)*6-k*3,1.8,'#bffcf2')}
      }
      break}
    case 'anvil':{
      ell(x,y+10,16,5,'rgba(0,0,0,0.3)');
      ctx.fillStyle='#5a3e24';ctx.fillRect(x-8,y,16,10);ctx.strokeStyle=OUT;ctx.lineWidth=1;ctx.strokeRect(x-8,y,16,10);
      ctx.fillStyle='#4a4e58';ctx.beginPath();ctx.moveTo(x-16,y-6);ctx.lineTo(x+14,y-6);ctx.lineTo(x+20,y-10);ctx.lineTo(x+14,y-12);ctx.lineTo(x-12,y-12);ctx.lineTo(x-14,y-8);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,0.25)';ctx.fillRect(x-10,y-12,20,2);
      break}
    case 'stall':{
      ell(x,y+12,26,7,'rgba(0,0,0,0.28)');
      ctx.fillStyle='#6a4a2a';ctx.fillRect(x-20,y-2,40,14);ctx.strokeStyle=OUT;ctx.lineWidth=1;ctx.strokeRect(x-20,y-2,40,14);
      ctx.fillStyle='#3a2616';ctx.fillRect(x-22,y-30,3,32);ctx.fillRect(x+19,y-30,3,32);
      for(let k=0;k<6;k++){ctx.fillStyle=k%2?'#f2ead6':p.col;ctx.beginPath();ctx.moveTo(x-24+k*8,y-32);ctx.lineTo(x-16+k*8,y-32);ctx.lineTo(x-17+k*8,y-22);ctx.lineTo(x-25+k*8,y-22);ctx.closePath();ctx.fill()}
      ctx.strokeStyle=OUT;ctx.strokeRect(x-24,y-32,48,10);
      for(let k=0;k<4;k++)blob(ctx,x-12+k*8,y-5,3.2,['#d94a3a','#e8b43a','#6ab04a','#c9482c'][k],true);
      break}
    case 'lamp':{
      ell(x,y+12,7,3,'rgba(0,0,0,0.3)');
      ctx.fillStyle='#2b2620';ctx.fillRect(x-1.5,y-26,3,38);ctx.fillRect(x-5,y+8,10,4);
      ctx.fillStyle='#2b2620';ctx.fillRect(x-6,y-34,12,3);ctx.fillRect(x-6,y-24,12,3);
      ctx.fillStyle=night>0.1?'#ffd98a':'#cdbf90';ctx.fillRect(x-4,y-31,8,7);
      break}
    case 'campfire':{
      ell(x,y+6,20,7,'rgba(0,0,0,0.3)');
      for(let k=0;k<7;k++){const a=k*0.9;blob(ctx,x+Math.cos(a)*13,y+4+Math.sin(a)*4.5,3.2,'#6f6a62',true)}
      ctx.strokeStyle='#4a2f1a';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-12,y+4);ctx.lineTo(x+10,y-2);ctx.moveTo(x+12,y+4);ctx.lineTo(x-10,y-2);ctx.stroke();
      const fl=(sc,col,off)=>{const h=18*sc+Math.sin(t*9+off)*3;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-7*sc,y);ctx.quadraticCurveTo(x-8*sc,y-h*0.5,x+Math.sin(t*7+off)*3,y-h);ctx.quadraticCurveTo(x+8*sc,y-h*0.5,x+7*sc,y);ctx.closePath();ctx.fill()};
      fl(1,'#e8571e',0);fl(0.75,'#ffa534',1.7);fl(0.45,'#ffe28a',3.1);
      break}
    case 'noticeboard':{
      ell(x,y+6,18,6,'rgba(0,0,0,0.3)');
      ctx.fillStyle='#4a2f1a';ctx.fillRect(x-2,y-14,4,20);
      ctx.fillStyle='#6a4a2a';ctx.fillRect(x-16,y-30,32,18);
      ctx.strokeStyle=OUT;ctx.lineWidth=1.2;ctx.strokeRect(x-16,y-30,32,18);
      ctx.fillStyle='#f5ebd0';ctx.fillRect(x-13,y-27,11,12);
      ctx.fillStyle='#eadbb5';ctx.fillRect(x+2,y-26,11,11);
      blob(ctx,x-8,y-26,1.4,'#c9382a');
      blob(ctx,x+7,y-25,1.4,'#d9b44a');
      ctx.fillStyle='#3a2616';ctx.fillRect(x-11,y-22,7,1.2);ctx.fillRect(x-11,y-19,7,1.2);
      ctx.fillRect(x+4,y-21,7,1.2);ctx.fillRect(x+4,y-18,7,1.2);
      break}
  }
}
function propGlow(p,t,night){ // luces de la noche (modo 'lighter')
  if(night<=0.05)return;
  const sx=(p.x-camX)*ZM,sy=(p.y-camY)*ZM;
  let r=0,a=0,col='255,190,90',oy=0;
  if(p.t==='lamp'){r=120;a=0.55;oy=-28}
  else if(p.t==='campfire'){r=150;a=0.7+0.1*Math.sin(t*11);oy=-8}
  else if(p.t==='obelisk'&&P.disc[p.wp]){r=110;a=0.35;col='90,230,210';oy=-40}
  else return;
  if(sx<-r*ZM||sy<-r*ZM||sx>vw+r*ZM||sy>vh+r*ZM)return;
  const g=ctx.createRadialGradient(sx,sy+oy*ZM,2,sx,sy+oy*ZM,r*ZM);
  g.addColorStop(0,'rgba('+col+','+(a*night).toFixed(3)+')');g.addColorStop(1,'rgba('+col+',0)');
  ctx.fillStyle=g;ctx.fillRect(sx-r*ZM,sy+oy*ZM-r*ZM,r*2*ZM,r*2*ZM);
}

/* ---------- Recursos del mundo ---------- */
function drawNode(n,t,hl){
  const x=n.x,y=n.y+8,tw=Math.sin(t*3+n.x)*0.5+0.5;
  if(hl){ctx.strokeStyle='rgba(255,226,140,'+(0.5+0.3*Math.sin(t*5)).toFixed(2)+')';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y+3,20,8,0,0,6.283);ctx.stroke()}
  if(n.type==='chest'){
    ell(x,y+4,17,6,'rgba(0,0,0,0.3)');
    const a=n.open?0.55:1;ctx.globalAlpha=a;
    ctx.fillStyle='#7a4e24';ctx.fillRect(x-14,y-12,28,15);ctx.strokeStyle=OUT;ctx.lineWidth=1.2;ctx.strokeRect(x-14,y-12,28,15);
    ctx.fillStyle='#9a6a32';ctx.fillRect(x-14,y-12,28,4);
    if(n.open){ctx.fillStyle='#5a3a1a';ctx.beginPath();ctx.moveTo(x-14,y-12);ctx.lineTo(x-12,y-26);ctx.lineTo(x+12,y-26);ctx.lineTo(x+14,y-12);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#2a1a0c';ctx.fillRect(x-12,y-12,24,4)}
    else{ctx.fillStyle='#8a5c2a';ctx.beginPath();ctx.moveTo(x-14,y-12);ctx.quadraticCurveTo(x,y-26,x+14,y-12);ctx.closePath();ctx.fill();ctx.stroke()}
    ctx.fillStyle='#c9b04a';ctx.fillRect(x-14,y-8,28,2);ctx.fillRect(x-2,y-14,4,8);
    ctx.globalAlpha=1;
    if(!n.open){ctx.fillStyle='rgba(255,240,170,'+tw.toFixed(2)+')';ctx.fillRect(x+8,y-24,2,2);ctx.fillRect(x+7,y-23,4,0.8)}
  }else if(n.type==='herb'){
    if(n.open){ctx.globalAlpha=0.5;ctx.strokeStyle='#4a7a38';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y+2);ctx.lineTo(x-3,y-4);ctx.moveTo(x,y+2);ctx.lineTo(x+3,y-3);ctx.stroke();ctx.globalAlpha=1;return}
    for(let k=0;k<6;k++){const a=-1.3+k*0.52;ctx.fillStyle=k%2?'#4aa04a':'#5cb85a';ctx.beginPath();ctx.ellipse(x+Math.sin(a)*7,y-4-Math.cos(a)*7,3,7,a,0,6.283);ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=0.8;ctx.stroke()}
    blob(ctx,x-4,y-14,2.2,'#f4f4f4');blob(ctx,x+5,y-11,2,'#f6a8c8');
    ctx.fillStyle='rgba(190,255,190,'+tw.toFixed(2)+')';ctx.fillRect(x+8,y-18,2,2);
  }else{
    if(n.open){ctx.globalAlpha=0.5;ell(x,y+2,10,3.5,'#6d6a68');ctx.globalAlpha=1;return}
    ell(x,y+4,17,6,'rgba(0,0,0,0.3)');
    ctx.fillStyle='#6f7480';ctx.beginPath();ctx.moveTo(x-15,y+2);ctx.lineTo(x-10,y-12);ctx.lineTo(x+2,y-17);ctx.lineTo(x+14,y-9);ctx.lineTo(x+16,y+2);ctx.closePath();ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=1.2;ctx.stroke();
    ctx.fillStyle='#8e94a2';ctx.beginPath();ctx.moveTo(x-10,y-12);ctx.lineTo(x+2,y-17);ctx.lineTo(x+4,y-6);ctx.lineTo(x-8,y-4);ctx.closePath();ctx.fill();
    const sh=(sx,sy,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(sx,sy-8);ctx.lineTo(sx-3,sy);ctx.lineTo(sx+3,sy);ctx.closePath();ctx.fill()};
    sh(x-6,y-3,'#e0a04a');sh(x+6,y-1,'#c8d4f0');sh(x+1,y-8,'#e0a04a');
    ctx.fillStyle='rgba(255,255,255,'+tw.toFixed(2)+')';ctx.fillRect(x+9,y-14,2,2);
  }
}
