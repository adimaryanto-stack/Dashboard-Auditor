'use client';

import { useState, useMemo, useEffect } from 'react';
import Header from '@/components/layout/Header';
import PctBadge from '@/components/ui/PctBadge';
import { useAppStore } from '@/lib/store';
import { alokasiProvinsiData, getKabkotaByProvinsi, tahunAnggaranData } from '@/lib/data';
import { fmtRupiah, fmtTriliun } from '@/lib/utils/formatters';
import { AlokasiKabupatenKota } from '@/types';
import { Search, Download, RefreshCw, Plus } from 'lucide-react';

export default function KabupatenKotaPage() {
  const { activeTahun } = useAppStore();
  const [selectedProvinsi, setSelectedProvinsi] = useState(alokasiProvinsiData[11].provinsi_id); // Jawa Barat
  const [search, setSearch] = useState('');
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'nominal' | 'realisasi' } | null>(null);
  const [editValue, setEditValue] = useState('');

  const rawData = useMemo(() => {
    const list = getKabkotaByProvinsi(selectedProvinsi);
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
  }, [selectedProvinsi, activeTahun]);

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

  const startEdit = (id: string, field: 'nominal' | 'realisasi', value: number) => {
    setEditingCell({ id, field });
    setEditValue(String(value));
  };

  const commitEdit = () => {
    if (!editingCell) return;
    const parsed = Number(editValue);
    if (!isNaN(parsed) && parsed >= 0) {
      setLocalData(prev => prev.map(k => {
        if (k.id !== editingCell.id) return k;
        const nominal = editingCell.field === 'nominal' ? parsed : k.nominal_alokasi;
        const realisasi = editingCell.field === 'realisasi' ? parsed : k.realisasi_total;
        return {
          ...k,
          nominal_alokasi: nominal,
          realisasi_total: realisasi,
          selisih: nominal - realisasi,
          persentase_penyerapan: nominal > 0 ? Math.round((realisasi / nominal) * 1000) / 10 : 0,
        };
      }));
    }
    setEditingCell(null);
  };

  const renderEditableCell = (row: AlokasiKabupatenKota, field: 'nominal' | 'realisasi') => {
    const value = field === 'nominal' ? row.nominal_alokasi : row.realisasi_total;
    const isEditing = editingCell?.id === row.id && editingCell?.field === field;

    if (isEditing) {
      return (
        <td className="sheet-cell sheet-cell-editing text-right">
          <input
            autoFocus
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); commitEdit(); }
              if (e.key === 'Escape') setEditingCell(null);
            }}
            className="w-full bg-transparent outline-none text-right font-mono text-sm"
          />
        </td>
      );
    }

    return (
      <td className="sheet-cell sheet-cell-editable text-right" onClick={() => startEdit(row.id, field, value)}>
        {fmtRupiah(value)}
      </td>
    );
  };

  const selectedProvName = alokasiProvinsiData.find(p => p.provinsi_id === selectedProvinsi)?.provinsi.nama_provinsi || '';

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
              {alokasiProvinsiData.map(p => (
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
            <Plus size={14} />
            Tambah Kab/Kota
          </button>
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
                  <td className="sheet-cell text-left font-medium text-text-primary">{row.kabupaten_kota.nama_kabupaten_kota}</td>
                  <td className="sheet-cell text-left text-text-secondary text-xs">{row.provinsi_nama}</td>
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

        <p className="mt-3 text-xs text-text-muted">
          ✏️ Klik sel untuk edit langsung • Update otomatis cascade ke Provinsi
        </p>
      </div>
    </div>
  );
}
