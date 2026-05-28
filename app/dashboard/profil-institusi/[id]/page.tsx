'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { useAppStore } from '@/lib/store';
import { getProfilInstitusi } from '@/lib/data';
import { fmtRupiah } from '@/lib/utils/formatters';
import { SumberDanaInstitusi, PengeluaranBulananInstitusi } from '@/types';
import { ArrowLeft, Banknote, CreditCard, TrendingUp, TrendingDown, Edit3 } from 'lucide-react';

export default function ProfilInstitusiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { activeTahun } = useAppStore();

  const profilData = useMemo(() => getProfilInstitusi(id, activeTahun), [id, activeTahun]);

  // Editable state
  const [sumberDana, setSumberDana] = useState<SumberDanaInstitusi[]>([]);
  const [pengeluaran, setPengeluaran] = useState<PengeluaranBulananInstitusi[]>([]);
  const [nomorRekening, setNomorRekening] = useState('');
  const [editingRekening, setEditingRekening] = useState(false);

  useEffect(() => {
    if (profilData) {
      setSumberDana(profilData.sumber_dana);
      setPengeluaran(profilData.pengeluaran_bulanan);
      setNomorRekening(profilData.institusi.nomor_rekening);
    }
  }, [profilData]);

  // Sumber Dana editing
  const [editingSD, setEditingSD] = useState<{ id: string; field: 'nominal' | 'realisasi' } | null>(null);
  const [editSDValue, setEditSDValue] = useState('');

  // Pengeluaran editing
  const [editingPB, setEditingPB] = useState<{ id: string; field: 'nominal_pengeluaran' | 'qty' } | null>(null);
  const [editPBValue, setEditPBValue] = useState('');

  if (!profilData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">Institusi tidak ditemukan</h2>
          <p className="text-text-muted mb-4">ID: {id}</p>
          <button onClick={() => router.back()} className="btn btn-primary">
            <ArrowLeft size={16} />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const { institusi } = profilData;

  // ===== Calculated totals =====
  const totalNominalSumber = sumberDana.reduce((s, d) => s + d.nominal, 0);
  const totalRealisasiSumber = sumberDana.reduce((s, d) => s + d.realisasi, 0);
  const totalSaldoDiBank = sumberDana.reduce((s, d) => s + d.saldo_di_bank, 0);
  const saldoSurplusDefisit = totalNominalSumber - totalRealisasiSumber;
  const totalPengeluaran = pengeluaran.reduce((s, p) => s + p.sub_total, 0);

  // ===== Sumber Dana Editing =====
  const startEditSD = (id: string, field: 'nominal' | 'realisasi', value: number) => {
    setEditingSD({ id, field });
    setEditSDValue(String(value));
  };

  const commitEditSD = () => {
    if (!editingSD) return;
    const parsed = Number(editSDValue);
    if (!isNaN(parsed) && parsed >= 0) {
      setSumberDana(prev => prev.map(item => {
        if (item.id !== editingSD.id) return item;
        const nominal = editingSD.field === 'nominal' ? parsed : item.nominal;
        const realisasi = editingSD.field === 'realisasi' ? parsed : item.realisasi;
        return { ...item, nominal, realisasi, saldo_di_bank: nominal - realisasi };
      }));
    }
    setEditingSD(null);
  };

  // ===== Pengeluaran Bulanan Editing =====
  const startEditPB = (id: string, field: 'nominal_pengeluaran' | 'qty', value: number) => {
    setEditingPB({ id, field });
    setEditPBValue(String(value));
  };

  const commitEditPB = () => {
    if (!editingPB) return;
    const parsed = Number(editPBValue);
    if (!isNaN(parsed) && parsed >= 0) {
      setPengeluaran(prev => prev.map(item => {
        if (item.id !== editingPB.id) return item;
        const nom = editingPB.field === 'nominal_pengeluaran' ? parsed : item.nominal_pengeluaran;
        const qty = editingPB.field === 'qty' ? parsed : item.qty;
        return { ...item, nominal_pengeluaran: nom, qty, sub_total: nom * qty };
      }));
    }
    setEditingPB(null);
  };

  // ===== Shared editable cell render =====
  const renderEditableCellSD = (row: SumberDanaInstitusi, field: 'nominal' | 'realisasi') => {
    const value = row[field];
    const isEditing = editingSD?.id === row.id && editingSD?.field === field;

    if (isEditing) {
      return (
        <td className="sheet-cell sheet-cell-editing text-right">
          <input
            autoFocus
            type="text"
            value={editSDValue}
            onChange={(e) => setEditSDValue(e.target.value)}
            onBlur={commitEditSD}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); commitEditSD(); }
              if (e.key === 'Escape') setEditingSD(null);
            }}
            className="w-full bg-transparent outline-none text-right font-mono text-sm"
          />
        </td>
      );
    }

    return (
      <td className="sheet-cell sheet-cell-editable text-right" onClick={() => startEditSD(row.id, field, value)}>
        {fmtRupiah(value)}
      </td>
    );
  };

  const renderEditableCellPB = (row: PengeluaranBulananInstitusi, field: 'nominal_pengeluaran' | 'qty') => {
    const value = row[field];
    const isEditing = editingPB?.id === row.id && editingPB?.field === field;

    if (isEditing) {
      return (
        <td className="sheet-cell sheet-cell-editing text-right">
          <input
            autoFocus
            type="text"
            value={editPBValue}
            onChange={(e) => setEditPBValue(e.target.value)}
            onBlur={commitEditPB}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); commitEditPB(); }
              if (e.key === 'Escape') setEditingPB(null);
            }}
            className="w-full bg-transparent outline-none text-right font-mono text-sm"
          />
        </td>
      );
    }

    return (
      <td className="sheet-cell sheet-cell-editable text-right" onClick={() => startEditPB(row.id, field, value)}>
        {field === 'qty' ? value : fmtRupiah(value)}
      </td>
    );
  };

  return (
    <div className="min-h-screen">
      <Header
        title={`Profil: ${institusi.nama_institusi}`}
        subtitle={`${institusi.jenjang} — ${institusi.kabupaten_kota_nama}, ${institusi.provinsi_nama} Tahun ${activeTahun}`}
      />

      <div className="p-6 space-y-6">
        {/* Back button */}
        <div>
          <button onClick={() => router.back()} className="btn btn-ghost text-sm">
            <ArrowLeft size={14} />
            Kembali
          </button>
        </div>

        {/* ===== HEADER INFO CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Info Institusi */}
          <div className="metric-card accent-indigo col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Banknote size={18} className="text-indigo-500" />
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Nama Institusi Pendidikan</span>
            </div>
            <p className="text-lg font-bold text-text-primary mb-2">{institusi.nama_institusi}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-muted">Nomor Rekening Bank Himbara:</span>
              {editingRekening ? (
                <input
                  autoFocus
                  type="text"
                  value={nomorRekening}
                  onChange={(e) => setNomorRekening(e.target.value)}
                  onBlur={() => setEditingRekening(false)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setEditingRekening(false); }}
                  className="bg-white/70 border border-accent rounded px-2 py-0.5 text-sm font-mono outline-none"
                />
              ) : (
                <span
                  className="font-mono font-medium text-text-primary cursor-pointer hover:text-accent transition-colors flex items-center gap-1"
                  onClick={() => setEditingRekening(true)}
                >
                  {nomorRekening || '—'}
                  <Edit3 size={12} className="text-text-muted" />
                </span>
              )}
            </div>
          </div>

          {/* Saldo Surplus / Defisit */}
          <div className={`metric-card ${saldoSurplusDefisit >= 0 ? 'accent-emerald' : 'accent-rose'}`}>
            <div className="flex items-center gap-2 mb-3">
              {saldoSurplusDefisit >= 0 ? (
                <TrendingUp size={18} className="text-emerald-500" />
              ) : (
                <TrendingDown size={18} className="text-rose-500" />
              )}
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Saldo Surplus / Defisit</span>
            </div>
            <p className={`text-2xl font-bold ${saldoSurplusDefisit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {fmtRupiah(saldoSurplusDefisit)}
            </p>
            <p className="text-xs text-text-muted mt-1">
              {saldoSurplusDefisit >= 0 ? '✅ Surplus — dana tersisa' : '❌ Defisit — pengeluaran melebihi anggaran'}
            </p>
          </div>

          {/* Total Pengeluaran Bulanan */}
          <div className="metric-card accent-amber">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={18} className="text-amber-500" />
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Pengeluaran Bulanan</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {fmtRupiah(totalPengeluaran)}
            </p>
            <p className="text-xs text-text-muted mt-1">
              Total penggunaan anggaran s.d. Desember {activeTahun}
            </p>
          </div>
        </div>

        {/* ===== TABLE 1: SUMBER DANA ===== */}
        <div>
          <div className="sheet-toolbar">
            <span className="text-sm font-bold text-text-primary">
              📊 Tahun Anggaran (Sumber Dana)
            </span>
            <span className="text-xs text-text-muted flex-1">{sumberDana.length} sumber</span>
          </div>
          <div className="sheet-container" style={{ maxHeight: 'none' }}>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="sheet-header-cell text-center" style={{ width: 50 }}>No</th>
                  <th className="sheet-header-cell text-left" style={{ minWidth: 300 }}>Tahun Anggaran (Sumber Dana)</th>
                  <th className="sheet-header-cell text-right" style={{ minWidth: 180 }}>Nominal</th>
                  <th className="sheet-header-cell text-right" style={{ minWidth: 180 }}>Realisasi</th>
                  <th className="sheet-header-cell text-right" style={{ minWidth: 180 }}>Saldo di Bank</th>
                </tr>
              </thead>
              <tbody>
                {sumberDana.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-indigo-50/50 transition">
                    <td className="sheet-cell text-center text-text-muted text-xs">{idx + 1}</td>
                    <td className="sheet-cell text-left font-medium text-text-primary">{row.nama_sumber}</td>
                    {renderEditableCellSD(row, 'nominal')}
                    {renderEditableCellSD(row, 'realisasi')}
                    <td className={`sheet-cell text-right font-medium ${row.saldo_di_bank >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {fmtRupiah(row.saldo_di_bank)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="sheet-footer-cell" />
                  <td className="sheet-footer-cell text-left font-bold">TOTAL</td>
                  <td className="sheet-footer-cell text-right">{fmtRupiah(totalNominalSumber)}</td>
                  <td className="sheet-footer-cell text-right">{fmtRupiah(totalRealisasiSumber)}</td>
                  <td className={`sheet-footer-cell text-right font-bold ${totalSaldoDiBank >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {fmtRupiah(totalSaldoDiBank)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ===== TABLE 2: PENGELUARAN BULANAN ===== */}
        <div>
          <div className="sheet-toolbar">
            <span className="text-sm font-bold text-text-primary">
              📅 Rincian Penggunaan Anggaran Pendidikan {institusi.nama_institusi}
            </span>
          </div>
          <div className="sheet-container" style={{ maxHeight: 'none' }}>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="sheet-header-cell text-center" style={{ width: 50 }}>No</th>
                  <th className="sheet-header-cell text-left" style={{ minWidth: 150 }}>Bulan Anggaran</th>
                  <th className="sheet-header-cell text-right" style={{ minWidth: 180 }}>Nominal Pengeluaran</th>
                  <th className="sheet-header-cell text-center" style={{ width: 80 }}>Qty</th>
                  <th className="sheet-header-cell text-right" style={{ minWidth: 180 }}>Sub Total</th>
                </tr>
              </thead>
              <tbody>
                {pengeluaran.map((row) => (
                  <tr key={row.id} className="hover:bg-indigo-50/50 transition">
                    <td className="sheet-cell text-center text-text-muted text-xs">{row.nomor}</td>
                    <td className="sheet-cell text-left font-medium text-text-primary">
                      <Link
                        href={`/dashboard/profil-institusi/${id}/rincian/${row.nomor}`}
                        className="hover:text-accent hover:underline transition-colors"
                      >
                        {row.bulan}
                      </Link>
                    </td>
                    {renderEditableCellPB(row, 'nominal_pengeluaran')}
                    {renderEditableCellPB(row, 'qty')}
                    <td className="sheet-cell text-right font-medium text-text-primary">
                      {fmtRupiah(row.sub_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="sheet-footer-cell" />
                  <td className="sheet-footer-cell text-left font-bold" colSpan={3}>Total</td>
                  <td className={`sheet-footer-cell text-right font-bold ${totalPengeluaran <= totalRealisasiSumber ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {fmtRupiah(totalPengeluaran)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <p className="text-xs text-text-muted">
          ✏️ Klik sel Nominal, Realisasi, atau Qty untuk edit langsung • Kalkulasi Saldo di Bank dan Sub Total otomatis
        </p>
      </div>
    </div>
  );
}
