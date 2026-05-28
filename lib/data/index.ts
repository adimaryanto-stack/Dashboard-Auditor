// ============================================
// Mock Data — Sistem Transparansi Anggaran Pendidikan
// All data is deterministic (no Math.random) to avoid hydration mismatches
// ============================================
import {
  TahunAnggaran,
  AlokasiProvinsi,
  AlokasiKabupatenKota,
  InstitusiPendidikan,
  User,
  DashboardSummary,
  Jenjang,
  SumberDanaInstitusi,
  PengeluaranBulananInstitusi,
  ProfilInstitusi,
  RincianPengeluaranItem,
  RincianPengeluaranBulanan,
  JenjangBreakdownProvinsi,
} from '@/types';

// Deterministic pseudo-random based on seed
function seededValues(count: number, min: number, max: number, seed: number): number[] {
  const result: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 16807 + 7) % 2147483647;
    result.push(min + (s / 2147483647) * (max - min));
  }
  return result;
}

// === TAHUN ANGGARAN ===
export let tahunAnggaranData: TahunAnggaran[] = [
  { id: '1', tahun: 2020, total_anggaran: 473_700_000_000_000, status: 'CLOSED', created_at: '2020-01-01' },
  { id: '2', tahun: 2021, total_anggaran: 472_600_000_000_000, status: 'CLOSED', created_at: '2021-01-01' },
  { id: '3', tahun: 2022, total_anggaran: 472_600_000_000_000, status: 'CLOSED', created_at: '2022-01-01' },
  { id: '4', tahun: 2023, total_anggaran: 612_200_000_000_000, status: 'CLOSED', created_at: '2023-01-01' },
  { id: '5', tahun: 2024, total_anggaran: 665_000_000_000_000, status: 'CLOSED', created_at: '2024-01-01' },
  { id: '6', tahun: 2025, total_anggaran: 722_600_000_000_000, status: 'CLOSED', created_at: '2025-01-01' },
  { id: '7', tahun: 2026, total_anggaran: 769_100_000_000_000, status: 'ACTIVE', created_at: '2026-01-01' },
  { id: '8', tahun: 2027, total_anggaran: 0, status: 'DRAFT', created_at: '2026-06-01' },
];

export function updateTahunAnggaranData(newData: TahunAnggaran[]) {
  tahunAnggaranData = newData;
}

// === 38 PROVINSI ===
const provinsiNames = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi',
  'Sumatera Selatan', 'Bengkulu', 'Lampung', 'Kep. Bangka Belitung',
  'Kep. Riau', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta',
  'Jawa Timur', 'Banten', 'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
  'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur',
  'Kalimantan Utara', 'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan',
  'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat', 'Maluku', 'Maluku Utara',
  'Papua', 'Papua Barat', 'Papua Selatan', 'Papua Tengah', 'Papua Pegunungan',
  'Papua Barat Daya',
];

const nominalDistribution = [
  15.2, 28.5, 14.8, 16.3, 9.2, 19.5, 6.8, 18.2, 5.1, 7.4,
  35.0, 55.8, 48.2, 12.5, 52.0, 22.5, 9.8, 12.3, 14.5, 11.2,
  8.5, 10.1, 14.8, 5.2, 9.8, 10.5, 25.5, 9.8, 4.2, 5.8,
  7.2, 5.5, 18.5, 8.2, 6.8, 7.5, 5.8, 4.8,
];

const realisasiPct = [
  64.5, 72.3, 68.1, 71.2, 65.8, 69.4, 62.3, 73.5, 78.2, 75.6,
  88.5, 74.1, 69.2, 82.4, 81.5, 70.8, 79.5, 66.3, 58.2, 62.8,
  64.5, 68.9, 73.2, 59.8, 71.5, 63.8, 72.4, 61.2, 68.5, 58.9,
  55.3, 52.8, 48.2, 51.2, 45.8, 42.5, 38.9, 43.8,
];

const targetTotal2026 = 769_100_000_000_000;
const originalTotal2026 = 583_500_000_000_000;

const originalTotalReal = nominalDistribution.reduce((sum, val, idx) => {
  return sum + val * 1_000_000_000_000 * (realisasiPct[idx] / 100);
}, 0);
const targetTotalReal = Math.round(originalTotalReal * (targetTotal2026 / originalTotal2026));

let distributedProvNominal = 0;
let distributedProvRealisasi = 0;

export const alokasiProvinsiData: AlokasiProvinsi[] = provinsiNames.map((nama, i) => {
  const isLast = i === provinsiNames.length - 1;
  const baseNom = nominalDistribution[i] * 1_000_000_000_000;
  
  let nominal = 0;
  if (isLast) {
    nominal = targetTotal2026 - distributedProvNominal;
  } else {
    nominal = Math.round(baseNom * (targetTotal2026 / originalTotal2026));
    distributedProvNominal += nominal;
  }

  const baseReal = Math.round(baseNom * (realisasiPct[i] / 100));

  let realisasi = 0;
  if (isLast) {
    realisasi = targetTotalReal - distributedProvRealisasi;
  } else {
    realisasi = Math.round(baseReal * (targetTotal2026 / originalTotal2026));
    distributedProvRealisasi += realisasi;
  }

  return {
    id: `prov-${i + 1}`,
    tahun_anggaran_id: '7',
    provinsi_id: `p-${i + 1}`,
    provinsi: { id: `p-${i + 1}`, kode_provinsi: `${11 + i}`, nama_provinsi: nama },
    nominal_alokasi: nominal,
    realisasi_total: realisasi,
    selisih: nominal - realisasi,
    persentase_penyerapan: nominal > 0 ? (realisasi / nominal) * 100 : 0,
    updated_at: '2026-04-15',
  };
});

