
/* =====================================================================
   Personajes: humanoides con ciclo de marcha, armas, monturas
   ===================================================================== */
function lim(g,x1,y1,x2,y2,w,col){
  g.lineCap='round';
  g.strokeStyle=OUT;g.lineWidth=w+1.8;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
  g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
}
function rr(g,x,y,w,h,r,fill,st){
  g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();
  if(fill){g.fillStyle=fill;g.fill()}
  if(st!==false){g.strokeStyle=OUT;g.lineWidth=1;g.stroke()}
}
function poly(g,pts,fill,st){
  g.beginPath();g.moveTo(pts[0],pts[1]);
  for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);
  g.closePath();
  if(fill){g.fillStyle=fill;g.fill()}
  if(st!==false){g.strokeStyle=OUT;g.lineWidth=1;g.stroke()}
}
function disc(g,x,y,r,fill,st){
  g.beginPath();g.arc(x,y,r,0,6.283);
  if(fill){g.fillStyle=fill;g.fill()}
  if(st!==false){g.strokeStyle=OUT;g.lineWidth=1;g.stroke()}
}

function drawHorse(g,t,mv,fast){
  const ph=mv?t*(fast?16:12):0,c1='#8a5a32',c2='#5a3a1e';
  g.fillStyle='rgba(0,0,0,0.28)';g.beginPath();g.ellipse(0,1,19,5,0,0,6.283);g.fill();
  const leg=(x,s,col)=>{
    const a=Math.sin(ph+s)*(mv?6:0),l=Math.max(0,Math.cos(ph+s))*(mv?3:0);
    lim(g,x,-13,x+a,-6-l,3.6,col);lim(g,x+a,-6-l,x+a*1.2,-0.5-l*0.4,3,col);
    rr(g,x+a*1.2-2,-2-l*0.4,4.4,2.6,1,'#2a1c10');
  };
  leg(-11,0,c2);leg(10,Math.PI,c2);
  // cola
  g.strokeStyle=OUT;g.lineWidth=5.2;g.beginPath();g.moveTo(-15,-20);g.quadraticCurveTo(-24,-14+Math.sin(ph)*2,-22,-3);g.stroke();
  g.strokeStyle='#2a1c10';g.lineWidth=3.4;g.stroke();
  // cuerpo
  g.fillStyle=c1;g.beginPath();g.ellipse(0,-17,16,8,0,0,6.283);g.fill();g.strokeStyle=OUT;g.lineWidth=1.1;g.stroke();
  g.fillStyle='rgba(255,230,190,0.18)';g.beginPath();g.ellipse(-1,-20,11,3.4,0,0,6.283);g.fill();
  // cuello y cabeza
  poly(g,[10,-22,17,-34,23,-33,17,-18],c1);
  poly(g,[16,-34,26,-34,31,-26,29,-23,22,-26],c1);
  disc(g,28.5,-25,1.3,'#1a1008',false);
  g.fillStyle='#2a1c10';g.beginPath();g.moveTo(15,-36);g.quadraticCurveTo(9,-30,10,-22);g.lineTo(13,-24);g.quadraticCurveTo(13,-30,17,-34);g.fill();
  poly(g,[18,-34,19,-39,21.5,-34],c1);
  disc(g,22,-31.5,1,'#1a1008',false);
  leg(-8,Math.PI,c1);leg(13,0,c1);
  // silla
  rr(g,-7,-26,14,5,2,'#7a2a22');rr(g,-8,-22,16,2.4,1,'#d9b44a',false);
}

