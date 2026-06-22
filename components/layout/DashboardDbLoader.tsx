'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import {
  updateTahunAnggaranData,
  updateAlokasiProvinsiData,
  updateUsersData,
  updateMockAnomalies
} from '@/lib/data';
import { Database, Loader2, CloudAlert, Sparkles } from 'lucide-react';

export default function DashboardDbLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    isSupabaseMode,
    setIsSupabaseMode,
    dbData,
    setDbData,
    isLoadingDb,
    setIsLoadingDb
  } = useAppStore();

  const [loaderText, setLoaderText] = useState('Menginisialisasi dasbor...');
  const [initFailed, setInitFailed] = useState(false);
  const [failReason, setFailReason] = useState('');

  useEffect(() => {
    // Jika sudah pernah dimuat di session ini, skip
    if (isSupabaseMode && dbData) {
      return;
    }

    async function loadDatabase() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        console.log('[Supabase Loader] Credentials missing. Falling back to Mock Data.');
        setIsSupabaseMode(false);
        setIsLoadingDb(false);
        return;
      }

      setIsLoadingDb(true);
      setLoaderText('Memeriksa koneksi Supabase...');

      try {
        // Test koneksi dengan query ringan
        const { error: testError } = await supabase
          .from('tahun_anggaran')
          .select('id')
          .limit(1);

        if (testError) {
          if (testError.message.includes('relation') || testError.message.includes('does not exist')) {
            console.warn('[Supabase Loader] Tabel tidak ditemukan. Gunakan Mock Data.');
            setIsSupabaseMode(false);
            setIsLoadingDb(false);
            return;
          }
          throw testError;
        }

        // Fetch bertahap: hanya tabel ringan/referensi di awal
        // Tabel berat (institusi, pengeluaran, rincian) di-lazy-load per halaman
        async function fetchAll(tableName: string) {
          let all: any[] = [];
          let from = 0;
          const limit = 1000;

          while (true) {
            const { data, error } = await supabase
              .from(tableName)
              .select('*')
              .range(from, from + limit - 1);

            if (error) throw error;
            if (!data || data.length === 0) break;

            all = [...all, ...data];
            if (data.length < limit) break;
            from += limit;
          }

          return all;
        }

        setLoaderText('Mengunduh data referensi...');

        // Batch 1: Tabel kecil / referensi — cepat
        const [dataTahun, dataProv, dataAlokasiProv] = await Promise.all([
          fetchAll('tahun_anggaran'),
          fetchAll('provinsi'),
          fetchAll('alokasi_provinsi'),
        ]);

        setLoaderText('Mengunduh data wilayah...');

        // Batch 2: Kabupaten/kota — menengah
        const [dataKab, dataAlokasiKab, dataUsers, dataAnoms] = await Promise.all([
          fetchAll('kabupaten_kota'),
          fetchAll('alokasi_kabupaten_kota'),
          fetchAll('users'),
          fetchAll('audit_anomaly'),
        ]);

        setLoaderText('Sinkronisasi selesai...');

        const loadedDb = {
          tahun_anggaran: dataTahun,
          provinsi: dataProv,
          alokasi_provinsi: dataAlokasiProv,
          kabupaten_kota: dataKab,
          alokasi_kabupaten_kota: dataAlokasiKab,
          // Tabel berat dimuat lazy di halaman masing-masing
          institusi_pendidikan: [],
          sumber_dana_institusi: [],
          pengeluaran_bulanan_institusi: [],
          rincian_pengeluaran_item: [],
          users: dataUsers,
          audit_anomaly: dataAnoms,
        };

        setDbData(loadedDb);
        setIsSupabaseMode(true);

        // Sync variabel modul lib/data
        updateTahunAnggaranData(loadedDb.tahun_anggaran);
        updateAlokasiProvinsiData(loadedDb.alokasi_provinsi);
        updateUsersData(loadedDb.users);
        updateMockAnomalies(loadedDb.audit_anomaly);

        console.log('[Supabase Loader] Berhasil sinkron tabel referensi dari Supabase.');
      } catch (err: any) {
        console.error('[Supabase Loader] Koneksi gagal:', err.message);
        setInitFailed(true);
        setFailReason(err.message || 'Gagal menghubungi server Supabase.');
        // Bug fix: tunggu 3 detik lalu fallback ke mock data
        setTimeout(() => {
          setIsSupabaseMode(false);
          setIsLoadingDb(false); // ← hanya di-set false SETELAH timeout catch selesai
        }, 3000);
        return; // ← PENTING: return agar finally tidak mempengaruhi
      }

      // Hanya sampai di sini jika sukses
      setIsLoadingDb(false);
    }

    loadDatabase();
  }, []);

  if (isLoadingDb) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xl transition-all duration-500">
        <div className="relative flex flex-col items-center max-w-md p-8 text-center space-y-6">
          
          {/* Glowing Orbs Backdrop */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />

          {initFailed ? (
            <>
              <div className="relative p-4 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-full animate-bounce">
                <CloudAlert size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Koneksi Supabase Gagal</h3>
                <p className="text-xs text-slate-400 break-all px-4">{failReason}</p>
                <p className="text-xs text-indigo-400 font-semibold mt-4">Mengalihkan ke Mode Mock Data...</p>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl scale-125 animate-pulse" />
                <div className="relative p-6 bg-slate-900 border border-slate-800 text-indigo-500 rounded-3xl shadow-2xl flex items-center justify-center">
                  <Database size={44} className="animate-pulse" />
                  <Loader2 size={24} className="absolute text-emerald-400 animate-spin -top-1 -right-1" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                  <Sparkles size={12} />
                  <span>Supabase Mode Active</span>
                </div>
                <h3 className="text-md font-bold text-white tracking-wide">{loaderText}</h3>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Menyinkronkan data anggaran pendidikan nasional dari cloud database
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