// === KABUPATEN/KOTA ===
const kabkotaJabar = [
  { nama: 'Kabupaten Bogor', tipe: 'KABUPATEN' as const },
  { nama: 'Kabupaten Sukabumi', tipe: 'KABUPATEN' as const },
  { nama: 'Kabupaten Cianjur', tipe: 'KABUPATEN' as const },
  { nama: 'Kabupaten Bandung', tipe: 'KABUPATEN' as const },
  { nama: 'Kabupaten Garut', tipe: 'KABUPATEN' as const },
  { nama: 'Kabupaten Tasikmalaya', tipe: 'KABUPATEN' as const },
  { nama: 'Kabupaten Ciamis', tipe: 'KABUPATEN' as const },
  { nama: 'Kabupaten Kuningan', tipe: 'KABUPATEN' as const },
  { nama: 'Kabupaten Cirebon', tipe: 'KABUPATEN' as const },
  { nama: 'Kabupaten Majalengka', tipe: 'KABUPATEN' as const },
  { nama: 'Kabupaten Sumedang', tipe: 'KABUPATEN' as const },
  { nama: 'Kabupaten Indramayu', tipe: 'KABUPATEN' as const },
  { nama: 'Kabupaten Subang', tipe: 'KABUPATEN' as const },
  { nama: 'Kabupaten Purwakarta', tipe: 'KABUPATEN' as const },
  { nama: 'Kabupaten Karawang', tipe: 'KABUPATEN' as const },
  { nama: 'Kabupaten Bekasi', tipe: 'KABUPATEN' as const },
  { nama: 'Kabupaten Bandung Barat', tipe: 'KABUPATEN' as const },
  { nama: 'Kabupaten Pangandaran', tipe: 'KABUPATEN' as const },
  { nama: 'Kota Bogor', tipe: 'KOTA' as const },
  { nama: 'Kota Sukabumi', tipe: 'KOTA' as const },
  { nama: 'Kota Bandung', tipe: 'KOTA' as const },
  { nama: 'Kota Cirebon', tipe: 'KOTA' as const },
  { nama: 'Kota Bekasi', tipe: 'KOTA' as const },
  { nama: 'Kota Depok', tipe: 'KOTA' as const },
  { nama: 'Kota Cimahi', tipe: 'KOTA' as const },
  { nama: 'Kota Tasikmalaya', tipe: 'KOTA' as const },
  { nama: 'Kota Banjar', tipe: 'KOTA' as const },
];

// Real kabupaten/kota names per province
type KT = { nama: string; tipe: 'KABUPATEN' | 'KOTA' };
const K = (n: string): KT => ({ nama: `Kab. ${n}`, tipe: 'KABUPATEN' });
const C = (n: string): KT => ({ nama: `Kota ${n}`, tipe: 'KOTA' });

const kabkotaPerProvinsi: KT[][] = [
  /* Aceh */        [K('Aceh Besar'),K('Aceh Utara'),K('Aceh Timur'),K('Aceh Barat'),K('Pidie'),C('Banda Aceh'),C('Lhokseumawe')],
  /* Sumut */       [K('Deli Serdang'),K('Langkat'),K('Simalungun'),K('Karo'),K('Asahan'),K('Labuhanbatu'),C('Medan'),C('Pematangsiantar'),C('Binjai')],
  /* Sumbar */      [K('Agam'),K('Tanah Datar'),K('Pesisir Selatan'),K('Solok'),K('Limapuluh Kota'),C('Padang'),C('Bukittinggi'),C('Payakumbuh')],
  /* Riau */        [K('Kampar'),K('Bengkalis'),K('Indragiri Hilir'),K('Rokan Hulu'),K('Siak'),C('Pekanbaru'),C('Dumai')],
  /* Jambi */       [K('Muaro Jambi'),K('Batanghari'),K('Tebo'),K('Bungo'),K('Merangin'),C('Jambi'),C('Sungai Penuh')],
  /* Sumsel */      [K('Ogan Komering Ulu'),K('Musi Banyuasin'),K('Banyuasin'),K('Muara Enim'),K('Lahat'),C('Palembang'),C('Prabumulih'),C('Lubuklinggau')],
  /* Bengkulu */    [K('Rejang Lebong'),K('Bengkulu Utara'),K('Seluma'),K('Kaur'),C('Bengkulu')],
  /* Lampung */     [K('Lampung Tengah'),K('Lampung Selatan'),K('Lampung Timur'),K('Tanggamus'),K('Way Kanan'),C('Bandar Lampung'),C('Metro')],
  /* Babel */       [K('Bangka'),K('Belitung'),K('Bangka Barat'),K('Bangka Selatan'),C('Pangkalpinang')],
  /* Kepri */       [K('Bintan'),K('Karimun'),K('Natuna'),K('Lingga'),C('Batam'),C('Tanjungpinang')],
  /* DKI */         [C('Jakarta Pusat'),C('Jakarta Utara'),C('Jakarta Barat'),C('Jakarta Selatan'),C('Jakarta Timur'),K('Kep. Seribu')],
  /* Jabar - already defined separately */ kabkotaJabar,
  /* Jateng */      [K('Cilacap'),K('Banyumas'),K('Kebumen'),K('Purworejo'),K('Magelang'),K('Semarang'),K('Demak'),K('Kudus'),C('Semarang'),C('Surakarta'),C('Magelang'),C('Salatiga')],
  /* DIY */         [K('Sleman'),K('Bantul'),K('Gunungkidul'),K('Kulon Progo'),C('Yogyakarta')],
  /* Jatim */       [K('Sidoarjo'),K('Gresik'),K('Malang'),K('Jember'),K('Banyuwangi'),K('Kediri'),K('Mojokerto'),K('Lamongan'),K('Pasuruan'),C('Surabaya'),C('Malang'),C('Kediri'),C('Batu')],
  /* Banten */      [K('Tangerang'),K('Serang'),K('Pandeglang'),K('Lebak'),C('Tangerang'),C('Cilegon'),C('Serang'),C('Tangerang Selatan')],
  /* Bali */        [K('Badung'),K('Gianyar'),K('Tabanan'),K('Klungkung'),K('Buleleng'),K('Karangasem'),C('Denpasar')],
  /* NTB */         [K('Lombok Barat'),K('Lombok Tengah'),K('Lombok Timur'),K('Sumbawa'),K('Dompu'),C('Mataram'),C('Bima')],
  /* NTT */         [K('Kupang'),K('Timor Tengah Selatan'),K('Sikka'),K('Ende'),K('Manggarai'),K('Flores Timur'),C('Kupang')],
  /* Kalbar */      [K('Pontianak'),K('Sambas'),K('Ketapang'),K('Sintang'),K('Sanggau'),C('Pontianak'),C('Singkawang')],
  /* Kalteng */     [K('Kotawaringin Barat'),K('Kotawaringin Timur'),K('Kapuas'),K('Barito Selatan'),K('Murung Raya'),C('Palangka Raya')],
  /* Kalsel */      [K('Banjar'),K('Tanah Laut'),K('Hulu Sungai Selatan'),K('Tabalong'),K('Barito Kuala'),C('Banjarmasin'),C('Banjarbaru')],
  /* Kaltim */      [K('Kutai Kartanegara'),K('Berau'),K('Paser'),K('Kutai Barat'),K('Penajam Paser Utara'),C('Samarinda'),C('Balikpapan'),C('Bontang')],
  /* Kaltara */     [K('Bulungan'),K('Malinau'),K('Nunukan'),K('Tana Tidung'),C('Tarakan')],
  /* Sulut */       [K('Minahasa'),K('Bolaang Mongondow'),K('Minahasa Selatan'),K('Sangihe'),C('Manado'),C('Bitung'),C('Tomohon')],
  /* Sulteng */     [K('Donggala'),K('Poso'),K('Toli-Toli'),K('Banggai'),K('Morowali'),C('Palu')],
  /* Sulsel */      [K('Gowa'),K('Bone'),K('Wajo'),K('Maros'),K('Bulukumba'),K('Luwu'),K('Pangkep'),C('Makassar'),C('Parepare'),C('Palopo')],
  /* Sultra */      [K('Konawe'),K('Muna'),K('Buton'),K('Kolaka'),K('Konawe Selatan'),C('Kendari'),C('Baubau')],
  /* Gorontalo */   [K('Gorontalo'),K('Boalemo'),K('Pohuwato'),K('Bone Bolango'),C('Gorontalo')],
  /* Sulbar */      [K('Mamuju'),K('Majene'),K('Polewali Mandar'),K('Mamasa'),C('Mamuju')],
  /* Maluku */      [K('Maluku Tengah'),K('Maluku Tenggara'),K('Buru'),K('Seram Bagian Barat'),K('Kepulauan Aru'),C('Ambon'),C('Tual')],
  /* Malut */       [K('Halmahera Utara'),K('Halmahera Selatan'),K('Halmahera Tengah'),K('Kepulauan Sula'),C('Ternate'),C('Tidore Kepulauan')],
  /* Papua */       [K('Jayapura'),K('Merauke'),K('Nabire'),K('Mimika'),K('Keerom'),C('Jayapura')],
  /* Papua Barat */ [K('Manokwari'),K('Fak-Fak'),K('Sorong'),K('Raja Ampat'),C('Sorong')],
  /* Papua Sel */   [K('Merauke'),K('Boven Digoel'),K('Mappi'),K('Asmat'),C('Merauke')],
  /* Papua Teng */  [K('Nabire'),K('Paniai'),K('Mimika'),K('Puncak Jaya'),C('Nabire')],
  /* Papua Peg */   [K('Jayawijaya'),K('Yahukimo'),K('Pegunungan Bintang'),K('Lanny Jaya'),C('Wamena')],
  /* Papua BD */    [K('Teluk Bintuni'),K('Sorong Selatan'),K('Maybrat'),K('Tambrauw'),C('Sorong')],
];

