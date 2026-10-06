import { useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";
import "./style.css";

const API = "/api/nomera";

const CS_WHATSAPP = "6283177540442";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

/* =========================================================
   LOGO APLIKASI
========================================================= */

const APP_LOGOS = {
  whatsapp: "https://cdn.simpleicons.org/whatsapp",
  telegram: "https://cdn.simpleicons.org/telegram",
  "instagram-threads": "https://cdn.simpleicons.org/instagram",
  "tiktok-douyin": "https://cdn.simpleicons.org/tiktok",
  facebook: "https://cdn.simpleicons.org/facebook",
  "google-youtube-gmail": "https://cdn.simpleicons.org/google",
  twitter: "https://cdn.simpleicons.org/x",
  discord: "https://cdn.simpleicons.org/discord",
  openai: "https://cdn.simpleicons.org/openai",
  apple: "https://cdn.simpleicons.org/apple",
  microsoft: "https://cdn.simpleicons.org/microsoft",
  amazon: "https://cdn.simpleicons.org/amazon",
  netflix: "https://cdn.simpleicons.org/netflix",
  spotify: "https://cdn.simpleicons.org/spotify",
  snapchat: "https://cdn.simpleicons.org/snapchat",
  tinder: "https://cdn.simpleicons.org/tinder",
  paypal: "https://cdn.simpleicons.org/paypal",
  uber: "https://cdn.simpleicons.org/uber",
  linkedin: "https://cdn.simpleicons.org/linkedin",
  wechat: "https://cdn.simpleicons.org/wechat",
  shopee: "https://cdn.simpleicons.org/shopee",
  line: "https://cdn.simpleicons.org/line",
  viber: "https://cdn.simpleicons.org/viber",
  signal: "https://cdn.simpleicons.org/signal",
  grab: "https://cdn.simpleicons.org/grab",
  gojek: "https://cdn.simpleicons.org/gojek",
  lazada: "https://cdn.simpleicons.org/lazada",
  tokopedia: "https://cdn.simpleicons.org/tokopedia",
  steam: "https://cdn.simpleicons.org/steam",
  roblox: "https://cdn.simpleicons.org/roblox",
  binance: "https://cdn.simpleicons.org/binance",
  coinbase: "https://cdn.simpleicons.org/coinbase",
};

function ServiceLogo({ service }) {
  const src =
    APP_LOGOS[service?.service_code] ||
    service?.logo_url ||
    "https://cdn.simpleicons.org/google";

  return (
    <div className="service-logo">
      <img
        src={src}
        alt={service?.service_name || "Application"}
        onError={(e) => {
          e.currentTarget.src =
            "https://cdn.simpleicons.org/google";
        }}
      />
    </div>
  );
}

/* =========================================================
   ICON
========================================================= */

function Icon({ name }) {
  const icons = {
    home: (
      <>
        <path d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5z" />
        <path d="M9 21v-6h6v6" />
      </>
    ),

    numbers: (
      <>
        <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
        <path d="M9 5.5h6M9 18.5h6" />
      </>
    ),

    wallet: (
      <>
        <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v10A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" />
        <path d="M16 12h5" />
      </>
    ),

    orders: (
      <>
        <path d="M5 3h14v18H5z" />
        <path d="M8 7h8M8 11h8M8 15h5" />
      </>
    ),

    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2.5v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8.1 15a1.7 1.7 0 0 0-1.5-1H6v-2.5h.6a1.7 1.7 0 0 0 1.5-1A1.7 1.7 0 0 0 7.8 9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V6H15v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v2.5h-.1a1.7 1.7 0 0 0-1.5 1Z" />
      </>
    ),

    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4.4 1.6c-.8.8-1.9 1.1-1.9 2.4" />
        <path d="M12 16.5h.01" />
      </>
    ),

    logout: (
      <>
        <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
        <path d="m14 8 4 4-4 4M8 12h10" />
      </>
    ),

    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),

    arrow: <path d="m9 18 6-6-6-6" />,

    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="M18 6 6 18" />
      </>
    ),

    refresh: (
      <>
        <path d="M20 11a8 8 0 0 0-14.7-4M4 5v5h5" />
        <path d="M4 13a8 8 0 0 0 14.7 4M20 19v-5h-5" />
      </>
    ),
  };

  return (
    <span className="icon">
      <svg viewBox="0 0 24 24">
        {icons[name]}
      </svg>
    </span>
  );
}

