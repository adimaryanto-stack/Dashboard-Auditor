'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { useAppStore } from '@/lib/store';
import StatusBadge from '@/components/ui/StatusBadge';
import { tahunAnggaranData } from '@/lib/data';
import { fmtRupiah } from '@/lib/utils/formatters';
import { TahunAnggaran } from '@/types';

export default function APBNPage() {
  const { setActiveTahun } = useAppStore();
  const [data] = useState<TahunAnggaran[]>(tahunAnggaranData);

  return (
    <div className="min-h-screen">
      <Header title="APBN Pertahun" subtitle="Daftar tahun anggaran pendidikan APBN" />

      <div className="p-6">
        {/* Toolbar */}
        <div className="sheet-toolbar">
          <h3 className="text-sm font-semibold text-text-primary flex-1">
            APBN Pendidikan Pertahun
          </h3>
          <span className="text-xs text-text-muted">{data.length} tahun</span>
        </div>

        {/* Table */}
        <div className="sheet-container">
          <table className="w-full">
            <thead>
              <tr>
                <th className="sheet-header-cell text-center" style={{ width: 50 }}>No</th>
                <th className="sheet-header-cell text-center" style={{ width: 100 }}>Tahun</th>
                <th className="sheet-header-cell text-right">Total Anggaran (APBN Pendidikan)</th>
                <th className="sheet-header-cell text-center" style={{ width: 120 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.sort((a, b) => a.tahun - b.tahun).map((row, idx) => (
                <tr key={row.id} className="hover:bg-indigo-50/50 transition">
                  <td className="sheet-cell text-center text-text-muted">{idx + 1}</td>
                  <td className="sheet-cell text-center font-semibold text-text-primary">
                    <Link
                      href="/dashboard"
                      onClick={() => setActiveTahun(row.tahun)}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      {row.tahun}
                    </Link>
                  </td>
                  <td className="sheet-cell text-right">
                    <span>
                      {fmtRupiah(row.total_anggaran)}
                    </span>
                  </td>
                  <td className="sheet-cell text-center">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Status Legend */}
        <div className="mt-4 flex items-center gap-6 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> DRAFT — Baru
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> ACTIVE — Tahun berjalan (hanya 1)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400" /> CLOSED — Arsip, read-only
          </div>
        </div>
      </div>
    </div>
  );
}
