
/* =====================================================================
   d3c_chars.js · Personajes Humanoides de Alta Fidelidad
   - Ciclo de marcha, armas detalladas, capas con viento, accesorios
   - Ojos expresivos, peinados estilizados, armaduras visibles en capas
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

/* ---------- Montura básica: Caballo Real ---------- */
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
  g.fillStyle='rgba(255,230,190,0.22)';g.beginPath();g.ellipse(-1,-20,11,3.4,0,0,6.283);g.fill();
  // cuello y cabeza
  poly(g,[10,-22,17,-34,23,-33,17,-18],c1);
  poly(g,[16,-34,26,-34,31,-26,29,-23,22,-26],c1);
  disc(g,28.5,-25,1.4,'#1a1008',false);
  g.fillStyle='#2a1c10';g.beginPath();g.moveTo(15,-36);g.quadraticCurveTo(9,-30,10,-22);g.lineTo(13,-24);g.quadraticCurveTo(13,-30,17,-34);g.fill();
  poly(g,[18,-34,19,-39,21.5,-34],c1);
  disc(g,22,-31.5,1.1,'#1a1008',false);
  leg(-8,Math.PI,c1);leg(13,0,c1);
  // silla
  rr(g,-7,-26,14,5,2,'#7a2a22');rr(g,-8,-22,16,2.4,1,'#d9b44a',false);
}

/* ---------- Dibujado de Armas Detalladas ---------- */
function weaponDraw(g,hx,hy,wa,L,bowFix){
  const w=L.weapon;if(!w)return;
  g.save();g.translate(hx,hy);g.rotate(bowFix?0:Math.PI/2-wa);
  g.lineCap='round';
  const bl=L.blade||'#e2e8f0',trim=L.trim||'#d9a73a';
  
  if(w==='sword'){
    const len=22;
    // empuñadura y pomo
    rr(g,-5,-1.6,6.5,3.2,1,'#4a3018');
    disc(g,-5,0,2.2,trim);
    // gavilanes de la guarda
    rr(g,1.5,-5.5,3,11,1.2,trim);
    disc(g,3,0,1.8,'#d43a2a',false); // gema central
    // hoja de acero con filo y brillo
    poly(g,[4,-2.2,4+len,-1.6,6+len,0,4+len,1.6,4,2.2],bl);
    g.strokeStyle='rgba(255,255,255,0.85)';g.lineWidth=0.8;g.beginPath();g.moveTo(5,-0.5);g.lineTo(4+len,-0.2);g.stroke();
    // brillo mágico en rareza alta
    if(L.rarity>=2||L.aura){
      g.strokeStyle=L.aura||'rgba(140,200,255,0.7)';g.lineWidth=1.6;
      g.beginPath();g.moveTo(6,0);g.lineTo(4+len,0);g.stroke();
    }
  }else if(w==='dagger'){
    const len=13;
    rr(g,-4,-1.3,5,2.6,1,'#2c1f14');
    rr(g,1,-3.5,2.4,7,1,trim);
    // hoja sinuosa
    poly(g,[3,-1.6,6,-2.4,10,-1.2,3+len,0,10,1.2,6,2.4,3,1.6],bl);
    g.strokeStyle='#ffffff';g.lineWidth=0.6;g.beginPath();g.moveTo(4,0);g.lineTo(2+len,0);g.stroke();
  }else if(w==='club'||w==='hammer'){
    rr(g,-4,-1.6,20,3.2,1,'#5a3a1e');
    rr(g,12,-7,10,14,2,'#7a8292');
    rr(g,13,-6,3,12,1,trim,false);
    g.fillStyle='#e8e0c8';disc(g,17,0,1.8,'#e8e0c8',false); // runa sagrada
  }else if(w==='axe'){
    rr(g,-4,-1.5,22,3,1,'#5a3a1e');
    // cabeza de hacha en media luna
    poly(g,[12,-1.8,14,-11,22,-9,23,0,22,9,14,11,12,1.8],bl);
    g.strokeStyle='#fff';g.lineWidth=0.9;g.beginPath();g.moveTo(21,-8);g.quadraticCurveTo(23,0,21,8);g.stroke();
    disc(g,15,0,2.2,trim);
  }else if(w==='staff'){
    lim(g,-10,0,24,0,3,'#5a3e24');
    // cabeza dorada ornamentada
    rr(g,19,-4,5,8,1.5,trim);
    const oc=L.orb||'#b68cff';
    g.save();g.globalCompositeOperation='lighter';
    const gr=g.createRadialGradient(27,0,0,27,0,12);gr.addColorStop(0,rgba(oc,0.85));gr.addColorStop(1,rgba(oc,0));
    g.fillStyle=gr;g.fillRect(14,-13,26,26);g.restore();
    disc(g,27,0,4.2,oc);disc(g,26,-1,1.5,'#ffffff',false);
    // arco superior
    g.strokeStyle=trim;g.lineWidth=1.5;g.beginPath();g.arc(26,0,6.5,-Math.PI*0.6,Math.PI*0.6);g.stroke();
  }else if(w==='bow'){
    g.strokeStyle=OUT;g.lineWidth=4;g.beginPath();g.moveTo(1,-15);g.quadraticCurveTo(11,0,1,15);g.stroke();
    g.strokeStyle='#7c4c22';g.lineWidth=2.4;g.stroke();
    // extremos dorados
    disc(g,1,-15,1.6,trim);disc(g,1,15,1.6,trim);
    // cuerda tensada
    g.strokeStyle='rgba(255,255,240,0.85)';g.lineWidth=0.8;g.beginPath();g.moveTo(1,-15);g.lineTo(1,15);g.stroke();
    // flecha
    g.strokeStyle='#d8ceb4';g.lineWidth=1.2;g.beginPath();g.moveTo(-4,0);g.lineTo(12,0);g.stroke();
    poly(g,[11,-2,15,0,11,2],'#b8bec8',false);
  }else if(w==='spear'){
    lim(g,-14,0,26,0,2.8,'#5a3a1e');
    poly(g,[18,-3.5,30,0,18,3.5],bl);
    rr(g,16,-2,3,4,1,trim);
    poly(g,[15,-2,11,-7,17,-4],'#d9382a',false); // borla roja
  }
  g.restore();
}

