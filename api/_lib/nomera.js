const BASE = (process.env.NOMERA_BASE_URL || 'https://nomera.cloud/api/v1').replace(/\/$/, '');

async function call(path, options = {}) {
  const key = process.env.NOMERA_API_KEY;
  if (!key) throw new Error('NOMERA_API_KEY belum diatur di Vercel.');
  const headers = {
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {})
  };
  const r = await fetch(`${BASE}${path}`, { ...options, headers });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!r.ok) { const e = new Error(data?.message || data?.error || `Nomera HTTP ${r.status}`); e.statusCode = r.status; e.details = data; throw e; }
  return data;
}
export const nomera = {
  catalog: () => call('/otp/catalog'),
  serviceProducts: (serviceId) => call(`/otp/service-products?serviceId=${encodeURIComponent(serviceId)}`),
  quote: ({serviceId,countryId,offerKey}) => call(`/otp/quote?serviceId=${encodeURIComponent(serviceId)}&countryId=${encodeURIComponent(countryId)}&offerKey=${encodeURIComponent(offerKey)}`),
  createOrder: (body) => call('/otp/create-order', { method:'POST', body:JSON.stringify(body) }),
  myOrders: (mode='active') => call(`/otp/my-orders?mode=${encodeURIComponent(mode)}`),
  order: (id) => call(`/otp/my-order/${encodeURIComponent(id)}`),
  status: (body) => call('/otp/check-order-status', {method:'POST',body:JSON.stringify(body)}),
  cancel: (body) => call('/otp/cancel-order', {method:'POST',body:JSON.stringify(body)}),
  resend: (body) => call('/otp/resend-order', {method:'POST',body:JSON.stringify(body)})
};
