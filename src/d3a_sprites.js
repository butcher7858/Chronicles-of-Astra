
/* =====================================================================
   Parte 3a: lienzos, color, terreno por fragmentos y sprites de escenario
   ===================================================================== */
const cv=$('cv'),ctx=cv.getContext('2d'),mini=$('miniCv'),mctx=mini.getContext('2d');
let vw=800,vh=600,dpr=1,camX=0,camY=0;
const OUT='#1c140c';
function rng(seed){let a=seed|0;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function mkSprite(w,h,ax,ay,fn){
  const c=document.createElement('canvas');c.width=w*2;c.height=h*2;
  const g=c.getContext('2d');g.scale(2,2);g.lineJoin='round';g.lineCap='round';fn(g);
  return {c:c,w:w,h:h,ax:ax,ay:ay};
}
function putSprite(s,x,y,a){
  if(a!==undefined)ctx.globalAlpha=a;
  ctx.drawImage(s.c,x-s.ax,y-s.ay,s.w,s.h);
  if(a!==undefined)ctx.globalAlpha=1;
}
function hexRGB(hex){const n=parseInt(hex.slice(1),16);return [n>>16,(n>>8)&255,n&255]}
function tint(hex,k){
  const c=hexRGB(hex);let r=c[0],g=c[1],b=c[2];
  if(k>=0){r+=(255-r)*k;g+=(255-g)*k;b+=(255-b)*k}else{r*=1+k;g*=1+k;b*=1+k}
  return 'rgb('+(r|0)+','+(g|0)+','+(b|0)+')';
}
function rgba(hex,a){const c=hexRGB(hex);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'}
function blob(g,x,y,r,col,out){g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,6.283);g.fill();if(out){g.strokeStyle=OUT;g.lineWidth=1;g.stroke()}}
function shadowE(g,x,y,rx,ry,a){g.fillStyle='rgba(0,0,0,'+(a||0.28)+')';g.beginPath();g.ellipse(x,y,rx,ry,0,0,6.283);g.fill()}

/* ---------- Árboles y rocas (sprites cacheados) ---------- */
function mkOak(seed,leaf,leaf2){
  const R=rng(seed);
  return mkSprite(84,100,42,90,g=>{
    shadowE(g,42,90,26,8);
    const tg=g.createLinearGradient(35,0,50,0);tg.addColorStop(0,'#74492a');tg.addColorStop(1,'#46291a');
    g.fillStyle=tg;g.beginPath();g.moveTo(35,91);g.quadraticCurveTo(38,72,37,50);g.lineTo(47,50);g.quadraticCurveTo(46,72,50,91);g.closePath();g.fill();
    g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    const pts=[];for(let i=0;i<9;i++)pts.push([42+(R()-0.5)*42,46+(R()-0.5)*26,12+R()*8]);
    pts.push([42,33,17]);
    for(const p of pts)blob(g,p[0],p[1]+3,p[2],tint(leaf,-0.4),true);
    for(const p of pts)blob(g,p[0],p[1],p[2]*0.93,leaf);
    for(const p of pts)blob(g,p[0]-p[2]*0.25,p[1]-p[2]*0.32,p[2]*0.55,leaf2);
    for(let i=0;i<12;i++)blob(g,26+R()*32,20+R()*30,1.4+R()*1.5,tint(leaf2,0.4));
  });
}
function tier(g,cx,by,w,h,c1,c2,snow){
  g.fillStyle=c1;g.beginPath();g.moveTo(cx,by-h);g.lineTo(cx-w,by);g.lineTo(cx,by-3);g.closePath();g.fill();
  g.fillStyle=c2;g.beginPath();g.moveTo(cx,by-h);g.lineTo(cx+w,by);g.lineTo(cx,by-3);g.closePath();g.fill();
  g.strokeStyle=OUT;g.lineWidth=1;g.beginPath();g.moveTo(cx,by-h);g.lineTo(cx-w,by);g.lineTo(cx,by-3);g.lineTo(cx+w,by);g.closePath();g.stroke();
  if(snow){
    g.fillStyle='#f4f9ff';g.beginPath();g.moveTo(cx,by-h);g.lineTo(cx-w*0.62,by-h*0.4);
    g.quadraticCurveTo(cx-w*0.3,by-h*0.52,cx,by-h*0.34);g.quadraticCurveTo(cx+w*0.3,by-h*0.52,cx+w*0.62,by-h*0.4);g.closePath();g.fill();
  }
}
function mkPine(seed,snow){
  const R=rng(seed),c1=snow?'#2f6a5a':'#2a6a3a',c2=snow?'#1f4c44':'#1d4a2a';
  return mkSprite(64,112,32,102,g=>{
    shadowE(g,32,102,20,6);
    g.fillStyle='#4a2e1a';g.fillRect(29,86,6,16);g.strokeStyle=OUT;g.lineWidth=1;g.strokeRect(29,86,6,16);
    const n=4;
    for(let i=0;i<n;i++){const by=92-i*20,w=27-i*5+R()*2;tier(g,32,by,w,32-i*2,c1,c2,snow)}
  });
}
function mkDead(seed){
  const R=rng(seed);
  return mkSprite(70,90,35,82,g=>{
    shadowE(g,35,82,18,6);
    g.strokeStyle='#3b2c22';g.lineCap='round';
    g.lineWidth=7;g.beginPath();g.moveTo(35,82);g.quadraticCurveTo(33,55,36,34);g.stroke();
    g.lineWidth=2.5;
    for(let i=0;i<6;i++){
      const y=70-i*8,dir=i%2?1:-1,len=10+R()*14;
      g.beginPath();g.moveTo(35,y);g.quadraticCurveTo(35+dir*len*0.6,y-len*0.7,35+dir*len,y-len*0.4-R()*8);g.stroke();
    }
    g.strokeStyle='#5a4535';g.lineWidth=2;g.beginPath();g.moveTo(33,80);g.quadraticCurveTo(31,55,34,34);g.stroke();
  });
}
function mkPalm(seed){
  const R=rng(seed);
  return mkSprite(90,100,45,92,g=>{
    shadowE(g,45,92,22,7);
    g.strokeStyle=OUT;g.lineWidth=7;g.beginPath();g.moveTo(42,92);g.quadraticCurveTo(50,60,44,34);g.stroke();
    g.strokeStyle='#a0773e';g.lineWidth=5;g.beginPath();g.moveTo(42,92);g.quadraticCurveTo(50,60,44,34);g.stroke();
    g.strokeStyle='#7a5a2c';g.lineWidth=1;for(let i=0;i<8;i++){const t=i/8,x=42+8*t*(1-t)*4+(44-42)*t,y=92-58*t;g.beginPath();g.moveTo(x-3,y);g.lineTo(x+3,y);g.stroke()}
    for(let i=0;i<7;i++){
      const a=-Math.PI/2+(i-3)*0.62+(R()-0.5)*0.15,len=32+R()*8;
      const ex=44+Math.cos(a)*len,ey=34+Math.sin(a)*len*0.7+len*0.25;
      g.strokeStyle=OUT;g.lineWidth=5;g.beginPath();g.moveTo(44,34);g.quadraticCurveTo(44+Math.cos(a)*len*0.6,34+Math.sin(a)*len*0.9-6,ex,ey);g.stroke();
      g.strokeStyle=i%2?'#3f8a3a':'#4a9a44';g.lineWidth=3;g.beginPath();g.moveTo(44,34);g.quadraticCurveTo(44+Math.cos(a)*len*0.6,34+Math.sin(a)*len*0.9-6,ex,ey);g.stroke();
    }
    blob(g,44,36,3.5,'#5a3c1e',true);blob(g,48,38,3,'#5a3c1e',true);
  });
}
function mkCactus(seed){
  const R=rng(seed);
  return mkSprite(60,84,30,76,g=>{
    shadowE(g,30,76,16,5);
    const col='#4f9a4a',dk='#2f6a30';
    const col1=(x,y,w,h)=>{
      g.fillStyle=dk;g.beginPath();g.roundRect(x-1,y-1,w+2,h+2,w/2+1);g.fill();
      g.fillStyle=col;g.beginPath();g.roundRect(x,y,w,h,w/2);g.fill();
      g.fillStyle='rgba(255,255,255,0.18)';g.fillRect(x+2,y+4,2,h-8);
    };
    col1(24,20,12,58);
    if(R()<0.8){col1(11,36,9,26);g.fillStyle=dk;g.fillRect(14,58,18,6);col1(11,36,9,26)}
    if(R()<0.8){col1(40,30,9,22);g.fillStyle=dk;g.fillRect(34,46,12,6);col1(40,30,9,22)}
    g.fillStyle='#f4efd0';for(let i=0;i<14;i++)g.fillRect(25+R()*10,24+R()*50,1.2,1.2);
    blob(g,30,20,3,'#e8707a');
  });
}
function mkRock(seed,col,big,moss){
  const R=rng(seed),s=big?1.4:1;
  return mkSprite(Math.round(60*s),Math.round(52*s),Math.round(30*s),Math.round(44*s),g=>{
    g.scale(s,s);
    shadowE(g,30,44,22,6);
    const pts=[[8,42],[5,30],[12,16],[26,8],[42,12],[52,26],[54,40]];
    g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0]+(R()-0.5)*4,pts[i][1]+(R()-0.5)*4);g.closePath();
    g.fillStyle=col;g.fill();g.strokeStyle=OUT;g.lineWidth=1.2;g.stroke();
    g.fillStyle=tint(col,0.22);g.beginPath();g.moveTo(12,16);g.lineTo(26,8);g.lineTo(42,12);g.lineTo(36,24);g.lineTo(20,26);g.closePath();g.fill();
    g.fillStyle=tint(col,-0.3);g.beginPath();g.moveTo(36,24);g.lineTo(42,12);g.lineTo(52,26);g.lineTo(54,40);g.lineTo(38,42);g.closePath();g.fill();
    g.strokeStyle='rgba(0,0,0,0.3)';g.lineWidth=1;g.beginPath();g.moveTo(20,26);g.lineTo(18,40);g.moveTo(36,24);g.lineTo(38,42);g.stroke();
    if(moss){g.fillStyle='#5b8a3a';g.beginPath();g.ellipse(22,14,10,3.4,-0.2,0,6.283);g.fill();g.fillStyle='#74a64a';g.beginPath();g.ellipse(20,13,6,1.8,-0.2,0,6.283);g.fill()}
  });
}
function mkCrystal(seed,col){
  const R=rng(seed);
  return mkSprite(60,70,30,62,g=>{
    shadowE(g,30,62,16,5);
    const sp=[[30,14,9,48],[18,26,7,36],[43,24,8,38],[9,40,5,22],[51,38,5,24]];
    for(const s of sp){
      const x=s[0],top=s[1],w=s[2],bot=top+s[3];
      g.fillStyle=tint(col,-0.15);g.beginPath();g.moveTo(x,top);g.lineTo(x-w/2,bot-6);g.lineTo(x,bot);g.lineTo(x+w/2,bot-6);g.closePath();g.fill();
      g.fillStyle=tint(col,0.45);g.beginPath();g.moveTo(x,top);g.lineTo(x-w/2,bot-6);g.lineTo(x-1,bot-2);g.closePath();g.fill();
      g.strokeStyle=OUT;g.lineWidth=1;g.beginPath();g.moveTo(x,top);g.lineTo(x-w/2,bot-6);g.lineTo(x,bot);g.lineTo(x+w/2,bot-6);g.closePath();g.stroke();
    }
  });
}
const SPR={};
function initSprites(){
  SPR.oak=[mkOak(11,'#3f7d3a','#6ba84a'),mkOak(23,'#37722f','#62a043'),mkOak(37,'#4a8a3a','#7ab84e'),mkOak(51,'#3a6e34','#5f9a45')];
  SPR.oakA=[mkOak(61,'#7a8a2e','#b0b840'),mkOak(73,'#9a6a2a','#cf9a3a')];
  SPR.pine=[mkPine(5,0),mkPine(17,0),mkPine(29,0)];
  SPR.snowpine=[mkPine(41,1),mkPine(53,1),mkPine(67,1)];
  SPR.dead=[mkDead(3),mkDead(9),mkDead(15)];
  SPR.palm=[mkPalm(2),mkPalm(8)];
  SPR.cactus=[mkCactus(4),mkCactus(12),mkCactus(21)];
  SPR.rock=[mkRock(1,'#807c78',false,false),mkRock(7,'#8a847a',false,true),mkRock(13,'#76726e',false,false)];
  SPR.rockD=[mkRock(2,'#b09a72',false,false),mkRock(8,'#a48e68',false,false)];
  SPR.rockS=[mkRock(3,'#9aa6b4',false,false),mkRock(9,'#8c98a8',false,false)];
  SPR.boulder=[mkRock(5,'#74706c',true,true),mkRock(15,'#7c7874',true,false)];
  SPR.crystal=[mkCrystal(1,'#7fd0ff'),mkCrystal(2,'#9ae0ff')];
  SPR.crystalI=[mkCrystal(3,'#b8a0ff'),mkCrystal(4,'#8ab4ff')];
}
function decoSprite(code,x,y,zid){
  const h=hash2(x*3+7,y*5+3);
  switch(code){
    case D.OAK:return (zid==='forest'&&h<0.25)?SPR.oakA[(h*8|0)%2]:SPR.oak[(h*4|0)%4];
    case D.PINE:return SPR.pine[(h*3|0)%3];
    case D.SNOWPINE:return SPR.snowpine[(h*3|0)%3];
    case D.DEAD:return SPR.dead[(h*3|0)%3];
    case D.PALM:return SPR.palm[(h*2|0)%2];
    case D.CACTUS:return SPR.cactus[(h*3|0)%3];
    case D.ROCK:return zid==='desert'?SPR.rockD[(h*2|0)%2]:zid==='snow'?SPR.rockS[(h*2|0)%2]:SPR.rock[(h*3|0)%3];
    case D.BOULDER:return SPR.boulder[(h*2|0)%2];
    case D.CRYSTAL:return zid==='palace'?SPR.crystalI[(h*2|0)%2]:SPR.crystal[(h*2|0)%2];
  }
  return null;
}