/* ---------- Peinados Detallados (11 Estilos) ---------- */
function hairDraw(g,L,hy){
  const hc=L.hair;if(!hc)return;
  const hs=L.hairStyle===undefined?1:L.hairStyle,dk=tint(hc,-0.3),lt=tint(hc,0.32);
  if(hs===0)return; // Calvo

  if(hs===1){ // Corto estilizado con flequillo lacio
    g.fillStyle=hc;g.beginPath();g.arc(0,hy-0.5,7.2,Math.PI*1.02,Math.PI*1.98);
    g.lineTo(6.5,hy-2.5);g.quadraticCurveTo(2,hy-5,-1,hy-1.5);g.quadraticCurveTo(-4,hy-2,-6.8,hy);g.closePath();g.fill();
    g.strokeStyle=OUT;g.lineWidth=0.9;g.stroke();
    // mechón de brillo
    g.strokeStyle=lt;g.lineWidth=1.2;g.beginPath();g.arc(0,hy-3,5,Math.PI*1.2,Math.PI*1.65);g.stroke();
    // patilla
    poly(g,[-6.8,hy-1,-8.5,hy+3,-5.2,hy+1],hc);
  }else if(hs===2){ // Melena larga sedosa
    poly(g,[-7,hy-1,-10,hy+13,-4,hy+15,-1,hy+4],dk);
    g.fillStyle=hc;g.beginPath();g.arc(0,hy-0.5,7.2,Math.PI*1.02,Math.PI*1.98);
    g.lineTo(7,hy+6);g.quadraticCurveTo(4,hy+2,2,hy-1);g.quadraticCurveTo(-3,hy+2,-6.8,hy+7);g.closePath();g.fill();
    g.strokeStyle=OUT;g.lineWidth=0.9;g.stroke();
    g.strokeStyle=lt;g.lineWidth=1;g.beginPath();g.moveTo(-4,hy+1);g.lineTo(-6,hy+10);g.stroke();
  }else if(hs===3){ // Tupé noble / caballero
    g.fillStyle=hc;g.beginPath();g.arc(0,hy-1,7,Math.PI*0.95,Math.PI*1.95);
    g.quadraticCurveTo(4,hy-10,0,hy-12);g.quadraticCurveTo(-5,hy-8,-6.8,hy-2);g.closePath();g.fill();
    g.strokeStyle=OUT;g.lineWidth=0.9;g.stroke();
    g.fillStyle=lt;g.beginPath();g.ellipse(0,hy-6,4,2,0.2,0,6.283);g.fill();
  }else if(hs===4){ // Cresta gladiador / mohicano
    g.fillStyle=dk;g.beginPath();g.arc(0,hy-0.5,6.6,Math.PI*1.1,Math.PI*1.9);g.lineTo(5,hy-3.4);g.lineTo(-5,hy-3.4);g.closePath();g.fill();
    poly(g,[-6,hy-4,-4.4,hy-13,-1.6,hy-7,0.6,hy-15,3,hy-7,5.2,hy-12,6.4,hy-3.4],hc);
    g.strokeStyle=OUT;g.lineWidth=0.8;g.stroke();
  }else if(hs===5){ // Coleta samurái / guerrero
    g.strokeStyle=OUT;g.lineWidth=4.8;g.beginPath();g.moveTo(-5,hy-3);g.quadraticCurveTo(-14,hy+1,-11,hy+11);g.stroke();
    g.strokeStyle=dk;g.lineWidth=3.2;g.stroke();
    disc(g,-6,hy-2,2,'#d9a73a'); // lazo dorado
    g.fillStyle=hc;g.beginPath();g.arc(0,hy-0.5,7,Math.PI*1.02,Math.PI*1.98);g.lineTo(6.5,hy-2);g.lineTo(-6.5,hy-2);g.closePath();g.fill();
    g.strokeStyle=OUT;g.lineWidth=0.9;g.stroke();
  }else if(hs===6){ // Puntas manga / anime
    poly(g,[-7,hy-3,-10,hy-9,-4,hy-7],hc);
    poly(g,[-4,hy-7,-2,hy-15,2,hy-7],hc);
    poly(g,[1,hy-7,6,hy-14,7,hy-4],hc);
    poly(g,[5,hy-4,9,hy-8,8,hy-1],hc);
    poly(g,[-7,hy-1,-11,hy+3,-6,hy+2],hc);
    g.fillStyle=lt;disc(g,0,hy-6,2,lt,false);
  }else if(hs===7){ // Coletas gemelas (Twin Tails)
    poly(g,[-6,hy-2,-12,hy+5,-7,hy+12,-5,hy+4],dk);
    poly(g,[6,hy-2,12,hy+5,7,hy+12,5,hy+4],dk);
    disc(g,-7,hy+1,1.8,'#ff6888');disc(g,7,hy+1,1.8,'#ff6888'); // lazos rosas
    g.fillStyle=hc;g.beginPath();g.arc(0,hy-0.5,7,Math.PI*1.02,Math.PI*1.98);g.lineTo(6,hy-1);g.lineTo(-6,hy-1);g.closePath();g.fill();
    g.strokeStyle=OUT;g.lineWidth=0.9;g.stroke();
  }else if(hs===8){ // Trenzas nórdicas
    poly(g,[-6,hy-1,-9,hy+10,-7,hy+14,-4,hy+8],dk);
    poly(g,[5,hy-1,8,hy+10,6,hy+14,3,hy+8],dk);
    disc(g,-7,hy+12,1.6,'#d9a73a');disc(g,6,hy+12,1.6,'#d9a73a'); // cuentas
    g.fillStyle=hc;g.beginPath();g.arc(0,hy-0.5,7,Math.PI*1.02,Math.PI*1.98);g.lineTo(6.5,hy-2);g.lineTo(-6.5,hy-2);g.closePath();g.fill();
    g.strokeStyle=OUT;g.lineWidth=0.9;g.stroke();
  }else if(hs===9){ // Ondulado salvaje
    poly(g,[-7,hy-2,-12,hy+8,-6,hy+13,-2,hy+6],dk);
    poly(g,[6,hy-2,11,hy+7,5,hy+13,1,hy+5],dk);
    g.fillStyle=hc;g.beginPath();g.arc(0,hy-0.5,7.3,Math.PI*1.0,Math.PI*2.0);
    g.quadraticCurveTo(4,hy-5,0,hy-2);g.quadraticCurveTo(-4,hy-4,-7,hy);g.closePath();g.fill();
    g.strokeStyle=OUT;g.lineWidth=0.9;g.stroke();
  }else if(hs===10){ // Rizo noble / Afro corto
    g.fillStyle=dk;g.beginPath();g.arc(0,hy-1,8.5,Math.PI*0.9,Math.PI*2.1);g.closePath();g.fill();
    g.fillStyle=hc;for(let a=0;a<6;a++){disc(g,-5+a*2,hy-7+(a%2)*2,2.8,hc,false)}
    g.strokeStyle=OUT;g.lineWidth=0.9;g.stroke();
  }
}

