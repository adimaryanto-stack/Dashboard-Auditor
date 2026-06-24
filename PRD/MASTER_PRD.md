# PRD — Dashboard Auditor
**Version:** 3.2  
**Date:** 24 Juni 2026  
**Status:** ✅ APPROVED FOR DEVELOPMENT  
**Project Type:** Web-Based Spreadsheet Dashboard — Education Budget Transparency (Dashboard Auditor)

---

## DAFTAR ISI

1. [Project Overview](#1-project-overview)
2. [Menu Structure](#2-menu-structure)
3. [Fitur per Menu](#3-fitur-per-menu)
4. [Database Schema](#4-database-schema)
5. [API Endpoints](#5-api-endpoints)
6. [Tech Stack & Frontend Structure](#6-tech-stack--frontend-structure)
7. [System Diagrams](#7-system-diagrams)
8. [MVP Roadmap — 4 Sprint (8 Minggu)](#8-mvp-roadmap--4-sprint-8-minggu)
9. [Success Metrics](#9-success-metrics)
10. [Deployment Plan](#10-deployment-plan)

---

## 1. Project Overview

### 1.1 Deskripsi Aplikasi
Dashboard Auditor adalah aplikasi web berbasis **spreadsheet interface** untuk menampilkan, mengelola, dan mengaudit aliran dana pendidikan Indonesia dari tingkat nasional (APBN) hingga institusi pendidikan di seluruh daerah. Tampilannya menyerupai Excel/Google Sheets dengan semua kalkulasi angka terhubung secara real-time antar menu dan database.

### 1.2 Target User & Role

| Role | Akses | Keterangan |
|------|-------|------------|
| `SUPER_ADMIN` | Full access | Semua menu, termasuk User Manager |
| `ADMIN` | Create, Read, Update | Semua menu data anggaran |
| `ADMIN_PROVINSI` | CRUD untuk provinsinya | Terbatas pada wilayah provinsi |
| `ADMIN_KABKOTA` | CRUD untuk kabkotanya | Terbatas pada wilayah kabkota |
| `VIEWER` | Read-only | Semua menu, tidak bisa edit |
| `AUDITOR` | Read-only + Export | Semua menu, fokus audit trail |

### 1.3 Core Concept: Spreadsheet-Like Interface
- **Tampilan seperti Excel** — table rows & columns, sticky header & footer
- **Inline Editing** — klik sel angka langsung edit, tekan Enter/Tab untuk simpan
- **Kalkulasi Real-Time** — `Selisih = Nominal − Realisasi`, `% = (Realisasi / Nominal) × 100`
- **Conditional Formatting** — badge warna: 🟢 ≥80%, 🟡 50–79%, 🔴 <50%
- **Cascade Update** — edit Institusi → auto-update Kabkota → auto-update Provinsi → auto-update Dashboard
- **Export Excel** — download `.xlsx` dengan formula Excel tersimpan, bukan nilai statis

### 1.4 Business Goals
1. Seluruh aliran dana pendidikan dapat ditelusuri dari APBN hingga institusi
2. Realisasi penyerapan anggaran terpantau secara real-time
3. Mengurangi risiko kebocoran dengan transparansi data publik
4. Memudahkan audit oleh KPK dan BPK
5. Laporan yang sebelumnya manual (2 minggu) dipercepat menjadi otomatis (<1 hari)

---

## 2. Menu Structure

```
📊 Dashboard (Main)
   └── Ringkasan nasional: Nominal, Realisasi, % + Chart

💰 APBN Pertahun
   └── Kelola tahun anggaran: DRAFT → ACTIVE → CLOSED

📍 Provinsi
   └── Spreadsheet 38 provinsi, inline editing

🏛️ Kabupaten / Kota
   └── Filter per provinsi, inline editing

🎓 Jenjang Pendidikan
   ├── Universitas
   ├── SMA
   ├── SMP
   ├── SD
   └── PAUD

👥 User Manager
   └── CRUD users + role assignment
```

---

## 3. Fitur per Menu

### 3.1 Dashboard
**URL:** `/dashboard`

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│  DASHBOARD AUDITOR                       Tahun: [2026 ▼] │
├──────────────────┬──────────────────┬────────────────────┤
│ Total Nominal    │ Total Realisasi  │ % Penyerapan       │
│ 769,1 T          │ 500,4 T          │ 65,1%              │
├──────────────────┴──────────────────┴────────────────────┤
│ Ringkasan per Jenjang                                    │
│  Jenjang     │ Nominal  │ Realisasi │ %    │ Progress    │
│  Universitas │ 150,0 T  │  98,0 T   │66,7% │ ████░░░░   │
│  SMA         │ 200,0 T  │ 130,0 T   │65,0% │ ████░░░░   │
│  SMP         │ 180,0 T  │ 118,0 T   │65,6% │ ████░░░░   │
│  SD          │ 200,0 T  │ 126,0 T   │63,0% │ ████░░░░   │
│  PAUD        │  39,1 T  │  28,4 T   │72,6% │ █████░░░   │
├──────────────────────────────────────────────────────────┤
│ [Bar Chart: Nominal vs Realisasi] [Line: Tren 2020-2026] │
└──────────────────────────────────────────────────────────┘
```

**Fitur:**
- 3 metric card: Total Nominal, Total Realisasi, % Penyerapan Nasional
- Tabel ringkasan per jenjang dengan progress bar
- Bar chart Nominal vs Realisasi per jenjang (Recharts)
- Line chart tren APBN 2020–2026 (Recharts)
- Dropdown tahun anggaran (header kanan atas, global)
- Auto-refresh saat data di menu lain berubah

---

### 3.2 APBN Pertahun
**URL:** `/dashboard/apbn`

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│ APBN PERTAHUN                        [+ Tambah Tahun]             │
├────┬───────┬───────────────────────────────┬──────────┬───────────┤
│ No │ Tahun │ Total Anggaran (APBN Pendidikan│ Status   │ Aksi      │
├────┼───────┼────────────────────────────────┼──────────┼───────────┤
│  1 │ 2020  │ 473.700.000.000.000            │ CLOSED   │ Lihat     │
│  2 │ 2021  │ 472.600.000.000.000            │ CLOSED   │ Lihat     │
│  3 │ 2022  │ 472.600.000.000.000            │ CLOSED   │ Lihat     │
│  4 │ 2023  │ 612.200.000.000.000            │ CLOSED   │ Lihat     │
│  5 │ 2024  │ 665.000.000.000.000            │ CLOSED   │ Lihat     │
│  6 │ 2025  │ 722.600.000.000.000            │ CLOSED   │ Lihat     │
│  7 │ 2026  │ 769.100.000.000.000 ✏️         │ ACTIVE ✓ │ Tutup     │
│  8 │ 2027  │ 0 ✏️                           │ DRAFT    │ Aktifkan  │
└────┴───────┴────────────────────────────────┴──────────┴───────────┘
  ✏️ = cell bisa diklik untuk edit langsung
```

**Status lifecycle:**
```
DRAFT → ACTIVE → CLOSED
  ↓        ↓         ↓
 Baru   Berjalan  Arsip (read-only)
```

**Aturan validasi:**
- Hanya **1 tahun** boleh berstatus `ACTIVE` dalam satu waktu
- Klik "Aktifkan" → tahun ACTIVE lama otomatis berubah ke CLOSED
- Tahun `CLOSED` tidak bisa diedit (read-only, untuk audit trail)
- Tidak bisa hapus tahun yang sudah punya data alokasi provinsi

**Aksi per status:**

| Status | Edit Total | Aktifkan | Tutup | Hapus | Lihat |
|--------|-----------|----------|-------|-------|-------|
| DRAFT  | ✅ | ✅ | ❌ | ✅ | ✅ |
| ACTIVE | ✅ | ❌ | ✅ | ❌ | ✅ |
| CLOSED | ❌ | ❌ | ❌ | ❌ | ✅ |

**Integrasi:** Dropdown "Tahun" di header global mengambil list dari tabel ini. Default = tahun ACTIVE.

---

### 3.3 Provinsi
**URL:** `/dashboard/provinsi`

**Layout:**
```
┌──────────────────────────────────────────────────────────────────────────┐
│ PROVINSI — TAHUN 2026        [🔍 Cari provinsi...]    [⬇ Ekspor Excel]  │
├────┬──────────────────────┬──────────────────┬──────────────┬────────┬───┤
│ No │ Nama Provinsi        │ Nominal (Rp)     │ Realisasi(Rp)│ Selisih│ % │
├────┼──────────────────────┼──────────────────┼──────────────┼────────┼───┤
│  1 │ Aceh                 │ 15.200.000.000   │ 9.800.000.000│  5.4 T │🟡 │
│  2 │ Sumatera Utara       │ 22.400.000.000   │16.200.000.000│  6.2 T │🟡 │
│ ...│ ...                  │ ✏️ klik edit     │ ✏️ klik edit │  auto  │auto│
│ 38 │ Papua Barat Daya     │  4.800.000.000   │ 2.100.000.000│  2.7 T │🔴 │
├────┼──────────────────────┼──────────────────┼──────────────┼────────┼───┤
│    │ TOTAL (38 Provinsi)  │ 769.100.000.000  │500.400.000.000│268.7T │🟡 │
└────┴──────────────────────┴──────────────────┴──────────────┴────────┴───┘
```

**Fitur:**
- Inline edit sel Nominal dan Realisasi (klik langsung)
- Selisih dan % dihitung otomatis di frontend dan database (generated column)
- Search filter by nama provinsi
- Total row sticky di bawah tabel
- Export ke `.xlsx` dengan formula Excel tersimpan

---

### 3.4 Kabupaten / Kota
**URL:** `/dashboard/kabupaten-kota`

**Layout:**
```
┌──────────────────────────────────────────────────────────────────────────┐
│  KABUPATEN/KOTA  [Provinsi: Jawa Barat ▼]  [🔍 Cari...]  [⬇ Ekspor]   │
├────┬─────────────────────┬──────────────┬─────────────┬─────────┬──────┬─┤
│ No │ Kabupaten / Kota    │ Provinsi     │ Nominal(Rp) │ Real(Rp)│Selisi│%│
├────┼─────────────────────┼──────────────┼─────────────┼─────────┼──────┼─┤
│  1 │ Kabupaten Bogor     │ Jawa Barat   │ 4.200.000   │ 3.100.00│  1.1T│🟢│
│  2 │ Kota Bandung        │ Jawa Barat   │ 3.800.000   │ 2.900.00│  0.9T│🟢│
│ ...│ ...                 │ ...          │ ✏️          │ ✏️      │ auto │  │
├────┼─────────────────────┼──────────────┼─────────────┼─────────┼──────┼─┤
│    │ TOTAL               │              │ 20.240.000  │15.000.00│  5.2T│🟡│
└────┴─────────────────────┴──────────────┴─────────────┴─────────┴──────┴─┘
```

**Fitur:**
- Filter dropdown Provinsi (cascading)
- Search by nama kabupaten/kota
- Inline edit + cascade update ke Provinsi secara otomatis
- Jumlah kabupaten/kota yang ditampilkan tertera di toolbar

---

### 3.5 Jenjang Pendidikan (5 Sub-Menu)
**URL:** `/dashboard/jenjang/[universitas|sma|smp|sd|paud]`

Satu komponen reusable (`InstitusiTable`) untuk 5 jenjang berbeda via dynamic route.

**Layout (contoh: SD):**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ JENJANG: SD   [Provinsi: Semua ▼]  [🔍 Cari nama SD...]   [⬇ Ekspor]  10 inst│
├────┬─────────────────────┬────────────────┬──────────────┬─────────────┬───────┤
│ No │ Nama SD             │ Kabupaten/Kota │ Provinsi     │ Nominal(Rp) │ Real  │
├────┼─────────────────────┼────────────────┼──────────────┼─────────────┼───────┤
│  1 │ SDN 01 Menteng      │ Jakarta Pusat  │ DKI Jakarta  │ 800.000.000 │474 Jt │
│  2 │ SDN 02 Bend. Hilir  │ Jakarta Pusat  │ DKI Jakarta  │ 750.000.000 │510 Jt │
│ ...│ ...                 │ ...            │ ...          │ ✏️          │ ✏️    │
├────┼─────────────────────┼────────────────┼──────────────┼─────────────┼───────┤
│    │ TOTAL (10)          │                │              │ 7.060.000   │4.784 M│
└────┴─────────────────────┴────────────────┴──────────────┴─────────────┴───────┘
```

**Fitur:**
- Filter cascading: Provinsi → Kabupaten/Kota
- Search by nama institusi
- Inline edit Nominal dan Realisasi
- Cascade update: edit Institusi → update Kabkota → update Provinsi
- Pagination 100 item/halaman (untuk SD ~150.000 data)
- Import bulk dari Excel (untuk input massal)

---

### 3.6 User Manager
**URL:** `/dashboard/users`

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ USER MANAGER            [+ Tambah User]   [🔍 Cari user...]    8 users     │
├────┬─────────────────────┬───────────────────────┬──────────────┬──────┬───┤
│ No │ User                │ Email                 │ Role         │Status│Aksi│
├────┼─────────────────────┼───────────────────────┼──────────────┼──────┼───┤
│  1 │ [SA] Super Admin    │ admin@kemdikbud.go.id │ Super Admin  │Aktif │Edit│
│  2 │ [AF] Ahmad Fauzi    │ a.fauzi@kemdikbud.id  │ Admin        │Aktif │Edit│
│  3 │ [SD] Sari Dewi      │ s.dewi@jabar.go.id    │ Admin Provinsi│Aktif│Edit│
│ ...│ ...                 │ ...                   │ ...          │ ...  │ ...│
└────┴─────────────────────┴───────────────────────┴──────────────┴──────┴───┘
```

**Fitur:**
- CRUD: Tambah, Edit (modal form), Hapus (soft delete)
- Role assignment: SUPER_ADMIN, ADMIN, ADMIN_PROVINSI, ADMIN_KABKOTA, VIEWER, AUDITOR
- Badge status: Aktif (hijau) / Non-aktif (merah)
- Search by nama, email, atau role
- SUPER_ADMIN tidak bisa dihapus

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram

```mermaid
erDiagram
    tahun_anggaran ||--o{ alokasi_provinsi : has
    provinsi ||--o{ alokasi_provinsi : receives
    provinsi ||--o{ kabupaten_kota : contains
    alokasi_provinsi ||--o{ alokasi_kabupaten_kota : distributes
    kabupaten_kota ||--o{ alokasi_kabupaten_kota : receives
    kabupaten_kota ||--o{ institusi_pendidikan : contains
    users }o--o| provinsi : "limited to (opt)"
    users }o--o| kabupaten_kota : "limited to (opt)"

    tahun_anggaran {
        uuid id PK
        int tahun UK
        decimal total_anggaran
        enum status "DRAFT|ACTIVE|CLOSED"
        timestamp created_at
    }
    provinsi {
        uuid id PK
        varchar kode_provinsi UK
        varchar nama_provinsi
    }
    alokasi_provinsi {
        uuid id PK
        uuid tahun_anggaran_id FK
        uuid provinsi_id FK
        decimal nominal_alokasi
        decimal realisasi_total
        decimal selisih "GENERATED"
        decimal persentase_penyerapan "GENERATED"
        timestamp updated_at
    }
    kabupaten_kota {
        uuid id PK
        uuid provinsi_id FK
        varchar kode_kabupaten_kota UK
        varchar nama_kabupaten_kota
        varchar tipe "KABUPATEN|KOTA"
    }
    alokasi_kabupaten_kota {
        uuid id PK
        uuid alokasi_provinsi_id FK
        uuid kabupaten_kota_id FK
        decimal nominal_alokasi
        decimal realisasi_total
        decimal selisih "GENERATED"
        decimal persentase_penyerapan "GENERATED"
        timestamp updated_at
    }
    institusi_pendidikan {
        uuid id PK
        varchar npsn UK
        varchar nama_institusi
        enum jenjang "UNIVERSITAS|SMA|SMP|SD|PAUD"
        uuid kabupaten_kota_id FK
        decimal nominal_alokasi
        decimal realisasi_total
        decimal selisih "GENERATED"
        decimal persentase_penyerapan "GENERATED"
        timestamp updated_at
    }
    users {
        uuid id PK
        varchar username UK
        varchar email UK
        varchar password_hash
        enum role
        uuid provinsi_id FK "nullable"
        uuid kabupaten_kota_id FK "nullable"
        boolean is_active
        timestamp created_at
    }
```

### 4.2 DDL Tabel Utama

```sql
-- Tahun Anggaran
CREATE TABLE tahun_anggaran (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tahun         INT UNIQUE NOT NULL,
  total_anggaran DECIMAL(15,2) NOT NULL,
  status        VARCHAR(10) DEFAULT 'DRAFT',  -- DRAFT | ACTIVE | CLOSED
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Provinsi (master data)
CREATE TABLE provinsi (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_provinsi  VARCHAR(10) UNIQUE,
  nama_provinsi  VARCHAR(255) NOT NULL
);

-- Alokasi per Provinsi
CREATE TABLE alokasi_provinsi (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tahun_anggaran_id     UUID REFERENCES tahun_anggaran(id),
  provinsi_id           UUID REFERENCES provinsi(id),
  nominal_alokasi       DECIMAL(15,2) NOT NULL,
  realisasi_total       DECIMAL(15,2) DEFAULT 0,
  selisih               DECIMAL(15,2) GENERATED ALWAYS AS
                          (nominal_alokasi - realisasi_total) STORED,
  persentase_penyerapan DECIMAL(5,2)  GENERATED ALWAYS AS
                          (CASE WHEN nominal_alokasi > 0
                           THEN (realisasi_total / nominal_alokasi) * 100
                           ELSE 0 END) STORED,
  updated_at            TIMESTAMP DEFAULT NOW()
);

-- Kabupaten / Kota (master data)
CREATE TABLE kabupaten_kota (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provinsi_id           UUID REFERENCES provinsi(id),
  kode_kabupaten_kota   VARCHAR(10) UNIQUE,
  nama_kabupaten_kota   VARCHAR(255) NOT NULL,
  tipe                  VARCHAR(20)  -- KABUPATEN | KOTA
);

-- Alokasi per Kabupaten/Kota
CREATE TABLE alokasi_kabupaten_kota (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alokasi_provinsi_id   UUID REFERENCES alokasi_provinsi(id),
  kabupaten_kota_id     UUID REFERENCES kabupaten_kota(id),
  nominal_alokasi       DECIMAL(15,2) NOT NULL,
  realisasi_total       DECIMAL(15,2) DEFAULT 0,
  selisih               DECIMAL(15,2) GENERATED ALWAYS AS
                          (nominal_alokasi - realisasi_total) STORED,
  persentase_penyerapan DECIMAL(5,2)  GENERATED ALWAYS AS
                          (CASE WHEN nominal_alokasi > 0
                           THEN (realisasi_total / nominal_alokasi) * 100
                           ELSE 0 END) STORED,
  updated_at            TIMESTAMP DEFAULT NOW()
);

-- Institusi Pendidikan (Universitas / SMA / SMP / SD / PAUD)
CREATE TABLE institusi_pendidikan (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  npsn                  VARCHAR(20) UNIQUE NOT NULL,
  nama_institusi        VARCHAR(255) NOT NULL,
  jenjang               VARCHAR(20) NOT NULL,  -- UNIVERSITAS|SMA|SMP|SD|PAUD
  kabupaten_kota_id     UUID REFERENCES kabupaten_kota(id),
  nominal_alokasi       DECIMAL(15,2) NOT NULL,
  realisasi_total       DECIMAL(15,2) DEFAULT 0,
  selisih               DECIMAL(15,2) GENERATED ALWAYS AS
                          (nominal_alokasi - realisasi_total) STORED,
  persentase_penyerapan DECIMAL(5,2)  GENERATED ALWAYS AS
                          (CASE WHEN nominal_alokasi > 0
                           THEN (realisasi_total / nominal_alokasi) * 100
                           ELSE 0 END) STORED,
  updated_at            TIMESTAMP DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username          VARCHAR(50) UNIQUE NOT NULL,
  email             VARCHAR(255) UNIQUE NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  role              VARCHAR(20) NOT NULL,
  provinsi_id       UUID REFERENCES provinsi(id),
  kabupaten_kota_id UUID REFERENCES kabupaten_kota(id),
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMP DEFAULT NOW()
);
```

### 4.3 Database Triggers (Cascade Update)

```sql
-- Trigger 1: update Kabkota saat Institusi berubah
CREATE OR REPLACE FUNCTION update_kabkota_realisasi()
RETURNS TRIGGER AS $$
DECLARE v_kabkota_id UUID; v_alokasi_kabkota_id UUID;
BEGIN
  SELECT kabupaten_kota_id INTO v_kabkota_id
    FROM institusi_pendidikan WHERE id = NEW.id;

  SELECT akk.id INTO v_alokasi_kabkota_id
    FROM alokasi_kabupaten_kota akk
    WHERE akk.kabupaten_kota_id = v_kabkota_id LIMIT 1;

  UPDATE alokasi_kabupaten_kota
    SET realisasi_total = (
      SELECT COALESCE(SUM(realisasi_total), 0)
      FROM institusi_pendidikan WHERE kabupaten_kota_id = v_kabkota_id
    )
  WHERE id = v_alokasi_kabkota_id;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_kabkota
AFTER INSERT OR UPDATE OF realisasi_total ON institusi_pendidikan
FOR EACH ROW EXECUTE FUNCTION update_kabkota_realisasi();

-- Trigger 2: update Provinsi saat Kabkota berubah
CREATE OR REPLACE FUNCTION update_provinsi_realisasi()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE alokasi_provinsi
    SET realisasi_total = (
      SELECT COALESCE(SUM(realisasi_total), 0)
      FROM alokasi_kabupaten_kota
      WHERE alokasi_provinsi_id = NEW.alokasi_provinsi_id
    )
  WHERE id = NEW.alokasi_provinsi_id;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_provinsi
AFTER INSERT OR UPDATE OF realisasi_total ON alokasi_kabupaten_kota
FOR EACH ROW EXECUTE FUNCTION update_provinsi_realisasi();
```

### 4.4 Indexes untuk Performance

```sql
CREATE INDEX idx_alokasi_prov_tahun    ON alokasi_provinsi(tahun_anggaran_id);
CREATE INDEX idx_alokasi_kabkota_prov  ON alokasi_kabupaten_kota(alokasi_provinsi_id);
CREATE INDEX idx_institusi_jenjang     ON institusi_pendidikan(jenjang);
CREATE INDEX idx_institusi_kabkota     ON institusi_pendidikan(kabupaten_kota_id);
CREATE INDEX idx_institusi_nama        ON institusi_pendidikan(nama_institusi);
```

---

## 5. API Endpoints

### 5.1 Auth
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login dengan username + password |
| POST | `/api/auth/logout` | Logout & invalidate session |
| GET  | `/api/auth/session` | Get current session |

### 5.2 Dashboard
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/dashboard/summary?tahun=2026` | Ringkasan nasional + per jenjang |

### 5.3 APBN Pertahun
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET    | `/api/tahun-anggaran` | List semua tahun |
| POST   | `/api/tahun-anggaran` | Create tahun baru (status: DRAFT) |
| PUT    | `/api/tahun-anggaran/:id` | Update total anggaran |
| PUT    | `/api/tahun-anggaran/:id/activate` | Set ACTIVE (close yang lain) |
| PUT    | `/api/tahun-anggaran/:id/close` | Set CLOSED |
| DELETE | `/api/tahun-anggaran/:id` | Hapus (hanya DRAFT) |

### 5.4 Provinsi
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/provinsi?tahun=2026` | List 38 provinsi + alokasi |
| PUT | `/api/provinsi/:id` | Update nominal atau realisasi |

### 5.5 Kabupaten / Kota
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET  | `/api/kabupaten-kota?provinsi_id=&tahun=2026` | List dengan filter |
| PUT  | `/api/kabupaten-kota/:id` | Update nominal atau realisasi |
| POST | `/api/kabupaten-kota` | Tambah kabkota baru |

### 5.6 Institusi (Jenjang Pendidikan)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET  | `/api/institusi?jenjang=SD&provinsi_id=&kabupaten_kota_id=&page=1` | List dengan filter + pagination |
| PUT  | `/api/institusi/:id` | Update nominal atau realisasi |
| POST | `/api/institusi` | Tambah institusi baru |
| POST | `/api/institusi/bulk-import` | Import massal dari Excel |

### 5.7 Users
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET    | `/api/users` | List semua users |
| POST   | `/api/users` | Tambah user baru |
| PUT    | `/api/users/:id` | Edit user |
| DELETE | `/api/users/:id` | Soft delete (is_active = false) |

### 5.8 Export
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/export/provinsi?tahun=2026` | Download Excel provinsi |
| GET | `/api/export/kabupaten-kota?provinsi_id=` | Download Excel kabkota |
| GET | `/api/export/institusi?jenjang=SD` | Download Excel institusi |

---

## 6. Tech Stack & Frontend Structure

### 6.1 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **State** | Zustand |
| **Styling** | Tailwind CSS |
| **Table** | TanStack Table v8 + custom EditableCell |
| **Charts** | Recharts |
| **Form** | React Hook Form + Zod |
| **ORM** | Drizzle ORM |
| **Database** | PostgreSQL 15+ |
| **Auth** | Better Auth v2 |
| **Export** | ExcelJS + file-saver |
| **Icons** | Lucide React |

### 6.2 Frontend Structure (Implemented)

```
dashboard-auditor/                   ← Next.js 14 project
│
├── app/
│   ├── layout.tsx                   ← Root layout + metadata SEO
│   ├── page.tsx                     ← Redirect → /dashboard
│   ├── globals.css                  ← Tailwind + custom sheet classes
│   ├── login/page.tsx               ← Halaman login (form + validasi)
│   └── dashboard/
│       ├── layout.tsx               ← Sidebar + main wrapper
│       ├── page.tsx                 ← Dashboard: cards + tabel + charts
│       ├── apbn/page.tsx            ← APBN: manage tahun anggaran
│       ├── provinsi/page.tsx        ← Spreadsheet 38 provinsi
│       ├── kabupaten-kota/page.tsx  ← Kabkota dengan filter provinsi
│       ├── jenjang/[jenjang]/page.tsx ← Dynamic: Univ/SMA/SMP/SD/PAUD
│       └── users/page.tsx           ← User Manager CRUD
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx              ← Navigasi + accordion Jenjang
│   │   └── Header.tsx               ← Page title + dropdown tahun
│   ├── ui/
│   │   ├── PctBadge.tsx             ← Badge % (hijau/kuning/merah)
│   │   ├── MetricCard.tsx           ← Summary card
│   │   ├── StatusBadge.tsx          ← DRAFT / ACTIVE / CLOSED badge
│   │   └── SheetWrap.tsx            ← Container tabel + toolbar slot
│   └── spreadsheet/
│       └── EditableCell.tsx         ← Click-to-edit inline cell
│
├── lib/
│   ├── store.ts                     ← Zustand global state + actions
│   ├── data/index.ts                ← Mock data (38 prov, kabkota, inst.)
│   └── utils/
│       ├── formatters.ts            ← fmtTriliun, fmtRupiah, fmtPct
│       └── cn.ts                   ← clsx + tailwind-merge helper
│
└── types/index.ts                   ← TypeScript interfaces semua entitas
```

### 6.3 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dashboard_auditor"

# Auth
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Storage (production)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET="dashboard-auditor-exports"
AWS_REGION="ap-southeast-1"
```

---

## 7. System Diagrams

### 7.1 Arsitektur Sistem

```mermaid
graph TB
    subgraph "Frontend — Next.js 14"
        UI[React Components]
        Table[EditableCell + SheetWrap]
        Charts[Recharts Dashboard]
        Zustand[Zustand Global Store]
    end

    subgraph "API Layer — Next.js API Routes"
        AuthAPI[/api/auth]
        DashAPI[/api/dashboard]
        DataAPI[/api/provinsi, kabupaten-kota, institusi]
        UserAPI[/api/users]
        ExportAPI[/api/export]
    end

    subgraph "Business Logic"
        Zod[Zod Validation]
        Calc[Real-time Calculation]
        ExcelJS[ExcelJS Export]
    end

    subgraph "Database — PostgreSQL 15+"
        DB[(PostgreSQL)]
        Triggers[DB Triggers<br/>Cascade Update]
        GenCol[Generated Columns<br/>selisih & %]
        Drizzle[Drizzle ORM]
    end

    UI --> Table --> Zustand
    UI --> Charts
    UI --> AuthAPI & DashAPI & DataAPI & UserAPI & ExportAPI
    DataAPI --> Zod --> Calc --> Drizzle --> DB
    ExportAPI --> ExcelJS
    DB --> Triggers --> DB
    DB --> GenCol

    style UI fill:#3b82f6,color:#fff
    style DB fill:#7c3aed,color:#fff
    style Triggers fill:#ef4444,color:#fff
```

### 7.2 Alur Navigasi Menu

```mermaid
graph LR
    Root[Dashboard Auditor] --> Dash[📊 Dashboard]
    Root --> APBN[💰 APBN Pertahun]
    Root --> Prov[📍 Provinsi]
    Root --> Kab[🏛️ Kabupaten/Kota]
    Root --> Jenj[🎓 Jenjang Pendidikan]
    Root --> Users[👥 User Manager]

    Jenj --> Univ[Universitas]
    Jenj --> SMA[SMA]
    Jenj --> SMP[SMP]
    Jenj --> SD[SD]
    Jenj --> PAUD[PAUD]

    Dash --> DashF["3 Metric Cards<br/>Tabel Jenjang<br/>2 Charts (Bar + Line)"]
    APBN --> APBNF["Manage Tahun<br/>DRAFT→ACTIVE→CLOSED"]
    Prov --> ProvF["38 Provinsi<br/>Inline Edit + Export"]
    Kab --> KabF["Filter Provinsi<br/>Inline Edit + Cascade"]
    SD --> SDF["Filter Provinsi+Kabkota<br/>Search + Pagination"]

    style APBN fill:#059669,color:#fff
    style Prov fill:#ea580c,color:#fff
    style Kab fill:#ca8a04,color:#fff
    style Jenj fill:#16a34a,color:#fff
    style Users fill:#7c3aed,color:#fff
```

### 7.3 Alur Cascade Update (Inline Edit → DB → UI)

```mermaid
flowchart TB
    A([User klik sel Realisasi\nSDN 01 Menteng]) --> B[Ketik nilai baru\nTekan Enter / Blur]
    B --> C[Frontend:\nHitung Selisih & %\nTampil langsung]
    C --> D[PUT /api/institusi/:id\nrealisasi_total = nilai baru]
    D --> E{Zod Validate}
    E -->|Invalid| F[❌ Kembalikan nilai lama]
    E -->|Valid| G[(UPDATE institusi_pendidikan)]
    G --> H[🔧 Trigger:\nupdate_kabkota_realisasi]
    H --> I[(UPDATE alokasi_kabupaten_kota\nrealisasi_total = SUM institusi)]
    I --> J[🔧 Trigger:\nupdate_provinsi_realisasi]
    J --> K[(UPDATE alokasi_provinsi\nrealisasi_total = SUM kabkota)]
    K --> L[✅ 200 OK]
    L --> M[Frontend Refresh\nDashboard + Provinsi + Kabkota\nterbarui otomatis]

    style G fill:#7c3aed,color:#fff
    style I fill:#7c3aed,color:#fff
    style K fill:#7c3aed,color:#fff
    style H fill:#ef4444,color:#fff
    style J fill:#ef4444,color:#fff
    style M fill:#16a34a,color:#fff
```

### 7.4 Alur User Interaction (Login → Edit → Export)

```mermaid
flowchart TD
    Start([Buka Aplikasi]) --> Login[Halaman Login]
    Login --> Cred[Input Username & Password]
    Cred --> Auth{Valid?}
    Auth -->|Tidak| Err[❌ Pesan error] --> Login
    Auth -->|Ya| Dashboard[📊 Dashboard\nMenu Sidebar tampil]

    Dashboard --> Nav{Pilih Menu}

    Nav -->|APBN| PageAPBN[APBN Pertahun\nKelola tahun anggaran]
    Nav -->|Provinsi| PageProv[Provinsi\nSpreadsheet 38 prov]
    Nav -->|Kabkota| PageKab[Kabupaten/Kota\nFilter + Spreadsheet]
    Nav -->|Jenjang| PageJenj[Pilih: Univ/SMA/SMP/SD/PAUD]
    Nav -->|Users| PageUser[User Manager CRUD]

    PageProv --> EditProv[Klik sel angka → Edit]
    EditProv --> SaveProv[Enter / Blur → Auto-save]
    SaveProv --> RecalcProv[Selisih & % update otomatis]
    RecalcProv --> Nav

    PageProv --> ExportProv[Klik Ekspor Excel]
    ExportProv --> DL[Download .xlsx\nFormula tersimpan] --> Nav

    PageAPBN --> AddYear[Tambah Tahun Baru]
    AddYear --> Draft[Status: DRAFT]
    Draft --> Activate[Aktifkan → ACTIVE]
    Activate --> Nav

    Dashboard --> Logout[Logout] --> End([Redirect ke Login])

    style Dashboard fill:#dc2626,color:#fff
    style PageAPBN fill:#059669,color:#fff
    style PageProv fill:#ea580c,color:#fff
    style PageKab fill:#ca8a04,color:#fff
    style PageJenj fill:#16a34a,color:#fff
    style PageUser fill:#7c3aed,color:#fff
```

### 7.5 Sequence Diagram: Cell Edit Flow

```mermaid
sequenceDiagram
    actor User
    participant Cell as EditableCell
    participant API as Next.js API
    participant DB as PostgreSQL
    participant Trigger as DB Trigger

    User->>Cell: Klik sel angka
    Cell-->>User: Input field tampil
    User->>Cell: Ketik nilai → Enter
    Cell->>Cell: Hitung Selisih & % (langsung)
    Cell->>API: PUT /api/institusi/:id
    API->>API: Validasi (Zod)
    alt Valid
        API->>DB: UPDATE realisasi_total
        DB->>Trigger: Trigger fired
        Trigger->>DB: UPDATE alokasi_kabupaten_kota
        Trigger->>DB: UPDATE alokasi_provinsi
        DB-->>API: 200 OK
        API-->>Cell: Success
        Cell-->>User: ✅ Tersimpan
    else Invalid
        API-->>Cell: 400 Error
        Cell-->>User: ❌ Nilai dikembalikan
    end
```

---

## 8. MVP Roadmap — 4 Sprint (8 Minggu)

### Sprint 1 — Foundation & Dashboard (Week 1–2)
**Goal:** Setup project, database, auth, layout, dan halaman Dashboard.

| Day | Task | Deliverable |
|-----|------|-------------|
| 1–2 | Init Next.js, Tailwind, Zustand, Drizzle | Project structure siap |
| 3–4 | Drizzle schema, migration, seed 38 provinsi + users | DB ready dengan data |
| 5   | Better Auth setup, login page, protected routes | Auth flow working |
| 6–7 | Sidebar, Header, Dashboard layout | Navigation functional |
| 8–10| Dashboard page: metric cards, tabel jenjang, 2 charts | Dashboard live |
| 11–12| **APBN Pertahun page** + API CRUD + status management | APBN menu working |

**Deliverable:** Login → Dashboard → APBN menu fully functional.

---

### Sprint 2 — Provinsi & Kabupaten/Kota (Week 3–4)
**Goal:** Spreadsheet interface dengan inline editing dan cascade update.

| Day | Task | Deliverable |
|-----|------|-------------|
| 13–15| EditableCell component, SheetWrap, PctBadge | Reusable sheet components |
| 16–17| Provinsi page + API GET/PUT + search + export | Provinsi spreadsheet |
| 18–20| Kabupaten/Kota page + filter dropdown Provinsi | Kabkota dengan filter |
| 21–22| DB Triggers (Institusi→Kabkota→Provinsi) | Cascade update working |
| 23–24| Test end-to-end + fix bugs | Sprint 2 stable |

**Deliverable:** Edit sel Provinsi/Kabkota → cascade update → Dashboard ikut berubah.

---

### Sprint 3 — Jenjang Pendidikan (Week 5–6)
**Goal:** 5 sub-menu jenjang pendidikan dengan filter cascading dan pagination.

| Day | Task | Deliverable |
|-----|------|-------------|
| 25–27| Reusable InstitusiTable component | 1 component untuk 5 jenjang |
| 28–29| Dynamic route `/jenjang/[jenjang]` | 5 halaman dari 1 file |
| 30–31| Filter cascading (Provinsi → Kabkota) + search | Filter functional |
| 32–33| Pagination (100/halaman) — untuk SD ~150k data | Large data handled |
| 34–36| Bulk import dari Excel + test cascade | Import massal + cascade ok |

**Deliverable:** Semua 5 jenjang working, filter, search, pagination, cascade update.

---

### Sprint 4 — User Manager & Polish (Week 7–8)
**Goal:** User management, export, RBAC, performance, final testing.

| Day | Task | Deliverable |
|-----|------|-------------|
| 37–38| User Manager page: list, add, edit, delete | CRUD users |
| 39–40| RBAC middleware: protect routes per role | Permission enforced |
| 41–42| Enhanced Excel export (formula + formatting) | Export production-ready |
| 43–44| DB indexing + query optimization | Page load < 1s |
| 45–46| Cross-browser testing + mobile responsive check | Stable di semua device |
| 47–48| Bug fixes (P0, P1) + dokumentasi + deploy staging | Ready for production |

**Deliverable:** Aplikasi production-ready, semua menu functional, RBAC enforced.

---

### Timeline Visual

```
Week  1   2   3   4   5   6   7   8
      ├───┤   ├───┤   ├───┤   ├───┤
SP1   ████████
SP2           ████████
SP3                   ████████
SP4                           ████████
```

---

## 9. Success Metrics

### Performance
| Metric | Target |
|--------|--------|
| Dashboard load time | < 1 detik |
| Tabel besar (SD 150k) | < 2 detik |
| Cell edit → saved | < 500ms |
| Cascade update (institusi → provinsi) | < 1 detik |
| Filter/search result | < 500ms |

### Data Integrity
| Metric | Target |
|--------|--------|
| Akurasi kalkulasi cascade | 100% |
| Data hilang saat inline edit | 0% |
| Validasi realisasi > nominal dicegah | 100% |

### User Experience
| Metric | Target |
|--------|--------|
| Inline edit terasa seperti Excel | Ya (no lag) |
| Conditional formatting update real-time | Ya |
| Export mempertahankan formula Excel | Ya |

### Adoption
| Metric | Target |
|--------|--------|
| Pengguna aktif bulan ke-3 | ≥ 80% dari user terdaftar |
| Waktu pelaporan vs manual | Turun 70% (dari 2 minggu → < 1 hari) |

---

## 10. Deployment Plan

### Development
```bash
# Setup lokal
npm install
cp .env.example .env.local   # isi DATABASE_URL, BETTER_AUTH_SECRET
npm run db:migrate            # jalankan migrasi
npm run db:seed               # seed 38 provinsi + default users
npm run dev                   # http://localhost:3000
```

### Production

| Komponen | Platform |
|----------|----------|
| Frontend + API | Vercel (auto-scaling serverless) |
| Database | Railway (staging) / AWS RDS PostgreSQL (production) |
| File Storage / Export | AWS S3 |
| DNS + SSL | Cloudflare |
| Error Tracking | Sentry |

### Checklist Pre-Deploy
- [ ] Semua environment variable dikonfigurasi di Vercel
- [ ] Migrasi database production sudah dijalankan
- [ ] Seed data: 38 provinsi, master kabkota, default SUPER_ADMIN user
- [ ] HTTPS aktif (auto via Vercel + Cloudflare)
- [ ] Smoke test: Login → Dashboard → Edit cell → Cascade update → Export
- [ ] Performance test dengan 10.000+ records
- [ ] RBAC test: akses menu yang tidak diizinkan per role

---

## Appendix: Referensi Data

### Data APBN Pendidikan (Sesuai File Excel)
| Tahun | Total Anggaran | Status |
|-------|----------------|--------|
| 2020  | Rp 473,7 Triliun | CLOSED |
| 2021  | Rp 472,6 Triliun | CLOSED |
| 2022  | Rp 472,6 Triliun | CLOSED |
| 2023  | Rp 612,2 Triliun | CLOSED |
| 2024  | Rp 665,0 Triliun | CLOSED |
| 2025  | Rp 722,6 Triliun | CLOSED |
| 2026  | Rp 769,1 Triliun | **ACTIVE** |

### Ringkasan per Jenjang (2026)
| Jenjang | Nominal | Realisasi | % Penyerapan |
|---------|---------|-----------|-------------|
| Universitas | 150,0 T | 98,0 T | 65,3% |
| SMA | 200,0 T | 130,0 T | 65,0% |
| SMP | 180,0 T | 118,0 T | 65,6% |
| SD | 200,0 T | 126,0 T | 63,0% |
| PAUD | 39,1 T | 28,4 T | 72,6% |
| **TOTAL** | **769,1 T** | **500,4 T** | **65,1%** |

### Contoh Data SDN 01 Menteng (Sesuai Screenshot)
```
Nama Institusi : SDN 01 Menteng
Kabupaten/Kota : Jakarta Pusat
Provinsi       : DKI Jakarta
Nominal        : Rp 800.000.000
Realisasi      : Rp 474.414.000
Selisih        : Rp 325.586.000
% Penyerapan   : 59,30%
```

---

## Appendix B: Changelog / Revision History

| Version | Tanggal | Perubahan |
|---------|---------|----------|
| 3.2 | 24 Juni 2026 | Sinkronisasi versi & tanggal, tambah Changelog, update status Sprint 4 |
| 3.1 | 24 Juni 2026 | Rename proyek ke Dashboard Auditor, update tech stack (Next.js 16, React 19, Tailwind v4), status Sprint 4 |
| 3.0 | 2 Mei 2026 | Final Consolidated — gabung PRD v1, v2, MVP Roadmap v2, System Diagrams v2, Update Summary APBN |
| 2.0 | April 2026 | Tambah menu Audit Anggaran, Profil Institusi, detail sumber dana & pengeluaran |
| 1.0 | Maret 2026 | PRD awal: 6 menu utama, database schema, API endpoints, system diagrams |

---

**Document Version**: 3.2  
**Compiled from**: PRD v1, PRD v2, MVP Roadmap v2, System Diagrams v2, Update Summary APBN  
**Last Updated**: 24 Juni 2026  
**Ready for**: Sprint 4 Completion (RBAC, Export, Optimization)
