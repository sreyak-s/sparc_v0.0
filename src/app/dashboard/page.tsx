'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AttendanceRecord, Announcement, ClubSettings } from '@/types';
import { calculateMonthlyAttendanceStats, getAvailableAttendanceMonths, formatToDateStr, MONTH_NAMES } from '@/lib/time-utils';
import SparcIdCard from '@/components/member/SparcIdCard';
import AttendanceGauge from '@/components/attendance/AttendanceGauge';
import AttendanceCalendar from '@/components/attendance/AttendanceCalendar';
import { 
  Rocket, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Shield, 
  Radio,
  FileText,
  Lock,
  ChevronRight,
  TrendingUp,
  Activity,
  CalendarDays
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [settings, setSettings] = useState<ClubSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Active Month for monthly percentage calculation
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [attRes, annRes, setRes] = await Promise.all([
        fetch(`/api/attendance/list?sparc_id=${encodeURIComponent(user.sparc_id)}`),
        fetch('/api/announcements'),
        fetch('/api/settings')
      ]);

      if (attRes.ok) {
        const attData = await attRes.json();
        setRecords(attData.records || []);
      }
      if (annRes.ok) {
        const annData = await annRes.json();
        setAnnouncements(annData.announcements || []);
      }
      if (setRes.ok) {
        const setData = await setRes.json();
        setSettings(setData.settings || null);
      }
    } catch (err) {
      console.error('Failed to load student telemetry', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Rocket className="w-10 h-10 text-cyan-400 animate-bounce" />
        <div className="text-sm font-mono text-cyan-300">Synchronizing Cadet Telemetry...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md p-8 rounded-3xl bg-space-900 border border-cyan-500/30 space-y-4">
          <Shield className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-xl font-mono font-bold text-white">AUTHENTICATION REQUIRED</h2>
          <p className="text-xs text-slate-400">
            You must log in with your SPARC ID to access your personal flight records and attendance calendar.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-400 text-space-950 font-mono font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.4)]"
          >
            Cadet Login
          </Link>
        </div>
      </div>
    );
  }

  const availableMonths = getAvailableAttendanceMonths(records);
  const monthlyStats = calculateMonthlyAttendanceStats(records, selectedYear, selectedMonth);
  const todayStr = formatToDateStr(new Date());
  const todayRecord = records.find(r => r.date === todayStr);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner / Cadet Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-3xl bg-space-900/80 border border-cyan-500/20 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>CADET FLIGHT DECK • {user.academic_year}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white flex items-center gap-2">
            Welcome, <span className="text-cyan-300">{user.name}</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            ID: <strong className="text-cyan-400">{user.sparc_id}</strong> • Role: <strong className="text-slate-200">{user.role}</strong> • Dept: <strong className="text-slate-200">{user.department}</strong>
          </p>
        </div>

        {/* Today's Roll Call Status Card */}
        <div className="p-4 rounded-2xl bg-space-950/90 border border-slate-800 text-right min-w-[200px]">
          <div className="text-[10px] font-mono text-slate-400 uppercase">TODAY&apos;S ROLL CALL ({todayStr})</div>
          {todayRecord ? (
            <div className="flex items-center justify-end gap-2 mt-1">
              <span className={`text-sm font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                todayRecord.status === 'PRESENT' ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' :
                todayRecord.status === 'LATE' ? 'bg-amber-950/80 border-amber-500/60 text-amber-300' :
                todayRecord.status === 'ABSENT' ? 'bg-red-950/80 border-red-500/60 text-red-300' :
                'bg-white/10 border-white/60 text-white'
              }`}>
                {todayRecord.status === 'PRESENT' && '🟢 PRESENT'}
                {todayRecord.status === 'LATE' && '🟡 LATE'}
                {todayRecord.status === 'ABSENT' && '🔴 ABSENT'}
                {todayRecord.status === 'HOLIDAY' && '⚪ HOLIDAY'}
              </span>
            </div>
          ) : (
            <div className="text-xs font-mono text-amber-400 font-semibold mt-1">
              Awaiting Leadership Roll Call
            </div>
          )}
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Meeting Time: 17:00 – 17:30 HRS
          </div>
        </div>
      </div>

      {/* Main Grid: Left Sparc ID Card & Right Attendance Radial Progress Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Digital SPARC Pass (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              CADET CREDENTIAL BADGE
            </h3>
            <span className="text-[10px] font-mono text-slate-500">QR SCAN READY</span>
          </div>

          <SparcIdCard member={user} />

          {/* Roll Call Authorization Notice */}
          <div className="p-4 rounded-2xl bg-space-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-[11px]">
              <Lock className="w-3.5 h-3.5" />
              ATTENDANCE VERIFICATION PROTOCOL
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              In accordance with SPARC flight safety charter, cadets do not self-mark attendance. The Founder, Captain, Vice Captain, or Secretary marks check-in during the 17:00–17:30 roll call window.
            </p>
          </div>
        </div>

        {/* Right Col: Radial Attendance Gauge & Metrics Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              MONTHLY ATTENDANCE CLEARANCE
            </h3>
            
            {/* Month Selector Dropdown */}
            <div className="flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`}
                onChange={(e) => {
                  const [y, m] = e.target.value.split('-').map(Number);
                  setSelectedYear(y);
                  setSelectedMonth(m - 1);
                }}
                className="px-2.5 py-1 rounded-xl bg-space-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
              >
                {availableMonths.map(m => (
                  <option key={m.key} value={m.key}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* High-tech Radial Meter with Low Attendance Warning */}
          <AttendanceGauge 
            stats={monthlyStats} 
            monthLabel={`${MONTH_NAMES[selectedMonth]} ${selectedYear}`}
          />

          {/* Mission Broadcasts / Notices */}
          {announcements.length > 0 && (
            <div className="p-5 rounded-2xl bg-space-900/70 border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-400">
                <span className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  FLIGHT COMMAND TELEMETRY NOTICES
                </span>
              </div>
              <div className="space-y-2">
                {announcements.slice(0, 2).map(ann => (
                  <div key={ann.id} className="p-3 rounded-xl bg-space-950/80 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-bold text-white">{ann.title}</h5>
                      <span className="text-[10px] font-mono text-cyan-400">{ann.category}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Monthly Attendance Calendar (Green, Amber, Red, White) */}
      <div className="space-y-4">
        <AttendanceCalendar records={records} />
      </div>

      {/* Recent Detailed Attendance Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-mono font-bold text-white tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            DETAILED FLIGHT CHECK-IN LOG
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {records.length} TOTAL SESSIONS LOGGED
          </span>
        </div>

        <div className="rounded-2xl bg-space-900/80 border border-cyan-500/20 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-space-950/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-cyan-500/20">
                <tr>
                  <th className="px-5 py-3.5">Session Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Recorded Time</th>
                  <th className="px-5 py-3.5">Marked By</th>
                  <th className="px-5 py-3.5">Mission Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500 font-mono">
                      No attendance sessions logged yet.
                    </td>
                  </tr>
                ) : (
                  records.slice(0, 10).map((r) => (
                    <tr key={r.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-cyan-300 font-bold">
                        {r.date}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                          r.status === 'PRESENT' ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' :
                          r.status === 'LATE' ? 'bg-amber-950/80 border-amber-500/60 text-amber-300' :
                          r.status === 'ABSENT' ? 'bg-red-950/80 border-red-500/60 text-red-300' :
                          'bg-white/10 border-white/60 text-white'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-300">
                        {r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : '—'}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-400">
                        {r.marked_by_sparc_id || 'SPARC-001'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 italic">
                        {r.notes || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