/* ---------- Cascos, Gorros y Coronas Visibles ---------- */
function hatDraw(g,L,hy){
  const h=L.hat,tp=L.hatType;if(!h||!tp)return;
  const trim=L.trim||'#d9a73a';
  
  if(tp==='helm'){
    // Gran Yelmo de Caballero con visera y cresta
    g.fillStyle=h;g.beginPath();g.arc(0,hy-0.5,7.6,Math.PI,0);g.lineTo(7.6,hy+2.5);g.lineTo(-7.6,hy+2.5);g.closePath();g.fill();
    g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    // cresta superior
    poly(g,[-2,hy-8,0,hy-13,2,hy-8,1,hy],trim);
    // visera metálica con ranura de visión resplandeciente
    g.fillStyle='#120f0c';g.fillRect(1,hy-1.5,6,2.2);
    disc(g,3,hy-0.4,0.9,'#7fe0ff',false); // resplandor ocular
    g.fillStyle=trim;g.fillRect(-7.6,hy+1,15.2,1.6);
  }else if(tp==='crown'){
    // Corona de la realeza con gemas engarzadas
    g.fillStyle='#ffd700';
    poly(g,[-7.5,hy-3,-8,hy-12,-4,hy-7,0,hy-14,4,hy-7,8,hy-12,7.5,hy-3],'#ffd700');
    g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    disc(g,0,hy-7,1.6,'#ff3b30',false); // rubí central
    disc(g,-5,hy-6,1.2,'#007aff',false); // zafiro
    disc(g,5,hy-6,1.2,'#34c759',false); // esmeralda
    g.fillStyle=trim;g.fillRect(-7.5,hy-3,15,1.5);
  }else if(tp==='pointy'){
    // Sombrero de archimago
    poly(g,[-10,hy-3,10,hy-3,3,hy-9,6,hy-23,-2,hy-18,-5,hy-9],h);
    g.fillStyle=trim;g.fillRect(-9,hy-4.5,18,2.4);
    disc(g,0,hy-3.5,1.8,'#7fe8ff',false); // hebilla mágica
    g.beginPath();g.ellipse(0,hy-3,11.5,2.8,0,0,6.283);g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
  }else if(tp==='hood'){
    // Capucha misteriosa de pícaro / sombra
    g.fillStyle=h;g.beginPath();g.arc(-0.5,hy,8.6,Math.PI*0.85,Math.PI*2.08);g.lineTo(6.5,hy+3.5);g.quadraticCurveTo(-3,hy+7,-9,hy+5.5);g.closePath();g.fill();
    g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    // sombra profunda en la mirada
    g.fillStyle='rgba(5,5,10,0.65)';g.beginPath();g.ellipse(2.5,hy+0.6,5,5.2,0,0,6.283);g.fill();
    g.strokeStyle=trim;g.lineWidth=0.8;g.beginPath();g.moveTo(-8.5,hy+4);g.lineTo(6,hy+3);g.stroke();
  }else if(tp==='horns'){
    // Cuernos ancestrales de señor de la guerra
    g.fillStyle=h;g.beginPath();g.arc(0,hy-0.5,7.6,Math.PI*1.02,Math.PI*1.98);g.lineTo(7.4,hy+1.5);g.lineTo(-7.4,hy+1.5);g.closePath();g.fill();
    g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
    const hornc='#ece4d0';
    poly(g,[-6.5,hy-3,-13,hy-7,-14,hy-14,-9,hy-8,-4.5,hy-6],hornc);
    poly(g,[6.5,hy-3,13,hy-7,14,hy-14,9,hy-8,4.5,hy-6],hornc);
    g.strokeStyle='#7a5a3a';g.lineWidth=0.8;g.beginPath();g.moveTo(-11,hy-10);g.lineTo(-7,hy-7);g.moveTo(11,hy-10);g.lineTo(7,hy-7);g.stroke();
  }else if(tp==='bandana'){
    g.fillStyle=h;g.beginPath();g.arc(0,hy-0.5,7.4,Math.PI*1.03,Math.PI*1.97);g.lineTo(7,hy-2);g.lineTo(-7,hy-2);g.closePath();g.fill();
    poly(g,[-6.5,hy-2,-13,hy+1,-10,hy+4,-5,hy],h);
  }else if(tp==='circlet'){
    // Diadema élfica
    g.strokeStyle=trim;g.lineWidth=1.8;g.beginPath();g.arc(0,hy-0.5,7.2,Math.PI*1.05,Math.PI*1.95);g.stroke();
    disc(g,4,hy-2.5,1.8,'#7fe0ff');disc(g,4,hy-2.5,0.8,'#fff',false);
  }
}

