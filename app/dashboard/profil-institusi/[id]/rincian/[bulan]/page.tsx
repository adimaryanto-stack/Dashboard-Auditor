'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { useAppStore } from '@/lib/store';
import { getRincianPengeluaranBulanan } from '@/lib/data';
import { fmtRupiah } from '@/lib/utils/formatters';
import { RincianPengeluaranItem } from '@/types';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import EditableCell from '@/components/spreadsheet/EditableCell';
import { rollupInstitusiChange } from '@/lib/utils/dbSync';

export default function RincianPengeluaranPage() {
  const params = useParams();
  const router = useRouter();
  const institusiId = params.id as string;
  const nomorBulan = parseInt(params.bulan as string, 10);
  const { activeTahun, isSupabaseMode, dbData, setDbData } = useAppStore();

  const rincianData = useMemo(
    () => getRincianPengeluaranBulanan(institusiId, nomorBulan, activeTahun),
    [institusiId, nomorBulan, activeTahun, isSupabaseMode, dbData]
  );

  // Editable state
  const [items, setItems] = useState<RincianPengeluaranItem[]>([]);
  const [loadingLazy, setLoadingLazy] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    setHasFetched(false);
  }, [institusiId, nomorBulan]);

  useEffect(() => {
    async function fetchLazyItems() {
      if (!isSupabaseMode || !dbData || hasFetched) return;

      const hasItems = dbData.rincian_pengeluaran_item?.some(
        (item: any) => item.institusi_id === institusiId && Number(item.nomor_bulan) === nomorBulan
      );

      if (hasItems) {
        setHasFetched(true);
        return;
      }

      setLoadingLazy(true);
      try {
        const { data: itemsData, error } = await supabase
          .from('rincian_pengeluaran_item')
          .select('*')
          .eq('institusi_id', institusiId)
          .eq('nomor_bulan', nomorBulan);

        if (error) throw error;

        const fetchedItems = itemsData || [];

        const otherItems = (dbData.rincian_pengeluaran_item || []).filter(
          (item: any) => !(item.institusi_id === institusiId && Number(item.nomor_bulan) === nomorBulan)
        );

        setDbData({
          ...dbData,
          rincian_pengeluaran_item: [...otherItems, ...fetchedItems]
        });
        setHasFetched(true);
      } catch (err: any) {
        console.error('Error lazy loading items from Supabase:', err.message);
      } finally {
        setLoadingLazy(false);
      }
    }

    fetchLazyItems();
  }, [institusiId, nomorBulan, isSupabaseMode, dbData, setDbData, hasFetched]);

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

  const handleCellSave = async (rowId: string, field: 'harga_satuan' | 'qty', newValue: number) => {
    const updatedItems = items.map(item => {
      if (item.id === rowId) {
        const harga = field === 'harga_satuan' ? newValue : item.harga_satuan;
        const qty = field === 'qty' ? newValue : item.qty;
        return {
          ...item,
          [field]: newValue,
          jumlah: harga * qty
        };
      }
      return item;
    });

    setItems(updatedItems);

    if (isSupabaseMode && dbData) {
      const updatedDbItems = dbData.rincian_pengeluaran_item.map((item: any) => {
        if (item.id === rowId) {
          const harga = field === 'harga_satuan' ? newValue : Number(item.harga_satuan);
          const qty = field === 'qty' ? newValue : Number(item.qty);
          return {
            ...item,
            [field]: newValue,
            jumlah: harga * qty
          };
        }
        return item;
      });

      const schoolMonthItems = updatedDbItems.filter(
        (item: any) => item.institusi_id === institusiId && Number(item.nomor_bulan) === nomorBulan
      );
      const newMonthlySubtotal = schoolMonthItems.reduce((s, i) => s + Number(i.jumlah), 0);

      const updatedDbPB = dbData.pengeluaran_bulanan_institusi.map((pb: any) => {
        if (pb.institusi_id === institusiId && Number(pb.nomor) === nomorBulan) {
          return {
            ...pb,
            nominal_pengeluaran: newMonthlySubtotal,
            sub_total: newMonthlySubtotal
          };
        }
        return pb;
      });

      const schoolPBList = updatedDbPB.filter((pb: any) => pb.institusi_id === institusiId);
      const newSchoolRealisasi = schoolPBList.reduce((s, pb) => s + Number(pb.sub_total), 0);

      // Save line-item & monthly total in dbData first
      const intermediateDbData = {
        ...dbData,
        rincian_pengeluaran_item: updatedDbItems,
        pengeluaran_bulanan_institusi: updatedDbPB
      };

      // Perform school update & full hierarchy rollup in Supabase + Zustand
      await rollupInstitusiChange(intermediateDbData, setDbData, institusiId, {
        realisasi_total: newSchoolRealisasi
      });

      // Perform individual item and month table updates in Supabase
      const targetItem = updatedDbItems.find(i => i.id === rowId);
      if (targetItem) {
        await supabase
          .from('rincian_pengeluaran_item')
          .update({
            [field]: newValue,
            jumlah: targetItem.jumlah
          })
          .eq('id', rowId);
      }

      await supabase
        .from('pengeluaran_bulanan_institusi')
        .update({
          nominal_pengeluaran: newMonthlySubtotal,
          sub_total: newMonthlySubtotal
        })
        .eq('institusi_id', institusiId)
        .eq('nomor', nomorBulan);
    }
  };

  const renderEditableCell = (row: RincianPengeluaranItem, field: 'harga_satuan' | 'qty') => {
    const value = row[field];
    return (
      <td className="sheet-cell p-0">
        <EditableCell
          value={value}
          onSave={(newValue) => handleCellSave(row.id, field, newValue)}
          formatter={field === 'qty' ? (val) => val.toLocaleString('id-ID') : fmtRupiah}
        />
      </td>
    );
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
              {loadingLazy ? (
                <tr>
                  <td colSpan={5} className="sheet-cell text-center py-8 text-text-muted text-xs">
                    <div className="flex items-center justify-center gap-2 py-4">
                      <Loader2 size={16} className="animate-spin text-indigo-500" />
                      <span>Memuat rincian pengeluaran dari Supabase...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="sheet-cell text-center py-8 text-text-muted text-xs">
                    Tidak ada rincian pengeluaran.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.id} className="hover:bg-indigo-50/50 transition">
                    <td className="sheet-cell text-center text-text-muted text-xs">{row.nomor}</td>
                    <td className="sheet-cell text-left font-medium text-text-primary">{row.nama_produk_jasa}</td>
                    {renderEditableCell(row, 'harga_satuan')}
                    {renderEditableCell(row, 'qty')}
                    <td className="sheet-cell text-right font-medium text-text-primary">
                      {fmtRupiah(row.jumlah)}
                    </td>
                  </tr>
                ))
              )}
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
      </div>
    </div>
  );
}
