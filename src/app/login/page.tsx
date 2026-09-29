'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Rocket, 
  KeyRound, 
  Lock, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [sparcId, setSparcId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sparcId.trim() || !password) {
      setError('Please provide your SPARC ID and Password.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await login(sparcId.trim().toUpperCase(), password);

    if (!res.success) {
      setError(res.message || 'Authentication failed');
      setLoading(false);
    } else {
      // Direct to dynamic Welcome Interstitial!
      router.push(`/welcome?name=${encodeURIComponent(res.user?.name || '')}&role=${encodeURIComponent(res.user?.role || '')}&sparc_id=${encodeURIComponent(res.user?.sparc_id || '')}`);
    }
  };

  // Quick fill helper for evaluation & testing
  const fillDemo = (id: string) => {
    setSparcId(id);
    setPassword('Sparc@2026');
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="relative max-w-md w-full">
        {/* Glowing aura */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 rounded-3xl blur-xl opacity-30 animate-pulse-glow"></div>

        {/* Card Container */}
        <div className="relative rounded-3xl bg-space-900/90 border border-cyan-500/30 p-8 shadow-[0_12px_45px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-1 rounded-full border border-cyan-400/50 bg-black shadow-[0_0_20px_rgba(0,240,255,0.4)]">
              <Image
                src="/logo.jpg"
                alt="SPARC Emblem"
                width={56}
                height={56}
                className="rounded-full object-cover"
                priority
              />
            </div>

            <div>
              <div className="text-xs font-mono text-cyan-400 font-semibold tracking-widest uppercase">
                FLIGHT DECK AUTHENTICATION
              </div>
              <h2 className="text-2xl sm:text-3xl font-mono font-extrabold text-white mt-1">
                CADET LOGIN
              </h2>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/60 text-red-300 text-xs font-mono flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">
                {error}
                {error.includes('Create Password') && (
                  <div className="mt-1.5">
                    <Link
                      href={`/create-password?sparc_id=${encodeURIComponent(sparcId)}`}
                      className="text-cyan-300 underline font-bold hover:text-cyan-200"
                    >
                      Click here to activate your SPARC ID &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
                SPARC ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. SPARC-001 or SPARC-FDR"
                  value={sparcId}
                  onChange={(e) => setSparcId(e.target.value.toUpperCase())}
                  className="w-full pl-4 pr-4 py-3 rounded-xl bg-space-950 border border-slate-700 text-cyan-300 placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-cyan-400 uppercase"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-cyan-400 uppercase">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-space-950 border border-slate-700 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-mono text-sm font-bold text-space-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:from-cyan-300 hover:to-sky-200 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Rocket className={`w-4 h-4 text-space-950 ${loading ? 'animate-bounce' : ''}`} />
              {loading ? 'Authenticating Clearance...' : 'Authenticate & Launch'}
            </button>
          </form>

          {/* First Time Activation Link */}
          <div className="pt-4 border-t border-slate-800/80 text-center space-y-2">
            <p className="text-xs text-slate-400">
              Assigned a SPARC ID but haven&apos;t set a password?
            </p>
            <Link
              href="/create-password"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              Activate SPARC ID / Create Password
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Demo Test Accounts Bar */}
          <div className="p-3.5 rounded-2xl bg-space-950/90 border border-slate-800/90 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
              <span className="flex items-center gap-1 text-cyan-400">
                <Sparkles className="w-3 h-3" /> Quick Demo Cadets
              </span>
              <span className="text-slate-500">Pass: Sparc@2026</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => fillDemo('SPARC-FDR')}
                className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-yellow-950/40 text-yellow-300 border border-yellow-500/30 text-left truncate transition-colors"
              >
                Founder (SPARC-FDR)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('SPARC-001')}
                className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 text-left truncate transition-colors"
              >
                Captain (SPARC-001)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('SPARC-003')}
                className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-purple-950/40 text-purple-300 border border-purple-500/30 text-left truncate transition-colors"
              >
                Secretary (SPARC-003)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('SPARC-004')}
                className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-left truncate transition-colors"
              >
                Cadet (SPARC-004)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
