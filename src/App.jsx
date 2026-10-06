import { useEffect, useState } from "react";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import { auth } from "./firebase";
import { loginUser, registerUser, logoutUser } from "./auth";
import { getUserProfile } from "./firestore";

const money = (n) =>
  `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

function Logo() {
  return (
    <div className="logo">
      <b>SMS</b>
      <small>SULFA MEDIA STORE</small>
    </div>
  );
}

function Icon({ n }) {
  const icons = {
    grid: "⌘",
    phone: "▯",
    wallet: "▱",
    clock: "◷",
    info: "i",
    logout: "↪",
  };

  return <span className="ico">{icons[n] || "•"}</span>;
}

function ServiceLogo({ service }) {
  const code = String(
    service?.service_code || ""
  ).toLowerCase();

  const logos = {
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

  const logo = logos[code];

  return (
    <div className="service-logo">
      {logo ? (
        <img src={logo} alt="" />
      ) : (
        <span>
          {(service?.service_name || "S")
            .charAt(0)
            .toUpperCase()}
        </span>
      )}
    </div>
  );
}

/* =========================================================
   AUTH
========================================================= */

function Auth() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");

    try {
      if (mode === "register") {
        await registerUser(name, email, password);
      } else {
        await loginUser(email, password);
      }
    } catch (error) {
      setMsg(error.message || "Terjadi kesalahan.");
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <Logo />

        <span className="eyebrow">
          TOKO NOMOR DIGITAL
        </span>

        <h1>
          {mode === "login"
            ? "Selamat datang kembali"
            : "Buat akun baru"}
        </h1>

        <p>
          Kelola saldo dan pembelian
          nomor dengan mudah dalam
          satu tempat.
        </p>

        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              Nama

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Nama kamu"
                required
              />
            </label>
          )}

          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="nama@email.com"
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Minimal 6 karakter"
              minLength="6"
              required
            />
          </label>

          <button className="primary" type="submit">
            {mode === "login"
              ? "Masuk"
              : "Buat akun"}

            <span>→</span>
          </button>
        </form>

        {msg && (
          <div className="alert">
            {msg}
          </div>
        )}

        <button
          className="link"
          onClick={() =>
            setMode(
              mode === "login"
                ? "register"
                : "login"
            )
          }
        >
          {mode === "login"
            ? "Belum punya akun? Daftar"
            : "Sudah punya akun? Masuk"}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function Product({ p, onClick }) {
  const name =
    p.service_name ||
    p.name ||
    "Nomor Virtual";

  const active = p.active === true;

  return (
    <article className="product">
      <div className="product-top">
        <ServiceLogo service={p} />

        <span className={active ? "ready" : "empty"}>
          <i />
          {active
            ? "TERSEDIA"
            : "SEDANG KOSONG"}
        </span>
      </div>

      <div className="product-info">
        <h3>{name}</h3>

        <p>
          Nomor virtual Indonesia
          untuk layanan {name}.
        </p>
      </div>

      <div className="product-bottom">
        <div>
          <small>Negara</small>

          <strong>
            🇮🇩 Indonesia
          </strong>
        </div>

        <button
          onClick={onClick}
          disabled={!active}
        >
          {active
            ? "Pilih →"
            : "Tidak tersedia"}
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   SERVICE PRODUCTS
========================================================= */

function ServiceProductsModal({
  service,
  onClose,
}) {
  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [products, setProducts] =
    useState([]);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  useEffect(() => {
    if (!service?.service_id) return;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/nomera/service-products?serviceId=${encodeURIComponent(
            service.service_id
          )}`,
          {
            headers: {
              Accept:
                "application/json",
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Pilihan belum dapat dimuat."
          );
        }

        /*
         * Nomera dapat mengembalikan
         * products dalam beberapa bentuk.
         */
        const list =
          Array.isArray(data?.products)
            ? data.products
            : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data)
            ? data
            : [];

        setProducts(list);

        if (!list.length) {
          setError(
            "Belum ada pilihan yang tersedia untuk layanan ini."
          );
        }
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Gagal mengambil pilihan."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [service]);

  function getCountry(product) {
    return (
      product.country_name ||
      product.countryName ||
      product.country ||
      product.country_code ||
      product.countryCode ||
      "Indonesia"
    );
  }

  function getPrice(product) {
    return (
      product.price ??
      product.sell_price ??
      product.selling_price ??
      product.amount ??
      product.cost ??
      0
    );
  }

  function getStock(product) {
    return (
      product.stock ??
      product.available ??
      product.quantity ??
      null
    );
  }

  return (
    <div
      className="modal-bg"
      onClick={onClose}
    >
      <div
        className="modal service-products-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <button
          className="close"
          onClick={onClose}
        >
          ×
        </button>

        <ServiceLogo service={service} />

        <span className="eyebrow">
          PILIHAN LAYANAN
        </span>

        <h2>
          {service.service_name}
        </h2>

        <p>
          Pilih pilihan yang tersedia
          untuk melanjutkan.
        </p>

        {loading && (
          <div className="products-loading">
            <div className="spin" />

            <span>
              Menyiapkan pilihan...
            </span>
          </div>
        )}

        {!loading && error && (
          <div className="alert">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="service-products-list">
              {products.map(
                (product, index) => {
                  const country =
                    getCountry(product);

                  const price =
                    getPrice(product);

                  const stock =
                    getStock(product);

                  const isSelected =
                    selectedProduct ===
                    product;

                  return (
                    <button
                      key={
                        product.id ||
                        product.product_id ||
                        product.offerKey ||
                        product.offer_key ||
                        index
                      }
                      className={
                        isSelected
                          ? "service-product selected"
                          : "service-product"
                      }
                      onClick={() =>
                        setSelectedProduct(
                          product
                        )
                      }
                    >
                      <div className="service-product-left">
                        <div className="country-icon">
                          🇮🇩
                        </div>

                        <div>
                          <strong>
                            {country}
                          </strong>

                          <small>
                            {stock !== null
                              ? `Tersedia ${stock}`
                              : "Tersedia"}
                          </small>
                        </div>
                      </div>

                      <div className="service-product-right">
                        <strong>
                          {money(price)}
                        </strong>

                        <span>
                          {isSelected
                            ? "✓"
                            : "›"}
                        </span>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}

        {selectedProduct && (
          <div className="selected-product">
            <div>
              <small>
                PILIHAN KAMU
              </small>

              <strong>
                {getCountry(
                  selectedProduct
                )}
              </strong>
            </div>

            <strong>
              {money(
                getPrice(
                  selectedProduct
                )
              )}
            </strong>
          </div>
        )}
      </div>
    </div>
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

  const [services, setServices] =
    useState([]);

  const [page, setPage] =
    useState("home");

  const [selected, setSelected] =
    useState(null);

  const [amount, setAmount] =
    useState("");

  const [depositData, setDepositData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [catalogLoading, setCatalogLoading] =
    useState(false);

  const [depositLoading, setDepositLoading] =
    useState(false);

  const [catalogError, setCatalogError] =
    useState("");

  async function loadServices() {
    setCatalogLoading(true);
    setCatalogError("");

    try {
      const response =
        await fetch(
          "/api/nomera/catalog",
          {
            headers: {
              Accept:
                "application/json",
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Layanan sedang tidak dapat dimuat."
        );
      }

      const list =
        Array.isArray(data?.services)
          ? data.services
          : [];

      setServices(list);

      if (!list.length) {
        setCatalogError(
          "Belum ada layanan yang tersedia saat ini."
        );
      }
    } catch (error) {
      console.error(error);

      setServices([]);

      setCatalogError(
        "Layanan sedang mengalami gangguan. Silakan coba lagi."
      );
    } finally {
      setCatalogLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          try {
            setUser(currentUser);

            if (currentUser) {
              const data =
                await getUserProfile(
                  currentUser.uid
                );

              setProfile(data);

              await loadServices();
            } else {
              setProfile(null);
              setServices([]);
            }
          } catch (error) {
            console.error(error);
          } finally {
            setLoading(false);
          }
        }
      );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <Logo />
        <div className="spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const navigation = [
    ["home", "Beranda", "grid"],
    ["products", "Nomor", "phone"],
    ["deposit", "Saldo", "wallet"],
    ["orders", "Pesanan", "clock"],
    ["info", "Bantuan", "info"],
  ];

  return (
    <div className="shell">
      <aside>
        <Logo />

        <small className="caption">
          SULFA MEDIA STORE
        </small>

        <nav>
          {navigation.map(
            ([id, title, icon]) => (
              <button
                key={id}
                className={
                  page === id
                    ? "nav active"
                    : "nav"
                }
                onClick={() =>
                  setPage(id)
                }
              >
                <Icon n={icon} />
                {title}
              </button>
            )
          )}
        </nav>

        <div className="side">
          <div className="balance">
            <small>
              Saldo kamu
            </small>

            <b>
              {money(
                profile?.balance
              )}
            </b>

            <button
              onClick={() =>
                setPage("deposit")
              }
            >
              Tambah saldo +
            </button>
          </div>

          <button
            className="logout"
            onClick={logoutUser}
          >
            <Icon n="logout" />
            Keluar
          </button>
        </div>
      </aside>

      <main>
        <header>
          <div>
            <span className="eyebrow">
              SULFA MEDIA STORE
            </span>

            <h2>
              {
                navigation.find(
                  (item) =>
                    item[0] === page
                )?.[1]
              }
            </h2>
          </div>

          <div className="account">
            {profile?.name ||
              user.email}

            <b>
              {profile?.role ===
              "developer"
                ? "Developer"
                : "Member"}
            </b>
          </div>
        </header>

        {/* HOME */}

        {page === "home" && (
          <>
            <section className="hero">
              <div>
                <span className="eyebrow">
                  NOMOR DIGITAL
                </span>

                <h1>
                  Nomor virtual,
                  <br />
                  <em>
                    lebih praktis.
                  </em>
                </h1>

                <p>
                  Temukan nomor yang
                  kamu butuhkan dengan
                  proses yang cepat dan
                  sederhana.
                </p>

                <div className="actions">
                  <button
                    className="primary"
                    onClick={() =>
                      setPage(
                        "products"
                      )
                    }
                  >
                    Lihat nomor →
                  </button>

                  <button
                    className="secondary"
                    onClick={() =>
                      setPage(
                        "deposit"
                      )
                    }
                  >
                    Isi saldo
                  </button>
                </div>
              </div>

              <div className="orbit">
                <b>SMS</b>
              </div>
            </section>

            <div className="stats">
              <div>
                Saldo
                <strong>
                  {money(
                    profile?.balance
                  )}
                </strong>
              </div>

              <div>
                Layanan
                <strong>
                  {services.length}
                </strong>
              </div>

              <div>
                Ketersediaan
                <strong>
                  {services.length
                    ? "Aktif"
                    : "Kosong"}
                </strong>
              </div>

              <div>
                Pembelian
                <strong>
                  {profile
                    ?.purchaseCount ||
                    0}
                </strong>
              </div>
            </div>

            <h3>
              Pilihan layanan
            </h3>

            {catalogError && (
              <div className="alert">
                {catalogError}
              </div>
            )}

            <div className="grid">
              {catalogLoading && (
                <div className="emptybox">
                  Menyiapkan pilihan
                  layanan...
                </div>
              )}

              {!catalogLoading &&
                services
                  .slice(0, 6)
                  .map(
                    (service) => (
                      <Product
                        key={
                          service.service_id
                        }
                        p={service}
                        onClick={() =>
                          setSelected(
                            service
                          )
                        }
                      />
                    )
                  )}
            </div>
          </>
        )}

        {/* PRODUCTS */}

        {page === "products" && (
          <>
            <div className="intro">
              <span className="eyebrow">
                PILIHAN LAYANAN
              </span>

              <h1>
                Pilih yang kamu
                butuhkan.
              </h1>

              <p>
                Temukan layanan dan
                pilih pilihan yang
                tersedia.
              </p>
            </div>

            <div className="actions">
              <button
                className="secondary"
                onClick={loadServices}
                disabled={
                  catalogLoading
                }
              >
                {catalogLoading
                  ? "Memuat..."
                  : "Muat ulang"}
              </button>
            </div>

            {catalogError && (
              <div className="alert">
                {catalogError}
              </div>
            )}

            <div className="grid">
              {catalogLoading && (
                <div className="emptybox">
                  Menyiapkan pilihan
                  layanan...
                </div>
              )}

              {!catalogLoading &&
                services.map(
                  (service) => (
                    <Product
                      key={
                        service.service_id
                      }
                      p={service}
                      onClick={() =>
                        setSelected(
                          service
                        )
                      }
                    />
                  )
                )}

              {!catalogLoading &&
                !services.length && (
                  <div className="emptybox">
                    Belum ada layanan
                    tersedia.
                  </div>
                )}
            </div>
          </>
        )}

        {/* DEPOSIT */}

        {page === "deposit" && (
          <section className="deposit">
            <div className="panel">
              <span className="eyebrow">
                SALDO
              </span>

              <h1>
                Tambah saldo
              </h1>

              <p>
                Masukkan jumlah yang
                ingin kamu tambahkan
                ke saldo.
              </p>

              <div className="big">
                {money(
                  profile?.balance
                )}
              </div>

              <label>
                Jumlah

                <input
                  type="number"
                  min="5000"
                  step="1000"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value
                    )
                  }
                  placeholder="Minimal Rp 5.000"
                />
              </label>

              <div className="quick">
                {[5000, 10000, 25000, 50000].map(
                  (value) => (
                    <button
                      key={value}
                      onClick={() =>
                        setAmount(
                          value
                        )
                      }
                    >
                      {money(value)}
                    </button>
                  )
                )}
              </div>

              <button
                className="primary wide"
                disabled={
                  Number(amount) < 5000 ||
                  depositLoading
                }
                onClick={async () => {
                  setDepositLoading(true);

                  try {
                    const token =
                      await getIdToken(
                        user
                      );

                    const response =
                      await fetch(
                        "/api/deposit/create",
                        {
                          method:
                            "POST",
                          headers: {
                            "Content-Type":
                              "application/json",
                            Authorization:
                              `Bearer ${token}`,
                          },
                          body:
                            JSON.stringify({
                              amount:
                                Number(
                                  amount
                                ),
                            }),
                        }
                      );

                    const data =
                      await response.json();

                    if (!response.ok) {
                      throw new Error(
                        data?.error ||
                          "Pembayaran belum dapat dibuat."
                      );
                    }

                    setDepositData(
                      data
                    );
                  } catch (error) {
                    alert(
                      error.message
                    );
                  } finally {
                    setDepositLoading(
                      false
                    );
                  }
                }}
              >
                {depositLoading
                  ? "Menyiapkan pembayaran..."
                  : "Lanjut pembayaran →"}
              </button>

              {depositData && (
                <div className="payment">
                  <b>
                    PEMBAYARAN SIAP
                  </b>

                  <strong>
                    Silakan selesaikan
                    pembayaran untuk
                    menambahkan saldo.
                  </strong>

                  {(
                    depositData?.data
                      ?.payment_url ||
                    depositData?.data
                      ?.checkout_url ||
                    depositData?.data
                      ?.invoice_url
                  ) && (
                    <a
                      className="primary wide"
                      href={
                        depositData
                          .data
                          .payment_url ||
                        depositData
                          .data
                          .checkout_url ||
                        depositData
                          .data
                          .invoice_url
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Bayar sekarang →
                    </a>
                  )}

                  <small>
                    Setelah pembayaran
                    berhasil, saldo kamu
                    akan diperbarui
                    otomatis.
                  </small>
                </div>
              )}
            </div>

            <div className="steps">
              <div>
                <b>01</b>
                <h3>
                  Pilih jumlah
                </h3>
                <p>
                  Tentukan jumlah saldo
                  yang ingin ditambahkan.
                </p>
              </div>

              <div>
                <b>02</b>
                <h3>
                  Lakukan pembayaran
                </h3>
                <p>
                  Selesaikan pembayaran
                  sesuai petunjuk.
                </p>
              </div>

              <div>
                <b>03</b>
                <h3>
                  Saldo bertambah
                </h3>
                <p>
                  Setelah pembayaran
                  berhasil, saldo kamu
                  diperbarui otomatis.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ORDERS */}

        {page === "orders" && (
          <section className="intro">
            <span className="eyebrow">
              PESANAN
            </span>

            <h1>
              Pesanan kamu.
            </h1>

            <p>
              Semua pembelian kamu
              akan muncul di sini.
            </p>

            <div className="emptybox">
              Belum ada pesanan.
            </div>
          </section>
        )}

        {/* INFO */}

        {page === "info" && (
          <section className="intro">
            <span className="eyebrow">
              BANTUAN
            </span>

            <h1>
              Cara menggunakan
              SULFA.
            </h1>

            <p>
              Ikuti beberapa langkah
              sederhana berikut.
            </p>

            {[
              [
                "01",
                "Pilih layanan",
                "Pilih layanan yang kamu perlukan.",
              ],
              [
                "02",
                "Pilih pilihan",
                "Pilih pilihan yang tersedia.",
              ],
              [
                "03",
                "Periksa saldo",
                "Pastikan saldo kamu mencukupi.",
              ],
              [
                "04",
                "Selesaikan pesanan",
                "Ikuti proses sampai pesanan selesai.",
              ],
              [
                "05",
                "Cek pesanan",
                "Pantau pembelian kamu melalui menu Pesanan.",
              ],
            ].map(
              ([number, title, text]) => (
                <div
                  className="timeline"
                  key={number}
                >
                  <b>
                    {number}
                  </b>

                  <div>
                    <h3>
                      {title}
                    </h3>

                    <p>
                      {text}
                    </p>
                  </div>
                </div>
              )
            )}
          </section>
        )}
      </main>

      {/* =====================================================
          MODAL PILIHAN
      ===================================================== */}

      {selected && (
        <ServiceProductsModal
          service={selected}
          onClose={() =>
            setSelected(null)
          }
        />
      )}
    </div>
  );
}
