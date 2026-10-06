import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
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

function Logo() {
  return (
    <div className="brand">
      <div className="brand-mark">SMS</div>
      <div className="brand-name">SULFA MEDIA STORE</div>
    </div>
  );
}

function Icon({ children }) {
  return <span className="icon">{children}</span>;
}

function ServiceLogo({ service }) {
  const icons = {
    whatsapp: "WA",
    telegram: "TG",
    "instagram-threads": "IG",
    "tiktok-douyin": "TK",
    facebook: "FB",
    "google-youtube-gmail": "G",
    twitter: "X",
    discord: "DS",
    openai: "AI",
    apple: "AP",
    microsoft: "MS",
    amazon: "AZ",
    netflix: "NF",
    spotify: "SP",
    snapchat: "SC",
    tinder: "TD",
    paypal: "PP",
    uber: "UB",
    linkedin: "IN",
    wechat: "WC",
    shopee: "SH",
    line: "LN",
    viber: "VB",
    signal: "SG",
    grab: "GR",
    gojek: "GJ",
    lazada: "LZ",
    tokopedia: "TP",
    steam: "ST",
    roblox: "RB",
    binance: "BN",
    coinbase: "CB",
  };

  return (
    <div className="service-logo">
      {icons[service.service_code] || service.service_name?.slice(0, 2)}
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setError("Email atau password salah.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-glow glow-one" />
      <div className="login-glow glow-two" />

      <div className="login-card">
        <div className="login-brand">
          <Logo />
        </div>

        <div className="login-heading">
          <span>SELAMAT DATANG</span>
          <h1>Masuk ke akun kamu</h1>
          <p>
            Kelola saldo, nomor digital, dan pesanan kamu dengan mudah.
          </p>
        </div>

        <form onSubmit={submit} className="login-form">
          <label>
            Email
            <input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <div className="alert">{error}</div>}

          <button className="button button-primary full" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="login-footer">
          SULFA MEDIA STORE
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service, onOpen }) {
  return (
    <button className="service-card" onClick={() => onOpen(service)}>
      <div className="service-card-top">
        <ServiceLogo service={service} />

        <span className="service-arrow">
          →
        </span>
      </div>

      <div className="service-card-content">
        <h3>{service.service_name}</h3>

        <p>
          Pilih negara dan paket nomor yang tersedia.
        </p>
      </div>

      <div className="service-card-bottom">
        <span className="available-dot" />
        <span>Tersedia</span>
      </div>
    </button>
  );
}