function weaponDraw(g,hx,hy,wa,L,bowFix){
  const w=L.weapon;if(!w)return;
  g.save();g.translate(hx,hy);g.rotate(bowFix?0:Math.PI/2-wa);
  g.lineCap='round';
  if(w==='sword'||w==='dagger'){
    const len=w==='sword'?20:11,bl=L.blade||'#d8dce4';
    rr(g,-4,-1.4,6,2.8,1,'#5a3a1e');
    rr(g,1.5,-4,2.6,8,1,L.trim||'#c9a03a');
    poly(g,[4,-1.8,4+len,-1.4,5+len,0,4+len,1.4,4,1.8],bl);
    g.strokeStyle='rgba(255,255,255,0.65)';g.lineWidth=0.7;g.beginPath();g.moveTo(5,-0.5);g.lineTo(3+len,-0.3);g.stroke();
  }else if(w==='club'){
    poly(g,[-3,-1.6,10,-2.4,17,-4.6,19,0,17,4.6,10,2.4,-3,1.6],'#7a5632');
    g.fillStyle='#4a3420';disc(g,15,-2,1,'#4a3420',false);disc(g,17,2,0.9,'#4a3420',false);
  }else if(w==='hammer'){
    rr(g,-3,-1.5,18,3,1,'#6b4a2a');
    rr(g,11,-6,9,12,1.5,'#8e939e');rr(g,12,-5,2.5,10,1,'#b8bec8',false);
  }else if(w==='axe'){
    rr(g,-3,-1.4,20,2.8,1,'#6b4a2a');
    poly(g,[12,-1.5,15,-9,20,-8,21,0,20,8,15,9,12,1.5],L.blade||'#cfd8e4');
    g.strokeStyle='rgba(255,255,255,0.6)';g.lineWidth=0.8;g.beginPath();g.moveTo(20,-7);g.lineTo(20.5,6);g.stroke();
  }else if(w==='staff'){
    lim(g,-9,0,22,0,2.6,'#6b4a2a');
    const oc=L.orb||'#c9a6ff';
    g.save();g.globalCompositeOperation='lighter';
    const gr=g.createRadialGradient(25,0,0,25,0,10);gr.addColorStop(0,rgba(oc,0.7));gr.addColorStop(1,rgba(oc,0));
    g.fillStyle=gr;g.fillRect(14,-11,22,22);g.restore();
    disc(g,25,0,3.6,oc);disc(g,24,-1,1.2,'#fff',false);
  }else if(w==='bow'){
    g.strokeStyle=OUT;g.lineWidth=3.6;g.beginPath();g.moveTo(1,-13);g.quadraticCurveTo(10,0,1,13);g.stroke();
    g.strokeStyle='#8a5a2a';g.lineWidth=2;g.stroke();
    g.strokeStyle='rgba(240,240,230,0.8)';g.lineWidth=0.7;g.beginPath();g.moveTo(1,-13);g.lineTo(1,13);g.stroke();
  }
  g.restore();
}

function hairDraw(g,L,hy){
  const hc=L.hair;if(!hc)return;
  const hs=L.hairStyle===undefined?1:L.hairStyle,dk=tint(hc,-0.25);
  if(hs===0)return;
  if(hs===2){ // largo
    poly(g,[-7,hy-1,-9,hy+11,-4,hy+13,-1,hy+4],dk);
  }
  if(hs===5){ // coleta
    g.strokeStyle=OUT;g.lineWidth=4.4;g.beginPath();g.moveTo(-5,hy-3);g.quadraticCurveTo(-12,hy+1,-9,hy+9);g.stroke();
    g.strokeStyle=dk;g.lineWidth=2.8;g.stroke();
  }
  if(hs===4){ // cresta
    g.fillStyle=dk;g.beginPath();g.arc(0,hy-0.5,6.6,Math.PI*1.1,Math.PI*1.9);g.lineTo(5,hy-3.4);g.lineTo(-5,hy-3.4);g.closePath();g.fill();
    poly(g,[-6,hy-4,-4.4,hy-12,-1.6,hy-6.4,0.6,hy-14,3,hy-6.4,5.2,hy-11,6.4,hy-3.4],hc);
    g.strokeStyle=OUT;g.lineWidth=0.8;g.stroke();
    return;
  }
  g.fillStyle=hc;g.beginPath();
  const rr_=hs===3?6.7:7;
  g.arc(0,hy-0.5,rr_,Math.PI*1.02,Math.PI*1.98);
  if(hs===3){g.lineTo(6,hy-2.8);g.lineTo(-6,hy-2.8)}
  else{g.lineTo(6.2,hy-2.5);g.quadraticCurveTo(2,hy-5,-1,hy-2);g.quadraticCurveTo(-4,hy-3,-6.6,hy)}
  g.closePath();g.fill();g.strokeStyle=OUT;g.lineWidth=0.9;g.stroke();
  if(hs===1){g.fillStyle=hc;g.beginPath();g.moveTo(-7,hy-1);g.lineTo(-8.5,hy+3);g.lineTo(-5.5,hy+1);g.fill()}
  if(hs===6){ // puntas
    poly(g,[-6.5,hy-3,-9,hy-8,-3.4,hy-6.4],hc);poly(g,[-3,hy-6,-2,hy-13,2,hy-6.6],hc);poly(g,[1,hy-6.4,5,hy-12,6.2,hy-4],hc);poly(g,[-7,hy-1,-10.5,hy+2,-6,hy+1.6],hc);
  }
}

