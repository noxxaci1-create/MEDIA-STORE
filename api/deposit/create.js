import { requireUser } from "../_lib/auth.js";
import { adminDb } from "../_lib/firebaseAdmin.js";
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }
  try {
    const user = await requireUser(req);
    const amount = Number(req.body?.amount);
    if (!Number.isSafeInteger(amount) || amount < 5000) {
      return res.status(400).json({
        ok: false,
        error: "Minimal deposit Rp 5.000."
      });
    }
    const endpoint = process.env.PAYMENT_CREATE_URL;
    const key = process.env.PAYMENT_API_KEY;
    const appUrl = process.env.APP_URL;
    if (!endpoint || !key || !appUrl) {
      return res.status(500).json({
        ok: false,
        error: "Konfigurasi gateway belum lengkap."
      });
    }
    const id = `dep_${user.uid}_${Date.now()}`;
    const ref = adminDb.collection("deposits").doc(id);
    await ref.create({
      id,
      userId: user.uid,
      amount,
      status: "pending",
      provider: "sayabayar",
      createdAt: new Date().toISOString()
    });
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        external_id: id,
        reference: id,
        amount,
        description: `Deposit SULFA MEDIA STORE ${id}`,
        webhook_url: `${appUrl.replace(/\/$/, "")}/api/webhooks/payment`
      })
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
    if (!response.ok || !data) {
      await ref.update({
        providerError: true,
        updatedAt: new Date().toISOString()
      });
      return res.status(502).json({
        ok: false,
        error: "Gateway gagal membuat pembayaran. Periksa dashboard provider."
      });
    }
    await ref.update({
      providerResponse: data,
      updatedAt: new Date().toISOString()
    });
    return res.status(200).json({
      ok: true,
      depositId: id,
      data
    });
  } catch (error) {
    console.error("Deposit creation failed:", error.message);
    return res.status(error.statusCode || 500).json({
      ok: false,
      error: "Deposit gagal dibuat. Silakan coba lagi."
    });
  }
}
