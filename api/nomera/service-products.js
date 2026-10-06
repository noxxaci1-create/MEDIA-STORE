import { nomera } from "../_lib/nomera.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const serviceId = req.query?.serviceId;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        error: "serviceId wajib diisi"
      });
    }

    const data = await nomera.serviceProducts(serviceId);

    return res.status(200).json({
      success: data?.success === true,
      items: Array.isArray(data?.items) ? data.items : []
    });

  } catch (error) {
    console.error("Service products error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      error: "Gagal mengambil pilihan layanan"
    });
  }
}
