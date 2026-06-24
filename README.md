# Dashboard Auditor 🇮🇩

**Version:** 1.0.0 &nbsp;|&nbsp; **Updated:** 24 Juni 2026

Sistem informasi modern bergaya _spreadsheet_ untuk pemantauan, alokasi, transparansi, dan audit Anggaran Pendapatan dan Belanja Negara (APBN) di sektor Pendidikan Indonesia.

Aplikasi ini menyajikan *dashboard* dengan performa tinggi yang memungkinkan instansi terkait (mulai dari tingkat nasional hingga daerah) memantau alokasi vs realisasi anggaran secara berjenjang dan real-time.

![Dashboard Utama](public/screenshots/dashboard.png)

## 📸 Screenshots Menu Aplikasi (Localhost)

Berikut adalah visualisasi antarmuka sistem di lingkungan pengembangan lokal:

### 1. Dashboard Utama
Menampilkan metrik agregat APBN Pendidikan Nasional, bagan Nominal vs Realisasi per Jenjang, serta tren tahunan alokasi anggaran.
![Dashboard](public/screenshots/dashboard.png)

---

### 2. APBN Pertahun
Halaman visualisasi data detail alokasi APBN pendidikan per tahun anggaran.
![APBN Pertahun](public/screenshots/apbn.png)

---

### 3. Provinsi
Tabel spreadsheet interaktif tingkat Provinsi untuk melihat alokasi, realisasi, selisih (sisa), serta persentase penyerapan dana daerah.
![Provinsi](public/screenshots/provinsi.png)

---

### 4. Kabupaten / Kota
Spreadsheet tingkat Kabupaten / Kota yang merinci alokasi anggaran dan status penyerapan spesifik wilayah.
![Kabupaten / Kota](public/screenshots/kabkota.png)

---

### 5. Jenjang Pendidikan (Universitas)
Halaman per jenjang pendidikan yang melacak alokasi dana institusi secara berjenjang.
![Jenjang Universitas](public/screenshots/jenjang_universitas.png)

---

### 6. Profil Institusi
Detail profil keuangan, sumber dana, pengeluaran bulanan, dan rincian transaksi per institusi pendidikan.
![Profil Institusi](public/screenshots/profil_institusi.png)

---

### 7. Audit Anggaran
Halaman audit dengan daftar anomali transaksi mencurigakan, dilengkapi status audit (BELUM DIPROSES, INVESTIGASI, SELESAI) yang terintegrasi secara real-time dan ter-sinkronisasi ke Supabase.
![Audit Anggaran](public/screenshots/audit.png)

---

### 8. User Manager
Panel pengelolaan akun pengguna (Role-Based Access Control) untuk Admin, Auditor, dan Viewer.
![User Manager](public/screenshots/users.png)

---

### 9. Integrasi & Migrasi Supabase
Panel integrasi untuk pengujian koneksi database, inisialisasi tabel skema SQL, dan migrasi/impor data dari mock ke database awan (Supabase).
![Integrasi Supabase](public/screenshots/test_supabase.png)

---

## ✨ Fitur Utama

- **Navigasi Berjenjang (Hierarki)**: Pemantauan dana mulai dari **APBN Nasional -> Provinsi -> Kabupaten/Kota -> Jenjang Pendidikan** (Universitas, SMA, SMP, SD, PAUD).
- **Antarmuka Bergaya Spreadsheet**: 
  - Input data nominal dan realisasi secara langsung *(inline editing)*.
  - Perhitungan **Selisih** dan **Persentase Penyerapan** otomatis (kaskade) dari bawah ke atas.
- **Visualisasi Data**: *Dashboard* analitik dengan metrik utama dan grafik tren tahunan menggunakan *Recharts*.
- **Desain Modern (Glassmorphism)**: UI/UX premium dengan *Light Mode*, efek *frosted glass* (transparan-blur), serta aksen warna yang halus.
- **Manajemen Pengguna (RBAC)**: Role-Based Access Control (Super Admin, Admin Provinsi, Auditor, Viewer, dll.) dengan kontrol status aktif/non-aktif.
- **Sinkronisasi Database**: Terhubung dengan database cloud **Supabase** secara dinamis (fallback otomatis ke simulasi data lokal jika koneksi Supabase terputus).

## 🛠️ Stack Teknologi

Sistem ini dibangun menggunakan ekosistem *web modern* dengan performa tinggi:

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) & React 19
- **Bahasa**: TypeScript (Strict Typing)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) dengan arsitektur variabel berbasis `@theme`.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Ikon & Grafik**: Lucide React & Recharts
- **Font**: Inter (Google Fonts)

