// api/payment/create.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const { amount } = req.body || {};

    if (!amount || Number(amount) < 1000) {
      return res.status(400).json({
        success: false,
        error: "Minimum deposit Rp1.000",
      });
    }

    const apiKey = process.env.SAYABAYAR_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "SAYABAYAR_API_KEY belum diatur di Vercel",
      });
    }

    /*
     * PENTING:
     * Ganti URL dan payload di bawah berdasarkan dokumentasi
     * Create Invoice SayaBayar dari akunmu.
     */

    const response = await fetch(
      "SAYABAYAR_CREATE_INVOICE_ENDPOINT",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          description: "Deposit SULFA MEDIA STORE",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("SayaBayar error:", data);

      return res.status(response.status).json({
        success: false,
        error: data?.message || "Gagal membuat invoice",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Create invoice error:", error);

    return res.status(500).json({
      success: false,
      error: "Terjadi kesalahan server",
    });
  }
}
