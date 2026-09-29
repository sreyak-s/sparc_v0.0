'use client';

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  X, 
  Users,
  FileText
} from 'lucide-react';
import { MONTH_NAMES } from '@/lib/time-utils';

interface MonthlyExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableMonths?: { key: string; label: string }[];
  currentMonth?: string;
  totalMembersCount?: number;
}

export default function MonthlyExportModal({
  isOpen,
  onClose,
  availableMonths = [],
  currentMonth,
}: MonthlyExportModalProps) {
  const now = new Date();
  const defaultMonth = currentMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);

  if (!isOpen) return null;

  const [yearStr, monthStr] = selectedMonth.split('-');
  const monthIdx = parseInt(monthStr, 10) - 1;
  const readableMonth = `${MONTH_NAMES[monthIdx] || 'Current Month'} ${yearStr}`;

  // Default months list if not provided
  const months = availableMonths.length > 0 ? availableMonths : [
    { key: defaultMonth, label: readableMonth }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative max-w-lg w-full p-6 sm:p-7 rounded-3xl bg-space-900 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-mono font-bold text-white tracking-wider">
                EXPORT ATTENDANCE CSV
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Monthly squadron roll with individual percentages
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-space-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Configuration Options */}
        <div className="space-y-4">
          {/* Month Selector */}
          <div>
            <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Target Evaluation Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-400"
            >
              {months.map((m) => (
                <option key={m.key} value={m.key} className="bg-space-950 text-white">
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Report Info Banner */}
          <div className="p-4 rounded-2xl bg-space-950/80 border border-cyan-500/20 space-y-2 text-xs font-mono">
            <div className="text-white font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Report Contents for {readableMonth}</span>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1 pl-4 list-disc">
              <li>Includes all enrolled cadets across all departments & batches</li>
              <li>Calculates individual monthly attendance percentages (%)</li>
              <li>Displays breakdown of Present, Late, Absent, and Holiday marks</li>
              <li>Flags low-attendance cadets below the 75% threshold</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          {/* Primary: Monthly Summary with Percentages */}
          <a
            href={`/api/attendance/export-csv?month=${selectedMonth}&type=summary`}
            download
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 text-space-950 font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:from-cyan-300 hover:to-sky-300 transition-all text-center"
          >
            <Download className="w-4 h-4 text-space-950" />
            Download Monthly Summary CSV (With Percentages)
          </a>

          {/* Secondary: Detailed Raw Logs */}
          <a
            href={`/api/attendance/export-csv?month=${selectedMonth}&type=detailed`}
            download
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-space-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs flex items-center justify-center gap-2 transition-all text-center"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            Download Detailed Daily Session Logs (CSV)
          </a>
        </div>
      </div>
    </div>
  );
}
