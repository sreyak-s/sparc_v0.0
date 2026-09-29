'use client';

import React from 'react';
import { AttendanceStats } from '@/types';
import { AlertTriangle, CheckCircle2, Clock, XCircle, CalendarHeart } from 'lucide-react';

interface Props {
  stats: AttendanceStats;
  compact?: boolean;
  monthLabel?: string;
}

export default function AttendanceGauge({ stats, compact = false, monthLabel }: Props) {
  const { totalMeetings, presentCount, lateCount, absentCount, holidayCount, percentage, isLowAttendance } = stats;

  // SVG Radial Circle Calculation
  const radius = compact ? 42 : 58;
  const stroke = compact ? 7 : 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color selection based on percentage
  let strokeColor = '#00F0FF'; // Cyan for great
  let textColor = 'text-cyan-400';
  let glowColor = 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.6))';

  if (isLowAttendance) {
    strokeColor = '#EF4444'; // Red for warning
    textColor = 'text-red-400';
    glowColor = 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.7))';
  } else if (percentage < 85) {
    strokeColor = '#F59E0B'; // Amber for moderate
    textColor = 'text-amber-400';
    glowColor = 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.6))';
  } else {
    strokeColor = '#10B981'; // Emerald for top flight
    textColor = 'text-emerald-400';
    glowColor = 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.6))';
  }

  return (
    <div className="space-y-4">
      {/* Low Attendance Warning Alert (<75%) */}
      {isLowAttendance && (
        <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-r from-red-950/80 via-red-900/40 to-slate-900 border border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.3)] animate-pulse">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-900/60 border border-red-500/80 text-red-300">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-red-300 font-mono tracking-wider flex items-center gap-2">
                  CRITICAL WARNING: LOW FLIGHT ATTENDANCE
                </h4>
                <span className="px-2 py-0.5 rounded bg-red-500/30 text-red-200 border border-red-500/50 text-[10px] font-mono font-bold">
                  {percentage}% / 75% REQUIRED
                </span>
              </div>
              <p className="text-xs text-red-200/90 mt-1 leading-relaxed">
                Your current attendance is <strong>{percentage}%</strong>, which is below the mandatory <strong>75% threshold</strong> for active SPARC project missions, workshop clearances, and sounding rocket launch authorisations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Radial Meter & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Circular Progress Gauge */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-space-900/70 border border-cyan-500/20 relative">
          <div className="relative flex items-center justify-center">
            <svg
              height={radius * 2}
              width={radius * 2}
              className="transform -rotate-90"
              style={{ filter: glowColor }}
            >
              {/* Background Track */}
              <circle
                stroke="rgba(255, 255, 255, 0.08)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              {/* Animated Value Stroke */}
              <circle
                stroke={strokeColor}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>
            
            <div className="absolute flex flex-col items-center justify-center text-center px-2">
              <span className={`text-2xl font-mono font-extrabold ${textColor}`}>
                {percentage}%
              </span>
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">
                {monthLabel ? monthLabel.toUpperCase() : 'ATTENDANCE'}
              </span>
            </div>
          </div>

          <div className="mt-3 text-center space-y-1">
            <span className={`inline-block text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
              isLowAttendance 
                ? 'bg-red-950/60 border-red-500/50 text-red-300' 
                : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
            }`}>
              {isLowAttendance ? 'STATUS: FLIGHT RESTRICTED' : 'STATUS: CLEARANCE ACTIVE'}
            </span>
            <div className="text-[10px] text-slate-500 font-mono">
              Resets 1st of every month
            </div>
          </div>
        </div>

        {/* Breakdown Metric Tiles */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Meetings */}
          <div className="p-3.5 rounded-xl bg-space-900/60 border border-slate-800 text-left">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">Total Roll Calls</div>
            <div className="text-xl font-mono font-bold text-white">{totalMeetings}</div>
            <div className="text-[10px] text-cyan-400 mt-1 font-mono">Recorded Sessions</div>
          </div>

          {/* Present */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-left">
            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 uppercase tracking-wider mb-1">
              <span>Present</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-mono font-bold text-emerald-300">{presentCount}</div>
            <div className="text-[10px] text-emerald-400/80 mt-1 font-mono">On-Time Check-ins</div>
          </div>

          {/* Late */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-left">
            <div className="flex items-center justify-between text-[11px] font-mono text-amber-400 uppercase tracking-wider mb-1">
              <span>Late</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-mono font-bold text-amber-300">{lateCount}</div>
            <div className="text-[10px] text-amber-400/80 mt-1 font-mono">5:15 - 5:30 PM</div>
          </div>

          {/* Absent */}
          <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-left">
            <div className="flex items-center justify-between text-[11px] font-mono text-red-400 uppercase tracking-wider mb-1">
              <span>Absent</span>
              <XCircle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-xl font-mono font-bold text-red-300">{absentCount}</div>
            <div className="text-[10px] text-red-400/80 mt-1 font-mono">Missed Roll Calls</div>
          </div>
        </div>
      </div>
    </div>
  );
}