function hatDraw(g,L,hy){
  const h=L.hat,tp=L.hatType;if(!h||!tp)return;
  if(tp==='helm'){
    g.fillStyle=h;g.beginPath();g.arc(0,hy-0.5,7.4,Math.PI,0);g.lineTo(7.4,hy+2);g.lineTo(-7.4,hy+2);g.closePath();g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    g.fillStyle=tint(h,0.35);g.fillRect(-1,hy-8,2.2,9);
    g.fillStyle='rgba(0,0,0,0.5)';g.fillRect(1,hy-1,6,2);
    g.fillStyle=L.trim||'#c9a03a';g.fillRect(-7.4,hy+1,14.8,1.4);
  }else if(tp==='pointy'){
    poly(g,[-9,hy-3,9,hy-3,3,hy-9,6,hy-22,-1,hy-17,-5,hy-9],h);
    g.fillStyle=L.trim||'#d9b44a';g.fillRect(-8.6,hy-4.6,17.2,2.4);
    g.beginPath();g.ellipse(0,hy-3,10.5,2.6,0,0,6.283);g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
  }else if(tp==='hood'){
    g.fillStyle=h;g.beginPath();g.arc(-0.5,hy,8.2,Math.PI*0.88,Math.PI*2.05);g.lineTo(6,hy+3);g.quadraticCurveTo(-3,hy+6,-8.6,hy+5);g.closePath();g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    g.fillStyle='rgba(0,0,0,0.35)';g.beginPath();g.ellipse(2.5,hy+0.6,4.6,5,0,0,6.283);g.fill();
  }else if(tp==='bandana'){
    g.fillStyle=h;g.beginPath();g.arc(0,hy-0.5,7.3,Math.PI*1.03,Math.PI*1.97);g.lineTo(7,hy-2.2);g.lineTo(-7,hy-2.2);g.closePath();g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    poly(g,[-6.5,hy-3,-12,hy-1,-9,hy+1,-5,hy-1],h);
  }else if(tp==='turban'){
    g.fillStyle=h;g.beginPath();g.ellipse(0,hy-3.2,8.4,6.6,0,0,6.283);g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    g.strokeStyle='rgba(0,0,0,0.18)';g.lineWidth=0.9;g.beginPath();g.moveTo(-6,hy-1);g.quadraticCurveTo(0,hy-8,7,hy-2);g.moveTo(-5,hy-4);g.quadraticCurveTo(1,hy-10,7,hy-5);g.stroke();
    disc(g,0,hy-6.5,1.7,L.trim||'#d9b44a',true);
  }else if(tp==='horns'){
    g.fillStyle=h;g.beginPath();g.arc(0,hy-0.5,7.6,Math.PI*1.02,Math.PI*1.98);g.lineTo(7.4,hy+1.5);g.lineTo(-7.4,hy+1.5);g.closePath();g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    const hornc='#e8e0c8';
    poly(g,[-6.5,hy-3,-12,hy-6,-13,hy-13,-8.5,hy-8,-4.5,hy-6],hornc);
    poly(g,[6.5,hy-3,12,hy-6,13,hy-13,8.5,hy-8,4.5,hy-6],hornc);
  }else if(tp==='crown'){
    g.fillStyle=h;
    poly(g,[-7,hy-4,-7,hy-12,-3.5,hy-7,0,hy-14,3.5,hy-7,7,hy-12,7,hy-4],h);
    disc(g,0,hy-7.4,1.4,'#7fe8ff',false);disc(g,-6.4,hy-11,1,'#fff',false);disc(g,6.4,hy-11,1,'#fff',false);
  }
}

