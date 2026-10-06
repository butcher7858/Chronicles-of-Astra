#!/usr/bin/env node
/* Servidor de pruebas que imita lo mínimo de Supabase (Auth + REST + Realtime)
   Uso: node tools/mock-supabase.js [puerto]   — solo para desarrollo/tests. */
const http=require('http'),crypto=require('crypto');
const PORT=+process.argv[2]||8124;
const db={users:{},chars:[],states:{},chat:[]};let chatId=1;
const uid=()=>crypto.randomUUID();
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS'};
function send(res,code,obj){res.writeHead(code,Object.assign({'Content-Type':'application/json'},cors));res.end(obj===undefined?'':JSON.stringify(obj))}
function body(req){return new Promise(r=>{let b='';req.on('data',d=>b+=d);req.on('end',()=>{try{r(b?JSON.parse(b):{})}catch(e){r({})}})})}
function sess(u){return {access_token:'tok_'+u.id,refresh_token:'ref_'+u.id,expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,user:{id:u.id,email:u.email}}}
function authUser(req){const a=(req.headers.authorization||'').replace('Bearer ','');if(!a.startsWith('tok_'))return null;return Object.values(db.users).find(u=>'tok_'+u.id===a)||null}
function filt(rows,q){
  for(const [k,v] of q){
    if(['select','order','limit','on_conflict'].includes(k))continue;
    if(v.startsWith('eq.'))rows=rows.filter(r=>String(r[k])===v.slice(3));
    else if(v==='not.is.null')rows=rows.filter(r=>r[k]!=null);
    else if(v.startsWith('gte.'))rows=rows.filter(r=>String(r[k])>=v.slice(4));
  }
  const ord=q.get('order');
  if(ord){const [f,d]=ord.split(',')[0].split('.');rows=rows.slice().sort((a,b)=>(a[f]>b[f]?1:a[f]<b[f]?-1:0)*(d==='desc'?-1:1))}
  if(q.get('limit'))rows=rows.slice(0,+q.get('limit'));
  return rows;
}
const srv=http.createServer(async(req,res)=>{
  if(req.method==='OPTIONS'){res.writeHead(204,cors);return res.end()}
  const u=new URL(req.url,'http://x'),p=u.pathname,q=u.searchParams;
  if(p==='/auth/v1/signup'){
    const b=await body(req);if(!/@/.test(b.email||''))return send(res,422,{msg:'Unable to validate email address: invalid format'});
    if((b.password||'').length<6)return send(res,422,{msg:'Password should be at least 6 characters.'});
    if(db.users[b.email])return send(res,422,{msg:'User already registered'});
    const us={id:uid(),email:b.email,pw:b.password};db.users[b.email]=us;return send(res,200,sess(us));
  }
  if(p==='/auth/v1/token'){
    const b=await body(req);
    if(q.get('grant_type')==='password'){const us=db.users[b.email];if(!us||us.pw!==b.password)return send(res,400,{error:'invalid_grant',error_description:'Invalid login credentials'});return send(res,200,sess(us))}
    const us=Object.values(db.users).find(x=>'ref_'+x.id===b.refresh_token);if(!us)return send(res,400,{error_description:'Invalid Refresh Token'});return send(res,200,sess(us));
  }
  if(p==='/auth/v1/logout')return send(res,204);
  if(p.startsWith('/rest/v1/')){
    const t=p.slice(9),me=authUser(req);
    if(!me)return send(res,401,{message:'JWT required'});
    if(t==='characters'){
      if(req.method==='GET')return send(res,200,filt(db.chars,q));
      if(req.method==='POST'){
        const b=await body(req);
        if(db.chars.filter(c=>c.user_id===me.id).length>=6)return send(res,403,{code:'42501',message:'new row violates row-level security policy'});
        if(db.chars.some(c=>c.name.toLowerCase()===b.name.toLowerCase()))return send(res,409,{code:'23505',message:'duplicate key value violates unique constraint'});
        const row=Object.assign({id:uid(),x:null,y:null,kills:0,created_at:new Date().toISOString(),last_seen:new Date().toISOString()},b,{user_id:me.id});db.chars.push(row);return send(res,201,[row]);
      }
      if(req.method==='PATCH'){const b=await body(req);for(const r of filt(db.chars,q).filter(c=>c.user_id===me.id))Object.assign(r,b);return send(res,204)}
      if(req.method==='DELETE'){const ids=new Set(filt(db.chars,q).filter(c=>c.user_id===me.id).map(c=>c.id));db.chars=db.chars.filter(c=>!ids.has(c.id));for(const i of ids)delete db.states[i];return send(res,204)}
    }
    if(t==='character_state'){
      if(req.method==='GET')return send(res,200,filt(Object.values(db.states).filter(s=>s.user_id===me.id),q));
      if(req.method==='POST'){const b=await body(req);db.states[b.character_id]=Object.assign(db.states[b.character_id]||{},b);return send(res,201)}
    }
    if(t==='chat_messages'){
      if(req.method==='GET')return send(res,200,filt(db.chat,q));
      if(req.method==='POST'){const b=await body(req);db.chat.push(Object.assign({id:chatId++,user_id:me.id,created_at:new Date().toISOString()},b));return send(res,201)}
    }
  }
  if(p==='/__db'){return send(res,200,{chars:db.chars.length,states:Object.keys(db.states).length,chat:db.chat.length})}
  send(res,404,{message:'not found'});
});

