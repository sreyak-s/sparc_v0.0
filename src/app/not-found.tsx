'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Rocket, Compass, ArrowLeft, Radio } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-16 text-center relative overflow-hidden">
      {/* Background Orbital Drift Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <div className="w-[500px] h-[500px] rounded-full border border-red-500/20 animate-orbit-slow"></div>
        <div className="w-[300px] h-[300px] rounded-full bg-red-500/10 blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-lg w-full p-8 sm:p-10 rounded-3xl bg-space-900/90 border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)] backdrop-blur-2xl space-y-6">
        {/* Floating Astronaut Animation Graphic */}
        <div className="relative w-28 h-28 mx-auto animate-float">
          <div className="w-full h-full rounded-full bg-space-950 border-2 border-red-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.35)]">
            <svg
              className="w-16 h-16 text-cyan-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Astronaut Helmet */}
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 17a6.5 6.5 0 0 1 13 0" />
              <path d="M9 7h6" />
              <path d="M8 21v-4" />
              <path d="M16 21v-4" />
              <circle cx="12" cy="7" r="1.5" className="fill-cyan-400" />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 p-1 rounded-full bg-red-950 border border-red-500 text-red-400">
            <Radio className="w-3 h-3 animate-ping" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-red-300 font-mono text-xs">
            TELEMETRY SIGNAL LOST • ERROR 404
          </div>

          <h1 className="text-3xl sm:text-4xl font-mono font-extrabold text-white tracking-wider">
            ORBIT NOT FOUND
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Houston, we&apos;ve drifted outside designated airspace. The orbital vector you requested does not exist on this flight path.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-mono text-xs font-bold text-space-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2"
          >
            <Rocket className="w-4 h-4 text-space-950" />
            Return to Mission Control
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-3 rounded-xl font-mono text-xs font-semibold text-slate-300 bg-space-950 hover:bg-slate-800 border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            Cadet Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
