'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  LayoutDashboard, DollarSign, MapPin, Building2,
  GraduationCap, Users, ChevronDown, ChevronRight,
  Menu, X, Landmark, School
} from 'lucide-react';
import { useState } from 'react';

const jenjangItems = [
  { label: 'Universitas', href: '/dashboard/jenjang/universitas' },
  { label: 'SMA', href: '/dashboard/jenjang/sma' },
  { label: 'SMP', href: '/dashboard/jenjang/smp' },
  { label: 'SD', href: '/dashboard/jenjang/sd' },
  { label: 'PAUD', href: '/dashboard/jenjang/paud' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const [jenjangOpen, setJenjangOpen] = useState(pathname.includes('/jenjang'));

  const isActive = (href: string) => pathname === href;
  const isJenjangActive = pathname.includes('/jenjang');

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-border shadow-sm lg:hidden"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar fixed top-0 left-0 h-screen z-40 w-64 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static`}>
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Landmark size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-text-primary leading-tight">Dashboard</h1>
              <p className="text-xs text-text-muted">Kementerian</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link href="/dashboard" className={`sidebar-item ${isActive('/dashboard') ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          <Link href="/dashboard/apbn" className={`sidebar-item ${isActive('/dashboard/apbn') ? 'active' : ''}`}>
            <DollarSign size={18} />
            <span>APBN Pertahun</span>
          </Link>

          <Link href="/dashboard/provinsi" className={`sidebar-item ${isActive('/dashboard/provinsi') ? 'active' : ''}`}>
            <MapPin size={18} />
            <span>Provinsi</span>
          </Link>

          <Link href="/dashboard/kabupaten-kota" className={`sidebar-item ${isActive('/dashboard/kabupaten-kota') ? 'active' : ''}`}>
            <Building2 size={18} />
            <span>Kabupaten / Kota</span>
          </Link>

          {/* Jenjang Accordion */}
          <div>
            <button
              onClick={() => setJenjangOpen(!jenjangOpen)}
              className={`sidebar-item w-full ${isJenjangActive ? 'active' : ''}`}
            >
              <GraduationCap size={18} />
              <span className="flex-1 text-left">Jenjang Pendidikan</span>
              {jenjangOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ${jenjangOpen ? 'max-h-60' : 'max-h-0'}`}>
              <div className="ml-4 pl-4 border-l border-border/50 space-y-0.5 py-1">
                {jenjangItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-item text-sm py-1.5 ${isActive(item.href) ? 'active' : ''}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="/dashboard/profil-institusi" className={`sidebar-item ${pathname.includes('/profil-institusi') ? 'active' : ''}`}>
            <School size={18} />
            <span>Profil Institusi</span>
          </Link>

          <Link href="/dashboard/users" className={`sidebar-item ${isActive('/dashboard/users') ? 'active' : ''}`}>
            <Users size={18} />
            <span>User Manager</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">Super Admin</p>
              <p className="text-[10px] text-text-muted truncate">admin@kemdikbud.go.id</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