/* ---------- Colores y terreno ---------- */
const TCOL={
  0:['#5a8a3c','#548236','#5f9142','#4f7a33'],
  1:['#3b6a3a','#376536','#3f7040','#335e33'],
  2:['#a98a5c','#a28355','#b0925f','#9a7c4f'],
  3:['#9a9486','#928c7e','#a19b8d','#8a8478'],
  4:['#2b6190','#2a5d8a','#2f6a9a','#285780'],
  5:['#d6c18f','#cfba88','#dcc896','#c8b480'],
  6:['#3b3441','#363039','#413a48','#302a36'],
  7:['#85824f','#7f7c4a','#8b8855','#777446'],
  8:['#2a2430','#26202c','#2e2834','#221c28'],
  9:['#4a5a35','#455330','#506139','#404d2c'],
  10:['#dcb26a','#d6ab63','#e2b972','#d0a35c'],
  11:['#e8eff5','#e1e9f0','#eff5fa','#dae3eb'],
  12:['#a9d6ee','#a2d0e9','#b2dcf2','#9acae3'],
  13:['#8a6a3e','#826238','#92724a','#7a5c32'],
  14:['#2e3b24','#2a3620','#33422a','#26321d'],
  15:['#2c1f36','#24192c','#32243e','#1d1424'],
  16:['#c2410c','#9a3412','#ea580c','#7c2d12'],
  17:['#1e1b4b','#17143e','#2e1065','#0f172a'],
  18:['#475569','#334155','#64748b','#1e293b']
};
const WCOL=['#5aa0c0','#3f86b0','#2f6f9d','#245a86'],BCOL=['#4a5d34','#3a4a28','#2f3c20','#27331b'];
const BL={0:1,1:3,7:4,9:3,10:5,11:6,5:7,2:8};
const DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
const CK=8,CPX=CK*TILE,chunks=new Map();

