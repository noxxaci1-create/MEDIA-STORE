export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const { amount, customer_name, customer_email } = req.body || {};

    const nominal = Number(amount);

    // Minimum deposit
    if (!Number.isInteger(nominal) || nominal < 1000) {
      return res.status(400).json({
        success: false,
        error: "Minimum deposit Rp1.000",
      });
    }

    const apiKey = process.env.SAYABAYAR_API_KEY;

    if (!apiKey) {
      console.error("SAYABAYAR_API_KEY tidak ditemukan");

      return res.status(500).json({
        success: false,
        error: "Konfigurasi payment server belum lengkap",
      });
    }

    const response = await fetch(
      "https://api.sayabayar.com/v1/invoices",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({
          customer_name: customer_name || "Customer Sulfa Media Store",
          customer_email: customer_email || "customer@sulfamediastore.com",
          amount: nominal,
          description: `Deposit Saldo Sulfa Media Store Rp${nominal.toLocaleString(
            "id-ID"
          )}`,
          channel_preference: "platform",
          payment_method: "qris",
          expired_minutes: 60,
          redirect_url: "https://sulfa-media-store.vercel.app/saldo",
        }),
      }
    );

    const data = await response.json();

    console.log("SayaBayar response:", data);

    if (!response.ok || !data.success) {
      return res.status(response.status || 500).json({
        success: false,
        error:
          data?.error?.message ||
          data?.message ||
          "Gagal membuat invoice SayaBayar",
      });
    }

    const invoice = data.data;

    return res.status(201).json({
      success: true,

      data: {
        id: invoice.id,
        invoice_number: invoice.invoice_number,

        amount: invoice.amount,
        amount_to_pay: invoice.amount_to_pay,
        unique_code: invoice.unique_code,

        status: invoice.status,
        expired_at: invoice.expired_at,

        payment_url: invoice.payment_url,

        payment_channel: invoice.payment_channel
          ? {
              channel_type: invoice.payment_channel.channel_type,
              channel_owner: invoice.payment_channel.channel_owner,
              account_name: invoice.payment_channel.account_name,
              amount_to_pay: invoice.payment_channel.amount_to_pay,
              qris_string: invoice.payment_channel.qris_string,
              expired_at: invoice.payment_channel.expired_at,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("CREATE INVOICE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Terjadi kesalahan saat membuat invoice",
    });
  }
}