/* ---------- Humanoides: Jugador, NPCs y Enemigos ---------- */
/* o: {dir,t,moving,scale,sw (ataque),cast,mounted,fast,rollA,dead,noAura} */
function drawHuman(g,x,y,L,o){
  o=o||{};
  const sc=o.scale||1,dir=o.dir||1,t=o.t||0,mv=!!o.moving,ph=mv?t*(o.fast?13:9):0,mounted=!!o.mounted;
  g.save();g.translate(x,y);g.scale(sc*dir,sc);
  if(o.rollA){g.translate(0,-10);g.rotate(o.rollA);g.translate(0,10)}
  if(mounted){drawHorse(g,t,mv,o.fast);g.translate(0,-12)}
  else{g.fillStyle='rgba(0,0,0,0.28)';g.beginPath();g.ellipse(0,1,10,3.4,0,0,6.283);g.fill()}
  const bob=mounted?(mv?Math.sin(ph*1.2)*-1.2:0):(mv?-Math.abs(Math.sin(ph))*1.6:Math.sin(t*2)*-0.5);
  g.translate(0,bob);

  const body=L.body||'#6b7280',trim=L.trim||'#d9a73a',legc=L.legs||'#374151',skin=L.skin||'#e8c09a';
  const boot=L.bootColor||tint(legc,-0.35),sw=o.sw||0;

  // Aura mágica / divina por conjunto o rareza alta
  if(L.aura&&!o.noAura){
    g.save();g.globalCompositeOperation='lighter';
    const gr=g.createRadialGradient(0,-18,4,0,-18,28);
    gr.addColorStop(0,'rgba(255,255,255,0.15)');gr.addColorStop(0.7,L.aura+'44');gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr;g.fillRect(-28,-46,56,56);
    // partículas de aura flotantes
    const aSin=Math.sin(t*4)*5;
    disc(g,-10+aSin,-26,1.4,L.aura,false);disc(g,8-aSin,-22,1.2,L.aura,false);
    g.restore();
  }

  // 1. Capa trasera
  if(L.cape){
    const fl=mv?Math.sin(ph*0.7)*4.5:Math.sin(t*1.8)*1.5;
    poly(g,[-5,-27,5,-27,3-(mv?9:5)+fl,-4,-10-(mv?7:3)+fl,-3],L.cape);
    g.fillStyle='rgba(0,0,0,0.2)';g.fillRect(-3,-26,2.5,18);
    g.strokeStyle=trim;g.lineWidth=0.7;g.beginPath();g.moveTo(-10+fl,-3);g.lineTo(3+fl,-4);g.stroke();
  }

  // 2. Brazo trasero y escudo
  const bs=mv&&!sw?Math.sin(ph+Math.PI)*0.55:0;
  const backA=-0.2+bs,bshx=-5,bshy=-24;
  lim(g,bshx,bshy,bshx+10*Math.sin(backA),bshy+10*Math.cos(backA),4.4,skin);
  const bhx=bshx+10*Math.sin(backA),bhy=bshy+10*Math.cos(backA);
  // guantelete trasero
  if(L.glove){disc(g,bhx,bhy,2.4,L.glove)}

  if(L.shield){
    // Escudo heráldico curvado
    poly(g,[bhx-6,bhy-9,bhx+8,bhy-9,bhx+6,bhy+6,bhx,bhy+11,bhx-6,bhy+6],L.trim||'#c5a038');
    poly(g,[bhx-4,bhy-7,bhx+6,bhy-7,bhx+4,bhy+4,bhx,bhy+8,bhx-4,bhy+4],body,false);
    disc(g,bhx+1,bhy-1,2.5,'#ffd700');disc(g,bhx+1,bhy-1,1.2,'#ff3a2a',false);
  }

  // 3. Piernas y Grebas
  if(mounted){
    lim(g,-3,-14,-9,-7,5,legc);lim(g,-9,-7,-7,-1,4.4,boot);
    lim(g,3,-14,9,-7,5.4,tint(legc,0.08));lim(g,9,-7,8,-1,4.6,boot);
  }else{
    const s1=mv?Math.sin(ph)*5.5:0,s2=-s1,l1=mv?Math.max(0,Math.cos(ph))*2.6:0,l2=mv?Math.max(0,-Math.cos(ph))*2.6:0;
    // pierna trasera
    lim(g,-3,-14,-3+s2,-3-l2,5,legc);rr(g,-3+s2-3,-3.4-l2,6.8,3.6,1.4,boot);
    // pierna delantera con rodillera
    lim(g,3,-14,3+s1,-3-l1,5.4,tint(legc,0.08));
    disc(g,3+s1*0.5,-8-l1*0.5,2.4,trim); // rodillera reforzada
    rr(g,3+s1-3,-3.4-l1,7.2,3.8,1.4,boot);
    // puntera de acero
    g.fillStyle=trim;g.fillRect(3+s1+1,-3.4-l1+1,2.2,2);
  }

  // 4. Torso y Coraza
  const bw=L.belly?10.5:7.6;
  rr(g,-bw,-28,bw*2,15,4,body);
  // relieve de pechera metálica
  g.fillStyle='rgba(255,255,255,0.18)';g.fillRect(-bw+1.2,-27.5,bw*1.2,3.2);
  g.fillStyle='rgba(0,0,0,0.18)';g.fillRect(-bw+1,-16.5,bw*2-2,2);
  // cinturón de cuero y hebilla dorada con gema
  g.fillStyle='#3a2414';g.fillRect(-bw,-16,bw*2,3);
  rr(g,-2.5,-16.5,5,4,1,trim);
  disc(g,0,-14.5,1,'#ff3b30',false);

  // hombreras / pauldrons en ambos lados
  if(L.pads){
    disc(g,-bw+1,-26,4.6,L.pads);disc(g,-bw+1,-26,2.2,trim,false);
    disc(g,bw-1,-26,4.6,L.pads);disc(g,bw-1,-26,2.2,trim,false);
  }

  // 5. Cabeza y Rostro Expresivo
  const hy=-33.5;
  // orejas
  if(L.ears){poly(g,[-5.5,hy-1,-12,hy-5,-6.5,hy+3],skin);poly(g,[5,hy-1,10,hy-5,6,hy+3],skin)}
  else{disc(g,-6,hy,2,skin,false);disc(g,6,hy,2,skin,false)}
  
  // cabeza base
  disc(g,0,hy,6.8,skin);
  g.fillStyle='rgba(255,255,255,0.22)';g.beginPath();g.ellipse(-1.8,hy-2.4,3.4,2,0,0,6.283);g.fill();

  // Rostro / Ojos detallados y lindos
  if(L.skel){
    // cráneo de no-muerto
    g.fillStyle='#120f0c';disc(g,2,hy-0.6,2,'#120f0c',false);disc(g,5.4,hy-0.6,1.8,'#120f0c',false);
    disc(g,2.2,hy-0.6,1,L.eye||'#ff3333',false);disc(g,5.5,hy-0.6,1,L.eye||'#ff3333',false);
    g.fillStyle='#120f0c';for(let k=0;k<4;k++)g.fillRect(1.5+k*1.6,hy+3.4,0.7,2);
  }else{
    const ec=L.eye||'#2563eb'; // color de iris
    // rubor suave en mejillas
    g.fillStyle='rgba(255,120,120,0.24)';
    g.beginPath();g.ellipse(1.5,hy+1.8,2,1.2,0,0,6.283);g.ellipse(6.2,hy+1.8,2,1.2,0,0,6.283);g.fill();

    // esclera blanca de ojos
    disc(g,2.2,hy-0.4,1.4,'#ffffff',false);disc(g,5.6,hy-0.4,1.4,'#ffffff',false);
    // iris de color luminoso
    disc(g,2.4,hy-0.3,1.1,ec,false);disc(g,5.8,hy-0.3,1.1,ec,false);
    // pupila oscura
    disc(g,2.5,hy-0.2,0.6,'#09090b',false);disc(g,5.9,hy-0.2,0.6,'#09090b',false);
    // destello especular doble (kawaii / anime sparkle)
    disc(g,2.0,hy-0.7,0.45,'#ffffff',false);disc(g,5.4,hy-0.7,0.45,'#ffffff',false);
    disc(g,2.8,hy,0.25,'#ffffff',false);disc(g,6.2,hy,0.25,'#ffffff',false);

    // pestañas / delineado superior
    g.strokeStyle='#181008';g.lineWidth=0.8;
    g.beginPath();g.moveTo(0.9,hy-1.2);g.quadraticCurveTo(2.3,hy-1.9,3.6,hy-0.9);g.stroke();
    g.beginPath();g.moveTo(4.4,hy-1.2);g.quadraticCurveTo(5.7,hy-1.9,7.0,hy-0.9);g.stroke();

    // cejas expresivas
    g.strokeStyle=L.hair?tint(L.hair,-0.2):'#3a2010';g.lineWidth=0.9;
    g.beginPath();g.moveTo(1.2,hy-2.4);g.lineTo(3.4,hy-2.1);g.moveTo(4.6,hy-2.1);g.lineTo(6.8,hy-2.4);g.stroke();

    // boca con linda sonrisa / determinación
    g.strokeStyle='rgba(140,50,40,0.85)';g.lineWidth=0.8;
    g.beginPath();g.moveTo(3.2,hy+3.2);g.quadraticCurveTo(4.4,hy+4.0,5.6,hy+3.2);g.stroke();
  }

  // barba si aplica
  if(L.beard){
    const bd=[0,3,6.5,10][L.beardLen===undefined?2:L.beardLen];
    g.fillStyle=L.beard;g.beginPath();g.moveTo(-5,hy+1.4);g.quadraticCurveTo(0,hy+1.4+bd*2,6.2,hy+1.4);g.quadraticCurveTo(1,hy+3.6,-5,hy+1.4);g.fill();
    g.strokeStyle=OUT;g.lineWidth=0.8;g.stroke();
  }

  // marcas / cicatrices / runas
  if(L.mark===1){
    // cicatriz heroica
    g.strokeStyle='rgba(180,40,40,0.85)';g.lineWidth=0.9;g.beginPath();g.moveTo(6.4,hy-3.4);g.lineTo(4.6,hy+2.8);g.stroke();
  }else if(L.mark===2){
    // runa arcana dorada
    g.strokeStyle=trim;g.lineWidth=1.2;
    g.beginPath();g.moveTo(3.8,hy-4);g.lineTo(3.8,hy-1.5);g.moveTo(2.6,hy-2.8);g.lineTo(5.0,hy-2.8);g.stroke();
  }

  // colmillos de orco si aplica
  if(L.belly){
    g.fillStyle='#fefae0';g.fillRect(3.2,hy+2.8,1.2,2.4);g.fillRect(5.8,hy+2.8,1.2,2.4);
  }

  // 6. Peinado y Casco
  hairDraw(g,L,hy);
  hatDraw(g,L,hy);

  // 7. Brazo delantero y Arma
  const shx=5,shy=-24;
  let a;
  if(o.cast)a=2.5+Math.sin(t*14)*0.12;
  else if(sw>0)a=2.9-(1-sw)*2.6;
  else a=0.45+(mv?Math.sin(ph)*0.55:Math.sin(t*2)*0.04);
  const fx=shx+10.5*Math.sin(a),fy=shy+10.5*Math.cos(a);

  // brazo delantero
  lim(g,shx,shy,fx,fy,4.8,skin);
  if(L.glove){disc(g,fx,fy,2.6,L.glove)} // guantelete delantero

  const wp=L.weapon;
  if(wp==='bow'){
    lim(g,shx,shy,shx+9,shy+3+(o.cast||sw?-2:0),4.6,skin);
    weaponDraw(g,shx+10,shy+3,0,L,true);
  }else{
    if(wp){
      const wa=o.cast?a+1.7:a+(sw>0?1.15:1.9);
      weaponDraw(g,fx,fy,wa,L,false);
      // arco de corte al atacar
      if(sw>0.05&&(wp==='sword'||wp==='axe'||wp==='club'||wp==='hammer'||wp==='dagger'||wp==='spear')){
        g.strokeStyle='rgba(255,255,255,'+(0.65*sw).toFixed(2)+')';g.lineWidth=2.6;
        g.beginPath();g.arc(fx-2,fy-3,25,-0.6-(1-sw)*1.2,1.0-(1-sw)*1.2);g.stroke();
      }
    }
    if(o.cast||!wp)disc(g,fx,fy,2.5,skin);
  }

  g.restore();
}
