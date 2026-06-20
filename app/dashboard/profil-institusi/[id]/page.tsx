'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { useAppStore } from '@/lib/store';
import { getProfilInstitusi } from '@/lib/data';
import { fmtRupiah } from '@/lib/utils/formatters';
import { SumberDanaInstitusi, PengeluaranBulananInstitusi } from '@/types';
import { ArrowLeft, Banknote, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import EditableCell from '@/components/spreadsheet/EditableCell';

export default function ProfilInstitusiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { activeTahun, isSupabaseMode, dbData, setDbData } = useAppStore();

  const profilData = useMemo(() => getProfilInstitusi(id, activeTahun), [id, activeTahun, isSupabaseMode, dbData]);

  // Editable state
  const [sumberDana, setSumberDana] = useState<SumberDanaInstitusi[]>([]);
  const [pengeluaran, setPengeluaran] = useState<PengeluaranBulananInstitusi[]>([]);
  const [nomorRekening, setNomorRekening] = useState('');

  useEffect(() => {
    if (profilData) {
      setSumberDana(profilData.sumber_dana);
      setPengeluaran(profilData.pengeluaran_bulanan);
      setNomorRekening(profilData.institusi.nomor_rekening || '');
    }
  }, [profilData]);

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

  const handleSaveSD = async (rowId: string, field: 'nominal' | 'realisasi', newValue: number) => {
    setSumberDana(prev => prev.map(item => {
      if (item.id === rowId) {
        const nominal = field === 'nominal' ? newValue : item.nominal;
        const realisasi = field === 'realisasi' ? newValue : item.realisasi;
        return {
          ...item,
          [field]: newValue,
          saldo_di_bank: nominal - realisasi
        };
      }
      return item;
    }));

    if (isSupabaseMode && dbData) {
      const updatedSD = dbData.sumber_dana_institusi.map((sd: any) => {
        if (sd.id === rowId) {
          const nominal = field === 'nominal' ? newValue : Number(sd.nominal);
          const realisasi = field === 'realisasi' ? newValue : Number(sd.realisasi);
          return {
            ...sd,
            [field]: newValue,
            saldo_di_bank: nominal - realisasi
          };
        }
        return sd;
      });

      setDbData({ ...dbData, sumber_dana_institusi: updatedSD });

      const targetSD = updatedSD.find(s => s.id === rowId);
      const updatePayload: any = {
        [field]: newValue,
        saldo_di_bank: targetSD ? targetSD.saldo_di_bank : 0
      };

      const { error } = await supabase
        .from('sumber_dana_institusi')
        .update(updatePayload)
        .eq('id', rowId);

      if (error) {
        console.error('Failed to update sumber_dana_institusi in Supabase:', error.message);
      }
    }
  };

  const handleSavePB = async (rowId: string, field: 'nominal_pengeluaran' | 'qty', newValue: number) => {
    setPengeluaran(prev => prev.map(item => {
      if (item.id === rowId) {
        const nominal = field === 'nominal_pengeluaran' ? newValue : item.nominal_pengeluaran;
        const qty = field === 'qty' ? newValue : item.qty;
        return {
          ...item,
          [field]: newValue,
          sub_total: nominal * qty
        };
      }
      return item;
    }));

    if (isSupabaseMode && dbData) {
      const updatedPB = dbData.pengeluaran_bulanan_institusi.map((pb: any) => {
        if (pb.id === rowId) {
          const nominal = field === 'nominal_pengeluaran' ? newValue : Number(pb.nominal_pengeluaran);
          const qty = field === 'qty' ? newValue : Number(pb.qty);
          return {
            ...pb,
            [field]: newValue,
            sub_total: nominal * qty
          };
        }
        return pb;
      });

      setDbData({ ...dbData, pengeluaran_bulanan_institusi: updatedPB });

      const targetPB = updatedPB.find(p => p.id === rowId);
      const updatePayload: any = {
        [field]: newValue,
        sub_total: targetPB ? targetPB.sub_total : 0
      };

      const { error } = await supabase
        .from('pengeluaran_bulanan_institusi')
        .update(updatePayload)
        .eq('id', rowId);

      if (error) {
        console.error('Failed to update pengeluaran_bulanan_institusi in Supabase:', error.message);
      }
    }
  };

  // ===== Shared editable cell render =====
  const renderEditableCellSD = (row: SumberDanaInstitusi, field: 'nominal' | 'realisasi') => {
    const value = row[field];
    return (
      <td className="sheet-cell p-0">
        <EditableCell
          value={value}
          onSave={(newValue) => handleSaveSD(row.id, field, newValue)}
        />
      </td>
    );
  };

  const renderEditableCellPB = (row: PengeluaranBulananInstitusi, field: 'nominal_pengeluaran' | 'qty') => {
    const value = row[field];
    return (
      <td className="sheet-cell p-0">
        <EditableCell
          value={value}
          onSave={(newValue) => handleSavePB(row.id, field, newValue)}
          formatter={field === 'qty' ? (val) => val.toLocaleString('id-ID') : fmtRupiah}
        />
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
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Detail Institusi Pendidikan</span>
            </div>
            <p className="text-lg font-bold text-text-primary mb-1">{institusi.nama_institusi}</p>
            
            <div className="space-y-1.5 mt-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-text-muted">NPSN:</span>
                <span className="font-semibold text-text-primary font-mono">{institusi.npsn || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-text-muted">NISN Institusi:</span>
                <span className="font-semibold text-text-primary font-mono">{institusi.nisn || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-text-muted">No. Rekening Bank Himbara:</span>
                <span className="font-semibold text-text-primary font-mono">{nomorRekening || '—'}</span>
              </div>
              <div className="pt-1">
                <span className="text-text-muted block mb-0.5">Alamat Lengkap:</span>
                <span className="text-text-primary font-medium leading-relaxed">{institusi.alamat || '—'}</span>
              </div>
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
      </div>
    </div>
  );
}