// Deterministic percentage values for kabkota
const kabkotaPctSeeds = seededValues(600, 42, 92, 42);

export function getKabkotaByProvinsi(provinsiId: string): AlokasiKabupatenKota[] {
  const provIdx = parseInt(provinsiId.replace('p-', ''), 10) - 1;
  const templates = kabkotaPerProvinsi[provIdx] || [];
  const provData = alokasiProvinsiData.find(p => p.provinsi_id === provinsiId);
  if (!provData) return [];
  const totalNominal = provData.nominal_alokasi;
  const totalRealisasi = provData.realisasi_total;

  // Deterministic share values
  const shareVals = seededValues(templates.length, 0.7, 1.3, provIdx * 100 + 7);
  const totalShareVal = shareVals.reduce((a, b) => a + b, 0);

  let distributedNominal = 0;
  let distributedRealisasi = 0;

  return templates.map((kab, i) => {
    const isLast = i === templates.length - 1;
    const share = shareVals[i] / totalShareVal;
    
    let nominal = 0;
    if (isLast) {
      nominal = totalNominal - distributedNominal;
    } else {
      nominal = Math.round(totalNominal * share);
      distributedNominal += nominal;
    }
    
    const pct = kabkotaPctSeeds[(provIdx * 15 + i) % kabkotaPctSeeds.length];
    
    let realisasi = 0;
    if (isLast) {
      realisasi = totalRealisasi - distributedRealisasi;
    } else {
      realisasi = Math.round(nominal * pct / 100);
      distributedRealisasi += realisasi;
    }

    return {
      id: `kab-${provinsiId}-${i}`,
      alokasi_provinsi_id: provData.id,
      kabupaten_kota_id: `k-${provinsiId}-${i}`,
      kabupaten_kota: {
        id: `k-${provinsiId}-${i}`,
        provinsi_id: provinsiId,
        kode_kabupaten_kota: `${provinsiId.replace('p-', '')}.${String(i + 1).padStart(2, '0')}`,
        nama_kabupaten_kota: kab.nama,
        tipe: kab.tipe,
      },
      provinsi_nama: provData.provinsi.nama_provinsi,
      nominal_alokasi: nominal,
      realisasi_total: realisasi,
      selisih: nominal - realisasi,
      persentase_penyerapan: nominal > 0 ? Math.round((realisasi / nominal) * 1000) / 10 : 0,
      updated_at: '2026-04-15',
    };
  });
}

export function getAllKabkota(): AlokasiKabupatenKota[] {
  return alokasiProvinsiData.flatMap(p => getKabkotaByProvinsi(p.provinsi_id));
}

// === INSTITUSI PENDIDIKAN ===
const universitas = [
  'Universitas Indonesia', 'Institut Teknologi Bandung', 'Universitas Gadjah Mada',
  'Institut Pertanian Bogor', 'Universitas Airlangga', 'Universitas Diponegoro',
  'Universitas Padjadjaran', 'Universitas Brawijaya', 'Universitas Hasanuddin',
  'Universitas Sumatera Utara', 'Universitas Andalas', 'Universitas Riau',
  'Universitas Lampung', 'Universitas Sriwijaya', 'Universitas Jember',
  'Universitas Sebelas Maret', 'Universitas Negeri Yogyakarta', 'Universitas Negeri Malang',
  'Universitas Negeri Semarang', 'Universitas Negeri Surabaya',
];

const smaNames = [
  'SMAN 1 Jakarta', 'SMAN 3 Bandung', 'SMAN 1 Yogyakarta', 'SMAN 5 Surabaya',
  'SMAN 1 Denpasar', 'SMAN 1 Semarang', 'SMAN 2 Jakarta', 'SMAN 1 Malang',
  'SMAN 1 Medan', 'SMAN 1 Makassar', 'SMAN 8 Jakarta', 'SMAN 1 Bogor',
  'SMAN 1 Padang', 'SMAN 1 Palembang', 'SMAN 1 Bekasi',
];

