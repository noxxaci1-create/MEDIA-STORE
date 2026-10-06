import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Ambil raw body untuk verifikasi HMAC
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const rawBody = Buffer.concat(chunks);

    const signature = req.headers["x-webhook-signature"];
    const secret = process.env.SAYABAYAR_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return res.status(401).json({
        error: "Webhook signature/secret missing",
      });
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const signatureBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return res.status(401).json({
        error: "Invalid signature",
      });
    }

    const payload = JSON.parse(rawBody.toString("utf8"));

    console.log("SayaBayar webhook:", payload);

    if (payload.event === "invoice.paid") {
      const invoice = payload.data;

      console.log("PEMBAYARAN BERHASIL");
      console.log("Invoice:", invoice.invoice_number);
      console.log("Nominal:", invoice.amount);

      // NANTI DI SINI KITA HUBUNGKAN FIREBASE
      // supaya saldo user otomatis bertambah.
    }

    if (payload.event === "invoice.expired") {
      console.log("Invoice expired:", payload.data?.invoice_number);
    }

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error("Webhook error:", error);

    return res.status(500).json({
      error: "Webhook processing failed",
    });
  }
}
