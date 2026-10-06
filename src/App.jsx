import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import { auth } from "./firebase";
import { loginUser, registerUser, logoutUser } from "./auth";
import { getUserProfile } from "./firestore";

const money = (n) =>
  `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const Icon = ({ n }) => (
  <span className="ico">
    {({
      grid: "⌘",
      phone: "▯",
      wallet: "▱",
      clock: "◷",
      info: "i",
      logout: "↪",
    })[n] || "•"}
  </span>
);

const Logo = () => (
  <div className="logo">
    <b>SMS</b>
    <small>SULFA MEDIA STORE</small>
  </div>
);

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
    } catch (x) {
      setMsg(x.message || "Terjadi kesalahan.");
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <Logo />

        <span className="eyebrow">
          DIGITAL NUMBER MARKET
        </span>

        <h1>
          {mode === "login"
            ? "Masuk ke akun"
            : "Buat akun baru"}
        </h1>

        <p>
          Kelola saldo, nomor virtual, dan pesanan dari
          satu panel.
        </p>

        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              Nama
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="6"
              required
            />
          </label>

          <button className="primary">
            {mode === "login" ? "Masuk" : "Daftar"}
            <span>→</span>
          </button>
        </form>

        {msg && <div className="alert">{msg}</div>}

        <button
          className="link"
          onClick={() =>
            setMode(
              mode === "login" ? "register" : "login"
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

function Product({ p, onClick }) {
  const name =
    p.service_name ||
    p.name ||
    p.serviceName ||
    p.title ||
    "Service";

  const active = p.active !== false;

  return (
    <article className="product">
      <div className="row">
        <span className={active ? "ready" : "empty"}>
          <i />
          {active ? "READY" : "EMPTY"}
        </span>

        <small>
          Service ID: {p.service_id ?? "-"}
        </small>
      </div>

      <h3>{name}</h3>

      <p>
        {p.service_code ||
          "Layanan nomor virtual dari Nomera."}
      </p>

      <div className="row">
        <strong>
          Pilih layanan
        </strong>

        <button onClick={onClick}>
          Pilih →
        </button>
      </div>
    </article>
  );
}

export default function App() {
  const [depositData, setDepositData] = useState(null);
  const [depositLoading, setDepositLoading] = useState(false);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [products, setProducts] = useState([]);

  const [page, setPage] = useState("home");
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState("");

  async function loadCatalog() {
    setCatalogLoading(true);
    setCatalogError("");

    try {
      const response = await fetch(
        "/api/nomera/catalog",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Gagal mengambil katalog Nomera."
        );
      }

      /*
       * Respons Nomera:
       * {
       *   success: true,
       *   products: [],
       *   services: [...]
       * }
       */

      const items = Array.isArray(data?.services)
        ? data.services
        : [];

      setProducts(items);

      if (!items.length) {
        setCatalogError(
          "Tidak ada service yang tersedia dari Nomera."
        );
      }
    } catch (error) {
      console.error("Nomera catalog:", error);

      setProducts([]);

      setCatalogError(
        error.message ||
          "Katalog Nomera gagal dimuat."
      );
    } finally {
      setCatalogLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (u) => {
        try {
          setUser(u);

          if (u) {
            const p = await getUserProfile(u.uid);

            setProfile(p);

            await loadCatalog();
          } else {
            setProfile(null);
            setProducts([]);
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

  const stock = useMemo(
    () => products.length,
    [products]
  );

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

  const nav = [
    ["home", "Beranda", "grid"],
    ["products", "Nomor Virtual", "phone"],
    ["deposit", "Deposit", "wallet"],
    ["orders", "Pesanan", "clock"],
    ["info", "Cara Kerja", "info"],
  ];

  return (
    <div className="shell">
      <aside>
        <Logo />

        <small className="caption">
          MARKETPLACE DIGITAL
        </small>

        <nav>
          {nav.map(([id, title, icon]) => (
            <button
              className={
                page === id
                  ? "nav active"
                  : "nav"
              }
              onClick={() => setPage(id)}
              key={id}
            >
              <Icon n={icon} />
              {title}
            </button>
          ))}
        </nav>

        <div className="side">
          <div className="balance">
            <small>Saldo tersedia</small>

            <b>
              {money(profile?.balance)}
            </b>

            <button
              onClick={() => setPage("deposit")}
            >
              Isi saldo +
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
              {nav.find(
                (x) => x[0] === page
              )?.[1]}
            </h2>
          </div>

          <div className="account">
            {profile?.name || user.email}

            <b>
              {profile?.role || "pembeli"}
            </b>
          </div>
        </header>

        {page === "home" && (
          <>
            <section className="hero">
              <div>
                <span className="eyebrow">
                  INSTANT DIGITAL SERVICE
                </span>

                <h1>
                  Nomor virtual,
                  <br />
                  <em>lebih simpel.</em>
                </h1>

                <p>
                  Pilih layanan, siapkan saldo, dan
                  kelola pesanan dari dashboard
                  SULFA MEDIA STORE.
                </p>

                <div className="actions">
                  <button
                    className="primary"
                    onClick={() =>
                      setPage("products")
                    }
                  >
                    Lihat nomor →
                  </button>

                  <button
                    className="secondary"
                    onClick={() =>
                      setPage("deposit")
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
                  {money(profile?.balance)}
                </strong>
              </div>

              <div>
                Layanan
                <strong>
                  {products.length}
                </strong>
              </div>

              <div>
                Tersedia
                <strong>{stock}</strong>
              </div>

              <div>
                Pembelian
                <strong>
                  {profile?.purchaseCount || 0}
                </strong>
              </div>
            </div>

            <h3>Layanan tersedia</h3>

            {catalogError && (
              <div className="alert">
                {catalogError}
              </div>
            )}

            <div className="grid">
              {catalogLoading && (
                <div className="emptybox">
                  Memuat katalog Nomera...
                </div>
              )}

              {!catalogLoading &&
                products
                  .slice(0, 3)
                  .map((p, index) => (
                    <Product
                      key={
                        p.service_id || index
                      }
                      p={p}
                      onClick={() =>
                        setSelected(p)
                      }
                    />
                  ))}

              {!catalogLoading &&
                !products.length && (
                  <div className="emptybox">
                    Belum ada layanan tersedia.
                  </div>
                )}
            </div>
          </>
        )}

        {page === "products" && (
          <>
            <div className="intro">
              <span className="eyebrow">
                VIRTUAL NUMBER CATALOG
              </span>

              <h1>
                Pilih layanan yang kamu butuhkan.
              </h1>

              <p>
                Data layanan diambil langsung dari
                API Nomera.
              </p>
            </div>

            <div className="actions">
              <button
                className="secondary"
                onClick={loadCatalog}
                disabled={catalogLoading}
              >
                {catalogLoading
                  ? "Memuat..."
                  : "Refresh katalog"}
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
                  Memuat katalog Nomera...
                </div>
              )}

              {!catalogLoading &&
                products.map((p, index) => (
                  <Product
                    key={
                      p.service_id || index
                    }
                    p={p}
                    onClick={() =>
                      setSelected(p)
                    }
                  />
                ))}

              {!catalogLoading &&
                !products.length && (
                  <div className="emptybox">
                    Tidak ada layanan dari Nomera.
                  </div>
                )}
            </div>
          </>
        )}

        {page === "deposit" && (
          <section className="deposit">
            <div className="panel">
              <span className="eyebrow">
                WALLET
              </span>

              <h1>Isi saldo</h1>

              <p>
                Masukkan nominal deposit. Pembayaran
                dibuat melalui backend.
              </p>

              <div className="big">
                {money(profile?.balance)}
              </div>

              <label>
                Nominal deposit

                <input
                  type="number"
                  min="5000"
                  step="1000"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  placeholder="Minimal Rp 5.000"
                />
              </label>

              <div className="quick">
                {[5000, 10000, 25000, 50000].map(
                  (v) => (
                    <button
                      key={v}
                      onClick={() =>
                        setAmount(v)
                      }
                    >
                      {money(v)}
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
                      await getIdToken(user);

                    const r = await fetch(
                      "/api/deposit/create",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type":
                            "application/json",
                          Authorization:
                            `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          amount:
                            Number(amount),
                        }),
                      }
                    );

                    const d = await r.json();

                    if (!r.ok) {
                      throw new Error(
                        d.error ||
                          "Gagal membuat deposit"
                      );
                    }

                    setDepositData(d);
                  } catch (e) {
                    alert(e.message);
                  } finally {
                    setDepositLoading(false);
                  }
                }}
              >
                {depositLoading
                  ? "Membuat pembayaran..."
                  : "Lanjut ke pembayaran →"}
              </button>

              <div className="payment">
                <b>PAYMENT GATEWAY</b>

                <strong>
                  {depositData?.data?.payment_url ||
                  depositData?.data?.checkout_url ||
                  depositData?.data?.invoice_url
                    ? "Pembayaran siap."
                    : "QRIS muncul setelah transaksi deposit dibuat."}
                </strong>

                {(depositData?.data
                  ?.payment_url ||
                  depositData?.data
                    ?.checkout_url ||
                  depositData?.data
                    ?.invoice_url) && (
                  <a
                    className="primary wide"
                    href={
                      depositData.data
                        .payment_url ||
                      depositData.data
                        .checkout_url ||
                      depositData.data
                        .invoice_url
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Buka pembayaran →
                  </a>
                )}

                <small>
                  Secret key gateway tidak berada
                  di browser.
                </small>
              </div>
            </div>

            <div className="steps">
              <div>
                <b>01</b>
                <h3>Buat deposit</h3>
                <p>
                  Transaksi dibuat sebagai pending.
                </p>
              </div>

              <div>
                <b>02</b>
                <h3>Bayar QRIS</h3>
                <p>
                  QR pembayaran dibuat oleh
                  backend.
                </p>
              </div>

              <div>
                <b>03</b>
                <h3>Saldo masuk</h3>
                <p>
                  Webhook terverifikasi mengkredit
                  saldo sekali.
                </p>
              </div>
            </div>
          </section>
        )}

        {page === "orders" && (
          <div className="emptybox">
            Riwayat pesanan akan tampil setelah
            backend order terhubung.
          </div>
        )}

        {page === "info" && (
          <section className="intro">
            <span className="eyebrow">
              HOW IT WORKS
            </span>

            <h1>
              Alur pesanan SULFA.
            </h1>

            {[
              [
                "01",
                "Pilih layanan",
                "Pilih service dari katalog API.",
              ],
              [
                "02",
                "Validasi harga",
                "Backend melakukan quote sebelum order.",
              ],
              [
                "03",
                "Buat order",
                "Order dibuat melalui backend.",
              ],
              [
                "04",
                "Tunggu status",
                "Pesanan diproses oleh provider.",
              ],
              [
                "05",
                "Selesai",
                "Order selesai setelah provider mengonfirmasi.",
              ],
            ].map((x) => (
              <div
                className="timeline"
                key={x[0]}
              >
                <b>{x[0]}</b>

                <div>
                  <h3>{x[1]}</h3>
                  <p>{x[2]}</p>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      {selected && (
        <div
          className="modal-bg"
          onClick={() =>
            setSelected(null)
          }
        >
          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="close"
              onClick={() =>
                setSelected(null)
              }
            >
              ×
            </button>

            <span className="eyebrow">
              SERVICE DETAIL
            </span>

            <h2>
              {selected.service_name ||
                selected.name ||
                "Service"}
            </h2>

            <p>
              Code:{" "}
              <b>
                {selected.service_code || "-"}
              </b>
            </p>

            <p>
              Service ID:{" "}
              <b>
                {selected.service_id || "-"}
              </b>
            </p>

            <button
              className="primary wide"
              onClick={() => {
                setSelected(null);
                setPage("deposit");
              }}
            >
              Isi saldo untuk melanjutkan →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