/* o: {dir,t,moving,scale,sw (0..1 ataque),cast,mounted,fast,rollA,dead} */
function drawHuman(g,x,y,L,o){
  o=o||{};
  const sc=o.scale||1,dir=o.dir||1,t=o.t||0,mv=!!o.moving,ph=mv?t*(o.fast?13:9):0,mounted=!!o.mounted;
  g.save();g.translate(x,y);g.scale(sc*dir,sc);
  if(o.rollA){g.translate(0,-10);g.rotate(o.rollA);g.translate(0,10)}
  if(mounted){drawHorse(g,t,mv,o.fast);g.translate(0,-12)}
  else{g.fillStyle='rgba(0,0,0,0.28)';g.beginPath();g.ellipse(0,1,10,3.4,0,0,6.283);g.fill()}
  const bob=mounted?(mv?Math.sin(ph*1.2)*-1.2:0):(mv?-Math.abs(Math.sin(ph))*1.6:Math.sin(t*2)*-0.5);
  g.translate(0,bob);
  const body=L.body||'#777',trim=L.trim||'#bbb',legc=L.legs||'#444',skin=L.skin||'#e0b890',boot=tint(legc,-0.4);
  const sw=o.sw||0;
  // capa trasera
  if(L.cape){
    const fl=mv?Math.sin(ph*0.7)*3:Math.sin(t*1.6)*1;
    poly(g,[-4,-27,5,-27,2-(mv?8:4)+fl,-6,-9-(mv?6:2)+fl,-5],L.cape);
    g.fillStyle='rgba(0,0,0,0.18)';g.fillRect(-3,-26,2,16);
  }
  // brazo trasero (izquierda en pantalla)
  const bs=mv&&!sw?Math.sin(ph+Math.PI)*0.55:0;
  const backA=-0.2+bs,bshx=-5,bshy=-24;
  // piernas
  if(mounted){
    lim(g,-3,-14,-9,-7,5,legc);lim(g,-9,-7,-7,-1,4.4,boot);
    lim(g,3,-14,9,-7,5.4,tint(legc,0.08));lim(g,9,-7,8,-1,4.6,boot);
  }else{
    const s1=mv?Math.sin(ph)*5.5:0,s2=-s1,l1=mv?Math.max(0,Math.cos(ph))*2.6:0,l2=mv?Math.max(0,-Math.cos(ph))*2.6:0;
    lim(g,-3,-14,-3+s2,-3-l2,5,legc);rr(g,-3+s2-3,-3.4-l2,6.6,3.6,1.4,boot);
    lim(g,3,-14,3+s1,-3-l1,5.4,tint(legc,0.08));rr(g,3+s1-3,-3.4-l1,7,3.6,1.4,boot);
  }
  // brazo trasero
  lim(g,bshx,bshy,bshx+10*Math.sin(backA),bshy+10*Math.cos(backA),4.4,skin);
  const bhx=bshx+10*Math.sin(backA),bhy=bshy+10*Math.cos(backA);
  if(L.shield){
    disc(g,bhx+1.5,bhy-1,6.8,L.trim||'#9aa4b4');disc(g,bhx+1.5,bhy-1,4.2,body,false);
    disc(g,bhx+1.5,bhy-1,1.6,'#f0d070',false);
  }
  // torso
  const bw=L.belly?10.4:7.4;
  rr(g,-bw,-28,bw*2,15,4,body);
  g.fillStyle='rgba(255,255,255,0.14)';g.fillRect(-bw+1.2,-27,bw*1.2,3);
  g.fillStyle='rgba(0,0,0,0.16)';g.fillRect(-bw+1,-16,bw*2-2,2);
  g.fillStyle=trim;g.fillRect(-bw,-16,bw*2,2.2);
  if(!L.belly){g.fillStyle=trim;g.fillRect(-2.2,-28,4.4,3.2)}
  if(L.apron){rr(g,-5.5,-23,11,12,2,'#c8b890');g.fillStyle='rgba(0,0,0,0.18)';g.fillRect(-5,-17,10,1.2)}
  if(L.skel){
    g.strokeStyle=L.trim;g.lineWidth=1.2;
    for(let k=0;k<3;k++){g.beginPath();g.moveTo(-5,-25+k*3.6);g.lineTo(5,-25+k*3.6);g.stroke()}
    g.beginPath();g.moveTo(0,-27);g.lineTo(0,-15);g.stroke();
  }
  if(L.wrapped){
    g.strokeStyle=L.trim;g.lineWidth=1.3;
    for(let k=0;k<5;k++){g.beginPath();g.moveTo(-7,-27+k*3);g.lineTo(7,-24+k*3);g.stroke()}
  }
  if(L.fur){
    g.fillStyle=L.trim;
    for(let k=-3;k<=3;k++){g.beginPath();g.moveTo(k*2.6-1.6,-28);g.lineTo(k*2.6,-24.5);g.lineTo(k*2.6+1.6,-28);g.fill()}
  }
  if(L.pads){disc(g,-6.8,-26.5,3.8,L.pads);disc(g,6.8,-26.5,3.8,L.pads)}
  // cabeza
  const hy=-33.5;
  if(L.ears){poly(g,[-5.5,hy-1,-12,hy-5,-6.5,hy+3],skin);poly(g,[5,hy-1,10,hy-5,6,hy+3],skin)}
  disc(g,0,hy,6.6,skin);
  g.fillStyle='rgba(255,255,255,0.18)';g.beginPath();g.ellipse(-1.8,hy-2.4,3.2,2,0,0,6.283);g.fill();
  if(L.skel){
    g.fillStyle='#1a1410';g.beginPath();g.ellipse(2,hy-0.6,1.8,2.2,0,0,6.283);g.fill();g.beginPath();g.ellipse(5.4,hy-0.6,1.6,2.2,0,0,6.283);g.fill();
    g.fillStyle=L.eye||'#d33';disc(g,2.2,hy-0.6,0.8,L.eye||'#d33',false);disc(g,5.5,hy-0.6,0.8,L.eye||'#d33',false);
    g.fillStyle='#1a1410';for(let k=0;k<4;k++)g.fillRect(1.5+k*1.6,hy+3.4,0.7,2);
  }else{
    const ec=L.eye||'#1c1410';
    disc(g,2.2,hy-0.4,1.15,'#fff',false);disc(g,5.4,hy-0.4,1.15,'#fff',false);
    disc(g,2.6,hy-0.3,0.8,ec,false);disc(g,5.7,hy-0.3,0.8,ec,false);
    if(L.eye&&L.eye!=='#1c1410'&&(L.ears||L.belly)){g.strokeStyle='#2a1c10';g.lineWidth=1;g.beginPath();g.moveTo(1,hy-2.4);g.lineTo(4,hy-1.6);g.moveTo(7,hy-2.4);g.lineTo(5.4,hy-1.6);g.stroke()}
    g.strokeStyle='rgba(60,30,20,0.7)';g.lineWidth=0.8;g.beginPath();g.moveTo(3.2,hy+3.2);g.lineTo(5.4,hy+3);g.stroke();
  }
  if(L.beard){const bd=[0,3,6.5,10][L.beardLen===undefined?2:L.beardLen];g.fillStyle=L.beard;g.beginPath();g.moveTo(-5,hy+1.4);g.quadraticCurveTo(0,hy+1.4+bd*2,6.2,hy+1.4);g.quadraticCurveTo(1,hy+3.6,-5,hy+1.4);g.fill();g.strokeStyle=OUT;g.lineWidth=0.8;g.stroke()}
  if(L.mark===1){g.strokeStyle='rgba(150,40,40,0.9)';g.lineWidth=1;g.beginPath();g.moveTo(6.4,hy-3.4);g.lineTo(4.6,hy+2.8);g.stroke();g.strokeStyle='rgba(255,230,220,0.5)';g.lineWidth=0.5;for(let k=0;k<3;k++){g.beginPath();g.moveTo(4.4+k*0.6,hy-1+k*1.6);g.lineTo(6.6+k*0.4,hy-1.4+k*1.6);g.stroke()}}
  else if(L.mark===2){g.strokeStyle=L.trim||'#d9b44a';g.lineWidth=1.3;g.beginPath();g.moveTo(1.4,hy+1.8);g.lineTo(4,hy+1.8);g.moveTo(5,hy+1.8);g.lineTo(7,hy+1.8);g.moveTo(1.6,hy+3.4);g.lineTo(3.6,hy+3.4);g.stroke()}
  if(L.belly){ // colmillos
    g.fillStyle='#f4f0e0';g.fillRect(3,hy+3,1.2,2.4);g.fillRect(6,hy+3,1.2,2.4);
  }
  hairDraw(g,L,hy);
  hatDraw(g,L,hy);
  // brazo delantero + arma
  const shx=5,shy=-24;
  let a;
  if(o.cast)a=2.5+Math.sin(t*14)*0.12;
  else if(sw>0)a=2.9-(1-sw)*2.6;
  else a=0.45+(mv?Math.sin(ph)*0.55:Math.sin(t*2)*0.04);
  const fx=shx+10.5*Math.sin(a),fy=shy+10.5*Math.cos(a);
  const wp=L.weapon;
  if(wp==='bow'){
    lim(g,shx,shy,shx+9,shy+3+(o.cast||sw?-2:0),4.6,skin);
    weaponDraw(g,shx+10,shy+3,0,L,true);
  }else{
    lim(g,shx,shy,fx,fy,4.8,skin);
    if(wp){
      const wa=o.cast?a+1.7:a+(sw>0?1.15:1.9);
      weaponDraw(g,fx,fy,wa,L,false);
      if(sw>0.05&&(wp==='sword'||wp==='axe'||wp==='club'||wp==='hammer'||wp==='dagger')){
        g.strokeStyle='rgba(255,255,255,'+(0.5*sw).toFixed(2)+')';g.lineWidth=2.2;g.beginPath();g.arc(fx-2,fy-3,24,-0.6-(1-sw)*1.2,1.0-(1-sw)*1.2);g.stroke();
      }
    }
    if(o.cast||wp===null||wp===undefined)disc(g,fx,fy,2.4,skin);
  }
  g.restore();
}
