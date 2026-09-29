'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';

function CreatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activateAccount } = useAuth();

  const [sparcId, setSparcId] = useState(searchParams.get('sparc_id') || '');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activatedSuccess, setActivatedSuccess] = useState(false);

  useEffect(() => {
    const idFromParam = searchParams.get('sparc_id');
    if (idFromParam) {
      setSparcId(idFromParam.toUpperCase());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sparcId.trim()) {
      setError('Please enter your assigned SPARC ID.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your full name as registered in the flight roster.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    setLoading(true);

    const res = await activateAccount(sparcId.trim().toUpperCase(), name.trim(), password);

    if (!res.success) {
      setError(res.message || 'Activation failed. Please check your SPARC ID and Name.');
      setLoading(false);
    } else {
      setActivatedSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00F0FF', '#38BDF8', '#F59E0B', '#10B981']
      });

      // After 2 seconds, redirect to dynamic welcome page!
      setTimeout(() => {
        router.push(`/welcome?name=${encodeURIComponent(res.user?.name || name)}&role=${encodeURIComponent(res.user?.role || 'MEMBER')}&sparc_id=${encodeURIComponent(res.user?.sparc_id || sparcId)}`);
      }, 2000);
    }
  };

  return (
    <div className="relative rounded-3xl bg-space-900/90 border border-cyan-500/30 p-8 shadow-[0_12px_45px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-1 rounded-full border border-amber-400/50 bg-black shadow-[0_0_20px_rgba(245,158,11,0.4)]">
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
          <div className="text-xs font-mono text-amber-400 font-semibold tracking-widest uppercase">
            FIRST-TIME CADET ACTIVATION
          </div>
          <h2 className="text-2xl sm:text-3xl font-mono font-extrabold text-white mt-1">
            CREATE PASSWORD
          </h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Verify your identity using your assigned SPARC ID to establish your security credentials.
        </p>
      </div>

      {/* Success State */}
      {activatedSuccess ? (
        <div className="p-6 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-center space-y-3 animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-emerald-900/60 border border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.5)]">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-lg font-mono font-bold text-white">
            FLIGHT CLEARANCE GRANTED!
          </h3>
          <p className="text-xs text-emerald-200">
            Your password has been securely saved. Initializing your orbital welcome briefing...
          </p>
        </div>
      ) : (
        <>
          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/60 text-red-300 text-xs font-mono flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">
                {error}
              </div>
            </div>
          )}

          {/* Activation Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
                Assigned SPARC ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SPARC-005"
                value={sparcId}
                onChange={(e) => setSparcId(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-cyan-300 placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-cyan-400 uppercase"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                Must match the ID assigned by the Founder
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
                Full Name Verification *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pooja Iyer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
                New Flight Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 pr-10 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
                Confirm Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-mono text-xs font-bold text-space-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-200 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.7)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4 text-space-950" />
              {loading ? 'Verifying & Activating...' : 'Activate SPARC Account'}
            </button>
          </form>

          {/* Already Activated Login Link */}
          <div className="pt-4 border-t border-slate-800/80 text-center space-y-1">
            <p className="text-xs text-slate-400">
              Already activated your password?
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300"
            >
              Proceed to Cadet Login &rarr;
            </Link>
          </div>

          {/* Testing Tip for unactivated user */}
          <div className="p-3 rounded-xl bg-space-950/80 border border-slate-800 text-[10px] font-mono text-slate-400">
            <span className="text-amber-400 font-bold">🧪 Try Activating Test Cadet:</span>
            <button
              type="button"
              onClick={() => {
                setSparcId('SPARC-005');
                setName('Pooja Iyer');
                setPassword('Pooja@2026');
                setConfirmPassword('Pooja@2026');
                setError(null);
              }}
              className="block mt-1 text-cyan-400 underline hover:text-cyan-300"
            >
              Click here to auto-fill unactivated cadet &quot;SPARC-005&quot; (Pooja Iyer)
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function CreatePasswordPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="relative max-w-md w-full">
        {/* Ambient Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-cyan-500 to-blue-600 rounded-3xl blur-xl opacity-30 animate-pulse-glow"></div>

        <Suspense fallback={
          <div className="p-8 font-mono text-amber-400 text-sm animate-pulse text-center">
            Initializing SPARC ID Verification Terminal...
          </div>
        }>
          <CreatePasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
