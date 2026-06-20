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
    async function loadDatabase() {
      // Check if environment variables are set
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        console.log('[Supabase Loader] Credentials missing. Falling back to local Mock Data.');
        setIsSupabaseMode(false);
        setIsLoadingDb(false);
        return;
      }

      setIsLoadingDb(true);
      setLoaderText('Memeriksa skema database Supabase...');

      try {
        // Test query on one table to see if connection works and schema exists
        const { data: testData, error: testError } = await supabase
          .from('tahun_anggaran')
          .select('*')
          .limit(1);

        if (testError) {
          // If connection fails or table doesn't exist, fall back to mock data
          if (testError.message.includes('relation') || testError.message.includes('does not exist')) {
            console.warn('[Supabase Loader] Table "tahun_anggaran" does not exist in Supabase. Run schema DDL first. Falling back to Mock Data.');
            setIsSupabaseMode(false);
            setIsLoadingDb(false);
            return;
          }
          throw testError;
        }

        // Define paginated fetch function
        async function fetchAllRows(tableName: string) {
          let allData: any[] = [];
          let from = 0;
          const limit = 1000;
          let hasMore = true;

          while (hasMore) {
            const { data, error } = await supabase
              .from(tableName)
              .select('*')
              .range(from, from + limit - 1);

            if (error) {
              throw error;
            }

            if (data) {
              allData = [...allData, ...data];
              if (data.length < limit) {
                hasMore = false;
              } else {
                from += limit;
              }
            } else {
              hasMore = false;
            }
          }

          return allData;
        }

        // Connection successful and tables exist! Start downloading everything
        setLoaderText('Mengunduh data anggaran dan wilayah...');
        
        // Fetch all tables in parallel with full pagination
        const [
          dataTahun,
          dataProv,
          dataAlokasiProv,
          dataKab,
          dataAlokasiKab,
          dataInst,
          dataSD,
          dataPB,
          dataItems,
          dataUsers,
          dataAnoms
        ] = await Promise.all([
          fetchAllRows('tahun_anggaran'),
          fetchAllRows('provinsi'),
          fetchAllRows('alokasi_provinsi'),
          fetchAllRows('kabupaten_kota'),
          fetchAllRows('alokasi_kabupaten_kota'),
          fetchAllRows('institusi_pendidikan'),
          fetchAllRows('sumber_dana_institusi'),
          fetchAllRows('pengeluaran_bulanan_institusi'),
          fetchAllRows('rincian_pengeluaran_item'),
          fetchAllRows('users'),
          fetchAllRows('audit_anomaly')
        ]);

        setLoaderText('Sinkronisasi data sistem...');

        const loadedDb = {
          tahun_anggaran: dataTahun,
          provinsi: dataProv,
          alokasi_provinsi: dataAlokasiProv,
          kabupaten_kota: dataKab,
          alokasi_kabupaten_kota: dataAlokasiKab,
          institusi_pendidikan: dataInst,
          sumber_dana_institusi: dataSD,
          pengeluaran_bulanan_institusi: dataPB,
          rincian_pengeluaran_item: dataItems,
          users: dataUsers,
          audit_anomaly: dataAnoms
        };

        // Cache in Zustand store
        setDbData(loadedDb);
        setIsSupabaseMode(true);

        // Sync local memory let variables in lib/data
        updateTahunAnggaranData(loadedDb.tahun_anggaran);
        updateAlokasiProvinsiData(loadedDb.alokasi_provinsi);
        updateUsersData(loadedDb.users);
        updateMockAnomalies(loadedDb.audit_anomaly);

        console.log('[Supabase Loader] Synced all tables from Supabase successfully.');
      } catch (err: any) {
        console.error('[Supabase Loader] Connection failed:', err.message);
        setInitFailed(true);
        setFailReason(err.message || 'Gagal menghubungi server Supabase.');
        // Auto fallback to mock data after 3 seconds warning
        setTimeout(() => {
          setIsSupabaseMode(false);
          setIsLoadingDb(false);
        }, 3000);
      } finally {
        // Wait a tiny bit for user experience
        setTimeout(() => {
          setIsLoadingDb(false);
        }, 600);
      }
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
              {/* Failure UI */}
              <div className="relative p-4 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-full animate-bounce">
                <CloudAlert size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Koneksi Supabase Gagal</h3>
                <p className="text-xs text-slate-400 break-all px-4">{failReason}</p>
                <p className="text-xs text-indigo-400 font-semibold mt-4">Mengalihkan secara otomatis ke Mode Mock Data...</p>
              </div>
            </>
          ) : (
            <>
              {/* Loading UI */}
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
                  Menyinkronkan data transaksional anggaran pendidikan nasional langsung dari cloud database
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
