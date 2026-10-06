import { useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import "./style.css";

const API_BASE = "/api/nomera";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

/* =========================================================
   SVG LOGO
========================================================= */

function Logo({ compact = false }) {
  return (
    <div className={`sms-logo ${compact ? "compact" : ""}`}>
      <svg
        className="sms-logo-svg"
        viewBox="0 0 80 80"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="2"
          y="2"
          width="76"
          height="76"
          rx="23"
          fill="url(#smsGradient)"
        />

        <path
          d="M22 48.5C22 54.3 26.3 58 32.4 58C38.3 58 41.5 55.2 41.5 51C41.5 46.8 39 44.8 33.7 43.2L30.7 42.3C27.7 41.4 26.5 40.1 26.5 38.1C26.5 35.6 28.6 34 32.1 34C35.5 34 37.7 35.7 38.1 38.6H42.2C41.8 33.6 37.9 30.5 32.1 30.5C26 30.5 22.3 33.5 22.3 38.2C22.3 42.3 24.8 44.7 29.8 46.2L32.8 47.1C36.1 48.1 37.2 49.3 37.2 51.3C37.2 53.7 35.2 55.2 32.2 55.2C28.5 55.2 26.2 53 26.1 49.7H22Z"
          fill="white"
        />

        <path
          d="M45 31V57H49V38L55.2 49.2H58.2L64.5 38V57H68.5V31H64.1L56.8 44.5L49.5 31H45Z"
          fill="white"
        />

        <defs>
          <linearGradient
            id="smsGradient"
            x1="8"
            y1="5"
            x2="73"
            y2="76"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#60A5FA" />
            <stop offset="0.5" stopColor="#2563EB" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
      </svg>

      {!compact && (
        <div className="sms-logo-text">
          <strong>SULFA</strong>
          <span>MEDIA STORE</span>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   GENERIC SVG ICON
========================================================= */

function SvgIcon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    home: (
      <svg {...common}>
        <path d="M3 10.8 12 3l9 7.8" />
        <path d="M5.5 9.8V21h13V9.8" />
        <path d="M9.5 21v-6h5v6" />
      </svg>
    ),

    phone: (
      <svg {...common}>
        <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
        <path d="M10 18h4" />
      </svg>
    ),

    wallet: (
      <svg {...common}>
        <path d="M4 6.5h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
        <path d="M3 7V5.5A2.5 2.5 0 0 1 5.5 3H18" />
        <path d="M16 13h3" />
      </svg>
    ),

    orders: (
      <svg {...common}>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
      </svg>
    ),

    help: (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.7 9a2.5 2.5 0 1 1 4.2 1.8c-1.1.9-1.9 1.2-1.9 2.7" />
        <path d="M12 17h.01" />
      </svg>
    ),

    logout: (
      <svg {...common}>
        <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
        <path d="m14 16 4-4-4-4" />
        <path d="M18 12H9" />
      </svg>
    ),

    arrow: (
      <svg {...common}>
        <path d="M5 12h13" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    ),

    plus: (
      <svg {...common}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),

    close: (
      <svg {...common}>
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    ),

    shield: (
      <svg {...common}>
        <path d="M12 3 20 6v5c0 5.2-3.3 8.5-8 10-4.7-1.5-8-4.8-8-10V6l8-3Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </svg>
    ),

    zap: (
      <svg {...common}>
        <path d="m13 2-8 12h6l-1 8 8-12h-6l1-8Z" />
      </svg>
    ),

    globe: (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.3 2.5 3.4 5.5 3.4 9s-1.1 6.5-3.4 9c-2.3-2.5-3.4-5.5-3.4-9S9.7 5.5 12 3Z" />
      </svg>
    ),
  };

  return icons[name] || icons.globe;
}

/* =========================================================
   SERVICE SVG ICON
========================================================= */

function ServiceLogo({ service }) {
  const code = service?.service_code || "";

  const letters = {
    whatsapp: "W",
    telegram: "T",
    "instagram-threads": "I",
    "tiktok-douyin": "T",
    facebook: "F",
    "google-youtube-gmail": "G",
    twitter: "X",
    discord: "D",
    openai: "AI",
    apple: "A",
    microsoft: "M",
    amazon: "a",
    netflix: "N",
    spotify: "S",
    snapchat: "S",
    tinder: "T",
    paypal: "P",
    uber: "U",
    linkedin: "in",
    wechat: "W",
    shopee: "S",
    line: "L",
    viber: "V",
    signal: "S",
    grab: "G",
    gojek: "G",
    lazada: "L",
    tokopedia: "T",
    steam: "S",
    roblox: "R",
    binance: "B",
    coinbase: "C",
  };

  return (
    <div className={`service-logo service-${code}`}>
      <svg viewBox="0 0 48 48" className="service-svg">
        <rect x="1" y="1" width="46" height="46" rx="14" />

        <text
          x="24"
          y="29"
          textAnchor="middle"
          className="service-svg-text"
        >
          {letters[code] || service?.service_name?.slice(0, 1) || "?"}
        </text>
      </svg>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingScreen() {
  return (
    <div className="screen-loading">
      <div className="loading-orbit">
        <div className="loading-ring" />
        <Logo />
      </div>

      <div className="loading-copy">
        <strong>Menyiapkan SULFA</strong>
        <span>MEDIA STORE</span>

        <div className="loading-progress">
          <i />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   AUTH
========================================================= */

function Login({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("Akun tidak ditemukan.");
      } else if (err.code === "auth/wrong-password") {
        setError("Password salah.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Email atau password salah.");
      } else if (err.code === "auth/invalid-email") {
        setError("Format email tidak valid.");
      } else if (err.code === "auth/too-many-requests") {
        setError(
          "Terlalu banyak percobaan. Coba lagi beberapa saat."
        );
      } else {
        setError("Gagal masuk. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      mode="login"
      title="Masuk ke akun"
      description="Kelola saldo, nomor digital, dan pesanan kamu dalam satu tempat."
      onSwitch={onSwitch}
    >
      <form onSubmit={submit} className="auth-form">
        <AuthInput
          label="Email"
          type="email"
          placeholder="nama@email.com"
          value={email}
          onChange={setEmail}
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="Masukkan password"
          value={password}
          onChange={setPassword}
        />

        {error && <div className="auth-alert">{error}</div>}

        <button
          className="auth-submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="button-spinner" />
              Memproses...
            </>
          ) : (
            <>
              Masuk
              <SvgIcon name="arrow" size={17} />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}

function Register({ onSwitch }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();

    setError("");

    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError("Semua field wajib diisi.");
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

    setLoading(true);

    try {
      const credential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      await updateProfile(credential.user, {
        displayName: name.trim(),
      });

      await setDoc(doc(db, "users", credential.user.uid), {
        name: name.trim(),
        email: email.trim(),
        role: "pembeli",
        balance: 0,
        purchaseCount: 0,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email sudah terdaftar. Silakan masuk.");
      } else if (err.code === "auth/invalid-email") {
        setError("Format email tidak valid.");
      } else if (err.code === "auth/weak-password") {
        setError("Password terlalu lemah.");
      } else {
        setError("Registrasi gagal. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      mode="register"
      title="Buat akun baru"
      description="Daftar sekarang untuk mulai menggunakan SULFA MEDIA STORE."
      onSwitch={onSwitch}
    >
      <form onSubmit={submit} className="auth-form">
        <AuthInput
          label="Nama"
          type="text"
          placeholder="Nama kamu"
          value={name}
          onChange={setName}
        />

        <AuthInput
          label="Email"
          type="email"
          placeholder="nama@email.com"
          value={email}
          onChange={setEmail}
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="Minimal 6 karakter"
          value={password}
          onChange={setPassword}
        />

        <AuthInput
          label="Konfirmasi password"
          type="password"
          placeholder="Ulangi password"
          value={confirm}
          onChange={setConfirm}
        />

        {error && <div className="auth-alert">{error}</div>}

        <button
          className="auth-submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="button-spinner" />
              Membuat akun...
            </>
          ) : (
            <>
              Daftar
              <SvgIcon name="arrow" size={17} />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}

function AuthInput({
  label,
  type,
  placeholder,
  value,
  onChange,
}) {
  return (
    <label className="auth-field">
      <span>{label}</span>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={
          type === "password" ? "current-password" : "email"
        }
      />
    </label>
  );
}

function AuthShell({
  mode,
  title,
  description,
  children,
  onSwitch,
}) {
  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-grid" />
        <div className="auth-glow auth-glow-one" />
        <div className="auth-glow auth-glow-two" />
      </div>

      <div className="auth-container">
        <div className="auth-showcase">
          <Logo />

          <div className="showcase-content">
            <span className="showcase-label">
              DIGITAL NUMBER PLATFORM
            </span>

            <h1>
              Nomor digital.
              <br />
              <span>Lebih praktis.</span>
            </h1>

            <p>
              Platform untuk mengelola layanan nomor digital
              dengan tampilan sederhana, cepat, dan modern.
            </p>

            <div className="showcase-pills">
              <span>
                <SvgIcon name="shield" size={14} />
                Aman
              </span>

              <span>
                <SvgIcon name="zap" size={14} />
                Cepat
              </span>

              <span>
                <SvgIcon name="globe" size={14} />
                Multi layanan
              </span>
            </div>
          </div>

          <div className="showcase-footer">
            SULFA MEDIA STORE
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-mobile-logo">
            <Logo compact />
          </div>

          <div className="auth-card-heading">
            <span>
              {mode === "login" ? "WELCOME BACK" : "GET STARTED"}
            </span>

            <h2>{title}</h2>

            <p>{description}</p>
          </div>

          {children}

          <div className="auth-switch">
            {mode === "login"
              ? "Belum punya akun?"
              : "Sudah punya akun?"}

            <button onClick={onSwitch}>
              {mode === "login" ? "Daftar" : "Masuk"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Auth() {
  const [mode, setMode] = useState("login");

  return mode === "login" ? (
    <Login onSwitch={() => setMode("register")} />
  ) : (
    <Register onSwitch={() => setMode("login")} />
  );
}

/* =========================================================
   SERVICE CARD
========================================================= */

function ServiceCard({ service, onOpen }) {
  return (
    <button
      className="service-card-new"
      onClick={() => onOpen(service)}
    >
      <div className="service-card-glow" />

      <div className="service-card-top-new">
        <ServiceLogo service={service} />

        <span className="service-open">
          <SvgIcon name="arrow" size={15} />
        </span>
      </div>

      <div className="service-card-info-new">
        <span className="service-mini-label">
          DIGITAL SERVICE
        </span>

        <h3>{service.service_name}</h3>

        <p>
          Nomor digital tersedia untuk layanan ini.
        </p>
      </div>

      <div className="service-card-footer-new">
        <span>
          <i />
          Tersedia
        </span>

        <strong>Explore</strong>
      </div>
    </button>
  );
}

/* =========================================================
   PRODUCT MODAL
========================================================= */

const flags = {
  ID: "🇮🇩",
  US: "🇺🇸",
  MY: "🇲🇾",
  SG: "🇸🇬",
  JP: "🇯🇵",
  GB: "🇬🇧",
  CA: "🇨🇦",
  PH: "🇵🇭",
  TH: "🇹🇭",
  VN: "🇻🇳",
  IN: "🇮🇳",
  BR: "🇧🇷",
  MX: "🇲🇽",
  AR: "🇦🇷",
  SA: "🇸🇦",
};

function ProductModal({
  service,
  onClose,
  onSelect,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE}/service-products?serviceId=${service.service_id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Gagal mengambil produk."
          );
        }

        if (mounted) {
          setProducts(
            Array.isArray(data.items) ? data.items : []
          );
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.message || "Gagal mengambil data."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [service.service_id]);

  const grouped = useMemo(() => {
    const map = new Map();

    products.forEach((item) => {
      const key = `${item.country_id}-${item.country_code}`;

      if (!map.has(key)) {
        map.set(key, {
          country_id: item.country_id,
          country_code: item.country_code,
          country_name: item.country_name,
          items: [],
        });
      }

      map.get(key).items.push(item);
    });

    return Array.from(map.values());
  }, [products]);

  return (
    <div
      className="modal-backdrop-new"
      onMouseDown={onClose}
    >
      <div
        className="product-modal-new"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header-new">
          <div className="modal-service-title">
            <ServiceLogo service={service} />

            <div>
              <span>SELECT SERVICE</span>
              <h2>{service.service_name}</h2>
              <p>
                Pilih negara dan paket nomor yang tersedia.
              </p>
            </div>
          </div>

          <button
            className="modal-close-new"
            onClick={onClose}
          >
            <SvgIcon name="close" size={19} />
          </button>
        </div>

        <div className="modal-body-new">
          {loading && (
            <div className="modal-loading-new">
              <div className="spinner-new" />
              <strong>Memuat katalog...</strong>
              <span>Mengambil stok terbaru.</span>
            </div>
          )}

          {!loading && error && (
            <div className="modal-error-new">
              <strong>Gagal memuat produk</strong>
              <span>{error}</span>
            </div>
          )}

          {!loading &&
            !error &&
            grouped.length === 0 && (
              <div className="modal-loading-new">
                <strong>Produk belum tersedia</strong>
                <span>Coba layanan lainnya.</span>
              </div>
            )}

          {!loading &&
            !error &&
            grouped.map((country) => (
              <div
                className="country-group-new"
                key={`${country.country_id}-${country.country_code}`}
              >
                <div className="country-header-new">
                  <div className="country-identity">
                    <div className="country-flag-new">
                      {flags[country.country_code] || "🌐"}
                    </div>

                    <div>
                      <strong>
                        {country.country_name}
                      </strong>

                      <span>
                        {country.country_code}
                      </span>
                    </div>
                  </div>

                  <span className="country-count-new">
                    {country.items.length} paket
                  </span>
                </div>

                <div className="package-list-new">
                  {country.items.map((item) => {
                    const available =
                      Number(item.available || 0);

                    const disabled =
                      !item.active || available <= 0;

                    return (
                      <button
                        className="package-card-new"
                        key={item.offer_key}
                        disabled={disabled}
                        onClick={() =>
                          onSelect(item, service)
                        }
                      >
                        <div className="package-left-new">
                          <span className="package-name-new">
                            {item.package_label}
                          </span>

                          <span className="package-stock-new">
                            {available > 0
                              ? `${available.toLocaleString(
                                  "id-ID"
                                )} tersedia`
                              : "Stok habis"}
                          </span>
                        </div>

                        <div className="package-right-new">
                          <strong>
                            {formatRupiah(item.price)}
                          </strong>

                          <span>
                            <SvgIcon
                              name="arrow"
                              size={14}
                            />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
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
  user,
  balance,
  logout,
}) {
  const menus = [
    {
      id: "home",
      icon: "home",
      label: "Beranda",
    },
    {
      id: "numbers",
      icon: "phone",
      label: "Nomor",
    },
    {
      id: "deposit",
      icon: "wallet",
      label: "Saldo",
    },
    {
      id: "orders",
      icon: "orders",
      label: "Pesanan",
    },
    {
      id: "help",
      icon: "help",
      label: "Bantuan",
    },
  ];

  const initial =
    (user?.displayName ||
      user?.email ||
      "U")
      .slice(0, 1)
      .toUpperCase();

  return (
    <aside className="sidebar-new">
      <div className="sidebar-top-new">
        <Logo />
      </div>

      <div className="balance-widget">
        <div className="balance-widget-top">
          <span>SALDO AKUN</span>
          <div>
            <SvgIcon name="wallet" size={14} />
          </div>
        </div>

        <strong>{formatRupiah(balance)}</strong>

        <button
          onClick={() => setPage("deposit")}
        >
          <SvgIcon name="plus" size={14} />
          Tambah saldo
        </button>
      </div>

      <div className="sidebar-section-label">
        MENU
      </div>

      <nav className="sidebar-nav-new">
        {menus.map((menu) => (
          <button
            key={menu.id}
            className={
              page === menu.id
                ? "nav-item-new active"
                : "nav-item-new"
            }
            onClick={() => setPage(menu.id)}
          >
            <span className="nav-icon-new">
              <SvgIcon
                name={menu.icon}
                size={18}
              />
            </span>

            <span>{menu.label}</span>

            {page === menu.id && (
              <i className="nav-active-line" />
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom-new">
        <div className="user-profile-new">
          <div className="avatar-new">
            {initial}
          </div>

          <div>
            <strong>
              {user?.displayName || "Pengguna"}
            </strong>

            <span>{user?.email}</span>
          </div>
        </div>

        <button
          className="logout-new"
          onClick={logout}
        >
          <SvgIcon name="logout" size={17} />
          Keluar
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
  setPage,
  user,
}) {
  const initial =
    (user?.displayName ||
      user?.email ||
      "U")
      .slice(0, 1)
      .toUpperCase();

  return (
    <header className="topbar-new">
      <div>
        <span>WORKSPACE / SULFA</span>
        <h1>{title}</h1>
      </div>

      <div className="topbar-right-new">
        <button
          className="topbar-balance-new"
          onClick={() => setPage("deposit")}
        >
          <span>Saldo</span>
          <strong>{formatRupiah(balance)}</strong>
          <i>
            <SvgIcon name="plus" size={13} />
          </i>
        </button>

        <div className="topbar-avatar-new">
          {initial}
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   HOME
========================================================= */

function Home({
  setPage,
  services,
  onOpenService,
  balance,
}) {
  return (
    <>
      <section className="hero-new">
        <div className="hero-grid-new" />

        <div className="hero-content-new">
          <div className="hero-label-new">
            <span />
            SULFA MEDIA STORE
          </div>

          <h2>
            Your digital
            <br />
            <em>number hub.</em>
          </h2>

          <p>
            Pilih layanan, negara, dan paket nomor digital
            yang tersedia dalam satu dashboard.
          </p>

          <div className="hero-buttons-new">
            <button
              className="hero-primary-new"
              onClick={() => setPage("numbers")}
            >
              Mulai beli
              <SvgIcon name="arrow" size={16} />
            </button>

            <button
              className="hero-secondary-new"
              onClick={() => setPage("deposit")}
            >
              <SvgIcon name="wallet" size={16} />
              Isi saldo
            </button>
          </div>
        </div>

        <div className="hero-visual-new">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />

          <div className="hero-floating-card card-one">
            <span>AVAILABLE</span>
            <strong>ONLINE</strong>
            <i />
          </div>

          <div className="hero-main-card">
            <div className="hero-main-icon">
              <Logo compact />
            </div>

            <span>ACCOUNT BALANCE</span>

            <strong>
              {formatRupiah(balance)}
            </strong>

            <div className="hero-card-line">
              <i />
              <span>Active account</span>
            </div>
          </div>
        </div>
      </section>

      <div className="section-heading-new">
        <div>
          <span>PLATFORM</span>
          <h2>Layanan pilihan</h2>
        </div>

        <button
          onClick={() => setPage("numbers")}
        >
          Semua layanan
          <SvgIcon name="arrow" size={14} />
        </button>
      </div>

      <div className="service-grid-new">
        {services.slice(0, 8).map((service) => (
          <ServiceCard
            key={service.service_id}
            service={service}
            onOpen={onOpenService}
          />
        ))}
      </div>
    </>
  );
}

/* =========================================================
   NUMBERS
========================================================= */

function Numbers({
  services,
  onOpenService,
}) {
  return (
    <>
      <div className="page-intro-new">
        <span>CATALOG / SERVICES</span>

        <div>
          <h2>Nomor digital</h2>
          <p>
            Pilih layanan untuk melihat negara,
            stok, dan paket yang tersedia.
          </p>
        </div>
      </div>

      <div className="service-grid-new catalog-grid-new">
        {services.map((service) => (
          <ServiceCard
            key={service.service_id}
            service={service}
            onOpen={onOpenService}
          />
        ))}
      </div>
    </>
  );
}

/* =========================================================
   DEPOSIT
========================================================= */

function Deposit({ balance }) {
  return (
    <div className="content-narrow-new">
      <div className="page-intro-new">
        <span>BALANCE / DEPOSIT</span>

        <div>
          <h2>Tambah saldo</h2>
          <p>
            Saldo digunakan untuk membeli nomor
            digital dari katalog.
          </p>
        </div>
      </div>

      <div className="deposit-layout-new">
        <div className="balance-card-new">
          <div className="balance-card-icon">
            <SvgIcon name="wallet" size={21} />
          </div>

          <span>SALDO SEKARANG</span>

          <strong>{formatRupiah(balance)}</strong>

          <div className="balance-card-status">
            <i />
            Account balance
          </div>
        </div>

        <div className="payment-card-new">
          <div className="payment-card-head">
            <div className="qris-icon-new">
              QR
            </div>

            <div>
              <span>PAYMENT METHOD</span>
              <h3>QRIS</h3>
            </div>
          </div>

          <p>
            Pembayaran QRIS akan ditampilkan
            ketika proses deposit diaktifkan.
          </p>

          <div className="payment-info-new">
            <div>
              <span>MINIMUM</span>
              <strong>Rp5.000</strong>
            </div>

            <div>
              <span>STATUS</span>
              <strong className="coming">
                READY
              </strong>
            </div>
          </div>

          <button
            className="deposit-button-disabled"
            disabled
          >
            Payment gateway segera tersedia
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ORDERS
========================================================= */

function Orders() {
  return (
    <div className="content-narrow-new">
      <div className="page-intro-new">
        <span>ACTIVITY / ORDERS</span>

        <div>
          <h2>Pesanan</h2>
          <p>
            Riwayat pembelian nomor digital kamu.
          </p>
        </div>
      </div>

      <div className="empty-new">
        <div>
          <SvgIcon name="orders" size={24} />
        </div>

        <span>NO ORDERS YET</span>

        <h3>Belum ada pesanan</h3>

        <p>
          Pesanan yang berhasil dibuat akan
          tampil di sini.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   HELP
========================================================= */

function Help() {
  const items = [
    {
      number: "01",
      title: "Tambah saldo",
      text: "Isi saldo melalui menu deposit ketika payment gateway tersedia.",
    },
    {
      number: "02",
      title: "Pilih layanan",
      text: "Pilih platform lalu tentukan negara dan paket nomor.",
    },
    {
      number: "03",
      title: "Pantau pesanan",
      text: "Status dan riwayat transaksi akan ditampilkan pada halaman pesanan.",
    },
  ];

  return (
    <div className="content-narrow-new">
      <div className="page-intro-new">
        <span>SUPPORT / HELP</span>

        <div>
          <h2>Pusat bantuan</h2>
          <p>
            Panduan singkat menggunakan platform.
          </p>
        </div>
      </div>

      <div className="help-grid-new">
        {items.map((item) => (
          <div
            className="help-card-new"
            key={item.number}
          >
            <span>{item.number}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [page, setPage] = useState("home");
  const [balance, setBalance] = useState(0);

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] =
    useState(true);
  const [servicesError, setServicesError] =
    useState("");

  const [selectedService, setSelectedService] =
    useState(null);

  useEffect(() => {
    return onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (!user) {
      setBalance(0);
      return;
    }

    const ref = doc(db, "users", user.uid);

    return onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setBalance(
            Number(snap.data().balance || 0)
          );
        } else {
          setBalance(0);
        }
      },
      () => {
        setBalance(0);
      }
    );
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let mounted = true;

    async function loadServices() {
      setServicesLoading(true);
      setServicesError("");

      try {
        const response = await fetch(
          `${API_BASE}/catalog`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Gagal mengambil layanan."
          );
        }

        if (mounted) {
          setServices(
            Array.isArray(data.services)
              ? data.services
              : []
          );
        }
      } catch (err) {
        if (mounted) {
          setServicesError(
            err.message ||
              "Gagal mengambil daftar layanan."
          );
        }
      } finally {
        if (mounted) {
          setServicesLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      mounted = false;
    };
  }, [user]);

  async function logout() {
    try {
      await signOut(auth);
      setPage("home");
      setSelectedService(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Auth />;
  }

  const titles = {
    home: "Beranda",
    numbers: "Nomor digital",
    deposit: "Tambah saldo",
    orders: "Pesanan",
    help: "Bantuan",
  };

  return (
    <div className="app-new">
      <Sidebar
        page={page}
        setPage={setPage}
        user={user}
        balance={balance}
        logout={logout}
      />

      <main className="main-new">
        <Header
          title={titles[page]}
          balance={balance}
          setPage={setPage}
          user={user}
        />

        <div className="page-new">
          {page === "home" && (
            servicesLoading ? (
              <div className="page-loading-new">
                <div className="spinner-new" />
                <span>
                  Memuat layanan...
                </span>
              </div>
            ) : servicesError ? (
              <div className="error-new">
                {servicesError}
              </div>
            ) : (
              <Home
                setPage={setPage}
                services={services}
                onOpenService={
                  setSelectedService
                }
                balance={balance}
              />
            )
          )}

          {page === "numbers" && (
            servicesLoading ? (
              <div className="page-loading-new">
                <div className="spinner-new" />
                <span>
                  Memuat katalog...
                </span>
              </div>
            ) : servicesError ? (
              <div className="error-new">
                {servicesError}
              </div>
            ) : (
              <Numbers
                services={services}
                onOpenService={
                  setSelectedService
                }
              />
            )
          )}

          {page === "deposit" && (
            <Deposit balance={balance} />
          )}

          {page === "orders" && <Orders />}

          {page === "help" && <Help />}
        </div>
      </main>

      {selectedService && (
        <ProductModal
          service={selectedService}
          onClose={() =>
            setSelectedService(null)
          }
          onSelect={(product) => {
            console.log(
              "Produk dipilih:",
              product
            );

            setSelectedService(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
