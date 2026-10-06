import { requireUser } from '../_lib/auth.js';
import { nomera } from '../_lib/nomera.js';
import { method } from '../_lib/http.js';
import { adminDb } from '../_lib/firebaseAdmin.js';

export default async function handler(req,res){
  if(!method(req,res,'POST')) return;
  try{
    const user=await requireUser(req);
    const body=req.body||{};
    if(!body.serviceId || !body.countryId || !body.offerKey || !body.idempotencyKey) return res.status(400).json({ok:false,error:'serviceId, countryId, offerKey, idempotencyKey wajib.'});
    const profile=await adminDb.collection('users').doc(user.uid).get();
    if(!profile.exists) return res.status(404).json({ok:false,error:'Profil pengguna tidak ditemukan.'});
    const data={...body, customerUid:user.uid};
    const result=await nomera.createOrder(data);
    await adminDb.collection('purchases').doc(body.idempotencyKey).set({
      userId:user.uid, idempotencyKey:body.idempotencyKey, provider:'nomera', providerOrderId:result?.order?.id||result?.orderId||null,
      status:result?.status||'CREATE_PENDING', createdAt:new Date().toISOString(), response:result
    },{merge:true});
    res.json(result);
  }catch(e){res.status(e.statusCode||500).json({ok:false,error:e.message,details:e.details})}
}
