# 💰 Sikaku Finance

> Aplikasi pencatatan keuangan pribadi — ringan, privat, dan bisa dipakai langsung dari browser tanpa install.

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-brightgreen?logo=googlechrome)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![GitHub Pages](https://img.shields.io/badge/Hosted-GitHub%20Pages-blue?logo=github)](https://pages.github.com/)
[![No Server](https://img.shields.io/badge/Server-None-lightgrey)](.)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Apa itu Sikaku Finance?

**Sikaku Finance** adalah aplikasi web keuangan pribadi yang dibuat untuk membantu kamu mencatat pemasukan dan pengeluaran harian secara mudah dan cepat — langsung dari browser HP atau laptop, tanpa perlu daftar akun atau install aplikasi.

Semua data tersimpan di browser/HP kamu sendiri menggunakan `localStorage`. Tidak ada data yang dikirim ke server manapun.

---

## 🚀 Fitur Utama

| Fitur | Keterangan |
|---|---|
| 📝 **Catat Transaksi** | Tambah pemasukan & pengeluaran dengan kategori |
| 📊 **Dashboard Ringkasan** | Lihat total, saldo, dan rasio tabungan sekilas |
| 🎯 **Alokasi Budget 50/30/20** | Monitor apakah pengeluaran sudah sesuai blueprint |
| ⚡ **Quick Add** | Tambah pengeluaran rutin (pulsa, langganan, dll) sekali ketuk |
| 🔍 **Filter & Cari** | Saring transaksi berdasarkan periode, kategori, jenis, dan kata kunci |
| 📤 **Export Laporan WA** | Buat ringkasan harian/mingguan/bulanan siap kirim ke WhatsApp |
| 💾 **Backup & Restore** | Export data ke JSON (backup penuh) atau CSV (untuk Excel/Sheets) |
| 📥 **Import JSON/CSV** | Pulihkan data dari file backup kapan saja |
| 🌙 **Dark Mode** | Tampilan gelap/terang, otomatis mengikuti preferensi sistem |
| 📱 **PWA** | Bisa diinstall ke home screen HP seperti aplikasi biasa |
| ✈️ **Offline** | Bisa dipakai tanpa koneksi internet setelah pertama kali dibuka |

---

## 🔒 Privasi & Keamanan

- **Tidak ada server** — aplikasi berjalan 100% di sisi klien (browser)
- **Tidak ada login** — tidak perlu akun, tidak ada data yang dikumpulkan
- **Tidak ada tracking** — tidak ada analytics, iklan, atau cookies pihak ketiga
- **Data milikmu sendiri** — tersimpan di `localStorage` browser, bisa diekspor/dihapus kapan saja

---

## 📱 Cara Pakai

### Buka di Browser
Langsung kunjungi link GitHub Pages-nya — tidak perlu install apapun.

### Install ke Home Screen (Opsional)
1. Buka di Chrome/Safari di HP
2. Ketuk menu browser (⋮ di Android / kotak-panah di iOS)
3. Pilih **"Tambahkan ke layar utama"** / **"Add to Home Screen"**
4. Aplikasi bisa dipakai offline seperti app biasa

---

## 💾 Backup & Restore Data

Karena data tersimpan di browser (bukan cloud), **sangat disarankan** untuk rutin backup:

1. Buka menu **Backup & Restore** (ikon database di header atau bottom nav)
2. Klik **"File JSON"** untuk download backup lengkap
3. Simpan file di Google Drive / folder aman
4. Untuk restore: klik **"Pilih File Backup"** dan pilih file JSON tersebut

> ⚠️ Hapus cache browser = data hilang jika tidak di-backup terlebih dahulu.

---

## 🛠️ Teknologi

- **HTML5 + Vanilla CSS + JavaScript** — tanpa framework, tanpa build tools
- **Tailwind CSS** (via CDN) — untuk utility classes
- **Font Awesome** — ikon
- **Google Fonts** — tipografi (Inter + Lexend Deca)
- **Service Worker** — untuk PWA & offline support
- **localStorage** — penyimpanan data lokal

---

## 📂 Struktur File

```
Sikaku/
├── index.html      # Aplikasi utama (HTML + CSS + struktur UI)
├── app.js          # Logika aplikasi (transaksi, filter, render, backup)
├── sw.js           # Service Worker (PWA + caching offline)
├── manifest.json   # PWA manifest (nama, ikon, warna tema)
├── icons/          # Ikon PWA berbagai ukuran
└── README.md       # Dokumentasi ini
```

---

## 🚀 Deploy Sendiri

Karena ini aplikasi statis (tanpa backend), kamu bisa host di mana saja:

**GitHub Pages:**
1. Fork repo ini
2. Masuk ke Settings → Pages
3. Pilih branch `main` → folder `/ (root)`
4. Akses di `https://[username].github.io/Sikaku`

**Vercel / Netlify:**
- Cukup connect repo → deploy otomatis, tanpa konfigurasi tambahan

---

## 📋 Kategori Budget

Sikaku menggunakan sistem alokasi **Blueprint 50/30/20**:

| Kategori | Alokasi | Contoh |
|---|---|---|
| **Kebutuhan (Needs)** | 50% | Essentials, Tagihan, Cicilan |
| **Keinginan (Wants)** | 30% | Entertainment, Makan di luar, Shopping |
| **Tabungan (Savings)** | 20% | Investasi, RDN, Dana darurat |

---

## 🤝 Kontribusi

Pull request dan issue sangat disambut! Beberapa ide pengembangan:

- [ ] Multi-currency support
- [ ] Grafik/chart visualisasi pengeluaran
- [ ] Sinkronisasi antar perangkat (via export/import QR)
- [ ] Recurring transaction (tagihan otomatis bulanan)
- [ ] Notifikasi pengingat (via Push Notification PWA)

---

## 📄 Lisensi

Didistribusikan di bawah lisensi **MIT**. Bebas digunakan, dimodifikasi, dan didistribusikan ulang.

---

<p align="center">
  Dibuat dengan ❤️ untuk membantu keuangan pribadi lebih teratur
</p>
