'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  CalendarCheck, 
  Sliders, 
  Activity, 
  Lock, 
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

import MonthlyExportModal from '@/components/attendance/MonthlyExportModal';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLeadership, isFounder, loading } = useAuth();
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <ShieldCheck className="w-10 h-10 text-cyan-400 animate-pulse" />
        <div className="text-sm font-mono text-cyan-300">Checking Flight Command Clearance...</div>
      </div>
    );
  }

  if (!user || !isLeadership) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md p-8 rounded-3xl bg-space-900 border border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.25)] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-500/50 text-red-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-mono font-bold text-white tracking-wider">
            RESTRICTED FLIGHT DECK
          </h2>
          <p className="text-xs text-red-200/90 leading-relaxed">
            Access to Flight Command is strictly restricted to Founder (<code>SPARC-FDR</code>), Captain (<code>SPARC-001</code>), Vice Captain (<code>SPARC-002</code>), and Secretary (<code>SPARC-003</code>).
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs border border-slate-600 transition-colors"
            >
              Return to Cadet Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { name: 'Telemetry Overview', href: '/admin', icon: Activity },
    { name: 'Live Roll Call & Attendance', href: '/admin/attendance', icon: CalendarCheck },
    { name: 'Cadet Roster & IDs', href: '/admin/members', icon: Users, founderOnly: false },
    { name: 'Mission Parameters & Settings', href: '/admin/settings', icon: Sliders, founderOnly: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Flight Command Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-space-900 via-space-850 to-space-950 border border-cyan-500/30 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            FLIGHT COMMAND HEADQUARTERS • {user.role.replace('_', ' ')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-mono font-extrabold text-white mt-1">
            SPARC Mission Control Deck
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Signed in as: <strong className="text-cyan-300">{user.name}</strong> (<span className="text-amber-400">{user.sparc_id}</span>)
          </p>
        </div>

        {/* Quick CSV Export Shortcut */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-space-950 font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,240,255,0.35)]"
          >
            <FileSpreadsheet className="w-4 h-4 text-space-950" />
            Export Monthly Attendance CSV
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-cyan-500/20 pb-4">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          if (tab.founderOnly && !isFounder) return null;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-semibold flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                  : 'bg-space-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
              {tab.founderOnly && (
                <span className="text-[9px] px-1.5 py-0.2 bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded">
                  FOUNDER
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Active Subpage Content */}
      <div className="space-y-6">
        {children}
      </div>

      {/* Monthly Attendance CSV Export Modal */}
      <MonthlyExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
