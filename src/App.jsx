import { useEffect, useState } from "react";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import { auth } from "./firebase";
import { loginUser, registerUser, logoutUser } from "./auth";
import { getUserProfile } from "./firestore";

const money = (n) =>
  `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const Icon = ({ n }) => (
  <span className="ico">
    {{
      grid: "⌘",
      phone: "▯",
      wallet: "▱",
      clock: "◷",
      info: "i",
      logout: "↪",
    }[n] || "•"}
  </span>
);

function Logo() {
  return (
    <div className="logo">
      <b>SMS</b>
      <small>SULFA MEDIA STORE</small>
    </div>
  );
}

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
          Kelola saldo dan pembelian nomor
          dengan mudah dalam satu tempat.
        </p>

        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              Nama
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

function Product({ p, onClick }) {
  const name =
    p.service_name ||
    p.name ||
    "Nomor Virtual";

  const active = p.active === true;

  return (
    <article className="product">
      <div className="row">
        <span
          className={
            active ? "ready" : "empty"
          }
        >
          <i />
          {active
            ? "TERSEDIA"
            : "SEDANG KOSONG"}
        </span>

        <small>
          Indonesia
        </small>
      </div>

      <h3>{name}</h3>

      <p>
        Nomor virtual untuk kebutuhan
        digital kamu.
      </p>

      <div className="row">
        <strong>
          {active
            ? "Bisa dipesan"
            : "Belum tersedia"}
        </strong>

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

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [services, setServices] = useState([]);

  const [page, setPage] = useState("home");
  const [selected, setSelected] = useState(null);

  const [amount, setAmount] = useState("");
  const [depositData, setDepositData] =
    useState(null);

  const [loading, setLoading] = useState(true);
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
      const response = await fetch(
        "/api/nomera/catalog",
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Layanan sedang tidak dapat dimuat."
        );
      }

      const list = Array.isArray(
        data?.services
      )
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
                  <em>lebih praktis.</em>
                </h1>

                <p>
                  Temukan nomor yang kamu
                  butuhkan dengan proses yang
                  cepat dan sederhana.
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
                    ?.purchaseCount || 0}
                </strong>
              </div>
            </div>

            <h3>
              Pilihan nomor
            </h3>

            {catalogError && (
              <div className="alert">
                {catalogError}
              </div>
            )}

            <div className="grid">
              {catalogLoading && (
                <div className="emptybox">
                  Menyiapkan pilihan nomor...
                </div>
              )}

              {!catalogLoading &&
                services
                  .slice(0, 3)
                  .map((service) => (
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
                  ))}

              {!catalogLoading &&
                !services.length && (
                  <div className="emptybox">
                    Belum ada nomor yang
                    tersedia.
                  </div>
                )}
            </div>
          </>
        )}

        {page === "products" && (
          <>
            <div className="intro">
              <span className="eyebrow">
                PILIHAN NOMOR
              </span>

              <h1>
                Pilih layanan yang
                kamu butuhkan.
              </h1>

              <p>
                Pilih salah satu layanan
                untuk melihat pilihan yang
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
                  Menyiapkan pilihan nomor...
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
                Masukkan jumlah yang ingin
                kamu tambahkan ke saldo.
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
                  setDepositLoading(
                    true
                  );

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
                    berhasil, saldo akan
                    diperbarui secara
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

        {page === "orders" && (
          <section className="intro">
            <span className="eyebrow">
              PESANAN
            </span>

            <h1>
              Pesanan kamu.
            </h1>

            <p>
              Pesanan yang kamu buat akan
              muncul di halaman ini.
            </p>

            <div className="emptybox">
              Belum ada pesanan.
            </div>
          </section>
        )}

        {page === "info" && (
          <section className="intro">
            <span className="eyebrow">
              CARA MENGGUNAKAN
            </span>

            <h1>
              Semuanya sederhana.
            </h1>

            <p>
              Ikuti beberapa langkah berikut
              untuk menggunakan SULFA MEDIA
              STORE.
            </p>

            {[
              [
                "01",
                "Pilih layanan",
                "Pilih layanan yang kamu perlukan.",
              ],
              [
                "02",
                "Pilih pilihan yang tersedia",
                "Pilih negara dan pilihan nomor yang tersedia.",
              ],
              [
                "03",
                "Periksa jumlah pembayaran",
                "Pastikan saldo kamu mencukupi sebelum melanjutkan.",
              ],
              [
                "04",
                "Selesaikan pesanan",
                "Ikuti proses pemesanan sampai selesai.",
              ],
              [
                "05",
                "Lihat pesanan",
                "Pantau pesanan kamu dari menu Pesanan.",
              ],
            ].map(
              ([number, title, text]) => (
                <div
                  className="timeline"
                  key={number}
                >
                  <b>{number}</b>

                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              )
            )}
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
              PILIHAN
            </span>

            <h2>
              {selected.service_name ||
                "Nomor Virtual"}
            </h2>

            <p>
              Silakan lanjut untuk melihat
              pilihan nomor yang tersedia.
            </p>

            <button
              className="primary wide"
              onClick={() => {
                setSelected(null);
              }}
            >
              Lihat pilihan →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
