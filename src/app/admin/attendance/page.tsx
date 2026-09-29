'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Member, AttendanceRecord, ClubSettings } from '@/types';
import LiveRollCallTerminal from '@/components/attendance/LiveRollCallTerminal';
import CadetCalendarModal from '@/components/attendance/CadetCalendarModal';
import { getAvailableAttendanceMonths } from '@/lib/time-utils';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Sparkles,
  Download,
  ShieldCheck,
  RefreshCw,
  FileDown
} from 'lucide-react';

export default function AdminAttendancePage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [settings, setSettings] = useState<ClubSettings>({
    id: 'a0000000-0000-0000-0000-000000000001',
    attendance_start: '17:00:00',
    late_start: '17:15:00',
    attendance_end: '17:30:00',
    current_year: '2026-27',
    emergency_window_active: false,
    club_name: 'SPARC Aerospace Club',
    motto: 'Innovating Beyond the Atmosphere'
  });
  const [loading, setLoading] = useState(true);

  // Filters for History Table
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterBatch, setFilterBatch] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Month for Monthly CSV Export
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [exportMonth, setExportMonth] = useState<string>(currentMonthKey);
  const [calendarCadet, setCalendarCadet] = useState<Member | null>(null);

  const loadData = useCallback(async () => {
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
        setRecords(aData.records || []);
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.settings) setSettings(sData.settings);
      }
    } catch (e) {
      console.error('Error fetching attendance data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const availableMonths = getAvailableAttendanceMonths(records);

  // Unique batches for filter dropdown
  const batches = Array.from(new Set(members.map(m => m.batch))).filter(Boolean);

  // Filtered Records
  const filteredRecords = records.filter(r => {
    if (filterDate && r.date !== filterDate) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (filterBatch !== 'ALL' && r.batch !== filterBatch) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchSparc = r.sparc_id?.toLowerCase().includes(q);
      const matchName = r.member_name?.toLowerCase().includes(q);
      const matchDept = r.department?.toLowerCase().includes(q);
      if (!matchSparc && !matchName && !matchDept) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Interactive Roll-Call Console for Leadership */}
      <LiveRollCallTerminal
        members={members}
        existingRecords={records}
        settings={settings}
        currentUserSparcId={user?.sparc_id || 'SPARC-001'}
        onAttendanceUpdated={loadData}
      />

      {/* Comprehensive Flight Attendance Logs Section */}
      <div className="p-6 rounded-3xl bg-space-900/80 border border-cyan-500/20 backdrop-blur-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-cyan-500/10">
          <div>
            <h3 className="text-lg font-mono font-bold text-white tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              SQUADRON ATTENDANCE ARCHIVE & AUDIT
            </h3>
            <p className="text-xs text-slate-400">
              Filtered search, multi-batch records, and monthly CSV telemetry downloads for all admins.
            </p>
          </div>

          {/* Export Action Center with Month Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Month Selector for Monthly Download */}
            <div className="flex items-center gap-1.5 bg-space-950 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-[10px] font-mono text-slate-400 uppercase">MONTH:</span>
              <select
                value={exportMonth}
                onChange={(e) => setExportMonth(e.target.value)}
                className="bg-transparent text-xs font-mono text-cyan-300 focus:outline-none"
              >
                {availableMonths.map(m => (
                  <option key={m.key} value={m.key} className="bg-space-950 text-white">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly Summary CSV Download */}
            <a
              href={`/api/attendance/export-csv?month=${exportMonth}&type=summary`}
              download
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 text-space-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:from-cyan-300 hover:to-sky-300 transition-all"
              title="Download Monthly Cadet Roll with Attendance Percentages CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-space-950" />
              <span>Monthly Summary (% CSV)</span>
            </a>

            {/* Monthly Detailed Logs CSV Download */}
            <a
              href={`/api/attendance/export-csv?month=${exportMonth}&type=detailed`}
              download
              className="px-3.5 py-2 rounded-xl bg-space-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950 font-mono font-bold text-xs flex items-center gap-1.5 transition-all"
              title="Download Detailed Session Logs for Month"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Session Logs (CSV)</span>
            </a>

            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-space-950 border border-slate-700 text-slate-400 hover:text-cyan-300 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Multi-facet Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Query */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search ID, Name, Dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Date Filter */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
          />

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">🟢 PRESENT</option>
            <option value="LATE">🟡 LATE</option>
            <option value="ABSENT">🔴 ABSENT</option>
            <option value="HOLIDAY">⚪ CLUB HOLIDAY</option>
          </select>

          {/* Batch Filter */}
          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Academic Batches</option>
            {batches.map(b => (
              <option key={b} value={b}>Batch {b}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters Reset */}
        {(filterDate || filterStatus !== 'ALL' || filterBatch !== 'ALL' || searchQuery) && (
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
            <span>Showing {filteredRecords.length} matching flight logs</span>
            <button
              onClick={() => {
                setFilterDate('');
                setFilterStatus('ALL');
                setFilterBatch('ALL');
                setSearchQuery('');
              }}
              className="text-red-400 hover:text-red-300 underline"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Attendance Archive Table */}
        <div className="rounded-2xl bg-space-950/90 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-space-900/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">SPARC ID</th>
                  <th className="px-5 py-3.5">Cadet Name</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Check-In Time</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Batch</th>
                  <th className="px-5 py-3.5">Marked By</th>
                  <th className="px-5 py-3.5 text-right">Calendar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-8 text-center text-slate-500 font-mono">
                      No attendance records matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => {
                    const matchedMember = members.find(m => m.id === r.member_id || m.sparc_id === r.sparc_id);
                    return (
                      <tr key={r.id} className="hover:bg-slate-850/40 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-cyan-300">
                          {r.sparc_id}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-white">
                          {r.member_name}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-300">
                          {r.date}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                            r.status === 'PRESENT' ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' :
                            r.status === 'LATE' ? 'bg-amber-950/80 border-amber-500/60 text-amber-300' :
                            r.status === 'ABSENT' ? 'bg-red-950/80 border-red-500/60 text-red-300' :
                            'bg-white/10 border-white/60 text-white'
                          }`}>
                            {r.status === 'PRESENT' && '🟢 PRESENT'}
                            {r.status === 'LATE' && '🟡 LATE'}
                            {r.status === 'ABSENT' && '🔴 ABSENT'}
                            {r.status === 'HOLIDAY' && '⚪ HOLIDAY'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-300">
                          {r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-300">
                          {r.department}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-400">
                          {r.batch}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-400">
                          {r.marked_by_sparc_id || 'SPARC-001'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => {
                              if (matchedMember) {
                                setCalendarCadet(matchedMember);
                              } else {
                                setCalendarCadet({
                                  id: r.member_id,
                                  sparc_id: r.sparc_id,
                                  name: r.member_name || 'Cadet',
                                  department: r.department || 'Aerospace',
                                  batch: r.batch || '2026',
                                  role: r.role || 'MEMBER',
                                  academic_year: '2026-27',
                                  active: true
                                });
                              }
                            }}
                            className="p-1.5 rounded-lg bg-space-950 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-colors"
                            title="Open 4-Color Attendance Calendar"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cadet 4-Color Attendance Calendar Modal */}
      <CadetCalendarModal
        isOpen={Boolean(calendarCadet)}
        onClose={() => setCalendarCadet(null)}
        member={calendarCadet}
        onAttendanceChanged={loadData}
      />
    </div>
  );
}
