import { requireUser } from '../_lib/auth.js';
import { adminDb } from '../_lib/firebaseAdmin.js';
import { requireUser as authUser } from '../_lib/auth.js';

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'Method not allowed'});
  try{
    const user=await authUser(req);
    const amount=Number(req.body?.amount);
    if(!Number.isInteger(amount)||amount<5000) return res.status(400).json({ok:false,error:'Minimal deposit Rp 5.000.'});
    const id=`dep_${user.uid}_${Date.now()}`;
    await adminDb.collection('deposits').doc(id).set({id,userId:user.uid,amount,status:'pending',createdAt:new Date().toISOString(),provider:'sayabayar'});
    const endpoint=process.env.PAYMENT_CREATE_URL;
    const key=process.env.PAYMENT_API_KEY;
    if(!endpoint||!key) return res.status(500).json({ok:false,error:'Payment gateway belum dikonfigurasi. Isi PAYMENT_CREATE_URL dan PAYMENT_API_KEY di Vercel.'});
    const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},body:JSON.stringify({external_id:id,reference:id,amount,description:`Deposit SULFA MEDIA STORE ${id}`,webhook_url:`${process.env.APP_URL}/api/webhooks/payment`})});
    const text=await r.text(); let data; try{data=JSON.parse(text)}catch{data={raw:text}};
    if(!r.ok) return res.status(r.status).json({ok:false,error:data?.message||'Payment provider error',details:data});
    await adminDb.collection('deposits').doc(id).set({providerResponse:data,updatedAt:new Date().toISOString()},{merge:true});
    res.json({ok:true,depositId:id,data});
  }catch(e){res.status(e.statusCode||500).json({ok:false,error:e.message})}
}