const smpNames = [
  'SMPN 1 Jakarta', 'SMPN 1 Bandung', 'SMPN 1 Surabaya', 'SMPN 1 Yogyakarta',
  'SMPN 1 Semarang', 'SMPN 1 Malang', 'SMPN 1 Denpasar', 'SMPN 1 Medan',
  'SMPN 2 Jakarta', 'SMPN 1 Makassar', 'SMPN 1 Bogor', 'SMPN 1 Bekasi',
  'SMPN 1 Depok', 'SMPN 1 Tangerang', 'SMPN 1 Palembang',
];

const sdNames = [
  'SDN 01 Menteng', 'SDN 02 Bendungan Hilir', 'SDN 01 Cikini', 'SDN 01 Bandung',
  'SDN 01 Surabaya', 'SDN 01 Yogyakarta', 'SDN 01 Semarang', 'SDN 01 Malang',
  'SDN 01 Denpasar', 'SDN 01 Medan', 'SDN 01 Makassar', 'SDN 01 Padang',
  'SDN 01 Palembang', 'SDN 01 Bogor', 'SDN 01 Bekasi',
];

const paudNames = [
  'PAUD Al-Ikhlas Jakarta', 'PAUD Tunas Bangsa Bandung', 'PAUD Ceria Surabaya',
  'PAUD Harapan Yogyakarta', 'PAUD Bintang Semarang', 'PAUD Melati Malang',
  'PAUD Pelangi Denpasar', 'PAUD Kasih Medan', 'PAUD Mandiri Makassar',
  'PAUD Anggrek Padang', 'PAUD Mawar Palembang', 'PAUD Dahlia Bogor',
];

// Deterministic share values for institution nominal
const instNominalFactors = seededValues(30, 0.6, 1.4, 999);
const instPctValues = seededValues(30, 42, 95, 777);

function generateInstitusi(names: string[], jenjang: Jenjang, baseNominal: number): InstitusiPendidikan[] {
  const kabkotaList = getKabkotaByProvinsi('p-12'); // Jawa Barat as default
  return names.map((nama, i) => {
    const nominal = baseNominal * instNominalFactors[i % instNominalFactors.length];
    const pct = instPctValues[i % instPctValues.length];
    const realisasi = Math.round(nominal * pct / 100);
    const kab = kabkotaList[i % kabkotaList.length];
    return {
      id: `inst-${jenjang.toLowerCase()}-${i}`,
      npsn: `${jenjang === 'UNIVERSITAS' ? '3' : jenjang === 'SMA' ? '2' : jenjang === 'SMP' ? '1' : jenjang === 'SD' ? '0' : '9'}${String(1000 + i)}`,
      nama_institusi: nama,
      jenjang,
      kabupaten_kota_id: kab?.kabupaten_kota?.id || 'k-p-12-0',
      kabupaten_kota_nama: kab?.kabupaten_kota?.nama_kabupaten_kota || 'Kabupaten Bogor',
      provinsi_nama: 'Jawa Barat',
      status_sekolah: (i % 3 === 0 || nama.includes('Al-Ikhlas') || nama.includes('Bina') || nama.includes('Pelita')) ? 'SWASTA' : 'NEGERI',
      nomor_rekening: `${123 + i}.${456 + i * 3}.${789 + i * 7}.000`,
      nominal_alokasi: Math.round(nominal),
      realisasi_total: realisasi,
      selisih: Math.round(nominal) - realisasi,
      persentase_penyerapan: Math.round(pct * 10) / 10,
      updated_at: '2026-04-15',
    };
  });
}

export function getInstitusiByJenjang(jenjang: Jenjang): InstitusiPendidikan[] {
  switch (jenjang) {
    case 'UNIVERSITAS': return generateInstitusi(universitas, 'UNIVERSITAS', 2_000_000_000_000);
    case 'SMA': return generateInstitusi(smaNames, 'SMA', 800_000_000_000);
    case 'SMP': return generateInstitusi(smpNames, 'SMP', 750_000_000_000);
    case 'SD': return generateInstitusi(sdNames, 'SD', 700_000_000_000);
    case 'PAUD': return generateInstitusi(paudNames, 'PAUD', 300_000_000_000);
    default: return [];
  }
}

// === USERS ===
export const usersData: User[] = [
  { id: 'u1', username: 'superadmin', email: 'admin@kemdikbud.go.id', role: 'SUPER_ADMIN', is_active: true, created_at: '2024-01-01' },
  { id: 'u2', username: 'ahmad.fauzi', email: 'a.fauzi@kemdikbud.go.id', role: 'ADMIN', is_active: true, created_at: '2024-02-15' },
  { id: 'u3', username: 'sari.dewi', email: 's.dewi@jabar.go.id', role: 'ADMIN_PROVINSI', provinsi_id: 'p-12', is_active: true, created_at: '2024-03-10' },
  { id: 'u4', username: 'budi.santoso', email: 'b.santoso@bandung.go.id', role: 'ADMIN_KABKOTA', kabupaten_kota_id: 'k-p-12-3', is_active: true, created_at: '2024-04-20' },
  { id: 'u5', username: 'viewer.nasional', email: 'viewer@kemdikbud.go.id', role: 'VIEWER', is_active: true, created_at: '2024-05-01' },
  { id: 'u6', username: 'auditor.bpk', email: 'audit@bpk.go.id', role: 'AUDITOR', is_active: true, created_at: '2024-06-01' },
  { id: 'u7', username: 'rina.wulan', email: 'r.wulan@jatim.go.id', role: 'ADMIN_PROVINSI', provinsi_id: 'p-15', is_active: true, created_at: '2024-07-01' },
  { id: 'u8', username: 'doni.pratama', email: 'd.pratama@kemdikbud.go.id', role: 'ADMIN', is_active: false, created_at: '2024-01-15' },
];

// === DASHBOARD SUMMARY ===
// Pre-computed realisasi values for trend (deterministic)
const trendRealisasiPct = [68.2, 70.5, 72.1, 65.8, 71.3, 73.8, 67.5];

