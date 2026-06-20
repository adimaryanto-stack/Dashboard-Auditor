'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import MetricCard from '@/components/ui/MetricCard';
import PctBadge from '@/components/ui/PctBadge';
import { getDashboardSummary } from '@/lib/data';
import { fmtRupiah, fmtPct, getPctColor } from '@/lib/utils/formatters';
import { Wallet, TrendingUp, PieChart, GraduationCap } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Area, AreaChart
} from 'recharts';
import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';

export default function DashboardPage() {
  const { activeTahun } = useAppStore();
  const summary = useMemo(() => getDashboardSummary(activeTahun), [activeTahun]);

  const barData = summary.per_jenjang.map(j => ({
    jenjang: j.jenjang === 'UNIVERSITAS' ? 'Univ' : j.jenjang,
    Nominal: j.nominal,
    Realisasi: j.realisasi,
  }));

  const trendData = summary.tren_tahunan.map(t => ({
    tahun: String(t.tahun),
    Nominal: t.nominal,
    Realisasi: t.realisasi,
  }));

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" subtitle="Ringkasan analisis audit anggaran Pendidikan Nasional" />

      <div className="p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Total Nominal APBN"
            value={fmtRupiah(summary.total_nominal)}
            subtitle={`Anggaran Pendidikan ${activeTahun}`}
            icon={<Wallet size={20} className="text-indigo-600" />}
            accent="indigo"
            trend={{ value: 6.4, label: `dari ${activeTahun - 1}` }}
          />
          <MetricCard
            title="Total Realisasi"
            value={fmtRupiah(summary.total_realisasi)}
            subtitle="Penyerapan anggaran terkini"
            icon={<TrendingUp size={20} className="text-emerald-600" />}
            accent="emerald"
            trend={{ value: 4.2, label: 'dari bulan lalu' }}
          />
          <MetricCard
            title="% Penyerapan Nasional"
            value={fmtPct(summary.persentase_penyerapan)}
            subtitle="Target minimal 80%"
            icon={<PieChart size={20} className="text-amber-600" />}
            accent="amber"
          />
        </div>

        {/* Ringkasan per Jenjang */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <GraduationCap size={18} className="text-indigo-600" />
            <h3 className="text-sm font-semibold text-text-primary">Ringkasan per Jenjang Pendidikan</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="sheet-header-cell text-left">Jenjang</th>
                  <th className="sheet-header-cell text-right">Nominal</th>
                  <th className="sheet-header-cell text-right">Realisasi</th>
                  <th className="sheet-header-cell text-right">Selisih</th>
                  <th className="sheet-header-cell text-center">% Penyerapan</th>
                  <th className="sheet-header-cell" style={{ width: 180 }}>Progress</th>
                </tr>
              </thead>
              <tbody>
                {summary.per_jenjang.map((j, idx) => {
                  const selisih = j.nominal - j.realisasi;
                  const barColor = j.persentase >= 80 ? '#10b981' : j.persentase >= 50 ? '#f59e0b' : '#ef4444';
                  return (
                    <tr key={j.jenjang} className="hover:bg-indigo-50/50 transition" style={{ animationDelay: `${idx * 80}ms` }}>
                      <td className="sheet-cell text-left font-medium text-text-primary">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: barColor }} />
                          <Link href={`/dashboard/jenjang/${j.jenjang.toLowerCase()}`} className="hover:text-accent hover:underline transition-colors">
                            {j.jenjang}
                          </Link>
                        </div>
                      </td>
                      <td className="sheet-cell text-right">{fmtRupiah(j.nominal)}</td>
                      <td className="sheet-cell text-right">{fmtRupiah(j.realisasi)}</td>
                      <td className="sheet-cell text-right text-rose-600">{fmtRupiah(selisih)}</td>
                      <td className="sheet-cell text-center">
                        <PctBadge value={j.persentase} />
                      </td>
                      <td className="sheet-cell">
                        <div className="progress-bar-track">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${Math.min(j.persentase, 100)}%`,
                              background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td className="sheet-footer-cell text-left">TOTAL</td>
                  <td className="sheet-footer-cell text-right">{fmtRupiah(summary.total_nominal)}</td>
                  <td className="sheet-footer-cell text-right">{fmtRupiah(summary.total_realisasi)}</td>
                  <td className="sheet-footer-cell text-right text-rose-600">{fmtRupiah(summary.total_nominal - summary.total_realisasi)}</td>
                  <td className="sheet-footer-cell text-center">
                    <PctBadge value={summary.persentase_penyerapan} size="md" />
                  </td>
                  <td className="sheet-footer-cell">
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min(summary.persentase_penyerapan, 100)}%`,
                          background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                        }}
                      />
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bar Chart */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Nominal vs Realisasi per Jenjang</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="jenjang" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={(v) => fmtRupiah(v)} />
                <Tooltip
                  contentStyle={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, color: '#1e293b', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(value: any) => [fmtRupiah(Number(value)), '']}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
                <Bar dataKey="Nominal" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Realisasi" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Trend Line Chart */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Tren APBN Pendidikan 2020–2026</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gradNominal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradRealisasi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="tahun" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={(v) => fmtRupiah(v)} />
                <Tooltip
                  contentStyle={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, color: '#1e293b', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(value: any) => [fmtRupiah(Number(value)), '']}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
                <Area type="monotone" dataKey="Nominal" stroke="#6366f1" fill="url(#gradNominal)" strokeWidth={2} />
                <Area type="monotone" dataKey="Realisasi" stroke="#10b981" fill="url(#gradRealisasi)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
