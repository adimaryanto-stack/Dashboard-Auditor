'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { useAppStore } from '@/lib/store';
import { getRincianPengeluaranBulanan } from '@/lib/data';
import { fmtRupiah } from '@/lib/utils/formatters';
import { RincianPengeluaranItem } from '@/types';
import { ArrowLeft, Download, Plus } from 'lucide-react';

export default function RincianPengeluaranPage() {
  const params = useParams();
  const router = useRouter();
  const institusiId = params.id as string;
  const nomorBulan = parseInt(params.bulan as string, 10);
  const { activeTahun } = useAppStore();

  const rincianData = useMemo(
    () => getRincianPengeluaranBulanan(institusiId, nomorBulan, activeTahun),
    [institusiId, nomorBulan, activeTahun]
  );

  // Editable state
  const [items, setItems] = useState<RincianPengeluaranItem[]>([]);
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'harga_satuan' | 'qty' } | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (rincianData) {
      setItems(rincianData.items);
    }
  }, [rincianData]);

  if (!rincianData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">Data tidak ditemukan</h2>
          <p className="text-text-muted mb-4">Institusi ID: {institusiId}, Bulan: {nomorBulan}</p>
          <button onClick={() => router.back()} className="btn btn-primary">
            <ArrowLeft size={16} />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // ===== Calculated totals =====
  const subTotal = items.reduce((s, item) => s + item.jumlah, 0);
  const pajakPersen = rincianData.pajak_persen;
  const pajakNominal = Math.round(subTotal * pajakPersen / 100);
  const total = subTotal + pajakNominal;

  // ===== Editing =====
  const startEdit = (id: string, field: 'harga_satuan' | 'qty', value: number) => {
    setEditingCell({ id, field });
    setEditValue(String(value));
  };

  const commitEdit = () => {
    if (!editingCell) return;
    const parsed = Number(editValue);
    if (!isNaN(parsed) && parsed >= 0) {
      setItems(prev => prev.map(item => {
        if (item.id !== editingCell.id) return item;
        const harga = editingCell.field === 'harga_satuan' ? parsed : item.harga_satuan;
        const qty = editingCell.field === 'qty' ? parsed : item.qty;
        return { ...item, harga_satuan: harga, qty, jumlah: harga * qty };
      }));
    }
    setEditingCell(null);
  };

  const renderEditableCell = (row: RincianPengeluaranItem, field: 'harga_satuan' | 'qty') => {
    const value = row[field];
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
        {field === 'qty' ? value.toLocaleString('id-ID') : fmtRupiah(value)}
      </td>
    );
  };

  // ===== Add new item =====
  const addItem = () => {
    const newId = `ri-new-${Date.now()}`;
    setItems(prev => [...prev, {
      id: newId,
      nomor: prev.length + 1,
      nama_produk_jasa: 'Item Baru',
      harga_satuan: 0,
      qty: 1,
      jumlah: 0,
    }]);
  };

  return (
    <div className="min-h-screen">
      <Header
        title={`Rincian Pengeluaran Bulan ${rincianData.bulan}`}
        subtitle={`${rincianData.institusi_nama} — Bulan ${rincianData.bulan} ${activeTahun}`}
      />

      <div className="p-6 space-y-6">
        {/* Breadcrumb / Back */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => router.back()} className="btn btn-ghost text-sm">
            <ArrowLeft size={14} />
            Kembali ke Profil
          </button>
          <span className="text-text-muted text-xs">|</span>
          <nav className="flex items-center gap-1 text-xs text-text-muted">
            <Link href="/dashboard/profil-institusi" className="hover:text-accent transition-colors">
              Profil Institusi
            </Link>
            <span>→</span>
            <Link href={`/dashboard/profil-institusi/${institusiId}`} className="hover:text-accent transition-colors">
              {rincianData.institusi_nama}
            </Link>
            <span>→</span>
            <span className="text-text-primary font-medium">Rincian {rincianData.bulan}</span>
          </nav>
        </div>

        {/* Title Banner */}
        <div className="glass-card p-5">
          <h2 className="text-base font-bold text-text-primary">
            📋 Rincian Penggunaan Anggaran Pendidikan {rincianData.institusi_nama} Bulan {rincianData.bulan} {activeTahun}
          </h2>
        </div>

        {/* Toolbar */}
        <div className="sheet-toolbar">
          <span className="text-sm font-bold text-text-primary">
            Nama Produk / Jasa
          </span>
          <span className="text-xs text-text-muted flex-1">{items.length} item</span>
          <button className="btn btn-ghost" onClick={addItem}>
            <Plus size={14} />
            Tambah Item
          </button>
          <button className="btn btn-primary">
            <Download size={14} />
            Ekspor Excel
          </button>
        </div>

        {/* Spreadsheet Table */}
        <div className="sheet-container" style={{ maxHeight: 'none' }}>
          <table className="w-full">
            <thead>
              <tr>
                <th className="sheet-header-cell text-center" style={{ width: 60 }}>Nomor</th>
                <th className="sheet-header-cell text-left" style={{ minWidth: 300 }}>Nama Produk / Jasa</th>
                <th className="sheet-header-cell text-right" style={{ minWidth: 180 }}>Harga Satuan</th>
                <th className="sheet-header-cell text-center" style={{ width: 100 }}>Qty</th>
                <th className="sheet-header-cell text-right" style={{ minWidth: 180 }}>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="hover:bg-indigo-50/50 transition">
                  <td className="sheet-cell text-center text-text-muted text-xs">{row.nomor}</td>
                  <td className="sheet-cell text-left font-medium text-text-primary">{row.nama_produk_jasa}</td>
                  {renderEditableCell(row, 'harga_satuan')}
                  {renderEditableCell(row, 'qty')}
                  <td className="sheet-cell text-right font-medium text-text-primary">
                    {fmtRupiah(row.jumlah)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {/* Sub Total */}
              <tr>
                <td className="sheet-footer-cell" />
                <td className="sheet-footer-cell text-left font-bold text-text-primary" colSpan={3}>
                  Sub Total
                </td>
                <td className="sheet-footer-cell text-right font-bold text-text-primary">
                  {fmtRupiah(subTotal)}
                </td>
              </tr>
              {/* Pajak */}
              <tr>
                <td className="sheet-cell border-b border-border" />
                <td className="sheet-cell border-b border-border text-left text-text-secondary" colSpan={3}>
                  Pajak {pajakPersen}%
                </td>
                <td className="sheet-cell border-b border-border text-right text-text-secondary">
                  {fmtRupiah(pajakNominal)}
                </td>
              </tr>
              {/* Total */}
              <tr>
                <td className="sheet-footer-cell" />
                <td className="sheet-footer-cell text-left font-bold" colSpan={3}>
                  Total
                </td>
                <td className="sheet-footer-cell text-right font-bold text-emerald-600 text-base">
                  {fmtRupiah(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="text-xs text-text-muted">
          ✏️ Klik sel Harga Satuan atau Qty untuk edit langsung • Jumlah = Harga Satuan × Qty • Total = Sub Total + Pajak {pajakPersen}%
        </p>
      </div>
    </div>
  );
}