function ProductModal({ service, onClose, onSelect }) {
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
          throw new Error(data.message || "Gagal mengambil produk.");
        }

        if (mounted) {
          setProducts(Array.isArray(data.items) ? data.items : []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Gagal mengambil data.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
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
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="product-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="modal-label">PILIH PRODUK</span>
            <h2>{service.service_name}</h2>
            <p>Pilih negara dan paket nomor yang kamu inginkan.</p>
          </div>

          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="modal-state">
              <div className="spinner" />
              <span>Mengambil produk...</span>
            </div>
          )}

          {!loading && error && (
            <div className="modal-error">
              {error}
            </div>
          )}

          {!loading && !error && grouped.length === 0 && (
            <div className="modal-state">
              Produk belum tersedia.
            </div>
          )}

          {!loading &&
            !error &&
            grouped.map((country) => (
              <div className="country-group" key={country.country_id}>
                <div className="country-header">
                  <div className="country-title">
                    <span className="country-flag">
                      {country.country_code === "ID"
                        ? "🇮🇩"
                        : country.country_code === "US"
                        ? "🇺🇸"
                        : country.country_code === "MY"
                        ? "🇲🇾"
                        : country.country_code === "SG"
                        ? "🇸🇬"
                        : country.country_code === "JP"
                        ? "🇯🇵"
                        : country.country_code === "GB"
                        ? "🇬🇧"
                        : country.country_code === "CA"
                        ? "🇨🇦"
                        : "🌐"}
                    </span>

                    <div>
                      <strong>{country.country_name}</strong>
                      <small>{country.country_code}</small>
                    </div>
                  </div>

                  <span className="country-count">
                    {country.items.length} paket
                  </span>
                </div>

                <div className="package-list">
                  {country.items.map((item) => (
                    <button
                      className="package-card"
                      key={item.offer_key}
                      onClick={() => onSelect(item, service)}
                      disabled={!item.active || Number(item.available) <= 0}
                    >
                      <div className="package-main">
                        <div className="package-info">
                          <span className="package-name">
                            {item.package_label}
                          </span>

                          <span className="package-stock">
                            {Number(item.available) > 0
                              ? `${Number(item.available).toLocaleString(
                                  "id-ID"
                                )} tersedia`
                              : "Stok habis"}
                          </span>
                        </div>

                        <div className="package-price">
                          {formatRupiah(item.price)}
                        </div>
                      </div>

                      <span className="package-arrow">→</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ page, setPage, user, balance, logout }) {
  const menus = [
    { id: "home", icon: "⌂", label: "Beranda" },
    { id: "numbers", icon: "#", label: "Nomor" },
    { id: "deposit", icon: "+", label: "Tambah Saldo" },
    { id: "orders", icon: "◷", label: "Pesanan" },
    { id: "help", icon: "?", label: "Bantuan" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Logo />
      </div>

      <div className="sidebar-balance">
        <span>Saldo kamu</span>
        <strong>{formatRupiah(balance)}</strong>

        <button onClick={() => setPage("deposit")}>
          + Tambah saldo
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">MENU UTAMA</div>

        {menus.map((menu) => (
          <button
            key={menu.id}
            className={`nav-item ${
              page === menu.id ? "active" : ""
            }`}
            onClick={() => setPage(menu.id)}
          >
            <span className="nav-icon">{menu.icon}</span>
            <span>{menu.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="avatar">
          {(user?.displayName || user?.email || "U")
            .slice(0, 1)
            .toUpperCase()}
        </div>

        <div className="sidebar-user-info">
          <strong>{user?.displayName || "Pengguna"}</strong>
          <span>{user?.email}</span>
        </div>
      </div>

      <button className="logout-button" onClick={logout}>
        <Icon>↪</Icon>
        Keluar
      </button>
    </aside>
  );
}

function Header({ title, balance, setPage }) {
  return (
    <header className="topbar">
      <div>
        <span className="topbar-label">SULFA MEDIA STORE</span>
        <h1>{title}</h1>
      </div>

      <div className="topbar-actions">
        <button
          className="balance-button"
          onClick={() => setPage("deposit")}
        >
          <span>Saldo</span>
          <strong>{formatRupiah(balance)}</strong>
        </button>

        <div className="topbar-avatar">S</div>
      </div>
    </header>
  );
}

function Home({ setPage, services, onOpenService, balance }) {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">
            <span />
            PLATFORM NOMOR DIGITAL
          </span>

          <h2>
            Nomor digital,
            <br />
            <span>lebih praktis.</span>
          </h2>

          <p>
            Pilih layanan yang kamu butuhkan, tentukan negara dan paket,
            lalu lanjutkan pembelian menggunakan saldo akun.
          </p>

          <div className="hero-actions">
            <button
              className="button button-primary"
              onClick={() => setPage("numbers")}
            >
              Beli nomor
              <span>→</span>
            </button>

            <button
              className="button button-secondary"
              onClick={() => setPage("deposit")}
            >
              Tambah saldo
            </button>
          </div>
        </div>

        <div className="hero-decoration">
          <div className="hero-circle circle-one" />
          <div className="hero-circle circle-two" />
          <div className="hero-card">
            <span>Saldo tersedia</span>
            <strong>{formatRupiah(balance)}</strong>
            <small>Akun aktif</small>
          </div>
        </div>
      </section>

      <section className="section-heading">
        <div>
          <span className="section-label">LAYANAN</span>
          <h2>Pilih layanan</h2>
        </div>

        <button
          className="text-button"
          onClick={() => setPage("numbers")}
        >
          Lihat semua →
        </button>
      </section>

      <div className="service-grid">
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

function Numbers({ services, onOpenService }) {
  return (
    <>
      <div className="page-intro">
        <span className="section-label">KATALOG</span>
        <h2>Nomor digital</h2>
        <p>
          Pilih layanan untuk melihat negara dan paket yang tersedia.
        </p>
      </div>

      <div className="service-grid large">
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

function Deposit({ balance }) {
  return (
    <div className="content-narrow">
      <div className="page-intro">
        <span className="section-label">SALDO</span>
        <h2>Tambah saldo</h2>
        <p>
          Isi saldo akun untuk digunakan membeli nomor digital.
        </p>
      </div>

      <div className="deposit-layout">
        <div className="balance-panel">
          <span>Saldo saat ini</span>
          <strong>{formatRupiah(balance)}</strong>
        </div>

        <div className="payment-panel">
          <div className="payment-icon">QR</div>

          <div>
            <h3>Deposit melalui QRIS</h3>
            <p>
              QRIS akan ditampilkan saat proses deposit tersedia.
            </p>
          </div>

          <div className="payment-notice">
            <strong>Minimal deposit Rp5.000</strong>
            <span>
              Setelah pembayaran terverifikasi, saldo dapat
              diperbarui secara otomatis.
            </span>
          </div>

          <button className="button button-primary full">
            Mulai deposit
          </button>
        </div>
      </div>
    </div>
  );
}

function Orders() {
  return (
    <div className="content-narrow">
      <div className="page-intro">
        <span className="section-label">AKTIVITAS</span>
        <h2>Pesanan</h2>
        <p>
          Riwayat pembelian nomor digital kamu akan muncul di sini.
        </p>
      </div>

      <div className="empty-state">
        <div className="empty-icon">◷</div>
        <h3>Belum ada pesanan</h3>
        <p>
          Pesanan yang berhasil dibuat akan tampil di halaman ini.
        </p>
      </div>
    </div>
  );
}

function Help() {
  return (
    <div className="content-narrow">
      <div className="page-intro">
        <span className="section-label">BANTUAN</span>
        <h2>Pusat bantuan</h2>
        <p>
          Informasi dasar penggunaan SULFA MEDIA STORE.
        </p>
      </div>

      <div className="help-grid">
        <div className="help-card">
          <span>01</span>
          <h3>Isi saldo</h3>
          <p>
            Gunakan menu Tambah Saldo untuk memulai proses deposit.
          </p>
        </div>

        <div className="help-card">
          <span>02</span>
          <h3>Pilih layanan</h3>
          <p>
            Pilih layanan kemudian tentukan negara dan paket yang
            tersedia.
          </p>
        </div>

        <div className="help-card">
          <span>03</span>
          <h3>Lihat pesanan</h3>
          <p>
            Status pembelian kamu dapat dilihat melalui menu Pesanan.
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [page, setPage] = useState("home");
  const [balance, setBalance] = useState(0);

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");

  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);

    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setBalance(Number(snap.data().balance || 0));
      }
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let mounted = true;

    async function loadServices() {
      setServicesLoading(true);
      setServicesError("");

      try {
        const response = await fetch(`${API_BASE}/catalog`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Gagal mengambil layanan.");
        }

        if (mounted) {
          setServices(
            Array.isArray(data.services) ? data.services : []
          );
        }
      } catch (err) {
        if (mounted) {
          setServicesError(
            err.message || "Gagal mengambil daftar layanan."
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
    await auth.signOut();
  }

  if (authLoading) {
    return (
      <div className="screen-loading">
        <div className="loading-brand">
          <div>SMS</div>
          <span>SULFA MEDIA STORE</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const titles = {
    home: "Beranda",
    numbers: "Nomor digital",
    deposit: "Tambah saldo",
    orders: "Pesanan",
    help: "Bantuan",
  };

  return (
    <div className="app">
      <Sidebar
        page={page}
        setPage={setPage}
        user={user}
        balance={balance}
        logout={logout}
      />

      <main className="main">
        <Header
          title={titles[page]}
          balance={balance}
          setPage={setPage}
        />

        <div className="page">
          {page === "home" && (
            <Home
              setPage={setPage}
              services={services}
              onOpenService={setSelectedService}
              balance={balance}
            />
          )}

          {page === "numbers" && (
            <>
              {servicesLoading ? (
                <div className="loading-box">
                  <div className="spinner" />
                  <span>Memuat layanan...</span>
                </div>
              ) : servicesError ? (
                <div className="error-box">
                  {servicesError}
                </div>
              ) : (
                <Numbers
                  services={services}
                  onOpenService={setSelectedService}
                />
              )}
            </>
          )}

          {page === "deposit" && <Deposit balance={balance} />}

          {page === "orders" && <Orders />}

          {page === "help" && <Help />}
        </div>
      </main>

      {selectedService && (
        <ProductModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onSelect={(product) => {
            console.log("Produk dipilih:", product);
            setSelectedService(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
