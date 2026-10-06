import crypto from 'node:crypto';
import { adminDb } from '../_lib/firebaseAdmin.js';

function rawBody(req){
  return new Promise((resolve,reject)=>{let d='';req.on('data',c=>d+=c);req.on('end',()=>resolve(d));req.on('error',reject);});
}
function validSig(raw,req){
  const secret=process.env.PAYMENT_WEBHOOK_SECRET;
  if(!secret) return false;
  const got=req.headers['x-webhook-signature']||req.headers['x-signature']||'';
  const hex=crypto.createHmac('sha256',secret).update(raw).digest('hex');
  const a=Buffer.from(String(got).replace(/^sha256=/,'')); const b=Buffer.from(hex);
  return a.length===b.length && crypto.timingSafeEqual(a,b);
}
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end();
  const raw=await rawBody(req);
  if(!validSig(raw,req)) return res.status(401).json({ok:false,error:'Invalid webhook signature'});
  try{
    const p=JSON.parse(raw); const id=p.external_id||p.reference||p.invoice_id; const status=String(p.status||p.payment_status||'').toUpperCase(); const amount=Number(p.amount||p.paid_amount||0);
    if(!id) return res.status(400).json({ok:false,error:'Missing transaction id'});
    const ref=adminDb.collection('deposits').doc(id); const snap=await ref.get(); if(!snap.exists) return res.status(404).json({ok:false,error:'Deposit not found'});
    const dep=snap.data();
    if(dep.status==='paid') return res.json({ok:true,replayed:true});
    if(amount!==Number(dep.amount)) return res.status(400).json({ok:false,error:'Amount mismatch'});
    const paid=['PAID','SUCCESS','SETTLED','COMPLETED'].includes(status);
    if(!paid) return res.json({ok:true,ignored:true,status});
    await adminDb.runTransaction(async tx=>{
      const d=await tx.get(ref); if(!d.exists) throw new Error('Deposit missing'); const cur=d.data(); if(cur.status==='paid') return;
      const uref=adminDb.collection('users').doc(cur.userId); const u=await tx.get(uref); if(!u.exists) throw new Error('User missing');
      tx.update(uref,{balance:Number(u.data().balance||0)+Number(cur.amount)});
      tx.update(ref,{status:'paid',paidAt:new Date().toISOString(),webhook:p});
    });
    res.json({ok:true,credited:true});
  }catch(e){res.status(500).json({ok:false,error:e.message})}
}