export function getDashboardSummary(tahun: number = 2026): DashboardSummary {
  const targetTahun = tahunAnggaranData.find(t => t.tahun === tahun) || tahunAnggaranData[6]; // default to 2026
  const baseTahun = tahunAnggaranData[6]; // 2026 (769.1 T)
  const scale = targetTahun.total_anggaran > 0 ? targetTahun.total_anggaran / baseTahun.total_anggaran : 1.0;

  // Let's vary the realisasi percentage slightly based on the year for realism
  const seed = (tahun % 7) || 1;
  const realisasiShift = 0.95 + (seed * 0.012); // slight variations

  const baseNominal = alokasiProvinsiData.reduce((s, p) => s + p.nominal_alokasi, 0);
  const baseRealisasi = alokasiProvinsiData.reduce((s, p) => s + p.realisasi_total, 0);

  const totalNominal = targetTahun.total_anggaran;
  const totalRealisasi = Math.min(totalNominal, Math.round(baseRealisasi * scale * realisasiShift));

  // Precise Jenjang math rollup (remainder to PAUD)
  const uniNom = Math.round(150_000_000_000_000 * scale);
  const smaNom = Math.round(200_000_000_000_000 * scale);
  const smpNom = Math.round(180_000_000_000_000 * scale);
  const sdNom = Math.round(200_000_000_000_000 * scale);
  const paudNom = totalNominal - uniNom - smaNom - smpNom - sdNom;

  const uniReal = Math.min(uniNom, Math.round(98_000_000_000_000 * scale * realisasiShift));
  const smaReal = Math.min(smaNom, Math.round(130_000_000_000_000 * scale * realisasiShift));
  const smpReal = Math.min(smpNom, Math.round(118_000_000_000_000 * scale * realisasiShift));
  const sdReal = Math.min(sdNom, Math.round(126_000_000_000_000 * scale * realisasiShift));
  const paudReal = totalRealisasi - uniReal - smaReal - smpReal - sdReal;

  const jenjangData: Record<Jenjang, { nominal: number; realisasi: number }> = {
    UNIVERSITAS: { nominal: uniNom, realisasi: uniReal },
    SMA: { nominal: smaNom, realisasi: smaReal },
    SMP: { nominal: smpNom, realisasi: smpReal },
    SD: { nominal: sdNom, realisasi: sdReal },
    PAUD: { nominal: paudNom, realisasi: paudReal },
  };

  const activeYears = tahunAnggaranData.filter(t => t.status !== 'DRAFT');

  return {
    total_nominal: totalNominal,
    total_realisasi: totalRealisasi,
    persentase_penyerapan: totalNominal > 0 ? (totalRealisasi / totalNominal) * 100 : 0,
    per_jenjang: (Object.keys(jenjangData) as Jenjang[]).map(j => ({
      jenjang: j,
      nominal: jenjangData[j].nominal,
      realisasi: jenjangData[j].realisasi,
      persentase: jenjangData[j].nominal > 0 ? (jenjangData[j].realisasi / jenjangData[j].nominal) * 100 : 0,
    })),
    tren_tahunan: activeYears.map((t, i) => ({
      tahun: t.tahun,
      nominal: t.total_anggaran,
      realisasi: Math.round(t.total_anggaran * (trendRealisasiPct[i] || 70) / 100),
    })),
  };
}

// === PROFIL INSTITUSI ===
const bulanNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// Monthly spending distribution (higher in early months, tapering off)
const monthlyPctDistribution = [
  0.12, 0.10, 0.10, 0.10, 0.10, 0.10,
  0.10, 0.10, 0.04, 0.008, 0.004, 0.004,
];

function generateSumberDana(institusi: InstitusiPendidikan, tahun: number = 2026): SumberDanaInstitusi[] {
  const apbnNominal = Math.round(institusi.nominal_alokasi * 0.65);
  const apbdNominal = Math.round(institusi.nominal_alokasi * 0.20);
  const csrNominal = institusi.nominal_alokasi - apbnNominal - apbdNominal;

  const apbnRealisasi = Math.round(institusi.realisasi_total * 0.65);
  const apbdRealisasi = Math.round(institusi.realisasi_total * 0.20);
  const csrRealisasi = institusi.realisasi_total - apbnRealisasi - apbdRealisasi;

  const items: SumberDanaInstitusi[] = [
    {
      id: `sd-${institusi.id}-1`,
      institusi_id: institusi.id,
      nama_sumber: `APBN Pendidikan (Pemerintah Pusat) ${tahun}`,
      tahun_anggaran: String(tahun),
      nominal: apbnNominal,
      realisasi: apbnRealisasi,
      saldo_di_bank: apbnNominal - apbnRealisasi,
    },
    {
      id: `sd-${institusi.id}-2`,
      institusi_id: institusi.id,
      nama_sumber: `APBD ${institusi.kabupaten_kota_nama} ${tahun}`,
      tahun_anggaran: String(tahun),
      nominal: apbdNominal,
      realisasi: apbdRealisasi,
      saldo_di_bank: apbdNominal - apbdRealisasi,
    },
    {
      id: `sd-${institusi.id}-3`,
      institusi_id: institusi.id,
      nama_sumber: `Corporate Social Responsibility (CSR Swasta) ${tahun}`,
      tahun_anggaran: String(tahun),
      nominal: csrNominal,
      realisasi: csrRealisasi,
      saldo_di_bank: csrNominal - csrRealisasi,
    },
  ];

  return items;
}

function generatePengeluaranBulanan(institusi: InstitusiPendidikan): PengeluaranBulananInstitusi[] {
  const totalRealisasi = institusi.realisasi_total;
  const pcts = [0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.08, 0.08, 0.08, 0.06, 0.05, 0.05];
  
  let distributedSum = 0;
  return bulanNames.map((bulan, i) => {
    let nominal = 0;
    if (i === 11) {
      nominal = totalRealisasi - distributedSum;
    } else {
      nominal = Math.round(totalRealisasi * pcts[i]);
      distributedSum += nominal;
    }
    return {
      id: `pb-${institusi.id}-${i}`,
      institusi_id: institusi.id,
      nomor: i + 1,
      bulan,
      nominal_pengeluaran: nominal,
      qty: 1,
      sub_total: nominal,
    };
  });
}