## 📂 Struktur Proyek

```text
dashboard-auditor/
├── app/                  # Next.js App Router (Halaman & Layout)
│   ├── dashboard/        # Halaman utama aplikasi (APBN, Provinsi, Kab/Kota, dll.)
│   ├── globals.css       # Root stylesheet (Tailwind v4 tokens & utility classes)
│   └── layout.tsx        # Root layout (Provider & Font)
├── components/           # Komponen UI Reusable
│   ├── layout/           # Sidebar, Header, Shell
│   └── ui/               # PctBadge, StatusBadge, MetricCard, dll.
├── lib/                  # Utilitas dan Data
│   ├── data/             # Mock data deterministic & generator
│   ├── store/            # Global state (Zustand)
│   └── utils/            # Fungsi format mata uang, persentase, class merger (clsx)
├── PRD/                  # Kumpulan Product Requirements Document (Master)
└── types/                # Definisi tipe data TypeScript (Interface)
```

## 🚀 Memulai Pengembangan (Development)

Pastikan Anda memiliki [Node.js](https://nodejs.org/) (versi 18+ disarankan) terinstal di sistem Anda.

1. **Clone repository ini**
   ```bash
   git clone https://github.com/adimaryanto-stack/Dashboard-Auditor.git
   cd Dashboard-Auditor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Jalankan Development Server**
   ```bash
   npm run dev
   ```

4. **Akses Aplikasi**
   Buka [http://localhost:3002](http://localhost:3002) di browser Anda. Halaman utama adalah rute `/dashboard`.

## 📖 Dokumentasi Lengkap (PRD)

Dokumentasi rancangan produk, arsitektur, dan peta jalan (roadmap) pengembangan telah digabung menjadi satu file untuk memudahkan referensi:
- Cek file **[`PRD/MASTER_PRD.md`](./PRD/MASTER_PRD.md)**

## 📋 Changelog

### v1.0.0 — 24 Juni 2026
- **refactor:** Rename project menjadi *Dashboard Auditor* di seluruh file (README, PRD, MVP, types, CSS, SQL, Header)
- **docs:** Update README.md dan tambah screenshot menu localhost
- **fix:** Tambah `DROP POLICY IF EXISTS` untuk mencegah error duplikat di Supabase SQL editor
- **fix:** Tambah RLS policies UPDATE & DELETE pada skema Supabase, perbaiki store subscription untuk daftar anomali
- **fix:** Resolve semua lint errors, unescaped JSX quotes, dan conditional hook placement agar production build lolos
- **fix:** Gunakan `rollupKabKotaChange` di halaman kabupaten-kota untuk menjaga konsistensi rollup provinsi
- **fix:** Populate relasi provinsi pada `alokasi_provinsi`, sinkronisasi module vars saat session restore
- **fix:** Resolve loading stuck, slow sync, dan masalah data Supabase (DashboardDbLoader, Zustand persist, lazy load)
- **feat:** Implement full digit number formatting, audit status save flow
- **feat:** Sync penuh dengan Supabase, spreadsheet cells editable, fix compilation errors
- **feat:** Hubungkan Supabase database client, dynamic data dual-mode, setup skema DB & sinkronisasi data awal

### v0.1.0 — April 2026 (Initial Release)
- **feat:** Setup project Next.js 16 + React 19 + Tailwind CSS v4
- **feat:** Dashboard utama dengan metric cards, tabel ringkasan jenjang, dan chart (Recharts)
- **feat:** Halaman APBN Pertahun dengan manajemen status DRAFT → ACTIVE → CLOSED
- **feat:** Spreadsheet Provinsi (38 provinsi) dengan inline editing
- **feat:** Spreadsheet Kabupaten/Kota dengan filter dropdown provinsi
- **feat:** Dynamic route Jenjang Pendidikan (Universitas, SMA, SMP, SD, PAUD)
- **feat:** Profil Institusi dengan detail sumber dana & pengeluaran bulanan
- **feat:** Halaman Audit Anggaran dengan deteksi anomali
- **feat:** User Manager CRUD dengan Role-Based Access Control
- **feat:** Integrasi & Migrasi Supabase (setup skema, import data)
- **feat:** Mock data deterministik untuk seluruh 38 provinsi dan 514 kabupaten/kota
- **docs:** Upload PRD v3.1 dan MVP Roadmap v2

---

## 🛡️ Lisensi & Kepemilikan

Proyek ini merupakan purwarupa (prototype) untuk inisiatif transparansi anggaran. Dikembangkan untuk keperluan internal instansi terkait.