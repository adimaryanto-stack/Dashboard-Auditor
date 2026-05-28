'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import PctBadge from '@/components/ui/PctBadge';
import { getAllInstitusi, alokasiProvinsiData } from '@/lib/data';
import { fmtRupiah } from '@/lib/utils/formatters';
import { Jenjang } from '@/types';
import { Search, ExternalLink } from 'lucide-react';

const jenjangOptions: { value: '' | Jenjang; label: string }[] = [
  { value: '', label: 'Semua Jenjang' },
  { value: 'UNIVERSITAS', label: 'Universitas' },
  { value: 'SMA', label: 'SMA' },
  { value: 'SMP', label: 'SMP' },
  { value: 'SD', label: 'SD' },
  { value: 'PAUD', label: 'PAUD' },
];

export default function ProfilInstitusiPage() {
  const allInstitusi = useMemo(() => getAllInstitusi(), []);
  const [search, setSearch] = useState('');
  const [selectedJenjang, setSelectedJenjang] = useState<'' | Jenjang>('');
  const [selectedProvinsiId, setSelectedProvinsiId] = useState('');

  const filtered = useMemo(() => {
    let result = allInstitusi;
    if (selectedJenjang) {
      result = result.filter(inst => inst.jenjang === selectedJenjang);
    }
    if (selectedProvinsiId) {
      const prov = alokasiProvinsiData.find(p => p.provinsi_id === selectedProvinsiId);
      if (prov) {
        result = result.filter(inst => inst.provinsi_nama === prov.provinsi.nama_provinsi);
      }
    }
    if (search) {
      result = result.filter(inst =>
        inst.nama_institusi.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result;
  }, [allInstitusi, search, selectedJenjang, selectedProvinsiId]);

  return (
    <div className="min-h-screen">
      <Header
        title="Profil Institusi"
        subtitle="Klik nama institusi untuk melihat detail profil keuangan"
      />

      <div className="p-6">
        {/* Toolbar */}
        <div className="sheet-toolbar flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Jenjang:</span>
            <select
              value={selectedJenjang}
              onChange={(e) => setSelectedJenjang(e.target.value as '' | Jenjang)}
              className="select-dropdown"
            >
              {jenjangOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Provinsi:</span>
            <select
              value={selectedProvinsiId}
              onChange={(e) => setSelectedProvinsiId(e.target.value)}
              className="select-dropdown"
            >
              <option value="">Semua Provinsi</option>
              {alokasiProvinsiData.map(p => (
                <option key={p.provinsi_id} value={p.provinsi_id}>{p.provinsi.nama_provinsi}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Cari nama institusi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <span className="text-xs text-text-muted flex-1">{filtered.length} institusi</span>
        </div>

        {/* Table */}
        <div className="sheet-container">
          <table className="w-full">
            <thead>
              <tr>
                <th className="sheet-header-cell text-center" style={{ width: 50 }}>No</th>
                <th className="sheet-header-cell text-left" style={{ minWidth: 250 }}>Nama Institusi</th>
                <th className="sheet-header-cell text-center" style={{ width: 110 }}>Jenjang</th>
                <th className="sheet-header-cell text-center" style={{ width: 90 }}>Status</th>
                <th className="sheet-header-cell text-left" style={{ minWidth: 150 }}>Kabupaten/Kota</th>
                <th className="sheet-header-cell text-left" style={{ minWidth: 130 }}>Provinsi</th>
                <th className="sheet-header-cell text-right" style={{ minWidth: 150 }}>Nominal (Rp)</th>
                <th className="sheet-header-cell text-right" style={{ minWidth: 150 }}>Realisasi (Rp)</th>
                <th className="sheet-header-cell text-center" style={{ width: 110 }}>%</th>
                <th className="sheet-header-cell text-center" style={{ width: 60 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={row.id} className="hover:bg-indigo-50/50 transition">
                  <td className="sheet-cell text-center text-text-muted text-xs">{idx + 1}</td>
                  <td className="sheet-cell text-left font-medium text-text-primary">
                    <Link
                      href={`/dashboard/profil-institusi/${row.id}`}
                      className="hover:text-accent hover:underline transition-colors"
                    >
                      {row.nama_institusi}
                    </Link>
                  </td>
                  <td className="sheet-cell text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      row.jenjang === 'UNIVERSITAS' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      : row.jenjang === 'SMA' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : row.jenjang === 'SMP' ? 'bg-sky-100 text-sky-700 border border-sky-200'
                      : row.jenjang === 'SD' ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-pink-100 text-pink-700 border border-pink-200'
                    }`}>
                      {row.jenjang}
                    </span>
                  </td>
                  <td className="sheet-cell text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      row.status_sekolah === 'NEGERI' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-purple-100 text-purple-700 border border-purple-200'
                    }`}>
                      {row.status_sekolah}
                    </span>
                  </td>
                  <td className="sheet-cell text-left text-text-secondary text-xs">{row.kabupaten_kota_nama}</td>
                  <td className="sheet-cell text-left text-text-secondary text-xs">{row.provinsi_nama}</td>
                  <td className="sheet-cell text-right">{fmtRupiah(row.nominal_alokasi)}</td>
                  <td className="sheet-cell text-right">{fmtRupiah(row.realisasi_total)}</td>
                  <td className="sheet-cell text-center">
                    <PctBadge value={row.persentase_penyerapan} />
                  </td>
                  <td className="sheet-cell text-center">
                    <Link
                      href={`/dashboard/profil-institusi/${row.id}`}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-indigo-100 text-text-muted hover:text-accent transition-colors"
                      title="Lihat Profil"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-text-muted">
          🏫 Klik nama institusi atau ikon untuk melihat detail profil keuangan
        </p>
      </div>
    </div>
  );
}
