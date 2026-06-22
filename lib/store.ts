'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface DbData {
  tahun_anggaran: any[];
  provinsi: any[];
  alokasi_provinsi: any[];
  kabupaten_kota: any[];
  alokasi_kabupaten_kota: any[];
  institusi_pendidikan: any[];
  sumber_dana_institusi: any[];
  pengeluaran_bulanan_institusi: any[];
  rincian_pengeluaran_item: any[];
  users: any[];
  audit_anomaly: any[];
}

interface AppState {
  activeTahun: number;
  setActiveTahun: (tahun: number) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Supabase states
  isSupabaseMode: boolean;
  setIsSupabaseMode: (active: boolean) => void;
  dbData: DbData | null;
  setDbData: (data: DbData | null) => void;
  isLoadingDb: boolean;
  setIsLoadingDb: (loading: boolean) => void;

  // Update institusi data lazily (dari halaman jenjang/profil)
  updateInstitusiData: (data: any[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeTahun: 2026,
      setActiveTahun: (tahun) => set({ activeTahun: tahun }),
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Supabase initial states
      isSupabaseMode: false,
      setIsSupabaseMode: (active) => set({ isSupabaseMode: active }),
      dbData: null,
      setDbData: (data) => set({ dbData: data }),
      isLoadingDb: false,
      setIsLoadingDb: (loading) => set({ isLoadingDb: loading }),

      // Lazy update: merge institusi ke dbData yang sudah ada
      updateInstitusiData: (institusiData) => {
        const current = get().dbData;
        if (current) {
          set({ dbData: { ...current, institusi_pendidikan: institusiData } });
        }
      },
    }),
    {
      name: 'dashboard-auditor-store',
      storage: createJSONStorage(() => sessionStorage), // sessionStorage: persist per-tab, reset saat tutup browser
      // Hanya persist state penting, BUKAN dbData (besar) dan isLoadingDb
      partialize: (state) => ({
        activeTahun: state.activeTahun,
        sidebarOpen: state.sidebarOpen,
        isSupabaseMode: state.isSupabaseMode,
        dbData: state.dbData,
      }),
    }
  )
);
