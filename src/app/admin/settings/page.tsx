'use client';

import React, { useEffect, useState } from 'react';
import { ClubSettings, AcademicYear } from '@/types';
import { 
  Sliders, 
  Clock, 
  Orbit, 
  Radio, 
  Save, 
  CheckCircle2, 
  ShieldAlert, 
  Bell, 
  Send 
} from 'lucide-react';

export default function AdminSettingsPage() {
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

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Announcement form state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'MISSION' | 'WORKSHOP' | 'GENERAL' | 'URGENT' | 'HOLIDAY'>('MISSION');
  const [annSending, setAnnSending] = useState(false);
  const [annSuccess, setAnnSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) setSettings(data.settings);
          if (data.academicYears) setAcademicYears(data.academicYears);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    setAnnSending(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: annTitle,
          content: annContent,
          category: annCategory
        })
      });

      if (res.ok) {
        setAnnSuccess(true);
        setAnnTitle('');
        setAnnContent('');
        setTimeout(() => setAnnSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnnSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Settings Header */}
      <div className="p-6 rounded-3xl bg-space-900/80 border border-cyan-500/20 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-mono font-bold text-white tracking-wider">
              MISSION PARAMETERS & TIMING RULES
            </h3>
            <p className="text-xs text-slate-400">
              Configure attendance schedule thresholds, current academic cycle, and emergency window bypass.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Meeting Schedule Timings Form (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-space-900/80 border border-cyan-500/20 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-cyan-500/10 pb-4">
            <h4 className="text-base font-mono font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              ATTENDANCE TIME WINDOWS
            </h4>
            {saveSuccess && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" /> Parameters Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* Timing Rules Explanation Box */}
            <div className="p-4 rounded-2xl bg-space-950/90 border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
              <div className="text-cyan-400 font-bold">CURRENT ENGINE RULES:</div>
              <div className="flex justify-between">
                <span>🟢 PRESENT Status Window:</span>
                <span className="text-emerald-400 font-bold">Check-in $\le$ {settings.late_start}</span>
              </div>
              <div className="flex justify-between">
                <span>🟡 LATE Status Window:</span>
                <span className="text-amber-400 font-bold">{settings.late_start} to {settings.attendance_end}</span>
              </div>
              <div className="flex justify-between">
                <span>🔴 ABSENT Status Window:</span>
                <span className="text-red-400 font-bold">After {settings.attendance_end}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
                  Roll Call Start
                </label>
                <input
                  type="text"
                  value={settings.attendance_start}
                  onChange={(e) => setSettings({ ...settings, attendance_start: e.target.value })}
                  placeholder="17:00:00"
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
                  Late Window Threshold
                </label>
                <input
                  type="text"
                  value={settings.late_start}
                  onChange={(e) => setSettings({ ...settings, late_start: e.target.value })}
                  placeholder="17:15:00"
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-amber-300 font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
                  Attendance Close Time
                </label>
                <input
                  type="text"
                  value={settings.attendance_end}
                  onChange={(e) => setSettings({ ...settings, attendance_end: e.target.value })}
                  placeholder="17:30:00"
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-red-300 font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
                  Current Academic Year
                </label>
                <input
                  type="text"
                  value={settings.current_year}
                  onChange={(e) => setSettings({ ...settings, current_year: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
                  Club Official Title
                </label>
                <input
                  type="text"
                  value={settings.club_name}
                  onChange={(e) => setSettings({ ...settings, club_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Emergency Window Override Toggle */}
            <div className="p-4 rounded-2xl bg-space-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Emergency Meeting Window Override
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Temporarily allows all check-ins to be marked as PRESENT regardless of current hour.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.emergency_window_active}
                onChange={(e) => setSettings({ ...settings, emergency_window_active: e.target.checked })}
                className="w-5 h-5 accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 text-space-950 font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:from-cyan-300 hover:to-sky-300 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-space-950" />
                {saving ? 'Updating Parameters...' : 'Save Parameters'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Broadcast Announcement Creator (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-space-900/80 border border-cyan-500/20 backdrop-blur-xl space-y-5">
          <div className="flex items-center justify-between border-b border-cyan-500/10 pb-4">
            <h4 className="text-base font-mono font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              BROADCAST NOTICE TO CADETS
            </h4>
            {annSuccess && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" /> Broadcasted!
              </span>
            )}
          </div>

          <form onSubmit={handleBroadcastAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
                Notice Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 🚀 Static Fire Test at Propulsion Bay"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
                Category
              </label>
              <select
                value={annCategory}
                onChange={(e) => setAnnCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="MISSION">🚀 MISSION</option>
                <option value="WORKSHOP">🛰️ WORKSHOP</option>
                <option value="URGENT">⚠️ URGENT</option>
                <option value="HOLIDAY">🗓️ CLUB HOLIDAY</option>
                <option value="GENERAL">📢 GENERAL</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
                Notice Content *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Details of upcoming rocket test, workshop telemetry guidelines..."
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={annSending}
              className="w-full py-2.5 rounded-xl bg-space-950 hover:bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              {annSending ? 'Transmitting Notice...' : 'Broadcast to Cadets'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
