'use client';

import React, { useState } from 'react';
import { AttendanceRecord, CalendarDayInfo } from '@/types';
import { generateMonthlyCalendar } from '@/lib/time-utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Sparkles,
  Info
} from 'lucide-react';

interface Props {
  records: AttendanceRecord[];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AttendanceCalendar({ records }: Props) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<CalendarDayInfo | null>(null);

  const days = generateMonthlyCalendar(currentYear, currentMonth, records);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDay(null);
  };

  const getStatusColorClasses = (status: CalendarDayInfo['status'], isCurrentMonth: boolean) => {
    if (!isCurrentMonth) {
      return 'opacity-30 border-transparent bg-space-950/40 text-slate-600 cursor-default';
    }

    switch (status) {
      case 'PRESENT':
        return 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.35)]';
      case 'LATE':
        return 'bg-amber-950/70 border-amber-500/60 text-amber-300 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.35)]';
      case 'ABSENT':
        return 'bg-red-950/70 border-red-500/60 text-red-300 hover:border-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.35)]';
      case 'HOLIDAY':
        return 'bg-white/15 border-white/70 text-white font-bold hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]';
      case 'NO_MEETING':
        return 'bg-space-900/30 border-slate-800 text-slate-500 hover:border-slate-700';
      case 'UPCOMING':
      default:
        return 'bg-space-900/20 border-slate-800/60 text-slate-600 hover:border-slate-700';
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-space-900/80 border border-cyan-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 border-b border-cyan-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-mono font-bold text-white tracking-wider flex items-center gap-2">
              ATTENDANCE FLIGHT LOG
            </h3>
            <p className="text-xs text-slate-400">
              Interactive monthly schedule & attendance tracking calendar
            </p>
          </div>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2 bg-space-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs sm:text-sm font-bold text-cyan-300 min-w-[140px] text-center">
            {MONTH_NAMES[currentMonth].toUpperCase()} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend Bar: Green = Present, Amber = Late, Red = Absent, White = Holiday */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 p-3 rounded-xl bg-space-950/60 border border-slate-800/80 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"></span>
          <span className="text-emerald-300">PRESENT (🟢 Green)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]"></span>
          <span className="text-amber-300">LATE (🟡 Amber)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"></span>
          <span className="text-red-300">ABSENT (🔴 Red)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"></span>
          <span className="text-white font-semibold">CLUB HOLIDAY (⚪ White)</span>
        </div>
      </div>

      {/* Weekday Columns */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
        {WEEKDAY_NAMES.map((w, idx) => (
          <div
            key={w}
            className={`text-center py-2 text-[11px] font-mono font-bold uppercase tracking-wider ${
              idx === 0 || idx === 6 ? 'text-slate-500' : 'text-cyan-400'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Calendar Day Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day, index) => {
          const isSelected = selectedDay?.dateStr === day.dateStr;
          const statusClass = getStatusColorClasses(day.status, day.isCurrentMonth);

          return (
            <button
              key={`${day.dateStr}-${index}`}
              onClick={() => day.isCurrentMonth && setSelectedDay(day)}
              disabled={!day.isCurrentMonth}
              className={`min-h-[56px] sm:min-h-[64px] p-2 rounded-xl border flex flex-col justify-between text-left transition-all duration-200 relative ${statusClass} ${
                isSelected ? 'ring-2 ring-cyan-400 scale-[1.03] z-10' : ''
              } ${day.isToday ? 'outline outline-1 outline-cyan-400' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-mono font-bold ${day.isToday ? 'text-cyan-300 underline' : ''}`}>
                  {day.dayNumber}
                </span>

                {/* Status Indicator Icon */}
                {day.isCurrentMonth && (
                  <>
                    {day.status === 'PRESENT' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {day.status === 'LATE' && <Clock className="w-3 h-3 text-amber-400" />}
                    {day.status === 'ABSENT' && <XCircle className="w-3 h-3 text-red-400" />}
                    {day.status === 'HOLIDAY' && <Sparkles className="w-3 h-3 text-white" />}
                  </>
                )}
              </div>

              {/* Status Text for larger screens */}
              {day.isCurrentMonth && day.status !== 'NO_MEETING' && day.status !== 'UPCOMING' && (
                <div className="hidden sm:block text-[9px] font-mono font-bold truncate uppercase tracking-tighter">
                  {day.status}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Details Card */}
      {selectedDay && selectedDay.status !== 'NO_MEETING' && selectedDay.status !== 'UPCOMING' && (
        <div className="mt-5 p-4 rounded-xl bg-space-950/90 border border-cyan-500/30 animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${
                selectedDay.status === 'PRESENT' ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-400' :
                selectedDay.status === 'LATE' ? 'bg-amber-950/60 border-amber-500/60 text-amber-400' :
                selectedDay.status === 'ABSENT' ? 'bg-red-950/60 border-red-500/60 text-red-400' :
                'bg-white/10 border-white/60 text-white'
              }`}>
                {selectedDay.status === 'PRESENT' && <CheckCircle2 className="w-5 h-5" />}
                {selectedDay.status === 'LATE' && <Clock className="w-5 h-5" />}
                {selectedDay.status === 'ABSENT' && <XCircle className="w-5 h-5" />}
                {selectedDay.status === 'HOLIDAY' && <Sparkles className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-mono text-cyan-400">LOGGED FLIGHT DATE: {selectedDay.dateStr}</div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Status:</span>
                  <span className={`font-mono ${
                    selectedDay.status === 'PRESENT' ? 'text-emerald-400' :
                    selectedDay.status === 'LATE' ? 'text-amber-400' :
                    selectedDay.status === 'ABSENT' ? 'text-red-400' :
                    'text-white'
                  }`}>
                    {selectedDay.status}
                  </span>
                </div>
                {selectedDay.time && (
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Check-in Recorded: {new Date(selectedDay.time).toLocaleTimeString()}
                  </div>
                )}
                {selectedDay.notes && (
                  <div className="text-xs text-slate-300 mt-1 italic">
                    Note: &quot;{selectedDay.notes}&quot;
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs text-slate-500 hover:text-slate-300 p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
