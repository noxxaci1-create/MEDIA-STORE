import { requireUser } from '../_lib/auth.js';
import { nomera } from '../_lib/nomera.js';
import { method } from '../_lib/http.js';
export default async function handler(req,res){ if(!method(req,res,'POST')) return; try{await requireUser(req); res.json(await nomera.resend(req.body||{}))}catch(e){res.status(e.statusCode||500).json({ok:false,error:e.message,details:e.details})} }
