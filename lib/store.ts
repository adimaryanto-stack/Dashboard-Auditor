'use client';

import { create } from 'zustand';

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
}

export const useAppStore = create<AppState>((set) => ({
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
}));
