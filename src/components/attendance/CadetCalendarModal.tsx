'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Member, AttendanceRecord, AttendanceStatus } from '@/types';
import { calculateMonthlyAttendanceStats, MONTH_NAMES } from '@/lib/time-utils';
import AttendanceCalendar from './AttendanceCalendar';
import { 
  X, 
  Calendar, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Sparkles,
  AlertTriangle,
  Edit2,
  RefreshCw
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onAttendanceChanged?: () => void;
}

export default function CadetCalendarModal({
  isOpen,
  onClose,
  member,
  onAttendanceChanged
}: Props) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchCadetRecords = useCallback(async () => {
    if (!member) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/attendance/list?sparc_id=${encodeURIComponent(member.sparc_id)}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
      }
    } catch (err) {
      console.error('Failed to load cadet attendance records', err);
    } finally {
      setLoading(false);
    }
  }, [member]);

  useEffect(() => {
    if (isOpen && member) {
      fetchCadetRecords();
      setEditingDate(null);
      setStatusMessage(null);
    }
  }, [isOpen, member, fetchCadetRecords]);

  if (!isOpen || !member) return null;

  const monthlyStats = calculateMonthlyAttendanceStats(records, selectedYear, selectedMonth);

  const handleUpdateStatus = async (date: string, newStatus: AttendanceStatus) => {
    setUpdatingStatus(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: member.id,
          sparc_id: member.sparc_id,
          date,
          status: newStatus,
          notes: `Updated by Admin via Cadet Calendar on ${new Date().toLocaleDateString()}`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Updated ${date} to ${newStatus}`);
        await fetchCadetRecords();
        if (onAttendanceChanged) onAttendanceChanged();
        setEditingDate(null);
      } else {
        alert(data.error || 'Failed to update attendance');
      }
    } catch (e: any) {
      alert(e.message || 'Network error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-space-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative max-w-3xl w-full my-8 p-6 sm:p-8 rounded-3xl bg-space-900 border border-cyan-500/40 shadow-[0_0_60px_rgba(0,240,255,0.25)] space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-extrabold text-cyan-300">
                  {member.sparc_id}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-space-950 text-slate-300 border-slate-700">
                  {member.role}
                </span>
              </div>
              <h3 className="text-xl font-mono font-bold text-white tracking-wide">
                {member.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {member.department} • Batch {member.batch}
              </p>
            </div>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={fetchCadetRecords}
            disabled={loading}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-space-950 border border-slate-700 text-xs font-mono text-slate-300 hover:text-cyan-300 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Monthly Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-space-950/80 border border-cyan-500/20">
          <div className="p-2.5 rounded-xl bg-space-900/60 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">MONTHLY ATTENDANCE</div>
            <div className={`text-xl font-mono font-extrabold mt-0.5 ${
              monthlyStats.isLowAttendance ? 'text-red-400' : 'text-cyan-300'
            }`}>
              {monthlyStats.percentage}%
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
            <div className="text-[10px] font-mono text-emerald-400 uppercase flex items-center gap-1">
              <span>Present</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-xl font-mono font-bold text-emerald-300 mt-0.5">
              {monthlyStats.presentCount}
            </div>
            <div className="text-[10px] text-emerald-400/80 font-mono">🟢 On-Time</div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30">
            <div className="text-[10px] font-mono text-amber-400 uppercase flex items-center gap-1">
              <span>Late</span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <div className="text-xl font-mono font-bold text-amber-300 mt-0.5">
              {monthlyStats.lateCount}
            </div>
            <div className="text-[10px] text-amber-400/80 font-mono">🟡 5:15–5:30 PM</div>
          </div>

          <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30">
            <div className="text-[10px] font-mono text-red-400 uppercase flex items-center gap-1">
              <span>Absent</span>
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
            </div>
            <div className="text-xl font-mono font-bold text-red-300 mt-0.5">
              {monthlyStats.absentCount}
            </div>
            <div className="text-[10px] text-red-400/80 font-mono">🔴 Missed</div>
          </div>
        </div>

        {monthlyStats.isLowAttendance && (
          <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-500/50 text-xs font-mono text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 animate-bounce" />
            <span>
              <strong>Low Attendance Alert:</strong> Cadet is at {monthlyStats.percentage}% for {MONTH_NAMES[selectedMonth]}, below the 75% flight threshold.
            </span>
          </div>
        )}

        {/* 4-Color Attendance Calendar */}
        <div className="space-y-4">
          <AttendanceCalendar records={records} />
        </div>

        {/* Quick Date Override Tool for Admins */}
        <div className="p-4 rounded-2xl bg-space-950/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
              <Edit2 className="w-3.5 h-3.5" />
              ADMIN ATTENDANCE OVERRIDE & MODIFICATION
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Pick date to modify record</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={editingDate || ''}
              onChange={(e) => setEditingDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-space-900 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            />

            {editingDate && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(editingDate, 'PRESENT')}
                  disabled={updatingStatus}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-xs font-mono font-bold hover:bg-emerald-900 transition-colors"
                >
                  🟢 Mark Present
                </button>
                <button
                  onClick={() => handleUpdateStatus(editingDate, 'LATE')}
                  disabled={updatingStatus}
                  className="px-3 py-1.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/50 text-xs font-mono font-bold hover:bg-amber-900 transition-colors"
                >
                  🟡 Mark Late
                </button>
                <button
                  onClick={() => handleUpdateStatus(editingDate, 'ABSENT')}
                  disabled={updatingStatus}
                  className="px-3 py-1.5 rounded-lg bg-red-950 text-red-300 border border-red-500/50 text-xs font-mono font-bold hover:bg-red-900 transition-colors"
                >
                  🔴 Mark Absent
                </button>
                <button
                  onClick={() => handleUpdateStatus(editingDate, 'HOLIDAY')}
                  disabled={updatingStatus}
                  className="px-3 py-1.5 rounded-lg bg-white/15 text-white border border-white/50 text-xs font-mono font-bold hover:bg-white/25 transition-colors"
                >
                  ⚪ Mark Holiday
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-cyan-400 text-space-950 font-mono font-bold text-xs hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          >
            Close Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
