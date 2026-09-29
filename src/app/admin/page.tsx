'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Member, AttendanceRecord, ClubSettings } from '@/types';
import { calculateAttendanceStats, getAvailableAttendanceMonths } from '@/lib/time-utils';
import MonthlyExportModal from '@/components/attendance/MonthlyExportModal';
import { 
  Users, 
  CalendarCheck, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  Clock,
  Sparkles,
  Activity,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

export default function AdminOverviewPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [settings, setSettings] = useState<ClubSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [mRes, aRes, sRes] = await Promise.all([
          fetch('/api/members'),
          fetch('/api/attendance/list'),
          fetch('/api/settings')
        ]);

        if (mRes.ok) {
          const mData = await mRes.json();
          setMembers(mData.members || []);
        }
        if (aRes.ok) {
          const aData = await aRes.json();
          setAttendance(aData.records || []);
        }
        if (sRes.ok) {
          const sData = await sRes.json();
          setSettings(sData.settings || null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-sm font-mono text-cyan-300">
        Loading Flight Command Telemetry...
      </div>
    );
  }

  // Calculate stats for each member to find low attendance cadets (<75%)
  const cadetStatsList = members
    .filter(m => m.role !== 'FOUNDER')
    .map(m => {
      const memberRecords = attendance.filter(a => a.member_id === m.id || a.sparc_id === m.sparc_id);
      const stats = calculateAttendanceStats(memberRecords);
      return {
        member: m,
        stats
      };
    });

  const lowAttendanceCadets = cadetStatsList.filter(item => item.stats.isLowAttendance);
  const totalClubMeetings = new Set(attendance.map(a => a.date)).size;
  const overallClubStats = calculateAttendanceStats(attendance);

  // Chart Data: Status Counts
  const chartData = [
    { name: 'Present', count: overallClubStats.presentCount, color: '#10B981' },
    { name: 'Late', count: overallClubStats.lateCount, color: '#F59E0B' },
    { name: 'Absent', count: overallClubStats.absentCount, color: '#EF4444' },
    { name: 'Holiday', count: overallClubStats.holidayCount, color: '#94A3B8' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Telemetry KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cadets */}
        <div className="p-5 rounded-2xl bg-space-900/80 border border-cyan-500/20 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-2">
            <span>TOTAL CADET CREW</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-mono font-extrabold text-white">
            {members.length}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Active in Cycle {settings?.current_year || '2026-27'}
          </div>
        </div>

        {/* Total Sessions */}
        <div className="p-5 rounded-2xl bg-space-900/80 border border-cyan-500/20 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-2">
            <span>RECORDED ROLL CALLS</span>
            <CalendarCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-mono font-extrabold text-white">
            {totalClubMeetings}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">
            Meeting Time: 17:00 – 17:30 HRS
          </div>
        </div>

        {/* Club Attendance Average */}
        <div className="p-5 rounded-2xl bg-space-900/80 border border-cyan-500/20 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-2">
            <span>AVG ATTENDANCE RATE</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-mono font-extrabold text-cyan-300 text-glow-cyan">
            {overallClubStats.percentage}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Overall Squadron Performance
          </div>
        </div>

        {/* Low Attendance Alert Count */}
        <div className={`p-5 rounded-2xl border backdrop-blur-xl ${
          lowAttendanceCadets.length > 0
            ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
            : 'bg-space-900/80 border-cyan-500/20'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono text-red-400 mb-2">
            <span>LOW ATTENDANCE (&lt;75%)</span>
            <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
          </div>
          <div className="text-3xl font-mono font-extrabold text-red-300">
            {lowAttendanceCadets.length} CADETS
          </div>
          <div className="text-[11px] text-red-200/80 font-mono mt-1">
            Requires Flight Clearance Review
          </div>
        </div>
      </div>

      {/* Low Attendance Watchlist Banner (<75%) */}
      {lowAttendanceCadets.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/80 via-red-900/40 to-space-900 border border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.25)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-900/80 border border-red-500 text-red-200">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-mono font-bold text-red-200 uppercase tracking-wider">
                  ⚠️ ATTENDANCE WARNING SQUADRON WATCHLIST (&lt; 75%)
                </h3>
                <p className="text-xs text-red-200/80">
                  The following cadets have fallen below the mandatory 75% attendance threshold for laboratory operations:
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-mono font-bold">
              {lowAttendanceCadets.length} AT-RISK
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowAttendanceCadets.map(({ member, stats }) => (
              <div
                key={member.id}
                className="p-3.5 rounded-2xl bg-space-950/90 border border-red-500/40 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-mono font-bold text-cyan-300">{member.sparc_id}</div>
                  <div className="text-sm font-bold text-white truncate max-w-[150px]">{member.name}</div>
                  <div className="text-[10px] text-slate-400">{member.department}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono font-extrabold text-red-400">{stats.percentage}%</div>
                  <div className="text-[9px] font-mono text-red-300 uppercase">BELOW 75%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Middle Grid: Attendance Distribution Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Overall Attendance Distribution Bar Chart (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-space-900/80 border border-cyan-500/20 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-mono font-bold text-white tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              SQUADRON CHECK-IN DISTRIBUTION
            </h3>
            <span className="text-xs font-mono text-cyan-400">TOTAL {attendance.length} LOGS</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748B" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#040915',
                    border: '1px solid rgba(0,240,255,0.4)',
                    borderRadius: '12px',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Quick Action Launchpad (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-space-900/80 border border-cyan-500/20 backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-mono font-bold text-white tracking-wider flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              COMMAND ACTION LAUNCHPAD
            </h3>
            <p className="text-xs text-slate-400">
              Direct access tools for roll call marking, cadet roster maintenance, and academic cycle rollover.
            </p>
          </div>

          <div className="space-y-2.5">
            <Link
              href="/admin/attendance"
              className="p-3.5 rounded-2xl bg-space-950 border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-between text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-950/40 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <CalendarCheck className="w-4 h-4 text-cyan-400" />
                <span>Launch Live Roll-Call Terminal</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/admin/members"
              className="p-3.5 rounded-2xl bg-space-950 border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-between text-xs font-mono font-bold text-white hover:bg-slate-800 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Manage Cadet Roster & IDs</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 flex items-center justify-between text-xs font-mono font-bold text-space-950 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-space-950" />
                <span>Export Monthly Attendance (% CSV)</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <Link
              href="/admin/settings"
              className="p-3.5 rounded-2xl bg-space-950 border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-between text-xs font-mono font-bold text-amber-300 hover:bg-amber-950/30 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Configure Meeting Timing Rules</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="p-3 rounded-xl bg-space-950/60 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="text-cyan-400 font-bold">DEVICE TIME ENGINE:</span> Evaluates check-in time against 17:15 (Present) & 17:30 (Late / Absent).
          </div>
        </div>
      </div>

      {/* Monthly Attendance CSV Export Modal */}
      <MonthlyExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        availableMonths={getAvailableAttendanceMonths(attendance)}
      />
    </div>
  );
}