/* =========================================================
   LOGO SMS
========================================================= */

function Logo() {
  return (
    <div className="brand">
      <div className="brand-mark">SMS</div>

      <div className="brand-text">
        <strong>SULFA</strong>
        <span>MEDIA STORE</span>
      </div>
    </div>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function Login({ goRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
    } catch (err) {
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError(
          "Email atau password salah."
        );
      } else {
        setError(
          "Login gagal. Silakan coba lagi."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <Logo />

        <div className="auth-heading">
          <span>WELCOME BACK</span>
          <h1>Masuk ke akun</h1>
          <p>
            Kelola nomor, saldo, dan pesanan
            kamu dari satu tempat.
          </p>
        </div>

        <form onSubmit={submit}>
          <label>Email</label>

          <input
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button
            className="primary-button full"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="auth-switch">
          Belum punya akun?

          <button onClick={goRegister}>
            Daftar
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REGISTER
========================================================= */

function Register({ goLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nama wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password minimal 6 karakter."
      );
      return;
    }

    if (password !== confirm) {
      setError(
        "Konfirmasi password tidak sama."
      );
      return;
    }

    try {
      setLoading(true);

      const credential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      await updateProfile(
        credential.user,
        {
          displayName: name.trim(),
        }
      );

      await setDoc(
        doc(
          db,
          "users",
          credential.user.uid
        ),
        {
          name: name.trim(),
          email: email.trim(),
          role: "pembeli",
          balance: 0,
          purchaseCount: 0,
          createdAt:
            new Date().toISOString(),
        }
      );
    } catch (err) {
      if (
        err.code ===
        "auth/email-already-in-use"
      ) {
        setError(
          "Email sudah terdaftar."
        );
      } else if (
        err.code === "auth/invalid-email"
      ) {
        setError("Email tidak valid.");
      } else {
        setError(
          "Pendaftaran gagal."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <Logo />

        <div className="auth-heading">
          <span>CREATE ACCOUNT</span>
          <h1>Buat akun baru</h1>
          <p>
            Daftar untuk mulai menggunakan
            Sulfa Media Store.
          </p>
        </div>

        <form onSubmit={submit}>
          <label>Nama</label>

          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Nama kamu"
          />

          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="nama@email.com"
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Minimal 6 karakter"
          />

          <label>Konfirmasi password</label>

          <input
            type="password"
            value={confirm}
            onChange={(e) =>
              setConfirm(e.target.value)
            }
            placeholder="Ulangi password"
          />

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button
            className="primary-button full"
            disabled={loading}
          >
            {loading
              ? "Membuat akun..."
              : "Daftar"}
          </button>
        </form>

        <div className="auth-switch">
          Sudah punya akun?

          <button onClick={goLogin}>
            Masuk
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SERVICE CARD
========================================================= */

function ServiceCard({ service, onClick }) {
  return (
    <button
      className="service-card"
      onClick={() => onClick(service)}
    >
      <ServiceLogo service={service} />

      <div className="service-info">
        <strong>
          {service.service_name}
        </strong>

        <span>
          Nomor tersedia
        </span>
      </div>

      <span className="card-arrow">
        <Icon name="arrow" />
      </span>
    </button>
  );
}

/* =========================================================
   PRODUCT MODAL
========================================================= */

function ProductModal({
  service,
  onClose,
  onPurchased,
}) {
  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [buying, setBuying] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API}/service-products?serviceId=${service.service_id}`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Produk gagal dimuat."
          );
        }

        if (alive) {
          setProducts(
            data.items ||
              data.products ||
              []
          );
        }
      } catch (err) {
        if (alive) {
          setError(
            err.message ||
              "Produk gagal dimuat."
          );
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [service]);

  const filtered = useMemo(() => {
    const q =
      search.trim().toLowerCase();

    if (!q) return products;

    return products.filter((p) =>
      [
        p.country,
        p.country_name,
        p.package,
        p.package_label,
        p.offer_key,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [products, search]);

  const buy = async (product) => {
    try {
      setBuying(true);
      setError("");

      const response = await fetch(
        `${API}/create-order`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            serviceId:
              service.service_id,

            offerKey:
              product.offer_key,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            "Pembelian gagal."
        );
      }

      onPurchased(data, {
        ...product,
        service_name:
          service.service_name,
        service_code:
          service.service_code,
      });
    } catch (err) {
      setError(
        err.message ||
          "Pembelian gagal."
      );
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="product-modal">
        <div className="modal-header">
          <div className="modal-service">
            <ServiceLogo
              service={service}
            />

            <div>
              <strong>
                {service.service_name}
              </strong>

              <span>
                Pilih negara dan paket
              </span>
            </div>
          </div>

          <button
            className="close-button"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="modal-search">
          <Icon name="search" />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Cari negara atau paket..."
          />
        </div>

        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="modal-empty">
            Memuat produk...
          </div>
        ) : (
          <div className="product-list">
            {filtered.map(
              (product, index) => {
                const available =
                  Number(
                    product.available || 0
                  );

                const canBuy =
                  available > 0;

                return (
                  <div
                    className="product-row"
                    key={
                      product.offer_key ||
                      index
                    }
                  >
                    <div className="product-main">
                      <strong>
                        {product.country_name ||
                          product.country}
                      </strong>

                      <span>
                        {product.package_label ||
                          product.package}
                      </span>
                    </div>

                    <div className="product-stock">
                      {available.toLocaleString(
                        "id-ID"
                      )}{" "}
                      tersedia
                    </div>

                    <strong className="product-price">
                      {rupiah(
                        product.price
                      )}
                    </strong>

                    <button
                      className="buy-button"
                      disabled={
                        !canBuy ||
                        buying
                      }
                      onClick={() =>
                        buy(product)
                      }
                    >
                      {buying
                        ? "..."
                        : canBuy
                        ? "Beli"
                        : "Habis"}
                    </button>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ORDERS
========================================================= */

function Orders({ refreshKey }) {
  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [selected, setSelected] =
    useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API}/my-orders`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error();
      }

      setOrders(
        data.orders ||
          data.items ||
          []
      );
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [refreshKey]);

  return (
    <div className="page">
      <div className="page-intro">
        <span>ORDERS</span>

        <h2>Pesanan saya</h2>

        <p>
          Nomor dan kode yang sudah
          kamu beli.
        </p>
      </div>

      {loading ? (
        <div className="empty-box">
          Memuat pesanan...
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-box">
          Belum ada pesanan.
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(
            (order, index) => (
              <OrderCard
                key={
                  order.order_id ||
                  order.id ||
                  index
                }
                order={order}
                onOpen={() =>
                  setSelected(order)
                }
              />
            )
          )}
        </div>
      )}

      {selected && (
        <OrderDetail
          order={selected}
          onClose={() =>
            setSelected(null)
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   ORDER CARD
========================================================= */

function OrderCard({
  order,
  onOpen,
}) {
  const status =
    String(
      order.status ||
        order.order_status ||
        "PROCESSING"
    ).toUpperCase();

  const success =
    status === "SUCCESS" ||
    status === "COMPLETED";

  return (
    <button
      className="order-card"
      onClick={onOpen}
    >
      <div className="order-app">
        <div className="mini-app-logo">
          {order.service_code ? (
            <img
              src={
                APP_LOGOS[
                  order.service_code
                ] ||
                "https://cdn.simpleicons.org/google"
              }
              alt=""
            />
          ) : (
            "N"
          )}
        </div>

        <div>
          <strong>
            {order.service_name ||
              order.service ||
              "Nomor"}
          </strong>

          <span>
            {order.number ||
              order.phone ||
              "Nomor sedang diproses"}
          </span>
        </div>
      </div>

      <div className="order-status-area">
        <span
          className={
            success
              ? "status success"
              : "status"
          }
        >
          {status}
        </span>

        <Icon name="arrow" />
      </div>
    </button>
  );
}

/* =========================================================
   ORDER DETAIL + OTP
========================================================= */

function OrderDetail({
  order,
  onClose,
}) {
  const [data, setData] =
    useState(order);

  const [loading, setLoading] =
    useState(false);

  const status = String(
    data.status ||
      data.order_status ||
      "PROCESSING"
  ).toUpperCase();

  const refresh = async () => {
    const orderId =
      data.order_id ||
      data.id;

    if (!orderId) return;

    try {
      setLoading(true);

      const response =
        await fetch(
          `${API}/order?orderId=${encodeURIComponent(
            orderId
          )}`
        );

      const result =
        await response.json();

      if (response.ok) {
        setData((old) => ({
          ...old,
          ...result.order,
          ...result,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const activeStatuses = [
      "CREATE_PENDING",
      "WAITING_OTP",
      "SMS_RECEIVED",
    ];

    if (
      !activeStatuses.includes(status)
    ) {
      return;
    }

    const timer = setInterval(
      refresh,
      5000
    );

    return () =>
      clearInterval(timer);
  }, [status, data.order_id]);

  const otp =
    data.otp?.code ||
    data.otp_code ||
    data.code ||
    "";

  const number =
    data.number ||
    data.phone ||
    data.phone_number ||
    "";

  return (
    <div className="modal-overlay">
      <div className="order-detail">
        <div className="modal-header">
          <div>
            <span className="detail-label">
              ORDER DETAIL
            </span>

            <h3>
              {data.service_name ||
                "Pesanan"}
            </h3>
          </div>

          <button
            className="close-button"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="detail-body">
          <div className="detail-status">
            <span>Status</span>

            <strong>
              {status}
            </strong>
          </div>

          {number && (
            <div className="number-box">
              <span>Nomor</span>

              <strong>
                {number}
              </strong>
            </div>
          )}

          {status ===
            "WAITING_OTP" && (
            <div className="waiting-box">
              <div className="spinner" />

              <strong>
                Menunggu kode SMS
              </strong>

              <p>
                Sistem sedang menunggu
                SMS dari provider.
              </p>
            </div>
          )}

          {status ===
            "SMS_RECEIVED" && (
            <div className="otp-box">
              <span>
                KODE DITERIMA
              </span>

              {otp ? (
                <strong>
                  {otp}
                </strong>
              ) : (
                <p>
                  SMS sudah diterima,
                  kode sedang diproses.
                </p>
              )}
            </div>
          )}

          {(status === "SUCCESS" ||
            status === "COMPLETED") &&
            otp && (
              <div className="otp-box success">
                <span>
                  KODE OTP
                </span>

                <strong>
                  {otp}
                </strong>

                {data.otp?.message && (
                  <p>
                    {data.otp.message}
                  </p>
                )}
              </div>
            )}

          {status ===
            "CREATE_PENDING" && (
            <div className="waiting-box">
              <div className="spinner" />

              <strong>
                Membuat pesanan
              </strong>

              <p>
                Pesanan sedang diproses.
              </p>
            </div>
          )}

          {status ===
            "CANCELED" && (
            <div className="danger-box">
              Pesanan dibatalkan oleh
              provider.
            </div>
          )}

          {status ===
            "EXPIRED" && (
            <div className="danger-box">
              Pesanan sudah kedaluwarsa.
            </div>
          )}

          <button
            className="secondary-button full"
            onClick={refresh}
            disabled={loading}
          >
            <Icon name="refresh" />

            {loading
              ? "Memperbarui..."
              : "Perbarui Status"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DEPOSIT
========================================================= */

function Deposit() {
  const [amount, setAmount] =
    useState("");

  const [payment, setPayment] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [checking, setChecking] =
    useState(false);

  const [error, setError] =
    useState("");

  const createPayment = async () => {
    setError("");

    const nominal =
      Number(amount);

    if (
      !nominal ||
      nominal < 1000
    ) {
      setError(
        "Minimum deposit adalah Rp1.000."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          "/api/deposit/create",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              amount: nominal,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        data.success === false
      ) {
        throw new Error(
          data.message ||
            "Deposit gagal dibuat."
        );
      }

      setPayment(data);
    } catch (err) {
      setError(
        err.message ||
          "Deposit gagal."
      );
    } finally {
      setLoading(false);
    }
  };

  const checkPayment = async () => {
    if (!payment?.depositId) {
      return;
    }

    try {
      setChecking(true);

      const response =
        await fetch(
          `/api/deposit/status?depositId=${encodeURIComponent(
            payment.depositId
          )}`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Status gagal dicek."
        );
      }

      setPayment((old) => ({
        ...old,
        ...data,
      }));
    } catch (err) {
      setError(
        err.message ||
          "Gagal mengecek pembayaran."
      );
    } finally {
      setChecking(false);
    }
  };

  const paid =
    payment?.paid === true ||
    ["PAID", "SUCCESS", "SETTLED"].includes(
      String(
        payment?.status || ""
      ).toUpperCase()
    );

  return (
    <div className="page">
      <div className="page-intro">
        <span>WALLET</span>

        <h2>Isi saldo</h2>

        <p>
          Minimum deposit Rp1.000.
        </p>
      </div>

      <div className="deposit-layout">
        <div className="deposit-card">
          <label>
            Nominal deposit
          </label>

          <div className="amount-input">
            <span>Rp</span>

            <input
              type="number"
              min="1000"
              step="1000"
              placeholder="1000"
              value={amount}
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
            />
          </div>

          <div className="quick-amounts">
            {[1000, 5000, 10000, 20000].map(
              (v) => (
                <button
                  key={v}
                  onClick={() =>
                    setAmount(
                      String(v)
                    )
                  }
                >
                  {rupiah(v)}
                </button>
              )
            )}
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button
            className="primary-button full"
            onClick={createPayment}
            disabled={loading}
          >
            {loading
              ? "Membuat QRIS..."
              : "Bayar dengan QRIS"}
          </button>
        </div>

        {payment && (
          <div className="qris-card">
            <div className="qris-header">
              <div>
                <span>
                  PAYMENT
                </span>

                <h3>
                  QRIS
                </h3>
              </div>

              <span
                className={
                  paid
                    ? "payment-status success"
                    : "payment-status"
                }
              >
                {paid
                  ? "Berhasil"
                  : payment.status ||
                    "Menunggu"}
              </span>
            </div>

            {payment.qrImage ||
            payment.qrisImage ||
            payment.qrUrl ? (
              <div className="qris-image">
                <img
                  src={
                    payment.qrImage ||
                    payment.qrisImage ||
                    payment.qrUrl
                  }
                  alt="QRIS"
                />
              </div>
            ) : (
              <div className="qris-placeholder">
                QRIS dari payment gateway
                belum tersedia.
              </div>
            )}

            <div className="qris-total">
              <span>
                Total pembayaran
              </span>

              <strong>
                {rupiah(
                  payment.amount ||
                    amount
                )}
              </strong>
            </div>

            {!paid && (
              <button
                className="secondary-button full"
                onClick={checkPayment}
                disabled={checking}
              >
                <Icon name="refresh" />

                {checking
                  ? "Mengecek..."
                  : "Cek Pembayaran"}
              </button>
            )}

            {paid && (
              <div className="payment-success">
                Pembayaran berhasil.
                Saldo akan diperbarui
                oleh server setelah
                transaksi terverifikasi.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function Settings({ profile }) {
  const [name, setName] =
    useState(profile?.name || "");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const save = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      setLoading(true);

      if (
        name.trim() &&
        name.trim() !== profile?.name
      ) {
        await updateProfile(
          auth.currentUser,
          {
            displayName:
              name.trim(),
          }
        );

        await setDoc(
          doc(
            db,
            "users",
            auth.currentUser.uid
          ),
          {
            name: name.trim(),
          },
          {
            merge: true,
          }
        );
      }

      if (newPassword) {
        if (
          newPassword.length < 6
        ) {
          throw new Error(
            "Password minimal 6 karakter."
          );
        }

        if (
          newPassword !==
          confirmPassword
        ) {
          throw new Error(
            "Konfirmasi password tidak sama."
          );
        }

        await updatePassword(
          auth.currentUser,
          newPassword
        );

        setNewPassword("");
        setConfirmPassword("");
      }

      setMessage(
        "Pengaturan berhasil disimpan."
      );
    } catch (err) {
      setError(
        err.message ||
          "Gagal menyimpan pengaturan."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-intro">
        <span>ACCOUNT</span>

        <h2>Pengaturan</h2>

        <p>
          Kelola informasi akun kamu.
        </p>
      </div>

      <div className="settings-layout">
        <div className="settings-card">
          <div className="settings-profile">
            <div className="large-avatar">
              {(profile?.name ||
                profile?.email ||
                "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {profile?.name ||
                  "Pengguna"}
              </strong>

              <span>
                {profile?.email}
              </span>
            </div>
          </div>

          <form onSubmit={save}>
            <label>
              Nama
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
            />

            <label>
              Email
            </label>

            <input
              value={
                profile?.email || ""
              }
              disabled
            />

            <label>
              Password baru
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              placeholder="Kosongkan jika tidak diubah"
            />

            <label>
              Konfirmasi password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Ulangi password baru"
            />

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            {message && (
              <div className="form-success">
                {message}
              </div>
            )}

            <button
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Menyimpan..."
                : "Simpan Perubahan"}
            </button>
          </form>
        </div>

        <div className="settings-card">
          <span className="settings-label">
            SUPPORT
          </span>

          <h3>
            Butuh bantuan?
          </h3>

          <p>
            Hubungi customer service
            Sulfa Media Store melalui
            WhatsApp.
          </p>

          <a
            className="whatsapp-button"
            href={`https://wa.me/${CS_WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
          >
            Chat WhatsApp
          </a>

          <div className="cs-number">
            0831 7754 0442
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HOME
========================================================= */

function Home({
  services,
  balance,
  setPage,
  openService,
}) {
  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">
            SULFA MEDIA STORE
          </span>

          <h2>
            Semua kebutuhan nomor
            <br />
            dalam satu tempat.
          </h2>

          <p>
            Pilih aplikasi, negara, dan
            paket nomor yang tersedia.
          </p>

          <button
            className="primary-button hero-button"
            onClick={() =>
              setPage("numbers")
            }
          >
            Jelajahi Nomor
            <Icon name="arrow" />
          </button>
        </div>

        <div className="hero-orbit">
          <div />
          <div />
          <div />
        </div>
      </section>

      <div className="home-balance">
        <div>
          <span>
            Saldo tersedia
          </span>

          <strong>
            {rupiah(balance)}
          </strong>
        </div>

        <button
          onClick={() =>
            setPage("deposit")
          }
        >
          Isi Saldo
        </button>
      </div>

      <section className="section">
        <div className="section-heading">
          <div>
            <span>PLATFORM</span>
            <h2>
              Pilih aplikasi
            </h2>
          </div>

          <button
            className="text-button"
            onClick={() =>
              setPage("numbers")
            }
          >
            Lihat semua
            <Icon name="arrow" />
          </button>
        </div>

        <div className="service-grid">
          {services
            .slice(0, 8)
            .map((service) => (
              <ServiceCard
                key={
                  service.service_id
                }
                service={service}
                onClick={openService}
              />
            ))}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   NUMBERS
========================================================= */

function Numbers({
  services,
  openService,
}) {
  const [search, setSearch] =
    useState("");

  const filtered = useMemo(() => {
    const q =
      search.trim().toLowerCase();

    if (!q) return services;

    return services.filter(
      (s) =>
        s.service_name
          .toLowerCase()
          .includes(q)
    );
  }, [services, search]);

  return (
    <div className="page">
      <div className="page-intro">
        <span>CATALOG</span>

        <h2>
          Nomor aplikasi
        </h2>

        <p>
          Cari aplikasi yang kamu
          butuhkan.
        </p>
      </div>

      <div className="search-box">
        <Icon name="search" />

        <input
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="Cari WhatsApp, Telegram, TikTok..."
        />
      </div>

      <div className="service-grid">
        {filtered.map((service) => (
          <ServiceCard
            key={
              service.service_id
            }
            service={service}
            onClick={openService}
          />
        ))}
      </div>

      {!filtered.length && (
        <div className="empty-box">
          Aplikasi tidak ditemukan.
        </div>
      )}
    </div>
  );
}

/* =========================================================
   HELP
========================================================= */

function Help() {
  return (
    <div className="page">
      <div className="page-intro">
        <span>SUPPORT</span>

        <h2>
          Bantuan
        </h2>

        <p>
          Informasi penggunaan
          Sulfa Media Store.
        </p>
      </div>

      <div className="help-grid">
        <div className="help-card">
          <h3>
            Pembelian
          </h3>

          <p>
            Pilih aplikasi, pilih
            negara dan paket, lalu
            tekan tombol Beli.
          </p>
        </div>

        <div className="help-card">
          <h3>
            Menunggu OTP
          </h3>

          <p>
            Setelah nomor berhasil
            dibuat, buka pesanan
            untuk melihat status
            SMS.
          </p>
        </div>

        <div className="help-card">
          <h3>
            Customer Service
          </h3>

          <p>
            Jika mengalami masalah,
            hubungi CS melalui
            WhatsApp.
          </p>

          <a
            className="help-link"
            href={`https://wa.me/${CS_WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
          >
            0831 7754 0442
          </a>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  page,
  setPage,
  balance,
  profile,
  logout,
}) {
  const menus = [
    ["home", "Beranda", "home"],
    ["numbers", "Nomor", "numbers"],
    ["wallet", "Saldo", "deposit"],
    ["orders", "Pesanan", "orders"],
    ["settings", "Pengaturan", "settings"],
    ["help", "Bantuan", "help"],
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Logo />
      </div>

      <div className="balance-box">
        <span>
          Saldo
        </span>

        <strong>
          {rupiah(balance)}
        </strong>
      </div>

      <nav className="sidebar-nav">
        {menus.map(
          ([icon, label, target]) => (
            <button
              key={target}
              className={
                page === target
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() =>
                setPage(target)
              }
            >
              <Icon name={icon} />

              <span>
                {label}
              </span>
            </button>
          )
        )}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-box">
          <div className="user-avatar">
            {(profile?.name ||
              profile?.email ||
              "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="user-data">
            <strong>
              {profile?.name ||
                "Pengguna"}
            </strong>

            <span>
              {profile?.email}
            </span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          <Icon name="logout" />
          Logout
        </button>
      </div>
    </aside>
  );
}

/* =========================================================
   HEADER
========================================================= */

function Header({
  title,
  balance,
}) {
  return (
    <header className="topbar">
      <div>
        <span>
          SULFA MEDIA STORE
        </span>

        <h1>
          {title}
        </h1>
      </div>

      <div className="header-balance">
        <span>
          Saldo
        </span>

        <strong>
          {rupiah(balance)}
        </strong>
      </div>
    </header>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [user, setUser] =
    useState(null);

  const [profile, setProfile] =
    useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [authPage, setAuthPage] =
    useState("login");

  const [page, setPage] =
    useState("home");

  const [services, setServices] =
    useState([]);

  const [balance, setBalance] =
    useState(0);

  const [selectedService, setSelectedService] =
    useState(null);

  const [ordersRefresh, setOrdersRefresh] =
    useState(0);

  const [catalogLoading, setCatalogLoading] =
    useState(true);

  /* AUTH */

  useEffect(() => {
    return onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
      }
    );
  }, []);

  /* PROFILE */

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setBalance(0);
      return;
    }

    const ref = doc(
      db,
      "users",
      user.uid
    );

    return onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.exists()) {
          return;
        }

        const data =
          snapshot.data();

        setProfile({
          ...data,
          email: user.email,
        });

        setBalance(
          Number(
            data.balance || 0
          )
        );
      }
    );
  }, [user]);

  /* CATALOG */

  useEffect(() => {
    if (!user) return;

    let alive = true;

    const loadCatalog = async () => {
      try {
        setCatalogLoading(true);

        const response =
          await fetch(
            `${API}/catalog`
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error();
        }

        if (alive) {
          setServices(
            data.services || []
          );
        }
      } catch {
        if (alive) {
          setServices([]);
        }
      } finally {
        if (alive) {
          setCatalogLoading(false);
        }
      }
    };

    loadCatalog();

    return () => {
      alive = false;
    };
  }, [user]);

  /* LOGOUT */

  const logout = async () => {
    await signOut(auth);

    setPage("home");
    setSelectedService(null);
    setProfile(null);
    setBalance(0);
  };

  const purchaseSuccess = () => {
    setSelectedService(null);
    setOrdersRefresh(
      (value) => value + 1
    );
    setPage("orders");
  };

  if (authLoading) {
    return (
      <div className="screen-loading">
        <Logo />
        <span>
          Memuat...
        </span>
      </div>
    );
  }

  if (!user) {
    return authPage ===
      "register" ? (
      <Register
        goLogin={() =>
          setAuthPage("login")
        }
      />
    ) : (
      <Login
        goRegister={() =>
          setAuthPage("register")
        }
      />
    );
  }

  const titles = {
    home: "Beranda",
    numbers: "Nomor",
    deposit: "Saldo",
    orders: "Pesanan",
    settings: "Pengaturan",
    help: "Bantuan",
  };

  return (
    <div className="app">
      <Sidebar
        page={page}
        setPage={setPage}
        balance={balance}
        profile={profile}
        logout={logout}
      />

      <main className="main">
        <Header
          title={titles[page]}
          balance={balance}
        />

        {catalogLoading &&
        (page === "home" ||
          page === "numbers") ? (
          <div className="page">
            <div className="empty-box">
              Memuat katalog...
            </div>
          </div>
        ) : (
          <>
            {page === "home" && (
              <Home
                services={services}
                balance={balance}
                setPage={setPage}
                openService={
                  setSelectedService
                }
              />
            )}

            {page === "numbers" && (
              <Numbers
                services={services}
                openService={
                  setSelectedService
                }
              />
            )}

            {page === "deposit" && (
              <Deposit />
            )}

            {page === "orders" && (
              <Orders
                refreshKey={
                  ordersRefresh
                }
              />
            )}

            {page === "settings" && (
              <Settings
                profile={profile}
              />
            )}

            {page === "help" && (
              <Help />
            )}
          </>
        )}
      </main>

      {selectedService && (
        <ProductModal
          service={
            selectedService
          }
          onClose={() =>
            setSelectedService(null)
          }
          onPurchased={
            purchaseSuccess
          }
        />
      )}
    </div>
  );
}