export function getProfilInstitusi(id: string, tahun: number = 2026): ProfilInstitusi | null {
  let found: InstitusiPendidikan | null = null;

  const targetTahun = tahunAnggaranData.find(t => t.tahun === tahun) || tahunAnggaranData[6];
  const baseTahun = tahunAnggaranData[6];
  const scale = targetTahun.total_anggaran > 0 ? targetTahun.total_anggaran / baseTahun.total_anggaran : 1.0;
  const seed = (tahun % 7) || 1;
  const shift = 0.95 + (seed * 0.012);

  if (id.startsWith('inst-k-p-') || id.startsWith('inst-kab-')) {
    const match = id.match(/(k(?:ab)?-p-\d+-\d+)/);
    if (match) {
      const kabkotaId = match[1];
      const provMatch = kabkotaId.match(/k(?:ab)?-p-(\d+)-/);
      const provId = provMatch ? `p-${provMatch[1]}` : 'p-1';
      const provData = alokasiProvinsiData.find(p => p.provinsi_id === provId);
      const kabkotaData = getKabkotaByProvinsi(provId).find(k => k.kabupaten_kota_id === kabkotaId);
      
      if (provData && kabkotaData) {
        const scaledKabkotaNominal = Math.round(kabkotaData.nominal_alokasi * scale);
        const schools = getInstitusiByKabkota(
          kabkotaId,
          kabkotaData.kabupaten_kota.nama_kabupaten_kota,
          provData.provinsi.nama_provinsi,
          scaledKabkotaNominal
        );
        found = schools.find(inst => inst.id === id) || null;
      }
    }
  } else {
    // Search across all jenjang
    const allJenjang: Jenjang[] = ['UNIVERSITAS', 'SMA', 'SMP', 'SD', 'PAUD'];
    for (const j of allJenjang) {
      const list = getInstitusiByJenjang(j);
      const match = list.find(inst => inst.id === id);
      if (match) {
        const nominal = Math.round(match.nominal_alokasi * scale);
        const realisasi = Math.min(nominal, Math.round(match.realisasi_total * scale * shift));
        found = {
          ...match,
          nominal_alokasi: nominal,
          realisasi_total: realisasi,
          selisih: nominal - realisasi,
          persentase_penyerapan: nominal > 0 ? Math.round((realisasi / nominal) * 1000) / 10 : 0,
        };
        break;
      }
    }
  }

  if (!found) return null;

  const sumberDana = generateSumberDana(found, tahun);
  const pengeluaranBulanan = generatePengeluaranBulanan(found);

  const totalNominalSumber = sumberDana.reduce((s, d) => s + d.nominal, 0);
  const totalRealisasiSumber = sumberDana.reduce((s, d) => s + d.realisasi, 0);
  const saldoSurplusDefisit = totalNominalSumber - totalRealisasiSumber;

  return {
    institusi: found,
    sumber_dana: sumberDana,
    pengeluaran_bulanan: pengeluaranBulanan,
    saldo_surplus_defisit: saldoSurplusDefisit,
  };
}

export function getAllInstitusi(): InstitusiPendidikan[] {
  const allJenjang: Jenjang[] = ['UNIVERSITAS', 'SMA', 'SMP', 'SD', 'PAUD'];
  return allJenjang.flatMap(j => getInstitusiByJenjang(j));
}

// === RINCIAN PENGELUARAN BULANAN (DETAIL PER ITEM) ===
const produkJasaUniv = [
  { nama: 'Pembangunan Gedung Mahasiswa', hargaBase: 150_000_000, qtyBase: 1 },
  { nama: 'Pengadaan Buku Ajar A', hargaBase: 2_000_000, qtyBase: 600 },
  { nama: 'Pengadaan Buku Ajar B', hargaBase: 2_000_000, qtyBase: 600 },
  { nama: 'Pengadaan Buku Ajar C', hargaBase: 2_000_000, qtyBase: 600 },
  { nama: 'Pengadaan ATK untuk Tata Usaha', hargaBase: 2_000_000, qtyBase: 1 },
  { nama: 'Pembayaran Listrik', hargaBase: 7_000_000, qtyBase: 1 },
  { nama: 'Transportasi Bisnis', hargaBase: 3_000_000, qtyBase: 1 },
  { nama: 'Gaji Honorer Dosen S1', hargaBase: 3_000_000, qtyBase: 30 },
  { nama: 'Gaji Security', hargaBase: 1_900_000, qtyBase: 10 },
  { nama: 'Gaji Penjaga Universitas', hargaBase: 1_900_000, qtyBase: 3 },
  { nama: 'PDAM', hargaBase: 8_000_000, qtyBase: 1 },
];

const produkJasaSMA = [
  { nama: 'Pengadaan Buku Pelajaran', hargaBase: 150_000, qtyBase: 500 },
  { nama: 'Pengadaan Seragam Olahraga', hargaBase: 120_000, qtyBase: 200 },
  { nama: 'Pengadaan ATK', hargaBase: 1_500_000, qtyBase: 1 },
  { nama: 'Pembayaran Listrik', hargaBase: 3_500_000, qtyBase: 1 },
  { nama: 'Pemeliharaan Gedung', hargaBase: 5_000_000, qtyBase: 1 },
  { nama: 'Gaji Honorer Guru', hargaBase: 2_500_000, qtyBase: 15 },
  { nama: 'Gaji Security', hargaBase: 1_800_000, qtyBase: 3 },
  { nama: 'Gaji Tukang Kebun', hargaBase: 1_500_000, qtyBase: 2 },
  { nama: 'PDAM', hargaBase: 2_500_000, qtyBase: 1 },
  { nama: 'Internet & WiFi', hargaBase: 1_200_000, qtyBase: 1 },
];

const produkJasaSD = [
  { nama: 'Pengadaan Buku Pelajaran', hargaBase: 80_000, qtyBase: 300 },
  { nama: 'Pengadaan Alat Tulis Siswa', hargaBase: 500_000, qtyBase: 1 },
  { nama: 'Pengadaan ATK Kantor', hargaBase: 800_000, qtyBase: 1 },
  { nama: 'Pembayaran Listrik', hargaBase: 1_500_000, qtyBase: 1 },
  { nama: 'Pemeliharaan Gedung', hargaBase: 3_000_000, qtyBase: 1 },
  { nama: 'Gaji Honorer Guru', hargaBase: 2_000_000, qtyBase: 8 },
  { nama: 'Gaji Penjaga Sekolah', hargaBase: 1_500_000, qtyBase: 1 },
  { nama: 'PDAM', hargaBase: 800_000, qtyBase: 1 },
];

function getProdukJasaTemplate(jenjang: Jenjang) {
  switch (jenjang) {
    case 'UNIVERSITAS': return produkJasaUniv;
    case 'SMA': case 'SMP': return produkJasaSMA;
    case 'SD': case 'PAUD': return produkJasaSD;
    default: return produkJasaSMA;
  }
}

const PAJAK_PERSEN = 11;

