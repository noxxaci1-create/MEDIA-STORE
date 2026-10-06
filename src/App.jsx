import {useEffect,useMemo,useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {auth} from "./firebase";
import { getIdToken } from "firebase/auth";
import {loginUser,registerUser,logoutUser} from "./auth";
import {getProducts,getUserProfile} from "./firestore";

const money=n=>`Rp ${Number(n||0).toLocaleString("id-ID")}`;
const Icon=({n})=><span className="ico">{({grid:"⌘",phone:"▯",wallet:"▱",clock:"◷",info:"i",logout:"↪",arrow:"→",plus:"+",user:"○"})[n]||"•"}</span>;
const Logo=()=> <div className="logo"><b>SMS</b><small>SULFA MEDIA STORE</small></div>;

function Auth(){
 const [mode,setMode]=useState("login"),[name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[msg,setMsg]=useState("");
 async function submit(e){e.preventDefault();setMsg("");try{if(mode==="register")await registerUser(name,email,password);else await loginUser(email,password)}catch(x){setMsg(x.message||"Terjadi kesalahan.")}}
 return <div className="auth"><div className="auth-card"><Logo/><span className="eyebrow">DIGITAL NUMBER MARKET</span><h1>{mode==="login"?"Masuk ke akun":"Buat akun baru"}</h1><p>Kelola saldo, nomor virtual, dan pesanan dari satu panel.</p><form onSubmit={submit}>
 {mode==="register"&&<label>Nama<input value={name} onChange={e=>setName(e.target.value)} required/></label>}
 <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>
 <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength="6" required/></label>
 <button className="primary">Masuk <span>→</span></button></form>{msg&&<div className="alert">{msg}</div>}
 <button className="link" onClick={()=>setMode(mode==="login"?"register":"login")}>{mode==="login"?"Belum punya akun? Daftar":"Sudah punya akun? Masuk"}</button>
 </div></div>
}

function Product({p,onClick}){
 const stock=Number(p.stock||0);
 return <article className="product"><div className="row"><span className={stock?"ready":"empty"}><i/> {stock?"READY":"EMPTY"}</span><small>{p.country||"Indonesia"}</small></div>
 <h3>{p.name}</h3><p>{p.description||"Nomor virtual digital."}</p><div className="row"><strong>{money(p.price)}</strong><button onClick={onClick}>Pilih →</button></div></article>
}

export default function App(){
 const [depositData,setDepositData]=useState(null),[depositLoading,setDepositLoading]=useState(false);
 const [user,setUser]=useState(null),[profile,setProfile]=useState(null),[products,setProducts]=useState([]),[page,setPage]=useState("home"),[amount,setAmount]=useState(""),[selected,setSelected]=useState(null),[loading,setLoading]=useState(true);
 useEffect(()=>onAuthStateChanged(auth,async u=>{setUser(u);if(u){const [p,ps]=await Promise.all([getUserProfile(u.uid),getProducts().catch(()=>[])]);setProfile(p);setProducts(ps)}else setProfile(null);setLoading(false)}),[]);
 const stock=useMemo(()=>products.reduce((a,p)=>a+Number(p.stock||0),0),[products]);
 if(loading)return <div className="loading"><Logo/><div className="spin"/></div>;
 if(!user)return <Auth/>;
 const nav=[["home","Beranda","grid"],["products","Nomor Virtual","phone"],["deposit","Deposit","wallet"],["orders","Pesanan","clock"],["info","Cara Kerja","info"]];
 return <div className="shell"><aside><Logo/><small className="caption">MARKETPLACE DIGITAL</small><nav>{nav.map(([id,t,i])=><button className={page===id?"nav active":"nav"} onClick={()=>setPage(id)} key={id}><Icon n={i}/>{t}</button>)}</nav><div className="side"><div className="balance"><small>Saldo tersedia</small><b>{money(profile?.balance)}</b><button onClick={()=>setPage("deposit")}>Isi saldo +</button></div><button className="logout" onClick={logoutUser}><Icon n="logout"/> Keluar</button></div></aside>
 <main><header><div><span className="eyebrow">SULFA MEDIA STORE</span><h2>{nav.find(x=>x[0]===page)?.[1]}</h2></div><div className="account">{profile?.name||user.email}<b>{profile?.role||"pembeli"}</b></div></header>
 {page==="home"&&<><section className="hero"><div><span className="eyebrow">INSTANT DIGITAL SERVICE</span><h1>Nomor virtual,<br/><em>lebih simpel.</em></h1><p>Pilih layanan, siapkan saldo, dan kelola pesanan dari dashboard SULFA MEDIA STORE.</p><div className="actions"><button className="primary" onClick={()=>setPage("products")}>Lihat nomor →</button><button className="secondary" onClick={()=>setPage("deposit")}>Isi saldo</button></div></div><div className="orbit"><b>SMS</b></div></section>
 <div className="stats"><div>Saldo<strong>{money(profile?.balance)}</strong></div><div>Produk aktif<strong>{products.length}</strong></div><div>Stok<strong>{stock}</strong></div><div>Pembelian<strong>{profile?.purchaseCount||0}</strong></div></div>
 <h3>Nomor populer</h3><div className="grid">{products.slice(0,3).map(p=><Product key={p.id} p={p} onClick={()=>setSelected(p)}/>)}{!products.length&&<div className="emptybox">Belum ada produk aktif di Firestore.</div>}</div></>}
 {page==="products"&&<><div className="intro"><span className="eyebrow">VIRTUAL NUMBER CATALOG</span><h1>Pilih nomor yang kamu butuhkan.</h1><p>Harga dan stok mengikuti katalog Firestore.</p></div><div className="grid">{products.map(p=><Product key={p.id} p={p} onClick={()=>setSelected(p)}/>)}</div></>}
 {page==="deposit"&&<section className="deposit"><div className="panel"><span className="eyebrow">WALLET</span><h1>Isi saldo</h1><p>Masukkan nominal deposit. QRIS gateway akan dibuat oleh backend server.</p><div className="big">{money(profile?.balance)}</div><label>Nominal deposit<input type="number" min="5000" step="1000" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Minimal Rp 5.000"/></label><div className="quick">{[5000,10000,25000,50000].map(v=><button key={v} onClick={()=>setAmount(v)}>{money(v)}</button>)}</div><button className="primary wide" disabled={Number(amount)<5000||depositLoading} onClick={async()=>{setDepositLoading(true);try{const token=await getIdToken(user);const r=await fetch("/api/deposit/create",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({amount:Number(amount)})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Gagal membuat deposit");setDepositData(d)}catch(e){alert(e.message)}finally{setDepositLoading(false)}}}>{depositLoading?"Membuat pembayaran…":"Lanjut ke pembayaran →"}</button><div className="payment"><b>PAYMENT GATEWAY</b><strong>{depositData?.data?.payment_url||depositData?.data?.checkout_url||depositData?.data?.invoice_url?"Pembayaran siap. Buka link/QRIS dari gateway.":"QRIS muncul setelah transaksi deposit dibuat."}</strong>{(depositData?.data?.payment_url||depositData?.data?.checkout_url||depositData?.data?.invoice_url)&&<a className="primary wide" href={depositData.data.payment_url||depositData.data.checkout_url||depositData.data.invoice_url} target="_blank" rel="noreferrer">Buka pembayaran →</a>}<small>Secret key gateway tidak berada di browser.</small></div></div><div className="steps"><div><b>01</b><h3>Buat deposit</h3><p>Transaksi dibuat sebagai pending.</p></div><div><b>02</b><h3>Bayar QRIS</h3><p>QR pembayaran dibuat oleh backend.</p></div><div><b>03</b><h3>Saldo masuk</h3><p>Webhook terverifikasi mengkredit saldo sekali.</p></div></div></section>}
 {page==="orders"&&<div className="emptybox">Riwayat pesanan akan tampil setelah backend order terhubung.</div>}
 {page==="info"&&<section className="intro"><span className="eyebrow">HOW IT WORKS</span><h1>Alur pesanan SULFA.</h1>{[["01","Pilih layanan","Service, negara, dan offer dari katalog API."],["02","Validasi harga","Backend melakukan quote sebelum order."],["03","Buat order","Gunakan idempotencyKey yang sama saat retry."],["04","Tunggu OTP","WAITING_OTP menampilkan nomor sambil menunggu webhook/status."],["05","Selesai","SUCCESS/COMPLETED menandakan order selesai."]].map(x=><div className="timeline" key={x[0]}><b>{x[0]}</b><div><h3>{x[1]}</h3><p>{x[2]}</p></div></div>)}</section>}
 </main>
 {selected&&<div className="modal-bg" onClick={()=>setSelected(null)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}>×</button><span className="eyebrow">PRODUCT DETAIL</span><h2>{selected.name}</h2><p>{selected.description||"Nomor virtual digital."}</p><strong className="price">{money(selected.price)}</strong><p>Negara: <b>{selected.country||"Indonesia"}</b><br/>Stok: <b>{selected.stock||0}</b></p><button className="primary wide" onClick={()=>{setSelected(null);setPage("deposit")}}>Isi saldo untuk membeli →</button></div></div>}
 </div>
}