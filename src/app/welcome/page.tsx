'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { 
  Rocket, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

function WelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const nameParam = searchParams.get('name') || user?.name || 'Cadet';
  const roleParam = searchParams.get('role') || user?.role || 'MEMBER';
  const sparcIdParam = searchParams.get('sparc_id') || user?.sparc_id || 'SPARC-CADET';

  const [countdown, setCountdown] = useState(4);
  const [telemetryStage, setTelemetryStage] = useState(0);

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#00F0FF', '#38BDF8', '#F59E0B', '#10B981']
    });

    const stepTimer1 = setTimeout(() => setTelemetryStage(1), 600);
    const stepTimer2 = setTimeout(() => setTelemetryStage(2), 1200);
    const stepTimer3 = setTimeout(() => setTelemetryStage(3), 1800);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          const isLeadershipRole = roleParam === 'FOUNDER' || roleParam === 'CAPTAIN' || roleParam === 'VICE_CAPTAIN' || roleParam === 'SECRETARY';
          router.push(isLeadershipRole ? '/admin' : '/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
    };
  }, [router, roleParam]);

  const handleImmediateLaunch = () => {
    const isLeadershipRole = roleParam === 'FOUNDER' || roleParam === 'CAPTAIN' || roleParam === 'VICE_CAPTAIN' || roleParam === 'SECRETARY';
    router.push(isLeadershipRole ? '/admin' : '/dashboard');
  };

  return (
    <div className="relative z-10 max-w-xl w-full p-8 sm:p-10 rounded-3xl bg-space-900/90 border border-cyan-500/40 shadow-[0_0_60px_rgba(0,240,255,0.3)] backdrop-blur-2xl space-y-6 animate-fadeIn">
      {/* Logo */}
      <div className="flex justify-center">
        <div className="relative w-20 h-20 rounded-full p-1 border-2 border-cyan-400 bg-black flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.5)]">
          <Image
            src="/logo.jpg"
            alt="SPARC Emblem"
            width={76}
            height={76}
            className="rounded-full object-cover animate-pulse"
          />
        </div>
      </div>

      {/* Dynamic Welcome Heading */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 font-mono text-xs">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          CLEARANCE CODE: {sparcIdParam}
        </div>

        <h1 className="text-3xl sm:text-4xl font-mono font-extrabold text-white tracking-wide">
          🚀 Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300 text-glow-cyan">{nameParam}</span>!
        </h1>

        <p className="text-lg sm:text-xl font-light text-cyan-200">
          Welcome aboard SPARC Aerospace Club.
        </p>
      </div>

      {/* Telemetry Initialization Checklist */}
      <div className="p-4 rounded-2xl bg-space-950/80 border border-slate-800 text-left space-y-2.5 font-mono text-xs">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1.5">
          MISSION CONTROL INITIALIZATION
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${telemetryStage >= 1 ? 'bg-emerald-400' : 'bg-slate-700'}`}></span>
            Flight Security Credentials
          </span>
          <span className={telemetryStage >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
            {telemetryStage >= 1 ? 'AUTHENTICATED' : 'CHECKING...'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${telemetryStage >= 2 ? 'bg-cyan-400' : 'bg-slate-700'}`}></span>
            Flight Roster & Role Clearance
          </span>
          <span className={telemetryStage >= 2 ? 'text-cyan-400 font-bold' : 'text-slate-600'}>
            {telemetryStage >= 2 ? roleParam.replace('_', ' ') : 'VERIFYING...'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${telemetryStage >= 3 ? 'bg-emerald-400' : 'bg-slate-700'}`}></span>
            Telemetry Sync & Attendance Engine
          </span>
          <span className={telemetryStage >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
            {telemetryStage >= 3 ? 'SYNCHRONIZED' : 'WAITING...'}
          </span>
        </div>
      </div>

      {/* Launch Countdown & CTA */}
      <div className="pt-2 space-y-3">
        <button
          onClick={handleImmediateLaunch}
          className="w-full py-3.5 rounded-xl font-mono text-xs font-bold text-space-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:from-cyan-300 hover:to-sky-200 transition-all shadow-[0_0_25px_rgba(0,240,255,0.5)] flex items-center justify-center gap-2"
        >
          <Rocket className="w-4 h-4 text-space-950" />
          Enter Flight Deck Now (T-{countdown}s)
          <ArrowRight className="w-4 h-4 text-space-950" />
        </button>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <div className="min-h-[88vh] flex flex-col items-center justify-center px-4 py-12 text-center relative overflow-hidden">
      {/* Background Orbit Visual */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-[500px] h-[500px] rounded-full border border-cyan-500/20 animate-orbit-slow"></div>
        <div className="w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[90px]"></div>
      </div>

      <Suspense fallback={
        <div className="p-8 font-mono text-cyan-400 text-sm animate-pulse">
          Initializing Mission Welcome...
        </div>
      }>
        <WelcomeContent />
      </Suspense>
    </div>
  );
}