export function getRincianPengeluaranBulanan(
  institusiId: string,
  nomorBulan: number,
  tahun: number = 2026
): RincianPengeluaranBulanan | null {
  let found: InstitusiPendidikan | null = null;

  const targetTahun = tahunAnggaranData.find(t => t.tahun === tahun) || tahunAnggaranData[6];
  const baseTahun = tahunAnggaranData[6];
  const scale = targetTahun.total_anggaran > 0 ? targetTahun.total_anggaran / baseTahun.total_anggaran : 1.0;
  const seedForInst = (tahun % 7) || 1;
  const shift = 0.95 + (seedForInst * 0.012);

  if (institusiId.startsWith('inst-k-p-') || institusiId.startsWith('inst-kab-')) {
    const match = institusiId.match(/(k(?:ab)?-p-\d+-\d+)/);
    if (match) {
      const kabkotaId = match[1];
      const provMatch = kabkotaId.match(/k(?:ab)?-p-(\d+)-/);
      const provId = provMatch ? `p-${provMatch[1]}` : 'p-1';
      const provData = alokasiProvinsiData.find(p => p.provinsi_id === provId);
      const kabkotaData = getKabkotaByProvinsi(provId).find(k => k.kabupaten_kota_id === kabkotaId);
      
      if (provData && kabkotaData) {
        const scaledKabkotaNominal = Math.round(kabkotaData.nominal_alokasi * scale);
        const schools = getInstitusiByKabkota(
          kabkotaId,
          kabkotaData.kabupaten_kota.nama_kabupaten_kota,
          provData.provinsi.nama_provinsi,
          scaledKabkotaNominal
        );
        found = schools.find(inst => inst.id === institusiId) || null;
      }
    }
  } else {
    // Find the institusi
    const allJenjang: Jenjang[] = ['UNIVERSITAS', 'SMA', 'SMP', 'SD', 'PAUD'];
    for (const j of allJenjang) {
      const list = getInstitusiByJenjang(j);
      const match = list.find(inst => inst.id === institusiId);
      if (match) {
        const nominal = Math.round(match.nominal_alokasi * scale);
        const realisasi = Math.min(nominal, Math.round(match.realisasi_total * scale * shift));
        found = {
          ...match,
          nominal_alokasi: nominal,
          realisasi_total: realisasi,
          selisih: nominal - realisasi,
          persentase_penyerapan: nominal > 0 ? Math.round((realisasi / nominal) * 1000) / 10 : 0,
        };
        break;
      }
    }
  }

  if (!found) return null;

  const template = getProdukJasaTemplate(found.jenjang);

  // Generate deterministic variation per month using seed
  const seed = (nomorBulan * 17 + parseInt(found.id.replace(/\D/g, '') || '1', 10)) || 1;

  // Get target monthly nominal
  const targetTotal = generatePengeluaranBulanan(found)[nomorBulan - 1].nominal_pengeluaran;

  // The subtotal satisfies: subtotal + Math.round(subtotal * 0.11) = targetTotal
  const subTotal = Math.round(targetTotal / 1.11);
  const pajakNominal = targetTotal - subTotal;

  const itemSeeds = seededValues(template.length, 0.8, 1.2, seed);
  const rawItems = template.map((t, i) => {
    const rawVal = t.hargaBase * t.qtyBase * itemSeeds[i];
    return { ...t, rawVal };
  });
  const totalRawVal = rawItems.reduce((sum, item) => sum + item.rawVal, 0);

  let distributedSum = 0;
  const items: RincianPengeluaranItem[] = rawItems.map((t, i) => {
    const isLast = i === template.length - 1;
    let qty = isLast ? 1 : Math.max(1, t.qtyBase);
    let itemJumlah = 0;
    let hargaSatuan = 0;

    if (isLast) {
      itemJumlah = subTotal - distributedSum;
      hargaSatuan = itemJumlah;
    } else {
      itemJumlah = Math.round(subTotal * (t.rawVal / totalRawVal));
      hargaSatuan = Math.round(itemJumlah / qty);
      itemJumlah = hargaSatuan * qty;
      distributedSum += itemJumlah;
    }

    return {
      id: `ri-${institusiId}-${nomorBulan}-${i}`,
      nomor: i + 1,
      nama_produk_jasa: `${t.nama} ${bulanNames[nomorBulan - 1]} ${tahun}`,
      harga_satuan: hargaSatuan,
      qty,
      jumlah: itemJumlah,
    };
  });

  return {
    institusi_id: found.id,
    institusi_nama: found.nama_institusi,
    bulan: bulanNames[nomorBulan - 1],
    nomor_bulan: nomorBulan,
    items,
    sub_total: subTotal,
    pajak_persen: PAJAK_PERSEN,
    pajak_nominal: pajakNominal,
    total: subTotal + pajakNominal,
  };
}

export function getJenjangBreakdownByKabkota(
  kabkotaId: string,
  nominalAlokasi: number
): JenjangBreakdownProvinsi[] {
  const match = kabkotaId.match(/kab-p-(\d+)-(\d+)/);
  const provIdx = match ? parseInt(match[1], 10) : 1;
  const kabIdx = match ? parseInt(match[2], 10) : 0;
  const seed = provIdx * 31 + kabIdx + 3;

  let pUniv = 10;
  let pSMA = 20;
  let pSMK = 15;
  let pSMP = 20;
  let pSD = 30;
  let pPAUD = 5;

  const cUniv = (seed * 3) % 4; // 0 to 3 universities
  if (cUniv === 0) {
    pSD += pUniv;
    pUniv = 0;
  }
  const cSMA = 3 + ((seed * 7) % 15);
  const cSMK = 2 + ((seed * 5) % 10);
  const cSMP = 6 + ((seed * 11) % 25);
  const cSD = 15 + ((seed * 17) % 80);
  const cPAUD = 10 + ((seed * 23) % 60);

  const jenjangs = [
    { label: 'Universitas (Strata 1)', porsi: pUniv, count: cUniv },
    { label: 'Sekolah Menengah Atas (SMA)', porsi: pSMA, count: cSMA },
    { label: 'Sekolah Menengah Kejuruan (SMK)', porsi: pSMK, count: cSMK },
    { label: 'Sekolah Menengah Pertama (SMP)', porsi: pSMP, count: cSMP },
    { label: 'Sekolah Dasar (SD)', porsi: pSD, count: cSD },
    { label: 'Pendidikan Anak Usia Dini (PAUD)', porsi: pPAUD, count: cPAUD },
  ];

  return jenjangs.map((j, i) => {
    const nominal = Math.round(nominalAlokasi * j.porsi / 100);
    return {
      nomor: i + 1,
      jenjang: j.label,
      jumlah_sekolah: j.count,
      nominal_keseluruhan: nominal,
      porsi_anggaran: j.porsi,
    };
  });
}

