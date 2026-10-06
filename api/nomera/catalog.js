import { nomera } from '../_lib/nomera.js';
import { method } from '../_lib/http.js';
export default async function handler(req,res){ if(!method(req,res,'GET')) return; try{res.json(await nomera.catalog())}catch(e){res.status(e.statusCode||500).json({ok:false,error:e.message,details:e.details})} }