function blendEdges(g,x,y,px,py,t){
  const p=BL[t];if(!p)return;
  for(let d=0;d<4;d++){
    const nx=x+DIRS[d][0],ny=y+DIRS[d][1];if(!inb(nx,ny))continue;
    const ni=idx(nx,ny),nt=tiles[ni],np=BL[nt];
    if(!np||np<=p||nt===t)continue;
    const nc=TCOL[nt][shade[ni]],w=12;let gr,rx,ry,rw,rh;
    if(d===0){gr=g.createLinearGradient(0,py,0,py+w);rx=px;ry=py;rw=TILE;rh=w}
    else if(d===2){gr=g.createLinearGradient(0,py+TILE,0,py+TILE-w);rx=px;ry=py+TILE-w;rw=TILE;rh=w}
    else if(d===1){gr=g.createLinearGradient(px+TILE,0,px+TILE-w,0);rx=px+TILE-w;ry=py;rw=w;rh=TILE}
    else{gr=g.createLinearGradient(px,0,px+w,0);rx=px;ry=py;rw=w;rh=TILE}
    gr.addColorStop(0,nc);gr.addColorStop(1,rgba(nc.charAt(0)==='#'?nc:'#000000',0));
    g.fillStyle=gr;g.fillRect(rx,ry,rw,rh);
  }
}
function groundDeco(g,code,px,py,x,y){
  const r1=hash2(x*11+1,y*7+2),r2=hash2(x*5+9,y*13+4),r3=hash2(x*17+3,y*3+8);
  switch(code){
    case D.FLOWER:{
      const cols=['#f2d94e','#ea6a8e','#f4f4f4','#8ab8ff','#d98af0'];
      for(let k=0;k<3;k++){
        const fx=px+5+hash2(x+k*3,y)*22,fy=py+8+hash2(x,y+k*5)*18,c=cols[((r1*5)|0+k)%5];
        g.strokeStyle='#2f6a2a';g.lineWidth=1;g.beginPath();g.moveTo(fx,fy+5);g.lineTo(fx,fy);g.stroke();
        g.fillStyle=c;for(let a=0;a<5;a++){g.beginPath();g.arc(fx+Math.cos(a*1.257)*2.1,fy+Math.sin(a*1.257)*2.1,1.5,0,6.283);g.fill()}
        blob(g,fx,fy,1.1,'#fff1a0');
      }break}
    case D.TUFT:case D.SWAMPGRASS:case D.FERN:{
      const c=code===D.SWAMPGRASS?'#2f4a26':code===D.FERN?'#2d7a3a':'#3b7a30';
      g.strokeStyle=c;g.lineWidth=1.4;
      const bx=px+8+r1*16,by=py+12+r2*14,n=code===D.FERN?5:4;
      for(let k=0;k<n;k++){const a=-1.2+k*(2.4/(n-1));g.beginPath();g.moveTo(bx,by);g.quadraticCurveTo(bx+Math.sin(a)*4,by-5,bx+Math.sin(a)*9,by-9-r3*3);g.stroke()}
      break}
    case D.STONES:{
      for(let k=0;k<3;k++){
        const sx=px+6+hash2(x+k,y*2)*20,sy=py+8+hash2(x*2,y+k)*18;
        g.fillStyle='rgba(0,0,0,0.25)';g.beginPath();g.ellipse(sx+1,sy+2,3.4,1.6,0,0,6.283);g.fill();
        g.fillStyle='#8c8a86';g.beginPath();g.ellipse(sx,sy,3,2.2,0,0,6.283);g.fill();
        g.fillStyle='#b0aea8';g.beginPath();g.ellipse(sx-0.8,sy-0.7,1.4,0.9,0,0,6.283);g.fill();
      }break}
    case D.MUSH:{
      for(let k=0;k<2;k++){
        const mx=px+8+hash2(x+k,y)*16,my=py+12+hash2(x,y+k)*12;
        g.fillStyle='#e8e0cc';g.fillRect(mx-1,my,2,4);
        g.fillStyle=k?'#d8d0c0':'#d04a3a';g.beginPath();g.ellipse(mx,my,4,2.6,0,Math.PI,0);g.fill();
        g.fillStyle='#fff';g.fillRect(mx-2,my-2,1,1);g.fillRect(mx+1,my-1,1,1);
      }break}
    case D.REEDS:{
      for(let k=0;k<4;k++){
        const rx=px+6+k*6+r1*3,ry=py+26;
        g.strokeStyle='#5a7a38';g.lineWidth=1.5;g.beginPath();g.moveTo(rx,ry);g.quadraticCurveTo(rx+2,ry-12,rx+(k-1.5)*2,ry-22-r2*6);g.stroke();
        if(k%2===0){g.fillStyle='#6a4a28';g.fillRect(rx+(k-1.5)*2-1,ry-24-r2*6,2.4,6)}
      }break}
    case D.BONES:{
      g.strokeStyle='#eee6d0';g.lineWidth=2;g.lineCap='round';
      const bx=px+8+r1*12,by=py+14+r2*10;
      g.beginPath();g.moveTo(bx,by);g.lineTo(bx+10,by+3);g.moveTo(bx+2,by+6);g.lineTo(bx+9,by-2);g.stroke();
      g.fillStyle='#eee6d0';g.beginPath();g.arc(bx+13,by+3,3,0,6.283);g.fill();g.fillStyle='#403830';g.fillRect(bx+12,by+2,1,1);g.fillRect(bx+14,by+2,1,1);
      break}
    case D.SNOWMOUND:{
      g.fillStyle='rgba(120,150,190,0.35)';g.beginPath();g.ellipse(px+17,py+22,11,4,0,0,6.283);g.fill();
      g.fillStyle='#f4f9ff';g.beginPath();g.ellipse(px+16,py+19,10,5.5,0,0,6.283);g.fill();
      g.fillStyle='#ffffff';g.beginPath();g.ellipse(px+14,py+17,5,2.5,0,0,6.283);g.fill();
      break}
    case D.SHRUB:{
      g.fillStyle='rgba(0,0,0,0.22)';g.beginPath();g.ellipse(px+16,py+24,9,3,0,0,6.283);g.fill();
      g.strokeStyle='#8a7a3a';g.lineWidth=1.4;
      for(let k=0;k<6;k++){g.beginPath();g.moveTo(px+16,py+23);g.lineTo(px+7+k*3.4,py+10+r1*5+(k%2)*3);g.stroke()}
      g.fillStyle='#a8a04a';for(let k=0;k<5;k++)g.fillRect(px+8+k*3.6,py+10+(k%2)*3,2,2);
      break}
    case D.LILY:{
      g.fillStyle='#3f8a44';g.beginPath();g.ellipse(px+16,py+16,8,5,0,0.3,6.0);g.lineTo(px+16,py+16);g.fill();
      g.fillStyle='#5aa85a';g.beginPath();g.ellipse(px+15,py+15,5,3,0,0.3,6.0);g.fill();
      if(r1<0.5){blob(g,px+18,py+14,2.4,'#f6a8c8');blob(g,px+18,py+14,1,'#fff0a0')}
      break}
  }
}
function bakeTile(g,x,y,px,py){
  const i=idx(x,y),t=tiles[i],sh=shade[i],r=hash2(x*7+1,y*13+5);
  let col=TCOL[t][sh];
  if(t===T.WATER)col=WCOL[Math.max(0,(wdepth[i]||4)-1)];
  else if(t===T.BOG)col=BCOL[Math.max(0,(wdepth[i]||4)-1)];
  else if(t===T.BRIDGE)col=WCOL[2];
  g.fillStyle=col;g.fillRect(px,py,TILE,TILE);
  if(t!==T.WATER&&t!==T.BOG&&t!==T.COBBLE&&t!==T.BRIDGE&&t!==T.WALL){
    for(let k=0;k<3;k++){
      const rr=hash2(x*3+k,y*5+k*7);
      g.fillStyle=tint(col,(rr-0.5)*0.2);
      g.fillRect(px+hash2(x+k*9,y)*28,py+hash2(x,y+k*9)*28,2+(rr>0.6?1:0),2);
    }
  }
  blendEdges(g,x,y,px,py,t);
  switch(t){
    case T.GRASS:{
      const gc=tint(col,0.18),gd=tint(col,-0.18);
      for(let k=0;k<4;k++){
        const gx=px+4+hash2(x+k,y*3)*24,gy=py+6+hash2(x*3,y+k)*20;
        g.strokeStyle=k%2?gc:gd;g.lineWidth=1;g.beginPath();g.moveTo(gx,gy);g.lineTo(gx-1,gy-3);g.stroke();
      }
      break}
    case T.COBBLE:{
      for(let q=0;q<4;q++){
        const qx=px+(q&1)*16,qy=py+(q>>1)*16,rr=hash2(x*4+q,y*4+(q>>1));
        g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.roundRect(qx,qy,16,16,3);g.fill();
        g.fillStyle=tint(col,(rr-0.5)*0.24);g.beginPath();g.roundRect(qx+1,qy+1,14,14,2.5);g.fill();
        g.strokeStyle='rgba(255,255,255,0.2)';g.lineWidth=1;
        g.beginPath();g.moveTo(qx+2,qy+2);g.lineTo(qx+14,qy+2);g.moveTo(qx+2,qy+2);g.lineTo(qx+2,qy+14);g.stroke();
      }break}
    case T.PATH:{
      for(let k=0;k<3;k++){
        const rr=hash2(x*2+k,y*3+k);
        g.fillStyle=tint(col,rr>0.5?0.16:-0.16);g.beginPath();g.ellipse(px+4+rr*24,py+5+hash2(x+k,y*3)*22,2.5,1.5,0,0,6.283);g.fill();
      }break}
    case T.SAND:{
      g.strokeStyle='rgba(150,120,70,0.28)';g.lineWidth=1.2;g.beginPath();g.arc(px+8+r*10,py+16,9,Math.PI*1.1,Math.PI*1.9);g.stroke();break}
    case T.DUNE:{
      g.strokeStyle='rgba(140,90,30,0.3)';g.lineWidth=1.6;g.beginPath();g.arc(px+16,py+26,14+r*4,Math.PI*1.15,Math.PI*1.85);g.stroke();
      g.strokeStyle='rgba(255,245,210,0.25)';g.lineWidth=1;g.beginPath();g.arc(px+16,py+28,14+r*4,Math.PI*1.2,Math.PI*1.8);g.stroke();break}
    case T.SNOW:{
      g.fillStyle='rgba(255,255,255,0.95)';for(let k=0;k<3;k++)g.fillRect(px+hash2(x+k,y)*28,py+hash2(x,y+k)*28,1.5,1.5);
      g.strokeStyle='rgba(130,175,225,0.28)';g.lineWidth=1.2;g.beginPath();g.arc(px+16,py+24,10+r*4,Math.PI*1.15,Math.PI*1.85);g.stroke();break}
    case T.ICE:{
      g.strokeStyle='rgba(255,255,255,0.55)';g.lineWidth=1.2;g.beginPath();
      g.moveTo(px+r*10,py+4);g.lineTo(px+14+r*8,py+16);g.lineTo(px+8+r*10,py+30);g.moveTo(px+14+r*8,py+16);g.lineTo(px+30,py+12);g.stroke();
      g.fillStyle='rgba(255,255,255,0.2)';g.fillRect(px+3,py+3,10,2);break}
    case T.SWAMP:{
      if(r<0.35){g.fillStyle='rgba(30,50,40,0.55)';g.beginPath();g.ellipse(px+10+r*30,py+16,8,4,0,0,6.283);g.fill();g.fillStyle='rgba(120,160,120,0.25)';g.fillRect(px+6+r*30,py+14,6,1.5)}break}
    case T.HILL:{
      if(r<0.35){g.strokeStyle='rgba(50,50,25,0.35)';g.lineWidth=1.2;g.beginPath();g.moveTo(px+4,py+24);g.lineTo(px+28,py+20);g.stroke();g.strokeStyle='rgba(255,255,255,0.1)';g.beginPath();g.moveTo(px+4,py+23);g.lineTo(px+28,py+19);g.stroke()}break}
    case T.CAVE:{
      if(r<0.5){g.strokeStyle='rgba(0,0,0,0.4)';g.lineWidth=1;g.beginPath();g.moveTo(px+6,py+r*20);g.lineTo(px+18+r*6,py+r*20+5);g.lineTo(px+26,py+r*20-2);g.stroke()}
      if(hash2(x*5,y*7)>0.78){g.fillStyle=hash2(x,y)>0.5?'#8ae0ff':'#e8b0ff';g.fillRect(px+hash2(x,y)*26,py+hash2(y,x)*26,2,2)}
      break}
    case T.WALL:{
      for(let k=0;k<2;k++){
        const rr=hash2(x+k*3,y*2+k);g.fillStyle=tint(col,0.12+rr*0.14);
        g.beginPath();g.moveTo(px+rr*16,py+3);g.lineTo(px+rr*16+12,py+8);g.lineTo(px+rr*16+4,py+15);g.closePath();g.fill();
      }
      g.fillStyle='rgba(255,255,255,0.1)';g.fillRect(px,py,TILE,3);
      g.fillStyle='rgba(0,0,0,0.3)';g.fillRect(px,py+TILE-4,TILE,4);break}
    case T.BRIDGE:{
      g.fillStyle=tint(col,-0.22);g.fillRect(px,py,TILE,TILE);
      for(let k=0;k<4;k++){g.fillStyle=tint(col,(hash2(x+k,y)-0.5)*0.18);g.fillRect(px+1,py+k*8+1,TILE-2,7);g.fillStyle='rgba(0,0,0,0.35)';g.fillRect(px+1,py+k*8+7,TILE-2,1)}
      g.fillStyle='#5a3e20';g.fillRect(px,py,2.5,TILE);g.fillRect(px+TILE-2.5,py,2.5,TILE);break}
    case T.BOG:{
      if(r<0.4){g.fillStyle='rgba(140,170,100,0.4)';g.beginPath();g.arc(px+6+r*60,py+10+r*20,2.5,0,6.283);g.fill()}break}
    case T.WATER:{
      const m=shore[i];
      g.strokeStyle='rgba(255,255,255,0.22)';g.lineWidth=1;g.beginPath();g.ellipse(px+16,py+16,9+r*4,3,0,0,6.283);g.stroke();
      if(m){
        g.fillStyle='rgba(225,244,255,0.45)';
        if(m&1)g.fillRect(px,py,TILE,5);if(m&4)g.fillRect(px,py+TILE-5,TILE,5);
        if(m&2)g.fillRect(px+TILE-5,py,5,TILE);if(m&8)g.fillRect(px,py,5,TILE);
      }break}
    case T.CORRUPT:{
      if(r<0.45){
        g.strokeStyle='rgba(168,85,247,0.45)';g.lineWidth=1.2;g.beginPath();
        g.moveTo(px+4,py+r*20);g.lineTo(px+16,py+r*20+8);g.lineTo(px+28,py+r*20+2);g.stroke();
        g.fillStyle='rgba(192,132,252,0.3)';g.fillRect(px+hash2(x,y)*24,py+hash2(y,x)*24,2,2);
      }break}
    case T.LAVA:{
      g.strokeStyle='rgba(255,200,50,0.6)';g.lineWidth=1.5;g.beginPath();
      g.moveTo(px+r*8,py+16);g.quadraticCurveTo(px+16,py+6+r*12,px+32-r*8,py+16);g.stroke();
      g.fillStyle='rgba(255,80,0,0.4)';g.beginPath();g.arc(px+16+r*8,py+16,4,0,6.283);g.fill();
      g.fillStyle='#fff';g.fillRect(px+hash2(x,y)*26,py+hash2(y,x)*26,1.5,1.5);break}
    case T.ASTRAL:{
      g.fillStyle='rgba(216,180,254,0.35)';g.beginPath();g.arc(px+16,py+16,8+r*6,0,6.283);g.fill();
      g.fillStyle='rgba(255,255,255,0.9)';for(let k=0;k<3;k++)g.fillRect(px+hash2(x+k*5,y)*28,py+hash2(x,y+k*5)*28,1.5,1.5);
      g.strokeStyle='rgba(56,189,248,0.4)';g.lineWidth=1;g.beginPath();g.arc(px+16,py+16,12,0,Math.PI);g.stroke();break}
    case T.RUINS:{
      for(let q=0;q<4;q++){
        const qx=px+(q&1)*16,qy=py+(q>>1)*16;
        g.strokeStyle='rgba(30,41,59,0.5)';g.lineWidth=1;g.strokeRect(qx+1,qy+1,14,14);
        if(hash2(x+q,y)>0.6){g.fillStyle='rgba(56,189,248,0.25)';g.fillRect(qx+4,qy+4,8,2)}
      }break}
  }
  const d=deco[i];
  if(d>=20)groundDeco(g,d,px,py,x,y);
}
function bakeChunk(a,b){
  const c=document.createElement('canvas');c.width=CPX;c.height=CPX;
  const g=c.getContext('2d'),x0=a*CK,y0=b*CK;
  for(let ty=0;ty<CK;ty++)for(let tx=0;tx<CK;tx++){
    const x=x0+tx,y=y0+ty;if(!inb(x,y))continue;
    bakeTile(g,x,y,tx*TILE,ty*TILE);
  }
  return c;
}
function getChunk(a,b){
  const k=b*64+a;let c=chunks.get(k);
  if(c){c.t=G.time;return c.cv}
  c={cv:bakeChunk(a,b),t:G.time};chunks.set(k,c);
  if(chunks.size>140){
    const arr=Array.from(chunks.entries()).sort((p,q)=>p[1].t-q[1].t);
    for(let i=0;i<40;i++)chunks.delete(arr[i][0]);
  }
  return c.cv;
}
function waterFx(px,py,x,y,t){
  const i=idx(x,y);
  if(tiles[i]!==T.WATER&&tiles[i]!==T.BOG)return;
  const bog=tiles[i]===T.BOG;
  ctx.fillStyle=bog?'rgba(160,200,120,0.10)':'rgba(255,255,255,0.12)';
  const o=Math.sin(t*1.3+x*0.9+y*0.5)*5;
  ctx.fillRect(px+8+o,py+10,12,2);ctx.fillRect(px+4-o,py+22,10,2);
  const m=shore[i];
  if(m&&!bog){
    ctx.fillStyle='rgba(255,255,255,'+(0.35+0.25*Math.sin(t*2.2+x*1.3+y)).toFixed(2)+')';
    const w=1.5+Math.sin(t*2+x)*1;
    if(m&1)ctx.fillRect(px,py+5,TILE,w);if(m&4)ctx.fillRect(px,py+TILE-5-w,TILE,w);
    if(m&2)ctx.fillRect(px+TILE-5-w,py,w,TILE);if(m&8)ctx.fillRect(px+5,py,w,TILE);
  }
}