export function getInstitusiByKabkota(
  kabkotaId: string,
  namaKabkota: string,
  provinsiNama: string,
  totalNominal: number
): InstitusiPendidikan[] {
  const match = kabkotaId.match(/kab-p-(\d+)-(\d+)/);
  const provIdx = match ? parseInt(match[1], 10) : 1;
  const kabIdx = match ? parseInt(match[2], 10) : 0;
  const seed = provIdx * 31 + kabIdx + 3;

  let pUniv = 10;
  let pSMA = 20;
  let pSMK = 15;
  let pSMP = 20;
  let pSD = 30;
  let pPAUD = 5;

  const cUniv = (seed * 3) % 4;
  if (cUniv === 0) {
    pSD += pUniv;
    pUniv = 0;
  }
  const cSMA = 3 + ((seed * 7) % 15);
  const cSMK = 2 + ((seed * 5) % 10);
  const cSMP = 6 + ((seed * 11) % 25);
  const cSD = 15 + ((seed * 17) % 80);
  const cPAUD = 10 + ((seed * 23) % 60);

  const cleanKabName = namaKabkota.replace('Kab. ', '').replace('Kota ', '');

  const jenjangConfigs = [
    { key: 'UNIVERSITAS' as const, porsi: pUniv, count: cUniv, prefix: 'Universitas', baseNominal: 50_000_000_000 },
    { key: 'SMA' as const, porsi: pSMA, count: cSMA, prefix: 'SMAN', baseNominal: 5_000_000_000 },
    { key: 'SMP' as const, porsi: pSMP, count: cSMP, prefix: 'SMPN', baseNominal: 3_000_000_000 },
    { key: 'SD' as const, porsi: pSD, count: cSD, prefix: 'SDN', baseNominal: 1_500_000_000 },
    { key: 'PAUD' as const, porsi: pPAUD, count: cPAUD, prefix: 'PAUD', baseNominal: 500_000_000 },
    { key: 'SMA' as const, porsi: pSMK, count: cSMK, prefix: 'SMKN', baseNominal: 4_500_000_000, label: 'SMK' }, // Custom labeling for SMK
  ];

  // We will distribute the totalNominal to each jenjang
  const list: InstitusiPendidikan[] = [];
  let schoolCounter = 1;

  jenjangConfigs.forEach((jc) => {
    if (jc.count === 0) return;
    const jenjangBudget = Math.round(totalNominal * jc.porsi / 100);
    let distributedSum = 0;

    for (let i = 0; i < jc.count; i++) {
      // Deterministic variation per school
      const schoolSeed = seed + schoolCounter * 7;
      const variation = 0.8 + ((schoolSeed * 97) % 5) * 0.1; // 0.8 to 1.2
      
      let schoolNominal = 0;
      if (i === jc.count - 1) {
        schoolNominal = jenjangBudget - distributedSum;
      } else {
        schoolNominal = Math.round((jenjangBudget / jc.count) * variation);
        distributedSum += schoolNominal;
      }

      const realisasiPct = 60 + ((schoolSeed * 53) % 36); // 60% to 95%
      const realisasi = Math.round(schoolNominal * realisasiPct / 100);
      const isSwasta = (schoolSeed % 5 === 0 && jc.key !== 'UNIVERSITAS');
      const status_sekolah = isSwasta ? ('SWASTA' as const) : ('NEGERI' as const);

      let schoolName = '';
      if (jc.key === 'UNIVERSITAS') {
        const univTypes = ['Universitas', 'IAIN', 'STIE', 'Politeknik'];
        const type = univTypes[i % univTypes.length];
        schoolName = `${type} ${cleanKabName} ${i > 0 ? String.fromCharCode(65 + i) : ''}`;
      } else {
        const levelLabel = jc.label || jc.key;
        schoolName = isSwasta 
          ? `${levelLabel} Swasta Bina Bangsa ${cleanKabName}` 
          : `${jc.prefix} ${i + 1} ${cleanKabName}`;
      }

      list.push({
        id: `inst-${kabkotaId}-${schoolCounter}`,
        npsn: `${jc.key === 'UNIVERSITAS' ? '3' : jc.key === 'SMA' ? '2' : jc.key === 'SMP' ? '1' : jc.key === 'SD' ? '0' : '9'}${String(2000 + schoolCounter)}`,
        nama_institusi: schoolName,
        jenjang: jc.label === 'SMK' ? 'SMA' : jc.key, // fallback mapping to main Jenjang type
        kabupaten_kota_id: kabkotaId,
        kabupaten_kota_nama: namaKabkota,
        provinsi_nama: provinsiNama,
        status_sekolah,
        nomor_rekening: `100.${200 + schoolCounter}.${300 + schoolCounter * 3}.000`,
        nominal_alokasi: schoolNominal,
        realisasi_total: realisasi,
        selisih: schoolNominal - realisasi,
        persentase_penyerapan: Math.round((realisasi / schoolNominal) * 1000) / 10,
        updated_at: '2026-04-15',
      });

      schoolCounter++;
    }
  });

  return list;
}


export function getJenjangBreakdownByProvinsi(
  provinsiId: string,
  nominalAlokasi: number
): JenjangBreakdownProvinsi[] {
  const provIdx = parseInt(provinsiId.replace('p-', ''), 10) - 1;
  const seed = isNaN(provIdx) ? 1 : provIdx + 1;

  const jenjangs = [
    { label: 'Universitas (Strata 1)', porsi: 5, baseCount: 15, countMod: 50, countMul: 11 },
    { label: 'Sekolah Menengah Atas (SMA)', porsi: 15, baseCount: 150, countMod: 400, countMul: 43 },
    { label: 'Sekolah Menengah Kejuruan (SMK)', porsi: 10, baseCount: 100, countMod: 300, countMul: 29 },
    { label: 'Sekolah Menengah Pertama (SMP)', porsi: 25, baseCount: 400, countMod: 1000, countMul: 83 },
    { label: 'Sekolah Dasar (SD)', porsi: 40, baseCount: 1000, countMod: 2500, countMul: 113 },
    { label: 'Pendidikan Anak Usia Dini (PAUD)', porsi: 5, baseCount: 1200, countMod: 3500, countMul: 157 },
  ];

  return jenjangs.map((j, i) => {
    const count = j.baseCount + ((seed * j.countMul) % j.countMod);
    const nominal = Math.round(nominalAlokasi * j.porsi / 100);
    return {
      nomor: i + 1,
      jenjang: j.label,
      jumlah_sekolah: count,
      nominal_keseluruhan: nominal,
      porsi_anggaran: j.porsi,
    };
  });
}
