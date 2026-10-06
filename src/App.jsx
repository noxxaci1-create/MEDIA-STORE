import { useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";
import "./style.css";

const API_BASE = "/api/nomera";

const formatRupiah = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
};

/* =========================================================
   SERVICE LOGOS
========================================================= */

const SERVICE_LOGOS = {
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

const FALLBACK_LOGO =
  "https://cdn.simpleicons.org/google";

function ServiceLogo({ service }) {
  const src =
    SERVICE_LOGOS[service?.service_code] ||
    service?.logo_url ||
    FALLBACK_LOGO;

  return (
    <div className="service-logo">
      <img
        src={src}
        alt={service?.service_name || "App"}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = FALLBACK_LOGO;
        }}
      />
    </div>
  );
}

/* =========================================================
   SMS LOGO
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
   ICON
========================================================= */

function Icon({ name }) {
  const icons = {
    home: (
      <svg viewBox="0 0 24 24">
        <path d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5z" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),

    number: (
      <svg viewBox="0 0 24 24">
        <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
        <path d="M9 5.5h6M9 18.5h6" />
      </svg>
    ),

    wallet: (
      <svg viewBox="0 0 24 24">
        <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v10A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" />
        <path d="M16 12h5M17 12.5v-1" />
      </svg>
    ),

    orders: (
      <svg viewBox="0 0 24 24">
        <path d="M5 3h14v18H5z" />
        <path d="M8 7h8M8 11h8M8 15h5" />
      </svg>
    ),

    help: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4.4 1.6c-.8.8-1.9 1.1-1.9 2.4" />
        <path d="M12 16.5h.01" />
      </svg>
    ),

    logout: (
      <svg viewBox="0 0 24 24">
        <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
        <path d="M14 8l4 4-4 4M8 12h10" />
      </svg>
    ),

    search: (
      <svg viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 5 5" />
      </svg>
    ),

    arrow: (
      <svg viewBox="0 0 24 24">
        <path d="m9 18 6-6-6-6" />
      </svg>
    ),

    close: (
      <svg viewBox="0 0 24 24">
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    ),

    refresh: (
      <svg viewBox="0 0 24 24">
        <path d="M20 11a8 8 0 0 0-14.7-4M4 5v5h5" />
        <path d="M4 13a8 8 0 0 0 14.7 4M20 19v-5h-5" />
      </svg>
    ),
  };

  return <span className="icon">{icons[name]}</span>;
}

/* =========================================================
   LOGIN
========================================================= */

