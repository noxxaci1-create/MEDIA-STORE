export function method(req, res, expected) {
  if (req.method !== expected) { res.status(405).json({ok:false,error:'Method not allowed'}); return false; }
  return true;
}
export function json(res, data, status=200) { return res.status(status).json(data); }
