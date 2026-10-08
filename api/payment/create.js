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

    if (!Number.isInteger(nominal) || nominal < 1000) {
      return res.status(400).json({
        success: false,
        error: "Minimum deposit Rp1.000",
      });
    }

    const apiKey = process.env.PAYMENT_API_KEY;
    const createUrl =
      process.env.PAYMENT_CREATE_URL ||
      "https://api.sayabayar.com/v1/invoices";

    const appUrl =
      process.env.APP_URL ||
      "https://sulfa-media-store.vercel.app";

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "PAYMENT_API_KEY belum tersedia",
      });
    }

    const response = await fetch(createUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        customer_name:
          customer_name || "Customer Sulfa Media Store",

        customer_email:
          customer_email || "customer@sulfamediastore.com",

        amount: nominal,

        description:
          `Deposit Saldo Sulfa Media Store Rp${nominal.toLocaleString(
            "id-ID"
          )}`,

        channel_preference: "platform",

        payment_method: "qris",

        expired_minutes: 60,

        redirect_url: `${appUrl}/saldo`,
      }),
    });

    const data = await response.json();

    console.log("SayaBayar:", data);

    if (!response.ok || !data.success) {
      return res.status(response.status || 500).json({
        success: false,
        error:
          data?.error?.message ||
          data?.message ||
          "Gagal membuat invoice",
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
        payment_url: invoice.payment_url,
        status: invoice.status,
        expired_at: invoice.expired_at,

        payment_channel: invoice.payment_channel
          ? {
              channel_type:
                invoice.payment_channel.channel_type,

              channel_owner:
                invoice.payment_channel.channel_owner,

              account_name:
                invoice.payment_channel.account_name,

              amount_to_pay:
                invoice.payment_channel.amount_to_pay,

              qris_string:
                invoice.payment_channel.qris_string,

              expired_at:
                invoice.payment_channel.expired_at,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("CREATE PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Server gagal membuat invoice",
    });
  }
}