/* ---- WebSocket mínimo (RFC 6455) con protocolo Phoenix ---- */
const socks=new Set();
function wsSend(s,obj){
  const d=Buffer.from(JSON.stringify(obj)),n=d.length;let h;
  if(n<126)h=Buffer.from([0x81,n]);else if(n<65536){h=Buffer.alloc(4);h[0]=0x81;h[1]=126;h.writeUInt16BE(n,2)}else{h=Buffer.alloc(10);h[0]=0x81;h[1]=127;h.writeBigUInt64BE(BigInt(n),2)}
  try{s.write(Buffer.concat([h,d]))}catch(e){}
}
srv.on('upgrade',(req,s)=>{
  const key=req.headers['sec-websocket-key'];
  s.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64')+'\r\n\r\n');
  s.pk=null;s.meta=null;s.topic=null;let buf=Buffer.alloc(0);
  const leave=()=>{if(!socks.has(s))return;socks.delete(s);if(s.pk)for(const o of socks)if(o.topic===s.topic)wsSend(o,{topic:s.topic,event:'presence_diff',payload:{joins:{},leaves:{[s.pk]:{metas:[s.meta]}}},ref:null})};
  s.on('data',d=>{
    buf=Buffer.concat([buf,d]);
    for(;;){
      if(buf.length<2)return;
      const op=buf[0]&15;let len=buf[1]&127,off=2;
      if(len===126){if(buf.length<4)return;len=buf.readUInt16BE(2);off=4}else if(len===127){if(buf.length<10)return;len=Number(buf.readBigUInt64BE(2));off=10}
      const masked=buf[1]&128;if(masked)off+=4;if(buf.length<off+len)return;
      let pl=buf.subarray(off,off+len);if(masked){const m=buf.subarray(off-4,off);pl=Buffer.from(pl.map((b,i)=>b^m[i%4]))}
      buf=buf.subarray(off+len);
      if(op===8){leave();s.end();return}
      if(op!==1)continue;
      let m;try{m=JSON.parse(pl.toString())}catch(e){continue}
      if(m.event==='heartbeat'){wsSend(s,{topic:'phoenix',event:'phx_reply',payload:{status:'ok',response:{}},ref:m.ref});continue}
      if(m.event==='phx_join'){
        s.topic=m.topic;s.pk=(m.payload.config.presence||{}).key;socks.add(s);
        wsSend(s,{topic:m.topic,event:'phx_reply',payload:{status:'ok',response:{}},ref:m.ref});
        const st={};for(const o of socks)if(o!==s&&o.topic===m.topic&&o.meta)st[o.pk]={metas:[o.meta]};
        wsSend(s,{topic:m.topic,event:'presence_state',payload:st,ref:null});
      }else if(m.event==='presence'&&m.payload.event==='track'){
        s.meta=m.payload.payload;
        for(const o of socks)if(o!==s&&o.topic===s.topic)wsSend(o,{topic:s.topic,event:'presence_diff',payload:{joins:{[s.pk]:{metas:[s.meta]}},leaves:{}},ref:null});
      }else if(m.event==='broadcast'){
        for(const o of socks)if(o!==s&&o.topic===s.topic)wsSend(o,{topic:s.topic,event:'broadcast',payload:m.payload,ref:null});
      }
    }
  });
  s.on('close',leave);s.on('error',leave);
});
srv.listen(PORT,()=>console.log('mock-supabase en :'+PORT));
