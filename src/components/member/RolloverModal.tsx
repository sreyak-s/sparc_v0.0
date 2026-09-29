'use client';

import React, { useState } from 'react';
import { Member } from '@/types';
import { RefreshCw, Orbit, Sparkles, X, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onRolloverComplete: () => void;
  currentYear: string;
}

export default function RolloverModal({
  isOpen,
  onClose,
  members,
  onRolloverComplete,
  currentYear
}: Props) {
  const eligibleMembers = members.filter(m => m.role !== 'FOUNDER' && m.sparc_id !== 'SPARC-FDR');

  const [newYear, setNewYear] = useState('2027-28');
  const [captainId, setCaptainId] = useState(eligibleMembers[0]?.id || '');
  const [viceCaptainId, setViceCaptainId] = useState(eligibleMembers[1]?.id || '');
  const [secretaryId, setSecretaryId] = useState(eligibleMembers[2]?.id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYear) {
      setError('Please provide a new Academic Year (e.g. 2027-28)');
      return;
    }

    if (captainId === viceCaptainId || captainId === secretaryId || viceCaptainId === secretaryId) {
      setError('Captain, Vice Captain, and Secretary must each be assigned to distinct cadets.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/members/rollover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newYear,
          captainMemberId: captainId,
          viceCaptainMemberId: viceCaptainId,
          secretaryMemberId: secretaryId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Rollover failed');
      } else {
        alert(data.message);
        onRolloverComplete();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-space-900 border border-cyan-500/40 shadow-[0_0_50px_rgba(0,240,255,0.3)] space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
            <Orbit className="w-6 h-6 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div>
            <h3 className="text-xl font-mono font-bold text-white tracking-wide">
              ACADEMIC YEAR ROLLOVER
            </h3>
            <p className="text-xs text-slate-400">
              Reassign leadership & roll forward while preserving historical flight logs.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            This operation will assign SPARC-001 (Captain), SPARC-002 (Vice Captain), and SPARC-003 (Secretary) to the chosen cadets for the new year.
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/60 text-red-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
              New Academic Year (e.g. 2027-28)
            </label>
            <input
              type="text"
              required
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
              Select New Captain (Assigns SPARC-001)
            </label>
            <select
              value={captainId}
              onChange={(e) => setCaptainId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
            >
              {eligibleMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.sparc_id} - {m.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
              Select New Vice Captain (Assigns SPARC-002)
            </label>
            <select
              value={viceCaptainId}
              onChange={(e) => setViceCaptainId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
            >
              {eligibleMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.sparc_id} - {m.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-cyan-400 uppercase mb-1.5">
              Select New Secretary (Assigns SPARC-003)
            </label>
            <select
              value={secretaryId}
              onChange={(e) => setSecretaryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
            >
              {eligibleMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.sparc_id} - {m.department})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-mono"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-space-950 font-mono font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:from-amber-300 hover:to-yellow-300 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Processing...' : 'Execute Rollover'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
