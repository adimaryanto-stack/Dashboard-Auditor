'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import PctBadge from '@/components/ui/PctBadge';
import { useAppStore } from '@/lib/store';
import { alokasiProvinsiData, getKabkotaByProvinsi, tahunAnggaranData } from '@/lib/data';
import { fmtRupiah, fmtTriliun } from '@/lib/utils/formatters';
import { AlokasiKabupatenKota } from '@/types';
import { Search, Download } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import EditableCell from '@/components/spreadsheet/EditableCell';
import { rollupKabKotaChange } from '@/lib/utils/dbSync';

export default function KabupatenKotaPage() {
  const { activeTahun, isSupabaseMode, dbData, setDbData } = useAppStore();
  const [selectedProvinsi, setSelectedProvinsi] = useState(() => {
    // Safe initial default from mock data
    const jabar = alokasiProvinsiData.find(p => p.provinsi?.nama_provinsi === 'Jawa Barat');
    return jabar ? jabar.provinsi_id : (alokasiProvinsiData[0]?.provinsi_id || '');
  });
  const [search, setSearch] = useState('');

  // Build the provinsi list from dbData (Supabase) or module variable (mock)
  const provinsiList = useMemo(() => {
    if (isSupabaseMode && dbData && dbData.alokasi_provinsi.length > 0) {
      return dbData.alokasi_provinsi.map((ap: any) => {
        const prov = ap.provinsi || dbData.provinsi?.find((p: any) => p.id === ap.provinsi_id);
        return {
          provinsi_id: ap.provinsi_id,
          provinsi: prov
            ? { id: prov.id, kode_provinsi: prov.kode_provinsi, nama_provinsi: prov.nama_provinsi }
            : { id: ap.provinsi_id, kode_provinsi: '', nama_provinsi: 'Provinsi' }
        };
      });
    }
    return alokasiProvinsiData.map(p => ({
      provinsi_id: p.provinsi_id,
      provinsi: p.provinsi
    }));
  }, [isSupabaseMode, dbData]);

  // Sync selectedProvinsi when provinsiList changes (e.g., Supabase data arrives)
  useEffect(() => {
    if (provinsiList.length === 0) return;
    // Check if current selection is valid in the new list
    const currentValid = provinsiList.some((p: any) => p.provinsi_id === selectedProvinsi);
    if (!currentValid) {
      const jabar = provinsiList.find((p: any) =>
        p.provinsi.nama_provinsi === 'Jawa Barat'
      );
      setSelectedProvinsi(jabar ? jabar.provinsi_id : provinsiList[0].provinsi_id);
    }
  }, [provinsiList]);

  const rawData = useMemo(() => {
    if (!selectedProvinsi) return [];
    const list = getKabkotaByProvinsi(selectedProvinsi);

    if (isSupabaseMode && dbData) {
      return list.map(item => ({
        ...item,
        nominal_alokasi: Number(item.nominal_alokasi),
        realisasi_total: Number(item.realisasi_total),
        selisih: Number(item.nominal_alokasi) - Number(item.realisasi_total),
        persentase_penyerapan: Number(item.nominal_alokasi) > 0 
          ? Math.round((Number(item.realisasi_total) / Number(item.nominal_alokasi)) * 1000) / 10 
          : 0
      }));
    }

    const targetTahun = tahunAnggaranData.find(t => t.tahun === activeTahun) || tahunAnggaranData[6];
    const baseTahun = tahunAnggaranData[6];
    const scale = targetTahun.total_anggaran > 0 ? targetTahun.total_anggaran / baseTahun.total_anggaran : 1.0;
    const seed = (activeTahun % 7) || 1;
    const shift = 0.95 + (seed * 0.012);

    return list.map(item => {
      const nominal = Math.round(item.nominal_alokasi * scale);
      const realisasi = Math.min(nominal, Math.round(item.realisasi_total * scale * shift));
      return {
        ...item,
        nominal_alokasi: nominal,
        realisasi_total: realisasi,
        selisih: nominal - realisasi,
        persentase_penyerapan: nominal > 0 ? Math.round((realisasi / nominal) * 1000) / 10 : 0
      };
    });
  }, [selectedProvinsi, activeTahun, isSupabaseMode, dbData]);

  const [localData, setLocalData] = useState<AlokasiKabupatenKota[]>(rawData);

  useEffect(() => {
    setLocalData(rawData);
  }, [rawData]);

  const filtered = useMemo(() => {
    if (!search) return localData;
    return localData.filter(k => k.kabupaten_kota.nama_kabupaten_kota.toLowerCase().includes(search.toLowerCase()));
  }, [localData, search]);

  const totals = useMemo(() => {
    const nom = filtered.reduce((s, k) => s + k.nominal_alokasi, 0);
    const real = filtered.reduce((s, k) => s + k.realisasi_total, 0);
    return { nominal: nom, realisasi: real, selisih: nom - real, pct: nom > 0 ? (real / nom) * 100 : 0 };
  }, [filtered]);

  const handleCellSave = async (rowId: string, field: 'nominal' | 'realisasi', newValue: number) => {
    setLocalData(prev => prev.map(item => {
      if (item.id === rowId) {
        const nominal = field === 'nominal' ? newValue : item.nominal_alokasi;
        const realisasi = field === 'realisasi' ? newValue : item.realisasi_total;
        return {
          ...item,
          nominal_alokasi: nominal,
          realisasi_total: realisasi,
          selisih: nominal - realisasi,
          persentase_penyerapan: nominal > 0 ? Math.round((realisasi / nominal) * 1000) / 10 : 0
        };
      }
      return item;
    }));

    if (isSupabaseMode && dbData) {
      const updates = field === 'nominal'
        ? { nominal_alokasi: newValue }
        : { realisasi_total: newValue };
      await rollupKabKotaChange(dbData, setDbData, rowId, updates);
    }
  };

  const renderEditableCell = (row: AlokasiKabupatenKota, field: 'nominal' | 'realisasi') => {
    const value = field === 'nominal' ? row.nominal_alokasi : row.realisasi_total;
    return (
      <td className="sheet-cell p-0">
        <EditableCell
          value={value}
          onSave={(newValue) => handleCellSave(row.id, field, newValue)}
        />
      </td>
    );
  };

  const selectedProvName = provinsiList.find((p: any) => p.provinsi_id === selectedProvinsi)?.provinsi.nama_provinsi || '';

  return (
    <div className="min-h-screen">
      <Header title="Kabupaten / Kota" subtitle={`Data alokasi anggaran per kabupaten/kota — ${selectedProvName} Tahun ${activeTahun}`} />

      <div className="p-6">
        {/* Toolbar */}
        <div className="sheet-toolbar flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Provinsi:</span>
            <select
              value={selectedProvinsi}
              onChange={(e) => setSelectedProvinsi(e.target.value)}
              className="select-dropdown"
            >
              {provinsiList.map((p: any) => (
                <option key={p.provinsi_id} value={p.provinsi_id}>{p.provinsi.nama_provinsi}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Cari kabupaten/kota..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <span className="text-xs text-text-muted flex-1">{filtered.length} kabupaten/kota</span>
          <button className="btn btn-primary">
            <Download size={14} />
            Ekspor Excel
          </button>
        </div>

        {/* Spreadsheet */}
        <div className="sheet-container">
          <table className="w-full">
            <thead>
              <tr>
                <th className="sheet-header-cell text-center" style={{ width: 50 }}>No</th>
                <th className="sheet-header-cell text-left" style={{ minWidth: 220 }}>Kabupaten / Kota</th>
                <th className="sheet-header-cell text-left" style={{ minWidth: 150 }}>Provinsi</th>
                <th className="sheet-header-cell text-right" style={{ minWidth: 170 }}>Nominal (Rp)</th>
                <th className="sheet-header-cell text-right" style={{ minWidth: 170 }}>Realisasi (Rp)</th>
                <th className="sheet-header-cell text-right" style={{ minWidth: 130 }}>Selisih</th>
                <th className="sheet-header-cell text-center" style={{ width: 120 }}>%</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={row.id} className="hover:bg-indigo-50/50 transition">
                  <td className="sheet-cell text-center text-text-muted text-xs">{idx + 1}</td>
                  <td className="sheet-cell text-left font-medium text-text-primary">
                    <Link
                      href={`/dashboard/provinsi/${row.kabupaten_kota.provinsi_id}/kabkota/${row.kabupaten_kota_id}`}
                      className="hover:text-accent hover:underline transition-colors"
                    >
                      {row.kabupaten_kota.nama_kabupaten_kota}
                    </Link>
                  </td>
                  <td className="sheet-cell text-left text-text-secondary text-xs">
                    <Link
                      href={`/dashboard/provinsi/${row.kabupaten_kota.provinsi_id}`}
                      className="hover:text-accent hover:underline transition-colors"
                    >
                      {row.provinsi_nama}
                    </Link>
                  </td>
                  {renderEditableCell(row, 'nominal')}
                  {renderEditableCell(row, 'realisasi')}
                  <td className="sheet-cell text-right text-rose-600">{fmtTriliun(row.selisih)}</td>
                  <td className="sheet-cell text-center">
                    <PctBadge value={row.persentase_penyerapan} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="sheet-footer-cell" />
                <td className="sheet-footer-cell text-left font-bold">TOTAL ({filtered.length})</td>
                <td className="sheet-footer-cell" />
                <td className="sheet-footer-cell text-right">{fmtRupiah(totals.nominal)}</td>
                <td className="sheet-footer-cell text-right">{fmtRupiah(totals.realisasi)}</td>
                <td className="sheet-footer-cell text-right text-rose-600">{fmtTriliun(totals.selisih)}</td>
                <td className="sheet-footer-cell text-center">
                  <PctBadge value={totals.pct} size="md" />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
