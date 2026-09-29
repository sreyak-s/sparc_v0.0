'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { 
  CalendarCheck, 
  Users, 
  KeyRound, 
  LogIn, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Activity,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  const { user, isLeadership } = useAuth();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative max-w-2xl w-full">
        {/* Subtle Ambient Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-sky-500/20 to-blue-600/20 rounded-3xl blur-2xl opacity-50 pointer-events-none"></div>

        {/* Main Portal Card */}
        <div className="relative rounded-3xl bg-space-900/90 border border-cyan-500/30 p-8 sm:p-12 shadow-[0_12px_45px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-center space-y-8">
          
          {/* Logo & Header */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative w-24 h-24 rounded-full p-1 border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(0,240,255,0.4)] bg-black flex items-center justify-center">
                <Image
                  src="/logo.jpg"
                  alt="SPARC Aerospace Club"
                  width={96}
                  height={96}
                  className="rounded-full object-cover"
                  priority
                />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                OFFICIAL CLUB PORTAL
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-wider">
                SPARC <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">AEROSPACE</span>
              </h1>
              <p className="text-sm text-slate-300 mt-2 font-sans">
                Attendance Tracking & Member Roster Management System
              </p>
            </div>
          </div>

          {/* User Status / Action Buttons */}
          {user ? (
            <div className="p-6 rounded-2xl bg-space-950/80 border border-cyan-500/30 space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-cyan-400 font-semibold uppercase">LOGGED IN AS</div>
                  <div className="text-lg font-bold text-white font-mono">{user.name} ({user.sparc_id})</div>
                  <div className="text-xs text-slate-400">{user.role} • {user.department}</div>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#10B981]"></div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                {isLeadership ? (
                  <>
                    <Link
                      href="/admin/attendance"
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-space-950 font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
                    >
                      <CalendarCheck className="w-4 h-4 text-space-950" />
                      Take Roll Call
                      <ArrowRight className="w-4 h-4 text-space-950" />
                    </Link>
                    <Link
                      href="/admin/members"
                      className="flex-1 py-3 px-4 rounded-xl bg-space-900 hover:bg-space-850 border border-slate-700 text-white font-mono font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Users className="w-4 h-4 text-cyan-400" />
                      Member Roster
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/dashboard"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-space-950 font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
                  >
                    <Activity className="w-4 h-4 text-space-950" />
                    View My Attendance & Digital Pass
                    <ArrowRight className="w-4 h-4 text-space-950" />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono text-sm font-bold text-space-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:from-cyan-300 hover:to-sky-200 transition-all shadow-[0_0_25px_rgba(0,240,255,0.5)] flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-space-950" />
                Member Login
                <ArrowRight className="w-4 h-4 text-space-950" />
              </Link>

              <Link
                href="/create-password"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-mono text-sm font-semibold text-slate-200 bg-space-950 hover:bg-space-900 border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                Activate SPARC ID
              </Link>
            </div>
          )}

          {/* Key Meeting Parameters Summary */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="p-3.5 rounded-xl bg-space-950/60 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" /> Meeting Time
              </div>
              <div className="text-xs font-mono font-bold text-cyan-300 mt-1">17:00 – 17:30 HRS</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Daily roll call window</div>
            </div>

            <div className="p-3.5 rounded-xl bg-space-950/60 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Attendance Rule
              </div>
              <div className="text-xs font-mono font-bold text-emerald-400 mt-1">75% Minimum</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Required for flight clearance</div>
            </div>

            <div className="p-3.5 rounded-xl bg-space-950/60 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" /> Roll Call Auth
              </div>
              <div className="text-xs font-mono font-bold text-amber-300 mt-1">Leadership Only</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Founder / Captains mark</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