function Login({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
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
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Akun tidak ditemukan atau password salah.");
      } else if (err.code === "auth/wrong-password") {
        setError("Password salah.");
      } else if (err.code === "auth/invalid-email") {
        setError("Format email tidak valid.");
      } else {
        setError("Login gagal. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <div className="auth-logo">
          <Logo />
        </div>

        <div className="auth-title">
          <h1>Masuk</h1>
          <p>Masuk ke akun Sulfa Media Store</p>
        </div>

        <form onSubmit={handleLogin}>
          <label>Email</label>

          <input
            type="email"
            placeholder="contoh@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && <div className="form-error">{error}</div>}

          <button
            className="primary-button full"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="auth-switch">
          Belum punya akun?

          <button onClick={onRegister}>
            Daftar sekarang
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REGISTER
========================================================= */

function Register({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Nama wajib diisi.");
      return;
    }

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirm) {
      setError("Konfirmasi password tidak sama.");
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

      await setDoc(doc(db, "users", credential.user.uid), {
        name: name.trim(),
        email: email.trim(),
        role: "pembeli",
        balance: 0,
        purchaseCount: 0,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email tersebut sudah terdaftar.");
      } else if (err.code === "auth/invalid-email") {
        setError("Format email tidak valid.");
      } else if (err.code === "auth/weak-password") {
        setError("Password terlalu lemah.");
      } else {
        setError("Pendaftaran gagal. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <div className="auth-logo">
          <Logo />
        </div>

        <div className="auth-title">
          <h1>Buat Akun</h1>
          <p>Daftar untuk mulai menggunakan store</p>
        </div>

        <form onSubmit={handleRegister}>
          <label>Nama</label>

          <input
            type="text"
            placeholder="Nama kamu"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Email</label>

          <input
            type="email"
            placeholder="contoh@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Minimal 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label>Konfirmasi Password</label>

          <input
            type="password"
            placeholder="Ulangi password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          {error && <div className="form-error">{error}</div>}

          <button
            className="primary-button full"
            disabled={loading}
          >
            {loading ? "Membuat akun..." : "Daftar"}
          </button>
        </form>

        <div className="auth-switch">
          Sudah punya akun?

          <button onClick={onLogin}>
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
        <strong>{service.service_name}</strong>
        <span>Nomor tersedia</span>
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
  onPurchase,
}) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!service) return;

    let active = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/service-products?serviceId=${service.service_id}`
        );

        const data = await response.json();

        if (!response.ok || data.success === false) {
          throw new Error(
            data.message || "Produk gagal dimuat."
          );
        }

        if (active) {
          setProducts(data.items || data.products || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || "Produk gagal dimuat."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [service]);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return products;

    return products.filter((item) => {
      return [
        item.country,
        item.country_name,
        item.package_label,
        item.package,
        item.offer_key,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [products, search]);

  const handlePurchase = async (product) => {
    try {
      setBuying(true);
      setError("");

      /*
        API SERVER YANG DIPANGGIL:

        POST /api/nomera/create-order

        {
          serviceId,
          offerKey
        }

        API key Nomera TIDAK diletakkan di browser.
      */

      const response = await fetch(
        `${API_BASE}/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceId: service.service_id,
            offerKey: product.offer_key,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Pembelian gagal."
        );
      }

      onPurchase(data, product);
    } catch (err) {
      setError(
        err.message ||
          "Pembelian gagal. Silakan coba lagi."
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
            <ServiceLogo service={service} />

            <div>
              <strong>{service.service_name}</strong>
              <span>Pilih negara dan paket</span>
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

        {loading && (
          <div className="modal-loading">
            Memuat produk...
          </div>
        )}

        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (
            <div className="modal-empty">
              Produk tidak ditemukan.
            </div>
          )}

        <div className="product-list">
          {filteredProducts.map((product, index) => {
            const available =
              Number(product.available || 0);

            const active =
              product.active !== false &&
              available > 0;

            return (
              <div
                className="product-row"
                key={
                  product.offer_key ||
                  `${product.country}-${index}`
                }
              >
                <div className="product-main">
                  <strong>
                    {product.country_name ||
                      product.country ||
                      "Negara"}
                  </strong>

                  <span>
                    {product.package_label ||
                      product.package ||
                      "Paket"}
                  </span>
                </div>

                <div className="product-stock">
                  {available.toLocaleString("id-ID")}
                  {" "}tersedia
                </div>

                <div className="product-price">
                  {formatRupiah(product.price)}
                </div>

                <button
                  className="buy-button"
                  disabled={!active || buying}
                  onClick={() =>
                    handlePurchase(product)
                  }
                >
                  {buying
                    ? "..."
                    : active
                    ? "Beli"
                    : "Habis"}
                </button>
              </div>
            );
          })}
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
  user,
  onLogout,
}) {
  const menus = [
    ["home", "Beranda", "home"],
    ["number", "Nomor", "numbers"],
    ["wallet", "Saldo", "deposit"],
    ["orders", "Pesanan", "orders"],
    ["help", "Bantuan", "help"],
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Logo />
      </div>

      <div className="balance-box">
        <span>Saldo kamu</span>

        <strong>
          {formatRupiah(balance)}
        </strong>
      </div>

      <nav className="sidebar-nav">
        {menus.map(([icon, label, target]) => (
          <button
            key={target}
            className={
              page === target
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setPage(target)}
          >
            <Icon name={icon} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-box">
          <div className="user-avatar">
            {(user?.name ||
              user?.email ||
              "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="user-data">
            <strong>
              {user?.name || "Pengguna"}
            </strong>

            <span>
              {user?.email || ""}
            </span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={onLogout}
        >
          <Icon name="logout" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

/* =========================================================
   HEADER
========================================================= */

function Header({ title, balance }) {
  return (
    <header className="topbar">
      <div>
        <span className="topbar-label">
          Sulfa Media Store
        </span>

        <h1>{title}</h1>
      </div>

      <div className="topbar-balance">
        <span>Saldo</span>
        <strong>
          {formatRupiah(balance)}
        </strong>
      </div>
    </header>
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
    <div className="page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">
            SULFA MEDIA STORE
          </span>

          <h2>
            Nomor virtual untuk
            <br />
            kebutuhan digital kamu.
          </h2>

          <p>
            Pilih aplikasi, pilih negara,
            lalu pilih nomor yang tersedia.
          </p>

          <button
            className="primary-button"
            onClick={() => setPage("numbers")}
          >
            Lihat Nomor
            <Icon name="arrow" />
          </button>
        </div>

        <div className="hero-decoration">
          <div />
          <div />
          <div />
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span>CATALOG</span>
            <h2>Platform populer</h2>
          </div>

          <button
            className="text-button"
            onClick={() => setPage("numbers")}
          >
            Lihat semua
            <Icon name="arrow" />
          </button>
        </div>

        <div className="service-grid">
          {services.slice(0, 8).map((service) => (
            <ServiceCard
              key={service.service_id}
              service={service}
              onClick={openService}
            />
          ))}
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Saldo</span>
          <strong>{formatRupiah(balance)}</strong>
        </div>

        <div className="stat-card">
          <span>Platform</span>
          <strong>{services.length}</strong>
        </div>

        <div className="stat-card">
          <span>Status</span>
          <strong className="status-online">
            Online
          </strong>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   NUMBERS
========================================================= */

function Numbers({ services, openService }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return services;

    return services.filter((service) =>
      service.service_name
        .toLowerCase()
        .includes(keyword)
    );
  }, [services, search]);

  return (
    <div className="page">
      <div className="page-intro">
        <span>CATALOG</span>

        <h2>Pilih aplikasi</h2>

        <p>
          Pilih aplikasi untuk melihat
          negara dan paket nomor yang tersedia.
        </p>
      </div>

      <div className="search-box">
        <Icon name="search" />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Cari aplikasi..."
        />
      </div>

      <div className="service-grid">
        {filtered.map((service) => (
          <ServiceCard
            key={service.service_id}
            service={service}
            onClick={openService}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-box">
          Aplikasi tidak ditemukan.
        </div>
      )}
    </div>
  );
}

/* =========================================================
   DEPOSIT
========================================================= */

function Deposit({ balance }) {
  const [amount, setAmount] = useState("");

  const [payment, setPayment] = useState(null);

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const [error, setError] = useState("");

  const createDeposit = async () => {
    setError("");

    const nominal = Number(amount);

    if (!nominal || nominal < 5000) {
      setError(
        "Minimum deposit adalah Rp5.000."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/deposit/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: nominal,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            "Deposit gagal dibuat."
        );
      }

      setPayment(data);
    } catch (err) {
      setError(
        err.message ||
          "Deposit gagal dibuat."
      );
    } finally {
      setLoading(false);
    }
  };

  const checkPayment = async () => {
    if (!payment?.depositId) return;

    try {
      setChecking(true);
      setError("");

      const response = await fetch(
        `/api/deposit/status?depositId=${encodeURIComponent(
          payment.depositId
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Status pembayaran gagal dicek."
        );
      }

      if (
        data.status === "PAID" ||
        data.status === "SUCCESS" ||
        data.status === "SETTLED"
      ) {
        setPayment((old) => ({
          ...old,
          paid: true,
          status: data.status,
        }));
      } else {
        setPayment((old) => ({
          ...old,
          status: data.status,
        }));
      }
    } catch (err) {
      setError(
        err.message ||
          "Gagal mengecek pembayaran."
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="page">
      <div className="page-intro">
        <span>WALLET</span>

        <h2>Isi saldo</h2>

        <p>
          Tambahkan saldo untuk membeli
          nomor yang tersedia.
        </p>
      </div>

      <div className="deposit-layout">
        <div className="deposit-card">
          <div className="deposit-balance">
            <span>Saldo saat ini</span>
            <strong>
              {formatRupiah(balance)}
            </strong>
          </div>

          <label>Nominal deposit</label>

          <div className="amount-input">
            <span>Rp</span>

            <input
              type="number"
              min="5000"
              step="1000"
              placeholder="5000"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
            />
          </div>

          <div className="quick-amounts">
            {[5000, 10000, 20000, 50000].map(
              (value) => (
                <button
                  key={value}
                  onClick={() =>
                    setAmount(String(value))
                  }
                >
                  {formatRupiah(value)}
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
            onClick={createDeposit}
            disabled={loading}
          >
            {loading
              ? "Membuat pembayaran..."
              : "Buat Pembayaran QRIS"}
          </button>
        </div>

        {payment && (
          <div className="qris-card">
            <div className="qris-header">
              <div>
                <span>PEMBAYARAN</span>
                <h3>Scan QRIS</h3>
              </div>

              <span
                className={
                  payment.paid
                    ? "payment-status success"
                    : "payment-status"
                }
              >
                {payment.paid
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
                  alt="QRIS pembayaran"
                />
              </div>
            ) : (
              <div className="qris-placeholder">
                QRIS belum tersedia dari
                payment gateway.
              </div>
            )}

            <div className="qris-total">
              <span>Total</span>

              <strong>
                {formatRupiah(
                  payment.amount || amount
                )}
              </strong>
            </div>

            {!payment.paid && (
              <button
                className="secondary-button full"
                onClick={checkPayment}
                disabled={checking}
              >
                <Icon name="refresh" />

                {checking
                  ? "Mengecek..."
                  : "Cek Status Pembayaran"}
              </button>
            )}

            {payment.paid && (
              <div className="payment-success">
                Pembayaran berhasil.
                Saldo akan diperbarui
                setelah server memverifikasi
                transaksi.
              </div>
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

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE}/my-orders`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error();
        }

        if (active) {
          setOrders(
            data.orders ||
              data.items ||
              []
          );
        }
      } catch {
        if (active) {
          setOrders([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOrders();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page">
      <div className="page-intro">
        <span>ORDERS</span>

        <h2>Pesanan saya</h2>

        <p>
          Lihat status pembelian nomor kamu.
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
          {orders.map((order, index) => (
            <div
              className="order-card"
              key={
                order.order_id ||
                order.id ||
                index
              }
            >
              <div>
                <strong>
                  {order.service_name ||
                    order.service ||
                    "Pesanan"}
                </strong>

                <span>
                  {order.phone ||
                    order.number ||
                    "Nomor diproses"}
                </span>
              </div>

              <div className="order-right">
                <strong>
                  {order.status ||
                    "PROCESSING"}
                </strong>

                {order.price && (
                  <span>
                    {formatRupiah(order.price)}
                  </span>
                )}
              </div>
            </div>
          ))}
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

        <h2>Bantuan</h2>

        <p>
          Panduan singkat penggunaan Sulfa
          Media Store.
        </p>
      </div>

      <div className="help-grid">
        <div className="help-card">
          <h3>Bagaimana membeli nomor?</h3>

          <p>
            Buka menu Nomor, pilih aplikasi,
            negara, paket, kemudian tekan Beli.
          </p>
        </div>

        <div className="help-card">
          <h3>Bagaimana isi saldo?</h3>

          <p>
            Buka menu Saldo, masukkan minimal
            Rp5.000, kemudian buat pembayaran
            QRIS.
          </p>
        </div>

        <div className="help-card">
          <h3>Bagaimana melihat pesanan?</h3>

          <p>
            Semua transaksi yang sudah dibuat
            dapat dilihat melalui menu Pesanan.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

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

  const [catalogLoading, setCatalogLoading] =
    useState(true);

  const [catalogError, setCatalogError] =
    useState("");

  const [selectedService, setSelectedService] =
    useState(null);

  /* AUTH */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (firebaseUser) => {
          setUser(firebaseUser);
          setAuthLoading(false);
        }
      );

    return unsubscribe;
  }, []);

  /* FIRESTORE USER */

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setBalance(0);
      return;
    }

    const userRef = doc(
      db,
      "users",
      user.uid
    );

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          setProfile(data);
          setBalance(
            Number(data.balance || 0)
          );
        }
      }
    );

    return unsubscribe;
  }, [user]);

  /* CATALOG */

  useEffect(() => {
    if (!user) return;

    let active = true;

    const loadCatalog = async () => {
      try {
        setCatalogLoading(true);
        setCatalogError("");

        const response = await fetch(
          `${API_BASE}/catalog`
        );

        const data = await response.json();

        if (!response.ok || data.success === false) {
          throw new Error(
            data.message ||
              "Katalog gagal dimuat."
          );
        }

        if (active) {
          setServices(
            data.services || []
          );
        }
      } catch (err) {
        if (active) {
          setCatalogError(
            err.message ||
              "Katalog gagal dimuat."
          );
        }
      } finally {
        if (active) {
          setCatalogLoading(false);
        }
      }
    };

    loadCatalog();

    return () => {
      active = false;
    };
  }, [user]);

  /* LOGOUT */

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setPage("home");
      setProfile(null);
      setBalance(0);
    } catch {
      alert("Logout gagal.");
    }
  };

  /* PURCHASE SUCCESS */

  const handlePurchase = (
    data,
    product
  ) => {
    setSelectedService(null);

    setPage("orders");

    console.log(
      "Order berhasil:",
      data,
      product
    );
  };

  if (authLoading) {
    return (
      <div className="screen-loading">
        <Logo />

        <span>
          Memuat Sulfa Media Store...
        </span>
      </div>
    );
  }

  if (!user) {
    if (authPage === "register") {
      return (
        <Register
          onLogin={() =>
            setAuthPage("login")
          }
        />
      );
    }

    return (
      <Login
        onRegister={() =>
          setAuthPage("register")
        }
      />
    );
  }

  const pageTitles = {
    home: "Beranda",
    numbers: "Nomor",
    deposit: "Saldo",
    orders: "Pesanan",
    help: "Bantuan",
  };

  return (
    <div className="app">
      <Sidebar
        page={page}
        setPage={setPage}
        balance={balance}
        user={{
          ...profile,
          email: user.email,
        }}
        onLogout={handleLogout}
      />

      <main className="main">
        <Header
          title={pageTitles[page]}
          balance={balance}
        />

        {catalogError && (
          <div className="global-error">
            {catalogError}
          </div>
        )}

        {catalogLoading &&
        page !== "deposit" &&
        page !== "orders" &&
        page !== "help" ? (
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
                openService={setSelectedService}
              />
            )}

            {page === "numbers" && (
              <Numbers
                services={services}
                openService={setSelectedService}
              />
            )}

            {page === "deposit" && (
              <Deposit balance={balance} />
            )}

            {page === "orders" && <Orders />}

            {page === "help" && <Help />}
          </>
        )}
      </main>

      {selectedService && (
        <ProductModal
          service={selectedService}
          onClose={() =>
            setSelectedService(null)
          }
          onPurchase={handlePurchase}
        />
      )}
    </div>
  );
}
