'use client';

import React, { useState, useEffect } from 'react';
import { Member, AttendanceRecord, AttendanceStatus, ClubSettings } from '@/types';
import { evaluateAttendanceStatus, formatToDateStr, formatToTime24 } from '@/lib/time-utils';
import CadetCalendarModal from './CadetCalendarModal';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Sparkles, 
  Search, 
  Users, 
  Flame, 
  ShieldCheck, 
  RefreshCw, 
  UserCheck, 
  Sliders,
  Calendar,
  Check,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  members: Member[];
  existingRecords: AttendanceRecord[];
  settings: ClubSettings;
  currentUserSparcId: string;
  onAttendanceUpdated: () => void;
}

export default function LiveRollCallTerminal({
  members,
  existingRecords,
  settings,
  currentUserSparcId,
  onAttendanceUpdated
}: Props) {
  const [currentDeviceTime, setCurrentDeviceTime] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(formatToDateStr(new Date()));
  const [searchQuery, setSearchQuery] = useState('');
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Cadet Calendar Modal
  const [calendarCadet, setCalendarCadet] = useState<Member | null>(null);

  // Simulated Time Testing mode
  const [simulatedHour, setSimulatedHour] = useState<number | null>(null);
  const [simulatedMinute, setSimulatedMinute] = useState<number | null>(null);
  const [isSimulatingTime, setIsSimulatingTime] = useState(false);

  // Live real clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isSimulatingTime) {
        setCurrentDeviceTime(new Date());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isSimulatingTime]);

  const effectiveTime = isSimulatingTime && simulatedHour !== null && simulatedMinute !== null
    ? new Date(new Date().setHours(simulatedHour, simulatedMinute, 0, 0))
    : currentDeviceTime;

  const currentStatusByDeviceTime = evaluateAttendanceStatus(effectiveTime, settings);

  // Map existing records for the selected date
  const recordsForDate = existingRecords.filter(r => r.date === selectedDate);
  const recordMap = new Map<string, AttendanceRecord>();
  recordsForDate.forEach(r => {
    recordMap.set(r.member_id, r);
  });

  const handleMarkAttendance = async (
    member: Member, 
    forcedStatus?: AttendanceStatus, 
    notes?: string
  ) => {
    setSubmittingId(member.id);
    setMessage(null);

    const statusToMark = forcedStatus || currentStatusByDeviceTime;

    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: member.id,
          sparc_id: member.sparc_id,
          date: selectedDate,
          status: statusToMark,
          device_timestamp: effectiveTime.toISOString(),
          notes: notes || (isSimulatingTime ? 'Marked in test simulation' : undefined)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.error || 'Failed to mark attendance', type: 'error' });
      } else {
        setMessage({ 
          text: `Recorded real-time attendance for ${member.sparc_id} (${member.name}) as ${statusToMark}`, 
          type: 'success' 
        });

        if (statusToMark === 'PRESENT') {
          confetti({
            particleCount: 35,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#00F0FF', '#38BDF8', '#10B981']
          });
        }
        onAttendanceUpdated();
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Network error', type: 'error' });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleMarkAllPresent = async () => {
    const unmarked = members.filter(m => !recordMap.has(m.id) && m.role !== 'FOUNDER');
    if (unmarked.length === 0) {
      alert('All cadets are already recorded for this date.');
      return;
    }

    if (!confirm(`Mark ${unmarked.length} unmarked cadets as ${currentStatusByDeviceTime} for ${selectedDate}?`)) {
      return;
    }

    setBulkSubmitting(true);
    setMessage(null);

    try {
      for (const m of unmarked) {
        await fetch('/api/attendance/mark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            member_id: m.id,
            sparc_id: m.sparc_id,
            date: selectedDate,
            status: currentStatusByDeviceTime,
            device_timestamp: effectiveTime.toISOString(),
            notes: 'Batch recorded via Live Roll Call'
          })
        });
      }

      setMessage({ text: `Successfully marked ${unmarked.length} cadets as ${currentStatusByDeviceTime}!`, type: 'success' });
      onAttendanceUpdated();
    } catch (err: any) {
      setMessage({ text: err.message || 'Batch operation error', type: 'error' });
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleBulkMarkAbsent = async () => {
    if (!confirm(`Are you sure you want to mark all unmarked cadets as ABSENT for ${selectedDate}?`)) {
      return;
    }

    setBulkSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/attendance/bulk-absent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.error || 'Bulk operation failed', type: 'error' });
      } else {
        setMessage({ text: data.message, type: 'success' });
        onAttendanceUpdated();
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Error occurred', type: 'error' });
    } finally {
      setBulkSubmitting(false);
    }
  };

  const filteredMembers = members.filter(m => {
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.sparc_id.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q) ||
      m.batch.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Roll Call Control Panel */}
      <div className="p-6 rounded-2xl bg-space-900/80 border border-cyan-500/30 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-cyan-500/20">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              FLIGHT COMMAND ROLL-CALL CONSOLE
            </div>
            <h3 className="text-xl font-bold font-mono text-white mt-1">
              Live Real-Time Attendance Terminal
            </h3>
            <p className="text-xs text-slate-400">
              Click &quot;Mark Attendance&quot; to check in each cadet instantly with real-time clock evaluation.
            </p>
          </div>

          {/* Current Device Time & Evaluated Status Badge */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Clock HUD */}
            <div className="px-4 py-2 rounded-xl bg-space-950 border border-cyan-500/30 flex items-center gap-2.5 font-mono">
              <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div>
                <div className="text-[9px] text-slate-400 uppercase">
                  {isSimulatingTime ? 'SIMULATED TIME' : 'SYSTEM REAL TIME'}
                </div>
                <div className="text-sm font-bold text-cyan-300">
                  {formatToTime24(effectiveTime)} HRS
                </div>
              </div>
            </div>

            {/* Evaluated Status Pill */}
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono text-xs font-bold ${
              currentStatusByDeviceTime === 'PRESENT' ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300' :
              currentStatusByDeviceTime === 'LATE' ? 'bg-amber-950/70 border-amber-500/60 text-amber-300' :
              'bg-red-950/70 border-red-500/60 text-red-300'
            }`}>
              <span>CURRENT WINDOW:</span>
              <span className="underline font-extrabold">{currentStatusByDeviceTime}</span>
            </div>

            {/* Test Time Simulation Toggle */}
            <button
              onClick={() => {
                if (!isSimulatingTime) {
                  setIsSimulatingTime(true);
                  setSimulatedHour(17);
                  setSimulatedMinute(10);
                } else {
                  setIsSimulatingTime(false);
                  setSimulatedHour(null);
                  setSimulatedMinute(null);
                }
              }}
              className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors ${
                isSimulatingTime 
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300' 
                  : 'bg-space-950 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Test with different simulated times"
            >
              <Sliders className="w-4 h-4" />
              {isSimulatingTime ? 'Simulating' : 'Simulate Time'}
            </button>
          </div>
        </div>

        {/* Time Simulator Bar (When active) */}
        {isSimulatingTime && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs font-mono flex flex-wrap items-center gap-4 animate-fadeIn">
            <span className="text-amber-400 font-bold">🧪 TEST TIME SIMULATION:</span>
            <div className="flex items-center gap-2">
              <label className="text-slate-300">Hour (0-23):</label>
              <input
                type="number"
                min={0}
                max={23}
                value={simulatedHour ?? 17}
                onChange={(e) => setSimulatedHour(parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 rounded bg-space-950 border border-amber-500/50 text-amber-200 text-center font-bold"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-slate-300">Minute (0-59):</label>
              <input
                type="number"
                min={0}
                max={59}
                value={simulatedMinute ?? 10}
                onChange={(e) => setSimulatedMinute(parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 rounded bg-space-950 border border-amber-500/50 text-amber-200 text-center font-bold"
              />
            </div>
            <span className="text-slate-400 text-[11px]">
              (&le; 17:15 = Present, 17:16 - 17:30 = Late, &gt; 17:30 = Absent)
            </span>
          </div>
        )}

        {/* Date Selector & Search Bar */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search SPARC ID, cadet name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-space-950/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-space-950/80 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={handleMarkAllPresent}
              disabled={bulkSubmitting}
              className="px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark All Unmarked ({currentStatusByDeviceTime})</span>
            </button>

            <button
              onClick={handleBulkMarkAbsent}
              disabled={bulkSubmitting}
              className="px-3.5 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/70 border border-red-500/40 text-red-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Mark Unmarked Absent</span>
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300' 
              : 'bg-red-950/50 border-red-500/50 text-red-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Cadet Roll-Call Table */}
      <div className="rounded-2xl bg-space-900/80 border border-cyan-500/20 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-space-950/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-cyan-500/20">
              <tr>
                <th className="px-5 py-3.5">SPARC ID</th>
                <th className="px-5 py-3.5">Cadet Name</th>
                <th className="px-5 py-3.5">Department & Batch</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Attendance Status</th>
                <th className="px-5 py-3.5 text-right">Real-Time Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredMembers.map((member) => {
                const existing = recordMap.get(member.id);
                const isSubmitting = submittingId === member.id;

                return (
                  <tr key={member.id} className="hover:bg-slate-850/40 transition-colors">
                    {/* SPARC ID */}
                    <td className="px-5 py-3.5 font-mono font-bold text-cyan-300">
                      {member.sparc_id}
                    </td>

                    {/* Cadet Name */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-white">{member.name}</div>
                      <div className="text-[10px] text-slate-400">{member.email || 'No email registered'}</div>
                    </td>

                    {/* Department & Batch */}
                    <td className="px-5 py-3.5 text-slate-300">
                      <div>{member.department}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Batch {member.batch}</div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        member.role === 'FOUNDER' ? 'bg-yellow-950/50 border-yellow-500/40 text-yellow-300' :
                        member.role === 'CAPTAIN' ? 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300' :
                        member.role === 'VICE_CAPTAIN' ? 'bg-sky-950/50 border-sky-500/40 text-sky-300' :
                        member.role === 'SECRETARY' ? 'bg-purple-950/50 border-purple-500/40 text-purple-300' :
                        'bg-slate-900 border-slate-700 text-slate-300'
                      }`}>
                        {member.role.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Status Badge for Date */}
                    <td className="px-5 py-3.5">
                      {existing ? (
                        <div className="flex flex-col items-start gap-1">
                          <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                            existing.status === 'PRESENT' ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' :
                            existing.status === 'LATE' ? 'bg-amber-950/80 border-amber-500/60 text-amber-300' :
                            existing.status === 'ABSENT' ? 'bg-red-950/80 border-red-500/60 text-red-300' :
                            'bg-white/10 border-white/60 text-white'
                          }`}>
                            {existing.status === 'PRESENT' && '🟢 PRESENT'}
                            {existing.status === 'LATE' && '🟡 LATE'}
                            {existing.status === 'ABSENT' && '🔴 ABSENT'}
                            {existing.status === 'HOLIDAY' && '⚪ HOLIDAY'}
                          </span>
                          {existing.timestamp && (
                            <span className="text-[10px] font-mono text-slate-400">
                              Checked in: {new Date(existing.timestamp).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-500 italic">
                          Awaiting Check-in
                        </span>
                      )}
                    </td>

                    {/* Action Buttons: Single "Mark Attendance" button */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Per-Cadet Calendar Button */}
                        <button
                          onClick={() => setCalendarCadet(member)}
                          className="p-2 rounded-xl bg-space-950 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-colors"
                          title="View 4-Color Attendance Calendar"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>

                        {!existing ? (
                          /* Primary Real-Time Single Option: Mark Attendance */
                          <button
                            onClick={() => handleMarkAttendance(member)}
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 text-space-950 font-mono font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:from-cyan-300 hover:to-sky-300 transition-all disabled:opacity-50"
                            title={`Mark Attendance now (${currentStatusByDeviceTime})`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{isSubmitting ? 'Recording...' : 'Mark Attendance'}</span>
                          </button>
                        ) : (
                          /* If already marked, provide clean status dropdown to change if needed */
                          <div className="flex items-center gap-1">
                            <select
                              value={existing.status}
                              onChange={(e) => handleMarkAttendance(member, e.target.value as AttendanceStatus)}
                              disabled={isSubmitting}
                              className="px-2.5 py-1.5 rounded-lg bg-space-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                              title="Change / update marked attendance status"
                            >
                              <option value="PRESENT">🟢 Present</option>
                              <option value="LATE">🟡 Late</option>
                              <option value="ABSENT">🔴 Absent</option>
                              <option value="HOLIDAY">⚪ Holiday</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-Cadet Attendance Calendar Modal */}
      <CadetCalendarModal
        isOpen={Boolean(calendarCadet)}
        onClose={() => setCalendarCadet(null)}
        member={calendarCadet}
        onAttendanceChanged={onAttendanceUpdated}
      />
    </div>
  );
}
