import { nomera } from "../_lib/nomera.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  try {
    const serviceId =
      req.query?.serviceId;

    if (!serviceId) {
      return res.status(400).json({
        ok: false,
        error: "serviceId wajib diisi.",
      });
    }

    const data =
      await nomera.serviceProducts(
        serviceId
      );

    return res.status(200).json(data);

  } catch (error) {
    console.error(
      "Nomera service-products error:",
      error.message
    );

    return res.status(
      error.statusCode || 500
    ).json({
      ok: false,
      error:
        error.message ||
        "Gagal mengambil pilihan layanan.",
      details:
        error.details || null,
    });
  }
}
